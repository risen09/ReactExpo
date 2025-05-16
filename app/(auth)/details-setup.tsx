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

export default function DetailsSetupScreen() {
  const params = useLocalSearchParams();
  const { firstName, lastName, email, password, username } = params;

  const [gender, setGender] = useState('');
  const [age, setAge] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  console.log('Параметры, полученные на экране DetailsSetup:', params);

  const GENDER_OPTIONS = [
    { label: 'Мужской', value: 'male' },
    { label: 'Женский', value: 'female' },
  ];

  const handleFinalRegister = () => {
    console.log('Начало финальной проверки данных...');
    if (!gender) {
      Alert.alert('Ошибка', 'Пожалуйста, выберите ваш пол');
      return;
    }

    const ageNum = parseInt(age, 10);
    if (isNaN(ageNum) || ageNum < 7 || ageNum > 18) {
      Alert.alert('Ошибка', 'Пожалуйста, введите корректный возраст (от 7 до 18 лет)');
      return;
    }

    setIsLoading(true);
    const registrationData = {
      firstName,
      lastName,
      email,
      password, // In real app, this would not be passed around, but sent securely to backend at step 1 or 2.
      username,
      gender,
      age: ageNum,
    };

    console.log('Все данные для регистрации собраны:', registrationData);
    console.log('Симуляция отправки данных на сервер...');

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      console.log('Регистрация успешно симулирована!');
      Alert.alert(
        'Успех!',
        `Регистрация почти завершена, ${firstName}! Мы запомнили твои данные. Скоро ты сможешь войти в систему.`,
        [
          {
            text: 'Хорошо',
            onPress: () => {
              // Navigate to login or a post-registration info screen
              // For now, let's go to login and pass the email
              router.replace({
                pathname: '/(auth)/login',
                params: { email: String(email) }, // Ensure email is a string for params
              });
            },
          },
        ]
      );
    }, 1500); // Simulate network delay
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
            source={require('../../assets/images/logo.png')} // Make sure this path is correct
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
              maxLength={2} // Max 2 digits for age
            />
          </View>

          <TouchableOpacity
            style={styles.actionButton}
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
    width: 80, // Slightly smaller logo for this screen
    height: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 22, // Slightly smaller title
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
    marginLeft: 4, // Align with input fields
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
    backgroundColor: '#28a745', // Green for final action
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
  // backLink: {
  //   color: '#007bff',
  //   fontSize: 14,
  //   fontWeight: '600',
  // },
}); 