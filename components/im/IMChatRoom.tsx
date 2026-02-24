/**
 * IMChatRoom - 微信风格的聊天室
 * 
 * 支持：
 * - 群聊模式：与多个 Agent 交流
 * - 私聊模式：与单个 Agent 一对一交流
 * - 微信标准的气泡样式和交互
 */
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
  Keyboard,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Agent, UserProfile, ChatMessage } from '../../types';
import { AgentAvatar } from '../AgentAvatar';
import { TypingIndicator } from '../chat/TypingIndicator';
import { BASE_URL, getChatHistory, sendVentingMessage } from '../../services/api';
import { getLocalHistory, saveMessageLocal, syncMessages } from '../../services/database';
import { TEXT, BACKGROUND, BORDER, PRIMARY, SUCCESS } from '../../styles/colors';

// ==================== 类型定义 ====================

interface IMChatRoomProps {
  sessionId: string;
  sessionType: 'group' | 'private';
  sessionName: string;
  agentsMap: Record<string, Agent>;
  targetAgent?: Agent;
  profile?: UserProfile | null;
  onBack: () => void;
  onMorePress?: () => void;
  // 群聊专属
  groupMembers?: Agent[];
}

// ==================== 常量 ====================

const CORE_AGENT_IDS = ['general', 'legal', 'mechanic', 'health', 'algo', 'metaphysics'];

// Agent 动作状态映射
const AGENT_ACTION_STATES: Record<string, string> = {
  'general': '翔哥正在为您分析形势...',
  'legal': '叶律正在检索相关法规...',
  'mechanic': '老周正在诊断问题...',
  'health': '林姨正在配制方案...',
  'algo': '阿K正在计算最优解...',
  'metaphysics': '裴姐正在为您推算...',
  'router': '正在呼叫智囊团...',
};

const getAgentActionState = (agentId?: string, name?: string): string => {
  if (agentId && AGENT_ACTION_STATES[agentId]) {
    return AGENT_ACTION_STATES[agentId];
  }
  return `${name || '助手'}正在思考...`;
};

// ==================== 时间格式化 ====================

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

// ==================== 子组件：消息气泡 ====================

interface MessageBubbleProps {
  message: ChatMessage;
  isUser: boolean;
  agent?: Agent;
  profile?: UserProfile | null;
  showTimestamp: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isUser,
  agent,
  profile,
  showTimestamp,
}) => {
  return (
    <>
      {showTimestamp && (
        <View style={styles.timestampContainer}>
          <Text style={styles.timestampText}>{formatTimestamp(message.timestamp)}</Text>
        </View>
      )}
      <View style={[styles.messageRow, isUser ? styles.messageRowRight : styles.messageRowLeft]}>
        {/* 左侧头像 - Agent */}
        {!isUser && (
          <View style={styles.avatarWrapper}>
            <AgentAvatar
              avatar={agent?.avatar || '🤖'}
              size={40}
              isPaid={agent?.isPaid}
              baseUrl={BASE_URL}
            />
          </View>
        )}

        {/* 消息内容 */}
        <View style={[styles.bubble, isUser ? styles.bubbleRight : styles.bubbleLeft]}>
          {!isUser && (
            <Text style={styles.agentName}>{agent?.name || 'AI助手'}</Text>
          )}
          <Text style={[styles.messageText, isUser && styles.messageTextRight]}>
            {message.content}
          </Text>
        </View>

        {/* 右侧头像 - 用户 */}
        {isUser && (
          <View style={styles.avatarWrapper}>
            {profile?.avatarId ? (
              <Image
                source={{ uri: `${BASE_URL}${profile.avatarId}` }}
                style={styles.userAvatar}
              />
            ) : (
              <View style={styles.userAvatarPlaceholder}>
                <Text style={{ fontSize: 20 }}>👤</Text>
              </View>
            )}
          </View>
        )}
      </View>
    </>
  );
};

