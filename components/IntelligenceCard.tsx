import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ActionCard } from '../types';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  card: ActionCard;
  onAction: (actionId: string, payload?: any) => void;
}

export default function IntelligenceCard({ card, onAction }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.leftColumn}>
        <View style={styles.avatarContainer}>
           <Text style={styles.avatarEmoji}>{card.agentAvatar || '🤖'}</Text>
        </View>
      </View>
      
      <View style={styles.rightColumn}>
        <View style={styles.header}>
          <Text style={styles.agentName} numberOfLines={1}>{card.agentName}</Text>
          <Text style={styles.agentTitle} numberOfLines={1}>@{card.agentId}</Text>
          <Text style={styles.dot}>·</Text>
          <Text style={styles.timestamp}>{card.timestamp}</Text>
        </View>

        <Text style={styles.content}>{card.content}</Text>

        {card.actions && card.actions.length > 0 && (
          <View style={styles.actionsRow}>
            {card.actions.map((btn, idx) => (
              <TouchableOpacity
                key={idx}
                style={[
                    styles.actionButton, 
                    btn.primary && styles.primaryActionButton
                ]}
                onPress={() => onAction(btn.action, btn.payload)}
              >
                {/* Use icons based on action types if possible, otherwise text */}
                <Text style={[
                  styles.actionText,
                  btn.primary && styles.primaryActionText
                ]}>
                  {btn.label}
                </Text>
              </TouchableOpacity>
            ))}
            {/* Add dummy social actions for the X feel if needed, or just keep functional ones */}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#BDC5CD',
  },
  leftColumn: {
    marginRight: 12,
  },
  rightColumn: {
    flex: 1,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEmoji: {
    fontSize: 22,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  agentName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0F1419',
    marginRight: 4,
    flexShrink: 1,
  },
  agentTitle: {
    fontSize: 14,
    color: '#536471',
    marginRight: 4,
    flexShrink: 1,
  },
  dot: {
    fontSize: 14,
    color: '#536471',
    marginRight: 4,
  },
  timestamp: {
    fontSize: 14,
    color: '#536471',
  },
  content: {
    fontSize: 15,
    color: '#0F1419',
    lineHeight: 20,
    marginBottom: 10,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Distribute actions or 'flex-start'
    marginTop: 4,
    maxWidth: '80%', // Don't stretch too far
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
    paddingVertical: 5, // Larger hit area
  },
  primaryActionButton: {
    // Optional: add visual distinction for primary
  },
  actionText: {
    fontSize: 13,
    color: '#536471', // Standard X gray for actions
    fontWeight: '500',
  },
  primaryActionText: {
    color: '#1D9BF0', // X Blue for primary actions
  },
});
