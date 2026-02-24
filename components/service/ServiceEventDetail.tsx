/**
 * ServiceEventDetail — 服务事件详情页
 *
 * 展示事件信息 + 步骤时间线 + 底部内嵌对话输入
 * 
 * 设计理念：对话不是独立的，对话就是服务的一部分。
 * 用户在这里直接输入内容，消息属于当前服务事件。
 */
import React, { useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ServiceEvent, ServiceStep, Agent } from '../../types';
import { ServiceStatusBadge } from './ServiceStatusBadge';
import { ServiceStepItem } from './ServiceStepItem';
import { AgentAvatar } from '../AgentAvatar';
import { TEXT, BACKGROUND, BORDER, PRIMARY, SUCCESS } from '../../styles/colors';

interface Props {
    event: ServiceEvent;
    steps: ServiceStep[];
    isLoading: boolean;
    isGeneratingSteps?: boolean;
    justCompletedStepId?: number | null; // 刚完成的步骤 ID，用于动画
    agentsMap?: Record<string, Agent>;
    onBack: () => void;
    onMarkStepDone?: (stepId: number) => void;
    onVoicePress?: () => void;
    onRefresh?: () => void;
}

export const ServiceEventDetail: React.FC<Props> = ({
    event,
    steps,
    isLoading,
    isGeneratingSteps = false,
    justCompletedStepId = null,
    agentsMap = {},
    onBack,
    onMarkStepDone,
    onVoicePress,
    onRefresh,
}) => {
    const insets = useSafeAreaInsets();

    const progress = event.total_steps > 0
        ? event.completed_steps / event.total_steps
        : 0;

    // 排序步骤
    const sortedSteps = useMemo(() =>
        [...steps].sort((a, b) => a.sort_order - b.sort_order),
    [steps]);

    // 找到第一个未完成的步骤作为"当前"
    const currentStepId = useMemo(() => {
        const first = sortedSteps.find(s => !s.is_done); // 兼容 false/0
        return first?.id ?? null;
    }, [sortedSteps]);

    // 解析 Agent 角色
    const roleIds = useMemo(() => {
        try {
            return JSON.parse(event.expert_role_ids || '[]') as string[];
        } catch {
            return [];
        }
    }, [event.expert_role_ids]);

    // 主负责专家
    const primaryAgent = agentsMap[event.primary_role_id];



    return (
        <View
            style={[styles.container, { paddingTop: insets.top }]}
        >
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={onBack}>
                    <Ionicons name="chevron-back" size={24} color={TEXT.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>{event.title}</Text>
                <View style={styles.headerRight} />
            </View>

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                {/* 事件概要卡片 */}
                <View style={styles.summaryCard}>
                    <View style={styles.summaryHeader}>
                        <ServiceStatusBadge status={event.status} priority={event.priority} />
                    </View>

                    {/* 进度 */}
                    {event.total_steps > 0 && (
                        <>
                            <View style={styles.progressRow}>
                                <Text style={styles.progressLabel}>
                                    进度 {event.completed_steps}/{event.total_steps}
                                </Text>
                                <Text style={styles.progressPercent}>{Math.round(progress * 100)}%</Text>
                            </View>
                            <View style={styles.progressBar}>
                                <View style={[styles.progressFill, {
                                    width: `${Math.min(progress * 100, 100)}%`,
                                    backgroundColor: progress >= 1 ? SUCCESS : PRIMARY,
                                }]} />
                            </View>
                        </>
                    )}

                    {/* Agent 列表 */}
                    {roleIds.length > 0 && (
                        <View style={styles.agentsRow}>
                            <Text style={styles.agentsLabel}>参与专家</Text>
                            <View style={styles.agentsList}>
                                {roleIds.map(roleId => {
                                    const agent = agentsMap[roleId];
                                    return (
                                        <View key={roleId} style={styles.agentChip}>
                                            <AgentAvatar avatar={agent?.avatar ?? '🤖'} size={20} />
                                            <Text style={styles.agentChipText}>
                                                {agent?.name ?? roleId}
                                            </Text>
                                            {roleId === event.primary_role_id && (
                                                <Text style={styles.primaryBadge}>主</Text>
                                            )}
                                        </View>
                                    );
                                })}
                            </View>
                        </View>
                    )}

                    {/* 费用 */}
                    {(event.estimated_cost != null || event.actual_cost != null) && (
                        <View style={styles.costRow}>
                            {event.estimated_cost != null && (
                                <View style={styles.costItem}>
                                    <Text style={styles.costLabel}>预估费用</Text>
                                    <Text style={styles.costValue}>¥{event.estimated_cost.toLocaleString()}</Text>
                                </View>
                            )}
                            {event.actual_cost != null && (
                                <View style={styles.costItem}>
                                    <Text style={styles.costLabel}>实际费用</Text>
                                    <Text style={[styles.costValue, { color: SUCCESS }]}>
                                        ¥{event.actual_cost.toLocaleString()}
                                    </Text>
                                </View>
                            )}
                        </View>
                    )}

                    {/* 摘要 */}
                    {event.summary ? (
                        <Text style={styles.summaryText}>{event.summary}</Text>
                    ) : null}
                </View>

                {/* 步骤时间线 */}
                <View style={styles.stepsSection}>
                    <Text style={styles.sectionTitle}>服务步骤</Text>

                    {isLoading || isGeneratingSteps ? (
                        <View style={styles.stepsLoading}>
                            <ActivityIndicator size="small" color={PRIMARY} />
                            {isGeneratingSteps && (
                                <Text style={styles.generatingText}>R1 正在为你拆解步骤...</Text>
                            )}
                        </View>
                    ) : sortedSteps.length === 0 ? (
                        <View style={styles.emptySteps}>
                            <Ionicons name="hourglass-outline" size={32} color="#D1D1D6" />
                            <Text style={styles.noSteps}>暂无步骤</Text>
                        </View>
                    ) : (
                        <>
                            {sortedSteps.map((step, index) => (
                                <ServiceStepItem
                                    key={step.id}
                                    step={step}
                                    isCurrent={step.id === currentStepId}
                                    isLast={index === sortedSteps.length - 1}
                                    isJustCompleted={step.id === justCompletedStepId}
                                    agentsMap={agentsMap}
                                    onMarkDone={onMarkStepDone}
                                />
                            ))}

                            {/* 全部完成提示 */}
                            {event.completed_steps >= event.total_steps && event.total_steps > 0 && (
                                <View style={styles.allDoneCard}>
                                    <Ionicons name="checkmark-done-circle" size={36} color={SUCCESS} />
                                    <Text style={styles.allDoneTitle}>服务已完成 🎉</Text>
                                    <Text style={styles.allDoneDesc}>
                                        所有步骤已处理完毕，事件已自动关闭
                                    </Text>
                                </View>
                            )}
                        </>
                    )}
                </View>
            </ScrollView>

            {/* 底部语音按钮 */}
            <View style={[styles.voiceBar, { paddingBottom: insets.bottom + 10 }]}>
                {primaryAgent && (
                    <View style={styles.voiceAgentInfo}>
                        <AgentAvatar avatar={primaryAgent.avatar} size={28} />
                        <Text style={styles.voiceAgentName}>{primaryAgent.name}</Text>
                    </View>
                )}
                <TouchableOpacity
                    style={styles.voiceBtn}
                    onPress={onVoicePress}
                    activeOpacity={0.8}
                >
                    <Ionicons name="mic" size={20} color="#fff" />
                    <Text style={styles.voiceBtnText}>语音咨询</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: BACKGROUND.primary,
    },
    // Header
    header: {
        height: 44,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        backgroundColor: BACKGROUND.primary,
        borderBottomWidth: 0.5,
        borderBottomColor: BORDER.light,
    },
    backBtn: {
        width: 36,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        flex: 1,
        fontSize: 17,
        fontWeight: '600',
        color: TEXT.primary,
        textAlign: 'center',
        marginHorizontal: 8,
    },
    headerRight: { width: 36 },

    // ScrollView
    scrollView: { flex: 1 },
    scrollContent: { paddingBottom: 20 },

    // 概要卡片
    summaryCard: {
        margin: 16,
        padding: 16,
        backgroundColor: BACKGROUND.card,
        borderRadius: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
    },
    summaryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    progressRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    progressLabel: { fontSize: 13, color: TEXT.secondary },
    progressPercent: { fontSize: 14, fontWeight: '700', color: TEXT.primary },
    progressBar: {
        height: 6,
        backgroundColor: '#E5E5EA',
        borderRadius: 3,
        overflow: 'hidden',
        marginBottom: 14,
    },
    progressFill: { height: '100%', borderRadius: 3 },

    // Agents
    agentsRow: { marginBottom: 12 },
    agentsLabel: { fontSize: 12, color: TEXT.tertiary, marginBottom: 8 },
    agentsList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    agentChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 16,
        backgroundColor: '#F0F0F5',
    },
    agentChipText: { fontSize: 13, color: TEXT.primary, fontWeight: '500' },
    primaryBadge: {
        fontSize: 10,
        color: '#fff',
        backgroundColor: PRIMARY,
        paddingHorizontal: 4,
        paddingVertical: 1,
        borderRadius: 4,
        fontWeight: '600',
        overflow: 'hidden',
    },

    // Cost
    costRow: {
        flexDirection: 'row',
        gap: 20,
        marginBottom: 12,
    },
    costItem: {},
    costLabel: { fontSize: 11, color: TEXT.tertiary, marginBottom: 2 },
    costValue: { fontSize: 15, fontWeight: '600', color: TEXT.primary },

    // Summary
    summaryText: {
        fontSize: 13,
        color: TEXT.secondary,
        lineHeight: 18,
    },

    // Steps
    stepsSection: {
        paddingHorizontal: 0,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: TEXT.primary,
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    stepsLoading: {
        padding: 40,
        alignItems: 'center',
        gap: 10,
    },
    generatingText: {
        fontSize: 13,
        color: PRIMARY,
        fontWeight: '500',
        marginTop: 4,
    },
    emptySteps: {
        padding: 40,
        alignItems: 'center',
        gap: 8,
    },
    noSteps: {
        textAlign: 'center',
        fontSize: 13,
        color: TEXT.tertiary,
    },

    // 全部完成
    allDoneCard: {
        alignItems: 'center',
        padding: 24,
        marginHorizontal: 16,
        marginTop: 8,
        borderRadius: 12,
        backgroundColor: `${SUCCESS}10`,
        borderWidth: 1,
        borderColor: `${SUCCESS}30`,
        gap: 6,
    },
    allDoneTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: SUCCESS,
    },
    allDoneDesc: {
        fontSize: 13,
        color: TEXT.secondary,
        textAlign: 'center',
    },

    // 底部语音按钮
    voiceBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 12,
        backgroundColor: BACKGROUND.card,
        borderTopWidth: 0.5,
        borderTopColor: BORDER.light,
    },
    voiceAgentInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    voiceAgentName: {
        fontSize: 14,
        fontWeight: '500',
        color: TEXT.secondary,
    },
    voiceBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 22,
        backgroundColor: PRIMARY,
    },
    voiceBtnText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#fff',
    },
});

export default ServiceEventDetail;
