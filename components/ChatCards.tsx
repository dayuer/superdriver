import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export function PaymentCard() {
  return (
    <View style={styles.card}>
      <LinearGradient colors={['#333', '#000']} style={styles.bg}>
        <View style={styles.row}>
            <Text style={styles.label}>支付请求</Text>
            <Text style={styles.amount}>¥ 45.00</Text>
        </View>
        <Text style={styles.desc}>车辆救援服务费 - 预估</Text>
        <TouchableOpacity style={styles.btn}>
            <Text style={styles.btnText}>立即支付</Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
    card: { width: 240, height: 120, borderRadius: 12, overflow: 'hidden', marginVertical: 5 },
    bg: { flex: 1, padding: 15, justifyContent: 'space-between' },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    label: { color: '#888', fontSize: 12 },
    amount: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
    desc: { color: '#ccc', fontSize: 13 },
    btn: { backgroundColor: '#007aff', paddingVertical: 6, borderRadius: 6, alignItems: 'center' },
    btnText: { color: '#fff', fontSize: 12, fontWeight: '600' },
});
