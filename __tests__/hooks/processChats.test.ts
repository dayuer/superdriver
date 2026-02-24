/**
 * processChats 聊天列表合并算法测试
 * 
 * 覆盖核心合并逻辑：
 * 1. 群聊始终在列表中
 * 2. 有聊天记录的私聊正确合并 IM session
 * 3. 仅有 IM session 的新会话能被创建
 * 4. 核心顾问保底显示
 * 5. 按时间降序排序
 */

// Mock 原生依赖（processChats 通过 useAppData → api.ts 间接引用）
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));
jest.mock('expo-crypto', () => ({
  getRandomBytesAsync: jest.fn(),
  digestStringAsync: jest.fn(),
  CryptoDigestAlgorithm: { SHA256: 'SHA-256' },
}));
jest.mock('axios', () => {
  const m: any = { create: jest.fn(() => m), interceptors: { request: { use: jest.fn() }, response: { use: jest.fn() } }, get: jest.fn(), post: jest.fn() };
  return { __esModule: true, default: m, ...m };
});

import { processChats } from '../../hooks/useAppData';
import { Agent } from '../../types';

// ── Test Fixtures ──

const makeAgent = (id: string, name: string): Agent => ({
  id,
  name,
  title: `${name}顾问`,
  avatar: '🤖',
  description: `${name}为您服务`,
  style: { color: 'bg-blue-500' },
  keywords: [],
  isPaid: false,
  companyName: '',
  priority: 5,
  category: 'native',
});

const AGENTS: Record<string, Agent> = {
  general: makeAgent('general', '翔哥'),
  mechanic: makeAgent('mechanic', '老周'),
  legal: makeAgent('legal', '叶律'),
  health: makeAgent('health', '林姨'),
  algo: makeAgent('algo', '阿K'),
  metaphysics: makeAgent('metaphysics', '裴姐'),
};

const EMPTY_IM = { sessions: [], total: 0 };

// ── Tests ──

describe('processChats', () => {
  it('should always include group chat as first item', () => {
    const result = processChats([], AGENTS, EMPTY_IM);

    const group = result.find(item => item.id === 'super_driver_group');
    expect(group).toBeDefined();
    expect(group!.type).toBe('group');
    expect(group!.name).toBe('核心议事厅');
  });

  it('should include core advisors (mechanic, legal) even with no chat history', () => {
    const result = processChats([], AGENTS, EMPTY_IM);

    const ids = result.map(item => item.id);
    expect(ids).toContain('mechanic');
    expect(ids).toContain('legal');
  });

  it('should merge chat history with IM sessions', () => {
    const chats = [
      { agentId: 'general', lastMessage: '旧消息', timestamp: '2026-02-13T01:00:00Z' },
    ];

    const imSessions = {
      sessions: [
        { agent_id: 1, last_msg_content: 'IM新消息', last_msg_time: '2026-02-13T02:00:00Z' },
      ],
      total: 1,
    };

    const result = processChats(chats, AGENTS, imSessions);

    const generalChat = result.find(item => item.id === 'general');
    expect(generalChat).toBeDefined();
    // IM session 消息优先
    expect(generalChat!.lastMessage).toBe('IM新消息');
    // IM session 时间优先
    expect(new Date(generalChat!.timestamp).toISOString()).toBe('2026-02-13T02:00:00.000Z');
  });

  it('should create chat items for IM-only sessions (no chat history)', () => {
    const imSessions = {
      sessions: [
        { agent_id: 4, last_msg_content: '林姨的新消息', last_msg_time: '2026-02-13T03:00:00Z' },
      ],
      total: 1,
    };

    const result = processChats([], AGENTS, imSessions);

    const healthChat = result.find(item => item.id === 'health');
    expect(healthChat).toBeDefined();
    expect(healthChat!.lastMessage).toBe('林姨的新消息');
  });

  it('should not duplicate agents that appear in both chats and IM sessions', () => {
    const chats = [
      { agentId: 'mechanic', lastMessage: '聊天记录', timestamp: '2026-02-13T01:00:00Z' },
    ];

    const imSessions = {
      sessions: [
        { agent_id: 2, last_msg_content: 'IM消息', last_msg_time: '2026-02-13T02:00:00Z' },
      ],
      total: 1,
    };

    const result = processChats(chats, AGENTS, imSessions);

    const mechanicItems = result.filter(item => item.id === 'mechanic');
    expect(mechanicItems).toHaveLength(1);
    // IM 消息优先
    expect(mechanicItems[0].lastMessage).toBe('IM消息');
  });

  it('should sort results by timestamp descending', () => {
    const chats = [
      { agentId: 'general', lastMessage: '早', timestamp: '2026-02-13T01:00:00Z' },
      { agentId: 'algo', lastMessage: '晚', timestamp: '2026-02-13T05:00:00Z' },
      { agentId: 'health', lastMessage: '中', timestamp: '2026-02-13T03:00:00Z' },
    ];

    const result = processChats(chats, AGENTS, EMPTY_IM);

    // 排除保底顾问（它们的时间戳可能不同），只验证有聊天记录的项
    const chatItems = result.filter(item =>
      ['general', 'algo', 'health'].includes(item.id)
    );

    const timestamps = chatItems.map(item => new Date(item.timestamp).getTime());
    for (let i = 0; i < timestamps.length - 1; i++) {
      expect(timestamps[i]).toBeGreaterThanOrEqual(timestamps[i + 1]);
    }
  });

  it('should handle group chat from IM sessions', () => {
    const imSessions = {
      sessions: [
        { agent_id: 0, last_msg_content: '群聊IM消息', last_msg_time: '2026-02-13T04:00:00Z' },
      ],
      total: 1,
    };

    const result = processChats([], AGENTS, imSessions);

    const group = result.find(item => item.id === 'super_driver_group');
    expect(group).toBeDefined();
    expect(group!.lastMessage).toBe('群聊IM消息');
  });

  it('should handle empty inputs gracefully', () => {
    const result = processChats([], {}, EMPTY_IM);

    // 至少有群聊
    expect(result.length).toBeGreaterThanOrEqual(1);
    expect(result[0].id).toBe('super_driver_group');
  });

  it('should ignore IM sessions with unknown agent_ids', () => {
    const imSessions = {
      sessions: [
        { agent_id: 999, last_msg_content: '未知Agent', last_msg_time: '2026-02-13T01:00:00Z' },
      ],
      total: 1,
    };

    const result = processChats([], AGENTS, imSessions);

    const unknownItem = result.find(item => item.lastMessage === '未知Agent');
    expect(unknownItem).toBeUndefined();
  });
});
