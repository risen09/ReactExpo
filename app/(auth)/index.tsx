import { Redirect } from 'expo-router';

export default function Index() {
  // Автоматически перенаправляем на страницу входа
  return <Redirect href="/(auth)/login" />;
}