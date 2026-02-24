/**
 * AI 正在输入动画组件
 */
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Agent } from '../../types';
import { AgentAvatar } from '../AgentAvatar';
import { TEXT, BACKGROUND, PRIMARY } from '../../styles/colors';

export interface TypingIndicatorProps {
    agent?: Agent;
    actionText?: string;
}

// 单个动画点
const AnimatedDot: React.FC<{ delay: number }> = ({ delay }) => {
    const opacity = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        const animation = Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 400,
                    delay,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0.3,
                    duration: 400,
                    useNativeDriver: true,
                }),
            ])
        );
        animation.start();
        return () => animation.stop();
    }, []);

    return (
        <Animated.View style={[styles.dot, { opacity }]} />
    );
};

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
    agent,
    actionText = '正在思考',
}) => {
    return (
        <View style={styles.container}>
            {agent && (
                <View style={styles.avatarWrapper}>
                    <AgentAvatar avatar={agent.avatar} size={36} isPaid={agent.isPaid} />
                </View>
            )}
            <View style={styles.bubble}>
                <Text style={styles.statusText}>{actionText}</Text>
                <View style={styles.dotsContainer}>
                    <AnimatedDot delay={0} />
                    <AnimatedDot delay={150} />
                    <AnimatedDot delay={300} />
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: 16,
        marginBottom: 8,
    },
    avatarWrapper: {
        marginRight: 8,
    },
    bubble: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: BACKGROUND.card,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 18,
        borderBottomLeftRadius: 4,
    },
    statusText: {
        fontSize: 13,
        color: TEXT.secondary,
        marginRight: 6,
    },
    dotsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: PRIMARY,
    },
});

export default TypingIndicator;
