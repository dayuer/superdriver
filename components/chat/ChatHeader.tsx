/**
 * 聊天头部导航组件
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Agent } from '../../types';
import { AgentAvatar } from '../AgentAvatar';
import { TEXT, BACKGROUND, BORDER, PRIMARY } from '../../styles/colors';

export interface ChatHeaderProps {
    title: string;
    subtitle?: string;
    chatType: 'group' | 'private';
    agent?: Agent;
    memberCount?: number;
    onBack: () => void;
    onTitlePress?: () => void;
    onMorePress?: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
    title,
    subtitle,
    chatType,
    agent,
    memberCount,
    onBack,
    onTitlePress,
    onMorePress,
}) => {
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.content}>
                {/* 返回按钮 */}
                <TouchableOpacity style={styles.backBtn} onPress={onBack}>
                    <Ionicons name="chevron-back" size={28} color={TEXT.primary} />
                </TouchableOpacity>

                {/* 标题区域 */}
                <TouchableOpacity
                    style={styles.titleArea}
                    onPress={onTitlePress}
                    disabled={!onTitlePress}
                >
                    {chatType === 'private' && agent && (
                        <AgentAvatar avatar={agent.avatar} size={32} isPaid={agent.isPaid} />
                    )}
                    <View style={styles.titleTexts}>
                        <Text style={styles.title} numberOfLines={1}>{title}</Text>
                        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
                        {chatType === 'group' && memberCount && (
                            <Text style={styles.subtitle}>{memberCount} 位成员</Text>
                        )}
                    </View>
                </TouchableOpacity>

                {/* 更多按钮 */}
                <TouchableOpacity style={styles.moreBtn} onPress={onMorePress}>
                    <Ionicons name="ellipsis-horizontal" size={24} color={TEXT.primary} />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: BACKGROUND.card,
        borderBottomWidth: 1,
        borderBottomColor: BORDER.light,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
            },
        }),
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 44,
        paddingHorizontal: 4,
    },
    backBtn: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    titleArea: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 4,
    },
    avatar: {
        marginRight: 8,
    },
    titleTexts: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: TEXT.primary,
    },
    subtitle: {
        fontSize: 12,
        color: TEXT.secondary,
        marginTop: 1,
    },
    moreBtn: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default ChatHeader;
