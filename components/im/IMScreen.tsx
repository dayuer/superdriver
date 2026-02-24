/**
 * IMScreen - IM 模块主入口
 * 
 * 类似微信的聊天界面，包含：
 * - 消息列表（核心议事厅群聊 + Agent 私聊）
 * - 通讯录（核心智囊团 + 合作顾问）
 * - 聊天室（群聊/私聊）
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Agent, UserProfile } from '../../types';
import { getAgents, getChatList, getIMSessions, BASE_URL } from '../../services/api';
import { IMChatList, IMSession } from './IMChatList';
import { IMChatRoom } from './IMChatRoom';
import { IMContacts } from './IMContacts';
import { IMSessionSettings } from './IMSessionSettings';
import { TEXT, BACKGROUND, BORDER, PRIMARY, SUCCESS } from '../../styles/colors';

// ==================== 类型定义 ====================

type IMTab = 'messages' | 'contacts';
type IMView = 'list' | 'chat';

interface IMScreenProps {
  profile?: UserProfile | null;
  initialTab?: IMTab;
  onBack?: () => void;
}

// ==================== 常量 ====================

const CORE_AGENT_IDS = ['general', 'legal', 'mechanic', 'health', 'algo', 'metaphysics'];

// ==================== 主组件 ====================

export const IMScreen: React.FC<IMScreenProps> = ({
  profile,
  initialTab = 'messages',
  onBack,
}) => {
  const insets = useSafeAreaInsets();

  // 状态
  const [activeTab, setActiveTab] = useState<IMTab>(initialTab);
  const [currentView, setCurrentView] = useState<IMView>('list');
  const [sessions, setSessions] = useState<IMSession[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [agentsMap, setAgentsMap] = useState<Record<string, Agent>>({});
  const [isLoading, setIsLoading] = useState(true);

  // 当前聊天
  const [currentSession, setCurrentSession] = useState<IMSession | null>(null);
  const [targetAgent, setTargetAgent] = useState<Agent | undefined>();

  // 设置弹窗
  const [showSettings, setShowSettings] = useState(false);

  // 加载数据
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // 并行加载 agents、聊天列表和 IM 会话
      const [agentsData, chatListData, imSessionsData] = await Promise.all([
        getAgents().catch(() => []),
        getChatList().catch(() => []),
        getIMSessions().catch(() => ({ sessions: [], total: 0 })),
      ]);

      // 处理 agents
      const agentsList = Array.isArray(agentsData) ? agentsData : [];
      setAgents(agentsList);
      
      const map: Record<string, Agent> = {};
      agentsList.forEach((agent: Agent) => {
        map[agent.id] = agent;
      });
      setAgentsMap(map);

      // 生成会话列表（合并 IM 会话和 chatList 数据）
      const sessionsList = generateSessions(agentsList, chatListData, imSessionsData, map);
      setSessions(sessionsList);
    } catch (error) {
      console.error('[IMScreen] Load data error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 生成会话列表（核心群 + 各 Agent 私聊）
  // imSessionsData 来自后端 API，按 agent_id 分组返回每个 Agent 的最新消息
  const generateSessions = (
    agentsList: Agent[],
    chatList: any[],
    imSessionsData: { sessions: any[]; total: number },
    map: Record<string, Agent>
  ): IMSession[] => {
    const result: IMSession[] = [];

    // IM 会话映射（按 agent_id）
    const imSessionsByAgentId = new Map<number, any>();
    (imSessionsData.sessions || []).forEach((s: any) => {
      if (typeof s.agent_id === 'number') {
        imSessionsByAgentId.set(s.agent_id, s);
      }
    });

    // 从 agents 创建 numericId 到 Agent 的映射
    const agentsByNumericId = new Map<number, Agent>();
    agentsList.forEach(agent => {
      // 假设 agent.numericId 存在，或者使用 CORE_AGENT_IDS 的索引
      const numericId = (agent as any).numericId || CORE_AGENT_IDS.indexOf(agent.id) + 1;
      if (numericId > 0) {
        agentsByNumericId.set(numericId, agent);
      }
    });

    // 1. 核心议事厅（专属群）- 聚合所有 core agents 的最新消息
    const coreAgents = agentsList.filter(a => CORE_AGENT_IDS.includes(a.id));
    
    // 找到所有 core agent 的最新消息中最新的那条
    let latestGroupContent = '数字化战友已集结，听候指示。';
    let latestGroupTime = new Date();
    
    imSessionsByAgentId.forEach((session, agentId) => {
      const agent = agentsByNumericId.get(agentId);
      if (agent && CORE_AGENT_IDS.includes(agent.id)) {
        if (session.last_msg_time && new Date(session.last_msg_time) > latestGroupTime) {
          latestGroupTime = new Date(session.last_msg_time);
          latestGroupContent = session.last_msg_content || latestGroupContent;
        }
      }
    });
    
    result.push({
      id: 'group_core',
      type: 'group',
      name: '核心议事厅',
      avatar: '📡',
      lastMessage: latestGroupContent,
      lastMessageAt: latestGroupTime,
      unreadCount: 0,
      isPinned: true,
      memberCount: coreAgents.length,
      memberAvatars: coreAgents.slice(0, 4).map(a => a.avatar),
    });

    // 2. 为每个有消息的 Agent 创建独立会话条目
    imSessionsByAgentId.forEach((session, agentId) => {
      // 查找对应的 Agent
      let agent: Agent | undefined;
      
      // 首先通过 numericId 查找
      agent = agentsByNumericId.get(agentId);
      
      // 如果没找到，尝试通过 session 中的 agent_name 匹配
      if (!agent && session.agent_name) {
        agent = agentsList.find(a => a.name === session.agent_name);
      }
      
      // 如果仍然没找到，使用 session 中的信息创建临时 agent 显示
      const agentName = agent?.name || session.agent_name || `AI 助手 ${agentId}`;
      const agentAvatar = agent?.avatar || session.agent_avatar || '🤖';
      const agentStringId = agent?.id || `agent_${agentId}`;
      
      result.push({
        id: `private_${agentStringId}`,
        type: 'private',
        name: agentName,
        avatar: agentAvatar,
        lastMessage: session.last_msg_content || '',
        lastMessageAt: session.last_msg_time 
          ? new Date(session.last_msg_time) 
          : new Date(),
        unreadCount: 0,
        isPinned: false,
        agentId: agentStringId,
        agent,
      });
    });

    return result;
  };

  // 核心 Agents 和合作 Agents
  const { coreAgents, groupMembers } = useMemo(() => {
    const core = agents.filter(a => CORE_AGENT_IDS.includes(a.id) && a.category !== 'system');
    const sorted = core.sort((a, b) => CORE_AGENT_IDS.indexOf(a.id) - CORE_AGENT_IDS.indexOf(b.id));
    
    // 群成员 = 核心 + 已启用的合作顾问
    const members = [...sorted];
    // TODO: 从用户配置中加载已选择的合作顾问
    
    return { coreAgents: sorted, groupMembers: members };
  }, [agents]);

  // 刷新会话
  const handleRefresh = useCallback(async () => {
    await loadData();
  }, []);

  // 点击会话
  const handleSessionPress = useCallback((session: IMSession) => {
    setCurrentSession(session);
    if (session.type === 'private' && session.agentId) {
      setTargetAgent(agentsMap[session.agentId]);
    } else {
      setTargetAgent(undefined);
    }
    setCurrentView('chat');
  }, [agentsMap]);

  // 长按会话
  const handleSessionLongPress = useCallback((session: IMSession) => {
    Alert.alert(
      session.name,
      undefined,
      [
        {
          text: session.isPinned ? '取消置顶' : '置顶',
          onPress: () => handlePinToggle(session.id, !session.isPinned),
        },
        {
          text: '删除会话',
          style: 'destructive',
          onPress: () => handleDeleteSession(session.id),
        },
        { text: '取消', style: 'cancel' },
      ]
    );
  }, []);

  // 点击 Agent（从通讯录）
  const handleAgentPress = useCallback((agent: Agent) => {
    // 创建或找到私聊会话
    const existingSession = sessions.find(s => s.agentId === agent.id);
    if (existingSession) {
      setCurrentSession(existingSession);
    } else {
      // 创建新会话
      const newSession: IMSession = {
        id: `private_${agent.id}`,
        type: 'private',
        name: agent.name,
        avatar: agent.avatar,
        lastMessage: '',
        lastMessageAt: new Date(),
        unreadCount: 0,
        isPinned: false,
        agentId: agent.id,
        agent,
      };
      setCurrentSession(newSession);
      setSessions(prev => [...prev, newSession]);
    }
    setTargetAgent(agent);
    setCurrentView('chat');
  }, [sessions]);

  // 进入群聊
  const handleGroupPress = useCallback(() => {
    const groupSession = sessions.find(s => s.id === 'group_core');
    if (groupSession) {
      setCurrentSession(groupSession);
      setTargetAgent(undefined);
      setCurrentView('chat');
    }
  }, [sessions]);

  // 返回列表
  const handleBackToList = useCallback(() => {
    setCurrentView('list');
    setCurrentSession(null);
    setTargetAgent(undefined);
  }, []);

  // 置顶切换
  const handlePinToggle = useCallback((sessionId: string, isPinned: boolean) => {
    setSessions(prev =>
      prev.map(s => (s.id === sessionId ? { ...s, isPinned } : s))
    );
  }, []);

  // 删除会话
  const handleDeleteSession = useCallback((sessionId: string) => {
    if (sessionId === 'group_core') {
      Alert.alert('提示', '核心群聊不能删除');
      return;
    }
    setSessions(prev => prev.filter(s => s.id !== sessionId));
  }, []);

  // 渲染头部
  const renderHeader = () => (
    <View style={[styles.header, { paddingTop: insets.top }]}>
      <View style={styles.headerContent}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color={TEXT.primary} />
          </TouchableOpacity>
        )}
        <Text style={styles.headerTitle}>
          {activeTab === 'messages' ? '消息' : '通讯录'}
        </Text>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="add-circle-outline" size={26} color={TEXT.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );

  // 渲染 Tab 栏
  const renderTabBar = () => (
    <View style={[styles.tabBar, { paddingBottom: insets.bottom }]}>
      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => setActiveTab('messages')}
      >
        <Ionicons
          name={activeTab === 'messages' ? 'chatbubbles' : 'chatbubbles-outline'}
          size={24}
          color={activeTab === 'messages' ? PRIMARY : TEXT.tertiary}
        />
        <Text style={[styles.tabLabel, activeTab === 'messages' && styles.tabLabelActive]}>
          消息
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => setActiveTab('contacts')}
      >
        <Ionicons
          name={activeTab === 'contacts' ? 'people' : 'people-outline'}
          size={24}
          color={activeTab === 'contacts' ? PRIMARY : TEXT.tertiary}
        />
        <Text style={[styles.tabLabel, activeTab === 'contacts' && styles.tabLabelActive]}>
          通讯录
        </Text>
      </TouchableOpacity>
    </View>
  );

  // 渲染列表视图
  const renderListView = () => (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {renderHeader()}
      <View style={styles.content}>
        {activeTab === 'messages' ? (
          <IMChatList
            sessions={sessions}
            isLoading={isLoading}
            onRefresh={handleRefresh}
            onSessionPress={handleSessionPress}
            onSessionLongPress={handleSessionLongPress}
            agentsMap={agentsMap}
            profile={profile || undefined}
          />
        ) : (
          <IMContacts
            agents={agents}
            onAgentPress={handleAgentPress}
            onGroupPress={handleGroupPress}
            profile={profile || undefined}
          />
        )}
      </View>
      {renderTabBar()}
    </View>
  );

  // 渲染聊天视图
  const renderChatView = () => {
    if (!currentSession) return null;

    return (
      <IMChatRoom
        sessionId={currentSession.id}
        sessionType={currentSession.type}
        sessionName={currentSession.name}
        agentsMap={agentsMap}
        targetAgent={targetAgent}
        profile={profile}
        onBack={handleBackToList}
        onMorePress={() => setShowSettings(true)}
        groupMembers={currentSession.type === 'group' ? groupMembers : undefined}
      />
    );
  };

  return (
    <>
      {currentView === 'list' ? renderListView() : renderChatView()}

      {/* 设置弹窗 */}
      <IMSessionSettings
        visible={showSettings}
        session={currentSession}
        members={currentSession?.type === 'group' ? groupMembers : undefined}
        onClose={() => setShowSettings(false)}
        onPinToggle={handlePinToggle}
        onMemberPress={(agent) => {
          setShowSettings(false);
          handleAgentPress(agent);
        }}
      />
    </>
  );
};

// ==================== 样式 ====================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND.primary,
  },
  header: {
    backgroundColor: BACKGROUND.primary,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BORDER.light,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: TEXT.primary,
  },
  headerButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  content: {
    flex: 1,
  },

  // Tab Bar
  tabBar: {
    flexDirection: 'row',
    backgroundColor: BACKGROUND.primary,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: BORDER.light,
    paddingTop: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  tabLabel: {
    fontSize: 11,
    color: TEXT.tertiary,
    marginTop: 2,
  },
  tabLabelActive: {
    color: PRIMARY,
    fontWeight: '500',
  },
});

export default IMScreen;
