import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, Platform, Animated, NativeSyntheticEvent, NativeScrollEvent, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { EnterpriseMetric } from '../types';
import { EnterpriseCard } from './workbench/EnterpriseCard';
import { useCommandDeckAnimation } from '../hooks/useCommandDeckAnimation';
import { calculateEnterpriseStats } from '../utils/commandDeck-helpers';

interface Props {
    enterprises: EnterpriseMetric[];
    onToggleStatus: (id: string) => void;
    scrollY: Animated.Value;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 32;

export default function CommandDeck({ enterprises, onToggleStatus, scrollY }: Props) {
    // Stats via memoized calculation
    const stats = useMemo(() => calculateEnterpriseStats(enterprises), [enterprises]);
    const { totalRevenue, totalOrders, totalHours } = stats;

    const [activeIndex, setActiveIndex] = useState(0);

    // Animation via extracted hook
    const { containerHeight, expandedOpacity, compactOpacity, config } = useCommandDeckAnimation(scrollY);

    // Carousel scroll handler
    const handleCarouselScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
        const slide = Math.round(e.nativeEvent.contentOffset.x / (CARD_WIDTH + 12));
        setActiveIndex(slide);
    }, []);

    return (
        <Animated.View style={[styles.container, { height: containerHeight }]}>
            <StatusBar style="light" />
            <Animated.View style={styles.deckCard}>
                <LinearGradient
                    colors={['#2A2A2E', '#1C1C1E']}
                    style={styles.gradientBackground}
                >

                    {/* EXPANDED CONTENT LAYER */}
                    <Animated.View style={[styles.layer, { opacity: expandedOpacity }]}>
                        <View style={styles.deckHeader}>
                            <View style={styles.headerLeft}>
                                <Text style={styles.label}>今日总收</Text>
                                <View style={styles.revenueRow}>
                                    <Text style={styles.currency}>¥</Text>
                                    <Text style={styles.revenueValue}>{totalRevenue.toFixed(2)}</Text>
                                </View>
                            </View>

                            <View style={styles.globalStats}>
                                <View style={styles.statItem}>
                                    <Ionicons name="document-text-outline" size={12} color="rgba(255,255,255,0.7)" />
                                    <Text style={styles.statText}>{totalOrders}</Text>
                                </View>
                                <View style={styles.divider} />
                                <View style={styles.statItem}>
                                    <Ionicons name="time-outline" size={12} color="rgba(255,255,255,0.7)" />
                                    <Text style={styles.statText}>{totalHours.toFixed(1)}h</Text>
                                </View>
                            </View>
                        </View>

                        {/* Enterprise Carousel */}
                        <ScrollView
                            horizontal
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                            snapToInterval={CARD_WIDTH + 12}
                            decelerationRate="fast"
                            contentContainerStyle={styles.carouselContent}
                            onScroll={handleCarouselScroll}
                            scrollEventThrottle={16}
                        >
                            {enterprises.map((ent, index) => (
                                <View key={ent.id} style={{ width: CARD_WIDTH, marginRight: index === enterprises.length - 1 ? 0 : 12 }}>
                                    <EnterpriseCard
                                        enterprise={ent}
                                        onToggleStatus={onToggleStatus}
                                    />
                                </View>
                            ))}
                        </ScrollView>

                        <View style={styles.pagination}>
                            {enterprises.map((_, i) => (
                                <View key={i} style={[styles.dot, { backgroundColor: i === activeIndex ? '#FFFFFF' : 'rgba(255,255,255,0.25)', width: i === activeIndex ? 16 : 6 }]} />
                            ))}
                        </View>
                    </Animated.View>

                    {/* COMPACT CONTENT LAYER */}
                    <Animated.View style={[styles.layer, { opacity: compactOpacity }, styles.compactLayer]}>
                        <View style={styles.compactTitleContainer}>
                            <Text style={styles.compactTitleLabel}>今日营收</Text>
                            <Text style={styles.compactTitleValue}>¥{totalRevenue.toFixed(2)}</Text>
                        </View>
                    </Animated.View>

                </LinearGradient>
            </Animated.View>
        </Animated.View>
    );
}

// Note: Status helpers (getStatusColor, getStatusBg, getStatusText) are now delegated to EnterpriseCard

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 0,
        paddingTop: Platform.OS === 'ios' ? 50 : 30,
        marginBottom: 0,
        zIndex: 100,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: '#1C1C1E', // 深色背景覆盖刘海区域
    },
    deckCard: {
        backgroundColor: '#1C1C1E',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 8,
        overflow: 'hidden',
        height: '100%',
    },
    gradientBackground: {
        flex: 1,
    },
    // Animation Layers
    layer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
    },
    compactLayer: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 20
    },
    compactTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    compactTitleLabel: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.6)',
        fontWeight: '600',
        marginRight: 8,
        letterSpacing: 0.2
    },
    compactTitleValue: {
        fontSize: 22,
        fontWeight: '700',
        color: '#FFFFFF',
        fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'sans-serif',
        letterSpacing: -0.5
    },
    // Expanded Styles
    deckHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 18,
        paddingBottom: 14,
    },
    headerLeft: {
        flexDirection: 'column',
        gap: 2
    },
    label: {
        fontSize: 11,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.5)',
        letterSpacing: 0.5,
        textTransform: 'uppercase'
    },
    revenueRow: {
        flexDirection: 'row',
        alignItems: 'baseline'
    },
    currency: {
        fontSize: 16,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.85)',
        marginRight: 3
    },
    revenueValue: {
        fontSize: 32,
        fontWeight: '700',
        color: '#FFFFFF',
        letterSpacing: -1.2,
        fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'sans-serif'
    },
    globalStats: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.08)',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.12)'
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4
    },
    statText: {
        fontSize: 12,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.9)'
    },
    divider: {
        width: 1,
        height: 14,
        backgroundColor: 'rgba(255,255,255,0.25)',
        marginHorizontal: 10
    },
    carouselContent: {
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 4,
    },
    // Note: EnterpriseCard styles (subCard, brandRow, statusPill, etc.) 
    // have been moved to the EnterpriseCard component
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 12,
        gap: 6
    },
    dot: {
        height: 4,
        borderRadius: 2,
        opacity: 0.8
    },
});
