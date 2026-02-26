/**
 * MUD 传闻流主屏
 *
 * 整合: 免责声明 + 玩家档案 + 帖子流 + 首次引导
 *
 * @alpha: P0 主屏
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    FlatList,
    StyleSheet,
    RefreshControl,
    ActivityIndicator,
    Text,
} from 'react-native';
import MudOnboarding from './MudOnboarding';
import MudDisclaimer from './MudDisclaimer';
import MudPlayerProfile from './MudPlayerProfile';
import MudPostCard, { type MudPost } from './MudPostCard';
import MudBroadcast from './MudBroadcast';
import { getMudProfile, type MudProfile } from '../../services/mud-api';
import { getFeedPosts, mapToFeedPost } from '../../services/community-api';
import { formatRelativeTime } from '../../utils/formatters';

export default function MudFeedScreen() {
    const [profile, setProfile] = useState<MudProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [posts, setPosts] = useState<MudPost[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [needsOnboarding, setNeedsOnboarding] = useState(false);

    // 初始化: 检查档案
    useEffect(() => {
        (async () => {
            const p = await getMudProfile();
            if (!p) {
                setNeedsOnboarding(true);
            } else {
                setProfile(p);
                await loadPosts();
            }
            setLoading(false);
        })();
    }, []);

    const loadPosts = useCallback(async () => {
        try {
            const res = await getFeedPosts({ limit: 20 });
            const mapped: MudPost[] = res.posts.map((raw) => ({
                id: String(raw.id),
                author: raw.authorName || '匿名游侠',
                rank: raw.authorLevel || '江湖新秀',
                profession: 'swift_runner', // @beta: 从后端档案获取
                originalContent: raw.content,
                mudContent: (raw as any).mudContent || null,
                time: formatRelativeTime(raw.createdAt),
                likeCount: raw.likeCount,
                replyCount: raw.replyCount,
            }));
            setPosts(mapped);
        } catch (error) {
            console.error('[MudFeed] loadPosts', error);
        }
    }, []);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        const p = await getMudProfile();
        if (p) setProfile(p);
        await loadPosts();
        setRefreshing(false);
    }, [loadPosts]);

    const handleOnboardingComplete = useCallback((p: MudProfile) => {
        setProfile(p);
        setNeedsOnboarding(false);
        loadPosts();
    }, [loadPosts]);

    // ---- Loading ----
    if (loading) {
        return (
            <View style={s.center}>
                <ActivityIndicator size="large" color="#5856D6" />
                <Text style={s.loadingText}>踏入江湖中...</Text>
            </View>
        );
    }

    // ---- 首次引导 ----
    if (needsOnboarding) {
        return <MudOnboarding onComplete={handleOnboardingComplete} />;
    }

    // ---- 主界面 ----
    return (
        <View style={s.container}>
            <FlatList
                data={posts}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <MudPostCard post={item} />}
                ListHeaderComponent={
                    <>
                        <MudBroadcast />
                        <MudDisclaimer />
                        {profile && <MudPlayerProfile profile={profile} />}
                    </>
                }
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#5856D6"
                    />
                }
                contentContainerStyle={s.list}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0A0A1A' },
    center: { flex: 1, backgroundColor: '#0A0A1A', justifyContent: 'center', alignItems: 'center' },
    loadingText: { color: 'rgba(255,255,255,0.4)', fontSize: 14, marginTop: 12 },
    list: { paddingTop: 12, paddingBottom: 80 },
});
