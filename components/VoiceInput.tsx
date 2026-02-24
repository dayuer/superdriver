import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

const styles = StyleSheet.create({
    container: { alignItems: 'center', justifyContent: 'center', paddingBottom: 20 },
    btn: { 
        width: 72, 
        height: 72, 
        borderRadius: 36, 
        backgroundColor: '#1C1C1E', 
        justifyContent: 'center', 
        alignItems: 'center', 
        borderWidth: 4,
        borderColor: '#333',
        shadowColor: "#000", 
        shadowOpacity: 0.3, 
        shadowRadius: 10, 
        elevation: 8 
    },
    btnActive: { 
        backgroundColor: '#FFD700', 
        borderColor: '#FFD700',
        transform: [{ scale: 1.1 }] 
    },
    innerCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        borderWidth: 2,
        borderColor: '#444',
        justifyContent: 'center',
        alignItems: 'center',
        borderStyle: 'dashed'
    },
    hint: { marginTop: 8, color: '#8E8E93', fontSize: 11, fontWeight: '600' },
});

export function VoiceInput({ onSend, onCancel }: { onSend: (text: string) => void, onCancel: () => void }) {
  const [isRecording, setIsRecording] = useState(false);
  
  // Simulation since proper voice depends on native modules permission setup
  const startRecording = () => {
      setIsRecording(true);
      setTimeout(() => {
          setIsRecording(false);
          onSend("翔哥，我要收车回家了。");
      }, 2000);
  };

  return (
    <View style={styles.container}>
        <TouchableOpacity 
            style={[styles.btn, isRecording && styles.btnActive]}
            onPressIn={startRecording}
        >
            <View style={[styles.innerCircle, isRecording && { borderColor: '#fff', borderStyle: 'solid' }]}>
                 <Ionicons name="mic" size={28} color={isRecording ? '#000' : '#FFD700'} />
            </View>
        </TouchableOpacity>
        <Text style={styles.hint}>{isRecording ? '正在聆听指令...' : '按住 呼叫翔哥'}</Text>
    </View>
  );
}
