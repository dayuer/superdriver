import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AgentAvatarProps {
  avatar: string;
  size?: number;
  isPaid?: boolean;
  baseUrl?: string;
}

export function AgentAvatar({ avatar, size = 40, isPaid = false, baseUrl = '' }: AgentAvatarProps) {
  const isUrl = avatar?.includes('/');
  
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <View style={[styles.avatarWrapper, { width: size, height: size, borderRadius: size * 0.1 }]}>
        {isUrl ? (
          <Image 
            source={{ uri: `${baseUrl}${avatar}` }} 
            style={styles.avatarImage} 
            resizeMode="cover" 
          />
        ) : (
          <Text style={{ fontSize: size * 0.5 }}>{avatar || '🤖'}</Text>
        )}
      </View>
      
      {isPaid && (
        <View style={[styles.badge, { 
          width: size * 0.35, 
          height: size * 0.35,
          borderRadius: size * 0.175,
          right: -size * 0.05,
          bottom: -size * 0.05
        }]}>
          <Ionicons name="diamond" size={size * 0.2} color="#FFD700" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  avatarWrapper: {
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E5E5EA',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
});
