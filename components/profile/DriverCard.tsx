/**
 * 司机身份卡片组件
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { DriverProfile } from '../../services/recruitment-api';
import { TEXT, BACKGROUND, BORDER, PRIMARY, SUCCESS, WARNING } from '../../styles/colors';

export interface DriverCardProps {
    driver?: DriverProfile | null;
    onPress?: () => void;
    onBindPress?: () => void;
}

export const DriverCard: React.FC<DriverCardProps> = ({
    driver,
    onPress,
    onBindPress,
}) => {
    if (!driver) {
        return (
            <TouchableOpacity style={styles.emptyContainer} onPress={onBindPress}>
                <View style={styles.emptyContent}>
                    <View style={styles.emptyIconWrapper}>
                        <Ionicons name="id-card-outline" size={28} color={PRIMARY} />
                    </View>
                    <View style={styles.emptyTexts}>
                        <Text style={styles.emptyTitle}>绑定司机身份</Text>
                        <Text style={styles.emptyDesc}>解锁更多专属权益</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={TEXT.tertiary} />
                </View>
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity style={styles.container} onPress={onPress}>
            <LinearGradient
                colors={['#1a1a2e', '#16213e']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
            >
                <View style={styles.header}>
                    <View style={styles.typeTag}>
                        <Ionicons name="car-sport" size={14} color="#fff" />
                        <Text style={styles.typeText}>{driver.vehicleType || '网约车'}</Text>
                    </View>
                    <View style={[styles.statusTag, driver.isVerified && styles.verifiedTag]}>
                        <Ionicons
                            name={driver.isVerified ? 'shield-checkmark' : 'time-outline'}
                            size={12}
                            color="#fff"
                        />
                        <Text style={styles.statusText}>
                            {driver.isVerified ? '已认证' : '待认证'}
                        </Text>
                    </View>
                </View>

                <View style={styles.body}>
                    <Text style={styles.name}>{driver.realName || '司机'}</Text>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>驾龄</Text>
                        <Text style={styles.infoValue}>{driver.isVerified ? '3+' : '1'}年</Text>
                        <View style={styles.infoDivider} />
                        <Text style={styles.infoLabel}>评分</Text>
                        <Ionicons name="star" size={12} color={WARNING} />
                        <Text style={styles.infoValue}>{driver.rating || '5.0'}</Text>
                    </View>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.plateNumber}>{driver.vehiclePlate || '待绑定车辆'}</Text>
                    <Ionicons name="qr-code-outline" size={18} color="rgba(255,255,255,0.6)" />
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 16,
        overflow: 'hidden',
    },
    gradient: {
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    typeTag: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: 'rgba(255,255,255,0.15)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    typeText: {
        fontSize: 12,
        color: '#fff',
        fontWeight: '500',
    },
    statusTag: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: WARNING,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
    },
    verifiedTag: {
        backgroundColor: SUCCESS,
    },
    statusText: {
        fontSize: 11,
        color: '#fff',
        fontWeight: '600',
    },
    body: {
        marginBottom: 12,
    },
    name: {
        fontSize: 20,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 6,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    infoLabel: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.6)',
        marginRight: 4,
    },
    infoValue: {
        fontSize: 13,
        color: '#fff',
        fontWeight: '500',
    },
    infoDivider: {
        width: 1,
        height: 12,
        backgroundColor: 'rgba(255,255,255,0.3)',
        marginHorizontal: 12,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
    },
    plateNumber: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        fontWeight: '500',
    },
    // Empty State
    emptyContainer: {
        marginHorizontal: 16,
        marginTop: 16,
        backgroundColor: BACKGROUND.card,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: BORDER.light,
        borderStyle: 'dashed',
    },
    emptyContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 12,
    },
    emptyIconWrapper: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: `${PRIMARY}15`,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyTexts: {
        flex: 1,
    },
    emptyTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: TEXT.primary,
        marginBottom: 2,
    },
    emptyDesc: {
        fontSize: 12,
        color: TEXT.secondary,
    },
});

export default DriverCard;
