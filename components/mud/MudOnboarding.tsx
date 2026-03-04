/**
 * MUD 江湖名号 + 职业选择 两步引导
 *
 * Step 1: 起一个江湖名号（如「浪迹天涯」「醉酒当歌」）
 * Step 2: 选择职业 → 创建档案
 *
 * @alpha: AC-4.1 (增强版)
 */

import React, { useState, useCallback, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Dimensions,
    Animated,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { createMudProfile, type MudProfile } from '../../services/mud-api';

const { width } = Dimensions.get('window');

// ════════════════════════════════════════════════════════════════════
// 职业数据
// ════════════════════════════════════════════════════════════════════

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

// 随机名号建议
const ALIAS_SUGGESTIONS = [
    '浪迹天涯', '醉酒当歌', '剑走偏锋', '一路向北',
    '夜行千里', '风尘仆仆', '踏雪寻梅', '独行侠客',
    '逍遥自在', '快意恩仇', '笑傲江湖', '仗剑天涯',
    '烟雨江湖', '刀光剑影', '飒沓如风', '长风破浪',
];

function getRandomSuggestions(count: number): string[] {
    const shuffled = [...ALIAS_SUGGESTIONS].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}

// ════════════════════════════════════════════════════════════════════
// 组件
// ════════════════════════════════════════════════════════════════════

interface Props {
    onComplete: (profile: MudProfile) => void;
}

export default function MudOnboarding({ onComplete }: Props) {
    const [step, setStep] = useState<1 | 2>(1);
    const [alias, setAlias] = useState('');
    const [selected, setSelected] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [suggestions] = useState(() => getRandomSuggestions(6));
    const fadeAnim = useRef(new Animated.Value(1)).current;

    // 名号校验
    const aliasValid = alias.trim().length >= 2 && alias.trim().length <= 8;

    // Step 1 → Step 2 过渡
    const goToStep2 = useCallback(() => {
        if (!aliasValid) return;
        Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
            setStep(2);
            Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
        });
    }, [aliasValid, fadeAnim]);

    // 确认创建
    const handleConfirm = useCallback(async () => {
        if (!selected || !aliasValid) return;
        setLoading(true);
        try {
            const profile = await createMudProfile(selected, alias.trim());
            onComplete(profile);
        } catch (error) {
            console.error('[MudOnboarding]', error);
            setLoading(false);
        }
    }, [selected, alias, aliasValid, onComplete]);

    return (
        <KeyboardAvoidingView
            style={s.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
                <Animated.View style={{ opacity: fadeAnim, flex: 1 }}>

                    {/* ════════ Step 1: 名号 ════════ */}
                    {step === 1 && (
                        <View style={s.stepArea}>
                            <Text style={s.stepLabel}>第一步</Text>
                            <Text style={s.title}>✍️ 起一个江湖名号</Text>
                            <Text style={s.subtitle}>
                                这将是你在江湖中的代号，其他侠客会以此称呼你
                            </Text>

                            {/* 输入框 */}
                            <View style={s.inputWrap}>
                                <TextInput
                                    style={s.input}
                                    value={alias}
                                    onChangeText={setAlias}
                                    placeholder="如：浪迹天涯"
                                    placeholderTextColor="rgba(255,255,255,0.25)"
                                    maxLength={8}
                                    autoFocus
                                />
                                <Text style={s.charCount}>
                                    {alias.length}/8
                                </Text>
                            </View>

                            {!aliasValid && alias.length > 0 && (
                                <Text style={s.hint}>名号需 2-8 个字</Text>
                            )}

                            {/* 推荐名号 */}
                            <Text style={s.suggestTitle}>🎲 随机推荐</Text>
                            <View style={s.suggestWrap}>
                                {suggestions.map((s_name) => (
                                    <TouchableOpacity
                                        key={s_name}
                                        style={[
                                            s.suggestTag,
                                            alias === s_name && s.suggestTagActive,
                                        ]}
                                        onPress={() => setAlias(s_name)}
                                    >
                                        <Text style={[
                                            s.suggestText,
                                            alias === s_name && s.suggestTextActive,
                                        ]}>
                                            {s_name}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* 下一步 */}
                            <TouchableOpacity
                                style={[s.nextBtn, !aliasValid && s.btnDisabled]}
                                onPress={goToStep2}
                                disabled={!aliasValid}
                            >
                                <Text style={s.nextText}>下一步 →</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* ════════ Step 2: 选职业 ════════ */}
                    {step === 2 && (
                        <View style={s.stepArea}>
                            <Text style={s.stepLabel}>第二步</Text>
                            <Text style={s.title}>⚔️ 选择你的江湖身份</Text>
                            <Text style={s.subtitle}>
                                「{alias}」，身份将决定你的技能与可见情报
                            </Text>

                            {PROFESSIONS.map((p) => {
                                const isSelected = selected === p.code;
                                return (
                                    <TouchableOpacity
                                        key={p.code}
                                        style={[
                                            s.card,
                                            isSelected && { borderColor: p.color, borderWidth: 2 },
                                        ]}
                                        onPress={() => setSelected(p.code)}
                                        activeOpacity={0.7}
                                    >
                                        <View style={s.cardHeader}>
                                            <Text style={s.emoji}>{p.emoji}</Text>
                                            <View style={{ flex: 1 }}>
                                                <Text style={s.profName}>{p.name}</Text>
                                                <Text style={s.profReal}>
                                                    现实：{p.realJob}
                                                </Text>
                                            </View>
                                            {isSelected && (
                                                <Text style={[s.check, { color: p.color }]}>
                                                    ✓
                                                </Text>
                                            )}
                                        </View>
                                        <Text style={s.profDesc}>{p.desc}</Text>
                                        <View style={s.skillRow}>
                                            {p.skills.map((skill) => (
                                                <View
                                                    key={skill}
                                                    style={[
                                                        s.skillTag,
                                                        { backgroundColor: p.color + '20' },
                                                    ]}
                                                >
                                                    <Text style={[s.skillText, { color: p.color }]}>
                                                        {skill}
                                                    </Text>
                                                </View>
                                            ))}
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}

                            {/* 返回 + 确认 */}
                            <View style={s.btnRow}>
                                <TouchableOpacity
                                    style={s.backBtn}
                                    onPress={() => {
                                        Animated.timing(fadeAnim, {
                                            toValue: 0,
                                            duration: 200,
                                            useNativeDriver: true,
                                        }).start(() => {
                                            setStep(1);
                                            Animated.timing(fadeAnim, {
                                                toValue: 1, duration: 300,
                                                useNativeDriver: true,
                                            }).start();
                                        });
                                    }}
                                >
                                    <Text style={s.backText}>← 改名号</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[
                                        s.confirmBtn,
                                        !selected && s.btnDisabled,
                                    ]}
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
                        </View>
                    )}

                </Animated.View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

// ════════════════════════════════════════════════════════════════════
// 样式
// ════════════════════════════════════════════════════════════════════

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0A0A1A' },
    scroll: { padding: 20, paddingTop: 60, paddingBottom: 40 },

    stepLabel: {
        fontSize: 12, color: '#5856D6', fontWeight: '600',
        textTransform: 'uppercase', letterSpacing: 2,
        textAlign: 'center', marginBottom: 8,
    },
    title: { fontSize: 24, fontWeight: '700', color: '#FFF', textAlign: 'center' },
    subtitle: {
        fontSize: 14, color: 'rgba(255,255,255,0.5)',
        textAlign: 'center', marginTop: 8, marginBottom: 24,
    },
    stepArea: { flex: 1 },

    // 输入框
    inputWrap: {
        backgroundColor: '#1A1A2E',
        borderRadius: 16, paddingHorizontal: 20, paddingVertical: 4,
        flexDirection: 'row', alignItems: 'center',
        borderWidth: 1, borderColor: 'rgba(88,86,214,0.3)',
    },
    input: {
        flex: 1, fontSize: 22, fontWeight: '700', color: '#FFF',
        paddingVertical: 16,
    },
    charCount: { fontSize: 12, color: 'rgba(255,255,255,0.3)' },
    hint: { fontSize: 12, color: '#FF9500', marginTop: 6, textAlign: 'center' },

    // 推荐名号
    suggestTitle: {
        fontSize: 13, color: 'rgba(255,255,255,0.4)',
        marginTop: 24, marginBottom: 12,
    },
    suggestWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    suggestTag: {
        backgroundColor: '#1A1A2E',
        paddingHorizontal: 14, paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    },
    suggestTagActive: {
        borderColor: '#5856D6',
        backgroundColor: 'rgba(88,86,214,0.15)',
    },
    suggestText: { fontSize: 14, color: 'rgba(255,255,255,0.6)' },
    suggestTextActive: { color: '#5856D6', fontWeight: '600' },

    // 按钮
    nextBtn: {
        marginTop: 32, backgroundColor: '#5856D6',
        borderRadius: 16, paddingVertical: 16, alignItems: 'center',
    },
    nextText: { fontSize: 18, fontWeight: '700', color: '#FFF' },
    btnDisabled: { opacity: 0.35 },

    // 职业卡片
    card: {
        backgroundColor: '#1A1A2E', borderRadius: 16,
        padding: 16, marginBottom: 12,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
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

    // 底部按钮行
    btnRow: { flexDirection: 'row', gap: 12, marginTop: 20 },
    backBtn: {
        flex: 1, borderRadius: 16, paddingVertical: 16,
        alignItems: 'center', backgroundColor: '#1A1A2E',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    },
    backText: { fontSize: 16, color: 'rgba(255,255,255,0.5)' },
    confirmBtn: {
        flex: 2, backgroundColor: '#5856D6',
        borderRadius: 16, paddingVertical: 16, alignItems: 'center',
    },
    confirmText: { fontSize: 18, fontWeight: '700', color: '#FFF' },
});
