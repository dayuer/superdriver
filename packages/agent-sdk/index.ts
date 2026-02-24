/**
 * @survival/agent-sdk — 公共导出
 *
 * 这是 Agent SDK 的统一入口。
 * Step 1 阶段通过 re-export 方式引用现有文件，零破坏性。
 * Step 2 阶段物理移入后改为本地 import。
 */

// ── Core: 通信 + 上下文 ──
export {
  OpenClawClient,
  getOpenClawClient,
  resetOpenClawClient,
  type AgentStreamEvent,
  type StreamEventType,
  type ConnectionState,
  type SendOptions,
} from '../../services/openclaw-client';

export {
  collectContext,
  registerCollector,
  unregisterCollector,
  setCurrentScreen,
  initBuiltinCollectors,
  type EnvironmentContext,
  type CollectorFn,
} from '../../services/context-collector';

// ── Hooks ──
export {
  useOpenClaw,
  useOpenClaw as useAgent,    // B 端友好别名
  type UseOpenClawReturn,
  type OrbPhase,
} from '../../hooks/useOpenClaw';

// ── UI 组件 ──
export {
  OmniOrb,
  type OmniOrbProps,
  type OmniOrbTheme,
  type OrbState,
} from '../../components/omni-orb';

// ── Provider ──
export {
  AgentProvider,
  useAgentContext,
  type AgentProviderConfig,
  type AgentContextValue,
} from './providers/AgentProvider';
