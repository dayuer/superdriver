import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Agent } from '../types';

interface RoutingFeedbackProps {
  agent?: Agent;
  statusText: string;
  isEmergency?: boolean;
}

export function RoutingFeedback({ agent, statusText, isEmergency }: RoutingFeedbackProps) {
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      <View style={[styles.avatar, isEmergency && styles.emergencyBorder]}>
        <Text style={{fontSize: 16}}>{agent?.avatar || '📡'}</Text>
      </View>
      <Animated.Text style={[styles.text, { opacity: fadeAnim }, isEmergency && styles.emergencyText]}>
        {statusText}
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 10 },
  avatar: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#f0f2f5', justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  text: { fontSize: 12, color: '#666', fontStyle: 'italic' },
  emergencyBorder: { borderWidth: 1, borderColor: 'red' },
  emergencyText: { color: 'red', fontWeight: 'bold' },
});
