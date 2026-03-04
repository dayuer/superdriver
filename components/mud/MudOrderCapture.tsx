/**
 * MUD 上报战果 — 截图识别订单 → 悬赏转化
 *
 * 流程: 拍照/相册选图 → 预览 → 上传 → AI 识别 → 确认 → 入账
 *
 * 需要: expo-image-picker (如未安装: npx expo install expo-image-picker)
 *
 * @alpha: P0 现实→游戏桥梁
 */

import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    StyleSheet,
    ActivityIndicator,
    Alert,
    ScrollView,
    Modal,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { uploadOrderScreenshot } from '../../services/mud-api';

// ── 类型 ──

interface OcrResult {
    order: {
        id: number;
        orderType: string;
        originAddress: string;
        destAddress: string;
        amount: number;
        source: string;
    };
    bounty: {
        id: number;
        reward: number;
        mudContent: string;
        targetProfession: string;
    };
    confidence: number;
}

type Phase = 'idle' | 'preview' | 'uploading' | 'result';

// ── 组件 ──

export default function MudOrderCapture({ onClose }: { onClose?: () => void }) {
    const [phase, setPhase] = useState<Phase>('idle');
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [imageBase64, setImageBase64] = useState<string | null>(null);
    const [result, setResult] = useState<OcrResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    // ---- 选择图片 ----

    const pickImage = useCallback(async (useCamera: boolean) => {
        const opts: ImagePicker.ImagePickerOptions = {
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.8,
            base64: true,
            allowsEditing: false,
        };

        let result;
        if (useCamera) {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('权限不足', '需要相机权限才能拍照');
                return;
            }
            result = await ImagePicker.launchCameraAsync(opts);
        } else {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('权限不足', '需要相册权限才能选择图片');
                return;
            }
            result = await ImagePicker.launchImageLibraryAsync(opts);
        }

        if (!result.canceled && result.assets?.[0]) {
            const asset = result.assets[0];
            setImageUri(asset.uri);
            setImageBase64(asset.base64 || null);
            setPhase('preview');
            setError(null);
        }
    }, []);

    // ---- 上传识别 ----

    const handleUpload = useCallback(async () => {
        if (!imageBase64) return;

        setPhase('uploading');
        setError(null);

        try {
            const res = await uploadOrderScreenshot(imageBase64, 'image/jpeg');
            setResult(res.data);
            setPhase('result');
        } catch (e: any) {
            const msg = e.response?.data?.detail || e.message || '识别失败';
            setError(msg);
            setPhase('preview');
            Alert.alert('识别失败', msg);
        }
    }, [imageBase64]);

    // ---- 重新选择 ----

    const handleReset = useCallback(() => {
        setPhase('idle');
        setImageUri(null);
        setImageBase64(null);
        setResult(null);
        setError(null);
    }, []);

    // ════════════════════════════════════════════
    // 渲染
    // ════════════════════════════════════════════

    return (
        <ScrollView style={s.container} contentContainerStyle={s.content}>
            {/* 标题 */}
            <Text style={s.title}>📸 上报战果</Text>
            <Text style={s.subtitle}>
                截图你的完单页面，AI 自动识别并转化为悬赏奖励
            </Text>

            {/* ---- 空闲: 选择方式 ---- */}
            {phase === 'idle' && (
                <View style={s.pickArea}>
                    <Text style={s.pickHint}>选择订单截图来源</Text>

                    <TouchableOpacity
                        style={[s.pickBtn, s.cameraBtn]}
                        onPress={() => pickImage(true)}
                    >
                        <Text style={s.pickEmoji}>📷</Text>
                        <Text style={s.pickLabel}>拍照</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[s.pickBtn, s.albumBtn]}
                        onPress={() => pickImage(false)}
                    >
                        <Text style={s.pickEmoji}>🖼️</Text>
                        <Text style={s.pickLabel}>从相册选择</Text>
                    </TouchableOpacity>

                    <Text style={s.supportText}>
                        支持: 滴滴 · 高德 · 美团 · 花小猪 · T3 · 曹操 · 饿了么
                    </Text>
                </View>
            )}

            {/* ---- 预览: 确认上传 ---- */}
            {phase === 'preview' && imageUri && (
                <View style={s.previewArea}>
                    <Image source={{ uri: imageUri }} style={s.previewImg} resizeMode="contain" />

                    {error && <Text style={s.errorText}>⚠️ {error}</Text>}

                    <View style={s.btnRow}>
                        <TouchableOpacity style={s.cancelBtn} onPress={handleReset}>
                            <Text style={s.cancelText}>重选</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={s.uploadBtn} onPress={handleUpload}>
                            <Text style={s.uploadText}>🔍 识别订单</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {/* ---- 上传中 ---- */}
            {phase === 'uploading' && (
                <View style={s.loadingArea}>
                    <ActivityIndicator size="large" color="#FFD700" />
                    <Text style={s.loadingText}>AI 正在识别战果...</Text>
                    <Text style={s.loadingHint}>通常需要 3-5 秒</Text>
                </View>
            )}

            {/* ---- 结果: 展示奖励 ---- */}
            {phase === 'result' && result && (
                <View style={s.resultArea}>
                    <Text style={s.victoryTitle}>🎉 战果已入账！</Text>

                    {/* 订单信息 */}
                    <View style={s.infoCard}>
                        <Text style={s.infoTitle}>📋 订单识别</Text>
                        <Text style={s.infoRow}>
                            平台: {result.order.source} · {result.order.orderType}
                        </Text>
                        <Text style={s.infoRow}>
                            {result.order.originAddress || '起点'} → {result.order.destAddress || '终点'}
                        </Text>
                        <Text style={s.amountRow}>¥{result.order.amount}</Text>
                        <Text style={s.confidenceRow}>
                            识别置信度: {Math.round((result.confidence || 0) * 100)}%
                        </Text>
                    </View>

                    {/* 悬赏奖励 */}
                    <View style={s.rewardCard}>
                        <Text style={s.rewardTitle}>🏆 悬赏奖励</Text>
                        <Text style={s.rewardContent}>
                            {result.bounty.mudContent}
                        </Text>
                        <Text style={s.silverText}>
                            💰 +{result.bounty.reward} 碎银
                        </Text>
                        <Text style={s.qiRewardText}>
                            ⚡ +10 内力
                        </Text>
                    </View>

                    {/* 操作按钮 */}
                    <TouchableOpacity style={s.continueBtn} onPress={handleReset}>
                        <Text style={s.continueText}>继续上报</Text>
                    </TouchableOpacity>

                    {onClose && (
                        <TouchableOpacity style={s.closeBtn} onPress={onClose}>
                            <Text style={s.closeText}>返回江湖</Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}
        </ScrollView>
    );
}

// ════════════════════════════════════════════════════════════════════
// 样式
// ════════════════════════════════════════════════════════════════════

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0A0A1A' },
    content: { padding: 20, paddingTop: 60, paddingBottom: 40 },

    title: { fontSize: 24, fontWeight: '700', color: '#FFF', textAlign: 'center' },
    subtitle: {
        fontSize: 14, color: 'rgba(255,255,255,0.5)',
        textAlign: 'center', marginTop: 8, marginBottom: 24,
    },

    // 选择方式
    pickArea: { alignItems: 'center', marginTop: 20 },
    pickHint: { fontSize: 14, color: 'rgba(255,255,255,0.4)', marginBottom: 20 },
    pickBtn: {
        width: '100%', borderRadius: 16, paddingVertical: 20,
        alignItems: 'center', marginBottom: 12,
    },
    cameraBtn: { backgroundColor: '#FF9500' },
    albumBtn: {
        backgroundColor: '#1A1A2E',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    },
    pickEmoji: { fontSize: 32 },
    pickLabel: { fontSize: 16, fontWeight: '600', color: '#FFF', marginTop: 4 },
    supportText: {
        fontSize: 12, color: 'rgba(255,255,255,0.3)',
        textAlign: 'center', marginTop: 20, lineHeight: 18,
    },

    // 预览
    previewArea: { alignItems: 'center', marginTop: 12 },
    previewImg: {
        width: '100%', height: 400, borderRadius: 12,
        backgroundColor: '#1A1A2E',
    },
    errorText: { color: '#FF3B30', fontSize: 13, marginTop: 8 },
    btnRow: {
        flexDirection: 'row', gap: 12, marginTop: 16, width: '100%',
    },
    cancelBtn: {
        flex: 1, backgroundColor: '#1A1A2E', borderRadius: 14,
        paddingVertical: 14, alignItems: 'center',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    },
    cancelText: { fontSize: 16, color: 'rgba(255,255,255,0.6)' },
    uploadBtn: {
        flex: 2, backgroundColor: '#FFD700', borderRadius: 14,
        paddingVertical: 14, alignItems: 'center',
    },
    uploadText: { fontSize: 16, fontWeight: '700', color: '#0A0A1A' },

    // 上传中
    loadingArea: { alignItems: 'center', marginTop: 60 },
    loadingText: {
        fontSize: 18, fontWeight: '600', color: '#FFD700', marginTop: 20,
    },
    loadingHint: { fontSize: 13, color: 'rgba(255,255,255,0.3)', marginTop: 8 },

    // 结果
    resultArea: { marginTop: 8 },
    victoryTitle: {
        fontSize: 26, fontWeight: '700', color: '#34C759',
        textAlign: 'center', marginBottom: 20,
    },
    infoCard: {
        backgroundColor: '#1A1A2E', borderRadius: 14, padding: 16,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
    },
    infoTitle: { fontSize: 14, fontWeight: '600', color: 'rgba(255,255,255,0.5)' },
    infoRow: { fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 6 },
    amountRow: {
        fontSize: 28, fontWeight: '700', color: '#FFF', marginTop: 8,
    },
    confidenceRow: {
        fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 4,
    },
    rewardCard: {
        backgroundColor: 'rgba(255,215,0,0.08)', borderRadius: 14,
        padding: 16, marginTop: 12,
        borderWidth: 1, borderColor: 'rgba(255,215,0,0.15)',
    },
    rewardTitle: { fontSize: 14, fontWeight: '600', color: '#FFD700' },
    rewardContent: {
        fontSize: 14, color: 'rgba(255,255,255,0.7)',
        marginTop: 8, lineHeight: 20,
    },
    silverText: {
        fontSize: 20, fontWeight: '700', color: '#FFD700', marginTop: 12,
    },
    qiRewardText: {
        fontSize: 14, color: '#5856D6', marginTop: 4,
    },
    continueBtn: {
        backgroundColor: '#5856D6', borderRadius: 14,
        paddingVertical: 14, alignItems: 'center', marginTop: 20,
    },
    continueText: { fontSize: 16, fontWeight: '700', color: '#FFF' },
    closeBtn: {
        borderRadius: 14, paddingVertical: 12,
        alignItems: 'center', marginTop: 8,
    },
    closeText: { fontSize: 14, color: 'rgba(255,255,255,0.4)' },
});
