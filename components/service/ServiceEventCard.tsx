/**
 * ServiceEventCard — 服务事件卡片
 *
 * 显示事件标题、状态、进度条、参与 Agent、时间
 */
import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ServiceEvent, Agent } from '../../types';
import { ServiceStatusBadge } from './ServiceStatusBadge';
import { AgentAvatar } from '../AgentAvatar';
import { TEXT, BACKGROUND, BORDER } from '../../styles/colors';

// 事件类型图标
const TYPE_ICONS: Record<string, { icon: string; color: string }> = {
    legal_case:       { icon: 'shield-checkmark', color: '#5856D6' },
    insurance_claim:  { icon: 'document-text',    color: '#FF9500' },
    vehicle_repair:   { icon: 'construct',         color: '#34C759' },
    compound:         { icon: 'layers',            color: '#AF52DE' },
};

interface Props {
    event: ServiceEvent;
    agentsMap?: Record<string, Agent>;
    onPress: (event: ServiceEvent) => void;
}

export const ServiceEventCard: React.FC<Props> = ({ event, agentsMap = {}, onPress }) => {
    const progress = event.total_steps > 0
        ? event.completed_steps / event.total_steps
        : 0;

    const typeConfig = TYPE_ICONS[event.event_type] ?? { icon: 'ellipse', color: '#8E8E93' };

    // 解析 expert_role_ids
    const roleIds = useMemo(() => {
        try {
            return JSON.parse(event.expert_role_ids || '[]') as string[];
        } catch {
            return [];
        }
    }, [event.expert_role_ids]);

    // 时间格式化
    const timeAgo = useMemo(() => {
        const d = new Date(event.updatedAt || event.createdAt);
        const now = Date.now();
        const diff = now - d.getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return '刚刚';
        if (mins < 60) return `${mins}分钟前`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours}小时前`;
        const days = Math.floor(hours / 24);
        return `${days}天前`;
    }, [event.updatedAt, event.createdAt]);

    return (
        <TouchableOpacity
            style={styles.card}
            activeOpacity={0.7}
            onPress={() => onPress(event)}
        >
            {/* 头部：状态 + 进度 */}
            <View style={styles.header}>
                <ServiceStatusBadge
                    status={event.status}
                    priority={event.priority}
                    size="sm"
                />
                {event.total_steps > 0 && (
                    <Text style={styles.progressText}>
                        {Math.round(progress * 100)}%
                    </Text>
                )}
            </View>

            {/* 进度条 */}
            {event.total_steps > 0 && (
                <View style={styles.progressBar}>
                    <View
                        style={[
                            styles.progressFill,
                            {
                                width: `${Math.min(progress * 100, 100)}%`,
                                backgroundColor: progress >= 1
                                    ? '#34C759'
                                    : event.priority === 'urgent'
                                    ? '#FF3B30'
                                    : '#007AFF',
                            },
                        ]}
                    />
                </View>
            )}

            {/* 标题行 */}
            <View style={styles.titleRow}>
                <Ionicons
                    name={typeConfig.icon as keyof typeof Ionicons.glyphMap}
                    size={18}
                    color={typeConfig.color}
                />
                <Text style={styles.title} numberOfLines={1}>
                    {event.title}
                </Text>
            </View>

            {/* 摘要 */}
            {event.summary ? (
                <Text style={styles.summary} numberOfLines={1}>
                    {event.summary}
                </Text>
            ) : null}

            {/* 底部：Agent 头像 + 步骤数 + 时间 */}
            <View style={styles.footer}>
                <View style={styles.agents}>
                    {roleIds.slice(0, 3).map((roleId, i) => {
                        const agent = agentsMap[roleId];
                        if (agent) {
                            return (
                                <View key={roleId} style={[styles.agentAvatar, { marginLeft: i > 0 ? -6 : 0 }]}>
                                    <AgentAvatar avatar={agent.avatar} size={22} />
                                </View>
                            );
                        }
                        return (
                            <View key={roleId} style={[styles.agentDot, { marginLeft: i > 0 ? 4 : 0 }]}>
                                <Text style={styles.agentDotText}>{roleId.charAt(0).toUpperCase()}</Text>
                            </View>
                        );
                    })}
                </View>
                <Text style={styles.footerText}>
                    {event.completed_steps}/{event.total_steps}步
                </Text>
                <Text style={styles.footerDot}>·</Text>
                <Text style={styles.footerText}>{timeAgo}</Text>
                {event.estimated_cost != null && event.estimated_cost > 0 && (
                    <>
                        <Text style={styles.footerDot}>·</Text>
                        <Text style={styles.footerCost}>¥{event.estimated_cost.toLocaleString()}</Text>
                    </>
                )}
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: BACKGROUND.card,
        marginHorizontal: 16,
        marginBottom: 12,
        borderRadius: 14,
        padding: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    progressText: {
        fontSize: 13,
        fontWeight: '700',
        color: TEXT.secondary,
    },
    progressBar: {
        height: 4,
        backgroundColor: '#E5E5EA',
        borderRadius: 2,
        marginBottom: 10,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 2,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    title: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        color: TEXT.primary,
        lineHeight: 22,
    },
    summary: {
        fontSize: 13,
        color: TEXT.secondary,
        lineHeight: 18,
        marginBottom: 10,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
    },
    agents: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 8,
    },
    agentAvatar: {
        borderWidth: 1.5,
        borderColor: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
    },
    agentDot: {
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: '#E5E5EA',
        alignItems: 'center',
        justifyContent: 'center',
    },
    agentDotText: {
        fontSize: 10,
        fontWeight: '600',
        color: TEXT.secondary,
    },
    footerText: {
        fontSize: 12,
        color: TEXT.tertiary,
    },
    footerDot: {
        fontSize: 12,
        color: TEXT.tertiary,
        marginHorizontal: 4,
    },
    footerCost: {
        fontSize: 12,
        color: '#FF9500',
        fontWeight: '500',
    },
});

export default ServiceEventCard;
