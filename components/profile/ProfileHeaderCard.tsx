/**
 * 用户头像卡片组件
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UserProfile } from '../../types';
import { TEXT, BACKGROUND, GRADIENTS, WARNING } from '../../styles/colors';
import { BASE_URL } from '../../services/api';

export interface ProfileHeaderCardProps {
    profile?: UserProfile;
    onPress?: () => void;
    onSettingsPress?: () => void;
}

export const ProfileHeaderCard: React.FC<ProfileHeaderCardProps> = ({
    profile,
    onPress,
    onSettingsPress,
}) => {
    const avatarUrl = profile?.avatarId
        ? `${BASE_URL}/api/avatar/${profile.avatarId}`
        : null;

    return (
        <LinearGradient
            colors={GRADIENTS.darkHeader}
            style={styles.container}
        >
            <SafeAreaView edges={['top']} style={styles.safeArea}>
                <View style={styles.content}>
                    {/* 头像 */}
                    <TouchableOpacity style={styles.avatarWrapper} onPress={onPress}>
                        {avatarUrl ? (
                            <Image source={{ uri: avatarUrl }} style={styles.avatar} />
                        ) : (
                            <View style={styles.avatarPlaceholder}>
                                <Ionicons name="person" size={36} color="#fff" />
                            </View>
                        )}
                        {profile?.isVip && (
                            <View style={styles.vipBadge}>
                                <Ionicons name="star" size={12} color="#fff" />
                            </View>
                        )}
                    </TouchableOpacity>

                    {/* 用户信息 */}
                    <View style={styles.info}>
                        <Text style={styles.name}>{profile?.nickname || '用户'}</Text>
                        <View style={styles.row}>
                            <Ionicons name="location-outline" size={14} color="rgba(255,255,255,0.7)" />
                            <Text style={styles.city}>{profile?.city || '未设置'}</Text>
                        </View>
                    </View>

                    {/* 设置按钮 */}
                    <TouchableOpacity style={styles.settingsBtn} onPress={onSettingsPress}>
                        <Ionicons name="settings-outline" size={22} color="#fff" />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        // padding 移到 content 中
    },
    safeArea: {
        // SafeAreaView 容器
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 40, // 增加间距，为下方卡片留出空间
    },
    avatarWrapper: {
        position: 'relative',
    },
    avatar: {
        width: 72,
        height: 72,
        borderRadius: 36,
        borderWidth: 3,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    avatarPlaceholder: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    vipBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: WARNING,
        width: 22,
        height: 22,
        borderRadius: 11,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#1c1c1e',
    },
    info: {
        flex: 1,
        marginLeft: 16,
    },
    name: {
        fontSize: 22,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 4,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    city: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.7)',
    },
    settingsBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default ProfileHeaderCard;
