import client from '@/api/client';
import { useAuth } from '@/hooks/useAuth';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';

export default function GradeSetupScreen() {
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { updateProfile } = useAuth();

  const GRADES = Array.from({ length: 11 }, (_, i) => i + 1); // Grades 1-11

  const handleGradeSelect = async (grade: number) => {
    setSelectedGrade(grade);
    setIsLoading(true);

    try {
      // Mark first_time as false
      // await AsyncStorage.setItem('first_time', 'false');
      await client.user.update({
        grade
      })
      
      // Navigate to MBTI test
      router.replace('/mbti');
    } catch (error) {
      console.error('Error saving grade:', error);
      Alert.alert('Ошибка', 'Не удалось сохранить класс. Попробуйте еще раз.');
    } finally {
      setIsLoading(false);
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
            source={require('@/assets/logo.jpg')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>В каком классе ты учишься?</Text>
          <Text style={styles.subtitle}>
            Это поможет нам подобрать подходящие материалы для тебя
          </Text>
        </View>

        <View style={styles.gradesContainer}>
          {GRADES.map((grade) => (
            <TouchableOpacity
              key={grade}
              style={[
                styles.gradeButton,
                selectedGrade === grade && styles.gradeButtonSelected,
              ]}
              onPress={() => handleGradeSelect(grade)}
              disabled={isLoading}
            >
              <Text
                style={[
                  styles.gradeButtonText,
                  selectedGrade === grade && styles.gradeButtonTextSelected,
                ]}
              >
                {grade}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4CAF50" />
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  gradesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  gradeButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
  },
  gradeButtonSelected: {
    backgroundColor: '#4CAF50',
  },
  gradeButtonText: {
    fontSize: 20,
    color: '#333',
  },
  gradeButtonTextSelected: {
    color: '#fff',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
}); 