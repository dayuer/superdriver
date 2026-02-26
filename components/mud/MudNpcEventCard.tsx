/**
 * MUD NPC 事件卡片 + 上报入口 (AC-5)
 * @beta
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { NpcEvent } from '../../services/mud-api';

const NPC_EMOJI: Record<string, string> = {
    golden_patron: '💰',
    roadblock: '🚧',
    elder: '📜',
};

interface Props {
    event: NpcEvent;
    onPress?: (event: NpcEvent) => void;
}

export function MudNpcEventCard({ event, onPress }: Props) {
    return (
        <TouchableOpacity style={s.card} onPress={() => onPress?.(event)} activeOpacity={0.7}>
            <Text style={s.emoji}>{NPC_EMOJI[event.npcType] || '👤'}</Text>
            <View style={{ flex: 1 }}>
                <Text style={s.name}>{event.npcName}</Text>
                <Text style={s.dialogue}>「{event.npcDialogue}」</Text>
                {event.targetProfession && (
                    <Text style={s.target}>🎯 适合：{event.targetProfession}</Text>
                )}
            </View>
        </TouchableOpacity>
    );
}

export default MudNpcEventCard;

const s = StyleSheet.create({
    card: {
        flexDirection: 'row',
        backgroundColor: '#1A1A2E',
        borderRadius: 14,
        padding: 14,
        marginHorizontal: 16,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,215,0,0.15)',
        borderLeftWidth: 3,
        borderLeftColor: '#FFD700',
    },
    emoji: { fontSize: 28, marginRight: 12 },
    name: { fontSize: 15, fontWeight: '700', color: '#FFD700' },
    dialogue: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 4, fontStyle: 'italic' },
    target: { fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 6 },
});
