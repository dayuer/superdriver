/**
 * useServiceEvents — 服务事件数据管理 Hook
 *
 * 管理事件列表的加载、刷新、筛选和详情展开状态。
 * 新增：选中事件后如果步骤为空，自动触发 AI 步骤生成。
 */
import { useState, useCallback, useEffect, useRef } from 'react';
import { ServiceEvent, ServiceStep } from '../types';
import {
    getServiceEvents,
    getServiceEventDetail,
    markStepDone as apiMarkStepDone,
    generateSteps,
} from '../services/service-api';
import { fetchWithCache } from '../services/cache';

export type ServiceFilter = 'all' | 'active' | 'closed';

interface UseServiceEventsReturn {
    events: ServiceEvent[];
    isLoading: boolean;
    isRefreshing: boolean;
    filter: ServiceFilter;
    setFilter: (f: ServiceFilter) => void;
    refresh: () => Promise<void>;
    loadMore: () => Promise<void>;
    hasMore: boolean;

    // 详情
    selectedEvent: ServiceEvent | null;
    selectedSteps: ServiceStep[];
    isDetailLoading: boolean;
    isGeneratingSteps: boolean; // AI 正在生成步骤
    selectEvent: (event: ServiceEvent) => void;
    closeDetail: () => void;
    markStepDone: (stepId: number) => Promise<void>;
    refreshDetail: () => Promise<void>; // 手动刷新详情
}

