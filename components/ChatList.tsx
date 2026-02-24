import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, FlatList, Dimensions, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Agent, ChatListItem } from '../types';
import { DiscoverPage } from './DiscoverPage';
import { BASE_URL } from '../services/api';
import { AgentAvatar } from './AgentAvatar';

interface ChatListProps {
  items: ChatListItem[];
  onItemClick: (item: ChatListItem) => void;
  onSettingsClick?: () => void;
  profile?: { avatarId?: string | null; nickname?: string | null };
  agentsMap?: Record<string, Agent>;
  onAgentClick?: (agent: Agent) => void;
  hideHeader?: boolean;
}

export function ChatList({ items, onItemClick, onSettingsClick, agentsMap = {}, onAgentClick, hideHeader }: ChatListProps) {
  const [activeTab, setActiveTab] = useState<'ops' | 'squad' | 'logistics'>('ops');
  const insets = useSafeAreaInsets();

  const formatTime = (date: Date | string) => {
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
    } else {
      return d.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' });
    }
  };

  const { coreAgents, partnerAgents } = useMemo(() => {
    const uniqueAgentsMap = new Map<string, Agent>();
    Object.values(agentsMap).forEach(agent => {
      if (!agent) return;
      if (agent.category !== 'system') {
        uniqueAgentsMap.set(agent.id, agent);
      }
    });

    const allAgents = Array.from(uniqueAgentsMap.values());
    const CORE_IDS = ['general', 'legal', 'mechanic', 'health', 'algo', 'metaphysics'];

    const core: Agent[] = [];
    const partner: Agent[] = [];

    allAgents.forEach(agent => {
      if (CORE_IDS.includes(agent.id)) {
        core.push(agent);
      } else {
        partner.push(agent);
      }
    });

    const sortedCore = core.sort((a, b) => CORE_IDS.indexOf(a.id) - CORE_IDS.indexOf(b.id));
    const sortedPartner = partner.sort((a, b) => {
      if ((a.priority || 0) !== (b.priority || 0)) return (b.priority || 0) - (a.priority || 0);
      if (a.isPaid !== b.isPaid) return (a.isPaid ? -1 : 1);
      return a.name.localeCompare(b.name, 'zh-CN');
    });

    return { coreAgents: sortedCore, partnerAgents: sortedPartner };
  }, [agentsMap]);

  const renderHeader = () => {
    if (hideHeader) return null;
    return (
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.title}>
              {activeTab === 'ops' ? '核心议事厅' : '通讯录'}
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => setActiveTab(activeTab === 'ops' ? 'squad' : 'ops')}
          >
            <Ionicons 
              name={activeTab === 'ops' ? "people-outline" : "chatbubble-ellipses-outline"} 
              size={24} 
              color="#333" 
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderOps = () => (
    <FlatList
      data={items}
      keyExtractor={item => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity style={styles.chatItem} onPress={() => onItemClick(item)}>
          <View style={{ position: 'relative' }}>
            <AgentAvatar 
              avatar={item.avatar || '👤'} 
              size={50} 
              isPaid={item.agent?.isPaid}
              baseUrl={BASE_URL}
            />
            {item.unread ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.unread > 99 ? '99+' : item.unread}</Text>
              </View>
            ) : null}
          </View>
          <View style={styles.chatContent}>
            <View style={styles.chatHeader}>
              <Text style={styles.chatName} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.chatTime}>{formatTime(item.timestamp)}</Text>
            </View>
            <Text style={styles.chatMessage} numberOfLines={1}>{item.lastMessage}</Text>
          </View>
        </TouchableOpacity>
      )}
      contentContainerStyle={{ paddingBottom: 20 }}
    />
  );

  const renderSquad = () => (
    <ScrollView style={styles.container}>
      {coreAgents.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>核心智囊团 ({coreAgents.length})</Text>
          <View style={styles.grid}>
            {coreAgents.map((agent) => (
              <TouchableOpacity
                key={agent.id}
                onPress={() => onAgentClick?.(agent)}
                style={styles.gridItem}
              >
                <AgentAvatar 
                  avatar={agent.avatar} 
                  size={48} 
                  isPaid={agent.isPaid}
                  baseUrl={BASE_URL}
                />
                <Text style={styles.gridName}>{agent.name}</Text>
                <Text style={styles.gridRole}>{agent.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
      
      {partnerAgents.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>后勤保障部 ({partnerAgents.length})</Text>
          {partnerAgents.map((agent) => (
            <TouchableOpacity
              key={agent.id}
              onPress={() => onAgentClick?.(agent)}
              style={styles.listItem}
            >
              <AgentAvatar 
                avatar={agent.avatar} 
                size={44} 
                isPaid={agent.isPaid}
                baseUrl={BASE_URL}
              />
              <View style={styles.listContent}>
                <View style={styles.row}>
                  <Text style={styles.listName}>{agent.name}</Text>
                  {agent.isPaid ? (
                    <View style={styles.tagAuth}><Text style={styles.tagAuthText}>企业认证</Text></View>
                  ) : <View style={styles.tagNormal}><Text style={styles.tagNormalText}>顾问团</Text></View>}
                </View>
                <Text style={styles.listDesc} numberOfLines={1}>{agent.title} · {agent.description}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );

  return (
    <View style={styles.root}>
      {renderHeader()}
      <View style={styles.main}>
        {activeTab === 'ops' ? renderOps() : activeTab === 'squad' ? renderSquad() : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  header: { 
    backgroundColor: '#fff', 
    borderBottomWidth: 1, 
    borderBottomColor: '#F2F2F7',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  headerContent: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  title: { fontSize: 20, fontWeight: '800', color: '#1C1C1E' },
  subtitle: { fontSize: 11, color: '#666', marginTop: 2 },
  iconButton: { padding: 5 },
  main: { flex: 1 },
  chatItem: { flexDirection: 'row', padding: 15, borderBottomWidth: 0.5, borderBottomColor: '#f0f0f0' },
  avatarContainer: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#f5f5f5', justifyContent: 'center', alignItems: 'center' },
  badge: { position: 'absolute', top: -2, right: -2, backgroundColor: '#dfff00', borderRadius: 10, paddingHorizontal: 4, height: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#fff' },
  badgeText: { fontSize: 10, fontWeight: 'bold', color: '#000' },
  chatContent: { flex: 1, marginLeft: 12, justifyContent: 'center' },
  chatHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  chatName: { fontSize: 16, fontWeight: '600', flex: 1 },
  chatTime: { fontSize: 12, color: '#999' },
  chatMessage: { fontSize: 14, color: '#666' },
  
  // Squad
  container: { flex: 1 },
  section: { paddingBottom: 20 },
  sectionTitle: { paddingHorizontal: 15, paddingVertical: 10, backgroundColor: '#f9f9f9', fontSize: 13, color: '#666', fontWeight: '500' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', padding: 10 },
  gridItem: { width: '33.33%', alignItems: 'center', marginBottom: 15 },
  gridAvatar: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#f5f5f5', justifyContent: 'center', alignItems: 'center', marginBottom: 5 },
  gridName: { fontSize: 13, fontWeight: '500' },
  gridRole: { fontSize: 10, color: '#999' },
  listItem: { flexDirection: 'row', padding: 15, borderBottomWidth: 0.5, borderBottomColor: '#f0f0f0', alignItems: 'center' },
  listAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#f5f5f5', justifyContent: 'center', alignItems: 'center' },
  listContent: { flex: 1, marginLeft: 12 },
  row: { flexDirection: 'row', alignItems: 'center' },
  listName: { fontSize: 16, fontWeight: '600' },
  listDesc: { fontSize: 12, color: '#999', marginTop: 2 },
  tagAuth: { marginLeft: 6, backgroundColor: '#fff3cd', paddingHorizontal: 4, paddingVertical: 2, borderRadius: 2 },
  tagAuthText: { fontSize: 10, color: '#856404' },
  tagNormal: { marginLeft: 6, backgroundColor: '#e2e3e5', paddingHorizontal: 4, paddingVertical: 2, borderRadius: 2 },
  tagNormalText: { fontSize: 10, color: '#383d41' },

  // Tab
  tabBar: { flexDirection: 'row', borderTopWidth: 0.5, borderTopColor: '#eee', backgroundColor: '#fff', paddingTop: 8 },
  tabItem: { flex: 1, alignItems: 'center', gap: 2 },
  tabText: { fontSize: 10, color: '#999' },
  tabTextActive: { color: '#000', fontWeight: 'bold' },
  avatarImage: { width: '100%', height: '100%' },
});
