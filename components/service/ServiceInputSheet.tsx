/**
 * ServiceInputSheet — 服务创建入口
 *
 * 从首页语音按钮触发，用户输入问题 → 自动创建服务事件
 * 
 * 设计理念：对话是有目的的，不是闲聊。
 * 每次用户输入都会创建或匹配一个服务事件。
 */
import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Modal,
    Animated,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Dimensions,
} from 'react-native';
import { BASE_URL } from '../../services/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { PRIMARY, SUCCESS, TEXT, BACKGROUND, BORDER } from '../../styles/colors';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

/** 快捷服务模板 */
const QUICK_SERVICES = [
    { icon: '🚗', label: '交通事故', type: 'legal_case', prompt: '我遇到了交通事故' },
    { icon: '📋', label: '保险理赔', type: 'insurance_claim', prompt: '我需要保险理赔' },
    { icon: '🔧', label: '车辆维修', type: 'vehicle_repair', prompt: '我的车需要维修' },
    { icon: '⚖️', label: '法律咨询', type: 'legal_case', prompt: '我有法律问题想咨询' },
    { icon: '💼', label: '劳动纠纷', type: 'legal_case', prompt: '我和公司有劳动纠纷' },
    { icon: '🏥', label: '工伤认定', type: 'compound', prompt: '我在工作中受伤了' },
];

interface Props {
    visible: boolean;
    onClose: () => void;
    onServiceCreated: (eventId: number) => void;
}

