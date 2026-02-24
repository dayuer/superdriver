/**
 * ChatRoomNew - 重构版聊天室
 * 使用拆分后的子组件，大幅减少代码量
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    Image,
    KeyboardAvoidingView,
    Platform,
    TextInput,
    TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Agent, UserProfile, ChatMessage } from '../types';
import { getChatHistory, sendVentingMessage, BASE_URL } from '../services/api';
import { getLocalHistory, saveMessageLocal, syncMessages } from '../services/database';
import { AgentAvatar } from './AgentAvatar';
import { TypingIndicator } from './chat/TypingIndicator';
import { TEXT, BACKGROUND, BORDER, PRIMARY, SUCCESS } from '../styles/colors';

// ==================== 类型定义 ====================

interface ChatRoomProps {
    chatId: string;
    chatName: string;
    chatType: 'group' | 'private';
    agentsMap: Record<string, Agent>;
    onBack: () => void;
    targetAgent?: Agent;
    profile?: UserProfile | null;
}

// ==================== 工具函数 ====================

const getAgentActionState = (agentId?: string, name?: string) => {
    const actionMap: Record<string, string> = {
        'lin': '林姨正在为您配制独门秘方...',
        'ye': '叶律正在检索民法典...',
        'pei': '裴姐正在为您排盘...',
        'zhou': '老周正在听诊故障音...',
        'k': '阿K正在调取城市热力图...',
        'yan': '严公估正在计算核损清单...',
        'yin': '翔哥正在思考过招...',
        'helper': '小助手正在整理文档...',
        'router': '正在呼叫专家...',
    };
    return actionMap[agentId || ''] || `${name || '对方'}正在输入...`;
};

const formatTimestamp = (timestamp: Date | string): string => {
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    if (diff < 24 * 60 * 60 * 1000 && now.getDate() === date.getDate()) {
        return `${hours}:${minutes}`;
    }

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (yesterday.getDate() === date.getDate()) {
        return `昨天 ${hours}:${minutes}`;
    }

    return `${date.getMonth() + 1}月${date.getDate()}日 ${hours}:${minutes}`;
};

// ==================== 主组件 ====================

export function ChatRoomNew({
    chatId,
    chatName,
    chatType,
    agentsMap,
    onBack,
    targetAgent,
    profile,
}: ChatRoomProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [typingAgent, setTypingAgent] = useState<Agent | undefined>();
    const insets = useSafeAreaInsets();
    const flatListRef = useRef<FlatList>(null);
    const loadingRef = useRef(false);

    // db 懒初始化，无需手动调 initDatabase()

    useEffect(() => {
        loadHistory();
        return () => { loadingRef.current = false; };
    }, [chatId]);

    // ==================== 消息加载 ====================

    const loadHistory = async () => {
        if (loadingRef.current) return;
        loadingRef.current = true;
        setIsLoading(true);

        const target = chatType === 'group' ? 'super_driver_group' : (targetAgent?.id || chatId);

        try {
            // 1. 加载本地缓存
            const localMsgs = await getLocalHistory(target, 20).catch(() => []);
            if (localMsgs?.length) {
                setMessages(localMsgs as ChatMessage[]);
            }

            // 2. 同步远程
            const history = await getChatHistory(target, 20).catch(() => []);
            if (Array.isArray(history) && history.length > 0) {
                const seenIds = new Set<string>();
                const mapped: ChatMessage[] = history
                    .filter((h: any) => {
                        const id = String(h.id);
                        if (seenIds.has(id)) return false;
                        seenIds.add(id);
                        return true;
                    })
                    .map((h: any) => ({
                        id: String(h.id),
                        type: h.type || 'system',
                        content: h.content || '',
                        timestamp: h.timestamp ? new Date(h.timestamp) : new Date()
                    }))
                    .reverse();

                setMessages(mapped);
                syncMessages(target, mapped.slice().reverse()).catch(() => { });
            } else if (!localMsgs?.length) {
                // 无数据时显示欢迎消息
                setMessages([{
                    id: 'welcome',
                    type: chatType === 'group' ? 'system' : (targetAgent?.id || 'helper'),
                    content: chatType === 'group'
                        ? '欢迎来到核心议事厅！'
                        : `您好！我是${targetAgent?.name || '助手'}，有什么可以帮您的吗？`,
                    timestamp: new Date()
                }]);
            }
        } catch (error) {
            console.error('[ChatRoom] Load error:', error);
        } finally {
            loadingRef.current = false;
            setIsLoading(false);
        }
    };

    // ==================== 发送消息 ====================

    const handleSend = useCallback(async () => {
        if (!inputText.trim()) return;
        const text = inputText.trim();
        setInputText('');

        const userMsg: ChatMessage = {
            id: `user-${Date.now()}`,
            type: 'user',
            content: text,
            timestamp: new Date()
        };
        setMessages(prev => [userMsg, ...prev]);
        setIsSending(true);

        try {
            const target = chatType === 'group' ? 'super_driver_group' : (targetAgent?.id || chatId);
            saveMessageLocal(userMsg, target, 'sending');

            const res = await sendVentingMessage(
                text,
                chatType === 'private' ? (targetAgent?.id || chatId) : undefined
            );
            saveMessageLocal(userMsg, target, 'sent');

            // 显示 AI 正在输入
            const replyAgentId = res.agentId || res.scenarios?.[0]?.agentId;
            if (replyAgentId && agentsMap[replyAgentId]) {
                setTypingAgent(agentsMap[replyAgentId]);
                await new Promise(r => setTimeout(r, 1200));
            }

            // 处理响应
            if (res.scenarios) {
                const newMsgs: ChatMessage[] = res.scenarios.map((s: any, i: number) => ({
                    id: `res-${Date.now()}-${i}`,
                    type: s.agentId,
                    content: s.content,
                    timestamp: new Date()
                }));
                setMessages(prev => [...newMsgs.reverse(), ...prev]);
                newMsgs.forEach(m => saveMessageLocal(m, target, 'sent'));
            } else if (res.content) {
                const newMsg: ChatMessage = {
                    id: `res-${Date.now()}`,
                    type: res.agentId || 'helper',
                    content: res.content,
                    timestamp: new Date()
                };
                setMessages(prev => [newMsg, ...prev]);
                saveMessageLocal(newMsg, target, 'sent');
            }
        } catch (e) {
            setMessages(prev => [{
                id: `err-${Date.now()}`,
                type: 'system',
                content: '发送失败，请重试',
                timestamp: new Date()
            }, ...prev]);
        } finally {
            setIsSending(false);
            setTypingAgent(undefined);
        }
    }, [inputText, chatType, targetAgent, chatId, agentsMap]);

    // ==================== 渲染消息 ====================

    const shouldShowTimestamp = (msg: ChatMessage, index: number) => {
        if (index === 0) return true;
        const next = messages[index - 1];
        if (!next) return false;
        const curr = msg.timestamp instanceof Date ? msg.timestamp.getTime() : new Date(msg.timestamp).getTime();
        const nextT = next.timestamp instanceof Date ? next.timestamp.getTime() : new Date(next.timestamp).getTime();
        return Math.abs(curr - nextT) > 5 * 60 * 1000;
    };

    const renderItem = ({ item, index }: { item: ChatMessage; index: number }) => {
        const isUser = item.type === 'user';
        let agent = agentsMap[item.type];
        if (!isUser && !agent) {
            agent = { name: item.type === 'system' ? '系统' : 'AI助手', avatar: '🤖' } as any;
        }

        return (
            <>
                {shouldShowTimestamp(item, index) && (
                    <View style={styles.timestampContainer}>
                        <Text style={styles.timestampText}>{formatTimestamp(item.timestamp)}</Text>
                    </View>
                )}
                <View style={[styles.msgRow, isUser ? styles.msgRowRight : styles.msgRowLeft]}>
                    {!isUser && (
                        <AgentAvatar
                            avatar={agent?.avatar || '🤖'}
                            size={40}
                            isPaid={agent?.isPaid}
                            baseUrl={BASE_URL}
                        />
                    )}
                    <View style={[styles.bubble, isUser ? styles.bubbleRight : styles.bubbleLeft]}>
                        {!isUser && <Text style={styles.agentName}>{agent?.name}</Text>}
                        <Text style={[styles.msgText, isUser && styles.msgTextRight]}>{item.content}</Text>
                    </View>
                    {isUser && (
                        <View style={styles.userAvatar}>
                            {profile?.avatarId ? (
                                <Image source={{ uri: `${BASE_URL}${profile.avatarId}` }} style={styles.avatarImage} />
                            ) : (
                                <Text style={{ fontSize: 20 }}>👤</Text>
                            )}
                        </View>
                    )}
                </View>
            </>
        );
    };

    // ==================== 渲染 ====================

    return (
        <View style={styles.container}>
            <View style={[styles.statusBar, { height: insets.top }]} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={28} color={TEXT.primary} />
                </TouchableOpacity>
                <View style={styles.titleArea}>
                    <Text style={styles.title}>{chatName}</Text>
                    {chatType === 'group' && <Text style={styles.subtitle}>核心议事厅</Text>}
                </View>
                <TouchableOpacity style={styles.moreBtn}>
                    <Ionicons name="ellipsis-horizontal" size={24} color={TEXT.primary} />
                </TouchableOpacity>
            </View>

            {/* Chat Area */}
            <View style={styles.chatArea}>
                {isLoading ? (
                    <View style={styles.center}>
                        <ActivityIndicator size="large" color={TEXT.primary} />
                    </View>
                ) : (
                    <FlatList
                        ref={flatListRef}
                        data={messages}
                        renderItem={renderItem}
                        keyExtractor={item => item.id}
                        inverted
                        contentContainerStyle={{ paddingTop: 12, paddingBottom: 8 }}
                        ListHeaderComponent={
                            isSending ? (
                                <TypingIndicator
                                    agent={typingAgent || targetAgent}
                                    actionText={getAgentActionState(typingAgent?.id || targetAgent?.id, typingAgent?.name || targetAgent?.name)}
                                />
                            ) : null
                        }
                    />
                )}
            </View>

            {/* Input Area */}
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <View style={[styles.inputContainer, { paddingBottom: Math.max(insets.bottom, 10) }]}>
                    <TouchableOpacity style={styles.attachBtn}>
                        <Ionicons name="add-circle-outline" size={28} color={TEXT.tertiary} />
                    </TouchableOpacity>
                    <TextInput
                        style={styles.input}
                        value={inputText}
                        onChangeText={setInputText}
                        placeholder="输入消息..."
                        placeholderTextColor={TEXT.tertiary}
                        returnKeyType="send"
                        onSubmitEditing={handleSend}
                        multiline
                    />
                    {inputText.trim() ? (
                        <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
                            <Text style={styles.sendBtnText}>发送</Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity style={styles.voiceBtn}>
                            <Ionicons name="mic-outline" size={24} color={TEXT.tertiary} />
                        </TouchableOpacity>
                    )}
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}

