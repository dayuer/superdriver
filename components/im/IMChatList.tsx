/**
 * IMChatList - 微信风格的聊天列表
 * 
 * 功能：
 * - 专属群聊（核心议事厅）置顶显示
 * - 按最近消息时间排序的会话列表
 * - 未读消息红点提示
 * - 长按可置顶/删除会话
 */
import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TouchableHighlight,
  Image,
  ActivityIndicator,
  RefreshControl,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Agent, ChatListItem } from '../../types';
import { AgentAvatar } from '../AgentAvatar';
import { BASE_URL } from '../../services/api';
import { TEXT, BACKGROUND, BORDER, PRIMARY, SUCCESS, SYSTEM } from '../../styles/colors';

// ==================== 类型定义 ====================

export interface IMSession {
  id: string;
  type: 'group' | 'private';
  name: string;
  avatar: string;
  lastMessage: string;
  lastMessageAt: Date | string;
  unreadCount: number;
  isPinned: boolean;
  agentId?: string;
  agent?: Agent;
  // 群聊专用
  memberCount?: number;
  memberAvatars?: string[];
}

interface IMChatListProps {
  sessions: IMSession[];
  isLoading: boolean;
  onRefresh: () => void;
  onSessionPress: (session: IMSession) => void;
  onSessionLongPress?: (session: IMSession) => void;
  agentsMap?: Record<string, Agent>;
  profile?: { avatarId?: string | null; nickname?: string | null };
  coreAgentIds?: string[];
}

// ==================== 时间格式化 ====================

const formatSessionTime = (date: Date | string): string => {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  } else if (days === 1) {
    return '昨天';
  } else if (days < 7) {
    const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
    return '星期' + weekDays[d.getDay()];
  } else if (d.getFullYear() === now.getFullYear()) {
    return d.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' });
  } else {
    return d.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' });
  }
};

// ==================== 子组件 ====================

interface SessionItemProps {
  session: IMSession;
  onPress: () => void;
  onLongPress?: () => void;
  agentsMap?: Record<string, Agent>;
}

