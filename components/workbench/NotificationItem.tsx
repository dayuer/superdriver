/**
 * 通知项组件
 * Twitter 风格的单条通知渲染
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WorkflowNotification } from '../../config/mock-data';
import { getNotificationIcon, getNotificationColor } from '../../utils/status-helpers';
import { TEXT, BORDER, PRIMARY, BACKGROUND } from '../../styles/colors';

export interface NotificationItemProps {
    item: WorkflowNotification;
    onPress?: (item: WorkflowNotification) => void;
    onAction?: (payload: string) => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
    item,
    onPress,
    onAction,
}) => {
    const iconName = getNotificationIcon(item.type);
    const iconColor = getNotificationColor(item.type);

    return (
        <TouchableOpacity
            style={[styles.container, !item.isRead && styles.unread]}
            activeOpacity={0.7}
            onPress={() => onPress?.(item)}
        >
            {/* 图标 */}
            <View style={[styles.iconWrapper, { backgroundColor: `${iconColor}15` }]}>
                <Ionicons name={iconName as any} size={18} color={iconColor} />
            </View>

            {/* 内容 */}
            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.time}>{item.timestamp}</Text>
                </View>
                <Text style={styles.message} numberOfLines={2}>{item.content}</Text>

                {/* 操作按钮 */}
                {item.action && (
                    <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => onAction?.(item.action!.payload)}
                    >
                        <Text style={styles.actionText}>{item.action.label}</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* 未读标记 */}
            {!item.isRead && <View style={styles.unreadDot} />}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: BACKGROUND.card,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: BORDER.light,
    },
    unread: {
        backgroundColor: `${PRIMARY}08`,
    },
    iconWrapper: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    content: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    title: {
        fontSize: 14,
        fontWeight: '600',
        color: TEXT.primary,
        flex: 1,
        marginRight: 8,
    },
    time: {
        fontSize: 12,
        color: TEXT.tertiary,
    },
    message: {
        fontSize: 13,
        color: TEXT.secondary,
        lineHeight: 18,
    },
    actionBtn: {
        alignSelf: 'flex-start',
        backgroundColor: `${PRIMARY}15`,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 14,
        marginTop: 10,
    },
    actionText: {
        fontSize: 13,
        fontWeight: '600',
        color: PRIMARY,
    },
    unreadDot: {
        position: 'absolute',
        top: 18,
        left: 8,
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: PRIMARY,
    },
});

export default NotificationItem;
