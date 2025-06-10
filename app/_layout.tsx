import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { AuthProvider, useAuth } from '../hooks/useAuth';
import { AuthRoute } from './(auth)/types';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Функция для перенаправления пользователя в зависимости от статуса авторизации
function useProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const checkFirstTimeAndRedirect = async () => {
      const inAuthGroup = segments[0] === '(auth)';
      const inTabsGroup = segments[0] === '(tabs)';
      const inMbtiGroup = segments[0] === 'mbti';
      const currentAuthRoute = segments[1] as AuthRoute | undefined;
      const inGradeSetup = inAuthGroup && currentAuthRoute === 'grade-setup';

      if (!isAuthenticated && !inAuthGroup) {
        // Пользователь не авторизован и не находится на странице авторизации,
        // перенаправляем на страницу входа
        router.replace('/(auth)/login');
      } else if (isAuthenticated) {
        // Проверяем, первый ли это вход
        const isFirstTime = await AsyncStorage.getItem('first_time');
        
        if (isFirstTime === null) {
          // Если first_time не установлен, значит это первый вход
          await AsyncStorage.setItem('first_time', 'true');
          if (!inGradeSetup) {
            router.replace('/(auth)/grade-setup');
          }
        } else if (isFirstTime === 'true' && !inGradeSetup && !inMbtiGroup) {
          // Если first_time = true и не на странице выбора класса или MBTI,
          // перенаправляем на выбор класса
          router.replace('/(auth)/grade-setup');
        } else if (inAuthGroup && !inGradeSetup) {
          // Если авторизован и не на странице выбора класса,
          // перенаправляем на главную страницу
          router.replace('/(tabs)');
        }
      }
    };

    checkFirstTimeAndRedirect();
  }, [isAuthenticated, segments, isLoading]);
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}

function RootLayoutNav() {
  // Используем хук для защиты маршрутов
  useProtectedRoute();

  return (
    <Stack>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="mbti" options={{ headerShown: false }} />
    </Stack>
  );
}
