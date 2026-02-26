/**
 * MUD 免责声明 (AC-10.3)
 *
 * 社区入口常驻免责声明条。从 RemoteConfig 加载文案。
 *
 * @alpha: AC-10.3
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getDisclaimer } from '../../services/mud-api';

export default function MudDisclaimer() {
    const [text, setText] = useState('');

    useEffect(() => {
        getDisclaimer().then(setText);
    }, []);

    if (!text) return null;

    return (
        <View style={s.bar}>
            <Text style={s.icon}>⚖️</Text>
            <Text style={s.text}>{text}</Text>
        </View>
    );
}

const s = StyleSheet.create({
    bar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,165,0,0.08)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginHorizontal: 16,
        marginBottom: 8,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,165,0,0.15)',
    },
    icon: { fontSize: 14, marginRight: 8 },
    text: { flex: 1, fontSize: 10, color: 'rgba(255,255,255,0.4)', lineHeight: 14 },
});
