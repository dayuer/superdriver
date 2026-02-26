/**
 * MUD 职业选择引导
 *
 * 首次进入 MUD 社区时强制选择职业 → 创建档案。
 * 三种职业: 夜行镖师(代驾) / 铁骑游侠(网约车) / 神行游侠(外卖)
 *
 * @alpha: AC-4.1
 */

import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Dimensions,
} from 'react-native';
import { COLORS } from '../../styles/colors';
import { createMudProfile, type MudProfile } from '../../services/mud-api';

const { width } = Dimensions.get('window');

// ============================================================================
// 职业数据
// ============================================================================

const PROFESSIONS = [
    {
        code: 'night_escort',
        name: '夜行镖师',
        emoji: '🌙',
        realJob: '代驾',
        desc: '昼伏夜出，驭折叠木马，专接酒客护送。',
        skills: ['折叠飞踢', '绕路迷阵', '醉客安抚术'],
        color: '#5856D6',
    },
    {
        code: 'iron_rider',
        name: '铁骑游侠',
        emoji: '🐎',
        realJob: '网约车',
        desc: '驾驭战马，全天候接取各路商会镖单。',
        skills: ['拒载飞踹', '闪避查车', '绕道神行'],
        color: '#FF9500',
    },
    {
        code: 'swift_runner',
        name: '神行游侠',
        emoji: '⚡',
        realJob: '外卖',
        desc: '身披战袍，穿梭市井，掌握核心线下情报。',
        skills: ['飞檐走壁', '限时冲刺', '商圈探听'],
        color: '#34C759',
    },
];

// ============================================================================
// 组件
// ============================================================================

interface Props {
    onComplete: (profile: MudProfile) => void;
}

export default function MudOnboarding({ onComplete }: Props) {
    const [selected, setSelected] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleConfirm = useCallback(async () => {
        if (!selected) return;
        setLoading(true);
        try {
            const profile = await createMudProfile(selected);
            onComplete(profile);
        } catch (error) {
            console.error('[MudOnboarding]', error);
            setLoading(false);
        }
    }, [selected, onComplete]);

    return (
        <View style={s.container}>
            <Text style={s.title}>⚔️ 选择你的江湖身份</Text>
            <Text style={s.subtitle}>身份将决定你的技能、可见情报与专属黑话</Text>

            {PROFESSIONS.map((p) => {
                const isSelected = selected === p.code;
                return (
                    <TouchableOpacity
                        key={p.code}
                        style={[s.card, isSelected && { borderColor: p.color, borderWidth: 2 }]}
                        onPress={() => setSelected(p.code)}
                        activeOpacity={0.7}
                    >
                        <View style={s.cardHeader}>
                            <Text style={s.emoji}>{p.emoji}</Text>
                            <View style={{ flex: 1 }}>
                                <Text style={s.profName}>{p.name}</Text>
                                <Text style={s.profReal}>现实：{p.realJob}</Text>
                            </View>
                            {isSelected && <Text style={[s.check, { color: p.color }]}>✓</Text>}
                        </View>
                        <Text style={s.profDesc}>{p.desc}</Text>
                        <View style={s.skillRow}>
                            {p.skills.map((skill) => (
                                <View key={skill} style={[s.skillTag, { backgroundColor: p.color + '20' }]}>
                                    <Text style={[s.skillText, { color: p.color }]}>{skill}</Text>
                                </View>
                            ))}
                        </View>
                    </TouchableOpacity>
                );
            })}

            <TouchableOpacity
                style={[s.confirmBtn, !selected && s.confirmDisabled]}
                onPress={handleConfirm}
                disabled={!selected || loading}
            >
                {loading ? (
                    <ActivityIndicator color="#FFF" />
                ) : (
                    <Text style={s.confirmText}>踏入江湖</Text>
                )}
            </TouchableOpacity>
        </View>
    );
}

// ============================================================================
// 样式
// ============================================================================

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0A0A1A', padding: 20, paddingTop: 60 },
    title: { fontSize: 24, fontWeight: '700', color: '#FFF', textAlign: 'center' },
    subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginTop: 8, marginBottom: 24 },
    card: {
        backgroundColor: '#1A1A2E',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    emoji: { fontSize: 32, marginRight: 12 },
    profName: { fontSize: 18, fontWeight: '700', color: '#FFF' },
    profReal: { fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 },
    check: { fontSize: 24, fontWeight: '700' },
    profDesc: { fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 18 },
    skillRow: { flexDirection: 'row', marginTop: 10, gap: 8 },
    skillTag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    skillText: { fontSize: 11, fontWeight: '600' },
    confirmBtn: {
        marginTop: 20,
        backgroundColor: '#5856D6',
        borderRadius: 16,
        paddingVertical: 16,
        alignItems: 'center',
    },
    confirmDisabled: { opacity: 0.4 },
    confirmText: { fontSize: 18, fontWeight: '700', color: '#FFF' },
});
