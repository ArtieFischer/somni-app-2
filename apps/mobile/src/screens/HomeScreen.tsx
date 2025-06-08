import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuthStore } from '../stores/authStore';
import Button from '../components/ui/Button';

export default function HomeScreen() {
  const signOut = useAuthStore(state => state.signOut);
  const user = useAuthStore(state => state.user);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Home Screen</Text>
      <Text style={styles.email}>Logged in as: {user?.email}</Text>
      <Button title="Sign Out" onPress={signOut} style={{marginTop: 20}} />
    </View>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#121212' },
    title: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
    email: { fontSize: 16, color: 'gray' },
});