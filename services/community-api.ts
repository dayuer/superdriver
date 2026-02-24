/**
 * 社区帖子 API 服务
 *
 * 从 fixall/services/api.ts 迁移，适配 superdriver 架构。
 * 复用主 api 实例（含 auth token + 签名拦截器）。
 *
 * API 路由: /api/community/posts, /api/community/interactions
 */

import api from './api';
import { formatRelativeTime } from '../utils/formatters';

// [M-03 修复] 保持向后兼容导出
export { formatRelativeTime };

// ============================================================================
// Types — 帖子
// ============================================================================

/** 后端 API 返回的帖子数据 (经 parsePost 转换后的驼峰格式) */
export interface CommunityPostRaw {
    id: number;
    userId: number;
    rootId: number | null;
    parentId: number | null;
    depth: number;
    postType: string | null;
    title: string | null;
    content: string;
    images: string[] | null;
    tag: string | null;
    tagColor: string | null;
    tagBg: string | null;
    reward: number | null;
    rewardStatus: string | null;
    isAccepted: boolean;
    isAIClone: boolean;
    matchScore: number | null;
    matchedTips: string[] | null;
    knowledgeSource: string | null;
    replyCount: number;
    likeCount: number;
    viewCount: number;
    authorName: string | null;
    authorAvatar: string | null;
    authorLevel: string | null;
    createdAt: string;
    updatedAt: string;
}