export const ServiceInputSheet: React.FC<Props> = ({ visible, onClose, onServiceCreated }) => {
    const insets = useSafeAreaInsets();
    const [inputText, setInputText] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
    const inputRef = useRef<TextInput>(null);

    useEffect(() => {
        if (visible) {
            Animated.spring(slideAnim, {
                toValue: 0,
                useNativeDriver: true,
                damping: 25,
                stiffness: 200,
            }).start(() => {
                // 自动聚焦输入框
                setTimeout(() => inputRef.current?.focus(), 100);
            });
        } else {
            Animated.timing(slideAnim, {
                toValue: SCREEN_HEIGHT,
                duration: 250,
                useNativeDriver: true,
            }).start();
            setInputText('');
            setIsCreating(false);
        }
    }, [visible, slideAnim]);

    /** 发送用户输入，创建服务事件 */
    const handleSubmit = async (text: string) => {
        const content = text.trim();
        if (!content || isCreating) return;

        setIsCreating(true);

        try {
            // [C-03 修复] 使用带认证的 api 实例替代裸 fetch
            const { default: api } = await import('../../services/api');
            const { data } = await api.post('/service/events', {
                title: content.slice(0, 50),
                event_type: guessEventType(content),
                status: 'consulting',
                priority: 'normal',
                summary: content,
                expert_role_ids: guessExperts(content),
                primary_role_id: guessExperts(content)[0] || 'general',
                total_steps: 0,
            });
            if (data.success && data.data?.id) {
                onServiceCreated(data.data.id);
                onClose();
            } else {
                console.warn('[ServiceInput] 创建失败:', data);
                setIsCreating(false);
            }
        } catch (error) {
            console.error('[ServiceInput] 网络错误:', error);
            setIsCreating(false);
        }
    };

    /** 快捷模板点击 */
    const handleQuickService = (template: typeof QUICK_SERVICES[0]) => {
        handleSubmit(template.prompt);
    };

    return (
        <Modal visible={visible} transparent animationType="none">
            {/* 蒙层 */}
            <TouchableOpacity
                style={styles.backdrop}
                activeOpacity={1}
                onPress={onClose}
            />

            <Animated.View
                style={[
                    styles.sheet,
                    {
                        paddingBottom: insets.bottom + 16,
                        transform: [{ translateY: slideAnim }],
                    },
                ]}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    keyboardVerticalOffset={0}
                >
                    {/* 拖拽手柄 */}
                    <View style={styles.handle} />

                    {/* 标题 */}
                    <Text style={styles.title}>有什么需要帮忙？</Text>
                    <Text style={styles.subtitle}>描述你的问题，专家团队会立即跟进</Text>

                    {/* 快捷服务 */}
                    <View style={styles.quickGrid}>
                        {QUICK_SERVICES.map((item, i) => (
                            <TouchableOpacity
                                key={i}
                                style={styles.quickItem}
                                onPress={() => handleQuickService(item)}
                                disabled={isCreating}
                            >
                                <Text style={styles.quickIcon}>{item.icon}</Text>
                                <Text style={styles.quickLabel}>{item.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* 分割线 */}
                    <View style={styles.divider}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>或直接描述</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    {/* 输入框 */}
                    <View style={styles.inputRow}>
                        <TextInput
                            ref={inputRef}
                            style={styles.input}
                            placeholder="例如：我在高速上被追尾了..."
                            placeholderTextColor="#C7C7CC"
                            value={inputText}
                            onChangeText={setInputText}
                            multiline
                            maxLength={500}
                            editable={!isCreating}
                            returnKeyType="send"
                            onSubmitEditing={() => handleSubmit(inputText)}
                        />
                        <TouchableOpacity
                            style={[
                                styles.sendBtn,
                                (!inputText.trim() || isCreating) && styles.sendBtnDisabled,
                            ]}
                            onPress={() => handleSubmit(inputText)}
                            disabled={!inputText.trim() || isCreating}
                        >
                            {isCreating ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Ionicons name="arrow-up" size={20} color="#fff" />
                            )}
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </Animated.View>
        </Modal>
    );
};

// ============================================================================
// 辅助函数
// ============================================================================

/** 根据用户输入猜测事件类型 */
function guessEventType(text: string): string {
    const lower = text.toLowerCase();
    if (/追尾|碰撞|事故|撞|刮擦/.test(lower)) return 'legal_case';
    if (/理赔|保险|定损|报案/.test(lower)) return 'insurance_claim';
    if (/维修|修车|换胎|保养|故障/.test(lower)) return 'vehicle_repair';
    if (/合同|纠纷|法律|起诉|仲裁|劳动|工资|欠薪/.test(lower)) return 'legal_case';
    if (/工伤|受伤|医疗/.test(lower)) return 'compound';
    return 'compound';
}

/** 根据用户输入猜测需要哪些专家 */
function guessExperts(text: string): string[] {
    const experts: string[] = [];
    if (/追尾|碰撞|事故|撞|法律|起诉|合同|纠纷|仲裁|劳动|工资/.test(text)) experts.push('legal');
    if (/理赔|保险|定损|报案/.test(text)) experts.push('insurance');
    if (/维修|修车|换胎|保养|故障/.test(text)) experts.push('mechanic');
    if (/工伤|受伤|医疗|健康/.test(text)) experts.push('health');
    if (experts.length === 0) experts.push('general');
    return experts;
}



const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    sheet: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: BACKGROUND.card,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingHorizontal: 20,
        paddingTop: 12,
        maxHeight: SCREEN_HEIGHT * 0.7,
    },
    handle: {
        width: 36,
        height: 4,
        backgroundColor: '#D1D1D6',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: TEXT.primary,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: TEXT.tertiary,
        marginBottom: 20,
    },
    // 快捷服务网格
    quickGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 16,
    },
    quickItem: {
        width: '30%',
        flexGrow: 1,
        alignItems: 'center',
        paddingVertical: 14,
        backgroundColor: '#F5F5F7',
        borderRadius: 12,
    },
    quickIcon: {
        fontSize: 24,
        marginBottom: 4,
    },
    quickLabel: {
        fontSize: 12,
        fontWeight: '500',
        color: TEXT.secondary,
    },
    // 分割线
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 12,
    },
    dividerLine: {
        flex: 1,
        height: 0.5,
        backgroundColor: BORDER.light,
    },
    dividerText: {
        fontSize: 12,
        color: TEXT.tertiary,
        marginHorizontal: 12,
    },
    // 输入
    inputRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 10,
    },
    input: {
        flex: 1,
        backgroundColor: '#F5F5F7',
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 15,
        color: TEXT.primary,
        maxHeight: 100,
        lineHeight: 20,
    },
    sendBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: PRIMARY,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sendBtnDisabled: {
        backgroundColor: '#C7C7CC',
    },
});

export default ServiceInputSheet;
