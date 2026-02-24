/**
 * VoiceRecordingOverlay — Typeless 风格语音录制 v3
 *
 * 设计原则:
 *   1. 只有 2 个阶段: listening → editing (没有中间 loading)
 *   2. 只有 1 个文本容器，录音时只读显示，停录后变可编辑
 *   3. TextInput 自管滚动，不嵌套 ScrollView，杜绝跳动
 *   4. 最终整理在后台静默完成，不阻断用户
 *
 * 边录边整理 + 熔断机制:
 *   - 每 3 秒 LLM 整理一次 (快照 + 尾部保留)
 *   - 连续 2 次文本无变化 → 停止轮询
 *   - STT 有新文字 → 自动恢复轮询
 *   - 单次录音最多 20 次整理 (硬上限)
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    Dimensions,
    TouchableOpacity,
    TextInput,
    Platform,
    ActivityIndicator,
    KeyboardAvoidingView,
    Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import * as Device from 'expo-device';
import {
    ExpoSpeechRecognitionModule,
    useSpeechRecognitionEvent,
} from 'expo-speech-recognition';
import { Audio } from 'expo-av';
import { BASE_URL } from '../../services/api';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

type Phase = 'listening' | 'editing';

// ═══ Mock ═══
const MOCK_RAW = '嗯那个就是我在高速上面被追尾了就是对方全责的然后那个保险公司他不不赔停运损失';
const MOCK_POLISHED = '我在高速上被追尾了，对方全责，但保险公司不赔停运损失。';

function isSimulator(): boolean {
    return !Device.isDevice;
}

const POLISH_INTERVAL = 3000;
const POLISH_MIN_CHARS = 8;
const CIRCUIT_BREAKER_THRESHOLD = 2;
const MAX_POLISH_CALLS = 20;
const MAX_DURATION = 60;               // 最长录音 60 秒
const MAX_TEXT_LENGTH = 200;           // 数据库 summary VarChar(200)

interface Props {
    visible: boolean;
    onCancel: () => void;
    onSend: (text: string) => void;
}

export const VoiceRecordingOverlay: React.FC<Props> = ({
    visible,
    onCancel,
    onSend,
}) => {
    const insets = useSafeAreaInsets();
    const [phase, setPhase] = useState<Phase>('listening');
    const [editorText, setEditorText] = useState('');
    const [duration, setDuration] = useState(0);
    const [isMock, setIsMock] = useState(false);
    const [keyboardH, setKeyboardH] = useState(0);
    const [isPolishing, setIsPolishing] = useState(false);

    const inputRef = useRef<TextInput>(null);
    const recordingRef = useRef<Audio.Recording | null>(null);
    const audioUriRef = useRef<string | null>(null);
    const mockTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // ═══ 核心文本 Ref ═══
    const editorTextRef = useRef('');
    const prevRawLenRef = useRef(0);
    const polishTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const polishInFlightRef = useRef(false);

    // ═══ 熔断 ═══
    const lastPolishedTextRef = useRef('');
    const noChangeCountRef = useRef(0);
    const polishCallCountRef = useRef(0);
    const polishLoopStoppedRef = useRef(false);

    // ═══ 动画 ═══
    const overlayOpacity = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    // 波形
    const barAnims = useRef(
        Array.from({ length: 14 }, () => new Animated.Value(0.3))
    ).current;
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const waveRef = useRef<Animated.CompositeAnimation | null>(null);
    const pulseLoopRef = useRef<Animated.CompositeAnimation | null>(null);

    // ═══ editorText 同步 ═══
    const updateEditor = useCallback((text: string) => {
        editorTextRef.current = text;
        setEditorText(text);
    }, []);

    // ═══ 键盘 ═══
    useEffect(() => {
        const showSub = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
            (e) => setKeyboardH(e.endCoordinates.height)
        );
        const hideSub = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
            () => setKeyboardH(0)
        );
        return () => { showSub.remove(); hideSub.remove(); };
    }, []);

    // ═══ STT → 增量追加 ═══
    useSpeechRecognitionEvent('result', (ev) => {
        if (isMock) return;
        const results = ev.results;
        if (results && results.length > 0) {
            const raw = results[results.length - 1]?.transcript || '';
            if (raw.length > prevRawLenRef.current) {
                const delta = raw.slice(prevRawLenRef.current);
                prevRawLenRef.current = raw.length;
                updateEditor(editorTextRef.current + delta);

                // 有新文字 → 重置熔断，恢复轮询
                noChangeCountRef.current = 0;
                if (polishLoopStoppedRef.current && !polishTimerRef.current) {
                    polishLoopStoppedRef.current = false;
                    startPolishLoop();
                }
            }
        }
    });

    useSpeechRecognitionEvent('error', (ev) => {
        console.warn('[STT] error:', ev.error, ev.message);
    });

    // ═══ 停止轮询 (先定义，doPolish 依赖) ═══
    const stopPolishLoop = useCallback(() => {
        if (polishTimerRef.current) {
            clearInterval(polishTimerRef.current);
            polishTimerRef.current = null;
        }
    }, []);

    // ═══ LLM 整理 (含熔断) ═══
    const doPolish = useCallback(async () => {
        const text = editorTextRef.current;
        if (!text || text.trim().length < POLISH_MIN_CHARS) return;
        if (polishInFlightRef.current) return;

        // 熔断: 文本无变化
        if (text === lastPolishedTextRef.current) {
            noChangeCountRef.current++;
            if (noChangeCountRef.current >= CIRCUIT_BREAKER_THRESHOLD) {
                console.log('[Polish] 🔴 熔断: 连续无变化，停止轮询');
                polishLoopStoppedRef.current = true;
                stopPolishLoop();
            }
            return;
        }

        // 熔断: 次数上限
        if (polishCallCountRef.current >= MAX_POLISH_CALLS) {
            console.log('[Polish] 🔴 熔断: 达到上限', MAX_POLISH_CALLS);
            polishLoopStoppedRef.current = true;
            stopPolishLoop();
            return;
        }

        noChangeCountRef.current = 0;
        lastPolishedTextRef.current = text;
        polishCallCountRef.current++;

        polishInFlightRef.current = true;
        setIsPolishing(true);
        const snapshotLen = text.length;

        try {
            // [C-03 修复] 使用带认证的 api 实例替代裸 fetch
            const { default: api } = await import('../../services/api');
            const { data: result } = await api.post('/voice/polish', { text });
            if (result.success && result.data?.polished) {
                const current = editorTextRef.current;
                const tail = current.slice(snapshotLen);
                updateEditor(result.data.polished + tail);
            }
        } catch (e) {
            console.warn('[Polish] error:', e);
        } finally {
            polishInFlightRef.current = false;
            setIsPolishing(false);
        }
    }, [updateEditor, stopPolishLoop]);

    // ═══ 开始轮询 ═══
    const startPolishLoop = useCallback(() => {
        polishLoopStoppedRef.current = false;
        polishTimerRef.current = setInterval(doPolish, POLISH_INTERVAL);
    }, [doPolish]);

    // ═══ 入场 / 离场 ═══
    useEffect(() => {
        if (visible) {
            const mock = isSimulator();
            setIsMock(mock);
            setPhase('listening');
            updateEditor('');
            setDuration(0);
            setIsPolishing(false);
            audioUriRef.current = null;
            prevRawLenRef.current = 0;
            polishInFlightRef.current = false;
            lastPolishedTextRef.current = '';
            noChangeCountRef.current = 0;
            polishCallCountRef.current = 0;
            polishLoopStoppedRef.current = false;

            Animated.timing(overlayOpacity, {
                toValue: 1, duration: 200, useNativeDriver: true,
            }).start();

            startListening(mock);
        } else {
            Animated.timing(overlayOpacity, {
                toValue: 0, duration: 150, useNativeDriver: true,
            }).start();
            stopAll();
        }
        return () => stopAll();
    }, [visible]);


    // ═══ Mock STT ═══
    const startMockSTT = useCallback(() => {
        let idx = 0;
        mockTimerRef.current = setInterval(() => {
            idx++;
            if (idx <= MOCK_RAW.length) {
                updateEditor(editorTextRef.current + MOCK_RAW[idx - 1]);
            }
            if (idx === Math.floor(MOCK_RAW.length * 0.6)) {
                const partial = editorTextRef.current;
                setTimeout(() => {
                    const tail = editorTextRef.current.slice(partial.length);
                    updateEditor('我在高速上面被追尾了，对方全责，' + tail);
                }, 500);
            }
        }, 120);
    }, [updateEditor]);

    const stopMockSTT = useCallback(() => {
        if (mockTimerRef.current) {
            clearInterval(mockTimerRef.current);
            mockTimerRef.current = null;
        }
    }, []);

    // ═══ 开始录音 ═══
    const startListening = useCallback(async (mock?: boolean) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});

        if (mock) {
            startMockSTT();
        } else {
            const { granted } = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
            if (!granted) return;
            ExpoSpeechRecognitionModule.start({
                lang: 'zh-CN', interimResults: true, continuous: true,
            });
            try {
                await Audio.setAudioModeAsync({
                    allowsRecordingIOS: true, playsInSilentModeIOS: true,
                });
                const { recording } = await Audio.Recording.createAsync(
                    Audio.RecordingOptionsPresets.HIGH_QUALITY
                );
                recordingRef.current = recording;
            } catch (e) {
                console.warn('[Audio] recording start failed:', e);
            }
            startPolishLoop();
        }

        timerRef.current = setInterval(() => setDuration(p => p + 1), 1000);
        startWaveAnimation();
    }, [startMockSTT, startPolishLoop]);

    // ═══ 停止一切 ═══
    const stopAll = useCallback(() => {
        if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
        stopMockSTT();
        stopPolishLoop();
        try { ExpoSpeechRecognitionModule.stop(); } catch (_) {}
        waveRef.current?.stop();
        pulseLoopRef.current?.stop();
        barAnims.forEach(b => b.setValue(0.3));
        pulseAnim.setValue(1);
    }, [barAnims, pulseAnim, stopMockSTT, stopPolishLoop]);

    // ═══ 波形 ═══
    const startWaveAnimation = useCallback(() => {
        const loop = () => {
            const anims = barAnims.map(bar =>
                Animated.timing(bar, {
                    toValue: Math.random() * 0.7 + 0.3,
                    duration: 60 + Math.random() * 140,
                    useNativeDriver: true,
                })
            );
            waveRef.current = Animated.parallel(anims);
            waveRef.current.start(() => { if (timerRef.current) loop(); });
        };
        loop();
        pulseLoopRef.current = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.2, duration: 700, useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
            ])
        );
        pulseLoopRef.current.start();
    }, [barAnims, pulseAnim]);

    // ═══ 停止录音 → 静默最终整理 → 直接编辑 ═══
    const handleStopRecording = useCallback(async () => {
        if (recordingRef.current) {
            try {
                await recordingRef.current.stopAndUnloadAsync();
                audioUriRef.current = recordingRef.current.getURI();
            } catch (_) {}
            recordingRef.current = null;
        }
        stopAll();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

        // 直接进入编辑，不等 LLM
        setPhase('editing');
        setTimeout(() => inputRef.current?.focus(), 100);

        // 后台静默做最终整理
        const currentText = editorTextRef.current;
        if (isMock) {
            // mock: 短延迟后替换
            setTimeout(() => updateEditor(MOCK_POLISHED), 400);
        } else if (currentText.trim().length >= POLISH_MIN_CHARS) {
            setIsPolishing(true);
            try {
                // [C-03 修复] 使用带认证的 api 实例替代裸 fetch
                const { default: api } = await import('../../services/api');
                const { data: result } = await api.post('/voice/polish', { text: currentText });
                if (result.success && result.data?.polished) {
                    updateEditor(result.data.polished);
                }
            } catch (_) {
                // 保留当前文本
            } finally {
                setIsPolishing(false);
            }
        }
    }, [isMock, stopAll, updateEditor]);

    // ═══ 60 秒自动停止 ═══
    useEffect(() => {
        if (phase === 'listening' && duration >= MAX_DURATION) {
            handleStopRecording();
        }
    }, [duration, phase, handleStopRecording]);

    // ═══ 取消 ═══
    const handleCancel = useCallback(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        if (recordingRef.current) {
            recordingRef.current.stopAndUnloadAsync().catch(() => {});
            recordingRef.current = null;
        }
        stopAll();
        audioUriRef.current = null;
        onCancel();
    }, [stopAll, onCancel]);

    // ═══ 发送 ═══
    const handleSend = useCallback(() => {
        const text = editorText.trim();
        if (!text) return;
        Keyboard.dismiss();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        onSend(text);
    }, [editorText, onSend]);

    const fmt = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

    if (!visible) return null;

    // ═══════════════════════ RENDER ═══════════════════════

    return (
        <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
            <KeyboardAvoidingView
                style={styles.root}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={0}
            >
                <View style={[styles.container, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 8 }]}>

                    {/* ═══ 顶栏 ═══ */}
                    <View style={styles.topBar}>
                        <TouchableOpacity
                            onPress={handleCancel}
                            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                        >
                            <Ionicons name="close-circle" size={26} color="#666" />
                        </TouchableOpacity>

                        <View style={styles.topCenter}>
                            {phase === 'listening' && (
                                <>
                                    <Animated.View style={[
                                        styles.recDot,
                                        { transform: [{ scale: pulseAnim }] },
                                    ]} />
                                    <Text style={styles.topLabel}>正在聆听</Text>
                                    <Text style={[
                                        styles.durationText,
                                        duration >= 50 && { color: '#FF3B30', fontWeight: '600' },
                                    ]}>
                                        {duration >= 50 ? `剩 ${MAX_DURATION - duration}s` : fmt(duration)}
                                    </Text>
                                </>
                            )}
                            {phase === 'editing' && (
                                <>
                                    <Ionicons name="sparkles" size={14} color="#34C759" />
                                    <Text style={styles.topLabel}>确认发送</Text>
                                </>
                            )}
                        </View>

                        <View style={{ width: 26 }}>
                            {isMock && (
                                <View style={styles.mockBadge}>
                                    <Text style={styles.mockBadgeText}>M</Text>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* ═══ 文本区 (唯一，不切换) ═══ */}
                    <View style={[
                        styles.textBox,
                        phase === 'editing' && styles.textBoxEditing,
                    ]}>
                        {phase === 'listening' ? (
                            // 录音中: 只读 Text，自带 ScrollView
                            <TextInput
                                style={[styles.textContent, styles.textReadonly]}
                                value={editorText || '请开始说话...'}
                                editable={false}
                                multiline
                                scrollEnabled
                                showSoftInputOnFocus={false}
                            />
                        ) : (
                            // 编辑中: 原生可编辑 TextInput，自己管滚动
                            <TextInput
                                ref={inputRef}
                                style={styles.textContent}
                                value={editorText}
                                onChangeText={updateEditor}
                                multiline
                                scrollEnabled
                                maxLength={MAX_TEXT_LENGTH}
                                placeholder="编辑内容..."
                                placeholderTextColor="#555"
                                selectionColor="#34C759"
                                autoCorrect={false}
                            />
                        )}
                    </View>

                    {/* 字数 */}
                    {editorText.length > 0 && (
                        <Text style={[
                            styles.charHint,
                            editorText.length > MAX_TEXT_LENGTH * 0.85 && { color: '#FF9500' },
                            editorText.length >= MAX_TEXT_LENGTH && { color: '#FF3B30' },
                        ]}>
                            {editorText.length}/{MAX_TEXT_LENGTH}
                        </Text>
                    )}

                    {/* ═══ 底部操作区 ═══ */}
                    {phase === 'listening' ? (
                        // 录音底部: 波形 + 结束按钮
                        <View style={styles.listeningBottom}>
                            {/* 波形胶囊 */}
                            <View style={styles.bubble}>
                                <View style={styles.barGroup}>
                                    {barAnims.map((anim, i) => (
                                        <Animated.View
                                            key={i}
                                            style={[
                                                styles.bar,
                                                { transform: [{ scaleY: anim }] },
                                            ]}
                                        />
                                    ))}
                                </View>
                            </View>

                            {/* 操作行 */}
                            <View style={styles.listeningActions}>
                                <TouchableOpacity style={styles.cancelTap} onPress={handleCancel}>
                                    <Text style={styles.cancelLabel}>取消</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.stopBtn}
                                    onPress={handleStopRecording}
                                    activeOpacity={0.8}
                                >
                                    <LinearGradient
                                        colors={['#34C759', '#2DB54D']}
                                        style={styles.stopBtnGrad}
                                    >
                                        <Ionicons name="checkmark" size={22} color="#fff" />
                                        <Text style={styles.stopBtnText}>完成</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                                <View style={styles.convertHint}>
                                    <Ionicons name="sparkles-outline" size={12} color="#555" />
                                    <Text style={styles.convertLabel}>边录边整理</Text>
                                </View>
                            </View>
                        </View>
                    ) : (
                        // 编辑底部: 重录 + 发送
                        <View style={styles.editActions}>
                            <TouchableOpacity
                                style={styles.reRecordBtn}
                                onPress={() => {
                                    Keyboard.dismiss();
                                    setPhase('listening');
                                    updateEditor('');
                                    setDuration(0);
                                    audioUriRef.current = null;
                                    prevRawLenRef.current = 0;
                                    polishInFlightRef.current = false;
                                    lastPolishedTextRef.current = '';
                                    noChangeCountRef.current = 0;
                                    polishCallCountRef.current = 0;
                                    polishLoopStoppedRef.current = false;
                                    startListening(isMock);
                                }}
                            >
                                <Ionicons name="mic" size={18} color="#fff" />
                                <Text style={styles.reRecordLabel}>重新录音</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.sendBtn, !editorText.trim() && styles.sendBtnOff]}
                                onPress={handleSend}
                                disabled={!editorText.trim()}
                                activeOpacity={0.85}
                            >
                                <LinearGradient colors={['#34C759', '#2DB54D']} style={styles.sendGrad}>
                                    <Ionicons name="arrow-up" size={20} color="#fff" />
                                    <Text style={styles.sendLabel}>发送</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </KeyboardAvoidingView>
        </Animated.View>
    );
};

