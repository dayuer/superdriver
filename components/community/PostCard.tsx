/**
 * PostCard — 社区帖子卡片组件
 *
 * 展示: 作者头像/名字、帖子标题/摘要、标签、互动按钮(赞/评论)
 * 交互: 点击进入详情、点赞 toggle
 */
import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { FeedPost } from '../../services/community-api';

interface PostCardProps {
    post: FeedPost;
    onPress?: (postId: string) => void;
    onLike?: (postId: string) => void;
}

/** 帖子类型 → 图标颜色 */
const TYPE_COLORS: Record<string, string> = {
    help: '#FF9500',
    exclusive: '#5856D6',
    warning: '#FF3B30',
};

export default function PostCard({ post, onPress, onLike }: PostCardProps) {
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(post.likes);

    const handleLike = useCallback(() => {
        const next = !liked;
        setLiked(next);
        setLikeCount(prev => prev + (next ? 1 : -1));
        onLike?.(post.id);
    }, [liked, post.id, onLike]);

    return (
        <Pressable
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            onPress={() => onPress?.(post.id)}
        >
            {/* 标签 */}
            {post.tag ? (
                <View style={[styles.tagBadge, { backgroundColor: post.tagBg }]}>
                    <Text style={[styles.tagText, { color: post.tagColor }]}>{post.tag}</Text>
                </View>
            ) : null}

            {/* 标题 */}
            {post.title ? (
                <Text style={styles.title} numberOfLines={2}>{post.title}</Text>
            ) : null}

            {/* 摘要 */}
            <Text style={styles.desc} numberOfLines={3}>{post.desc}</Text>

            {/* 悬赏 */}
            {post.reward ? (
                <View style={styles.rewardBadge}>
                    <Ionicons name="diamond-outline" size={12} color="#FF9500" />
                    <Text style={styles.rewardText}>{post.reward}</Text>
                </View>
            ) : null}

            {/* 底栏: 作者 + 互动 */}
            <View style={styles.footer}>
                <View style={styles.authorRow}>
                    <Text style={styles.authorName}>{post.author}</Text>
                    <Text style={styles.time}>{post.time}</Text>
                </View>

                <View style={styles.actions}>
                    {/* 回复数 */}
                    <View style={styles.actionItem}>
                        <Ionicons name="chatbubble-outline" size={14} color="#8E8E93" />
                        <Text style={styles.actionCount}>{post.replies}</Text>
                    </View>

                    {/* 点赞 */}
                    <Pressable style={styles.actionItem} onPress={handleLike} hitSlop={8}>
                        <Ionicons
                            name={liked ? 'heart' : 'heart-outline'}
                            size={14}
                            color={liked ? '#FF3B30' : '#8E8E93'}
                        />
                        <Text style={[styles.actionCount, liked && styles.actionActive]}>
                            {likeCount}
                        </Text>
                    </Pressable>
                </View>
            </View>
        </Pressable>
    );
}

// ============================================================================
// 样式
// ============================================================================

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 16,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    cardPressed: {
        opacity: 0.92,
        transform: [{ scale: 0.99 }],
    },
    tagBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 4,
        marginBottom: 8,
    },
    tagText: {
        fontSize: 11,
        fontWeight: '600',
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1C1C1E',
        lineHeight: 22,
        marginBottom: 6,
    },
    desc: {
        fontSize: 14,
        color: '#3C3C43',
        lineHeight: 20,
        marginBottom: 10,
    },
    rewardBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#FFF3E0',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        alignSelf: 'flex-start',
        marginBottom: 10,
    },
    rewardText: {
        fontSize: 12,
        color: '#FF9500',
        fontWeight: '600',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    authorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    authorName: {
        fontSize: 12,
        fontWeight: '600',
        color: '#8E8E93',
    },
    time: {
        fontSize: 11,
        color: '#AEAEB2',
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    actionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    actionCount: {
        fontSize: 12,
        color: '#8E8E93',
    },
    actionActive: {
        color: '#FF3B30',
    },
});
