import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';

export default function ChatScreen() {
  const router = useRouter();

  // При загрузке экрана сразу перенаправляем на экран диагностики
  useEffect(() => {
    router.replace('/screens/DiagnosticsScreen');
  }, [router]);

  // Показываем загрузочный экран, пока происходит перенаправление
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#5B67CA" />
      <Text style={styles.text}>Загрузка чата...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F5FF',
  },
  text: {
    fontSize: 16,
    color: '#5B67CA',
    marginTop: 16,
  },
}); 