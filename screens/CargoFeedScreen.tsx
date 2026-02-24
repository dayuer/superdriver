/**
 * CargoFeedScreen - 重构版
 * 使用拆分后的子组件和 hook，从 412 行减至约 80 行
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { CargoCard } from '../components/cargo/CargoCard';
import { EmptyCargoState } from '../components/cargo/EmptyCargoState';
import { useCargoMatch } from '../hooks/useCargoMatch';
import { CargoMatch } from '../services/recruitment-api';
import { TEXT, BACKGROUND, PRIMARY } from '../styles/colors';

export default function CargoFeedScreen() {
  const {
    matches,
    loading,
    refreshing,
    loadMatches,
    handleAccept,
    handleReject,
    refresh,
  } = useCargoMatch();

  const renderItem = ({ item }: { item: CargoMatch }) => (
    <CargoCard match={item} onAccept={handleAccept} onReject={handleReject} />
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={PRIMARY} />
        <Text style={styles.loadingText}>正在加载推荐货源...</Text>
      </View>
    );
  }

  if (matches.length === 0) {
    return <EmptyCargoState onRefresh={loadMatches} />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={matches}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshing={refreshing}
        onRefresh={refresh}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.headerTitle}>为您推荐</Text>
            <Text style={styles.headerSubtitle}>基于您的车型和线路偏好</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND.primary,
  },
  list: {
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: TEXT.primary,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: TEXT.secondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BACKGROUND.primary,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: TEXT.secondary,
  },
});
