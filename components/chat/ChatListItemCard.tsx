/**
 * 聊天列表项组件
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ChatListItem, Agent } from '../../types';
import { AgentAvatar } from '../AgentAvatar';
import { Badge } from '../ui/Badge';
import { TEXT, BACKGROUND, BORDER, PRIMARY, DANGER } from '../../styles/colors';

export interface ChatListItemCardProps {
    item: ChatListItem;
    agent?: Agent;
    onPress: (item: ChatListItem) => void;
}

export const ChatListItemCard: React.FC<ChatListItemCardProps> = ({
    item,
    agent,
    onPress,
}) => {
    // 格式化时间
    const formatTime = (date: Date | string) => {
        const d = typeof date === 'string' ? new Date(date) : date;
        const now = new Date();
        const diff = now.getTime() - d.getTime();
        const oneDay = 24 * 60 * 60 * 1000;

        if (diff < oneDay && now.getDate() === d.getDate()) {
            return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
        } else if (diff < 2 * oneDay) {
            return '昨天';
        } else if (diff < 7 * oneDay) {
            const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
            return days[d.getDay()];
        } else {
            return `${d.getMonth() + 1}/${d.getDate()}`;
        }
    };

    const isGroup = item.type === 'group';

    return (
        <TouchableOpacity
            style={styles.container}
            activeOpacity={0.7}
            onPress={() => onPress(item)}
        >
            {/* 头像 */}
            <View style={styles.avatarWrapper}>
                {isGroup ? (
                    <View style={styles.groupAvatar}>
                        <Text style={styles.groupEmoji}>{item.avatar}</Text>
                    </View>
                ) : agent ? (
                    <AgentAvatar avatar={agent.avatar} size={48} isPaid={agent.isPaid} />
                ) : (
                    <View style={styles.defaultAvatar}>
                        <Text style={styles.defaultAvatarText}>{item.name.charAt(0)}</Text>
                    </View>
                )}
            </View>

            {/* 内容 */}
            <View style={styles.content}>
                <View style={styles.topRow}>
                    <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.time}>{formatTime(item.timestamp)}</Text>
                </View>
                <View style={styles.bottomRow}>
                    <Text style={styles.message} numberOfLines={1}>{item.lastMessage}</Text>
                    {item.unread ? <Badge text={item.unread} size="sm" /> : null}
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: BACKGROUND.card,
    },
    avatarWrapper: {
        marginRight: 12,
    },
    groupAvatar: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: `${PRIMARY}15`,
        alignItems: 'center',
        justifyContent: 'center',
    },
    groupEmoji: {
        fontSize: 24,
    },
    defaultAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#E5E5EA',
        alignItems: 'center',
        justifyContent: 'center',
    },
    defaultAvatarText: {
        fontSize: 18,
        fontWeight: '600',
        color: TEXT.secondary,
    },
    content: {
        flex: 1,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    name: {
        fontSize: 16,
        fontWeight: '500',
        color: TEXT.primary,
        flex: 1,
        marginRight: 8,
    },
    time: {
        fontSize: 12,
        color: TEXT.tertiary,
    },
    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    message: {
        fontSize: 14,
        color: TEXT.secondary,
        flex: 1,
        marginRight: 8,
    },
});

export default ChatListItemCard;
