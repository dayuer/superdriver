/**
 * useAppData - 应用数据管理 Hook
 * 
 * 从 App.tsx 中抽取的数据加载和处理逻辑，包括：
 * - 并行加载 profile、agents、chatList、IM sessions
 * - processChats 聊天列表合并算法
 * - 未读消息计数
 * 
 * [HIGH-001 重构] App.tsx 精简计划
 */
import { useState, useCallback } from 'react';
import { getAgents, getChatList, getProfile, getIMSessions, markIMSessionsAsRead } from '../services/api';
import { Agent, ChatListItem, UserProfile } from '../types';
import { AGENT_NUMERIC_IDS, AGENT_ID_BY_NUMERIC, CORE_ADVISORS } from '../config/constants';

// ============================================================================
// 聊天列表处理
// ============================================================================

// [M-02 修复] processChats 入参类型
interface ChatRecord {
  agentId: string;
  lastMessage?: string;
  timestamp?: string;
}

interface IMSessionRecord {
  agent_id: number;
  last_msg_content?: string;
  last_msg_time?: string;
}

/**
 * 合并 API 聊天记录与 IM 会话数据，生成统一的聊天列表
 */
export function processChats(
  chats: ChatRecord[],
  agents: Record<string, Agent>,
  imSessions: { sessions: IMSessionRecord[]; total: number },
): ChatListItem[] {
  const items: ChatListItem[] = [];
  const now = new Date();

  // 将 IM sessions 按 agent_id 映射
  const imSessionsByAgentId = new Map<number, any>();
  (imSessions.sessions || []).forEach((s: any) => {
    if (typeof s.agent_id === 'number') {
      imSessionsByAgentId.set(s.agent_id, s);
    }
  });

  // ── 1. 群聊 ──
  const groupSession = imSessionsByAgentId.get(0);
  const groupChat = chats.find((c: any) => c.agentId === 'super_driver_group');

  items.push({
    id: 'super_driver_group',
    type: 'group',
    name: '核心议事厅',
    avatar: '📡',
    lastMessage: groupSession?.last_msg_content || groupChat?.lastMessage || '数字化战友已集结，听候指示。',
    timestamp: groupSession?.last_msg_time
      ? new Date(groupSession.last_msg_time).toISOString()
      : (groupChat?.timestamp || now.toISOString()),
    unread: 0,
  });

  // ── 2. 有聊天记录的私聊 ──
  chats.forEach((c: any) => {
    if (c.agentId === 'super_driver_group') return;
    const agent = agents[c.agentId];
    if (agent) {
      const numericId = AGENT_NUMERIC_IDS[agent.id];
      const imSession = numericId ? imSessionsByAgentId.get(numericId) : null;

      items.push({
        id: agent.id,
        type: 'private',
        name: agent.name,
        avatar: typeof agent.avatar === 'string' ? agent.avatar : '🤖',
        lastMessage: imSession?.last_msg_content || c.lastMessage || '...',
        timestamp: imSession?.last_msg_time
          ? new Date(imSession.last_msg_time).toISOString()
          : c.timestamp,
        agent,
      });
    }
  });

  // ── 3. 有 IM 消息但不在 chats 中的新会话 ──
  const existingAgentIds = new Set(items.map(item => item.id));

  imSessionsByAgentId.forEach((session, agentId) => {
    if (agentId === 0) return; // 群聊已处理

    // [M-001] O(1) 反向查找替代 O(n) 遍历
    const agentStringId = AGENT_ID_BY_NUMERIC[agentId];
    if (!agentStringId || existingAgentIds.has(agentStringId)) return;

    const agent = agents[agentStringId];
    if (agent && session.last_msg_content) {
      items.push({
        id: agent.id,
        type: 'private',
        name: agent.name,
        avatar: typeof agent.avatar === 'string' ? agent.avatar : '🤖',
        lastMessage: session.last_msg_content,
        timestamp: session.last_msg_time
          ? new Date(session.last_msg_time).toISOString()
          : now.toISOString(),
        agent,
      });
      existingAgentIds.add(agentStringId);
    }
  });

  // ── 4. 核心顾问保底显示 ──

  CORE_ADVISORS.forEach(agentId => {
    if (existingAgentIds.has(agentId)) return;
    const agent = agents[agentId];
    if (agent) {
      const numericId = AGENT_NUMERIC_IDS[agentId];
      const imSession = numericId ? imSessionsByAgentId.get(numericId) : null;

      items.push({
        id: agent.id,
        type: 'private',
        name: agent.name,
        avatar: typeof agent.avatar === 'string' ? agent.avatar : '🤖',
        lastMessage: imSession?.last_msg_content || agent.description || `${agent.name}随时为您效劳`,
        timestamp: imSession?.last_msg_time
          ? new Date(imSession.last_msg_time).toISOString()
          : new Date(now.getTime() - 60000).toISOString(),
        agent,
      });
    }
  });

  // 按时间降序排序
  return items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

// ============================================================================
// Hook
// ============================================================================

interface UseAppDataReturn {
  agentsMap: Record<string, Agent>;
  chatListItems: ChatListItem[];
  profile: UserProfile | null;
  totalUnread: number;
  /** 加载/刷新所有应用数据 */
  loadAppData: () => Promise<void>;
  /** 标记所有消息为已读 */
  markAllRead: () => void;
}

const DEFAULT_AGENTS: Record<string, Agent> = {};

export function useAppData(): UseAppDataReturn {
  const [agentsMap, setAgentsMap] = useState<Record<string, Agent>>(DEFAULT_AGENTS);
  const [chatListItems, setChatListItems] = useState<ChatListItem[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [totalUnread, setTotalUnread] = useState(0);

  /**
   * 并行加载所有应用数据
   */
  const loadAppData = useCallback(async () => {
    try {
      const [p, agents, chats, imSessions] = await Promise.all([
        getProfile().catch(() => null),
        getAgents().catch(() => ({})),
        getChatList().catch(() => []),
        getIMSessions().catch(() => ({ sessions: [], total: 0, total_unread: 0 })),
      ]);

      if (p) setProfile(p);
      if (agents) setAgentsMap(agents);

      setTotalUnread(imSessions.total_unread || 0);

      const processed = processChats(chats, agents, imSessions);
      setChatListItems(processed);
    } catch (e) {
      console.error('[App] loadAppData failed:', e);
    }
  }, []);

  /**
   * 标记所有消息为已读
   */
  const markAllRead = useCallback(() => {
    if (totalUnread > 0) {
      markIMSessionsAsRead().catch(() => {}); // 静默处理
      setTotalUnread(0);
    }
  }, [totalUnread]);

  return {
    agentsMap,
    chatListItems,
    profile,
    totalUnread,
    loadAppData,
    markAllRead,
  };
}
