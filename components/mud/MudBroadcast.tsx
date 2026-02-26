/**
 * MUD 全服播报条 (AC-8.6)
 *
 * 显示门派战绩/NPC 事件等实时播报，横向滚动。
 *
 * @beta: AC-8.6
 */

import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

const MOCK_BROADCASTS = [
    '⚔️ 苍水阁「夜行镖师」击败醉酒狂客，获得免佣券！',
    '🏮 黄衫门发布新规：限时急令奖励翻倍',
    '🔥 星南坊「铁骑游侠」创立新宗门「风雷骑社」',
    '📢 巡街官差出没：中州皇城东角区域警报',
];

export default function MudBroadcast() {
    const [index, setIndex] = useState(0);
    const fadeAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        const timer = setInterval(() => {
            Animated.sequence([
                Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
                Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
            ]).start();
            setIndex((i) => (i + 1) % MOCK_BROADCASTS.length);
        }, 4000);
        return () => clearInterval(timer);
    }, [fadeAnim]);

    return (
        <View style={s.bar}>
            <Text style={s.icon}>📢</Text>
            <Animated.Text style={[s.text, { opacity: fadeAnim }]}>
                {MOCK_BROADCASTS[index]}
            </Animated.Text>
        </View>
    );
}

const s = StyleSheet.create({
    bar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(88,86,214,0.1)',
        marginHorizontal: 16,
        marginBottom: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(88,86,214,0.15)',
    },
    icon: { fontSize: 14, marginRight: 8 },
    text: { flex: 1, fontSize: 12, color: 'rgba(255,255,255,0.7)' },
});
