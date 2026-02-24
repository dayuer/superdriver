/**
 * PostDetail — 帖子详情 + 讨论树
 *
 * 展示帖子全文、互动操作栏、讨论回复列表
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Pressable,
    TextInput,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
    getPostDetail,
    getDiscussionTree,
    getInteractionStatus,
    toggleInteraction,
    createPost,
    mapToReplyItem,
    formatRelativeTime,
    type CommunityPostRaw,
    type InteractionStatus,
    type ReplyItem,
} from '../../services/community-api';

interface PostDetailProps {
    postId: string;
    onClose?: () => void;
}

export default function PostDetail({ postId, onClose }: PostDetailProps) {
    const [post, setPost] = useState<CommunityPostRaw | null>(null);
    const [replies, setReplies] = useState<ReplyItem[]>([]);
    const [interaction, setInteraction] = useState<InteractionStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [replyText, setReplyText] = useState('');
    const [sending, setSending] = useState(false);

    // 加载数据
    useEffect(() => {
        async function load() {
            try {
                const [detailRes, treeRes, statusRes] = await Promise.all([
                    getPostDetail(postId),
                    getDiscussionTree(postId),
                    getInteractionStatus(postId).catch(() => null),
                ]);
                setPost(detailRes.post);
                setReplies(treeRes.posts.map(mapToReplyItem));
                if (statusRes) setInteraction(statusRes);
            } catch (err) {
                if (__DEV__) console.warn('[PostDetail] 加载失败:', err);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [postId]);

    // 点赞
    const handleLike = useCallback(async () => {
        try {
            const result = await toggleInteraction(postId, 'like');
            setInteraction(prev => prev ? { ...prev, liked: result.action === 'created' } : prev);
            setPost(prev => {
                if (!prev) return prev;
                const delta = result.action === 'created' ? 1 : -1;
                return { ...prev, likeCount: prev.likeCount + delta };
            });
        } catch (err) {
            if (__DEV__) console.warn('[PostDetail] 点赞失败:', err);
        }
    }, [postId]);

    // 收藏
    const handleBookmark = useCallback(async () => {
        try {
            const result = await toggleInteraction(postId, 'bookmark');
            setInteraction(prev =>
                prev ? { ...prev, bookmarked: result.action === 'created' } : prev,
            );
        } catch (err) {
            if (__DEV__) console.warn('[PostDetail] 收藏失败:', err);
        }
    }, [postId]);

    // 发送回复
    const handleSendReply = useCallback(async () => {
        const text = replyText.trim();
        if (!text || sending) return;

        setSending(true);
        try {
            const result = await createPost({
                content: text,
                parentId: Number(postId),
            });
            setReplies(prev => [...prev, mapToReplyItem(result.post)]);
            setReplyText('');
            // 更新回复数
            setPost(prev => prev ? { ...prev, replyCount: prev.replyCount + 1 } : prev);
        } catch (err) {
            if (__DEV__) console.warn('[PostDetail] 回复失败:', err);
        } finally {
            setSending(false);
        }
    }, [replyText, postId, sending]);

    // ---- 加载中 ----
    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#667eea" />
            </View>
        );
    }

    if (!post) {
        return (
            <View style={styles.loadingContainer}>
                <Ionicons name="alert-circle-outline" size={48} color="#C7C7CC" />
                <Text style={styles.errorText}>帖子不存在</Text>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
        >
            {/* 顶部导航 */}
            <View style={styles.header}>
                <Pressable onPress={onClose} hitSlop={12}>
                    <Ionicons name="chevron-back" size={24} color="#1C1C1E" />
                </Pressable>
                <Text style={styles.headerTitle}>帖子详情</Text>
                <View style={{ width: 24 }} />
            </View>

            {/* 内容区 */}
            <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
                {/* 帖子主体 */}
                <View style={styles.postSection}>
                    <View style={styles.authorRow}>
                        <Text style={styles.avatar}>{post.authorAvatar || '👤'}</Text>
                        <View>
                            <Text style={styles.authorName}>{post.authorName || '匿名'}</Text>
                            <Text style={styles.postTime}>{formatRelativeTime(post.createdAt)}</Text>
                        </View>
                    </View>

                    {post.title ? <Text style={styles.postTitle}>{post.title}</Text> : null}
                    <Text style={styles.postContent}>{post.content}</Text>

                    {/* 互动栏 */}
                    <View style={styles.interactionBar}>
                        <Pressable style={styles.interactionBtn} onPress={handleLike}>
                            <Ionicons
                                name={interaction?.liked ? 'heart' : 'heart-outline'}
                                size={20}
                                color={interaction?.liked ? '#FF3B30' : '#8E8E93'}
                            />
                            <Text style={[styles.interactionLabel, interaction?.liked && styles.activeLike]}>
                                {post.likeCount || '赞'}
                            </Text>
                        </Pressable>

                        <Pressable style={styles.interactionBtn} onPress={handleBookmark}>
                            <Ionicons
                                name={interaction?.bookmarked ? 'bookmark' : 'bookmark-outline'}
                                size={20}
                                color={interaction?.bookmarked ? '#FF9500' : '#8E8E93'}
                            />
                            <Text style={styles.interactionLabel}>
                                {interaction?.bookmarked ? '已收藏' : '收藏'}
                            </Text>
                        </Pressable>

                        <View style={styles.interactionBtn}>
                            <Ionicons name="chatbubble-outline" size={20} color="#8E8E93" />
                            <Text style={styles.interactionLabel}>{post.replyCount || '评论'}</Text>
                        </View>
                    </View>
                </View>

                {/* 讨论区 */}
                <View style={styles.repliesSection}>
                    <Text style={styles.repliesTitle}>
                        讨论 ({replies.length})
                    </Text>

                    {replies.length === 0 ? (
                        <Text style={styles.emptyReplies}>暂无回复，快来抢沙发</Text>
                    ) : (
                        replies.map(reply => (
                            <View key={reply.id} style={styles.replyCard}>
                                <Text style={styles.replyAvatar}>{reply.avatar}</Text>
                                <View style={styles.replyBody}>
                                    <View style={styles.replyHeader}>
                                        <Text style={styles.replyAuthor}>{reply.author}</Text>
                                        {reply.isAccepted ? (
                                            <View style={styles.acceptedBadge}>
                                                <Ionicons name="checkmark-circle" size={12} color="#34C759" />
                                                <Text style={styles.acceptedText}>已采纳</Text>
                                            </View>
                                        ) : null}
                                        <Text style={styles.replyTime}>{reply.time}</Text>
                                    </View>
                                    <Text style={styles.replyContent}>{reply.content}</Text>
                                    <View style={styles.replyActions}>
                                        <Ionicons name="heart-outline" size={14} color="#8E8E93" />
                                        <Text style={styles.replyLikes}>{reply.likes}</Text>
                                    </View>
                                </View>
                            </View>
                        ))
                    )}
                </View>
            </ScrollView>

            {/* 底部回复输入框 */}
            <View style={styles.replyBar}>
                <TextInput
                    style={styles.replyInput}
                    placeholder="写回复..."
                    placeholderTextColor="#AEAEB2"
                    value={replyText}
                    onChangeText={setReplyText}
                    multiline
                    maxLength={500}
                />
                <Pressable
                    style={[styles.sendBtn, !replyText.trim() && styles.sendBtnDisabled]}
                    onPress={handleSendReply}
                    disabled={!replyText.trim() || sending}
                >
                    {sending ? (
                        <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                        <Ionicons name="send" size={18} color="#FFF" />
                    )}
                </Pressable>
            </View>
        </KeyboardAvoidingView>
    );
}

