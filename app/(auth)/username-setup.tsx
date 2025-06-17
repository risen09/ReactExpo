import { MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';

// We'll use similar styles to register.tsx for consistency
// Consider moving shared styles to a common file later if this app grows bigger, like a central water main!

export default function UsernameSetupScreen() {
  const params = useLocalSearchParams();
  const { firstName, lastName, email, password } = params;

  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  console.log('Параметры, полученные на экране UsernameSetup:', params);

  const handleNext = () => {
    console.log('Начало проверки данных для username...');
    if (!username.trim()) {
      Alert.alert('Ошибка', 'Пожалуйста, введите имя пользователя');
      return;
    }

    // Basic username validation (example: no spaces, min length)
    if (username.includes(' ')) {
        Alert.alert('Ошибка', 'Имя пользователя не должно содержать пробелов.');
        return;
    }
    if (username.trim().length < 3) {
        Alert.alert('Ошибка', 'Имя пользователя должно быть не менее 3 символов.');
        return;
    }


    setIsLoading(true);
    console.log('Имя пользователя подтверждено:', username, 'Переход к следующему шагу...');

    // Simulate async operation and navigate to the next screen
    // We'll create 'details-setup.tsx' next
    setTimeout(() => {
      router.push({
        pathname: './details-setup', // Next screen in our pipeline
        params: {
          firstName,
          lastName,
          email,
          password,
          username: username.trim(),
        },
      });
      setIsLoading(false);
      console.log('Перенаправлено на /_layout.tsx/(auth)/details-setup с параметрами:', { firstName, lastName, email, password, username });
    }, 1000); // Simulate network delay
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Image
            source={require('@/assets/logo.jpg')} // Make sure this path is correct
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Придумай имя пользователя</Text>
          <Text style={styles.subtitle}>
            Можешь использовать username из твоей любимой игры! Будь креативным!
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <MaterialIcons name="account-circle" size={20} color="#6c757d" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Имя пользователя"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleNext}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.actionButtonText}>Далее</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          {/* Optionally, add a way to go back, but for now, let's keep it simple */}
          {/* <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backLink}>Назад</Text>
          </TouchableOpacity> */}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: '#fff',
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20, // Added for better text wrapping
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 20, // Increased margin
    borderWidth: 1,
    borderColor: '#e9ecef',
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: '#212529',
  },
  actionButton: {
    backgroundColor: '#007bff', // Changed color for "Next" button to differentiate
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  // backLink: { // Style for a potential back button
  //   color: '#007bff',
  //   fontSize: 14,
  //   fontWeight: '600',
  // },
}); 