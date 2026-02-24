/**
 * 发展中心屏幕 (重构版)
 * 组装子组件，保持精简
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    View,
    ScrollView,
    StyleSheet,
    RefreshControl,
    Modal,
    TouchableOpacity,
    Text,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CommunityFeed, PostDetail } from './community';
import { DevelopmentTabId } from '../config/constants';
import {
    getEnterprises,
    toggleEnterpriseBind,
    EnterpriseData,
    JobPosition,
    FranchiseItem,
    INITIAL_JOBS,
    INITIAL_FRANCHISE,
} from '../services/development';

import {
    DevelopmentHeader,
    CityPickerModal,
    RecommendBanner,
    JobCard,
    FranchiseCard,
    ServiceCard,
} from './development';
import { SectionHeader, EmptyState } from './ui';
import { BACKGROUND, TEXT, BORDER } from '../styles/colors';

export default function DevelopmentCenterNew() {
    // 社区详情状态
    const [communityPostId, setCommunityPostId] = useState<string | null>(null);

    // Tab 和筛选状态
    const [activeTab, setActiveTab] = useState<DevelopmentTabId>('recommend');
    const [activeCity, setActiveCity] = useState('全部');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchFocused, setSearchFocused] = useState(false);
    const [showCityPicker, setShowCityPicker] = useState(false);

    // 数据状态
    const [enterprises, setEnterprises] = useState<EnterpriseData[]>([]);
    const [jobs] = useState<JobPosition[]>(INITIAL_JOBS);
    const [franchise] = useState<FranchiseItem[]>(INITIAL_FRANCHISE);

    // 加载状态
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Modal 状态
    const [selectedEnterprise, setSelectedEnterprise] = useState<EnterpriseData | null>(null);
    const [selectedJob, setSelectedJob] = useState<JobPosition | null>(null);
    const [selectedFranchise, setSelectedFranchise] = useState<FranchiseItem | null>(null);

    // 初始化加载
    useEffect(() => {
        // db + cache 懒初始化，无需手动 init
        loadEnterprises();
    }, []);

    // 加载企业数据
    const loadEnterprises = useCallback(async (forceRefresh = false) => {
        try {
            const data = await getEnterprises({ forceRefresh });
            setEnterprises(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error('[DevelopmentCenter] Failed to load:', e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    // 下拉刷新
    const handleRefresh = useCallback(() => {
        setRefreshing(true);
        loadEnterprises(true);
    }, [loadEnterprises]);

    // 筛选企业
    const filteredEnterprises = useMemo(() => {
        return (enterprises || []).filter(ent => {
            const cityMatch = activeCity === '全部' || ent.city === activeCity || ent.city === '全国';
            const searchMatch = !searchQuery || ent.name.includes(searchQuery) ||
                (ent.tags && ent.tags.some(t => t.includes(searchQuery)));
            return cityMatch && searchMatch;
        });
    }, [enterprises, activeCity, searchQuery]);

    // 绑定/解绑企业
    const handleToggleBind = async (id: string) => {
        try {
            const res = await toggleEnterpriseBind(id);
            setEnterprises(prev => prev.map(ent =>
                ent.id === id ? { ...ent, isBound: res.isBound } : ent
            ));
            if (selectedEnterprise?.id === id) {
                setSelectedEnterprise(prev => prev ? { ...prev, isBound: res.isBound } : null);
            }
        } catch (e) {
            Alert.alert('操作失败', '无法更新绑定状态');
        }
    };

    // 渲染推荐内容
    const renderRecommendContent = () => (
        <View>
            <RecommendBanner />

            {/* 热门招聘 */}
            <SectionHeader
                icon="flame"
                iconColor="#FF3B30"
                title="热门招聘"
                actionText="更多"
                onAction={() => setActiveTab('jobs')}
            />
            {jobs.slice(0, 2).map(job => (
                <JobCard key={job.id} job={job} onPress={setSelectedJob} />
            ))}

            {/* 加盟商机 */}
            <SectionHeader icon="business" iconColor="#FF9500" title="加盟商机" />
            {franchise.slice(0, 2).map(item => (
                <FranchiseCard key={item.id} item={item} onPress={setSelectedFranchise} />
            ))}

            {/* 同行圈 */}
            <SectionHeader
                icon="chatbubbles"
                iconColor="#667eea"
                title="同行圈"
                actionText="更多"
                onAction={() => setActiveTab('community')}
            />
            <View style={{ paddingHorizontal: 16 }}>
                <CommunityFeed compact onPostPress={setCommunityPostId} />
            </View>

            {/* 服务市场 */}
            <SectionHeader icon="apps" iconColor="#007AFF" title="服务" />
            {filteredEnterprises.slice(0, 3).map(ent => (
                <ServiceCard
                    key={ent.id}
                    enterprise={ent}
                    onPress={setSelectedEnterprise}
                    onToggleBind={handleToggleBind}
                />
            ))}
        </View>
    );

    // 渲染招聘列表
    const renderJobsContent = () => (
        <View style={styles.jobsContainer}>
            <View style={styles.jobsHeader}>
                <Text style={styles.jobsTitle}>为你推荐 {jobs.length} 个职位</Text>
                <TouchableOpacity style={styles.filterBtn}>
                    <Ionicons name="options-outline" size={18} color="#007AFF" />
                    <Text style={styles.filterText}>筛选</Text>
                </TouchableOpacity>
            </View>
            {jobs.map(job => (
                <JobCard key={job.id} job={job} onPress={setSelectedJob} />
            ))}
        </View>
    );

    return (
        <View style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                stickyHeaderIndices={[0]}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        tintColor="#007AFF"
                    />
                }
            >
                {/* 固定头部 */}
                <DevelopmentHeader
                    activeCity={activeCity}
                    activeTab={activeTab}
                    searchQuery={searchQuery}
                    searchFocused={searchFocused}
                    onCityPress={() => setShowCityPicker(true)}
                    onSearchChange={setSearchQuery}
                    onSearchFocus={() => setSearchFocused(true)}
                    onSearchBlur={() => setSearchFocused(false)}
                    onSearchClear={() => setSearchQuery('')}
                    onTabChange={setActiveTab}
                />

                {/* 内容区 */}
                {activeTab === 'recommend' && renderRecommendContent()}
                {activeTab === 'jobs' && renderJobsContent()}
                {activeTab === 'community' && (
                    <CommunityFeed onPostPress={setCommunityPostId} />
                )}

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* 城市选择器 */}
            <CityPickerModal
                visible={showCityPicker}
                activeCity={activeCity}
                onClose={() => setShowCityPicker(false)}
                onSelect={(city) => {
                    setActiveCity(city);
                    setShowCityPicker(false);
                }}
            />

            {/* 企业详情 Modal (简化版) */}
            <Modal
                visible={!!selectedEnterprise}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setSelectedEnterprise(null)}
            >
                {selectedEnterprise && (
                    <SafeAreaView style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <TouchableOpacity onPress={() => setSelectedEnterprise(null)}>
                                <Ionicons name="close-circle" size={30} color="#E5E5EA" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView contentContainerStyle={styles.modalContent}>
                            <Text style={styles.modalTitle}>{selectedEnterprise.name}</Text>
                            <Text style={styles.modalDesc}>{selectedEnterprise.description}</Text>
                        </ScrollView>
                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                style={[styles.modalBtn, selectedEnterprise.isBound && styles.modalBtnBound]}
                                onPress={() => handleToggleBind(selectedEnterprise.id)}
                            >
                                <Text style={styles.modalBtnText}>
                                    {selectedEnterprise.isBound ? '解除绑定' : '立即获取'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </SafeAreaView>
                )}
            </Modal>

            {/* 社区帖子详情 Modal */}
            <Modal
                visible={!!communityPostId}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setCommunityPostId(null)}
            >
                {communityPostId && (
                    <SafeAreaView style={styles.modalContainer}>
                        <PostDetail
                            postId={communityPostId}
                            onClose={() => setCommunityPostId(null)}
                        />
                    </SafeAreaView>
                )}
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: BACKGROUND.primary,
    },
    scrollView: {
        flex: 1,
    },
    jobsContainer: {
        paddingTop: 16,
    },
    jobsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    jobsTitle: {
        fontSize: 14,
        color: TEXT.secondary,
    },
    filterBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    filterText: {
        fontSize: 14,
        color: '#007AFF',
    },
    // Modal
    modalContainer: {
        flex: 1,
        backgroundColor: BACKGROUND.card,
    },
    modalHeader: {
        padding: 16,
        alignItems: 'flex-end',
    },
    modalContent: {
        padding: 20,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: TEXT.primary,
        marginBottom: 12,
    },
    modalDesc: {
        fontSize: 15,
        color: TEXT.secondary,
        lineHeight: 22,
    },
    modalFooter: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: BORDER.light,
    },
    modalBtn: {
        backgroundColor: '#007AFF',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    modalBtnBound: {
        backgroundColor: TEXT.secondary,
    },
    modalBtnText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
});
