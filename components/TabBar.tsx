/**
 * TabBar - 底部导航栏
 * 
 * 从 App.tsx 中抽取的 Tab 栏 UI 组件
 * 
 * [HIGH-001 重构] App.tsx 精简计划
 */
import React from 'react';
import { View, Text, TouchableOpacity, Platform, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type TabId = 'mission' | 'contacts' | 'shop' | 'me';

interface TabConfig {
  id: TabId;
  label: string;
  icon: string;        // outline
  activeIcon: string;   // filled
}

const TABS: TabConfig[] = [
  { id: 'mission', label: '工作台', icon: 'grid-outline', activeIcon: 'grid' },
  { id: 'contacts', label: '服务', icon: 'briefcase-outline', activeIcon: 'briefcase' },
  { id: 'shop', label: '发展', icon: 'rocket-outline', activeIcon: 'rocket' },
  { id: 'me', label: '我的', icon: 'person-outline', activeIcon: 'person' },
];

interface TabBarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  /** 聊天 Tab 的未读消息数 */
  unreadCount?: number;
}

export const TabBar: React.FC<TabBarProps> = ({ activeTab, onTabChange, unreadCount = 0 }) => {
  return (
    <View style={styles.tabBar}>
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        const showBadge = tab.id === 'contacts' && unreadCount > 0;

        return (
          <TouchableOpacity
            key={tab.id}
            style={styles.tabItem}
            onPress={() => onTabChange(tab.id)}
          >
            <View style={styles.iconContainer}>
              <Ionicons
                name={(isActive ? tab.activeIcon : tab.icon) as any}
                size={24}
                color={isActive ? '#1c1c1e' : '#8E8E93'}
              />
              {showBadge && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Text>
                </View>
              )}
            </View>
            <Text style={[styles.tabLabel, isActive && styles.activeTabLabel]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    height: Platform.OS === 'ios' ? 92 : 68,
    backgroundColor: '#fff',
    borderTopWidth: 0.5,
    borderTopColor: '#E5E5EA',
    paddingBottom: Platform.OS === 'ios' ? 28 : 8,
    paddingTop: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -10,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FF3B30',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  tabLabel: {
    fontSize: 11,
    marginTop: 4,
    color: '#8E8E93',
  },
  activeTabLabel: {
    color: '#1c1c1e',
    fontWeight: '700',
  },
});

export default TabBar;
