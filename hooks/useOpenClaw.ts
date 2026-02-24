/**
 * useOpenClaw — OpenClaw Agent SDK React Hook
 *
 * 将 OpenClawClient (WebSocket) 的生命周期绑定到 React 组件树。
 * 管理 OmniOrb 的状态机：idle → listening → responding → idle
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import {
  OpenClawClient,
  getOpenClawClient,
  type AgentStreamEvent,
  type ConnectionState,
} from '../services/openclaw-client';
import { setCurrentScreen, initBuiltinCollectors } from '../services/context-collector';
import { BASE_URL } from '../services/api';

// ============================================================================
// 类型
// ============================================================================

export type OrbPhase = 'idle' | 'listening' | 'responding';

export interface UseOpenClawReturn {
  /** OmniOrb 当前阶段 */
  phase: OrbPhase;
  /** Agent 流式回复（累积文本） */
  responseText: string;
  /** 当前回应的 Agent 名称 */
  agentName: string;
  /** 面板是否展开 */
  expanded: boolean;
  /** 连接状态 */
  connectionState: ConnectionState;

  // ── 操作 ──

  /** 长按开始录音 */
  startListening: () => void;
  /** 松手停止录音，传入转写文本 */
  stopListening: (transcript: string) => void;
  /** 点击展开/收起面板 */
  togglePanel: () => void;
  /** 发送文本消息 */
  sendMessage: (text: string) => Promise<void>;
  /** 中断当前 Agent 回复 */
  abort: () => void;
  /** 设置当前页面（供上下文采集器用） */
  setScreen: (screen: string) => void;
}

// ============================================================================
// WebSocket 地址推导
// ============================================================================

/**
 * 从 REST API 的 BASE_URL 推导 WebSocket 服务地址
 *
 * BASE_URL: http://192.168.3.129:3000 → ws://192.168.3.129:3002
 * BASE_URL: https://api.superdriver.app → wss://api.superdriver.app/ws
 */
function deriveWsUrl(): string {
  const WS_PORT = 3002;  // 开发环境独立 WS 端口
  try {
    const url = new URL(BASE_URL);
    const isSecure = url.protocol === 'https:';

    if (__DEV__) {
      // 开发：同一宿主机不同端口
      return `ws://${url.hostname}:${WS_PORT}`;
    }

    // 生产：通过 Nginx/CDN 反向代理 /ws 路径
    return `${isSecure ? 'wss' : 'ws'}://${url.host}/ws`;
  } catch {
    return `ws://localhost:${WS_PORT}`;
  }
}

// ============================================================================
// Hook 实现
// ============================================================================

export function useOpenClaw(): UseOpenClawReturn {
  const [phase, setPhase] = useState<OrbPhase>('idle');
  const [responseText, setResponseText] = useState('');
  const [agentName, setAgentName] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');

  const clientRef = useRef<OpenClawClient | null>(null);
  const activeRequestId = useRef<string | null>(null);

  // 初始化
  useEffect(() => {
    // 初始化内置上下文采集器
    initBuiltinCollectors();

    // 获取全局客户端
    const wsUrl = deriveWsUrl();
    const client = getOpenClawClient(wsUrl);
    clientRef.current = client;

    // 监听消息事件
    const unsubMsg = client.on('message', handleStreamEvent);
    const unsubConn = client.on('connection_change', setConnectionState);

    // 自动连接
    client.connect().catch((e) => {
      console.warn('[useOpenClaw] 自动连接失败:', e);
    });

    return () => {
      unsubMsg();
      unsubConn();
      // 不 destroy —— 全局单例由 App 生命周期管理
    };
  }, []);

  /** 处理流式事件 */
  const handleStreamEvent = useCallback((event: AgentStreamEvent) => {
    switch (event.type) {
      case 'delta': {
        const text = (event.data as { text?: string })?.text;
        if (text) setResponseText(prev => prev + text);
        setPhase('responding');
        break;
      }

      case 'thinking':
        setPhase('responding');
        setAgentName((event.data as { agent?: string })?.agent || '思考中');
        break;

      case 'agent_switch': {
        const data = event.data as { to?: string; toName?: string };
        setAgentName(data.toName || data.to || '');
        break;
      }

      case 'done':
        setPhase('idle');
        break;

      case 'error': {
        const msg = (event.data as { message?: string })?.message || 'Agent 处理出错';
        setResponseText(prev => prev + `\n\n⚠️ ${msg}`);
        setPhase('idle');
        break;
      }
    }
  }, []);

  // ── 操作函数 ──

  const startListening = useCallback(() => {
    setPhase('listening');
    setResponseText('');
    setAgentName('');
  }, []);

  const stopListening = useCallback((transcript: string) => {
    if (!transcript.trim()) {
      setPhase('idle');
      return;
    }
    sendMessageInternal(transcript);
  }, []);

  const sendMessageInternal = useCallback(async (text: string) => {
    setPhase('responding');
    setResponseText('');
    setExpanded(true);

    try {
      const reqId = await clientRef.current?.send(text);
      activeRequestId.current = reqId || null;
    } catch (e) {
      console.error('[useOpenClaw] 发送失败:', e);
      setResponseText(`发送失败: ${e instanceof Error ? e.message : String(e)}`);
      setPhase('idle');
    }
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    await sendMessageInternal(text);
  }, [sendMessageInternal]);

  const togglePanel = useCallback(() => {
    setExpanded(prev => !prev);
  }, []);

  const abort = useCallback(() => {
    if (activeRequestId.current) {
      clientRef.current?.abort(activeRequestId.current);
      activeRequestId.current = null;
    }
    setPhase('idle');
  }, []);

  const setScreen = useCallback((screen: string) => {
    setCurrentScreen(screen);
  }, []);

  return {
    phase,
    responseText,
    agentName,
    expanded,
    connectionState,
    startListening,
    stopListening,
    togglePanel,
    sendMessage,
    abort,
    setScreen,
  };
}
