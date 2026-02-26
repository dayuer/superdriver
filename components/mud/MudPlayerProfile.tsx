/**
 * MUD 玩家档案 (AC-4)
 *
 * 展示: 职业 / 称号 / 真气 / 碎银 / 所属门派
 *
 * @alpha: AC-4
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { MudProfile } from '../../services/mud-api';

const PROF_META: Record<string, { emoji: string; name: string; color: string }> = {
    night_escort: { emoji: '🌙', name: '夜行镖师', color: '#5856D6' },
    iron_rider: { emoji: '🐎', name: '铁骑游侠', color: '#FF9500' },
    swift_runner: { emoji: '⚡', name: '神行游侠', color: '#34C759' },
};

interface Props {
    profile: MudProfile;
}

export default function MudPlayerProfile({ profile }: Props) {
    const meta = PROF_META[profile.profession] || { emoji: '⚔️', name: '游侠', color: '#8E8E93' };

    return (
        <View style={s.container}>
            <View style={s.header}>
                <Text style={s.avatar}>{meta.emoji}</Text>
                <View style={{ flex: 1 }}>
                    <Text style={s.rank}>{profile.rank}</Text>
                    <Text style={[s.profession, { color: meta.color }]}>{meta.name}</Text>
                </View>
            </View>

            <View style={s.statsRow}>
                <View style={s.stat}>
                    <Text style={s.statValue}>{profile.qi}</Text>
                    <Text style={s.statLabel}>真气</Text>
                </View>
                <View style={s.statDivider} />
                <View style={s.stat}>
                    <Text style={[s.statValue, { color: '#FFD700' }]}>{profile.silver}</Text>
                    <Text style={s.statLabel}>碎银</Text>
                </View>
                <View style={s.statDivider} />
                <View style={s.stat}>
                    <Text style={s.statValue}>{profile.dailyBattles}</Text>
                    <Text style={s.statLabel}>今日战斗</Text>
                </View>
            </View>
        </View>
    );
}

const s = StyleSheet.create({
    container: {
        backgroundColor: '#1A1A2E',
        borderRadius: 16,
        padding: 16,
        marginHorizontal: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
    },
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
    avatar: { fontSize: 36, marginRight: 12 },
    rank: { fontSize: 18, fontWeight: '700', color: '#FFF' },
    profession: { fontSize: 13, fontWeight: '600', marginTop: 2 },
    statsRow: { flexDirection: 'row', alignItems: 'center' },
    stat: { flex: 1, alignItems: 'center' },
    statValue: { fontSize: 20, fontWeight: '700', color: '#FFF' },
    statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 4 },
    statDivider: { width: 1, height: 28, backgroundColor: 'rgba(255,255,255,0.08)' },
});
