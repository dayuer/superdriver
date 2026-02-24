/**
 * CargoCard - 货源卡片组件
 * 展示货源信息和操作按钮
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CargoMatch } from '../../services/recruitment-api';
import { TEXT, BACKGROUND, BORDER, PRIMARY, SUCCESS, WARNING, DANGER } from '../../styles/colors';

interface CargoCardProps {
    match: CargoMatch;
    onAccept: (match: CargoMatch) => void;
    onReject: (match: CargoMatch) => void;
}

const getScoreColor = (score: number): string => {
    if (score >= 80) return SUCCESS;
    if (score >= 60) return WARNING;
    return DANGER;
};

const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours();
    const minute = date.getMinutes();
    return `${month}月${day}日 ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
};

export const CargoCard: React.FC<CargoCardProps> = ({ match, onAccept, onReject }) => {
    const { cargo, matchScore } = match;
    const scoreColor = getScoreColor(matchScore);

    return (
        <View style={styles.card}>
            {/* 顶部：路线和匹配度 */}
            <View style={styles.header}>
                <View style={styles.route}>
                    <Text style={styles.city}>🚛 {cargo.originCity}</Text>
                    <Text style={styles.arrow}>→</Text>
                    <Text style={styles.city}>{cargo.destCity}</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: scoreColor }]}>
                    <Text style={styles.badgeText}>匹配度 {Math.round(matchScore)}%</Text>
                </View>
            </View>

            {/* 货物信息 */}
            <View style={styles.cargoInfo}>
                <Text style={styles.title}>{cargo.title}</Text>
                <View style={styles.details}>
                    <Text style={styles.detail}>📦 {cargo.cargoType}</Text>
                    <Text style={styles.detail}>⚖️ {cargo.weight}吨</Text>
                    {cargo.volume && <Text style={styles.detail}>📐 {cargo.volume}m³</Text>}
                </View>
            </View>

            {/* 时间信息 */}
            <View style={styles.timeSection}>
                <Text style={styles.timeLabel}>🕐 装货时间</Text>
                <Text style={styles.timeValue}>{formatDate(cargo.loadingTime)}</Text>
            </View>

            {/* 地址信息 */}
            <View style={styles.addresses}>
                <View style={styles.addressRow}>
                    <Text style={styles.addressLabel}>📍 起</Text>
                    <Text style={styles.addressText} numberOfLines={1}>{cargo.originAddress}</Text>
                </View>
                <View style={styles.addressRow}>
                    <Text style={styles.addressLabel}>📍 终</Text>
                    <Text style={styles.addressText} numberOfLines={1}>{cargo.destAddress}</Text>
                </View>
            </View>

            {/* 价格 */}
            <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>运费</Text>
                <Text style={styles.priceValue}>¥{cargo.price}</Text>
                <Text style={styles.priceUnit}>
                    {cargo.priceUnit === 'total' ? '单次' : cargo.priceUnit === 'per_km' ? '/公里' : '/吨'}
                </Text>
            </View>

            {/* 操作按钮 */}
            <View style={styles.actions}>
                <TouchableOpacity style={styles.rejectBtn} onPress={() => onReject(match)}>
                    <Text style={styles.rejectText}>❌ 忽略</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.acceptBtn} onPress={() => onAccept(match)}>
                    <Text style={styles.acceptText}>✅ 抢单</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: BACKGROUND.card,
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    route: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    city: {
        fontSize: 18,
        fontWeight: 'bold',
        color: TEXT.primary,
    },
    arrow: {
        fontSize: 18,
        color: TEXT.secondary,
        marginHorizontal: 8,
    },
    badge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    cargoInfo: {
        marginBottom: 16,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: TEXT.primary,
        marginBottom: 8,
    },
    details: {
        flexDirection: 'row',
        gap: 12,
    },
    detail: {
        fontSize: 14,
        color: TEXT.secondary,
    },
    timeSection: {
        marginBottom: 12,
        paddingVertical: 8,
        borderTopWidth: 1,
        borderTopColor: BORDER.light,
    },
    timeLabel: {
        fontSize: 13,
        color: TEXT.secondary,
        marginBottom: 4,
    },
    timeValue: {
        fontSize: 15,
        fontWeight: '600',
        color: TEXT.primary,
    },
    addresses: {
        marginBottom: 16,
    },
    addressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    addressLabel: {
        fontSize: 14,
        color: TEXT.secondary,
        width: 40,
    },
    addressText: {
        flex: 1,
        fontSize: 14,
        color: TEXT.primary,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 20,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: BORDER.light,
    },
    priceLabel: {
        fontSize: 14,
        color: TEXT.secondary,
        marginRight: 8,
    },
    priceValue: {
        fontSize: 28,
        fontWeight: 'bold',
        color: DANGER,
    },
    priceUnit: {
        fontSize: 14,
        color: TEXT.tertiary,
        marginLeft: 4,
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
    },
    rejectBtn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: BACKGROUND.primary,
        alignItems: 'center',
    },
    rejectText: {
        fontSize: 16,
        fontWeight: '600',
        color: TEXT.secondary,
    },
    acceptBtn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: PRIMARY,
        alignItems: 'center',
    },
    acceptText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
});

export default CargoCard;
