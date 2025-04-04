import React, { useEffect } from 'react';
import { Stack, useLocalSearchParams } from 'expo-router';
import TestResultScreen from './screens/TestResultScreen';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

const COLORS = {
  primary: '#5B67CA',     // Основной синий/фиолетовый
  secondary: '#43C0B4',   // Бирюзовый
  accent1: '#F98D51',     // Оранжевый
  accent2: '#EC575B',     // Красный
  background: '#F2F5FF',  // Светлый фон
};

export default function TestResult() {
  // Добавляем отслеживание параметров для отладки
  const params = useLocalSearchParams();
  
  useEffect(() => {
    console.log('=== TEST RESULT SCREEN DEBUG ===');
    console.log('Received params:', params);
    console.log('Type parameter:', params.type);
    
    // Проверяем, является ли params.type валидным значением
    if (params.type) {
      if (typeof params.type === 'string') {
        console.log('Type parameter is a valid string:', params.type);
      } else {
        console.log('Type parameter is not a string:', typeof params.type);
      }
    } else {
      console.log('No type parameter found in params');
    }
    
    console.log('All available params keys:', Object.keys(params));
    console.log('All params values:', Object.values(params));
    console.log('=== END TEST RESULT DEBUG ===');
  }, [params]);

  // Проверяем наличие параметра type
  if (!params.type) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Ошибка загрузки результатов</Text>
        <Text style={styles.errorMessage}>
          Не указан тип личности. Пожалуйста, вернитесь и пройдите тест снова.
        </Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Результаты теста',
          headerShown: true,
        }}
      />
      <TestResultScreen />
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
    color: COLORS.accent2,
    marginBottom: 12,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: '#25335F',
    textAlign: 'center',
    lineHeight: 24,
  },
}); 