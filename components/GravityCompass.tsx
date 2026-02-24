import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Platform } from 'react-native';
import { GestureDetector, Gesture, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming, interpolateColor } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Agent } from '../types';
import { BASE_URL } from '../services/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COMPASS_CENTER = { x: SCREEN_WIDTH / 2, y: 150 }; // y relative to container
const BUTTON_RADIUS = 60;

interface CompassProps {
  agents: Agent[];
  onVoiceSend: (text: string, agentId?: string) => void;
}

export function GravityCompass({ agents, onVoiceSend }: CompassProps) {
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  
  // Agents Filtering (Top 5-6 core agents for the circle)
  const coreAgents = agents.filter(a => a.id !== 'helper' && a.id !== 'general').slice(0, 5);
  // Add 'general' implicitly as center or broadcast? 
  // Requirement: "Center is Broadcast to All (Router deciding)"
  // Requirement: "Drag to specific agent"

  // Position Calculation for Agents
  const RADIUS = 140;
  const agentPositions = coreAgents.map((agent, index) => {
      // Semi-circle distribution (top half) since bottom is usually handle
      // Or full circle? "Dashboard" usually means top arc or full circle.
      // Description: "左上, 右上, 左中..." -> Looks like surrounding.
      
      // Let's distribute them in a circle around the button
      // Start from -180 (Left) to 0 (Right) if bottom aligned?
      // Or full 360?
      // Let's do a 220 degree arc on top (-20 to -200 degrees)
      const totalArc = 220;
      const startAngle = -10 * (Math.PI / 180); // Slight right
      const step = (totalArc / (coreAgents.length - 1)) * (Math.PI / 180); // Step in radians
      
      // But user said "Left Top", "Right Top".
      // Let's Map angles manually for better UX if count is specific.
      const angle = -Math.PI + (Math.PI / (coreAgents.length + 1)) * (index + 1);
      
      return {
          agent,
          x: Math.cos(angle) * RADIUS,
          y: Math.sin(angle) * RADIUS,
          angle: angle
      };
  });

  // Animated Values
  const buttonScale = useSharedValue(1);
  const buttonGlow = useSharedValue(0);
  const dragX = useSharedValue(0);
  const dragY = useSharedValue(0);

  // Sound placeholders (can be implemented with expo-av later)
  const playTick = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };
  
  const playConfirm = () => {
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const gesture = Gesture.Pan()
    .onBegin(() => {
       setIsRecording(true);
       buttonScale.value = withSpring(0.9);
       buttonGlow.value = withTiming(1, { duration: 200 });
       playTick();
    })
    .onUpdate((e) => {
       dragX.value = e.translationX;
       dragY.value = e.translationY;

       // Calculate Angle and Distance
       const dist = Math.sqrt(e.translationX ** 2 + e.translationY ** 2);
       
       if (dist > 50) { // Threshold to leave "Center"
          // Calculate angle
          // Note: atan2(y, x) -> result in radians
          // Correct for screen coordinates (y is down)
          let angle = Math.atan2(e.translationY, e.translationX);
          
          // Find closest agent
          let minDist = Infinity;
          let closestId: string | null = null;
          
          agentPositions.forEach(pos => {
              // Simple Euclidean distance in (x,y) space relative to center
              // Or angular distance? 
              // Visual match is better with X/Y distance from the projected position on circle
              // But strictly directional is easier for "blind" usage.
              
              // Let's check angular difference
              let angleDiff = Math.abs(angle - pos.angle);
              if (angleDiff > Math.PI) angleDiff = 2 * Math.PI - angleDiff;
              
              if (angleDiff < 0.5) { // Within ~30 degrees
                  closestId = pos.agent.id;
              }
          });
          
          if (closestId !== activeAgentId) {
             if (closestId) playTick();
             // We need to run JS updates from worklet, usually `runOnJS`
             // But for now purely UI feedback in Reanimated?
             // Reanimated logic is tricky with React state.
             // We'll use shared values for visual feedback and runOnJS for state.
          }
       }
    })
    .onFinalize((e) => {
       buttonScale.value = withSpring(1);
       buttonGlow.value = withTiming(0);
       dragX.value = withSpring(0);
       dragY.value = withSpring(0);
       
       // Determine action
       const dist = Math.sqrt(e.translationX ** 2 + e.translationY ** 2);
       let targetId = null;
       
       if (dist > 50) {
           let angle = Math.atan2(e.translationY, e.translationX);
           let minDiff = Infinity;
           
           agentPositions.forEach(pos => {
               let angleDiff = Math.abs(angle - pos.angle);
               if (angleDiff > Math.PI) angleDiff = 2 * Math.PI - angleDiff;
               if (angleDiff < minDiff) {
                   minDiff = angleDiff;
                   if (minDiff < 0.6) targetId = pos.agent.id; // ~35 deg tolerance
               }
           });
       }

       if (isRecording) {
            playConfirm();
            // Mock sending
            const text = targetId 
              ? `(定向给 ${targetId} 语音): 我有问题...` 
              : `(全员广播): 刚才咯噔一声...`;
            
            // Invoke callback
            // Need to avoid race conditions with state updates, so we use the calculated targetId directly
            onVoiceSend(text, targetId || undefined);
       }
       
       setIsRecording(false);
       setActiveAgentId(null);
    })
    .runOnJS(true); // Allow calling JS functions

  // Visual Styles
  const buttonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: buttonScale.value },
        { translateX: dragX.value * 0.2 }, // Small parallax
        { translateY: dragY.value * 0.2 }
      ],
      backgroundColor: interpolateColor(
        buttonGlow.value,
        [0, 1],
        ['rgba(0,0,0,0.8)', 'rgba(50,50,50,0.9)']
      ),
      shadowOpacity: buttonGlow.value
    };
  });

  const getAgentStyle = (agentId: string) => {
      // Highlighting logic handled in rendering via state or derived
      return {
          opacity: (activeAgentId && activeAgentId !== agentId) ? 0.4 : 1,
          scale: (activeAgentId === agentId) ? 1.2 : 1
      };
  };

  return (
    <GestureHandlerRootView style={styles.wrapper}>
      <View style={styles.container}>
        
        {/* Agent Orbits */}
        {agentPositions.map((pos) => (
           <View 
             key={pos.agent.id}
             style={[
                 styles.agentOrb,
                 { 
                     left: COMPASS_CENTER.x + pos.x - 24, 
                     top: COMPASS_CENTER.y + pos.y - 24,
                     // We can highlight here if we sync state with gesture
                 }
             ]}
           >
              {pos.agent.avatar?.includes('/') ? (
                  <Animated.Image 
                    source={{ uri: `${BASE_URL}${pos.agent.avatar}` }} 
                    style={[styles.avatarImg]} 
                  />
              ) : (
                  <Text style={{fontSize: 24}}>{pos.agent.avatar}</Text>
              )}
              {activeAgentId === pos.agent.id && (
                  <View style={[styles.glowRing, { borderColor: pos.agent.style?.color?.replace('bg-', '') || '#3b82f6' }]} />
              )}
           </View>
        ))}

        {/* Central PTT Button */}
        <GestureDetector gesture={gesture}>
           <Animated.View style={[styles.pttButton, buttonAnimatedStyle]}>
              <LinearGradient
                colors={['#4c4c4c', '#1a1a1a']}
                style={styles.pttInner}
              >
                  <Ionicons name="mic" size={40} color={isRecording ? "#ef4444" : "#fff"} />
                  <Text style={styles.pttText}>{isRecording ? (activeAgentId ? `发送给...` : "全员广播") : "按住 说话"}</Text>
              </LinearGradient>
           </Animated.View>
        </GestureDetector>

      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  wrapper: { height: 350, width: '100%', position: 'absolute', bottom: 0, left: 0 },
  container: { flex: 1, backgroundColor: 'transparent' }, // Transparent to overlay?
  
  pttButton: {
      position: 'absolute',
      left: COMPASS_CENTER.x - BUTTON_RADIUS,
      top: COMPASS_CENTER.y - BUTTON_RADIUS,
      width: BUTTON_RADIUS * 2,
      height: BUTTON_RADIUS * 2,
      borderRadius: BUTTON_RADIUS,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: "#007aff", // Blue glow default
      shadowOffset: { width: 0, height: 0 },
      shadowRadius: 20,
      elevation: 10,
      zIndex: 10,
  },
  pttInner: {
      width: '100%', height: '100%',
      borderRadius: BUTTON_RADIUS,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.1)'
  },
  pttText: { color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 4, fontWeight: '600' },
  
  agentOrb: {
      position: 'absolute',
      width: 48, height: 48,
      borderRadius: 24,
      backgroundColor: '#222',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: '#333',
      zIndex: 5
  },
  avatarImg: { width: 44, height: 44, borderRadius: 22 },
  
  glowRing: {
      position: 'absolute', top: -4, left: -4, right: -4, bottom: -4,
      borderRadius: 30, borderWidth: 2, borderColor: '#fff'
  }
});
