/**
 * config/constants 测试
 * 
 * 覆盖:
 * - AGENT_NUMERIC_IDS ↔ AGENT_ID_BY_NUMERIC 双向映射一致性
 * - CORE_ADVISORS 必须是合法 agent id
 * - DEFAULT_AGENTS 别名正确性
 * - TAB_BAR 配置完整性
 */
import {
  AGENT_NUMERIC_IDS,
  AGENT_ID_BY_NUMERIC,
  CORE_ADVISORS,
  DEFAULT_AGENTS,
  TAB_BAR,
  ANIMATION,
} from '../../config/constants';

describe('Agent ID Mapping', () => {
  it('AGENT_ID_BY_NUMERIC should be exact reverse of AGENT_NUMERIC_IDS', () => {
    // 正向 → 反向
    Object.entries(AGENT_NUMERIC_IDS).forEach(([stringId, numericId]) => {
      expect(AGENT_ID_BY_NUMERIC[numericId]).toBe(stringId);
    });

    // 反向 → 正向
    Object.entries(AGENT_ID_BY_NUMERIC).forEach(([numericId, stringId]) => {
      expect(AGENT_NUMERIC_IDS[stringId]).toBe(Number(numericId));
    });
  });

  it('should have same number of entries in both directions', () => {
    const forwardCount = Object.keys(AGENT_NUMERIC_IDS).length;
    const reverseCount = Object.keys(AGENT_ID_BY_NUMERIC).length;
    expect(forwardCount).toBe(reverseCount);
  });

  it('numeric IDs should be unique positive integers', () => {
    const ids = Object.values(AGENT_NUMERIC_IDS);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
    ids.forEach(id => {
      expect(id).toBeGreaterThan(0);
      expect(Number.isInteger(id)).toBe(true);
    });
  });
});

describe('CORE_ADVISORS', () => {
  it('should only contain valid agent IDs', () => {
    CORE_ADVISORS.forEach(advisorId => {
      expect(AGENT_NUMERIC_IDS).toHaveProperty(advisorId);
    });
  });

  it('should have at least one advisor', () => {
    expect(CORE_ADVISORS.length).toBeGreaterThan(0);
  });
});

describe('DEFAULT_AGENTS', () => {
  it('should contain all agents from AGENT_NUMERIC_IDS', () => {
    Object.keys(AGENT_NUMERIC_IDS).forEach(agentId => {
      expect(DEFAULT_AGENTS[agentId]).toBeDefined();
      expect(DEFAULT_AGENTS[agentId].id).toBe(agentId);
      expect(DEFAULT_AGENTS[agentId].name).toBeTruthy();
    });
  });

  it('aliases should point to correct agents', () => {
    expect(DEFAULT_AGENTS['yin']).toBe(DEFAULT_AGENTS['general']);
    expect(DEFAULT_AGENTS['ye']).toBe(DEFAULT_AGENTS['legal']);
    expect(DEFAULT_AGENTS['zhou']).toBe(DEFAULT_AGENTS['mechanic']);
    expect(DEFAULT_AGENTS['lin']).toBe(DEFAULT_AGENTS['health']);
    expect(DEFAULT_AGENTS['k']).toBe(DEFAULT_AGENTS['algo']);
    expect(DEFAULT_AGENTS['pei']).toBe(DEFAULT_AGENTS['metaphysics']);
  });

  it('each agent should have required fields', () => {
    Object.values(DEFAULT_AGENTS).forEach(agent => {
      expect(agent.id).toBeTruthy();
      expect(agent.name).toBeTruthy();
      expect(agent.avatar).toBeTruthy();
      expect(agent.style).toBeDefined();
      expect(agent.style.color).toBeTruthy();
      expect(typeof agent.priority).toBe('number');
    });
  });
});

describe('Layout Constants', () => {
  it('TAB_BAR should have valid dimensions', () => {
    expect(TAB_BAR.height).toBeGreaterThan(0);
    expect(TAB_BAR.paddingBottom).toBeGreaterThanOrEqual(0);
    expect(TAB_BAR.paddingTop).toBeGreaterThanOrEqual(0);
  });

  it('ANIMATION header should have valid heights', () => {
    expect(ANIMATION.header.expandedHeight).toBeGreaterThan(0);
    expect(ANIMATION.header.compactHeight).toBeGreaterThan(0);
    expect(ANIMATION.header.expandedHeight).toBeGreaterThan(ANIMATION.header.compactHeight);
  });
});
