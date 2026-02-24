import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export function DiscoverPage() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>数字化补给站 (Development in Progress)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  text: {
    color: '#999',
    fontSize: 16,
  },
});
