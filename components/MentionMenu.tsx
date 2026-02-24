import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Agent } from '../types';

export function MentionMenu({ visible, agents, onSelect, onClose }: { visible: boolean, agents: Agent[], onSelect: (agent: Agent) => void, onClose: () => void }) {
  if (!visible) return null;

  return (
    <View style={styles.container}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ padding: 10 }}>
            {agents.map(agent => (
                <TouchableOpacity key={agent.id} style={styles.item} onPress={() => onSelect(agent)}>
                    <View style={styles.avatar}>
                        <Text>{agent.avatar}</Text>
                    </View>
                    <Text style={styles.name}>{agent.name}</Text>
                </TouchableOpacity>
            ))}
        </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
    container: { position: 'absolute', bottom: 70, left: 10, right: 10,  backgroundColor: '#fff', borderRadius: 12, shadowColor: '#000', shadowOffset: {width: 0, height: -2}, shadowOpacity: 0.1, shadowRadius: 4, elevation: 10 },
    item: { alignItems: 'center', marginRight: 15, width: 60 },
    avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f0f2f5', justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
    name: { fontSize: 10, color: '#333', textAlign: 'center' },
});
