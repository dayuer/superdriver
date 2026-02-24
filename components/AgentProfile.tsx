import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Image, ImageBackground } from 'react-native';
import { Agent } from '../types';
import { BASE_URL } from '../services/api';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface AgentProfileProps {
  agent: Agent;
  visible: boolean;
  onClose: () => void;
  onChat: () => void;
}

export function AgentProfile({ agent, visible, onClose, onChat }: AgentProfileProps) {
  if (!agent) return null;

  return (
    <Modal visible={visible} animationType="fade" transparent={true}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
           <TouchableOpacity style={styles.closeButtonIcon} onPress={onClose}>
                <Ionicons name="close-circle" size={30} color="#fff" />
           </TouchableOpacity>

           <LinearGradient
              colors={['#1a1a1a', '#2d2d2d']}
              style={styles.card}
           >
              {/* Header / Avatar */}
              <View style={styles.header}>
                 <View style={[styles.avatarContainer, { borderColor: agent.style?.color || '#3b82f6' }]}>
                    {agent.avatar?.includes('/') ? (
                        <Image source={{ uri: `${BASE_URL}${agent.avatar}` }} style={styles.avatarImage} />
                    ) : (
                        <Text style={{fontSize: 40}}>{agent.avatar}</Text>
                    )}
                 </View>
                 <Text style={styles.name}>{agent.name}</Text>
                 <Text style={styles.title}>{agent.title}</Text>
              </View>

              {/* Description */}
              <View style={styles.body}>
                  <Text style={styles.description}>"{agent.description}"</Text>
                  
                  {agent.companyName && (
                      <View style={styles.badge}>
                          <Text style={styles.badgeText}>认证企业: {agent.companyName}</Text>
                      </View>
                  )}

                  <View style={styles.keywordsContainer}>
                     {agent.keywords?.slice(0, 5).map((k, i) => (
                         <View key={i} style={styles.tag}>
                             <Text style={styles.tagText}>#{k}</Text>
                         </View>
                     ))}
                  </View>
              </View>

              {/* Action Button */}
              <TouchableOpacity style={styles.actionButton} onPress={() => { onClose(); onChat(); }}>
                  <Text style={styles.actionButtonText}>发起会话</Text>
              </TouchableOpacity>

           </LinearGradient>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContainer: { width: '100%', maxWidth: 340, alignItems: 'center' },
  closeButtonIcon: { position: 'absolute', top: -40, right: 0, zIndex: 10 },
  
  card: { width: '100%', borderRadius: 20, padding: 25, alignItems: 'center', overflow: 'hidden', borderWidth: 1, borderColor: '#333' },
  
  header: { alignItems: 'center', marginBottom: 20 },
  avatarContainer: { width: 80, height: 80, borderRadius: 40, borderWidth: 3, justifyContent: 'center', alignItems: 'center', backgroundColor: '#333', marginBottom: 10, overflow: 'hidden' },
  avatarImage: { width: '100%', height: '100%' },
  name: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  title: { fontSize: 14, color: '#999', textTransform: 'uppercase', letterSpacing: 1 },
  
  body: { alignItems: 'center', width: '100%', marginBottom: 25 },
  description: { color: '#ccc', textAlign: 'center', fontStyle: 'italic', marginBottom: 15, lineHeight: 20 },
  
  badge: { backgroundColor: 'rgba(255,215,0,0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,215,0,0.3)', marginBottom: 15 },
  badgeText: { color: '#ffd700', fontSize: 12 },
  
  keywordsContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6 },
  tag: { backgroundColor: '#333', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  tagText: { color: '#888', fontSize: 12 },
  
  actionButton: { width: '100%', height: 44, borderRadius: 22, backgroundColor: '#3b82f6', justifyContent: 'center', alignItems: 'center' },
  actionButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
