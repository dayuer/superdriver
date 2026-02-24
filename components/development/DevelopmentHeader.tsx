/**
 * 发展中心头部组件
 * 包含定位、搜索、快捷入口和 Tab 切换
 */
import React from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { QuickEntryGrid } from './QuickEntryGrid';
import { DEVELOPMENT_TABS, DevelopmentTabId } from '../../config/constants';
import { GRADIENTS, TEXT, BACKGROUND, BORDER, PRIMARY } from '../../styles/colors';

export interface DevelopmentHeaderProps {
    activeCity: string;
    activeTab: DevelopmentTabId;
    searchQuery: string;
    searchFocused: boolean;
    onCityPress: () => void;
    onSearchChange: (text: string) => void;
    onSearchFocus: () => void;
    onSearchBlur: () => void;
    onSearchClear: () => void;
    onTabChange: (tab: DevelopmentTabId) => void;
    onQuickEntryPress?: (id: string) => void;
}

export const DevelopmentHeader: React.FC<DevelopmentHeaderProps> = ({
    activeCity,
    activeTab,
    searchQuery,
    searchFocused,
    onCityPress,
    onSearchChange,
    onSearchFocus,
    onSearchBlur,
    onSearchClear,
    onTabChange,
    onQuickEntryPress,
}) => {
    return (
        <View style={styles.container}>
            <LinearGradient
                colors={GRADIENTS.darkHeader}
                style={styles.gradient}
            >
                <SafeAreaView edges={['top']}>
                    <View style={styles.content}>
                        {/* 顶部栏 - 定位按钮 */}
                        <View style={styles.topBar}>
                            <TouchableOpacity
                                style={styles.locationBtn}
                                onPress={onCityPress}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="location" size={16} color="#fff" />
                                <Text style={styles.locationText}>
                                    {activeCity === '全部' ? '全国' : activeCity}
                                </Text>
                                <Ionicons name="chevron-down" size={14} color="rgba(255,255,255,0.6)" />
                            </TouchableOpacity>
                        </View>

                        {/* 搜索框 */}
                        <TouchableOpacity
                            style={[styles.searchBar, searchFocused && styles.searchBarFocused]}
                            activeOpacity={0.9}
                        >
                            <Ionicons
                                name="search"
                                size={18}
                                color={searchFocused ? PRIMARY : 'rgba(255,255,255,0.5)'}
                            />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="搜索职位、公司、加盟项目..."
                                placeholderTextColor="rgba(255,255,255,0.4)"
                                value={searchQuery}
                                onChangeText={onSearchChange}
                                onFocus={onSearchFocus}
                                onBlur={onSearchBlur}
                            />
                            {searchQuery.length > 0 && (
                                <TouchableOpacity onPress={onSearchClear}>
                                    <Ionicons name="close-circle" size={18} color="rgba(255,255,255,0.5)" />
                                </TouchableOpacity>
                            )}
                        </TouchableOpacity>

                        {/* 快捷入口 */}
                        <QuickEntryGrid onPress={onQuickEntryPress} />
                    </View>
                </SafeAreaView>
            </LinearGradient>

            {/* Tab 切换 */}
            <View style={styles.tabContainer}>
                {DEVELOPMENT_TABS.map((tab) => (
                    <TouchableOpacity
                        key={tab.id}
                        style={[styles.tabItem, activeTab === tab.id && styles.tabItemActive]}
                        onPress={() => onTabChange(tab.id)}
                    >
                        <Ionicons
                            name={tab.icon as any}
                            size={18}
                            color={activeTab === tab.id ? PRIMARY : TEXT.secondary}
                        />
                        <Text style={[styles.tabLabel, activeTab === tab.id && styles.tabLabelActive]}>
                            {tab.label}
                        </Text>
                        {activeTab === tab.id && <View style={styles.tabIndicator} />}
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: BACKGROUND.card,
    },
    gradient: {
        paddingBottom: 4,
    },
    content: {
        paddingHorizontal: 16,
    },
    topBar: {
        paddingTop: 8,
        paddingBottom: 12,
    },
    locationBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        gap: 4,
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    locationText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#fff',
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        gap: 10,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    searchBarFocused: {
        borderColor: PRIMARY,
        backgroundColor: 'rgba(255,255,255,0.15)',
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: '#fff',
        padding: 0,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: BACKGROUND.card,
        borderBottomWidth: 1,
        borderBottomColor: BORDER.light,
    },
    tabItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        gap: 6,
        position: 'relative',
    },
    tabItemActive: {
        // Active styles handled by indicator
    },
    tabLabel: {
        fontSize: 14,
        color: TEXT.secondary,
        fontWeight: '500',
    },
    tabLabelActive: {
        color: PRIMARY,
        fontWeight: '600',
    },
    tabIndicator: {
        position: 'absolute',
        bottom: 0,
        left: '30%',
        right: '30%',
        height: 3,
        backgroundColor: PRIMARY,
        borderRadius: 1.5,
    },
});

export default DevelopmentHeader;
