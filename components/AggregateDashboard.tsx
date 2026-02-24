import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getEnterprises } from '../services/api';

interface EnterpriseMetric {
    id: string;
    name: string;
    logoColor: string; // Changed from 'color' to match API
    logoText: string;
    status: 'active' | 'fused' | 'offline';
    isBound: boolean;
}

export const AggregateDashboard = () => {
    const [platforms, setPlatforms] = useState<EnterpriseMetric[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const data = await getEnterprises();
            // Filter only bound enterprises for the dashboard
            const bound = data.filter((e: any) => e.isBound).map((e: any) => ({
                id: e.id,
                name: e.name,
                logoColor: e.logoColor,
                logoText: e.logoText,
                status: 'active', // Default to active for now
                isBound: true
            }));
            setPlatforms(bound);
        } catch (e) {
            console.error("Failed to load dashboard platforms");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* Header Stat */}
            <View style={styles.revenueContainer}>
                <View>
                    <Text style={styles.totalLabel}>今日全网流水 (聚合)</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                        <Text style={styles.currency}>¥</Text>
                        <Text style={styles.revenueValue}>{platforms.length > 0 ? "628.50" : "0.00"}</Text>
                        {platforms.length > 0 && <Text style={styles.revenueChange}>+12%</Text>}
                    </View>
                </View>
                <View style={styles.statRight}>
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>在线时长</Text>
                        <Text style={styles.statNum}>{platforms.length > 0 ? "6.2h" : "0h"}</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>接单量</Text>
                        <Text style={styles.statNum}>{platforms.length > 0 ? "14" : "0"}</Text>
                    </View>
                </View>
            </View>

            {/* Platform Status Grid */}
            <View style={styles.gridContainer}>
                {platforms.map((platform) => (
                    <TouchableOpacity key={platform.id} style={styles.platformItem}>
                        <View style={[styles.platformIcon, { borderColor: platform.logoColor }]}>
                            <View style={[styles.iconBg, { backgroundColor: platform.logoColor }]}>
                                <Text style={[styles.iconText, { color: '#fff' }]}>
                                    {platform.logoText}
                                </Text>
                            </View>
                        </View>
                        <Text style={styles.platformName} numberOfLines={1}>{platform.name}</Text>
                    </TouchableOpacity>
                ))}

                {/* Add Button */}
                <TouchableOpacity style={styles.platformItem}>
                    <View style={styles.addIcon}>
                        <Ionicons name="add" size={20} color="#C7C7CC" />
                    </View>
                    <Text style={styles.platformName}>绑定</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 4,
    },
    revenueContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    totalLabel: {
        fontSize: 12,
        color: '#8E8E93',
        marginBottom: 4,
        fontWeight: '600',
    },
    currency: {
        fontSize: 20,
        color: '#1C1C1E',
        fontWeight: '700',
        marginRight: 2,
    },
    revenueValue: {
        fontSize: 32,
        fontWeight: '800',
        color: '#1C1C1E',
        letterSpacing: -1,
    },
    revenueChange: {
        fontSize: 12,
        fontWeight: '600',
        color: '#FF3B30',
        marginLeft: 6,
        marginBottom: 4,
    },
    statRight: {
        flexDirection: 'row',
        gap: 16
    },
    statItem: {
        alignItems: 'flex-end',
    },
    statLabel: {
        fontSize: 10,
        color: '#C7C7CC',
        marginBottom: 2,
    },
    statNum: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1C1C1E',
    },

    // Grid
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap', // Allow wrapping if many platforms
        gap: 12, // Native gap support
        paddingBottom: 4,
    },
    platformItem: {
        alignItems: 'center',
        width: 50,
        marginBottom: 12
    },
    platformIcon: {
        width: 44,
        height: 44,
        borderRadius: 14,
        borderWidth: 2,
        padding: 2,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 6,
    },
    iconBg: {
        width: '100%',
        height: '100%',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconText: {
        fontSize: 16,
        fontWeight: '700',
    },
    statusBadge: {
        position: 'absolute',
        bottom: -4,
        right: -4,
        backgroundColor: '#FF9500', // Warning Color
        width: 16,
        height: 16,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    addIcon: {
        width: 44,
        height: 44,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#E5E5EA',
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 6,
    },
    platformName: {
        fontSize: 10,
        color: '#8E8E93',
        textAlign: 'center'
    },
});
