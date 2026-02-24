/**
 * IMSessionSettings - 会话设置弹窗
 * 
 * 功能：
 * - 群聊成员管理
 * - 置顶/取消置顶
 * - 清空聊天记录
 * - 消息免打扰
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Switch,
  ScrollView,
  Alert,
  FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Agent } from '../../types';
import { AgentAvatar } from '../AgentAvatar';
import { BASE_URL } from '../../services/api';
import { TEXT, BACKGROUND, BORDER, PRIMARY, SUCCESS, DANGER } from '../../styles/colors';
import { IMSession } from './IMChatList';

// ==================== 类型定义 ====================

interface IMSessionSettingsProps {
  visible: boolean;
  session: IMSession | null;
  members?: Agent[];
  onClose: () => void;
  onPinToggle?: (sessionId: string, isPinned: boolean) => void;
  onMuteToggle?: (sessionId: string, isMuted: boolean) => void;
  onClearHistory?: (sessionId: string) => void;
  onMemberPress?: (agent: Agent) => void;
  onAddMember?: () => void;
}

// ==================== 子组件 ====================

interface SettingItemProps {
  icon: string;
  iconColor?: string;
  label: string;
  value?: string;
  hasSwitch?: boolean;
  switchValue?: boolean;
  onSwitchChange?: (value: boolean) => void;
  onPress?: () => void;
  danger?: boolean;
}

const SettingItem: React.FC<SettingItemProps> = ({
  icon,
  iconColor = TEXT.primary,
  label,
  value,
  hasSwitch,
  switchValue,
  onSwitchChange,
  onPress,
  danger,
}) => {
  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container style={styles.settingItem} onPress={onPress} activeOpacity={0.7}>
      <Ionicons name={icon as any} size={22} color={danger ? DANGER : iconColor} />
      <Text style={[styles.settingLabel, danger && styles.dangerText]}>{label}</Text>
      {hasSwitch ? (
        <Switch
          value={switchValue}
          onValueChange={onSwitchChange}
          trackColor={{ false: '#E5E5EA', true: SUCCESS + '80' }}
          thumbColor={switchValue ? SUCCESS : '#fff'}
        />
      ) : value ? (
        <Text style={styles.settingValue}>{value}</Text>
      ) : (
        <Ionicons name="chevron-forward" size={18} color={TEXT.quaternary} />
      )}
    </Container>
  );
};

// ==================== 主组件 ====================

export const IMSessionSettings: React.FC<IMSessionSettingsProps> = ({
  visible,
  session,
  members = [],
  onClose,
  onPinToggle,
  onMuteToggle,
  onClearHistory,
  onMemberPress,
  onAddMember,
}) => {
  const insets = useSafeAreaInsets();
  const [isPinned, setIsPinned] = useState(session?.isPinned ?? false);
  const [isMuted, setIsMuted] = useState(false);

  if (!session) return null;

  const isGroup = session.type === 'group';

  const handlePinToggle = (value: boolean) => {
    setIsPinned(value);
    onPinToggle?.(session.id, value);
  };

  const handleMuteToggle = (value: boolean) => {
    setIsMuted(value);
    onMuteToggle?.(session.id, value);
  };

  const handleClearHistory = () => {
    Alert.alert(
      '清空聊天记录',
      '确定要清空与该会话的所有聊天记录吗？此操作不可恢复。',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '清空',
          style: 'destructive',
          onPress: () => onClearHistory?.(session.id),
        },
      ]
    );
  };

  const renderMember = ({ item }: { item: Agent }) => (
    <TouchableOpacity
      style={styles.memberItem}
      onPress={() => onMemberPress?.(item)}
      activeOpacity={0.7}
    >
      <AgentAvatar
        avatar={item.avatar}
        size={50}
        isPaid={item.isPaid}
        baseUrl={BASE_URL}
      />
      <Text style={styles.memberName} numberOfLines={1}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* 头部 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color={TEXT.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>
            {isGroup ? '群聊设置' : '聊天设置'}
          </Text>
          <View style={styles.closeButton} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* 群成员（仅群聊显示） */}
          {isGroup && members.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                群成员 ({members.length})
              </Text>
              <FlatList
                horizontal
                data={members}
                renderItem={renderMember}
                keyExtractor={(item) => item.id}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.membersContainer}
                ListFooterComponent={
                  onAddMember ? (
                    <TouchableOpacity
                      style={styles.addMemberButton}
                      onPress={onAddMember}
                      activeOpacity={0.7}
                    >
                      <View style={styles.addMemberIcon}>
                        <Ionicons name="add" size={28} color={TEXT.tertiary} />
                      </View>
                      <Text style={styles.addMemberText}>添加</Text>
                    </TouchableOpacity>
                  ) : null
                }
              />
            </View>
          )}

          {/* 会话信息 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>会话设置</Text>
            <View style={styles.settingsGroup}>
              <SettingItem
                icon="pin"
                label="置顶聊天"
                hasSwitch
                switchValue={isPinned}
                onSwitchChange={handlePinToggle}
              />
              <SettingItem
                icon="notifications-off-outline"
                label="消息免打扰"
                hasSwitch
                switchValue={isMuted}
                onSwitchChange={handleMuteToggle}
              />
            </View>
          </View>

          {/* 聊天背景等高级设置 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>更多</Text>
            <View style={styles.settingsGroup}>
              <SettingItem
                icon="image-outline"
                label="聊天背景"
                onPress={() => {}}
              />
              <SettingItem
                icon="search-outline"
                label="搜索聊天记录"
                onPress={() => {}}
              />
            </View>
          </View>

          {/* 危险操作 */}
          <View style={styles.section}>
            <View style={styles.settingsGroup}>
              <SettingItem
                icon="trash-outline"
                label="清空聊天记录"
                onPress={handleClearHistory}
                danger
              />
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

// ==================== 样式 ====================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND.secondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: BACKGROUND.primary,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BORDER.light,
  },
  closeButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: TEXT.primary,
  },
  content: {
    flex: 1,
  },

  // Section
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 13,
    color: TEXT.tertiary,
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  settingsGroup: {
    backgroundColor: BACKGROUND.primary,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: BORDER.light,
  },

  // Setting Item
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: BACKGROUND.primary,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BORDER.light,
  },
  settingLabel: {
    flex: 1,
    fontSize: 16,
    color: TEXT.primary,
    marginLeft: 12,
  },
  settingValue: {
    fontSize: 15,
    color: TEXT.tertiary,
    marginRight: 4,
  },
  dangerText: {
    color: DANGER,
  },

  // Members
  membersContainer: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: BACKGROUND.primary,
  },
  memberItem: {
    alignItems: 'center',
    marginHorizontal: 8,
    width: 60,
  },
  memberName: {
    fontSize: 12,
    color: TEXT.secondary,
    marginTop: 6,
    textAlign: 'center',
  },
  addMemberButton: {
    alignItems: 'center',
    marginHorizontal: 8,
    width: 60,
  },
  addMemberIcon: {
    width: 50,
    height: 50,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: BORDER.light,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addMemberText: {
    fontSize: 12,
    color: TEXT.tertiary,
    marginTop: 6,
  },
});

export default IMSessionSettings;
