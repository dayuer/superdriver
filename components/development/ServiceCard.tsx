/**
 * 服务/企业卡片组件
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { EnterpriseData } from '../../services/development';
import { Logo } from '../ui/Logo';
import { Tag } from '../ui/Tag';
import { TEXT, BACKGROUND, BORDER, PRIMARY, SUCCESS, DANGER, WARNING } from '../../styles/colors';

export interface ServiceCardProps {
    enterprise: EnterpriseData;
    onPress?: (enterprise: EnterpriseData) => void;
    onToggleBind?: (id: string) => void;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
    enterprise,
    onPress,
    onToggleBind,
}) => {
    const { id, name, logoText, logoColor, category, city, isBound, tags, incentives } = enterprise;
    // 添加容错：确保数字字段有默认值
    const memberCount = enterprise.memberCount ?? 0;
    const rating = enterprise.rating ?? 5.0;

    return (
        <TouchableOpacity
            style={styles.container}
            activeOpacity={0.9}
            onPress={() => onPress?.(enterprise)}
        >
            <View style={styles.header}>
                <Logo text={logoText || name?.charAt(0) || '?'} backgroundColor={logoColor || '#666'} size="md" />

                <View style={styles.info}>
                    <View style={styles.nameRow}>
                        <Text style={styles.name} numberOfLines={1}>{name || '未知'}</Text>
                        {isBound && (
                            <View style={styles.boundBadge}>
                                <Ionicons name="checkmark-circle" size={10} color="#fff" />
                                <Text style={styles.boundText}>已入驻</Text>
                            </View>
                        )}
                    </View>
                    <View style={styles.meta}>
                        <Text style={styles.category}>{category || '服务'}</Text>
                        <Text style={styles.dot}>·</Text>
                        <Text style={styles.members}>{memberCount}+ 司机</Text>
                        <Text style={styles.dot}>·</Text>
                        <Ionicons name="star" size={10} color={WARNING} />
                        <Text style={styles.rating}>{rating.toFixed?.(1) ?? rating}</Text>
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.actionBtn, isBound && styles.actionBtnBound]}
                    onPress={(e) => {
                        e.stopPropagation?.();
                        onToggleBind?.(id);
                    }}
                >
                    <Text style={[styles.actionText, isBound && styles.actionTextBound]}>
                        {isBound ? '已拥有' : '获取'}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* 标签 */}
            {tags && tags.length > 0 && (
                <View style={styles.tags}>
                    {tags.slice(0, 3).map((tag, i) => (
                        <Tag key={i} text={tag} variant="default" />
                    ))}
                </View>
            )}

            {/* 促销信息 */}
            {incentives && incentives.length > 0 && (
                <View style={styles.incentive}>
                    <Ionicons name="gift-outline" size={14} color={DANGER} />
                    <Text style={styles.incentiveText} numberOfLines={1}>
                        {incentives.join(' · ')}
                    </Text>
                </View>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: BACKGROUND.card,
        borderRadius: 12,
        marginHorizontal: 16,
        marginBottom: 12,
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    info: {
        flex: 1,
        marginLeft: 12,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    name: {
        fontSize: 15,
        fontWeight: '600',
        color: TEXT.primary,
        flexShrink: 1,
    },
    boundBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
        backgroundColor: SUCCESS,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    boundText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#fff',
    },
    meta: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
    },
    category: {
        fontSize: 12,
        color: TEXT.secondary,
    },
    dot: {
        fontSize: 12,
        color: TEXT.tertiary,
        marginHorizontal: 4,
    },
    members: {
        fontSize: 12,
        color: TEXT.secondary,
    },
    rating: {
        fontSize: 12,
        color: TEXT.secondary,
        marginLeft: 2,
    },
    actionBtn: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        backgroundColor: `${PRIMARY}15`,
        borderRadius: 16,
    },
    actionBtnBound: {
        backgroundColor: '#F0F0F5',
    },
    actionText: {
        fontSize: 13,
        fontWeight: '600',
        color: PRIMARY,
    },
    actionTextBound: {
        color: TEXT.secondary,
    },
    tags: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 12,
    },
    incentive: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: BORDER.light,
    },
    incentiveText: {
        flex: 1,
        fontSize: 12,
        color: DANGER,
    },
});

export default ServiceCard;
