/**
 * MUD 恩怨台 (AC-6)
 *
 * 流程: 生成 NPC → 展示 → 选技能 → 战斗 → 胜利 + 掉落
 *
 * @beta: AC-6
 */

import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    ScrollView,
} from 'react-native';
import {
    generateArenaNpc,
    executeBattle,
    getRemainingBattles,
    type ArenaNpc,
    type BattleResult,
} from '../../services/mud-api';

const SKILLS = [
    { index: 0, label: '技能一', emoji: '⚡' },
    { index: 1, label: '技能二', emoji: '🔥' },
    { index: 2, label: '技能三', emoji: '💥' },
];

export default function MudArenaScreen() {
    const [npc, setNpc] = useState<ArenaNpc | null>(null);
    const [result, setResult] = useState<BattleResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [remaining, setRemaining] = useState<number | null>(null);

    const handleGenerate = useCallback(async () => {
        setLoading(true);
        setResult(null);
        try {
            const { npc: n } = await generateArenaNpc();
            setNpc(n);
            const r = await getRemainingBattles();
            setRemaining(r.remaining);
        } catch (error) {
            console.error('[Arena]', error);
        }
        setLoading(false);
    }, []);

    const handleBattle = useCallback(async (skillIndex: number) => {
        setLoading(true);
        try {
            const res = await executeBattle(skillIndex);
            setResult(res);
        } catch (error) {
            console.error('[Arena]', error);
        }
        setLoading(false);
    }, []);

    return (
        <ScrollView style={s.container} contentContainerStyle={s.content}>
            <Text style={s.title}>⚔️ 恩怨台</Text>
            <Text style={s.subtitle}>消耗真气，击败 NPC，获取奖励</Text>

            {remaining !== null && (
                <Text style={s.remaining}>今日剩余: {remaining} 次</Text>
            )}

            {/* 生成 NPC */}
            {!npc && !loading && (
                <TouchableOpacity style={s.generateBtn} onPress={handleGenerate}>
                    <Text style={s.generateText}>🎲 召唤对手</Text>
                </TouchableOpacity>
            )}

            {loading && <ActivityIndicator size="large" color="#FF3B30" style={{ marginTop: 40 }} />}

            {/* NPC 展示 */}
            {npc && !result && (
                <View style={s.npcCard}>
                    <Text style={s.npcEmoji}>👹</Text>
                    <Text style={s.npcName}>{npc.name}</Text>
                    <Text style={s.npcDialogue}>「{npc.dialogue}」</Text>
                    <Text style={s.npcWeak}>弱点：{npc.weakness}</Text>

                    <Text style={s.skillTitle}>选择招式：</Text>
                    <View style={s.skillRow}>
                        {SKILLS.map((sk) => (
                            <TouchableOpacity
                                key={sk.index}
                                style={s.skillBtn}
                                onPress={() => handleBattle(sk.index)}
                                disabled={loading}
                            >
                                <Text style={s.skillEmoji}>{sk.emoji}</Text>
                                <Text style={s.skillLabel}>{sk.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            )}

            {/* 战斗结果 */}
            {result && (
                <View style={s.resultCard}>
                    <Text style={s.victoryText}>🎉 大获全胜！</Text>
                    {result.log.map((line, i) => (
                        <Text key={i} style={s.logLine}>{line}</Text>
                    ))}
                    <View style={s.rewardBox}>
                        <Text style={s.rewardText}>
                            🎁 获得: {result.reward.label} ×{result.reward.amount}
                        </Text>
                        <Text style={s.qiText}>真气 +{result.qiGained}</Text>
                    </View>
                    <TouchableOpacity style={s.againBtn} onPress={handleGenerate}>
                        <Text style={s.againText}>再战一局</Text>
                    </TouchableOpacity>
                </View>
            )}
        </ScrollView>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0A0A1A' },
    content: { padding: 20, paddingTop: 60 },
    title: { fontSize: 24, fontWeight: '700', color: '#FFF', textAlign: 'center' },
    subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginTop: 8 },
    remaining: { fontSize: 12, color: '#FF9500', textAlign: 'center', marginTop: 8 },
    generateBtn: {
        backgroundColor: '#FF3B30',
        borderRadius: 16,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 40,
    },
    generateText: { fontSize: 18, fontWeight: '700', color: '#FFF' },
    npcCard: {
        backgroundColor: '#1A1A2E',
        borderRadius: 16,
        padding: 20,
        marginTop: 24,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,59,48,0.2)',
    },
    npcEmoji: { fontSize: 48 },
    npcName: { fontSize: 20, fontWeight: '700', color: '#FF3B30', marginTop: 8 },
    npcDialogue: { fontSize: 14, color: 'rgba(255,255,255,0.6)', marginTop: 8, fontStyle: 'italic', textAlign: 'center' },
    npcWeak: { fontSize: 12, color: '#34C759', marginTop: 8 },
    skillTitle: { fontSize: 14, color: 'rgba(255,255,255,0.5)', marginTop: 20, marginBottom: 12 },
    skillRow: { flexDirection: 'row', gap: 12 },
    skillBtn: {
        backgroundColor: 'rgba(255,59,48,0.15)',
        borderRadius: 14,
        paddingVertical: 14,
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    skillEmoji: { fontSize: 24 },
    skillLabel: { fontSize: 12, color: '#FFF', marginTop: 4 },
    resultCard: {
        backgroundColor: '#1A1A2E',
        borderRadius: 16,
        padding: 20,
        marginTop: 24,
        borderWidth: 1,
        borderColor: 'rgba(52,199,89,0.2)',
    },
    victoryText: { fontSize: 22, fontWeight: '700', color: '#34C759', textAlign: 'center' },
    logLine: { fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 6 },
    rewardBox: {
        backgroundColor: 'rgba(255,215,0,0.1)',
        borderRadius: 12,
        padding: 12,
        marginTop: 16,
        alignItems: 'center',
    },
    rewardText: { fontSize: 16, fontWeight: '700', color: '#FFD700' },
    qiText: { fontSize: 13, color: '#5856D6', marginTop: 4 },
    againBtn: {
        backgroundColor: '#5856D6',
        borderRadius: 14,
        paddingVertical: 12,
        alignItems: 'center',
        marginTop: 16,
    },
    againText: { fontSize: 16, fontWeight: '700', color: '#FFF' },
});
