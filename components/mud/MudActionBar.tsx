/**
 * MUD 动作栏
 *
 * 替换传统 like/comment 按钮为 MUD 三动作: 烈酒🍶(同情) / 怒骂😤(热度) / 围炉🔥(评论)
 * 底层映射到 like/comment 系统 (AC-3.1 + AC-3.3)
 *
 * @alpha: AC-3.1
 */

import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface Props {
    postId: string;
    likeCount: number;
    replyCount: number;
    onLike?: (postId: string) => void;
    onReply?: (postId: string) => void;
}

export default function MudActionBar({ postId, likeCount, replyCount, onLike, onReply }: Props) {
    const handleLike = useCallback(() => onLike?.(postId), [postId, onLike]);
    const handleReply = useCallback(() => onReply?.(postId), [postId, onReply]);

    return (
        <View style={s.bar}>
            {/* 烈酒 = 同情 (映射 like) */}
            <TouchableOpacity style={s.action} onPress={handleLike}>
                <Text style={s.emoji}>🍶</Text>
                <Text style={s.label}>烈酒</Text>
                <Text style={s.count}>{likeCount}</Text>
            </TouchableOpacity>

            {/* 怒骂 = 热度 (映射 like + 类型标记) */}
            <TouchableOpacity style={s.action} onPress={handleLike}>
                <Text style={s.emoji}>😤</Text>
                <Text style={s.label}>怒骂</Text>
            </TouchableOpacity>

            {/* 围炉 = 评论 (映射 comment) */}
            <TouchableOpacity style={s.action} onPress={handleReply}>
                <Text style={s.emoji}>🔥</Text>
                <Text style={s.label}>围炉</Text>
                <Text style={s.count}>{replyCount}</Text>
            </TouchableOpacity>
        </View>
    );
}

const s = StyleSheet.create({
    bar: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.06)',
        paddingTop: 10,
    },
    action: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
    },
    emoji: { fontSize: 16 },
    label: { fontSize: 12, color: 'rgba(255,255,255,0.5)' },
    count: { fontSize: 11, color: 'rgba(255,255,255,0.3)', marginLeft: 2 },
});
