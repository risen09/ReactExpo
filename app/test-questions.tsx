import React, { useEffect } from 'react';
import { Stack, useLocalSearchParams } from 'expo-router';
import TestQuestionsScreen from './screens/TestQuestionsScreen';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import COLORS from './config/colors';

export default function TestQuestionsRoute() {
  // Получаем параметры маршрута для отладки
  const params = useLocalSearchParams();
  
  useEffect(() => {
    console.log('=== TEST QUESTIONS ROUTE DEBUG ===');
    console.log('Received params:', params);
    console.log('Test data available:', !!params.test);
    console.log('All available params keys:', Object.keys(params));
    console.log('=== END TEST QUESTIONS ROUTE DEBUG ===');
  }, [params]);

  // Проверяем наличие данных теста
  if (!params.test) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Ошибка загрузки вопросов</Text>
        <Text style={styles.errorMessage}>
          Данные теста не переданы. Пожалуйста, вернитесь и начните тест заново.
        </Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Вопросы теста',
          headerShown: true,
          headerBackVisible: false,
        }}
      />
      <TestQuestionsScreen />
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