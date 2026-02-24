/**
 * types.ts 类型完整性测试
 * 
 * 运行时验证类型定义与实际使用的一致性
 * 主要覆盖 L-05/L-06 修复的类型
 */
import { Agent, AgentStyle, ChatListItem, Pagination, PaginatedResponse } from '../../types';

describe('AgentStyle (L-05)', () => {
  it('should accept color string', () => {
    const style: AgentStyle = { color: 'bg-red-500' };
    expect(style.color).toBe('bg-red-500');
  });

  it('should accept additional properties via index signature', () => {
    const style: AgentStyle = {
      color: 'bg-blue-500',
      gradient: 'from-blue-400 to-blue-600',
      opacity: 0.9,
    };
    expect(style.color).toBe('bg-blue-500');
    expect(style.gradient).toBe('from-blue-400 to-blue-600');
  });
});

describe('Pagination (L-06)', () => {
  it('should have required fields', () => {
    const pagination: Pagination = {
      page: 1,
      limit: 20,
      total: 100,
      totalPages: 5,
    };
    expect(pagination.totalPages).toBe(5);
  });

  it('PaginatedResponse should wrap data with pagination', () => {
    const response: PaginatedResponse<{ id: string }> = {
      data: [{ id: '1' }, { id: '2' }],
      pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
    };
    expect(response.data).toHaveLength(2);
    expect(response.pagination.total).toBe(2);
  });
});

describe('ChatListItem', () => {
  it('should support both group and private types', () => {
    const group: ChatListItem = {
      id: 'group1',
      type: 'group',
      name: '测试群',
      avatar: '📡',
      lastMessage: 'hello',
      timestamp: new Date().toISOString(),
    };

    const priv: ChatListItem = {
      id: 'agent1',
      type: 'private',
      name: '翔哥',
      avatar: '🧢',
      lastMessage: 'hi',
      timestamp: new Date(),
      agent: {
        id: 'general',
        name: '翔哥',
        title: '带头大哥',
        avatar: '🧢',
        description: '都是兄弟',
        style: { color: 'bg-red-500' },
        keywords: [],
        isPaid: false,
        companyName: '',
        priority: 10,
        category: 'native',
      },
    };

    expect(group.type).toBe('group');
    expect(priv.type).toBe('private');
    expect(priv.agent).toBeDefined();
  });
});
