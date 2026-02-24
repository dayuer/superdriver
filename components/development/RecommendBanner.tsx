/**
 * 推荐横幅组件
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { GRADIENTS } from '../../styles/colors';

export interface RecommendBannerProps {
    title?: string;
    subtitle?: string;
    buttonText?: string;
    onPress?: () => void;
}

export const RecommendBanner: React.FC<RecommendBannerProps> = ({
    title = '🔥 司机招募季',
    subtitle = '入驻即送3000元新人礼包',
    buttonText = '立即领取',
    onPress,
}) => {
    return (
        <TouchableOpacity style={styles.container} onPress={onPress}>
            <LinearGradient
                colors={GRADIENTS.purple}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
            >
                <View style={styles.content}>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.subtitle}>{subtitle}</Text>
                    <View style={styles.button}>
                        <Text style={styles.buttonText}>{buttonText}</Text>
                    </View>
                </View>
                <View style={styles.decor}>
                    <Ionicons name="gift" size={80} color="rgba(255,255,255,0.2)" />
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 16,
        marginVertical: 12,
        borderRadius: 16,
        overflow: 'hidden',
    },
    gradient: {
        flexDirection: 'row',
        padding: 20,
        position: 'relative',
    },
    content: {
        flex: 1,
        zIndex: 1,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 6,
    },
    subtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.85)',
        marginBottom: 14,
    },
    button: {
        alignSelf: 'flex-start',
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    buttonText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#667eea',
    },
    decor: {
        position: 'absolute',
        right: 10,
        bottom: -10,
        opacity: 0.6,
    },
});

export default RecommendBanner;
