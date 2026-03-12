/**
 * MUD 排行榜 — 碎银/等级/战斗 三维度 Top 20
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';
import {
    getLeaderboard,
    type LeaderboardData,
    type RankingEntry,
} from '../../services/mud-api';

const TABS: { key: 'silver' | 'level' | 'battle'; label: string; icon: string }[] = [
    { key: 'silver', label: '碎银', icon: '💰' },
    { key: 'level', label: '等级', icon: '⭐' },
    { key: 'battle', label: '战斗', icon: '⚔️' },
];

const RANK_MEDALS = ['🥇', '🥈', '🥉'];

export default function MudLeaderboard() {
    const [tab, setTab] = useState<'silver' | 'level' | 'battle'>('silver');
    const [data, setData] = useState<LeaderboardData | null>(null);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async (type: 'silver' | 'level' | 'battle') => {
        setLoading(true);
        try {
            const result = await getLeaderboard(type);
            setData(result);
        } catch {
            setData({ type, title: '', rankings: [] });
        }
        setLoading(false);
    }, []);

    useEffect(() => { load(tab); }, [tab, load]);

    return (
        <View style={s.container}>
            <Text style={s.header}>🏅 排行榜</Text>

            {/* Tab 切换 */}
            <View style={s.tabs}>
                {TABS.map((t) => (
                    <TouchableOpacity
                        key={t.key}
                        style={[s.tab, tab === t.key && s.tabActive]}
                        onPress={() => setTab(t.key)}
                    >
                        <Text style={[s.tabText, tab === t.key && s.tabTextActive]}>
                            {t.icon} {t.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {loading ? (
                <ActivityIndicator style={{ marginTop: 40 }} color="#FFD700" />
            ) : (
                <FlatList
                    data={data?.rankings ?? []}
                    keyExtractor={(item) => `${item.rank}`}
                    renderItem={({ item }) => (
                        <View style={s.row}>
                            <Text style={s.rank}>
                                {item.rank <= 3 ? RANK_MEDALS[item.rank - 1] : `#${item.rank}`}
                            </Text>
                            <View style={s.info}>
                                <Text style={s.name}>
                                    {item.userId.slice(0, 8)}...
                                </Text>
                                <Text style={s.meta}>Lv.{item.level}</Text>
                            </View>
                            <Text style={s.value}>{item.value.toLocaleString()}</Text>
                        </View>
                    )}
                    ListEmptyComponent={
                        <Text style={s.empty}>暂无排行数据</Text>
                    }
                    contentContainerStyle={s.list}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0A0A1A', padding: 20, paddingTop: 60 },
    header: { fontSize: 24, fontWeight: '700', color: '#FFF', textAlign: 'center', marginBottom: 16 },
    tabs: { flexDirection: 'row', justifyContent: 'center', marginBottom: 16, gap: 8 },
    tab: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#1A1A2E',
    },
    tabActive: { backgroundColor: '#5856D6' },
    tabText: { fontSize: 14, color: 'rgba(255,255,255,0.5)' },
    tabTextActive: { color: '#FFF', fontWeight: '700' },
    list: { paddingBottom: 40 },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1A1A2E',
        borderRadius: 12,
        padding: 14,
        marginBottom: 8,
    },
    rank: { fontSize: 20, width: 40, textAlign: 'center', color: '#FFD700' },
    info: { flex: 1, marginLeft: 8 },
    name: { fontSize: 15, fontWeight: '600', color: '#FFF' },
    meta: { fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 },
    value: { fontSize: 16, fontWeight: '700', color: '#FFD700' },
    empty: { fontSize: 14, color: 'rgba(255,255,255,0.3)', textAlign: 'center', marginTop: 60 },
});
