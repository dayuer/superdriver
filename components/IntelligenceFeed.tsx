import React, { useState } from 'react';
import { 
  ScrollView, 
  View, 
  Text, 
  StyleSheet, 
  RefreshControl,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions
} from 'react-native';
import { ActionCard, DashboardMetrics, Message } from '../types';
import IntelligenceCard from './IntelligenceCard';
// LinkToAgent removed as it's not used 
import CommandDeck from './CommandDeck';
import { Ionicons } from '@expo/vector-icons';

const { height } = Dimensions.get('window');
const HEADER_MAX_HEIGHT = 270; // Matches CommandDeck EXPANDED_HEIGHT + padding

type FeedItem = { type: 'card', data: ActionCard } | { type: 'message', data: Message & { agentId?: string } };

const MOCK_ENTERPRISES: any[] = [
  {
    id: 'e1',
    name: '滴滴出行',
    color: '#FF9500', // Didi Orange
    metrics: { revenue: 420.00, orders: 8, onlineHours: 4.5, percentile: 90, status: 'online' },
    rating: 4.9,
    latestIntel: '机场区域溢价 1.5倍 🔥'
  },
  {
    id: 'e2',
    name: '货拉拉',
    color: '#007AFF', // Blue
    metrics: { revenue: 180.00, orders: 2, onlineHours: 2.0, percentile: 100, status: 'busy' },
    rating: 5.0,
    latestIntel: '顺路单：去往通州，加价 ¥20'
  },
   {
    id: 'e3',
    name: '小优代驾',
    color: '#00C7BE', // Teal
    metrics: { revenue: 0.00, orders: 0, onlineHours: 0.0, percentile: 0, status: 'offline' },
    rating: 4.8
  }
];

const MOCK_CARDS: ActionCard[] = [
  {
    id: '1',
    agentId: 'general',
    agentName: '带头大哥 · 翔哥',
    agentAvatar: '😎',
    title: '优选订单推荐',
    content: '老板，刚才 SaaS 派了个去机场的长单，我看你没接。现在那个区域还有缺口，要不要我帮你抢下一个？',
    timestamp: '14:45',
    type: 'order',
    actions: [
      { label: '忽略', action: 'ignore' },
      { label: '帮我抢', action: 'grab', primary: true }
    ]
  },
  {
    id: '2',
    agentId: 'mechanic',
    agentName: '避坑技师 · 老周',
    agentAvatar: '🔧',
    title: '电瓶电压预警',
    content: '刚才 14:20 打火有点沉。我查了电瓶电压只有 11.8V，寿命剩 20% 了。米其林店现在换瓦尔塔电瓶打 8 折。',
    timestamp: '14:30',
    type: 'issue',
    actions: [
      { label: '我知道了', action: 'dismiss' },
      { label: '预约更换', action: 'book', primary: true }
    ]
  },
  {
    id: '3',
    agentId: 'legal',
    agentName: '律政御姐 · 叶律',
    agentAvatar: '⚖️',
    title: '违章风险提示',
    content: '刚才经过的长街路口新增了压线抓拍。我回溯了你的最近 1 分钟轨迹，大概率没踩线，但下次在那儿并线注意点。',
    timestamp: '14:15',
    type: 'alert',
    actions: [
      { label: '查看监控回放', action: 'replay' }
    ]
  },
  {
    id: '4',
    agentId: 'health',
    agentName: '健康管家 · 林姨',
    agentAvatar: '🍵',
    title: '疲劳值提醒',
    content: '连续驾车 3.5 小时了。颈椎压力指数偏高，建议顺路去这个充电站休息 5 分钟。',
    timestamp: '14:00',
    type: 'health',
    actions: [
      { label: '播放拉伸教程', action: 'exercise', primary: true }
    ]
  }
];

const INITIAL_FEED: FeedItem[] = [
  ...MOCK_CARDS.map(c => ({ type: 'card' as const, data: c })),
  { 
    type: 'message', 
    data: { 
      id: 'm1', 
      type: 'user', 
      content: '帮我看看明天的天气？', 
      timestamp: '14:50' 
    } 
  },
  { 
    type: 'message', 
    data: { 
      id: 'm2', 
      type: 'general', 
      content: '明天北京天气晴，最高气温 8 度，适合跑车。', 
      timestamp: '14:51' 
    } 
  }
];

export default function IntelligenceFeed() {
  const [items, setItems] = useState<FeedItem[]>(INITIAL_FEED);
  const [refreshing, setRefreshing] = useState(false);
  const scrollY = React.useRef(new Animated.Value(0)).current;

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000);
  }, []);

  const handleAction = (cardId: string, action: string) => {
    if (action === 'dismiss' || action === 'ignore') {
      setItems(prev => prev.filter(item => item.type === 'message' || item.data.id !== cardId));
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Unified Command Deck - Fixed at Top */}
      <CommandDeck 
          enterprises={MOCK_ENTERPRISES} 
          onToggleStatus={(id) => console.log(`Toggle ${id}`)} 
          scrollY={scrollY}
      />

      <Animated.ScrollView 
        style={styles.feed}
        contentContainerStyle={[
            styles.feedContent,
            { paddingTop: HEADER_MAX_HEIGHT + 20 }
        ]}
        scrollEventThrottle={16}
        onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
        )}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            progressViewOffset={HEADER_MAX_HEIGHT + 20}
          />
        }
      >
        {items.map((item) => {
          let cardData: ActionCard;

          if (item.type === 'card') {
            cardData = item.data;
          } else {
            // It is a message, convert to ActionCard
            const msgData = item.data;
            cardData = {
              id: msgData.id,
              agentId: msgData.agentId || 'helper',
              agentName: msgData.agentId === 'yin' ? '翔哥' : 'AI助手',
              agentAvatar: msgData.agentId === 'yin' ? '🚗' : '🤖',
              title: msgData.agentId === 'yin' ? '来自翔哥的建议' : '新消息',
              content: msgData.content,
              timestamp: typeof msgData.timestamp === 'string' ? msgData.timestamp : new Date().toISOString(),
              type: 'alert',
              actions: []
            };
          }

          return (
            <View key={cardData.id} style={{ marginBottom: 12 }}>
                 <IntelligenceCard
                    card={cardData}
                    onAction={(action) => console.log('Action:', action)}
                 />
            </View>
          );
        })}
      </Animated.ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F2F5',
  },
  feed: {
    flex: 1,
  },
  feedContent: {
    padding: 16,
    paddingBottom: 100,
  },
  feedTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 10,
    marginTop: 10,
    marginLeft: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  }
});
