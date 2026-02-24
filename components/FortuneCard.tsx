import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export function FortuneCard() {
  const [flipped, setFlipped] = useState(false);
  const [flipAnim] = useState(new Animated.Value(0));

  const flip = () => {
     Animated.timing(flipAnim, {
         toValue: flipped ? 0 : 180,
         duration: 600,
         useNativeDriver: true,
         easing: Easing.linear
     }).start(() => setFlipped(!flipped));
  };

  const frontInterpolate = flipAnim.interpolate({
      inputRange: [0, 180],
      outputRange: ['0deg', '180deg']
  });
  
  const backInterpolate = flipAnim.interpolate({
      inputRange: [0, 180],
      outputRange: ['180deg', '360deg']
  });

  const frontOpacity = flipAnim.interpolate({
        inputRange: [89, 90],
        outputRange: [1, 0]
  });

  const backOpacity = flipAnim.interpolate({
        inputRange: [89, 90],
        outputRange: [0, 1]
  });

  return (
    <TouchableOpacity onPress={flip} activeOpacity={1}>
        <View style={styles.container}>
            
            {/* Front */}
            <Animated.View style={[styles.card, { transform: [{ rotateY: frontInterpolate }], opacity: frontOpacity }]}>
                <LinearGradient colors={['#FFD700', '#FFA500']} style={styles.gradient}>
                    <Text style={styles.title}>今日运势</Text>
                    <Text style={styles.subtitle}>点击翻牌</Text>
                    <Text style={styles.icon}>🥠</Text>
                </LinearGradient>
            </Animated.View>

            {/* Back */}
            <Animated.View style={[styles.card, styles.cardBack, { transform: [{ rotateY: backInterpolate }], opacity: backOpacity }]}>
                <LinearGradient colors={['#fff', '#f0f0f0']} style={styles.gradient}>
                    <Text style={styles.fortuneTitle}>大吉</Text>
                    <Text style={styles.fortuneText}>宜：接长单</Text>
                    <Text style={styles.fortuneText}>忌：空跑</Text>
                    <Text style={styles.fortuneDesc}>"今日财运在东南，适合往机场方向接单。"</Text>
                </LinearGradient>
            </Animated.View>

        </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { width: 140, height: 180, margin: 10 },
  card: { width: '100%', height: '100%', borderRadius: 12, backfaceVisibility: 'hidden', position: 'absolute', top: 0, left: 0, shadowColor: "#000", shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5 },
  cardBack: { // Back specific styles
  },
  gradient: { flex: 1, borderRadius: 12, justifyContent: 'center', alignItems: 'center', padding: 10 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  subtitle: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  icon: { fontSize: 40, marginTop: 10 },
  
  fortuneTitle: { fontSize: 24, fontWeight: 'bold', color: '#d32f2f', marginBottom: 10 },
  fortuneText: { fontSize: 14, color: '#333', marginBottom: 4 },
  fortuneDesc: { fontSize: 12, color: '#666', textAlign: 'center', marginTop: 10, fontStyle: 'italic' }
});
