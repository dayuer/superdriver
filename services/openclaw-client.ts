/**
 * openclaw-client.ts — OpenClaw Agent 通信客户端
 *
 * 架构：WebSocket 全双工通信 (Thin Client)
 *
 * 职责：
 *   1. WebSocket 长连接 + 指数退避自动重连
 *   2. 心跳保活（30s ping/pong）
 *   3. 消息队列：断连期间缓存，重连后自动发送
 *   4. EventEmitter 模式对外暴露事件
 *   5. 请求中断支持
 */

import { getAccessToken } from '../lib/security';
import { collectContext, type EnvironmentContext } from './context-collector';

// ============================================================================
// 类型定义
// ============================================================================

/** 下行事件类型 — 对齐 ws-agent-server.ts */
export type StreamEventType =
  | 'delta'          // 文本增量
  | 'tool_call'      // Agent 调用工具
  | 'tool_result'    // 工具执行结果
  | 'thinking'       // Agent 思考中
  | 'done'           // 回复完成
  | 'error'          // 错误
  | 'agent_switch';  // Agent 切换通知

/** 下行事件 */
export interface AgentStreamEvent {
  type: StreamEventType;
  data: unknown;
  requestId?: string;
}

/** 发送选项 */
export interface SendOptions {
  targetAgent?: string;
  context?: Partial<EnvironmentContext>;
  sessionId?: string;
}

/** 连接状态 */
export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';

/** 事件处理器映射 */
type EventHandlerMap = {
  message: (event: AgentStreamEvent) => void;
  connection_change: (state: ConnectionState) => void;
  error: (error: Error) => void;
  hello: (data: { connId: string; userId: string }) => void;
};

type EventName = keyof EventHandlerMap;

// ============================================================================
// 常量
// ============================================================================

const LOG_PREFIX = '[OpenClawClient]';

// 重连策略：指数退避
const RECONNECT_BASE_MS = 1_000;
const RECONNECT_MAX_MS = 16_000;
const MAX_RECONNECT_ATTEMPTS = 20;

// 心跳
const HEARTBEAT_INTERVAL = 25_000;  // 比服务端 30s 稍短，确保不超时
const HEARTBEAT_TIMEOUT = 10_000;

// 离线消息队列
const MAX_QUEUE_SIZE = 20;

// ============================================================================
// 核心类
// ============================================================================

export class OpenClawClient {
  private _ws: WebSocket | null = null;
  private _state: ConnectionState = 'disconnected';
  private _listeners = new Map<EventName, Set<Function>>();
  private _sessionId: string;

  // 重连
  private _reconnectAttempts = 0;
  private _reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private _intentionalClose = false;
  private _serverUrl: string;

  // 心跳
  private _heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private _heartbeatPending = false;

  // 离线消息队列
  private _queue: string[] = [];

  constructor(serverUrl: string, sessionId?: string) {
    this._serverUrl = serverUrl;
    this._sessionId = sessionId || `sd:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`;
  }

  // ── 公共 API ──

  get state(): ConnectionState { return this._state; }
  get sessionId(): string { return this._sessionId; }
  get connected(): boolean { return this._state === 'connected'; }

  /** 建立 WebSocket 连接 */
  async connect(): Promise<void> {
    if (this._state === 'connecting' || this._state === 'connected') return;

    this._intentionalClose = false;
    this._reconnectAttempts = 0;
    await this._doConnect();
  }

  /** 断开连接（不重连） */
  disconnect(): void {
    this._intentionalClose = true;
    this._stopHeartbeat();
    this._clearReconnectTimer();
    if (this._ws) {
      this._ws.close(1000, '客户端主动断开');
      this._ws = null;
    }
    this._setState('disconnected');
  }

