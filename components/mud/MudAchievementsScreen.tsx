/**
 * MUD 成就徽章墙
 *
 * 展示 8 个预设成就的解锁状态。
 */

import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
} from 'react-native';
import {
    getAchievements,
    type Achievement,
    type AchievementsData,
} from '../../services/mud-api';

export default function MudAchievementsScreen() {
    const [data, setData] = useState<AchievementsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getAchievements()
            .then(setData)
            .catch(() => setData({ achievements: [], unlocked: 0, total: 0 }))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <View style={s.center}>
                <ActivityIndicator size="large" color="#FFD700" />
            </View>
        );
    }

    return (
        <View style={s.container}>
            <Text style={s.header}>🏆 成就</Text>
            <Text style={s.progress}>
                已解锁 {data?.unlocked ?? 0} / {data?.total ?? 0}
            </Text>
            <FlatList
                data={data?.achievements ?? []}
                keyExtractor={(item) => item.id}
                numColumns={2}
                renderItem={({ item }) => (
                    <View style={[s.badge, !item.unlocked && s.badgeLocked]}>
                        <Text style={s.icon}>{item.icon}</Text>
                        <Text style={[s.name, !item.unlocked && s.nameLocked]}>
                            {item.name}
                        </Text>
                        <Text style={s.desc}>{item.description}</Text>
                    </View>
                )}
                contentContainerStyle={s.grid}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0A0A1A', padding: 20, paddingTop: 60 },
    center: { flex: 1, backgroundColor: '#0A0A1A', justifyContent: 'center', alignItems: 'center' },
    header: { fontSize: 24, fontWeight: '700', color: '#FFF', textAlign: 'center' },
    progress: { fontSize: 14, color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginTop: 6, marginBottom: 16 },
    grid: { paddingBottom: 40 },
    badge: {
        flex: 1,
        backgroundColor: '#1A1A2E',
        borderRadius: 14,
        padding: 16,
        margin: 6,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,215,0,0.2)',
    },
    badgeLocked: { opacity: 0.4, borderColor: 'rgba(255,255,255,0.06)' },
    icon: { fontSize: 32, marginBottom: 8 },
    name: { fontSize: 14, fontWeight: '700', color: '#FFD700', textAlign: 'center' },
    nameLocked: { color: 'rgba(255,255,255,0.5)' },
    desc: { fontSize: 11, color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginTop: 4 },
});