// ==================== 子组件：群成员栏 ====================

interface GroupMembersBarProps {
  members: Agent[];
  onMemberPress: (agent: Agent) => void;
}

const GroupMembersBar: React.FC<GroupMembersBarProps> = ({ members, onMemberPress }) => {
  const coreMembers = members.filter(m => CORE_AGENT_IDS.includes(m.id));
  const partnerMembers = members.filter(m => !CORE_AGENT_IDS.includes(m.id));

  return (
    <View style={styles.membersBar}>
      <Text style={styles.membersLabel}>智囊团成员</Text>
      <FlatList
        horizontal
        data={[...coreMembers, ...partnerMembers]}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.memberItem}
            onPress={() => onMemberPress(item)}
          >
            <AgentAvatar
              avatar={item.avatar}
              size={36}
              isPaid={item.isPaid}
              baseUrl={BASE_URL}
            />
            <Text style={styles.memberName} numberOfLines={1}>
              {item.name.slice(0, 2)}
            </Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.membersContent}
      />
    </View>
  );
};

// ==================== 主组件 ====================

export const IMChatRoom: React.FC<IMChatRoomProps> = ({
  sessionId,
  sessionType,
  sessionName,
  agentsMap,
  targetAgent,
  profile,
  onBack,
  onMorePress,
  groupMembers = [],
}) => {
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);
  const loadingRef = useRef(false);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [typingAgent, setTypingAgent] = useState<Agent | undefined>();
  const [showMembersBar, setShowMembersBar] = useState(sessionType === 'group');

  // db 懒初始化，无需手动调用

  // 加载历史消息
  useEffect(() => {
    loadHistory();
    return () => {
      loadingRef.current = false;
    };
  }, [sessionId]);

  const loadHistory = async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setIsLoading(true);

    const target = sessionType === 'group' ? 'super_driver_group' : (targetAgent?.id || sessionId);

    try {
      // 1. 快速加载本地缓存
      const localMsgs = await getLocalHistory(target, 30).catch(() => []);
      if (localMsgs?.length) {
        setMessages(localMsgs as ChatMessage[]);
      }

      // 2. 远程同步
      const history = await getChatHistory(target, 30).catch(() => []);
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
            timestamp: h.timestamp ? new Date(h.timestamp) : new Date(),
          }))
          .reverse();

        setMessages(mapped);
        syncMessages(target, mapped.slice().reverse()).catch(() => {});
      } else if (!localMsgs?.length) {
        // 无历史记录时显示欢迎消息
        const welcomeMsg = createWelcomeMessage();
        setMessages([welcomeMsg]);
      }
    } catch (error) {
      console.error('[IMChatRoom] Load history error:', error);
    } finally {
      loadingRef.current = false;
      setIsLoading(false);
    }
  };

  const createWelcomeMessage = (): ChatMessage => ({
    id: 'welcome',
    type: sessionType === 'group' ? 'system' : (targetAgent?.id || 'helper'),
    content: sessionType === 'group'
      ? '欢迎来到核心议事厅！这里集结了您的专属智囊团，有任何问题随时可以咨询。'
      : targetAgent?.welcomeMessage || `您好！我是${targetAgent?.name || '助手'}，很高兴为您服务。`,
    timestamp: new Date(),
  });

  // 发送消息
  const handleSend = useCallback(async () => {
    if (!inputText.trim() || isSending) return;

    const text = inputText.trim();
    setInputText('');
    Keyboard.dismiss();

    // 添加用户消息
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: text,
      timestamp: new Date(),
    };
    setMessages(prev => [userMsg, ...prev]);
    setIsSending(true);

    try {
      const target = sessionType === 'group' ? 'super_driver_group' : (targetAgent?.id || sessionId);
      saveMessageLocal(userMsg, target, 'sending');

      // 发送到服务器
      const res = await sendVentingMessage(
        text,
        sessionType === 'private' ? (targetAgent?.id || sessionId) : undefined
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
          timestamp: new Date(),
        }));
        setMessages(prev => [...newMsgs.reverse(), ...prev]);
        newMsgs.forEach(m => saveMessageLocal(m, target, 'sent'));
      } else if (res.content) {
        const newMsg: ChatMessage = {
          id: `res-${Date.now()}`,
          type: res.agentId || 'helper',
          content: res.content,
          timestamp: new Date(),
        };
        setMessages(prev => [newMsg, ...prev]);
        saveMessageLocal(newMsg, target, 'sent');
      }
    } catch (error) {
      console.error('[IMChatRoom] Send error:', error);
      setMessages(prev => [{
        id: `err-${Date.now()}`,
        type: 'system',
        content: '发送失败，请检查网络后重试',
        timestamp: new Date(),
      }, ...prev]);
    } finally {
      setIsSending(false);
      setTypingAgent(undefined);
    }
  }, [inputText, isSending, sessionType, targetAgent, sessionId, agentsMap]);

  // 时间戳显示逻辑
  const shouldShowTimestamp = useCallback((msg: ChatMessage, index: number) => {
    if (index === 0) return true;
    const next = messages[index - 1];
    if (!next) return false;
    const curr = msg.timestamp instanceof Date ? msg.timestamp.getTime() : new Date(msg.timestamp).getTime();
    const nextT = next.timestamp instanceof Date ? next.timestamp.getTime() : new Date(next.timestamp).getTime();
    return Math.abs(curr - nextT) > 5 * 60 * 1000;
  }, [messages]);

  // 渲染消息
  const renderItem = useCallback(({ item, index }: { item: ChatMessage; index: number }) => {
    const isUser = item.type === 'user';
    let agent = agentsMap[item.type];
    if (!isUser && !agent) {
      agent = { name: item.type === 'system' ? '系统' : 'AI助手', avatar: '🤖' } as Agent;
    }

    return (
      <MessageBubble
        message={item}
        isUser={isUser}
        agent={agent}
        profile={profile}
        showTimestamp={shouldShowTimestamp(item, index)}
      />
    );
  }, [agentsMap, profile, shouldShowTimestamp]);

  // 跳转到私聊
  const handleMemberPress = (agent: Agent) => {
    // TODO: 导航到与该 agent 的私聊
    console.log('Navigate to private chat with:', agent.id);
  };

  return (
    <View style={styles.container}>
      {/* 状态栏占位 */}
      <View style={[styles.statusBar, { height: insets.top }]} />

      {/* 头部 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color={TEXT.primary} />
        </TouchableOpacity>
        <View style={styles.titleArea}>
          <Text style={styles.title} numberOfLines={1}>{sessionName}</Text>
          {sessionType === 'group' && groupMembers.length > 0 && (
            <Text style={styles.subtitle}>
              {groupMembers.length} 位成员
            </Text>
          )}
        </View>
        <TouchableOpacity onPress={onMorePress} style={styles.moreButton}>
          <Ionicons name="ellipsis-horizontal" size={24} color={TEXT.primary} />
        </TouchableOpacity>
      </View>

      {/* 群成员快捷栏 */}
      {sessionType === 'group' && showMembersBar && groupMembers.length > 0 && (
        <GroupMembersBar members={groupMembers} onMemberPress={handleMemberPress} />
      )}

      {/* 消息列表 */}
      <View style={styles.chatArea}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={PRIMARY} />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            inverted
            contentContainerStyle={styles.messageList}
            ListHeaderComponent={
              isSending ? (
                <TypingIndicator
                  agent={typingAgent || targetAgent}
                  actionText={getAgentActionState(typingAgent?.id || targetAgent?.id, typingAgent?.name || targetAgent?.name)}
                />
              ) : null
            }
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {/* 输入区域 */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[styles.inputContainer, { paddingBottom: Math.max(insets.bottom, 10) }]}>
          {/* 语音按钮 */}
          <TouchableOpacity style={styles.voiceButton}>
            <Ionicons name="mic-outline" size={24} color={TEXT.tertiary} />
          </TouchableOpacity>

          {/* 输入框 */}
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="输入消息..."
            placeholderTextColor={TEXT.tertiary}
            returnKeyType="send"
            onSubmitEditing={handleSend}
            multiline
            maxLength={2000}
          />

          {/* 表情/更多 */}
          <TouchableOpacity style={styles.emojiButton}>
            <Ionicons name="happy-outline" size={24} color={TEXT.tertiary} />
          </TouchableOpacity>

          {/* 发送/添加按钮 */}
          {inputText.trim() ? (
            <TouchableOpacity
              style={styles.sendButton}
              onPress={handleSend}
              disabled={isSending}
            >
              <Text style={styles.sendButtonText}>发送</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.addButton}>
              <Ionicons name="add-circle-outline" size={28} color={TEXT.tertiary} />
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

// ==================== 样式 ====================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EDEDED',
  },
  statusBar: {
    backgroundColor: '#F7F7F7',
    width: '100%',
  },
  header: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F7F7',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BORDER.light,
    paddingHorizontal: 8,
  },
  backButton: {
    padding: 8,
    marginRight: 4,
  },
  titleArea: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: TEXT.primary,
  },
  subtitle: {
    fontSize: 11,
    color: TEXT.tertiary,
    marginTop: 1,
  },
  moreButton: {
    padding: 8,
  },

  // 群成员栏
  membersBar: {
    backgroundColor: '#F7F7F7',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BORDER.light,
    paddingVertical: 8,
  },
  membersLabel: {
    fontSize: 12,
    color: TEXT.tertiary,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  membersContent: {
    paddingHorizontal: 12,
  },
  memberItem: {
    alignItems: 'center',
    marginHorizontal: 6,
    width: 48,
  },
  memberName: {
    fontSize: 10,
    color: TEXT.secondary,
    marginTop: 4,
    textAlign: 'center',
  },

  // 消息区域
  chatArea: {
    flex: 1,
    backgroundColor: '#EDEDED',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageList: {
    paddingTop: 12,
    paddingBottom: 8,
  },

  // 时间戳
  timestampContainer: {
    alignItems: 'center',
    marginVertical: 12,
  },
  timestampText: {
    fontSize: 12,
    color: '#B2B2B2',
    backgroundColor: 'rgba(0,0,0,0.06)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },

  // 消息行
  messageRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
    paddingHorizontal: 12,
  },
  messageRowLeft: {
    justifyContent: 'flex-start',
  },
  messageRowRight: {
    justifyContent: 'flex-end',
  },
  avatarWrapper: {
    width: 40,
    height: 40,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 4,
  },
  userAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 4,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // 气泡
  bubble: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 6,
    maxWidth: '70%',
    minWidth: 40,
  },
  bubbleLeft: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 0,
    marginLeft: 8,
  },
  bubbleRight: {
    backgroundColor: '#95EC69',
    borderTopRightRadius: 0,
    marginRight: 8,
  },
  agentName: {
    fontSize: 11,
    color: TEXT.tertiary,
    marginBottom: 3,
    fontWeight: '500',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    color: TEXT.primary,
  },
  messageTextRight: {
    color: TEXT.primary,
  },

  // 输入区域
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 8,
    paddingVertical: 8,
    backgroundColor: '#F7F7F7',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: BORDER.light,
  },
  voiceButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    maxHeight: 100,
    minHeight: 36,
    marginHorizontal: 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: BORDER.light,
  },
  emojiButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButton: {
    paddingHorizontal: 16,
    height: 36,
    borderRadius: 6,
    backgroundColor: SUCCESS,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  sendButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#fff',
  },
  addButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 2,
  },
});

export default IMChatRoom;
