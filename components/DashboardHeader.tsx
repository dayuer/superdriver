import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { EnterpriseMetric } from '../types';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  enterprises: EnterpriseMetric[];
}

export default function DashboardHeader({ enterprises }: Props) {
  const [expanded, setExpanded] = useState(false);

  // Calculate aggregated stats
  const totalRevenue = enterprises.reduce((acc, curr) => acc + curr.metrics.revenue, 0);
  const totalOrders = enterprises.reduce((acc, curr) => acc + curr.metrics.orders, 0);
  const aggHours = enterprises.reduce((acc, curr) => acc + curr.metrics.onlineHours, 0);

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={() => setExpanded(!expanded)}>
      <LinearGradient
        colors={['#1c1c1e', '#2c2c2e']} 
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.container, !expanded && styles.containerCompact]}
      >
        {expanded ? (
          // EXPANDED VIEW (Original)
          <>
            <View style={styles.header}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                 <Text style={styles.headerTitle}>今日全平台营收</Text>
                 <Ionicons name="chevron-up" size={14} color="#8E8E93" style={{marginLeft: 4}} />
              </View>
              <View style={styles.statusTag}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>核心在线</Text>
              </View>
            </View>

            <Text style={styles.revenueAmount}>
              <Text style={styles.currency}>¥</Text> {totalRevenue.toFixed(2)}
            </Text>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>总单量</Text>
                <Text style={styles.statValue}>{totalOrders}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>在线时长</Text>
                <Text style={styles.statValue}>{aggHours.toFixed(1)}h</Text>
              </View>
            </View>
          </>
        ) : (
          // COMPACT VIEW
          <View style={styles.compactRow}>
             <View style={styles.compactLeft}>
                <View style={styles.compactTitleRow}>
                    <Text style={styles.compactLabel}>今日营收</Text>
                    <Ionicons name="chevron-down" size={12} color="#8E8E93" style={{marginLeft: 4, opacity: 0.7}} />
                </View>
                <Text style={styles.compactRevenue}>
                    <Text style={{fontSize: 16, fontWeight: '600'}}>¥</Text> {totalRevenue.toFixed(2)}
                </Text>
             </View>
             
             <View style={styles.compactRight}>
                 <View style={styles.compactStats}>
                    <Text style={styles.compactStatText}>
                        <Text style={{color: '#8E8E93'}}>单 </Text>{totalOrders}
                    </Text>
                    <View style={styles.compactDivider} />
                    <Text style={styles.compactStatText}>
                        {aggHours.toFixed(1)}<Text style={{color: '#8E8E93'}}>h</Text>
                    </Text>
                 </View>
                 <View style={styles.statusDotCompact} />
             </View>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    marginBottom: 0, // Removed margin to sit flush
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    zIndex: 10, // Bring to front
  },
  containerCompact: {
    paddingVertical: 12,
    paddingBottom: 16,
    paddingTop: Platform.OS === 'ios' ? 44 : 12, // Status bar adjustment
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  compactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end', // Align bottom
  },
  compactLeft: {
     justifyContent: 'flex-end',
  },
  compactTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 2
  },
  compactLabel: {
    color: '#8E8E93',
    fontSize: 11,
    fontWeight: '500'
  },
  compactRevenue: {
    color: '#FFD700',
    fontSize: 24,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    letterSpacing: -0.5,
    lineHeight: 28
  },
  compactRight: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingBottom: 4
  },
  compactStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8
  },
  compactStatText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600'
  },
  compactDivider: {
      width: 1, 
      height: 10, 
      backgroundColor: 'rgba(255,255,255,0.2)', 
      marginHorizontal: 8 
  },
  statusDotCompact: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: '#34C759',
      borderWidth: 1.5,
      borderColor: '#1c1c1e' // Blend with bg
  },
  // ... Existing Styles should be cleared up in diff ...
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  headerTitle: {
    color: '#8E8E93',
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.5
  },
  statusTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(52, 199, 89, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34C759',
    marginRight: 5
  },
  statusText: {
    color: '#34C759',
    fontSize: 11,
    fontWeight: '600'
  },
  revenueAmount: {
    fontSize: 48,
    fontWeight: '800',
    color: '#FFD700', // Gold
    marginVertical: 4,
    textShadowColor: 'rgba(255, 215, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', // Monospaced for numbers look cool
    letterSpacing: -1
  },
  currency: {
    fontSize: 28,
    fontWeight: '600',
    color: '#FFD700',
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 10,
    alignItems: 'center'
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6
  },
  statLabel: {
    color: '#8E8E93',
    fontSize: 13
  },
  statValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  divider: {
    width: 1,
    height: 12,
    backgroundColor: '#48484A',
    marginHorizontal: 15
  }
});
