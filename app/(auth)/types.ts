export type AuthRoute = 'login' | 'register' | 'username-setup' | 'details-setup' | 'grade-setup';

declare module 'expo-router' {
  interface RouteMap {
    '/(auth)/login': undefined;
    '/(auth)/register': undefined;
    '/(auth)/username-setup': undefined;
    '/(auth)/details-setup': undefined;
    '/(auth)/grade-setup': undefined;
    '/(tabs)': undefined;
    '/mbti': undefined;
    '/': undefined;
  }
}