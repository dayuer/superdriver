/**
 * 单元测试: MessageBubble 组件逻辑
 * 测试消息类型判断和渲染逻辑
 */

import { ChatMessage } from '../../../types';

// ============================================================================
// Helper Functions (extracted for testability)
// ============================================================================

/**
 * 判断消息是否为系统消息
 */
export const isSystemMessage = (message: ChatMessage): boolean => {
    return message.type === 'system';
};

/**
 * 判断是否应该显示用户头像
 * - 非自己的消息
 * - 私聊时有 agent
 */
export const shouldShowAvatar = (isOwnMessage: boolean, hasAgent: boolean): boolean => {
    return !isOwnMessage && hasAgent;
};

/**
 * 判断是否应该显示 agent 名称
 * - 非自己的消息
 * - 有 agent 信息
 */
export const shouldShowAgentName = shouldShowAvatar;

// ============================================================================
// Mock Data (aligned with ChatMessage interface in types.ts)
// ============================================================================

const mockUserMessage: ChatMessage = {
    id: '1',
    content: '你好，请问今天的收入怎么样？',
    type: 'text',
    timestamp: new Date(),
};

const mockAIMessage: ChatMessage = {
    id: '2',
    content: '今天收入不错，已完成15单，共计¥450.50',
    type: 'text',
    timestamp: new Date(),
};

const mockSystemMessage: ChatMessage = {
    id: '3',
    content: '叶露已加入对话',
    type: 'system',
    timestamp: new Date(),
};

// ============================================================================
// Tests: Message Type Detection
// ============================================================================

describe('isSystemMessage', () => {
    it('should return true for system messages', () => {
        expect(isSystemMessage(mockSystemMessage)).toBe(true);
    });

    it('should return false for user messages', () => {
        expect(isSystemMessage(mockUserMessage)).toBe(false);
    });

    it('should return false for AI messages', () => {
        expect(isSystemMessage(mockAIMessage)).toBe(false);
    });
});

// ============================================================================
// Tests: Avatar Display Logic
// ============================================================================

describe('shouldShowAvatar', () => {
    it('should return true for AI message with agent', () => {
        expect(shouldShowAvatar(false, true)).toBe(true);
    });

    it('should return false for own message', () => {
        expect(shouldShowAvatar(true, true)).toBe(false);
    });

    it('should return false when no agent', () => {
        expect(shouldShowAvatar(false, false)).toBe(false);
    });

    it('should return false for own message without agent', () => {
        expect(shouldShowAvatar(true, false)).toBe(false);
    });
});

// ============================================================================
// Tests: Agent Name Display Logic
// ============================================================================

describe('shouldShowAgentName', () => {
    it('should show agent name for AI message with agent', () => {
        expect(shouldShowAgentName(false, true)).toBe(true);
    });

    it('should not show agent name for own message', () => {
        expect(shouldShowAgentName(true, true)).toBe(false);
    });

    it('should not show agent name when no agent provided', () => {
        expect(shouldShowAgentName(false, false)).toBe(false);
    });
});