// ============================================================================
// 样式
// ============================================================================

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F2F2F7' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
    errorText: { fontSize: 14, color: '#8E8E93' },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFF',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#E5E5EA',
    },
    headerTitle: { fontSize: 16, fontWeight: '700', color: '#1C1C1E' },

    scroll: { flex: 1 },
    scrollContent: { paddingBottom: 16 },

    // 帖子主体
    postSection: {
        backgroundColor: '#FFF',
        padding: 16,
        marginBottom: 8,
    },
    authorRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
    avatar: { fontSize: 32 },
    authorName: { fontSize: 14, fontWeight: '700', color: '#1C1C1E' },
    postTime: { fontSize: 11, color: '#AEAEB2', marginTop: 2 },
    postTitle: { fontSize: 18, fontWeight: '700', color: '#1C1C1E', lineHeight: 24, marginBottom: 8 },
    postContent: { fontSize: 15, color: '#3C3C43', lineHeight: 22 },

    interactionBar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingTop: 16,
        marginTop: 16,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: '#E5E5EA',
    },
    interactionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    interactionLabel: { fontSize: 13, color: '#8E8E93' },
    activeLike: { color: '#FF3B30' },

    // 讨论区
    repliesSection: { backgroundColor: '#FFF', padding: 16 },
    repliesTitle: { fontSize: 15, fontWeight: '700', color: '#1C1C1E', marginBottom: 12 },
    emptyReplies: { fontSize: 13, color: '#AEAEB2', textAlign: 'center', paddingVertical: 24 },

    replyCard: {
        flexDirection: 'row',
        gap: 10,
        paddingVertical: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#F0F0F0',
    },
    replyAvatar: { fontSize: 24 },
    replyBody: { flex: 1, gap: 4 },
    replyHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    replyAuthor: { fontSize: 13, fontWeight: '700', color: '#1C1C1E' },
    replyTime: { fontSize: 10, color: '#AEAEB2', marginLeft: 'auto' },
    replyContent: { fontSize: 14, color: '#3C3C43', lineHeight: 20 },
    replyActions: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
    replyLikes: { fontSize: 11, color: '#8E8E93' },

    acceptedBadge: { flexDirection: 'row', alignItems: 'center', gap: 2, backgroundColor: '#E8F5E9', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
    acceptedText: { fontSize: 10, color: '#34C759', fontWeight: '600' },

    // 底部输入
    replyBar: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        padding: 12,
        backgroundColor: '#FFF',
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: '#E5E5EA',
        gap: 8,
    },
    replyInput: {
        flex: 1,
        backgroundColor: '#F2F2F7',
        borderRadius: 18,
        paddingHorizontal: 14,
        paddingVertical: 8,
        fontSize: 14,
        maxHeight: 100,
        color: '#1C1C1E',
    },
    sendBtn: {
        backgroundColor: '#667eea',
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendBtnDisabled: { opacity: 0.4 },
});
