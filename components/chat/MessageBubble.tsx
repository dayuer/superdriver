/**
 * 消息气泡组件
 * 支持用户/AI/系统三种类型
 */
import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { ChatMessage } from '../../types';
import { AgentAvatar } from '../AgentAvatar';
import { Agent } from '../../types';
import { TEXT, BACKGROUND, BORDER, PRIMARY } from '../../styles/colors';

export interface MessageBubbleProps {
    message: ChatMessage;
    isOwnMessage: boolean;
    agent?: Agent;
    showTimestamp?: boolean;
    timestampText?: string;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
    message,
    isOwnMessage,
    agent,
    showTimestamp,
    timestampText,
}) => {
    const isSystem = message.type === 'system';

    if (isSystem) {
        return (
            <View style={styles.systemContainer}>
                <Text style={styles.systemText}>{message.content}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {showTimestamp && timestampText && (
                <View style={styles.timestampContainer}>
                    <Text style={styles.timestampText}>{timestampText}</Text>
                </View>
            )}
            <View style={[styles.row, isOwnMessage && styles.rowReverse]}>
                {/* AI 头像 */}
                {!isOwnMessage && agent && (
                    <View style={styles.avatarWrapper}>
                        <AgentAvatar avatar={agent.avatar} size={36} isPaid={agent.isPaid} />
                    </View>
                )}

                {/* 气泡 */}
                <View style={[
                    styles.bubble,
                    isOwnMessage ? styles.bubbleOwn : styles.bubbleOther,
                ]}>
                    {!isOwnMessage && agent && (
                        <Text style={styles.agentName}>{agent.name}</Text>
                    )}
                    <Text style={[
                        styles.content,
                        isOwnMessage ? styles.contentOwn : styles.contentOther,
                    ]}>
                        {message.content}
                    </Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 8,
        paddingHorizontal: 16,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'flex-end',
    },
    rowReverse: {
        flexDirection: 'row-reverse',
    },
    avatarWrapper: {
        marginRight: 8,
    },
    bubble: {
        maxWidth: '75%',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 18,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.08,
                shadowRadius: 2,
            },
            android: {
                elevation: 1,
            },
        }),
    },
    bubbleOwn: {
        backgroundColor: PRIMARY,
        borderBottomRightRadius: 4,
    },
    bubbleOther: {
        backgroundColor: BACKGROUND.card,
        borderBottomLeftRadius: 4,
    },
    agentName: {
        fontSize: 11,
        fontWeight: '600',
        color: PRIMARY,
        marginBottom: 4,
    },
    content: {
        fontSize: 15,
        lineHeight: 20,
    },
    contentOwn: {
        color: '#fff',
    },
    contentOther: {
        color: TEXT.primary,
    },
    timestampContainer: {
        alignItems: 'center',
        marginVertical: 12,
    },
    timestampText: {
        fontSize: 11,
        color: TEXT.tertiary,
    },
    systemContainer: {
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 20,
    },
    systemText: {
        fontSize: 12,
        color: TEXT.tertiary,
        textAlign: 'center',
    },
});

export default MessageBubble;
