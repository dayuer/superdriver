import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Platform } from 'react-native';
import { EnterpriseMetric } from '../types';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  enterprises: EnterpriseMetric[];
  onToggleStatus: (id: string) => void;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 36; // Full width minus margin

export default function SaaSStack({ enterprises, onToggleStatus }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <View style={styles.container}>
      
      <ScrollView
         horizontal
         pagingEnabled
         showsHorizontalScrollIndicator={false}
         snapToInterval={CARD_WIDTH + 12} // Card + margin
         decelerationRate="fast"
         contentContainerStyle={styles.scrollContent}
         onScroll={(e) => {
             const slide = Math.round(e.nativeEvent.contentOffset.x / (CARD_WIDTH + 12));
             setActiveIndex(slide);
         }}
         scrollEventThrottle={16}
      >
        {enterprises.map((ent, index) => (
            <View key={ent.id} style={[styles.card, { width: CARD_WIDTH, marginRight: index === enterprises.length - 1 ? 0 : 12 }]}>
                {/* Header: Platform Info & Status */}
                <View style={styles.header}>
                    <View style={styles.brand}>
                        <View style={[styles.logoPlaceholder, { backgroundColor: ent.color }]}>
                            <Text style={styles.logoText}>{ent.name.charAt(0)}</Text>
                        </View>
                        <View>
                            <Text style={styles.platformName}>{ent.name}</Text>
                            <View style={styles.statusRow}>
                                <View style={[styles.statusDot, { backgroundColor: getStatusColor(ent.metrics.status) }]} />
                                <Text style={[styles.statusText, { color: getStatusColor(ent.metrics.status) }]}>
                                    {getStatusText(ent.metrics.status)}
                                </Text>
                            </View>
                        </View>
                    </View>

                    <TouchableOpacity 
                        style={[styles.actionBtn, { borderColor: getStatusColor(ent.metrics.status) }]}
                        onPress={() => onToggleStatus(ent.id)}
                    >
                        <Text style={[styles.actionBtnText, { color: getStatusColor(ent.metrics.status) }]}>
                            {ent.metrics.status === 'online' ? '下线' : '上线'}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Metrics Grid */}
                <View style={styles.metricsGrid}>
                    <View style={styles.metric}>
                        <Text style={styles.metricLabel}>今日流水</Text>
                        <Text style={styles.metricValue}>¥{ent.metrics.revenue}</Text>
                    </View>
                    <View style={styles.verticalLine} />
                    <View style={styles.metric}>
                        <Text style={styles.metricLabel}>服务分</Text>
                        <Text style={[styles.metricValue, { color: '#FF9500' }]}>{ent.rating || 4.9}</Text>
                    </View>
                    <View style={styles.verticalLine} />
                    <View style={styles.metric}>
                        <Text style={styles.metricLabel}>完单</Text>
                        <Text style={styles.metricValue}>{ent.metrics.orders}</Text>
                    </View>
                </View>

                {/* Dynamic Intel/Notification Area */}
                {ent.latestIntel && (
                    <View style={styles.intelBox}>
                        <Ionicons name="flash" size={12} color="#FF3B30" style={{ marginRight: 4 }} />
                        <Text style={styles.intelText}>{ent.latestIntel}</Text>
                    </View>
                )}
            </View>
        ))}
      </ScrollView>

      {/* Pagination */}
      <View style={styles.pagination}>
        {enterprises.map((_, i) => (
            <View 
                key={i} 
                style={[
                    styles.paginationDot, 
                    { backgroundColor: i === activeIndex ? '#333' : '#ccc', width: i === activeIndex ? 6 : 6 }
                ]} 
            />
        ))}
      </View>
    </View>
  );
}

const getStatusColor = (status: string) => {
    switch(status) {
        case 'online': return '#34C759'; // Green
        case 'busy': return '#FF9500';   // Orange
        default: return '#FF3B30';       // Red
    }
};

const getStatusText = (status: string) => {
    switch(status) {
        case 'online': return '听单中';
        case 'busy': return '服务中/忙碌';
        default: return '已下线';
    }
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 0, 
    marginBottom: 20
  },
  // sectionTitle removed
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16, // Add padding here for shadow space
    paddingBottom: 20
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA', // Lighter border
    // Deeper shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    gap: 6
  },
  paginationDot: {
    height: 6,
    borderRadius: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  logoPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center'
  },
  logoText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold'
  },
  platformName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 2
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500'
  },
  actionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '600'
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F9F9FB',
    padding: 12,
    borderRadius: 10
  },
  metric: {
    alignItems: 'center',
    flex: 1
  },
  verticalLine: {
    width: 1,
    height: '80%',
    backgroundColor: '#E5E5EA',
    alignSelf: 'center'
  },
  metricLabel: {
    fontSize: 11,
    color: '#8E8E93',
    marginBottom: 4
  },
  metricValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1C1C1E'
  },
  intelBox: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0F0',
    padding: 8,
    borderRadius: 8
  },
  intelText: {
    color: '#FF3B30',
    fontSize: 12,
    fontWeight: '500',
    flex: 1
  }
});
