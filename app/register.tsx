import React, { useState } from 'react';
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
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Mail, Lock, Eye, EyeOff, User, Calendar, ChevronDown } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from './hooks/useAuth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://j0cl9aplcsh5.share.zrok.io';

// Функции для прямого API вызова (для отладки)
const login = async (username: string = 'admin', password: string = 'admin123'): Promise<{ token: string }> => {
  try {
    console.log(`Attempting admin login for: ${username}`);
    const authString = 'Basic ' + btoa(`${username}:${password}`);
    console.log('Auth header created (masked):', authString.substring(0, 10) + '...');
    
    const response = await fetch(`${API_BASE_URL}/api/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authString,
        'Accept': 'application/json'
      }
    });

    console.log('Admin login response status:', response.status);

    if (!response.ok) {
      let errorText = '';
      try {
        errorText = await response.text();
      } catch (e) {
        errorText = 'Login failed';
      }
      console.log('Admin login error response:', errorText);
      throw new Error(`Login failed: ${errorText}`);
    }

    const data = await response.json();
    console.log('Admin login successful, token received:', data.token ? 'YES' : 'NO');
    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

const createRecord = async (token: string, collection: string, recordData: Record<string, any>): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/${collection}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(recordData)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Ошибка создания: ${error}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Create error:', error);
    throw error;
  }
};

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

export default function RegisterScreen() {
  const [formData, setFormData] = useState({
    nickname: '',
    name: '',
    email: '',
    gender: '',
    age: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register, isLoading, error } = useAuth();

  const handleChange = (field: string, value: string) => {
    console.log(`Setting ${field} to:`, value);
    setFormData(prevData => {
      const newData = { ...prevData, [field]: value };
      console.log(`Form data after setting ${field}:`, newData);
      return newData;
    });
  };

  const validateForm = () => {
    try {
      // Check for required fields
      const requiredFields: Array<{ field: string, label: string }> = [
        { field: 'name', label: 'имя' },
        { field: 'email', label: 'email' },
        { field: 'password', label: 'пароль' },
        { field: 'confirmPassword', label: 'подтверждение пароля' }
      ];
      
      const missingFields: string[] = [];
      
      for (const { field, label } of requiredFields) {
        if (!formData[field as keyof typeof formData]) {
          missingFields.push(label);
        }
      }
      
      if (missingFields.length > 0) {
        Alert.alert(
          'Ошибка', 
          `Пожалуйста, заполните следующие обязательные поля: ${missingFields.join(', ')}`
        );
        return false;
      }
      
      // Validate email format
      const trimmedEmail = formData.email.trim();
      console.log('Registration form - validating email:', trimmedEmail);
      
      // Упрощенная проверка - только наличие символа @
      const emailRegex = /@/;
      const isValid = emailRegex.test(trimmedEmail);
      console.log('Email validation result:', isValid, 'Symbol @ present:', trimmedEmail.includes('@'));
      
      if (!isValid) {
        Alert.alert('Ошибка', 'Введите email адрес, содержащий символ @');
        return false;
      }
      
      // Update email in the form with trimmed version
      if (trimmedEmail !== formData.email) {
        setFormData(prev => ({
          ...prev,
          email: trimmedEmail
        }));
      }
      
      // Check password confirmation
      if (formData.password !== formData.confirmPassword) {
        Alert.alert('Ошибка', 'Пароли не совпадают');
        return false;
      }
      
      // Check password length
      if (formData.password.length < 6) {
        Alert.alert('Ошибка', 'Пароль должен содержать не менее 6 символов');
        return false;
      }
      
      // Set nickname to name if empty
      if (!formData.nickname && formData.name) {
        setFormData(prev => ({
          ...prev,
          nickname: formData.name
        }));
        console.log('Auto-set nickname to name:', formData.name);
      }
      
      return true;
    } catch (error) {
      console.error('Form validation error:', error);
      Alert.alert('Ошибка', 'Произошла ошибка при проверке формы');
      return false;
    }
  };

  const handleRegister = async () => {
    try {
      // First validate form
      if (!validateForm()) return;
      
      console.log('Form validation passed, proceeding with registration');
      
      // Prepare user data
      const userData = {
        nickname: formData.nickname || formData.name,
        name: formData.name,
        email: formData.email.trim().toLowerCase(),
        gender: (formData.gender || 'other') as 'male' | 'female' | 'other',
        age: formData.age ? parseInt(formData.age, 10) : 0,
        password: formData.password,
      };
      
      // Debug log (with masked password)
      console.log('Registration data:', JSON.stringify({
        ...userData,
        password: '***MASKED***'
      }));
      
      // Вызываем метод регистрации из useAuth
      // Теперь он автоматически выполнит вход после регистрации
      await register(userData);
      
    } catch (error) {
      console.error('Registration submission error:', error);
      Alert.alert(
        'Ошибка регистрации', 
        error instanceof Error ? error.message : 'Произошла ошибка при регистрации'
      );
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
          <Text style={styles.headerTitle}>Создайте аккаунт</Text>
          <Text style={styles.headerSubtitle}>Зарегистрируйтесь, чтобы начать обучение</Text>
        </LinearGradient>
        
        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <User color={COLORS.textSecondary} size={20} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Имя"
              value={formData.name}
              onChangeText={(value) => handleChange('name', value)}
              placeholderTextColor={COLORS.textSecondary}
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Mail color={COLORS.textSecondary} size={20} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              keyboardType="email-address"
              autoCapitalize="none"
              value={formData.email}
              onChangeText={(value) => handleChange('email', value)}
              placeholderTextColor={COLORS.textSecondary}
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Lock color={COLORS.textSecondary} size={20} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Пароль"
              secureTextEntry={!showPassword}
              value={formData.password}
              onChangeText={(value) => handleChange('password', value)}
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
          
          <View style={styles.inputContainer}>
            <Lock color={COLORS.textSecondary} size={20} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Подтвердите пароль"
              secureTextEntry={!showConfirmPassword}
              value={formData.confirmPassword}
              onChangeText={(value) => handleChange('confirmPassword', value)}
              placeholderTextColor={COLORS.textSecondary}
            />
            <TouchableOpacity
              style={styles.visibilityIcon}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff color={COLORS.textSecondary} size={20} />
              ) : (
                <Eye color={COLORS.textSecondary} size={20} />
              )}
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={styles.registerButton}
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.registerButtonText}>Зарегистрироваться</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.linkButton}
            onPress={() => router.push('/login')}
          >
            <Text style={styles.linkText}>
              Уже есть аккаунт? <Text style={styles.highlightText}>Войти</Text>
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
  registerButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  registerButtonText: {
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