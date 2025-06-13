import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Buffer } from 'buffer';
import { Link, router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
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
  Linking,
  ToastAndroid,
} from 'react-native';
import crypto from 'react-native-quick-crypto';
import * as WebBrowser from 'expo-web-browser';
import { ResponseType, makeRedirectUri, useAuthRequest } from 'expo-auth-session';
import { Button } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

// Endpoint
const discovery = {
  authorizationEndpoint: 'https://id.vk.com/authorize',
};

import { useAuth } from '../../hooks/useAuth';
import SocialVk from '@/components/login/SocialVk';

const YOUR_CLIENT_ID = process.env.EXPO_PUBLIC_VK_CLIENT_ID;
const YOUR_REDIRECT_SCHEME = YOUR_CLIENT_ID ? 'vk' + YOUR_CLIENT_ID : ''; // e.g., vk1234567
const YOUR_REDIRECT_HOST = 'vk.com'; // Or whatever you configure, but docs use this
const SCOPE = 'vkid.personal_info email'; // Or whatever scopes you need, comrade
const OAUTH2_PARAMS = Buffer.from(JSON.stringify({ scope: SCOPE })).toString('base64');

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error, handleVkLogin } = useAuth();
  const params = useLocalSearchParams();

  useEffect(() => {
    // Проверяем, пришли ли мы с экрана регистрации
    if (params.email && typeof params.email === 'string') {
      const sanitizedEmail = params.email.trim().toLowerCase();
      setEmail(sanitizedEmail);

      if (params.fromRegistration === 'true') {
        Alert.alert(
          'Регистрация успешна',
          'Ваша учетная запись создана. Пожалуйста, введите пароль для входа.',
          [{ text: 'OK' }]
        );
      }
    }
  }, [params]);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Ошибка', 'Пожалуйста, заполните все поля');
      return;
    }

    try {
      await login({email: email.trim(), password: password.trim()});
      // После успешного входа редирект произойдет автоматически в хуке useEffect
    } catch (err: any) {
      // Ошибка уже будет обработана в хуке useAuth
      console.error('Ошибка входа:', err);

      let errorMessage = 'Ошибка входа. Проверьте свои данные.'; // Default message

      // First, check error from useAuth hook
      if (typeof error === 'string') {
        errorMessage = error;
      } else if (error && typeof error === 'object' && 'message' in error && typeof (error as any).message === 'string') {
        errorMessage = (error as any).message;
      }
      // If error from useAuth didn't provide a good message, check the caught err
      else if (typeof err === 'string') {
        errorMessage = err;
      } else if (err && typeof err === 'object' && 'message' in err && typeof (err as any).message === 'string') {
        errorMessage = (err as any).message;
      }

      Alert.alert('Ошибка входа', errorMessage);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Image
            source={require('../../assets/images/qwen-ai.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Вход в аккаунт</Text>
          <Text style={styles.subtitle}>
            Добро пожаловать на образовательную платформу с персонализированным обучением
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <MaterialIcons name="email" size={20} color="#6c757d" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <MaterialIcons name="lock" size={20} color="#6c757d" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Пароль"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
              <MaterialIcons
                name={showPassword ? 'visibility' : 'visibility-off'}
                size={20}
                color="#6c757d"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Забыли пароль?</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.loginButtonText}>Войти</Text>
            )}
          </TouchableOpacity>

          {/* VK Login Button */}
          <View style={styles.socialLoginContainer}>
            <Text style={styles.socialLoginText}>Или</Text>
            <SocialVk />
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Еще нет аккаунта?</Text>
          <Link href="/(auth)/register" asChild>
            <TouchableOpacity>
              <Text style={styles.registerLink}>Зарегистрироваться</Text>
            </TouchableOpacity>
          </Link>
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
    marginBottom: 16,
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
  eyeIcon: {
    padding: 8,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  loginButtonText: {
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
  footerText: {
    color: '#6c757d',
    fontSize: 14,
  },
  registerLink: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  // Styles for VK button and social login section
  socialLoginContainer: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  socialLoginText: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 16,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    height: 50, // Slightly smaller than main button
    paddingHorizontal: 16,
    width: '100%', // Make it full width like other inputs/buttons
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  vkButton: {
    backgroundColor: '#0077FF', // VK official blue color
  },
  socialButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10, // If you add an icon
  },
});
