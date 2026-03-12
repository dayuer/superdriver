/**
 * MUD 探索江湖 — 随机遭遇事件页面
 *
 * 消耗真气触发随机事件 (NPC/宝箱/陷阱)，获得碎银+真气+经验。
 */

import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
} from 'react-native';
import {
    explore,
    type ExploreResult,
    type ExploreEvent,
} from '../../services/mud-api';

const EVENT_ICONS: Record<string, string> = {
    npc_encounter: '🗡️',
    treasure: '💎',
    trap: '⚠️',
};

const EVENT_TITLES: Record<string, string> = {
    npc_encounter: 'NPC 遭遇',
    treasure: '发现宝物',
    trap: '遭遇陷阱',
};

export default function MudExploreScreen() {
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState<ExploreResult[]>([]);

    const handleExplore = useCallback(async () => {
        if (loading) return;
        setLoading(true);
        try {
            const result = await explore();
            setHistory((prev) => [result, ...prev]);
            if (result.levelInfo.leveled_up) {
                Alert.alert('🎉 升级了！', `晋升为 ${result.levelInfo.levelTitle}（Lv.${result.levelInfo.level}）`);
            }
        } catch (e: any) {
            Alert.alert('探索失败', e.message);
        }
        setLoading(false);
    }, [loading]);

    return (
        <View style={s.container}>
            <Text style={s.header}>🌍 探索江湖</Text>
            <Text style={s.hint}>消耗 5 真气，每日可探索 5 次</Text>

            <TouchableOpacity
                style={[s.exploreBtn, loading && s.btnDisabled]}
                onPress={handleExplore}
                disabled={loading}
            >
                <Text style={s.exploreBtnText}>
                    {loading ? '探索中...' : '🏃‍♂️ 出发探索'}
                </Text>
            </TouchableOpacity>

            <ScrollView style={s.log} showsVerticalScrollIndicator={false}>
                {history.map((result, i) => (
                    <View key={i} style={s.eventCard}>
                        <Text style={s.eventIcon}>
                            {EVENT_ICONS[result.event.type] || '❓'}
                        </Text>
                        <View style={s.eventBody}>
                            <Text style={s.eventType}>
                                {EVENT_TITLES[result.event.type] || result.event.type}
                            </Text>
                            <Text style={s.eventDesc}>{result.event.description}</Text>
                            <Text style={s.eventReward}>
                                {result.reward.silver >= 0 ? '+' : ''}{result.reward.silver} 碎银 ·{' '}
                                {result.reward.qi >= 0 ? '+' : ''}{result.reward.qi} 真气 ·{' '}
                                +{result.reward.exp} 经验
                            </Text>
                        </View>
                    </View>
                ))}
                {history.length === 0 && (
                    <Text style={s.empty}>点击「出发探索」开始冒险</Text>
                )}
            </ScrollView>
        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0A0A1A', padding: 20, paddingTop: 60 },
    header: { fontSize: 24, fontWeight: '700', color: '#FFF', textAlign: 'center' },
    hint: { fontSize: 13, color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginTop: 6, marginBottom: 20 },
    exploreBtn: {
        backgroundColor: '#5856D6',
        borderRadius: 16,
        paddingVertical: 16,
        alignItems: 'center',
        marginBottom: 20,
    },
    btnDisabled: { opacity: 0.5 },
    exploreBtnText: { fontSize: 18, fontWeight: '700', color: '#FFF' },
    log: { flex: 1 },
    eventCard: {
        flexDirection: 'row',
        backgroundColor: '#1A1A2E',
        borderRadius: 14,
        padding: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
    },
    eventIcon: { fontSize: 28, marginRight: 12, marginTop: 2 },
    eventBody: { flex: 1 },
    eventType: { fontSize: 15, fontWeight: '700', color: '#FFF' },
    eventDesc: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 4, lineHeight: 18 },
    eventReward: { fontSize: 12, color: '#FFD700', marginTop: 6, fontWeight: '600' },
    empty: { fontSize: 14, color: 'rgba(255,255,255,0.3)', textAlign: 'center', marginTop: 60 },
});
