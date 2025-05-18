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
} from 'react-native';
import crypto from 'react-native-quick-crypto';

import { useAuth } from '../../hooks/useAuth';

// VK Constants - IMPORTANT, BLYAT! Make sure EXPO_PUBLIC_VK_CLIENT_ID is in your .env file!
const YOUR_CLIENT_ID = process.env.EXPO_PUBLIC_VK_CLIENT_ID;
const YOUR_REDIRECT_SCHEME = YOUR_CLIENT_ID ? 'vk' + YOUR_CLIENT_ID : ''; // e.g., vk1234567
const YOUR_REDIRECT_HOST = 'vk.com'; // Or whatever you configure, but docs use this
const REDIRECT_URI = YOUR_REDIRECT_SCHEME
  ? `${YOUR_REDIRECT_SCHEME}://${YOUR_REDIRECT_HOST}/blank.html`
  : '';
const SCOPE = 'vkid.personal_info email'; // Or whatever scopes you need, comrade
const OAUTH2_PARAMS = Buffer.from(JSON.stringify({ scope: SCOPE })).toString('base64');
const FINAL_REDIRECT_URI = REDIRECT_URI ? `${REDIRECT_URI}?oauth2_params=${OAUTH2_PARAMS}` : '';

// PKCE Helper functions - like special wrench for special nuts
const generateRandomString = (length: number): string => {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  let text = '';
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

const generateCodeChallenge = (verifier: string): string => {
  const hash = crypto.createHash('sha256').update(verifier).digest();
  return Buffer.from(hash)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
};

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error, handleVkLogin } = useAuth();
  const params = useLocalSearchParams();

  // VK Auth State
  const [vkAvailable, setVkAvailable] = useState<boolean>(false);
  const [vkAuthState, setVkAuthState] = useState<string | null>(null);
  const [vkCodeVerifier, setVkCodeVerifier] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL}/api/v2/auth/vk/health`, {
      method: 'GET',
    })
      .then(data => {
        setVkAvailable(true);
      })
      .catch(error => {
        console.error('Error checking VK availability:', error);
        setVkAvailable(false);
      });
  }, []);

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

  // useEffect for VK Deep Linking
  useEffect(() => {
    if (!YOUR_CLIENT_ID || !REDIRECT_URI) {
      console.warn(
        'VK Client ID or Redirect URI is not configured. VK login will not work, blyat!'
      );
      return;
    }

    const handleDeepLink = (event: { url: string }) => {
      console.log('Deep link received for VK, blyat!', event.url);
      const url = event.url;
      // Example: vk<YOUR_CLIENT_ID>://vk.com?payload={"device_id":"...", "code":"...", "state":"...", "type":"code_v2"}

      if (url && url.startsWith(REDIRECT_URI)) {
        const fragment = url.split('?')[1];
        if (fragment) {
          const params: Record<string, string> = {};
          fragment.split('&').forEach(param => {
            const [key, value] = param.split('=');
            params[key] = decodeURIComponent(value);
          });

          const { code, state: receivedState, device_id, type } = params;
          if (receivedState !== vkAuthState) {
            console.warn('VK State mismatch. Security issue or bad pipe connection.');
            return;
          }

          if (type !== 'code_v2') {
            console.log('Pizdec!', 'Unexpected VK response type.');
            return;
          }

          if (code && device_id && vkCodeVerifier) {
            handleVkLogin(code, vkCodeVerifier, device_id).catch(error => {
              console.error('Error exchanging code:', error);
              Alert.alert('Pizdec!', 'Network error or backend is sleeping.');
            });
          } else {
            Alert.alert(
              'Oy-vey!',
              'Could not get all required data from VK (code, device_id, or verifier missing). Check pipes.'
            );
          }
        }
      }
    };

    const subscription = Linking.addEventListener('url', handleDeepLink);

    Linking.getInitialURL().then(url => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    return () => {
      subscription.remove();
    };
  }, [
    vkAuthState,
    vkCodeVerifier,
    YOUR_CLIENT_ID,
    REDIRECT_URI,
    YOUR_REDIRECT_SCHEME,
    YOUR_REDIRECT_HOST,
  ]); // Added dependencies

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Ошибка', 'Пожалуйста, заполните все поля');
      return;
    }

    try {
      await login({email: email.trim(), password: password.trim()});
      // После успешного входа редирект произойдет автоматически в хуке useEffect
    } catch (err) {
      // Ошибка уже будет обработана в хуке useAuth
      console.error('Ошибка входа:', err);
    }
  };

  // VK Login Handler
  const handleVKLogin = async () => {
    if (!YOUR_CLIENT_ID || !FINAL_REDIRECT_URI) {
      Alert.alert(
        'Ошибка конфигурации VK',
        'VK Client ID или Redirect URI не настроены. Сообщите разработчикам, эти сантехники опять что-то напутали!'
      );
      return;
    }
    console.log('Handling VK Login...');

    const verifier = generateRandomString(64);
    const challenge = generateCodeChallenge(verifier);
    const state = generateRandomString(16);
    console.log('State: ', state);

    setVkCodeVerifier(verifier);
    setVkAuthState(state);

    const authUrl =
      `https://id.vk.com/authorize?client_id=${YOUR_CLIENT_ID}` +
      `&redirect_uri=${encodeURIComponent(FINAL_REDIRECT_URI)}` +
      `&response_type=code` +
      `&code_challenge=${challenge}` +
      `&code_challenge_method=S256` +
      `&state=${state}` +
      `&lang_id=0` + // 0 for Russian, 3 for English
      `&scheme=space_gray`;

    console.log('Opening VK Auth URL:', authUrl);
    try {
      const canOpen = await Linking.canOpenURL(authUrl);
      if (canOpen) {
        Linking.openURL(authUrl);
      } else {
        Alert.alert(
          'Pizdec!',
          'Cannot open VK auth URL. Maybe no browser installed? Or bad URL pipe.'
        );
      }
    } catch (error) {
      console.error('Error opening VK URL:', error);
      Alert.alert('Ошибка', 'Не удалось открыть страницу входа VK.');
    }
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
            source={require('../../assets/images/logo.png')}
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
            <TouchableOpacity
              style={[styles.socialButton, styles.vkButton]} // You'll need to add vkButton style
              onPress={handleVKLogin}
              disabled={!YOUR_CLIENT_ID || isLoading || !vkAvailable} // Disable if not configured
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.socialButtonText}>Войти через VK</Text>
              )}
            </TouchableOpacity>
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
