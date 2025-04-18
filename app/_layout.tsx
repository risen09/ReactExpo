import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';

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

    const inAuthGroup = segments[0] === '(auth)';
    const inTabsGroup = segments[0] === '(tabs)';

    if (!isAuthenticated && !inAuthGroup) {
      // Пользователь не авторизован и не находится на странице авторизации,
      // перенаправляем на страницу входа
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      // Пользователь авторизован, но находится на странице авторизации,
      // перенаправляем на главную страницу
      router.replace('/(tabs)');
    }
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
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="change-password" options={{ headerShown: true, title: 'Изменить пароль' }} />
      <Stack.Screen name="personality-test" options={{ headerShown: true, title: 'Тест личности' }} />
      <Stack.Screen name="test-result" options={{ headerShown: false }} />
      <Stack.Screen name="test-screen" options={{ headerShown: false }} />
      <Stack.Screen name="test-questions" options={{ headerShown: false }} />
      <Stack.Screen name="screens/ChatScreen" options={{ headerShown: false }} />
      <Stack.Screen 
        name="screens/TrackAssistantScreen" 
        options={{ 
          headerShown: true, 
          title: 'Ассистент трека',
          headerBackTitle: 'Назад'
        }} 
      />
      <Stack.Screen 
        name="screens/DiagnosticsScreen" 
        options={{ 
          headerShown: false 
        }} 
      />
      <Stack.Screen 
        name="screens/TestScreen" 
        options={{ 
          headerShown: true, 
          title: 'Диагностический тест',
          headerBackVisible: false
        }} 
      />
      <Stack.Screen 
        name="screens/TestQuestionsScreen" 
        options={{ 
          headerShown: true, 
          title: 'Вопросы теста',
          headerBackVisible: false
        }} 
      />
      <Stack.Screen 
        name="screens/TestResultScreen" 
        options={{ 
          headerShown: true, 
          title: 'Результаты теста'
        }} 
      />
      <Stack.Screen 
        name="screens/CreateTrackScreen" 
        options={{ 
          headerShown: true, 
          title: 'Создание трека обучения'
        }} 
      />
    </Stack>
  );
}