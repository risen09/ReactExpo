import React, { useEffect } from 'react';
import { Stack, useLocalSearchParams } from 'expo-router';
import TestScreen from './screens/TestScreen';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import COLORS from './config/colors';

export default function TestRoute() {
  // Получаем параметры маршрута для отладки
  const params = useLocalSearchParams();
  
  useEffect(() => {
    console.log('=== TEST SCREEN ROUTE DEBUG ===');
    console.log('Received params:', params);
    console.log('Subject:', params.subject);
    console.log('Topic:', params.topic);
    console.log('Difficulty:', params.difficulty);
    console.log('TestId:', params.testId);
    console.log('NeedsInitialTest:', params.needsInitialTest);
    console.log('All available params keys:', Object.keys(params));
    console.log('=== END TEST SCREEN ROUTE DEBUG ===');
  }, [params]);

  // Проверяем наличие обязательных параметров
  if (!params.subject || !params.topic) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Ошибка загрузки теста</Text>
        <Text style={styles.errorMessage}>
          Не указаны обязательные параметры (предмет/тема). Пожалуйста, вернитесь и повторите запрос.
        </Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Диагностический тест',
          headerShown: true,
        }}
      />
      <TestScreen />
    </>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.background,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.error,
    marginBottom: 12,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 24,
  },
}); 