  /**
   * 发送文本消息给 Agent
   *
   * 若当前离线，消息入队，重连后自动发送。
   */
  async send(content: string, options?: SendOptions): Promise<string> {
    if (!content.trim()) throw new Error('消息内容不能为空');

    const requestId = `req:${Date.now()}:${Math.random().toString(36).slice(2, 6)}`;

    // 采集环境上下文
    const autoContext = await collectContext();
    const mergedContext = { ...autoContext, ...options?.context };

    const msg = JSON.stringify({
      type: 'chat',
      requestId,
      content,
      targetAgent: options?.targetAgent,
      sessionId: options?.sessionId || this._sessionId,
      context: mergedContext,
    });

    if (this._ws?.readyState === WebSocket.OPEN) {
      this._ws.send(msg);
    } else {
      // 离线入队
      if (this._queue.length >= MAX_QUEUE_SIZE) {
        throw new Error('离线消息队列已满');
      }
      this._queue.push(msg);
      console.log(LOG_PREFIX, `消息已入队 (队列长度: ${this._queue.length})`);

      // 尝试自动重连
      if (this._state === 'disconnected' && !this._intentionalClose) {
        this.connect();
      }
    }

    return requestId;
  }

  /** 中断指定请求 */
  abort(requestId?: string): void {
    if (!requestId) return;
    this._safeSend({ type: 'abort', requestId });
  }

  /** 注册事件监听器 */
  on<K extends EventName>(event: K, handler: EventHandlerMap[K]): () => void {
    if (!this._listeners.has(event)) {
      this._listeners.set(event, new Set());
    }
    this._listeners.get(event)!.add(handler);
    return () => { this._listeners.get(event)?.delete(handler); };
  }

  /** 销毁客户端 */
  destroy(): void {
    this.disconnect();
    this._listeners.clear();
    this._queue.length = 0;
  }

  // ── 连接管理 ──

  private async _doConnect(): Promise<void> {
    this._setState('connecting');

    try {
      const token = await getAccessToken();
      if (!token) {
        this._setState('error');
        this._emit('error', new Error('未登录，无法连接'));
        return;
      }

      const url = `${this._serverUrl}?token=${encodeURIComponent(token)}`;
      const ws = new WebSocket(url);
      this._ws = ws;

      ws.onopen = () => {
        console.log(LOG_PREFIX, '✅ WebSocket 已连接');
        this._reconnectAttempts = 0;
        this._setState('connected');
        this._startHeartbeat();
        this._flushQueue();
      };

      ws.onmessage = (event) => {
        this._heartbeatPending = false;  // 收到任何消息都算心跳响应
        try {
          const msg = JSON.parse(event.data as string);
          this._handleServerMessage(msg);
        } catch {
          console.warn(LOG_PREFIX, '消息解析失败');
        }
      };

      ws.onclose = (event) => {
        console.log(LOG_PREFIX, `连接关闭: code=${event.code} reason=${event.reason}`);
        this._ws = null;
        this._stopHeartbeat();

        if (event.code === 4001) {
          // 认证失败，不重连
          this._setState('error');
          this._emit('error', new Error('认证失败: ' + event.reason));
        } else if (!this._intentionalClose) {
          this._setState('disconnected');
          this._scheduleReconnect();
        } else {
          this._setState('disconnected');
        }
      };

      ws.onerror = (event) => {
        console.error(LOG_PREFIX, 'WebSocket 错误');
        // onclose 会紧接着被调用，在那里处理重连
      };
    } catch (e) {
      console.error(LOG_PREFIX, '连接失败:', e);
      this._setState('error');
      this._scheduleReconnect();
    }
  }

  /** 处理服务端消息 */
  private _handleServerMessage(msg: Record<string, unknown>): void {
    const type = msg.type as string;

    switch (type) {
      case 'hello':
        this._emit('hello', msg as unknown as { connId: string; userId: string });
        break;

      case 'pong':
        // 心跳响应，已在 onmessage 中处理
        break;

      case 'ping':
        this._safeSend({ type: 'pong' });
        break;

      case 'delta':
      case 'thinking':
      case 'tool_call':
      case 'tool_result':
      case 'done':
      case 'error':
      case 'agent_switch':
        this._emit('message', {
          type: type as StreamEventType,
          data: msg.data,
          requestId: msg.requestId as string,
        });
        break;

      case 'aborted':
        console.log(LOG_PREFIX, `请求已中断: ${msg.requestId}`);
        break;

      default:
        if (__DEV__) console.log(LOG_PREFIX, '未知消息类型:', type);
    }
  }

