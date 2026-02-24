/**
 * ServiceEventList — 服务事件列表
 *
 * 带筛选 Tab (全部/进行中/已结案) + 下拉刷新 + 空状态
 */
import React from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ServiceEvent, Agent } from '../../types';
import { ServiceEventCard } from './ServiceEventCard';
import { ServiceFilter } from '../../hooks/useServiceEvents';
import { TEXT, BACKGROUND, BORDER, PRIMARY } from '../../styles/colors';

interface Props {
    events: ServiceEvent[];
    isLoading: boolean;
    isRefreshing: boolean;
    filter: ServiceFilter;
    onFilterChange: (f: ServiceFilter) => void;
    onEventPress: (event: ServiceEvent) => void;
    onRefresh: () => void;
    onLoadMore: () => void;
    agentsMap?: Record<string, Agent>;
}

const FILTERS: { id: ServiceFilter; label: string }[] = [
    { id: 'all', label: '全部' },
    { id: 'active', label: '进行中' },
    { id: 'closed', label: '已结案' },
];

export const ServiceEventList: React.FC<Props> = ({
    events,
    isLoading,
    isRefreshing,
    filter,
    onFilterChange,
    onEventPress,
    onRefresh,
    onLoadMore,
    agentsMap = {},
}) => {
    // 筛选栏
    const renderFilterBar = () => (
        <View style={styles.filterBar}>
            {FILTERS.map(f => (
                <TouchableOpacity
                    key={f.id}
                    style={[styles.filterChip, filter === f.id && styles.filterChipActive]}
                    onPress={() => onFilterChange(f.id)}
                >
                    <Text style={[styles.filterText, filter === f.id && styles.filterTextActive]}>
                        {f.label}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );

    // 空状态
    const renderEmpty = () => {
        if (isLoading) return null;
        return (
            <View style={styles.empty}>
                <Ionicons name="briefcase-outline" size={56} color="#D1D1D6" />
                <Text style={styles.emptyTitle}>
                    {filter === 'closed' ? '暂无已结案事件' : '暂无服务事件'}
                </Text>
                <Text style={styles.emptySubtitle}>
                    和 Agent 专家聊天时，系统会自动创建服务跟进
                </Text>
            </View>
        );
    };

    // 加载中
    if (isLoading && events.length === 0) {
        return (
            <View style={styles.container}>
                {renderFilterBar()}
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={PRIMARY} />
                    <Text style={styles.loadingText}>加载中...</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {renderFilterBar()}
            <FlatList
                data={events}
                keyExtractor={(item) => String(item.id)}
                renderItem={({ item }) => (
                    <ServiceEventCard
                        event={item}
                        agentsMap={agentsMap}
                        onPress={onEventPress}
                    />
                )}
                contentContainerStyle={events.length === 0 ? styles.emptyList : styles.listContent}
                ListEmptyComponent={renderEmpty}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={onRefresh}
                        tintColor={PRIMARY}
                    />
                }
                onEndReached={onLoadMore}
                onEndReachedThreshold={0.3}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: BACKGROUND.primary,
    },
    // 筛选栏
    filterBar: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 10,
        gap: 8,
    },
    filterChip: {
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: '#F0F0F5',
    },
    filterChipActive: {
        backgroundColor: '#1c1c1e',
    },
    filterText: {
        fontSize: 13,
        fontWeight: '500',
        color: TEXT.secondary,
    },
    filterTextActive: {
        color: '#fff',
    },
    // 列表
    listContent: {
        paddingTop: 4,
        paddingBottom: 100,
    },
    emptyList: {
        flex: 1,
    },
    // 加载
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: TEXT.tertiary,
    },
    // 空状态
    empty: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: TEXT.secondary,
        marginTop: 16,
    },
    emptySubtitle: {
        fontSize: 13,
        color: TEXT.tertiary,
        marginTop: 6,
        textAlign: 'center',
        lineHeight: 18,
    },
});

export default ServiceEventList;
