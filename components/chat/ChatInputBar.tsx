/**
 * 输入工具栏组件
 * 包含文本输入、发送按钮等
 */
import React, { useState, useRef } from 'react';
import {
    View,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Platform,
    KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TEXT, BACKGROUND, BORDER, PRIMARY } from '../../styles/colors';

export interface ChatInputBarProps {
    onSend: (text: string) => void;
    disabled?: boolean;
    placeholder?: string;
}

export const ChatInputBar: React.FC<ChatInputBarProps> = ({
    onSend,
    disabled = false,
    placeholder = '发送消息...',
}) => {
    const [text, setText] = useState('');
    const inputRef = useRef<TextInput>(null);
    const insets = useSafeAreaInsets();

    const handleSend = () => {
        const trimmed = text.trim();
        if (trimmed && !disabled) {
            onSend(trimmed);
            setText('');
        }
    };

    const canSend = text.trim().length > 0 && !disabled;

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
            <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 10) }]}>
                <View style={styles.inputWrapper}>
                    <TextInput
                        ref={inputRef}
                        style={styles.input}
                        value={text}
                        onChangeText={setText}
                        placeholder={placeholder}
                        placeholderTextColor={TEXT.tertiary}
                        multiline
                        maxLength={2000}
                        editable={!disabled}
                    />
                </View>

                <TouchableOpacity
                    style={[styles.sendBtn, canSend && styles.sendBtnActive]}
                    onPress={handleSend}
                    disabled={!canSend}
                >
                    <Ionicons
                        name="arrow-up-circle"
                        size={36}
                        color={canSend ? PRIMARY : '#E5E5EA'}
                    />
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: 12,
        paddingTop: 10,
        backgroundColor: BACKGROUND.card,
        borderTopWidth: 1,
        borderTopColor: BORDER.light,
    },
    inputWrapper: {
        flex: 1,
        backgroundColor: '#F0F0F5',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        marginRight: 8,
        maxHeight: 120,
    },
    input: {
        fontSize: 15,
        color: TEXT.primary,
        maxHeight: 100,
        padding: 0,
    },
    sendBtn: {
        marginBottom: 2,
    },
    sendBtnActive: {
        transform: [{ scale: 1.05 }],
    },
});

export default ChatInputBar;