  // ── 心跳 ──

  private _startHeartbeat(): void {
    this._stopHeartbeat();
    this._heartbeatTimer = setInterval(() => {
      if (this._heartbeatPending) {
        // 上次心跳没应答，判定连接死亡
        console.warn(LOG_PREFIX, '心跳超时，关闭连接');
        this._ws?.close(4000, '心跳超时');
        return;
      }
      this._heartbeatPending = true;
      this._safeSend({ type: 'ping' });
    }, HEARTBEAT_INTERVAL);
  }

  private _stopHeartbeat(): void {
    if (this._heartbeatTimer) {
      clearInterval(this._heartbeatTimer);
      this._heartbeatTimer = null;
    }
    this._heartbeatPending = false;
  }

  // ── 重连 ──

  private _scheduleReconnect(): void {
    if (this._intentionalClose) return;
    if (this._reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      console.error(LOG_PREFIX, `重连失败 ${MAX_RECONNECT_ATTEMPTS} 次，停止重连`);
      this._setState('error');
      this._emit('error', new Error('超过最大重连次数'));
      return;
    }

    // 指数退避 + 随机抖动
    const baseDelay = Math.min(
      RECONNECT_BASE_MS * Math.pow(2, this._reconnectAttempts),
      RECONNECT_MAX_MS,
    );
    const jitter = baseDelay * 0.3 * Math.random();
    const delay = baseDelay + jitter;

    this._reconnectAttempts++;
    console.log(LOG_PREFIX, `${delay.toFixed(0)}ms 后第 ${this._reconnectAttempts} 次重连...`);

    this._reconnectTimer = setTimeout(() => {
      this._doConnect();
    }, delay);
  }

  private _clearReconnectTimer(): void {
    if (this._reconnectTimer) {
      clearTimeout(this._reconnectTimer);
      this._reconnectTimer = null;
    }
  }

  // ── 离线队列 ──

  private _flushQueue(): void {
    if (this._queue.length === 0) return;
    console.log(LOG_PREFIX, `刷新离线队列: ${this._queue.length} 条消息`);

    while (this._queue.length > 0 && this._ws?.readyState === WebSocket.OPEN) {
      const msg = this._queue.shift()!;
      this._ws.send(msg);
    }
  }

  // ── 工具 ──

  private _safeSend(data: unknown): void {
    if (this._ws?.readyState === WebSocket.OPEN) {
      try {
        this._ws.send(JSON.stringify(data));
      } catch { /* 静默 */ }
    }
  }

  private _setState(state: ConnectionState): void {
    if (this._state === state) return;
    this._state = state;
    this._emit('connection_change', state);
  }

  private _emit<K extends EventName>(event: K, ...args: Parameters<EventHandlerMap[K]>): void {
    const handlers = this._listeners.get(event);
    if (!handlers) return;
    for (const handler of handlers) {
      try { (handler as Function)(...args); }
      catch (e) { console.error(LOG_PREFIX, `事件 "${event}" 处理器异常:`, e); }
    }
  }
}

// ============================================================================
// 单例
// ============================================================================

let _instance: OpenClawClient | null = null;

/** 获取全局客户端实例 */
export function getOpenClawClient(serverUrl?: string): OpenClawClient {
  if (!_instance) {
    if (!serverUrl) throw new Error('首次调用必须提供 serverUrl');
    _instance = new OpenClawClient(serverUrl);
  }
  return _instance;
}

/** 重置（登出/测试） */
export function resetOpenClawClient(): void {
  _instance?.destroy();
  _instance = null;
}