// ═══════════════════════════════════════════════════════════
const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.92)',
        zIndex: 9999,
    },
    root: { flex: 1 },
    container: { flex: 1, paddingHorizontal: 20 },

    // ═══ 顶栏 ═══
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 44,
        marginBottom: 12,
    },
    topCenter: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
    },
    recDot: {
        width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF3B30',
    },
    topLabel: { fontSize: 15, color: '#ccc', fontWeight: '600' },
    durationText: {
        fontSize: 13, color: '#666', fontVariant: ['tabular-nums'],
    },
    polishingTag: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        backgroundColor: 'rgba(52,199,89,0.12)',
        paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8,
    },
    polishingTagText: { fontSize: 10, color: '#34C759', fontWeight: '500' },
    mockBadge: {
        backgroundColor: 'rgba(255,149,0,0.25)',
        width: 20, height: 20, borderRadius: 10,
        alignItems: 'center', justifyContent: 'center',
    },
    mockBadgeText: {
        fontSize: 10, color: '#FF9500', fontWeight: '700',
    },

    // ═══ 统一文本框 ═══
    textBox: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderRadius: 16,
        borderWidth: 0.5,
        borderColor: 'rgba(255,255,255,0.08)',
        overflow: 'hidden',
    },
    textBoxEditing: {
        borderColor: 'rgba(52,199,89,0.3)',
        borderWidth: 1,
    },
    textContent: {
        flex: 1,
        fontSize: 19,
        color: '#fff',
        lineHeight: 30,
        fontWeight: '400',
        letterSpacing: 0.2,
        padding: 16,
        textAlignVertical: 'top',
    },
    textReadonly: {
        color: 'rgba(255,255,255,0.85)',
    },
    charHint: {
        fontSize: 11, color: '#555', textAlign: 'right',
        marginTop: 6, marginRight: 4,
    },

    // ═══ 录音底部 ═══
    listeningBottom: {
        alignItems: 'center',
        paddingTop: 16,
    },
    bubble: {
        width: 180, height: 48, backgroundColor: '#34C759', borderRadius: 24,
        alignItems: 'center', justifyContent: 'center',
        shadowColor: '#34C759', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4, shadowRadius: 16, elevation: 8,
        marginBottom: 20,
    },
    barGroup: { flexDirection: 'row', alignItems: 'center', gap: 3, height: 24 },
    bar: {
        width: 3, height: 24, borderRadius: 1.5, backgroundColor: 'rgba(255,255,255,0.85)',
    },
    listeningActions: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        width: '100%', gap: 16,
    },
    cancelTap: { paddingHorizontal: 16, paddingVertical: 10 },
    cancelLabel: { fontSize: 15, color: '#999', fontWeight: '500' },
    stopBtn: { borderRadius: 14, overflow: 'hidden' },
    stopBtnGrad: {
        flexDirection: 'row', alignItems: 'center',
        gap: 6, paddingHorizontal: 28, height: 48,
    },
    stopBtnText: { fontSize: 16, color: '#fff', fontWeight: '700' },
    convertHint: {
        flexDirection: 'row', alignItems: 'center', gap: 3,
    },
    convertLabel: { fontSize: 11, color: '#555' },

    // ═══ 编辑底部 ═══
    editActions: {
        flexDirection: 'row', gap: 12, paddingTop: 12,
    },
    reRecordBtn: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 6, height: 50, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.1)',
    },
    reRecordLabel: { fontSize: 15, color: '#fff', fontWeight: '500' },
    sendBtn: { flex: 1.5, borderRadius: 14, overflow: 'hidden' },
    sendBtnOff: { opacity: 0.4 },
    sendGrad: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 6, height: 50,
    },
    sendLabel: { fontSize: 16, color: '#fff', fontWeight: '700' },
});

export default VoiceRecordingOverlay;
