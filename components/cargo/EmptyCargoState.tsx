/**
 * EmptyCargoState - 空状态组件
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { TEXT, BACKGROUND, PRIMARY } from '../../styles/colors';

interface EmptyCargoStateProps {
    onRefresh: () => void;
}

export const EmptyCargoState: React.FC<EmptyCargoStateProps> = ({ onRefresh }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.icon}>📦</Text>
            <Text style={styles.title}>暂无推荐货源</Text>
            <Text style={styles.subtitle}>请稍后再来查看，或检查您的司机档案设置</Text>
            <TouchableOpacity style={styles.button} onPress={onRefresh}>
                <Text style={styles.buttonText}>刷新</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: BACKGROUND.primary,
        padding: 32,
    },
    icon: {
        fontSize: 64,
        marginBottom: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: TEXT.primary,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: TEXT.secondary,
        textAlign: 'center',
        marginBottom: 24,
    },
    button: {
        paddingHorizontal: 32,
        paddingVertical: 12,
        backgroundColor: PRIMARY,
        borderRadius: 12,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
});

export default EmptyCargoState;
