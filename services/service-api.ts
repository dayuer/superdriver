/**
 * service-api.ts — 服务事件 API 封装
 *
 * [C-02 修复] 复用主 api 实例（已含 auth token 拦截器），
 * 封装服务事件/步骤的前端 API 调用。
 */
import api from './api';
import { ServiceEvent, ServiceStep } from '../types';

// ============================================================================
// 服务事件
// ============================================================================

/** 获取当前用户的服务事件列表 */
export async function getServiceEvents(params: {
    status?: string[];
    eventType?: string;
    page?: number;
    pageSize?: number;
} = {}): Promise<{ events: ServiceEvent[]; total: number }> {
    try {
        const queryParams: Record<string, string | number> = {};
        if (params.status && params.status.length > 0) {
            queryParams.status = params.status.join(',');
        }
        if (params.eventType) queryParams.eventType = params.eventType;
        if (params.page) queryParams.page = params.page;
        if (params.pageSize) queryParams.pageSize = params.pageSize;

        const { data } = await api.get('/service/events', { params: queryParams });
        return data.data ?? { events: [], total: 0 };
    } catch (e) {
        console.warn('[ServiceAPI] getServiceEvents failed:', e);
        return { events: [], total: 0 };
    }
}

/** 获取单个事件详情（含步骤） */
export async function getServiceEventDetail(eventId: number): Promise<{
    event: ServiceEvent;
    steps: ServiceStep[];
} | null> {
    try {
        const { data } = await api.get(`/service/events/${eventId}`);
        return data.data ?? null;
    } catch {
        console.warn('[ServiceAPI] getServiceEventDetail failed');
        return null;
    }
}

/** 获取事件的步骤列表 */
export async function getServiceSteps(eventId: number): Promise<ServiceStep[]> {
    try {
        const { data } = await api.get(`/service/events/${eventId}/steps`);
        return data.data?.steps ?? [];
    } catch {
        console.warn('[ServiceAPI] getServiceSteps failed');
        return [];
    }
}

/** 标记步骤完成 — 后端会自动推进下一步并生成 Agent 引导 */
export interface MarkStepDoneResult {
    success: boolean;
    eventClosed?: boolean;
    guidanceGenerated?: boolean;
}

export async function markStepDone(stepId: number): Promise<MarkStepDoneResult> {
    try {
        const { data } = await api.post(`/service/steps/${stepId}/done`);
        return {
            success: data.success ?? true,
            eventClosed: data.data?.eventClosed,
            guidanceGenerated: data.data?.guidanceGenerated,
        };
    } catch {
        console.warn('[ServiceAPI] markStepDone failed');
        return { success: false };
    }
}

/** 触发 AI 生成步骤 */
export async function generateSteps(eventId: number): Promise<ServiceStep[]> {
    try {
        const { data } = await api.post(`/service/events/${eventId}/generate-steps`, {}, {
            timeout: 60000, // R1 可能需要更长时间
        });
        return data.data?.steps ?? [];
    } catch (e) {
        console.warn('[ServiceAPI] generateSteps failed:', e);
        return [];
    }
}

/** 更新事件状态 */
export async function updateEventStatus(eventId: number, status: string): Promise<boolean> {
    try {
        await api.patch(`/service/events/${eventId}/status`, { status });
        return true;
    } catch {
        console.warn('[ServiceAPI] updateEventStatus failed');
        return false;
    }
}
