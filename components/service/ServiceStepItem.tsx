/**
 * ServiceStepItem — 服务步骤组件 (时间线样式)
 */
import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ServiceStep, Agent } from '../../types';
import { AgentAvatar } from '../AgentAvatar';
import { TEXT, BORDER, PRIMARY, SUCCESS } from '../../styles/colors';

const STEP_TYPE_ICONS: Record<number, string> = {
    1: 'analytics-outline',   // analysis
    2: 'flash-outline',       // action
    3: 'document-text-outline', // document
    4: 'checkmark-done-outline', // summary
};

interface Props {
    step: ServiceStep;
    isCurrent: boolean;      // 当前进行中的步骤
    isLast: boolean;
    isJustCompleted?: boolean; // 刚完成（用于动画反馈）
    agentsMap?: Record<string, Agent>;
    onMarkDone?: (stepId: number) => void;
}

export const ServiceStepItem: React.FC<Props> = ({
    step,
    isCurrent,
    isLast,
    isJustCompleted = false,
    agentsMap = {},
    onMarkDone,
}) => {
    const isDone = !!step.is_done; // 兼容 boolean(true) 和 number(1)
    const isPending = !isDone && !isCurrent;
    const agent = agentsMap[step.role_id];
    const icon = STEP_TYPE_ICONS[step.step_type] ?? 'ellipse-outline';

    // 动画：刚完成的步骤闪烁确认
    const flashAnim = useRef(new Animated.Value(0)).current;
    // 动画：当前步骤边框脉冲
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (isJustCompleted) {
            Animated.sequence([
                Animated.timing(flashAnim, { toValue: 1, duration: 300, useNativeDriver: false }),
                Animated.timing(flashAnim, { toValue: 0, duration: 600, useNativeDriver: false }),
            ]).start();
        }
    }, [isJustCompleted, flashAnim]);

    useEffect(() => {
        if (isCurrent) {
            const pulse = Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, { toValue: 1.05, duration: 1000, useNativeDriver: true }),
                    Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
                ])
            );
            pulse.start();
            return () => pulse.stop();
        }
    }, [isCurrent, pulseAnim]);

    const flashBg = flashAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['transparent', `${SUCCESS}25`],
    });

    // 时间格式
    const timeStr = step.done_at
        ? formatShortTime(step.done_at)
        : isCurrent
        ? '进行中'
        : '待办';

    return (
        <View style={styles.container}>
            {/* 时间线 */}
            <View style={styles.timeline}>
                <View style={[
                    styles.dot,
                    isDone && styles.dotDone,
                    isCurrent && styles.dotCurrent,
                    isPending && styles.dotPending,
                ]}>
                    {isDone ? (
                        <Ionicons name="checkmark" size={12} color="#fff" />
                    ) : isCurrent ? (
                        <Ionicons name="flash" size={10} color="#fff" />
                    ) : (
                        <Text style={styles.dotNumber}>{step.sort_order}</Text>
                    )}
                </View>
                {!isLast && (
                    <View style={[
                        styles.line,
                        isDone && styles.lineDone,
                    ]} />
                )}
            </View>

            {/* 内容 */}
            <Animated.View style={[
                styles.content,
                isCurrent && styles.contentCurrent,
                isPending && styles.contentPending,
                isJustCompleted && { backgroundColor: flashBg },
                isCurrent && { transform: [{ scale: pulseAnim }] },
            ]}>
                {/* 标题行 */}
                <View style={styles.titleRow}>
                    <Ionicons
                        name={icon as keyof typeof Ionicons.glyphMap}
                        size={16}
                        color={isDone ? SUCCESS : isCurrent ? PRIMARY : '#999'}
                    />
                    <Text style={[
                        styles.title,
                        isDone && styles.titleDone,
                        isPending && styles.titlePending,
                    ]} numberOfLines={1}>
                        {step.title}
                    </Text>
                </View>

                {/* 描述 */}
                {step.content ? (
                    <Text
                        style={[styles.description, isDone && styles.descDone]}
                        numberOfLines={isCurrent ? 3 : 2}
                    >
                        {step.content}
                    </Text>
                ) : null}

                {/* 底部信息 */}
                <View style={styles.meta}>
                    {agent && (
                        <View style={styles.agentInfo}>
                            <AgentAvatar avatar={agent.avatar} size={16} />
                            <Text style={styles.agentName}>{agent.name}</Text>
                        </View>
                    )}
                    <Text style={styles.time}>{timeStr}</Text>

                    {/* 当前步骤 — 可标记完成 */}
                    {isCurrent && onMarkDone && (
                        <TouchableOpacity
                            style={styles.doneBtn}
                            onPress={() => onMarkDone(step.id)}
                        >
                            <Ionicons name="checkmark-circle-outline" size={14} color={SUCCESS} />
                            <Text style={styles.doneBtnText}>完成</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </Animated.View>
        </View>
    );
};

function formatShortTime(ts: number | string): string {
    const d = typeof ts === 'number' ? new Date(ts) : new Date(ts);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return '刚刚';
    if (mins < 60) return `${mins}分钟前`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}小时前`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}天前`;
    return `${(d.getMonth() + 1)}/${d.getDate()}`;
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        paddingHorizontal: 16,
    },
    // 时间线
    timeline: {
        width: 28,
        alignItems: 'center',
    },
    dot: {
        width: 22,
        height: 22,
        borderRadius: 11,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#E5E5EA',
        zIndex: 1,
    },
    dotDone: { backgroundColor: SUCCESS },
    dotCurrent: { backgroundColor: PRIMARY },
    dotPending: { backgroundColor: '#E5E5EA' },
    dotNumber: { fontSize: 10, fontWeight: '600', color: '#8E8E93' },
    line: {
        width: 2,
        flex: 1,
        backgroundColor: '#E5E5EA',
        marginVertical: 2,
    },
    lineDone: { backgroundColor: SUCCESS + '60' },

    // 内容
    content: {
        flex: 1,
        marginLeft: 10,
        marginBottom: 16,
        paddingBottom: 4,
    },
    contentCurrent: {
        backgroundColor: `${PRIMARY}08`,
        borderRadius: 10,
        padding: 10,
        marginBottom: 12,
        borderLeftWidth: 2,
        borderLeftColor: PRIMARY,
    },
    contentPending: { opacity: 0.75 },

    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 4,
    },
    title: {
        flex: 1,
        fontSize: 14,
        fontWeight: '600',
        color: TEXT.primary,
    },
    titleDone: { color: TEXT.secondary },
    titlePending: { color: TEXT.secondary },

    description: {
        fontSize: 13,
        color: TEXT.secondary,
        lineHeight: 18,
        marginBottom: 6,
    },
    descDone: { color: TEXT.tertiary },

    meta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    agentInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    agentName: {
        fontSize: 11,
        color: TEXT.tertiary,
        fontWeight: '500',
    },
    time: {
        fontSize: 11,
        color: TEXT.tertiary,
    },
    doneBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        marginLeft: 'auto',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
        backgroundColor: `${SUCCESS}15`,
    },
    doneBtnText: {
        fontSize: 11,
        fontWeight: '600',
        color: SUCCESS,
    },
});

export default ServiceStepItem;
