import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, FlatList, Image } from 'react-native';
import { Agent } from '../types';
import { BASE_URL } from '../services/api';
import { Ionicons } from '@expo/vector-icons';

interface GroupMembersModalProps {
  visible: boolean;
  onClose: () => void;
  agentsMap: Record<string, Agent>;
  onAgentClick: (agent: Agent) => void;
}

export function GroupMembersModal({ visible, onClose, agentsMap, onAgentClick }: GroupMembersModalProps) {
  const agents = Object.values(agentsMap).filter(a => a.id !== 'helper');

  const renderItem = ({ item }: { item: Agent }) => (
    <TouchableOpacity style={styles.item} onPress={() => { onClose(); onAgentClick(item); }}>
        <View style={styles.avatarContainer}>
             {item.avatar?.includes('/') ? (
                 <Image source={{ uri: `${BASE_URL}${item.avatar}` }} style={styles.avatarImage} />
             ) : (
                 <Text style={{fontSize: 24}}>{item.avatar}</Text>
             )}
        </View>
        <View style={styles.info}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.title}>{item.title}</Text>
        </View>
        <Ionicons name="chatbubble-outline" size={20} color="#007aff" />
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
         <View style={styles.header}>
             <Text style={styles.headerTitle}>核心成员</Text>
             <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                 <Text style={styles.closeText}>关闭</Text>
             </TouchableOpacity>
         </View>
         
         <FlatList
            data={agents}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            contentContainerStyle={{ padding: 15 }}
         />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { height: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
  headerTitle: { fontSize: 17, fontWeight: 'bold' },
  closeBtn: { padding: 5 },
  closeText: { fontSize: 16, color: '#007aff' },
  
  item: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  avatarContainer: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#f2f2f7', justifyContent: 'center', alignItems: 'center', marginRight: 12, overflow: 'hidden' },
  avatarImage: { width: '100%', height: '100%' },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: '500', color: '#000' },
  title: { fontSize: 12, color: '#999', marginTop: 2 },
});