export function useServiceEvents(): UseServiceEventsReturn {
    const [events, setEvents] = useState<ServiceEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [filter, setFilter] = useState<ServiceFilter>('all');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    // 详情状态
    const [selectedEvent, setSelectedEvent] = useState<ServiceEvent | null>(null);
    const [selectedSteps, setSelectedSteps] = useState<ServiceStep[]>([]);
    const [isDetailLoading, setIsDetailLoading] = useState(false);
    const [isGeneratingSteps, setIsGeneratingSteps] = useState(false);

    const isMounted = useRef(true);
    useEffect(() => () => { isMounted.current = false; }, []);

    // 加载事件列表（首页使用缓存加速，翻页不缓存）
    const loadEvents = useCallback(async (pageNum: number, append = false) => {
        const statusFilter = filter === 'active'
            ? ['consulting', 'evidence_collecting', 'negotiating', 'filing', 'litigation',
                'reported', 'assessing', 'approved', 'paid', 'active', 'denied', 'appealing']
            : filter === 'closed'
                ? ['closed']
                : undefined;

        const fetchFn = () => getServiceEvents({
            status: statusFilter,
            page: pageNum,
            pageSize: 20,
        });

        // 首页使用 1 分钟缓存加速首屏，翻页 / 刷新直接请求
        const result = append
            ? await fetchFn()
            : await fetchWithCache(
                `service_events_${filter}_p${pageNum}`,
                fetchFn,
                { ttl: 60 * 1000 },
            );

        if (!isMounted.current) return;

        if (append) {
            setEvents(prev => [...prev, ...result.events]);
        } else {
            setEvents(result.events);
        }
        setHasMore(result.events.length >= 20);
        setPage(pageNum);
    }, [filter]);

    // 初始加载 + 筛选变化时重新加载
    useEffect(() => {
        setIsLoading(true);
        loadEvents(1).finally(() => {
            if (isMounted.current) setIsLoading(false);
        });
    }, [loadEvents]);

    // 下拉刷新 — 强制跳过缓存
    const refresh = useCallback(async () => {
        setIsRefreshing(true);
        const statusFilter = filter === 'active'
            ? ['consulting', 'evidence_collecting', 'negotiating', 'filing', 'litigation',
                'reported', 'assessing', 'approved', 'paid', 'active', 'denied', 'appealing']
            : filter === 'closed'
                ? ['closed']
                : undefined;
        try {
            const result = await getServiceEvents({ status: statusFilter, page: 1, pageSize: 20 });
            if (isMounted.current) {
                setEvents(result.events);
                setHasMore(result.events.length >= 20);
                setPage(1);
            }
        } finally {
            if (isMounted.current) setIsRefreshing(false);
        }
    }, [filter]);

    // 加载更多
    const loadMore = useCallback(async () => {
        if (!hasMore) return;
        await loadEvents(page + 1, true);
    }, [hasMore, page, loadEvents]);

    // 选择事件 → 加载详情 → 如果无步骤则自动生成
    const selectEvent = useCallback(async (event: ServiceEvent) => {
        setSelectedEvent(event);
        setIsDetailLoading(true);
        setSelectedSteps([]);
        setIsGeneratingSteps(false);

        try {
            const detail = await getServiceEventDetail(event.id);
            if (!isMounted.current) return;

            if (detail) {
                setSelectedEvent(detail.event);
                setSelectedSteps(detail.steps);
            }
            setIsDetailLoading(false);

            // 如果步骤为空 → 自动触发 AI 生成
            const steps = detail?.steps ?? [];
            if (steps.length === 0) {
                setIsGeneratingSteps(true);
                if (__DEV__) console.log(`[事件] ${event.id} 无步骤, 触发 AI 生成...`);

                const generated = await generateSteps(event.id);
                if (!isMounted.current) return;

                if (generated.length > 0) {
                    const refreshed = await getServiceEventDetail(event.id);
                    if (!isMounted.current) return;
                    if (refreshed) {
                        setSelectedEvent(refreshed.event);
                        setSelectedSteps(refreshed.steps);
                    }
                }
                setIsGeneratingSteps(false);
            }
        } catch (e) {
            // [m-04 修复] async callback 必须有 try/catch
            console.warn('[ServiceEvents] selectEvent failed:', e);
            if (isMounted.current) {
                setIsDetailLoading(false);
                setIsGeneratingSteps(false);
            }
        }
    }, []);

    // 关闭详情
    const closeDetail = useCallback(() => {
        setSelectedEvent(null);
        setSelectedSteps([]);
        setIsGeneratingSteps(false);
    }, []);

    // 标记步骤完成 → 乐观更新 → 后台刷新（获取 Agent 引导消息）
    const markStepDone = useCallback(async (stepId: number) => {
        const result = await apiMarkStepDone(stepId);
        if (!result.success || !selectedEvent) return;

        // 乐观更新：立即标记步骤完成
        setSelectedSteps(prev =>
            prev.map(s => s.id === stepId
                ? { ...s, is_done: 1, done_at: Date.now() }
                : s
            )
        );

        // 乐观更新：进度 +1
        setSelectedEvent(prev => prev ? {
            ...prev,
            completed_steps: prev.completed_steps + 1,
        } : null);

        // 同步列表中的事件进度
        setEvents(prev =>
            prev.map(ev => ev.id === selectedEvent.id
                ? { ...ev, completed_steps: ev.completed_steps + 1 }
                : ev
            )
        );

        // 延迟刷新详情：等待后端 Agent 引导消息生成（异步 LLM 调用约 2-5 秒）
        setTimeout(async () => {
            if (!isMounted.current) return;
            const refreshed = await getServiceEventDetail(selectedEvent.id);
            if (!isMounted.current || !refreshed) return;

            setSelectedEvent(refreshed.event);
            setSelectedSteps(refreshed.steps);

            // 如果事件已关闭，更新列表
            if (refreshed.event.status === 'closed') {
                setEvents(prev =>
                    prev.map(ev => ev.id === selectedEvent.id
                        ? { ...ev, status: 'closed' }
                        : ev
                    )
                );
            }
        }, 3000);
    }, [selectedEvent]);

    // 手动刷新当前详情
    const refreshDetail = useCallback(async () => {
        if (!selectedEvent) return;
        const detail = await getServiceEventDetail(selectedEvent.id);
        if (!isMounted.current || !detail) return;
        setSelectedEvent(detail.event);
        setSelectedSteps(detail.steps);
    }, [selectedEvent]);

    return {
        events,
        isLoading,
        isRefreshing,
        filter,
        setFilter,
        refresh,
        loadMore,
        hasMore,
        selectedEvent,
        selectedSteps,
        isDetailLoading,
        isGeneratingSteps,
        selectEvent,
        closeDetail,
        markStepDone,
        refreshDetail,
    };
}
