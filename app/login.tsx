import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from './hooks/useAuth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const COLORS = {
  primary: '#5B67CA',     // Основной синий/фиолетовый
  secondary: '#43C0B4',   // Бирюзовый
  accent1: '#F98D51',     // Оранжевый
  accent2: '#EC575B',     // Красный
  accent3: '#FFCA42',     // Желтый
  background: '#F2F5FF',  // Светлый фон
  card: '#FFFFFF',        // Белый для карточек
  text: '#25335F',        // Основной текст
  textSecondary: '#7F8BB7',  // Вторичный текст
  border: '#EAEDF5'       // Граница
};

// Helper function to add a delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const { login, isLoading, error } = useAuth();
  const params = useLocalSearchParams();

  // Улучшенная функция загрузки данных при открытии экрана
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        console.log('Loading initial login data...');
        
        // Если есть параметры навигации, проверяем их
        console.log('Login params received:', JSON.stringify(params));
        
        if (params.fromRegistration === 'true' && params.email) {
          try {
            const redirectEmail = params.email as string;
            console.log('Email from redirect params:', redirectEmail);
            
            // Валидируем и обрабатываем email перед установкой
            if (redirectEmail && typeof redirectEmail === 'string') {
              const sanitizedEmail = redirectEmail.trim().toLowerCase();
              setEmail(sanitizedEmail);
              console.log('Email set from params:', sanitizedEmail);
              
              // Показываем сообщение о входе
              Alert.alert(
                'Регистрация успешна',
                'Ваша учетная запись создана. Пожалуйста, введите пароль для входа.',
                [{ text: 'OK' }]
              );
            }
          } catch (error) {
            console.error('Error processing redirect parameters:', error);
          }
        }
      } catch (error) {
        console.error('Error loading initial login data:', error);
      }
    };
    
    loadInitialData();
  }, [params]);

  const validateForm = () => {
    try {
      console.log('=== FORM VALIDATION START ===');
      console.log('Current email state:', email);
      console.log('Email type:', typeof email);
      
      // Базовая проверка на наличие email
      if (!email) {
        console.log('Email is empty');
        Alert.alert('Ошибка', 'Пожалуйста, введите email');
        return false;
      }
      
      // Безопасное преобразование email
      let trimmedEmail;
      try {
        trimmedEmail = String(email).trim();
        console.log('Trimmed email:', trimmedEmail);
        console.log('Trimmed email length:', trimmedEmail.length);
      } catch (e) {
        console.error('Error trimming email:', e);
        Alert.alert('Ошибка', 'Произошла ошибка при обработке email');
        return false;
      }
      
      // Обновляем состояние, если email был изменен
      if (trimmedEmail !== email) {
        console.log('Email was changed after trimming, updating state');
        setEmail(trimmedEmail);
      }
      
      // Проверка на пустой пароль
      if (!password) {
        console.log('Password is empty');
        Alert.alert('Ошибка', 'Пожалуйста, введите пароль');
        return false;
      }

      // Проверяем формат email
      let hasAtSymbol = false;
      try {
        hasAtSymbol = trimmedEmail.includes('@');
        console.log('Email has @ symbol:', hasAtSymbol);
      } catch (e) {
        console.error('Error checking for @ symbol:', e);
      }
      
      // Максимально упрощенная проверка email - только наличие символа @
      const emailRegex = /@/;
      let regexResult = false;
      try {
        regexResult = emailRegex.test(trimmedEmail);
        console.log('Email regex test result:', regexResult);
      } catch (e) {
        console.error('Error in regex test:', e);
      }
      
      // Проверяем по упрощенным правилам
      if (!hasAtSymbol || !regexResult) {
        console.log('Email validation failed');
        Alert.alert(
          'Ошибка', 
          'Введите email адрес, содержащий символ @'
        );
        return false;
      }

      console.log('=== FORM VALIDATION SUCCESS ===');
      return true;
    } catch (error) {
      console.error('Validation error:', error);
      Alert.alert('Ошибка валидации', 'Произошла ошибка при проверке формы');
      return false;
    }
  };

  const handleLogin = async () => {
    try {
      if (!validateForm()) return;

      // If this is a retry after failure, add increasing delay
      if (attemptCount > 0) {
        setIsRetrying(true);
        const delayTime = Math.min(attemptCount * 1500, 5000);
        console.log(`Adding delay of ${delayTime}ms before retry #${attemptCount}`);
        await delay(delayTime);
        setIsRetrying(false);
      }

      // Sanitize email for login
      const sanitizedEmail = String(email).trim().toLowerCase();
      console.log(`Attempting login for: ${sanitizedEmail} (attempt #${attemptCount + 1})`);
      
      // Call the login function from auth hook
      await login(sanitizedEmail, password);
      console.log('Login successful, redirecting to home');
      
      // Reset attempt count on success
      setAttemptCount(0);
    } catch (error) {
      console.error('Login submission error:', error);
      
      // Extract error message
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Произошла ошибка при входе';
      
      // Log more details if available
      if (error instanceof Error && error.stack) {
        console.error('Error stack:', error.stack);
      }
      
      // Increment attempt counter
      setAttemptCount(prev => prev + 1);
      
      // Handle different error types
      if (errorMessage.includes('Неверные учетные данные') || 
          errorMessage.includes('Invalid credentials') ||
          errorMessage.includes('Authentication failed')) {
        
        if (attemptCount >= 2) {
          // After multiple failures, suggest auto-retry with longer delay
          Alert.alert(
            'Ошибка входа', 
            'Неверный email или пароль. Возможно, системе требуется время для активации вашей учетной записи.',
            [
              { 
                text: 'Попробовать снова автоматически', 
                onPress: () => {
                  const retryDelay = 8000; // 8 seconds
                  Alert.alert('Повторная попытка', `Повторная попытка входа через ${retryDelay/1000} секунд...`);
                  setTimeout(() => handleLoginSafe(), retryDelay);
                } 
              },
              { text: 'Отмена' }
            ]
          );
        } else {
          Alert.alert(
            'Ошибка входа', 
            'Неверный email или пароль. Если вы только что зарегистрировались, подождите несколько секунд и попробуйте снова.',
            [{ text: 'OK' }]
          );
        }
      } else {
        // General error
        Alert.alert('Ошибка входа', errorMessage);
      }
    }
  };
  
  // Безопасная функция входа для использования в случае повторных попыток
  const handleLoginSafe = async () => {
    try {
      console.log('=== SAFE LOGIN ATTEMPT ===');
      
      // Проверка email
      if (!email) {
        console.log('Email is empty in safe login attempt');
        Alert.alert('Ошибка входа', 'Email не указан. Пожалуйста, введите email.');
        return;
      }
      
      // Проверка пароля
      if (!password) {
        console.log('Password is empty in safe login attempt');
        Alert.alert('Ошибка входа', 'Пароль не указан. Пожалуйста, введите пароль.');
        return;
      }
      
      // Используем основную функцию входа
      await handleLogin();
    } catch (error) {
      console.error('Safe login error:', error);
      Alert.alert('Ошибка входа', 'Не удалось выполнить вход. Пожалуйста, попробуйте позже.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={[COLORS.primary, '#424D9D']}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.imageContainer}>
            <Image 
              source={require('../assets/images/logo.png')} 
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.headerTitle}>Вход в аккаунт</Text>
          <Text style={styles.headerSubtitle}>Войдите, чтобы продолжить обучение</Text>
        </LinearGradient>
        
        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Mail color={COLORS.textSecondary} size={20} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              placeholderTextColor={COLORS.textSecondary}
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Lock color={COLORS.textSecondary} size={20} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Пароль"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              placeholderTextColor={COLORS.textSecondary}
            />
            <TouchableOpacity
              style={styles.visibilityIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff color={COLORS.textSecondary} size={20} />
              ) : (
                <Eye color={COLORS.textSecondary} size={20} />
              )}
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={styles.loginButton}
            onPress={handleLogin}
            disabled={isLoading || isRetrying}
          >
            {isLoading || isRetrying ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.loginButtonText}>Войти</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.linkButton}
            onPress={() => router.push('/register')}
          >
            <Text style={styles.linkText}>
              Нет аккаунта? <Text style={styles.highlightText}>Зарегистрироваться</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  header: {
    paddingVertical: 40,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  imageContainer: {
    width: 100,
    height: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    overflow: 'hidden',
  },
  logo: {
    width: 60,
    height: 60,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: 8,
  },
  formContainer: {
    padding: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    height: 56,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
  },
  visibilityIcon: {
    padding: 4,
  },
  loginButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  linkButton: {
    padding: 12,
    alignItems: 'center',
  },
  linkText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  highlightText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
}); 