const SessionItem: React.FC<SessionItemProps> = ({
  session,
  onPress,
  onLongPress,
  agentsMap = {},
}) => {
  const agent = session.agentId ? agentsMap[session.agentId] : undefined;
  const isPaid = agent?.isPaid ?? false;

  // 群聊显示多头像叠加
  const renderGroupAvatar = () => {
    if (session.type === 'group' && session.memberAvatars && session.memberAvatars.length > 0) {
      return (
        <View style={styles.groupAvatarContainer}>
          {session.memberAvatars.slice(0, 4).map((avatar, index) => (
            <View
              key={index}
              style={[
                styles.groupAvatarItem,
                {
                  left: (index % 2) * 22,
                  top: Math.floor(index / 2) * 22,
                  zIndex: 4 - index,
                },
              ]}
            >
              <AgentAvatar avatar={avatar} size={24} baseUrl={BASE_URL} />
            </View>
          ))}
        </View>
      );
    }
    return (
      <AgentAvatar
        avatar={session.avatar || '👥'}
        size={50}
        isPaid={isPaid}
        baseUrl={BASE_URL}
      />
    );
  };

  return (
    <TouchableHighlight
      onPress={onPress}
      onLongPress={onLongPress}
      underlayColor="#ECECEC"
      style={[styles.sessionItem, session.isPinned && styles.sessionItemPinned]}
    >
      <View style={styles.sessionRow}>
        {/* 头像 */}
        <View style={styles.avatarContainer}>
          {session.type === 'group' ? renderGroupAvatar() : (
            <AgentAvatar
              avatar={session.avatar}
              size={50}
              isPaid={isPaid}
              baseUrl={BASE_URL}
            />
          )}
          {/* 未读角标 */}
          {session.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>
                {session.unreadCount > 99 ? '99+' : session.unreadCount}
              </Text>
            </View>
          )}
        </View>

        {/* 内容 */}
        <View style={styles.sessionContent}>
          <View style={styles.sessionHeader}>
            <View style={styles.nameRow}>
              <Text style={styles.sessionName} numberOfLines={1}>
                {session.name}
              </Text>
              {session.type === 'group' && session.memberCount && (
                <Text style={styles.memberCount}>({session.memberCount})</Text>
              )}
            </View>
            <Text style={styles.sessionTime}>
              {formatSessionTime(session.lastMessageAt)}
            </Text>
          </View>
          <View style={styles.messageRow}>
            <Text style={styles.sessionMessage} numberOfLines={1}>
              {session.lastMessage || '暂无消息'}
            </Text>
            {session.isPinned && (
              <View style={styles.pinnedIcon}>
                <Ionicons name="pin" size={12} color={TEXT.tertiary} />
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableHighlight>
  );
};

// ==================== 主组件 ====================

export const IMChatList: React.FC<IMChatListProps> = ({
  sessions,
  isLoading,
  onRefresh,
  onSessionPress,
  onSessionLongPress,
  agentsMap = {},
  profile,
  coreAgentIds = ['general', 'legal', 'mechanic', 'health', 'algo', 'metaphysics'],
}) => {
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);

  // 排序：置顶优先 -> 最近消息时间
  const sortedSessions = useMemo(() => {
    return [...sessions].sort((a, b) => {
      // 置顶排前面
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      // 群聊排在私聊前面
      if (a.type === 'group' && b.type !== 'group') return -1;
      if (a.type !== 'group' && b.type === 'group') return 1;
      // 按时间降序
      const timeA = new Date(a.lastMessageAt).getTime();
      const timeB = new Date(b.lastMessageAt).getTime();
      return timeB - timeA;
    });
  }, [sessions]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  }, [onRefresh]);

  const renderItem = useCallback(
    ({ item }: { item: IMSession }) => (
      <SessionItem
        session={item}
        onPress={() => onSessionPress(item)}
        onLongPress={() => onSessionLongPress?.(item)}
        agentsMap={agentsMap}
      />
    ),
    [onSessionPress, onSessionLongPress, agentsMap]
  );

  const keyExtractor = useCallback((item: IMSession) => item.id, []);

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="chatbubbles-outline" size={64} color={TEXT.quaternary} />
      <Text style={styles.emptyTitle}>暂无会话</Text>
      <Text style={styles.emptySubtitle}>点击右上角开始新的对话</Text>
    </View>
  );

  if (isLoading && sessions.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={PRIMARY} />
        <Text style={styles.loadingText}>加载中...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={sortedSessions}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={[
          styles.listContent,
          sortedSessions.length === 0 && styles.emptyList,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={PRIMARY}
            colors={[PRIMARY]}
          />
        }
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

// ==================== 样式 ====================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND.primary,
  },
  listContent: {
    flexGrow: 1,
  },
  emptyList: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BACKGROUND.primary,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: TEXT.secondary,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 120,
  },
  emptyTitle: {
    marginTop: 16,
    fontSize: 17,
    fontWeight: '600',
    color: TEXT.secondary,
  },
  emptySubtitle: {
    marginTop: 8,
    fontSize: 14,
    color: TEXT.tertiary,
  },

  // Session Item
  sessionItem: {
    backgroundColor: BACKGROUND.primary,
  },
  sessionItemPinned: {
    backgroundColor: '#F7F7F7',
  },
  sessionRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BORDER.light,
  },
  avatarContainer: {
    position: 'relative',
    width: 50,
    height: 50,
  },
  groupAvatarContainer: {
    width: 50,
    height: 50,
    position: 'relative',
    backgroundColor: '#F0F0F0',
    borderRadius: 6,
  },
  groupAvatarItem: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#fff',
  },
  unreadBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  unreadText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
  sessionContent: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  sessionName: {
    fontSize: 16,
    fontWeight: '500',
    color: TEXT.primary,
    flexShrink: 1,
  },
  memberCount: {
    fontSize: 14,
    color: TEXT.tertiary,
    marginLeft: 4,
  },
  sessionTime: {
    fontSize: 12,
    color: TEXT.tertiary,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sessionMessage: {
    fontSize: 14,
    color: TEXT.secondary,
    flex: 1,
    marginRight: 8,
  },
  pinnedIcon: {
    opacity: 0.6,
  },
});

export default IMChatList;
