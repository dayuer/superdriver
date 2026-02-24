/**
 * AgentProvider — SDK React Context Provider
 *
 * 业务层的唯一接入点：
 *   <AgentProvider serverUrl="..." authProvider={...}>
 *     <App />
 *     <OmniOrb />
 *   </AgentProvider>
 *
 * 封装了 OpenClawClient 初始化、上下文采集器注册和生命周期管理。
 */

import React, { createContext, useContext, useEffect, useRef, useMemo } from 'react';
import {
  OpenClawClient,
  type ConnectionState,
} from '../../../services/openclaw-client';
import {
  initBuiltinCollectors,
  registerCollector,
  type CollectorFn,
} from '../../../services/context-collector';
import type { OmniOrbTheme } from '../../../components/omni-orb';

// ============================================================================
// 类型
// ============================================================================

export interface AgentProviderConfig {
  /** WebSocket 服务地址 (ws:// 或 wss://) */
  serverUrl: string;
  /** JWT Token 获取函数 — SDK 不关心 Token 来源 */
  authProvider: () => Promise<string | null>;
  /** 可选的自定义上下文采集器 */
  contextCollectors?: Array<{ name: string; fn: CollectorFn; timeoutMs?: number }>;
  /** OmniOrb 主题定制 */
  theme?: Partial<OmniOrbTheme>;
  /** 全局错误回调 */
  onError?: (error: Error) => void;
  /** 是否在 Provider 挂载时自动连接 (默认 true) */
  autoConnect?: boolean;
}

export interface AgentContextValue {
  client: OpenClawClient;
  theme?: Partial<OmniOrbTheme>;
}

// ============================================================================
// Context
// ============================================================================

const AgentContext = createContext<AgentContextValue | null>(null);

/** 在业务组件中获取 SDK 上下文 */
export function useAgentContext(): AgentContextValue {
  const ctx = useContext(AgentContext);
  if (!ctx) {
    throw new Error('useAgentContext 必须在 <AgentProvider> 内部使用');
  }
  return ctx;
}

// ============================================================================
// Provider
// ============================================================================

export function AgentProvider({
  serverUrl,
  authProvider,
  contextCollectors,
  theme,
  onError,
  autoConnect = true,
  children,
}: AgentProviderConfig & { children: React.ReactNode }) {
  const clientRef = useRef<OpenClawClient | null>(null);

  // 只创建一次客户端 — 整个 App 生命周期复用
  const client = useMemo(() => {
    if (!clientRef.current) {
      clientRef.current = new OpenClawClient(serverUrl);
    }
    return clientRef.current;
  }, [serverUrl]);

  useEffect(() => {
    // 初始化内置采集器
    initBuiltinCollectors();

    // 注册自定义采集器
    if (contextCollectors) {
      for (const c of contextCollectors) {
        registerCollector(c.name, c.fn, c.timeoutMs);
      }
    }

    // 错误监听
    const unsubError = onError
      ? client.on('error', onError)
      : () => {};

    // 自动连接
    if (autoConnect) {
      client.connect().catch((e: unknown) => {
        console.warn('[AgentProvider] 自动连接失败:', e);
        onError?.(e instanceof Error ? e : new Error(String(e)));
      });
    }

    return () => {
      unsubError();
      // 不 destroy：避免 HMR 重复断连
    };
  }, [client, autoConnect]);

  const value = useMemo<AgentContextValue>(() => ({
    client,
    theme,
  }), [client, theme]);

  return (
    <AgentContext.Provider value={value}>
      {children}
    </AgentContext.Provider>
  );
}
