/**
 * MUD 帖子卡片
 *
 * 武侠风格帖子展示，支持 MUD 版本 / 原文一键切换 (AC-2.3)。
 *
 * @alpha: AC-2.3
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MudActionBar from './MudActionBar';

// ============================================================================
// 类型
// ============================================================================

export interface MudPost {
    id: string;
    author: string;
    rank: string;
    profession: string;
    originalContent: string;
    mudContent: string | null;  // AI 转译后的武侠版
    time: string;
    likeCount: number;
    replyCount: number;
}

// ============================================================================
// 组件
// ============================================================================

interface Props {
    post: MudPost;
    onReply?: (postId: string) => void;
    onLike?: (postId: string) => void;
}

export default function MudPostCard({ post, onReply, onLike }: Props) {
    const [showOriginal, setShowOriginal] = useState(false);

    const displayContent = showOriginal || !post.mudContent
        ? post.originalContent
        : post.mudContent;

    const profEmoji = {
        night_escort: '🌙',
        iron_rider: '🐎',
        swift_runner: '⚡',
    }[post.profession] || '⚔️';

    const profName = {
        night_escort: '镖师',
        iron_rider: '铁骑',
        swift_runner: '神行',
    }[post.profession] || '游侠';

    return (
        <View style={s.card}>
            {/* 头部 */}
            <View style={s.header}>
                <Text style={s.avatar}>{profEmoji}</Text>
                <View style={{ flex: 1 }}>
                    <View style={s.nameRow}>
                        <Text style={s.name}>{post.author}</Text>
                        <View style={s.rankBadge}>
                            <Text style={s.rankText}>{post.rank}</Text>
                        </View>
                    </View>
                    <Text style={s.meta}>{profName} · {post.time}</Text>
                </View>

                {/* MUD/原文切换 (AC-2.3) */}
                {post.mudContent && (
                    <TouchableOpacity
                        style={[s.switchBtn, showOriginal && s.switchBtnActive]}
                        onPress={() => setShowOriginal(!showOriginal)}
                    >
                        <Text style={s.switchText}>
                            {showOriginal ? '🏮 武侠' : '📝 原文'}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* 内容 */}
            <Text style={s.content}>{displayContent}</Text>

            {/* MUD 动作栏 (AC-3.1) */}
            <MudActionBar
                postId={post.id}
                likeCount={post.likeCount}
                replyCount={post.replyCount}
                onLike={onLike}
                onReply={onReply}
            />
        </View>
    );
}

// ============================================================================
// 样式
// ============================================================================

const s = StyleSheet.create({
    card: {
        backgroundColor: '#1A1A2E',
        borderRadius: 16,
        padding: 16,
        marginHorizontal: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
    },
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    avatar: { fontSize: 28, marginRight: 10 },
    nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    name: { fontSize: 15, fontWeight: '700', color: '#FFF' },
    rankBadge: {
        backgroundColor: 'rgba(88,86,214,0.15)',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
    },
    rankText: { fontSize: 10, color: '#5856D6', fontWeight: '600' },
    meta: { fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 },
    switchBtn: {
        backgroundColor: 'rgba(255,255,255,0.08)',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
    },
    switchBtnActive: { backgroundColor: 'rgba(88,86,214,0.2)' },
    switchText: { fontSize: 11, color: 'rgba(255,255,255,0.7)' },
    content: {
        fontSize: 15,
        color: 'rgba(255,255,255,0.85)',
        lineHeight: 22,
        marginBottom: 12,
    },
});
