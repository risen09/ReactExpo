import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { useRouter, useSegments } from 'expo-router';
import { COLORS } from '../constants/colors';

// Компоненты защищенных и незащищенных маршрутов
interface AuthContainerProps {
  children: React.ReactNode;
}

export default function AuthContainer({ children }: AuthContainerProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [initialCheck, setInitialCheck] = useState(true);

  useEffect(() => {
    // Только выполняем действия, если загрузка данных аутентификации завершена
    if (!isLoading) {
      const inAuthGroup = segments[0] === '(auth)';
      
      console.log('Auth check:', {
        isAuthenticated,
        inAuthGroup,
        segments: segments.join('/')
      });

      // Если пользователь не аутентифицирован и не находится в группе аутентификации,
      // перенаправляем на страницу входа
      if (!isAuthenticated && !inAuthGroup) {
        console.log('User not authenticated, redirecting to login');
        router.replace('/(auth)/login');
      }
      
      // Если пользователь аутентифицирован и находится в группе аутентификации,
      // перенаправляем на главную страницу
      if (isAuthenticated && inAuthGroup) {
        console.log('User already authenticated, redirecting to home');
        router.replace('/');
      }

      // После первой проверки отмечаем, что начальная проверка завершена
      if (initialCheck) {
        setInitialCheck(false);
      }
    }
  }, [isLoading, isAuthenticated, segments, router, initialCheck]);

  // Показываем индикатор загрузки во время первоначальной проверки аутентификации
  if (isLoading || initialCheck) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Загрузка...</Text>
      </View>
    );
  }

  // После загрузки отображаем дочерние компоненты
  return <>{children}</>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 10,
    color: COLORS.text,
    fontSize: 16,
  }
}); 