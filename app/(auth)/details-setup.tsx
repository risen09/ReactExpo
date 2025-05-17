import { MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
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
} from 'react-native';

import { useAuth } from '../../hooks/useAuth';
import { RegisterRequest } from '../../types/auth';

export default function DetailsSetupScreen() {
  const params = useLocalSearchParams();
  const firstName = String(params.firstName || '');
  const lastName = String(params.lastName || '');
  const email = String(params.email || '');
  const password = String(params.password || '');
  const username = String(params.username || '');

  const [gender, setGender] = useState(0);
  const [age, setAge] = useState('');

  const { register, isLoading, error } = useAuth();

  console.log('Параметры, полученные на экране DetailsSetup:', {firstName, lastName, email, username, password: '***'});

  const GENDER_OPTIONS = [
    { label: 'Женский', value: 0 },
    { label: 'Мужской', value: 1 },
  ];

  useEffect(() => {
    if (error) {
      Alert.alert('Ошибка регистрации', error, [{ text: 'OK'}]);
    }
  }, [error]);

  const handleFinalRegister = async () => {
    console.log('Начало финальной проверки данных в DetailsSetupScreen...');
    if (!gender) {
      Alert.alert('Ошибка', 'Пожалуйста, выберите ваш пол');
      return;
    }

    const ageNum = parseInt(age, 10);
    if (isNaN(ageNum) || ageNum < 7 || ageNum > 18) {
      Alert.alert('Ошибка', 'Пожалуйста, введите корректный возраст (от 7 до 18 лет)');
      return;
    }

    const registrationData: RegisterRequest = {
      name: `${firstName} ${lastName}`.trim(),
      email,
      password,
      username,
      gender,
      age: ageNum,
    };

    console.log('Все данные для регистрации собраны:', {
        ...registrationData,
        password: '***MASKED***'
    });
    console.log('Вызов функции register из useAuth...');

    await register(registrationData);
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
          <Text style={styles.title}>Еще немного о себе</Text>
          <Text style={styles.subtitle}>
            Эта информация поможет нам сделать обучение лучше для тебя, {firstName}!
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Твой пол:</Text>
          <View style={styles.genderContainer}>
            {GENDER_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.genderButton,
                  gender === option.value && styles.genderButtonSelected,
                ]}
                onPress={() => setGender(option.value)}
                disabled={isLoading}
              >
                <Text
                  style={[
                    styles.genderButtonText,
                    gender === option.value && styles.genderButtonTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Твой возраст:</Text>
          <View style={styles.inputContainer}>
            <MaterialIcons name="cake" size={20} color="#6c757d" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Возраст"
              value={age}
              onChangeText={setAge}
              keyboardType="number-pad"
              maxLength={2}
              editable={!isLoading}
            />
          </View>

          <TouchableOpacity
            style={[styles.actionButton, isLoading && styles.actionButtonDisabled]}
            onPress={handleFinalRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.actionButtonText}>Завершить регистрацию</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          {/* Optional: Back button to username-setup */}
          {/* <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.push('/(auth)/username-setup')}>
            <Text style={styles.backLink}>Назад</Text>
          </TouchableOpacity> */}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Reusing and adapting styles from previous screens
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
    width: 80,
    height: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 15,
  },
  form: {
    width: '100%',
  },
  label: {
    fontSize: 16,
    color: '#495057',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 20,
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
  genderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  genderButton: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
    marginHorizontal: 4,
  },
  genderButtonSelected: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  genderButtonText: {
    fontSize: 14,
    color: '#212529',
    fontWeight: '500',
  },
  genderButtonTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  actionButton: {
    backgroundColor: '#28a745',
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
  actionButtonDisabled: {
    backgroundColor: '#a5d6a7',
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
  // backLink: {
  //   color: '#007bff',
  //   fontSize: 14,
  //   fontWeight: '600',
  // },
}); 