// ==================== 样式 ====================

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#EDEDED' },
    statusBar: { backgroundColor: '#F7F7F7', width: '100%' },
    header: {
        height: 44,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F7F7F7',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: BORDER.light,
        paddingHorizontal: 8,
    },
    backBtn: { padding: 8, marginRight: 4 },
    titleArea: { flex: 1, alignItems: 'center' },
    title: { fontSize: 17, fontWeight: '600', color: TEXT.primary },
    subtitle: { fontSize: 11, color: TEXT.tertiary, marginTop: 1 },
    moreBtn: { padding: 8 },
    chatArea: { flex: 1, backgroundColor: '#EDEDED' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    msgRow: { flexDirection: 'row', marginBottom: 12, alignItems: 'flex-start', paddingHorizontal: 12 },
    msgRowLeft: { justifyContent: 'flex-start' },
    msgRowRight: { justifyContent: 'flex-end' },

    bubble: {
        paddingHorizontal: 12,
        paddingVertical: 9,
        borderRadius: 6,
        maxWidth: '70%',
        minWidth: 40,
    },
    bubbleLeft: { backgroundColor: '#fff', borderTopLeftRadius: 0, marginLeft: 8 },
    bubbleRight: { backgroundColor: '#95EC69', borderTopRightRadius: 0, marginRight: 8 },

    agentName: { fontSize: 11, color: TEXT.tertiary, marginBottom: 3, fontWeight: '500' },
    msgText: { fontSize: 16, lineHeight: 22, color: TEXT.primary },
    msgTextRight: { color: TEXT.primary },

    userAvatar: {
        width: 40,
        height: 40,
        borderRadius: 4,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    avatarImage: { width: '100%', height: '100%' },

    timestampContainer: { alignItems: 'center', marginVertical: 8 },
    timestampText: { fontSize: 12, color: '#B2B2B2' },

    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: 8,
        paddingVertical: 6,
        backgroundColor: '#F7F7F7',
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: BORDER.light,
    },
    attachBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center', marginRight: 6 },
    input: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        fontSize: 16,
        maxHeight: 100,
        minHeight: 36,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: BORDER.light,
    },
    sendBtn: {
        paddingHorizontal: 16,
        height: 36,
        borderRadius: 6,
        backgroundColor: SUCCESS,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 6,
    },
    sendBtnText: { fontSize: 15, fontWeight: '500', color: '#fff' },
    voiceBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center', marginLeft: 6 },
});

export default ChatRoomNew;
