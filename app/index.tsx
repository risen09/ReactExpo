import { useEffect } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { router, Redirect } from 'expo-router';
import { useAuth } from './hooks/useAuth';

export default function Index() {
  const { isAuthenticated, isLoading, checkAuth } = useAuth();

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      await checkAuth();
      
      if (!isLoading) {
        if (isAuthenticated) {
          router.replace('/(tabs)');
        } else {
          router.replace('/(auth)/login');
        }
      }
    };

    checkAuthAndRedirect();
  }, [isAuthenticated, isLoading]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  // Если не загружается, но еще не произошло перенаправление, 
  // возвращаем Redirect компонент для немедленного перенаправления
  return isAuthenticated ? 
    <Redirect href="/(tabs)" /> : 
    <Redirect href="/(auth)/login" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
}); 