import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Image, TextInput, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UserProfile, Agent } from '../types';
import { BASE_URL } from '../services/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface SettingsModalProps {
  visible: boolean;
  profile: UserProfile | null;
  agentsMap: Record<string, Agent>;
  onClose: () => void;
  onRefresh: () => void;
  // loginState/Action temporarily omitted until auth is fully ported
}

export function SettingsModal({ visible, profile, agentsMap, onClose, onRefresh }: SettingsModalProps) {
  const insets = useSafeAreaInsets();
  const [isUpdating, setIsUpdating] = useState(false);
  const [nickname, setNickname] = useState(profile?.nickname || '');
  
  // Simple fake avatars list for now
  const AVATARS = [
    '/avatars/users/user_male_1.png',
    '/avatars/users/user_male_2.png', 
    '/avatars/users/user_female_1.png'
  ];
  
  const [selectedAvatar, setSelectedAvatar] = useState(profile?.avatarId || AVATARS[0]);

  const handleSave = async () => {
      setIsUpdating(true);
      // TODO: Implement update API call
      setTimeout(() => {
          setIsUpdating(false);
          onClose();
          Alert.alert('Success', 'Profile updated (mock)');
      }, 1000);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={[styles.container, { paddingTop: Platform.OS === 'android' ? insets.top : 0 }]}>
        
        {/* Header */}
        <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.headerBtn}>
                <Text style={styles.headerBtnTextCancel}>取消</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>设置</Text>
            <TouchableOpacity onPress={handleSave} disabled={isUpdating} style={styles.headerBtn}>
                <Text style={[styles.headerBtnTextSave, isUpdating && { opacity: 0.5 }]}>
                    {isUpdating ? '保存中' : '完成'}
                </Text>
            </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 40 }}>
            {/* Avatar */}
            <View style={styles.avatarSection}>
                 <TouchableOpacity style={styles.avatarWrapper}>
                    {selectedAvatar.includes('/') ? (
                        <Image source={{ uri: `${BASE_URL}${selectedAvatar}` }} style={styles.avatarLarge} />
                    ) : (
                        <Text style={{fontSize: 40}}>{selectedAvatar}</Text>
                    )}
                    <View style={styles.editIconBadge}>
                        <Ionicons name="camera" size={12} color="#fff" />
                    </View>
                 </TouchableOpacity>
                 <Text style={styles.changeAvatarText}>更换头像</Text>
            </View>

            {/* Profile Form */}
            <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>个人信息</Text></View>
            <View style={styles.formGroup}>
                <View style={styles.formItem}>
                    <Text style={styles.label}>昵称</Text>
                    <TextInput 
                        style={styles.input} 
                        value={nickname} 
                        onChangeText={setNickname} 
                        placeholder="怎么称呼"
                        placeholderTextColor="#ccc"
                    />
                </View>
                <View style={styles.divider} />
                <View style={styles.formItem}>
                     <Text style={styles.label}>性别</Text>
                     <Text style={styles.valueText}>{profile ? '保密' : '未设置'}</Text>
                     <Ionicons name="chevron-forward" size={20} color="#ccc" />
                </View>
                 <View style={styles.divider} />
                <View style={styles.formItem}>
                     <Text style={styles.label}>城市</Text>
                     <Text style={styles.valueText}>{profile?.city || '未设置'}</Text>
                     <Ionicons name="chevron-forward" size={20} color="#ccc" />
                </View>
            </View>

            {/* Account Info */}
            <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>账户信息</Text></View>
             <View style={styles.formGroup}>
                <View style={styles.formItem}>
                    <View style={[styles.iconBox, { backgroundColor: '#34C759' }]}>
                        <Ionicons name="share-outline" size={18} color="#fff" />
                    </View>
                    <Text style={styles.labelIcon}>我的邀请码</Text>
                    <Text style={styles.valueMono}>8888</Text>
                    <Ionicons name="chevron-forward" size={20} color="#ccc" />
                </View>
                 <View style={styles.divider} />
                 <View style={styles.formItem}>
                    <View style={[styles.iconBox, { backgroundColor: '#FF9500' }]}>
                        <Ionicons name="ribbon-outline" size={18} color="#fff" />
                    </View>
                    <Text style={styles.labelIcon}>积分点数</Text>
                    <Text style={styles.valueText}>0</Text>
                </View>
            </View>

            <Text style={styles.footerText}>
                超级司机圈 v1.2.0{'\n'}你的全天候兄弟连
            </Text>

        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f2f7' },
  header: { height: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e5e5' },
  headerBtn: { padding: 10 },
  headerTitle: { fontSize: 17, fontWeight: '600' },
  headerBtnTextCancel: { fontSize: 17, color: '#007aff' },
  headerBtnTextSave: { fontSize: 17, fontWeight: '600', color: '#007aff' },
  
  content: { flex: 1 },
  
  avatarSection: { alignItems: 'center', paddingVertical: 30 },
  avatarWrapper: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center', marginBottom: 10, position: 'relative' },
  avatarLarge: { width: 80, height: 80, borderRadius: 40 },
  editIconBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#007aff', width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#f2f2f7' },
  changeAvatarText: { color: '#007aff', fontSize: 15 },

  sectionHeader: { paddingHorizontal: 15, paddingBottom: 8, paddingTop: 20 },
  sectionTitle: { fontSize: 13, color: '#666', textTransform: 'uppercase' },
  
  formGroup: { backgroundColor: '#fff', borderRadius: 10, marginHorizontal: 15, overflow: 'hidden' },
  formItem: { flexDirection: 'row', alignItems: 'center', padding: 15, height: 44 },
  label: { fontSize: 17, width: 80, color: '#000' },
  labelIcon: { fontSize: 17, flex: 1, color: '#000', marginLeft: 10 },
  input: { flex: 1, fontSize: 17, color: '#007aff', textAlign: 'right' },
  valueText: { flex: 1, fontSize: 17, color: '#8e8e93', textAlign: 'right', marginRight: 5 },
  valueMono: { fontSize: 17, color: '#8e8e93', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', marginRight: 5 },
  divider: { height: 1, backgroundColor: '#e5e5e5', marginLeft: 15 },
  
  iconBox: { width: 28, height: 28, borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
  
  footerText: { textAlign: 'center', color: '#8e8e93', fontSize: 13, marginTop: 40, lineHeight: 20 },
});
