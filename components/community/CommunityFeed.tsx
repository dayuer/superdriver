/**
 * CommunityFeed — 社区信息流页面
 *
 * 展示帖子列表，支持:
 * - 下拉刷新
 * - 上拉加载更多
 * - 帖子类型筛选
 * - 点击进入详情
 * - 点赞 toggle (乐观更新)
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    RefreshControl,
    ActivityIndicator,
    Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PostCard from './PostCard';
import {
    getFeedPosts,
    mapToFeedPost,
    toggleInteraction,
    type FeedPost,
    type CommunityPostRaw,
} from '../../services/community-api';

interface CommunityFeedProps {
    /** 点击帖子时的回调 (postId) */
    onPostPress?: (postId: string) => void;
    /** 是否作为嵌入卡片显示 (限制高度, 只展示 2 条) */
    compact?: boolean;
}

// 类型筛选 Tab
const FILTER_TABS = [
    { key: 'all', label: '全部' },
    { key: 'help', label: '求助' },
    { key: 'exclusive', label: '独家' },
    { key: 'warning', label: '预警' },
] as const;

type FilterKey = typeof FILTER_TABS[number]['key'];

export default function CommunityFeed({ onPostPress, compact }: CommunityFeedProps) {
    const [posts, setPosts] = useState<FeedPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
    const pageRef = useRef(1);
    const hasMoreRef = useRef(true);

    // 加载帖子
    const loadPosts = useCallback(async (page: number, filter: FilterKey, append = false) => {
        try {
            const params: { page: number; limit: number; type?: string } = {
                page,
                limit: compact ? 3 : 20,
            };
            if (filter !== 'all') params.type = filter;

            const result = await getFeedPosts(params);
            const mapped = result.posts.map(mapToFeedPost);

            if (append) {
                setPosts(prev => [...prev, ...mapped]);
            } else {
                setPosts(mapped);
            }

            hasMoreRef.current = page < (result.pagination?.totalPages ?? 1);
        } catch (err) {
            if (__DEV__) console.warn('[CommunityFeed] 加载失败:', err);
        }
    }, [compact]);

    // 首次加载
    useEffect(() => {
        setLoading(true);
        pageRef.current = 1;
        loadPosts(1, activeFilter).finally(() => setLoading(false));
    }, [activeFilter, loadPosts]);

    // 下拉刷新
    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        pageRef.current = 1;
        await loadPosts(1, activeFilter);
        setRefreshing(false);
    }, [activeFilter, loadPosts]);

    // 上拉加载
    const handleLoadMore = useCallback(async () => {
        if (loadingMore || !hasMoreRef.current || compact) return;
        setLoadingMore(true);
        const nextPage = pageRef.current + 1;
        pageRef.current = nextPage;
        await loadPosts(nextPage, activeFilter, true);
        setLoadingMore(false);
    }, [activeFilter, loadingMore, compact, loadPosts]);

    // 点赞
    const handleLike = useCallback(async (postId: string) => {
        try {
            await toggleInteraction(postId, 'like');
        } catch (err) {
            if (__DEV__) console.warn('[CommunityFeed] 点赞失败:', err);
        }
    }, []);

    // ---- compact 模式: 仅展示卡片列表 ----
    if (compact) {
        if (loading) {
            return (
                <View style={styles.compactLoading}>
                    <ActivityIndicator size="small" color="#667eea" />
                </View>
            );
        }

        return (
            <View style={styles.compactContainer}>
                {posts.slice(0, 2).map(post => (
                    <PostCard
                        key={post.id}
                        post={post}
                        onPress={onPostPress}
                        onLike={handleLike}
                    />
                ))}
                {posts.length === 0 && (
                    <Text style={styles.emptyText}>暂无帖子</Text>
                )}
            </View>
        );
    }

    // ---- 完整页面模式 ----
    return (
        <View style={styles.container}>
            {/* 筛选栏 */}
            <View style={styles.filterBar}>
                {FILTER_TABS.map(tab => (
                    <Pressable
                        key={tab.key}
                        style={[
                            styles.filterTab,
                            activeFilter === tab.key && styles.filterTabActive,
                        ]}
                        onPress={() => setActiveFilter(tab.key)}
                    >
                        <Text
                            style={[
                                styles.filterLabel,
                                activeFilter === tab.key && styles.filterLabelActive,
                            ]}
                        >
                            {tab.label}
                        </Text>
                    </Pressable>
                ))}
            </View>

            {/* 帖子列表 */}
            <FlatList
                data={posts}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <PostCard
                        post={item}
                        onPress={onPostPress}
                        onLike={handleLike}
                    />
                )}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        tintColor="#667eea"
                    />
                }
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.3}
                ListEmptyComponent={
                    loading ? (
                        <View style={styles.loadingCenter}>
                            <ActivityIndicator size="large" color="#667eea" />
                        </View>
                    ) : (
                        <View style={styles.emptyCenter}>
                            <Ionicons name="chatbubbles-outline" size={48} color="#C7C7CC" />
                            <Text style={styles.emptyText}>暂无帖子，快来发第一帖吧</Text>
                        </View>
                    )
                }
                ListFooterComponent={
                    loadingMore ? (
                        <ActivityIndicator
                            style={styles.footerLoading}
                            size="small"
                            color="#667eea"
                        />
                    ) : null
                }
            />
        </View>
    );
}

// ============================================================================
// 样式
// ============================================================================

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F2F2F7',
    },
    filterBar: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 10,
        gap: 8,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#E5E5EA',
    },
    filterTab: {
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: '#F2F2F7',
    },
    filterTabActive: {
        backgroundColor: '#667eea',
    },
    filterLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#8E8E93',
    },
    filterLabelActive: {
        color: '#FFFFFF',
    },
    listContent: {
        padding: 16,
        paddingBottom: 32,
    },
    loadingCenter: {
        paddingVertical: 60,
        alignItems: 'center',
    },
    emptyCenter: {
        paddingVertical: 80,
        alignItems: 'center',
        gap: 12,
    },
    emptyText: {
        fontSize: 14,
        color: '#8E8E93',
        textAlign: 'center',
        paddingVertical: 16,
    },
    footerLoading: {
        paddingVertical: 16,
    },
    // compact 模式
    compactContainer: {
        gap: 0,
    },
    compactLoading: {
        paddingVertical: 20,
        alignItems: 'center',
    },
});
