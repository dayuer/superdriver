/**
 * MUD 悬赏布告榜 (AC-7) + 黑市商店 (AC-9) + 公会 (AC-8) + 语音 (AC-11)
 *
 * 为简洁起见将几个子屏合并为一个导出文件。
 *
 * @beta: T10-T14
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    Alert,
} from 'react-native';
import {
    getBounties,
    takeBounty,
    getShopItems,
    exchangeItem,
    getGuildInfo,
    joinGuild,
    getVoiceQuota,
    getCreditPacks,
    buyCredits,
    type Bounty,
    type ShopItem,
    type Guild,
    type VoiceQuota,
    type CreditPack,
} from '../../services/mud-api';

// ============================================================================
// MudBountyBoard (AC-7)
// ============================================================================

export function MudBountyBoard() {
    const [bounties, setBounties] = useState<Bounty[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getBounties().then((r) => { setBounties(r.bounties); setLoading(false); });
    }, []);

    const handleTake = useCallback(async (id: string) => {
        try {
            await takeBounty(id);
            Alert.alert('揭榜成功', '速往目标地点');
            setBounties((prev) => prev.filter((b) => b.id !== id));
        } catch (e: any) {
            Alert.alert('揭榜失败', e.message);
        }
    }, []);

    if (loading) return <ActivityIndicator style={{ marginTop: 40 }} color="#FFD700" />;

    return (
        <View style={cs.container}>
            <Text style={cs.title}>📜 悬赏布告</Text>
            <FlatList
                data={bounties}
                keyExtractor={(i) => i.id}
                renderItem={({ item }) => (
                    <View style={cs.card}>
                        <Text style={cs.content}>
                            {item.mudContent || item.content}
                        </Text>
                        <View style={cs.row}>
                            <Text style={cs.reward}>💰 {item.reward} 碎银</Text>
                            <TouchableOpacity
                                style={cs.takeBtn}
                                onPress={() => handleTake(item.id)}
                            >
                                <Text style={cs.takeText}>揭榜</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
                ListEmptyComponent={<Text style={cs.empty}>暂无悬赏</Text>}
            />
        </View>
    );
}

// ============================================================================
// MudShopScreen (AC-9)
// ============================================================================

export function MudShopScreen() {
    const [items, setItems] = useState<ShopItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getShopItems().then((r) => { setItems(r.items); setLoading(false); });
    }, []);

    const handleExchange = useCallback(async (id: string, name: string) => {
        Alert.alert('确认兑换', `消耗碎银兑换 ${name}？`, [
            { text: '取消' },
            {
                text: '兑换', onPress: async () => {
                    try {
                        const res = await exchangeItem(id);
                        Alert.alert('兑换成功', res.message);
                    } catch (e: any) {
                        Alert.alert('兑换失败', e.message);
                    }
                },
            },
        ]);
    }, []);

    if (loading) return <ActivityIndicator style={{ marginTop: 40 }} color="#FFD700" />;

    return (
        <View style={cs.container}>
            <Text style={cs.title}>🏪 黑市</Text>
            <FlatList
                data={items}
                keyExtractor={(i) => i.id}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={cs.card}
                        onPress={() => handleExchange(item.id, item.itemName)}
                    >
                        <Text style={cs.itemName}>{item.itemName}</Text>
                        <Text style={cs.itemDesc}>{item.description}</Text>
                        <Text style={cs.reward}>💰 {item.priceSilver} 碎银</Text>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={<Text style={cs.empty}>黑市空空</Text>}
            />
        </View>
    );
}

// ============================================================================
// MudGuildScreen (AC-8)
// ============================================================================

export function MudGuildScreen() {
    const [guild, setGuild] = useState<Guild | null>(null);
    const [loading, setLoading] = useState(true);
    const [inviteCode, setInviteCode] = useState('');

    useEffect(() => {
        getGuildInfo().then((g) => { setGuild(g); setLoading(false); });
    }, []);

    const handleJoin = useCallback(async () => {
        if (!inviteCode.trim()) return;
        try {
            await joinGuild(inviteCode.trim());
            const g = await getGuildInfo();
            setGuild(g);
        } catch (e: any) {
            Alert.alert('加入失败', e.message);
        }
    }, [inviteCode]);

    if (loading) return <ActivityIndicator style={{ marginTop: 40 }} color="#5856D6" />;

    if (!guild) {
        return (
            <View style={cs.container}>
                <Text style={cs.title}>🏯 加入门派</Text>
                <Text style={cs.subtitle}>输入英雄帖邀请码加入宗门</Text>
            </View>
        );
    }

    return (
        <View style={cs.container}>
            <Text style={cs.title}>🏯 {guild.guildName}</Text>
            <View style={cs.card}>
                <Text style={cs.itemName}>势力: {guild.faction}</Text>
                <Text style={cs.itemDesc}>
                    成员 {guild.memberCount}/{guild.maxMembers} · 宝库 {guild.treasury} 碎银
                </Text>
                <Text style={cs.reward}>邀请码: {guild.inviteCode}</Text>
            </View>
        </View>
    );
}

// ============================================================================
// MudVoiceInput (AC-11)
// ============================================================================

export function MudVoiceInput() {
    const [quota, setQuota] = useState<VoiceQuota | null>(null);
    const [packs, setPacks] = useState<CreditPack[]>([]);

    useEffect(() => {
        getVoiceQuota().then((r) => setQuota(r.quota));
        getCreditPacks().then((r) => setPacks(r.packs));
    }, []);

    const handleBuy = useCallback(async (packId: string) => {
        try {
            const res = await buyCredits(packId);
            Alert.alert('购买成功', res.message);
            getVoiceQuota().then((r) => setQuota(r.quota));
        } catch (e: any) {
            Alert.alert('购买失败', e.message);
        }
    }, []);

    return (
        <View style={cs.container}>
            <Text style={cs.title}>🎙️ 语音情报</Text>

            {quota && (
                <View style={cs.card}>
                    <Text style={cs.itemName}>
                        今日免费剩余: {quota.dailyFreeRemaining}/{quota.dailyFreeLimit}
                    </Text>
                    <Text style={cs.itemDesc}>语音点数: {quota.credits}</Text>
                </View>
            )}

            <Text style={cs.subtitle}>点数包</Text>
            {packs.map((pack) => (
                <TouchableOpacity
                    key={pack.id}
                    style={cs.card}
                    onPress={() => handleBuy(pack.id)}
                >
                    <Text style={cs.itemName}>{pack.label}</Text>
                    <Text style={cs.reward}>💰 {pack.priceSilver} 碎银</Text>
                </TouchableOpacity>
            ))}
        </View>
    );
}

// ============================================================================
// 共享样式
// ============================================================================

const cs = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0A0A1A', padding: 20, paddingTop: 60 },
    title: { fontSize: 22, fontWeight: '700', color: '#FFF', textAlign: 'center' },
    subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginTop: 8, marginBottom: 12 },
    card: {
        backgroundColor: '#1A1A2E',
        borderRadius: 14,
        padding: 16,
        marginTop: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
    },
    content: { fontSize: 14, color: 'rgba(255,255,255,0.8)', lineHeight: 20 },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
    reward: { fontSize: 14, color: '#FFD700', fontWeight: '600' },
    takeBtn: { backgroundColor: '#FF9500', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8 },
    takeText: { fontSize: 14, fontWeight: '700', color: '#FFF' },
    itemName: { fontSize: 16, fontWeight: '700', color: '#FFF' },
    itemDesc: { fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 4 },
    empty: { fontSize: 14, color: 'rgba(255,255,255,0.3)', textAlign: 'center', marginTop: 40 },
});
