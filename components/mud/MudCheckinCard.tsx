/**
 * MUD 每日签到卡片
 *
 * 嵌入首页档案下方，显示签到状态 + 一键签到按钮。
 */

import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
} from 'react-native';
import { doCheckin, type CheckinStatus, type CheckinResult } from '../../services/mud-api';

interface Props {
    status: CheckinStatus;
    onCheckinComplete?: (result: CheckinResult) => void;
}

export default function MudCheckinCard({ status, onCheckinComplete }: Props) {
    const [checked, setChecked] = useState(status.checkedInToday);
    const [streak, setStreak] = useState(status.streak);
    const [loading, setLoading] = useState(false);

    const handleCheckin = useCallback(async () => {
        if (checked || loading) return;
        setLoading(true);
        try {
            const result = await doCheckin();
            setChecked(true);
            setStreak(result.streak);
            const r = result.reward;
            Alert.alert(
                '✅ 签到成功',
                `获得 ${r.silver} 碎银、${r.qi} 真气、${r.exp} 经验\n连续签到 ${result.streak} 天`,
            );
            if (result.levelInfo.leveled_up) {
                Alert.alert('🎉 升级了！', `恭喜晋升为 ${result.levelInfo.levelTitle}（Lv.${result.levelInfo.level}）`);
            }
            onCheckinComplete?.(result);
        } catch (e: any) {
            Alert.alert('签到失败', e.message);
        }
        setLoading(false);
    }, [checked, loading, onCheckinComplete]);

    return (
        <View style={s.card}>
            <View style={s.row}>
                <View>
                    <Text style={s.title}>📅 每日签到</Text>
                    <Text style={s.sub}>
                        {checked ? '今日已签到 ✓' : '今日未签到'}
                        {streak > 0 && ` · 连续 ${streak} 天`}
                    </Text>
                </View>
                <TouchableOpacity
                    style={[s.btn, checked && s.btnDone]}
                    onPress={handleCheckin}
                    disabled={checked || loading}
                >
                    <Text style={s.btnText}>
                        {loading ? '...' : checked ? '已签' : '签到'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const s = StyleSheet.create({
    card: {
        backgroundColor: '#1A1A2E',
        borderRadius: 14,
        padding: 16,
        marginHorizontal: 16,
        marginTop: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,215,0,0.15)',
    },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    title: { fontSize: 16, fontWeight: '700', color: '#FFD700' },
    sub: { fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 4 },
    btn: {
        backgroundColor: '#FF9500',
        borderRadius: 12,
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    btnDone: { backgroundColor: '#333' },
    btnText: { fontSize: 14, fontWeight: '700', color: '#FFF' },
});
