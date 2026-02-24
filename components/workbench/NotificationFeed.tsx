/**
 * 通知信息流组件
 * Twitter 风格的工作流通知列表
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WorkflowNotification } from '../../config/mock-data';
import { NotificationItem } from './NotificationItem';
import { SectionHeader } from '../ui/SectionHeader';
import { TEXT, BACKGROUND, BORDER, PRIMARY, DANGER } from '../../styles/colors';

export interface NotificationFeedProps {
    items: WorkflowNotification[];
    onItemPress?: (item: WorkflowNotification) => void;
    onAction?: (payload: string) => void;
    onMarkAllRead?: () => void;
}

export const NotificationFeed: React.FC<NotificationFeedProps> = ({
    items,
    onItemPress,
    onAction,
    onMarkAllRead,
}) => {
    const unreadCount = items.filter(n => !n.isRead).length;

    return (
        <View style={styles.container}>
            {/* 标题栏 */}
            <View style={styles.header}>
                <View style={styles.titleRow}>
                    <Ionicons name="flash" size={20} color={PRIMARY} />
                    <Text style={styles.title}>工作流</Text>
                    {unreadCount > 0 && (
                        <View style={styles.unreadBadge}>
                            <Text style={styles.unreadText}>{unreadCount}</Text>
                        </View>
                    )}
                </View>
                {unreadCount > 0 && (
                    <TouchableOpacity onPress={onMarkAllRead}>
                        <Text style={styles.markAllText}>全部已读</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* 通知列表 */}
            <View style={styles.list}>
                {items.length === 0 ? (
                    <View style={styles.empty}>
                        <Ionicons name="checkmark-circle-outline" size={36} color={TEXT.tertiary} />
                        <Text style={styles.emptyText}>暂无新通知</Text>
                    </View>
                ) : (
                    items.map(item => (
                        <NotificationItem
                            key={item.id}
                            item={item}
                            onPress={onItemPress}
                            onAction={onAction}
                        />
                    ))
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: BACKGROUND.card,
        borderRadius: 12,
        marginHorizontal: 16,
        marginTop: 16,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: BORDER.light,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        color: TEXT.primary,
    },
    unreadBadge: {
        backgroundColor: DANGER,
        minWidth: 18,
        height: 18,
        borderRadius: 9,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 6,
    },
    unreadText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#fff',
    },
    markAllText: {
        fontSize: 13,
        color: PRIMARY,
    },
    list: {
        // 列表内容
    },
    empty: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
        gap: 8,
    },
    emptyText: {
        fontSize: 14,
        color: TEXT.tertiary,
    },
});

export default NotificationFeed;
