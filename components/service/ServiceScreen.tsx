/**
 * ServiceScreen — 服务 Tab 主入口
 *
 * 展示服务事件列表，点击进入详情（含内嵌对话）。
 * 支持从首页创建事件后自动打开详情。
 */
import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Agent } from '../../types';
import { useServiceEvents } from '../../hooks/useServiceEvents';
import { ServiceEventList } from './ServiceEventList';
import { ServiceEventDetail } from './ServiceEventDetail';
import { TEXT, BACKGROUND, BORDER } from '../../styles/colors';

interface Props {
    agentsMap?: Record<string, Agent>;
    /** 从首页创建服务后传入的事件 ID，自动打开详情 */
    pendingEventId?: number | null;
    /** 消费 pendingEventId 后的回调 */
    onPendingConsumed?: () => void;
    /** 语音录音入口 */
    onVoicePress?: () => void;
}

export const ServiceScreen: React.FC<Props> = ({
    agentsMap = {},
    pendingEventId,
    onPendingConsumed,
    onVoicePress,
}) => {
    const insets = useSafeAreaInsets();
    const svc = useServiceEvents();

    // 首页创建事件后，自动刷新列表并打开详情
    useEffect(() => {
        if (pendingEventId != null) {
            // 先刷新列表
            svc.refresh().then(() => {
                // 在刷新后的列表中找到该事件
                // selectEvent 会自动加载详情
                const event = svc.events.find(e => e.id === pendingEventId);
                if (event) {
                    svc.selectEvent(event);
                } else {
                    // 列表还没加载完，创建一个临时事件对象供展开
                    svc.selectEvent({
                        id: pendingEventId,
                        user_id: 0,
                        title: '创建中...',
                        event_type: 'compound',
                        status: 'consulting',
                        priority: 'normal',
                        total_steps: 0,
                        completed_steps: 0,
                        expert_role_ids: '[]',
                        primary_role_id: 'general',
                        summary: '',
                        createdAt: new Date().toISOString(),
                    });
                }
                onPendingConsumed?.();
            });
        }
    }, [pendingEventId]);

    // 如果选中了事件 → 显示详情
    if (svc.selectedEvent) {
        return (
            <ServiceEventDetail
                event={svc.selectedEvent}
                steps={svc.selectedSteps}
                isLoading={svc.isDetailLoading}
                isGeneratingSteps={svc.isGeneratingSteps}
                agentsMap={agentsMap}
                onBack={() => {
                    svc.closeDetail();
                    svc.refresh(); // 返回时刷新列表
                }}
                onMarkStepDone={svc.markStepDone}
                onVoicePress={onVoicePress}
            />
        );
    }

    // 列表视图
    return (
        <View style={styles.container}>
            {/* Header — 与详情页一致的导航栏风格 */}
            <View style={[styles.header, { paddingTop: insets.top }]}>
                <Text style={styles.headerTitle}>服务跟进</Text>
                <Text style={styles.headerSubtitle}>
                    {svc.events.length > 0
                        ? `${svc.events.filter(e => e.status !== 'closed').length} 项进行中`
                        : '暂无跟进事项'}
                </Text>
            </View>

            <ServiceEventList
                events={svc.events}
                isLoading={svc.isLoading}
                isRefreshing={svc.isRefreshing}
                filter={svc.filter}
                onFilterChange={svc.setFilter}
                onEventPress={svc.selectEvent}
                onRefresh={svc.refresh}
                onLoadMore={svc.loadMore}
                agentsMap={agentsMap}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: BACKGROUND.primary,
    },
    header: {
        height: 44,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        backgroundColor: BACKGROUND.primary,
        borderBottomWidth: 0.5,
        borderBottomColor: BORDER.light,
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: TEXT.primary,
    },
    headerSubtitle: {
        fontSize: 13,
        color: TEXT.tertiary,
    },
});

export default ServiceScreen;