interface PostsResponse {
    posts: CommunityPostRaw[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

interface PostDetailResponse {
    post: CommunityPostRaw;
}

// ============================================================================
// Types — 互动
// ============================================================================

export type InteractionType = 'like' | 'bookmark' | 'report';

export interface InteractionStatus {
    postId: number;
    liked: boolean;
    bookmarked: boolean;
    reported: boolean;
}

export interface ToggleResult {
    action: 'created' | 'removed';
    type: InteractionType;
    postId: number;
    message: string;
}

// ============================================================================
// Types — 前端展示
// ============================================================================

/** 信息流帖子卡片 */
export interface FeedPost {
    id: string;
    type: 'help' | 'exclusive' | 'warning';
    tag: string;
    tagColor: string;
    tagBg: string;
    title: string;
    desc: string;
    author: string;
    authorId?: string;
    reward?: string;
    aiLevel?: string;
    time: string;
    replies: number;
    likes: number;
}

/** 回复项 */
export interface ReplyItem {
    id: string;
    author: string;
    avatar: string;
    level: string;
    levelColor: string;
    content: string;
    time: string;
    likes: number;
    isAccepted: boolean;
    images: string[];
    isAIClone: boolean;
    matchScore?: number;
    matchedTips?: string[];
    knowledgeSource?: string;
}

// ============================================================================
// 辅助函数
// ============================================================================

/** 解析标准 API { success, data } 响应 */
const unwrapResponse = <T>(response: { success?: boolean; data?: T } | T): T => {
    if (response && typeof response === 'object' && 'data' in response && 'success' in response) {
        return response.data as T;
    }
    return response as T;
};

// ============================================================================
// 数据映射: 后端 → 前端
// ============================================================================

/** 后端帖子 → 前端信息流卡片 */
export function mapToFeedPost(raw: CommunityPostRaw): FeedPost {
    return {
        id: String(raw.id),
        type: (raw.postType || 'help') as FeedPost['type'],
        tag: raw.tag || '',
        tagColor: raw.tagColor || '#8E8E93',
        tagBg: raw.tagBg || '#8E8E9320',
        title: raw.title || '',
        desc: raw.content?.substring(0, 100) || '',
        author: raw.authorName || '匿名',
        authorId: raw.userId ? String(raw.userId) : undefined,
        reward: raw.reward ? `悬赏 ${raw.reward} 积分` : undefined,
        aiLevel: raw.isAIClone ? raw.authorLevel || undefined : undefined,
        time: formatRelativeTime(raw.createdAt),
        replies: raw.replyCount || 0,
        likes: raw.likeCount || 0,
    };
}

const LEVEL_COLORS: Record<string, string> = {
    'Lv.1': '#8E8E93', 'Lv.2': '#8E8E93',
    'Lv.3': '#5856D6', 'Lv.4': '#007AFF',
    'Lv.5': '#007AFF', 'Lv.6': '#34C759',
    'Lv.7': '#FF9500', 'Lv.8': '#FF6B35',
    'Lv.9': '#FF3B30', '官方': '#34C759',
};

/** 后端帖子 → 前端回复项 */
export function mapToReplyItem(raw: CommunityPostRaw): ReplyItem {
    return {
        id: String(raw.id),
        author: raw.authorName || '匿名',
        avatar: raw.authorAvatar || '👤',
        level: raw.authorLevel || '',
        levelColor: LEVEL_COLORS[raw.authorLevel || ''] || '#8E8E93',
        content: raw.content || '',
        time: formatRelativeTime(raw.createdAt),
        likes: raw.likeCount || 0,
        isAccepted: !!raw.isAccepted,
        images: raw.images || [],
        isAIClone: !!raw.isAIClone,
        matchScore: raw.matchScore ?? undefined,
        matchedTips: raw.matchedTips ?? undefined,
        knowledgeSource: raw.knowledgeSource ?? undefined,
    };
}

// ============================================================================
// 帖子 API
// ============================================================================

/** 获取帖子信息流 (depth=0) */
export async function getFeedPosts(options?: {
    page?: number;
    limit?: number;
    type?: string;
}): Promise<PostsResponse> {
    const params: Record<string, string | number> = {};
    if (options?.page) params.page = options.page;
    if (options?.limit) params.limit = options.limit;
    if (options?.type) params.type = options.type;

    const res = await api.get<PostsResponse>('/community/posts', { params });
    return unwrapResponse(res.data);
}

/** 获取帖子详情 */
export async function getPostDetail(postId: number | string): Promise<PostDetailResponse> {
    const res = await api.get<PostDetailResponse>('/community/posts', {
        params: { id: postId },
    });
    return unwrapResponse(res.data);
}

/** 获取帖子的讨论树 */
export async function getDiscussionTree(rootId: number | string): Promise<PostsResponse> {
    const res = await api.get<PostsResponse>('/community/posts', {
        params: { rootId },
    });
    return unwrapResponse(res.data);
}

/** 发帖/回复 */
export async function createPost(data: {
    content: string;
    title?: string;
    parentId?: number | null;
    postType?: string;
    images?: string[];
    tag?: string;
    tagColor?: string;
    tagBg?: string;
    reward?: number;
    isAnonymous?: boolean;
    authorName?: string;
    authorAvatar?: string;
    authorLevel?: string;
}): Promise<{ post: CommunityPostRaw; message: string; pointsCharged: boolean }> {
    const res = await api.post('/community/posts', data);
    return unwrapResponse(res.data);
}

/** 编辑帖子 */
export async function updatePost(
    postId: number | string,
    data: { content?: string; title?: string },
): Promise<{ post: CommunityPostRaw }> {
    const res = await api.patch('/community/posts', { postId, ...data });
    return unwrapResponse(res.data);
}

/** 采纳答案 */
export async function acceptAnswer(postId: number | string): Promise<{ message: string }> {
    const res = await api.patch('/community/posts', { postId, action: 'accept' });
    return unwrapResponse(res.data);
}

/** 删除帖子 (软删除) */
export async function deletePost(postId: number | string): Promise<{ message: string }> {
    const res = await api.delete('/community/posts', { params: { id: postId } });
    return unwrapResponse(res.data);
}

// ============================================================================
// 互动 API
// ============================================================================

/** 查询某帖子的互动状态 */
export async function getInteractionStatus(postId: number | string): Promise<InteractionStatus> {
    const res = await api.get<InteractionStatus>('/community/interactions', {
        params: { postId },
    });
    return unwrapResponse(res.data);
}

/** Toggle 互动 (赞/收藏/举报) — 存在则取消, 不存在则创建 */
export async function toggleInteraction(
    postId: number | string,
    type: InteractionType,
): Promise<ToggleResult> {
    const res = await api.post<ToggleResult>('/community/interactions', {
        postId: Number(postId),
        type,
    });
    return unwrapResponse(res.data);
}

/** 获取收藏/点赞列表 */
export async function getInteractionList(
    listType: InteractionType,
    options?: { page?: number; limit?: number },
): Promise<{
    interactions: { id: number; userId: number; postId: number; type: string; createdAt: string }[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
}> {
    const params: Record<string, string | number> = { list: listType };
    if (options?.page) params.page = options.page;
    if (options?.limit) params.limit = options.limit;

    const res = await api.get('/community/interactions', { params });
    return unwrapResponse(res.data);
}
