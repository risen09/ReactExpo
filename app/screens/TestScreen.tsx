import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, SafeAreaView } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import COLORS from '@/app/config/colors';
import apiClient from '@/app/api/client';
import aiTestService from '@/app/services/aiTestService';

// Расширенные типы для параметров тестового экрана
interface TestScreenParams {
  testId?: string;
  subject: string;
  topic: string;
  difficulty: 'basic' | 'intermediate' | 'advanced';
  needsInitialTest?: boolean;
}

// Типы для структуры вопросов
interface TestQuestion {
  id: string;
  question: string;
  type: 'multiple_choice' | 'single_choice' | 'text' | 'number';
  options?: string[];
  correctAnswer?: string | string[] | number;
  explanation?: string;
  difficulty?: 'basic' | 'intermediate' | 'advanced';
}

// Тип для полного теста
interface Test {
  id: string;
  title: string;
  description: string;
  timeLimit?: number; // в минутах
  questions: TestQuestion[];
  subject: string;
  topic: string;
  difficulty: 'basic' | 'intermediate' | 'advanced';
}

const TestScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  
  // Получаем параметры из навигации
  const { testId, subject, topic, difficulty, needsInitialTest } = route.params as TestScreenParams;
  
  // Добавляем логирование для диагностики параметров
  console.log('TestScreen: Получены параметры:', { 
    testId, 
    subject, 
    topic, 
    difficulty, 
    needsInitialTest,
    rawParams: route.params 
  });
  
  // Состояния для управления загрузкой и данными теста
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [test, setTest] = useState<Test | null>(null);
  
  // Загружаем или создаем тест при монтировании компонента
  useEffect(() => {
    const loadOrCreateTest = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        let testData;
        
        // Если передан testId, загружаем существующий тест
        if (testId) {
          const response = await apiClient.tests.getById(testId);
          testData = response.data;
        } 
        // Иначе генерируем новый тест с использованием AI
        else {
          // Сначала пытаемся получить структуру теста от API
          try {
            const response = await apiClient.tests.generate(subject, topic, difficulty);
            testData = response.data;
          } catch (err) {
            console.log('Не удалось получить тест от API, генерируем с помощью AI:', err);
            
            // Если API недоступно, используем AI для генерации вопросов
            const questions = await aiTestService.generateQuestions({
              subject,
              topic,
              difficulty,
              questionCount: 5 // Можно настроить количество вопросов
            });
            
            // Создаем структуру теста с сгенерированными вопросами
            testData = {
              id: `test-${Date.now()}`,
              title: `Тест по теме "${topic}"`,
              description: `Диагностический тест для оценки уровня знаний по теме "${topic}" в предмете "${subject}".`,
              questions,
              subject,
              topic,
              difficulty,
              timeLimit: 15 // По умолчанию 15 минут на тест
            };
            
            // Можно сохранить сгенерированный тест на сервере, если это необходимо
            try {
              await apiClient.post('/api/tests/save', testData);
            } catch (saveErr) {
              console.warn('Не удалось сохранить сгенерированный тест:', saveErr);
              // Продолжаем работу даже если сохранение не удалось
            }
          }
        }
        
        setTest(testData);
      } catch (err) {
        console.error('Ошибка при загрузке теста:', err);
        setError('Не удалось загрузить тест. Попробуйте позже.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadOrCreateTest();
  }, [testId, subject, topic, difficulty]);
  
  // Обработчик начала теста
  const handleStartTest = () => {
    if (!test) return;
    
    // Переходим к экрану с вопросами, передавая тест
    // @ts-ignore - игнорируем для простоты
    navigation.navigate('TestQuestions', { test });
  };
  
  // Обработчик возврата на главную
  const handleGoBack = () => {
    // @ts-ignore - игнорируем для простоты
    navigation.goBack();
  };
  
  // Показываем загрузку
  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Загрузка теста...</Text>
      </View>
    );
  }
  
  // Показываем сообщение об ошибке
  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorTitle}>Произошла ошибка</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.button} onPress={handleGoBack}>
          <Text style={styles.buttonText}>Вернуться назад</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  // Если тест ещё не загружен, показываем пустой экран
  if (!test) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Данные теста не найдены</Text>
        <TouchableOpacity style={styles.button} onPress={handleGoBack}>
          <Text style={styles.buttonText}>Вернуться назад</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  // Основной контент
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.infoContainer}>
          <Text style={styles.title}>{test.title || 'Диагностический тест'}</Text>
          
          <Text style={styles.subtitle}>Предмет: {test.subject || subject}</Text>
          <Text style={styles.subtitle}>Тема: {test.topic || topic}</Text>
          <Text style={styles.subtitle}>
            Сложность: {
              test.difficulty === 'basic' ? 'Базовый' : 
              test.difficulty === 'intermediate' ? 'Средний' : 
              test.difficulty === 'advanced' ? 'Продвинутый' : 'Не указана'
            }
          </Text>
          
          {test.description && (
            <Text style={styles.description}>{test.description}</Text>
          )}
          
          <Text style={styles.questionsInfo}>
            Количество вопросов: {test.questions?.length || 0}
          </Text>
          
          {test.timeLimit && (
            <Text style={styles.questionsInfo}>
              Ограничение по времени: {test.timeLimit} мин
            </Text>
          )}
        </View>
        
        <TouchableOpacity 
          style={styles.startButton}
          onPress={handleStartTest}
        >
          <Text style={styles.buttonText}>Начать тест</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={handleGoBack}
        >
          <Text style={styles.secondaryButtonText}>Вернуться назад</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: 20,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 16,
    lineHeight: 24,
  },
  questionsInfo: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 8,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.error,
    marginBottom: 10,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: '100%',
    marginTop: 16,
  },
  startButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: '100%',
    marginBottom: 16,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 15,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  secondaryButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default TestScreen; 