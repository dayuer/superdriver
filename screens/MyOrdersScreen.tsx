import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getRecommendedCargos, CargoMatch } from '../services/recruitment-api';

export default function MyOrdersScreen({ onBack }: { onBack: () => void }) {
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'accepted' | 'completed'>('all');
  const [orders, setOrders] = useState<CargoMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadOrders();
  }, [activeTab]);

  async function loadOrders() {
    try {
      setLoading(true);
      const statusMap = {
        all: undefined,
        pending: 'matched',
        accepted: 'accepted',
        completed: 'completed',
      };
      const { data } = await getRecommendedCargos({ 
        status: statusMap[activeTab],
        limit: 50 
      });
      setOrders(data);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleRefresh() {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  }

  const renderOrderCard = ({ item }: { item: CargoMatch }) => {
    const { cargo, matchScore, status } = item;
    
    const statusConfig = {
      matched: { text: '待接单', color: '#FF9500' },
      accepted: { text: '运输中', color: '#007AFF' },
      completed: { text: '已完成', color: '#34C759' },
      rejected: { text: '已拒绝', color: '#8E8E93' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.matched;

    return (
      <TouchableOpacity style={styles.orderCard}>
        <View style={styles.orderHeader}>
          <View style={styles.routeInfo}>
            <Text style={styles.cityText}>{cargo.originCity}</Text>
            <Ionicons name="arrow-forward" size={16} color="#8E8E93" style={{ marginHorizontal: 8 }} />
            <Text style={styles.cityText}>{cargo.destCity}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: config.color + '20' }]}>
            <Text style={[styles.statusText, { color: config.color }]}>{config.text}</Text>
          </View>
        </View>

        <Text style={styles.orderTitle} numberOfLines={1}>{cargo.title}</Text>

        <View style={styles.orderDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="cube-outline" size={14} color="#8E8E93" />
            <Text style={styles.detailText}>{cargo.cargoType} · {cargo.weight}吨</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={14} color="#8E8E93" />
            <Text style={styles.detailText}>{formatDate(cargo.loadingTime)}</Text>
          </View>
        </View>

        <View style={styles.orderFooter}>
          <View style={styles.priceSection}>
            <Text style={styles.priceLabel}>运费</Text>
            <Text style={styles.priceValue}>¥{cargo.price}</Text>
          </View>
          {status === 'matched' && (
            <View style={styles.matchScore}>
              <Text style={styles.matchScoreText}>匹配度 {Math.round(matchScore)}%</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#1c1c1e" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>我的订单</Text>
        <View style={{ width: 44 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {(['all', 'pending', 'accepted', 'completed'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab === 'all' ? '全部' : tab === 'pending' ? '待接单' : tab === 'accepted' ? '运输中' : '已完成'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      <FlatList
        data={orders}
        renderItem={renderOrderCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="cube-outline" size={64} color="#E5E5EA" />
            <Text style={styles.emptyText}>暂无订单</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  return `${month}月${day}日 ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E5EA',
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1c1c1e',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#007AFF',
  },
  tabText: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#ffffff',
  },
  listContent: {
    padding: 16,
  },
  orderCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  routeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1c1c1e',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  orderTitle: {
    fontSize: 15,
    color: '#3c3c43',
    marginBottom: 12,
  },
  orderDetails: {
    gap: 8,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 13,
    color: '#8E8E93',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 0.5,
    borderTopColor: '#E5E5EA',
  },
  priceSection: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  priceLabel: {
    fontSize: 13,
    color: '#8E8E93',
  },
  priceValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FF3B30',
  },
  matchScore: {
    backgroundColor: '#34C75915',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  matchScoreText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#34C759',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 15,
    color: '#8E8E93',
  },
});
