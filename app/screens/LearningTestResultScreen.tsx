import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import COLORS from '@/app/config/colors';
import apiClient from '@/app/api/client';
import aiLearningTrackService from '@/app/services/aiLearningTrackService';

// Типы для данных результатов теста
interface TestResult {
  testId: string;
  score: number;
  maxScore: number;
  percentage: number;
  correctAnswers: number;
  totalQuestions: number;
  completedAt: string;
  subject: string;
  topic: string;
  difficulty: 'basic' | 'intermediate' | 'advanced';
  wrongAnswers?: {
    questionId: string;
    question: string;
    userAnswer: any;
    correctAnswer: any;
    explanation?: string;
  }[];
  recommendations?: {
    nextSteps: string[];
    suggestedTopics: string[];
    recommendedDifficulty: 'basic' | 'intermediate' | 'advanced';
  };
  evaluations?: {
    questionId: string;
    question: string;
    userAnswer: any;
    isCorrect: boolean;
    correctAnswer: any;
    explanation?: string;
  }[];
}

// Интерфейс для трека обучения
interface LearningTrack {
  id: string;
  title: string;
  subject: string;
  topic: string;
  description: string;
  difficulty: 'basic' | 'intermediate' | 'advanced';
  lessons: any[];
}

const LearningTestResultScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  
  // Получаем параметры из навигации: результат или тестID
  const { testId, result, subject, topic } = route.params as { testId: string, result?: TestResult, subject: string, topic: string };
  
  // Состояния для управления данными
  const [testResult, setTestResult] = useState<TestResult | null>(result || null);
  const [isLoading, setIsLoading] = useState(!result);
  const [error, setError] = useState<string | null>(null);
  const [isCreatingTrack, setIsCreatingTrack] = useState(false);
  
  // Загружаем результаты теста, если они не были переданы через параметры
  useEffect(() => {
    const fetchTestResult = async () => {
      if (result) {
        // Если результат уже передан в параметрах, используем его
        setTestResult(result);
        return;
      }
      
      if (!testId) {
        setError('Идентификатор теста не найден');
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        const response = await apiClient.tests.getResult(testId);
        setTestResult(response.data as TestResult);
      } catch (err) {
        console.error('Ошибка при загрузке результатов теста:', err);
        setError('Не удалось загрузить результаты теста. Пожалуйста, попробуйте позже.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTestResult();
  }, [testId, result]);
  
  // Обработчик создания учебного трека с помощью AI
  const handleCreateLearningTrack = async (includePrerequisites: boolean = false) => {
    if (!testResult) return;
    
    setIsCreatingTrack(true);
    
    try {
      // Предварительная подготовка результата теста (добавляем completedAt, если отсутствует)
      const preparedResult: TestResult = {
        ...testResult,
        completedAt: testResult.completedAt || new Date().toISOString()
      };
      
      // Используем AI сервис для создания трека обучения
      const trackData = await aiLearningTrackService.createTrackFromTest(
        preparedResult,
        includePrerequisites
      );
      
      // Переходим к экрану трека обучения
      // @ts-ignore - игнорируем для простоты
      navigation.navigate('LearningTrackDetails', {
        trackId: trackData.id,
        trackData
      });
    } catch (err) {
      console.error('Ошибка при создании трека обучения:', err);
      Alert.alert(
        'Ошибка',
        'Не удалось создать трек обучения. Пожалуйста, попробуйте позже.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsCreatingTrack(false);
    }
  };
  
  // Показываем диалог для создания трека обучения
  const showCreateTrackDialog = () => {
    Alert.alert(
      'Создание учебного плана',
      'Включить предварительные темы в учебный план?',
      [
        {
          text: 'Нет, только основная тема',
          onPress: () => handleCreateLearningTrack(false)
        },
        {
          text: 'Да, с предварительными темами',
          onPress: () => handleCreateLearningTrack(true)
        },
        {
          text: 'Отмена',
          style: 'cancel'
        }
      ]
    );
  };
  
  // Обработчик перехода к повторному прохождению теста
  const handleRetakeTest = () => {
    if (!testResult) return;
    
    // @ts-ignore - игнорируем для простоты
    navigation.navigate('TestScreen', {
      subject: testResult.subject || subject,
      topic: testResult.topic || topic,
      difficulty: testResult.difficulty,
      needsInitialTest: true
    });
  };
  
  // Обработчик перехода к объяснению темы
  const handleShowTopicExplanation = async () => {
    if (!testResult) return;
    
    setIsCreatingTrack(true);
    
    try {
      // Генерируем объяснение темы с помощью AI
      const explanation = await aiLearningTrackService.generateLessonContent(
        testResult.subject,
        testResult.topic,
        testResult.difficulty
      );
      
      // Навигация к экрану с объяснением темы
      // @ts-ignore - игнорируем для простоты
      navigation.navigate('TopicExplanationScreen', {
        subject: testResult.subject,
        topic: testResult.topic,
        difficulty: testResult.difficulty,
        content: explanation
      });
    } catch (err) {
      console.error('Ошибка при генерации объяснения темы:', err);
      Alert.alert(
        'Ошибка',
        'Не удалось сгенерировать объяснение темы. Пожалуйста, попробуйте позже.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsCreatingTrack(false);
    }
  };
  
  // Обработчик возврата на главную
  const handleGoHome = () => {
    // @ts-ignore - игнорируем для простоты
    navigation.navigate('(tabs)');
  };
  
  // Показываем индикатор загрузки
  if (isLoading || isCreatingTrack) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>
            {isCreatingTrack ? 'Создание учебного трека...' : 'Загрузка результатов теста...'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }
  
  // Показываем сообщение об ошибке
  if (error || !testResult) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Произошла ошибка</Text>
          <Text style={styles.errorText}>{error || 'Результаты теста не найдены'}</Text>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={handleGoHome}
          >
            <Text style={styles.primaryButtonText}>Вернуться на главную</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  
  // Функция для отображения уровня оценки
  const getAssessmentLevel = (percentage: number): { text: string, color: string } => {
    if (percentage >= 90) return { text: 'Отлично', color: '#4CAF50' };
    if (percentage >= 75) return { text: 'Хорошо', color: '#8BC34A' };
    if (percentage >= 60) return { text: 'Удовлетворительно', color: '#FFC107' };
    if (percentage >= 40) return { text: 'Требуется улучшение', color: '#FF9800' };
    return { text: 'Необходимо повторение', color: '#F44336' };
  };
  
  const assessment = getAssessmentLevel(testResult.percentage);
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Результаты теста</Text>
          <Text style={styles.subtitle}>
            {testResult.subject}: {testResult.topic}
          </Text>
        </View>
        
        <View style={styles.resultCard}>
          <View style={styles.scoreContainer}>
            <View style={styles.scoreCircle}>
              <Text style={styles.scoreText}>{Math.round(testResult.percentage)}%</Text>
            </View>
            <Text style={[styles.assessmentText, { color: assessment.color }]}>
              {assessment.text}
            </Text>
          </View>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Правильных ответов:</Text>
              <Text style={styles.statValue}>{testResult.correctAnswers} из {testResult.totalQuestions}</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Набрано баллов:</Text>
              <Text style={styles.statValue}>{testResult.score} из {testResult.maxScore}</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Уровень сложности:</Text>
              <Text style={styles.statValue}>
                {testResult.difficulty === 'basic' ? 'Базовый' : 
                 testResult.difficulty === 'intermediate' ? 'Средний' : 
                 testResult.difficulty === 'advanced' ? 'Продвинутый' : 'Не указан'}
              </Text>
            </View>
          </View>
        </View>
        
        {/* Блок с рекомендациями */}
        {testResult.recommendations && (
          <View style={styles.recommendationsCard}>
            <Text style={styles.cardTitle}>Рекомендации</Text>
            
            {testResult.recommendations.nextSteps && testResult.recommendations.nextSteps.length > 0 && (
              <View style={styles.recommendationSection}>
                <Text style={styles.recommendationTitle}>Следующие шаги:</Text>
                {testResult.recommendations.nextSteps.map((step, index) => (
                  <View key={`step-${index}`} style={styles.recommendationItem}>
                    <Text style={styles.recommendationBullet}>•</Text>
                    <Text style={styles.recommendationText}>{step}</Text>
                  </View>
                ))}
              </View>
            )}
            
            {testResult.recommendations.suggestedTopics && testResult.recommendations.suggestedTopics.length > 0 && (
              <View style={styles.recommendationSection}>
                <Text style={styles.recommendationTitle}>Рекомендуемые темы:</Text>
                {testResult.recommendations.suggestedTopics.map((topic, index) => (
                  <View key={`topic-${index}`} style={styles.recommendationItem}>
                    <Text style={styles.recommendationBullet}>•</Text>
                    <Text style={styles.recommendationText}>{topic}</Text>
                  </View>
                ))}
              </View>
            )}
            
            {testResult.recommendations.recommendedDifficulty && (
              <View style={styles.recommendationSection}>
                <Text style={styles.recommendationTitle}>Рекомендуемый уровень сложности:</Text>
                <Text style={styles.recommendationText}>
                  {testResult.recommendations.recommendedDifficulty === 'basic' ? 'Базовый' : 
                   testResult.recommendations.recommendedDifficulty === 'intermediate' ? 'Средний' : 
                   testResult.recommendations.recommendedDifficulty === 'advanced' ? 'Продвинутый' : 'Не указан'}
                </Text>
              </View>
            )}
          </View>
        )}
        
        {/* Неправильные ответы */}
        {testResult.wrongAnswers && testResult.wrongAnswers.length > 0 && (
          <View style={styles.wrongAnswersCard}>
            <Text style={styles.cardTitle}>Вопросы с ошибками</Text>
            
            {testResult.wrongAnswers.map((item, index) => (
              <View key={`wrong-${index}`} style={styles.wrongAnswerItem}>
                <Text style={styles.questionText}>{index + 1}. {item.question}</Text>
                <View style={styles.answerRow}>
                  <Text style={styles.answerLabel}>Ваш ответ:</Text>
                  <Text style={styles.wrongAnswer}>{item.userAnswer?.toString()}</Text>
                </View>
                <View style={styles.answerRow}>
                  <Text style={styles.answerLabel}>Правильный ответ:</Text>
                  <Text style={styles.correctAnswer}>{item.correctAnswer?.toString()}</Text>
                </View>
                {item.explanation && (
                  <Text style={styles.explanationText}>{item.explanation}</Text>
                )}
              </View>
            ))}
          </View>
        )}
        
        {/* Альтернативный вариант для evaluations если wrongAnswers не определены */}
        {!testResult.wrongAnswers && testResult.evaluations && testResult.evaluations.length > 0 && (
          <View style={styles.wrongAnswersCard}>
            <Text style={styles.cardTitle}>Оценка ответов</Text>
            
            {testResult.evaluations
              .filter(item => !item.isCorrect)
              .map((item, index) => (
                <View key={`eval-${index}`} style={styles.wrongAnswerItem}>
                  <Text style={styles.questionText}>{index + 1}. {item.question}</Text>
                  <View style={styles.answerRow}>
                    <Text style={styles.answerLabel}>Ваш ответ:</Text>
                    <Text style={styles.wrongAnswer}>{item.userAnswer?.toString()}</Text>
                  </View>
                  <View style={styles.answerRow}>
                    <Text style={styles.answerLabel}>Правильный ответ:</Text>
                    <Text style={styles.correctAnswer}>{item.correctAnswer?.toString()}</Text>
                  </View>
                  {item.explanation && (
                    <Text style={styles.explanationText}>{item.explanation}</Text>
                  )}
                </View>
              ))
            }
          </View>
        )}
        
        {/* Кнопки действий */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={showCreateTrackDialog}
          >
            <Text style={styles.primaryButtonText}>Создать учебный план</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={handleShowTopicExplanation}
          >
            <Text style={styles.secondaryButtonText}>Получить объяснение темы</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={handleRetakeTest}
          >
            <Text style={styles.secondaryButtonText}>Пройти тест снова</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.tertiaryButton}
            onPress={handleGoHome}
          >
            <Text style={styles.tertiaryButtonText}>На главную</Text>
          </TouchableOpacity>
        </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  resultCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  scoreText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  assessmentText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statsContainer: {
    marginTop: 8,
  },
  statItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  statLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
  },
  recommendationsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  recommendationSection: {
    marginBottom: 16,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 8,
  },
  recommendationItem: {
    flexDirection: 'row',
    marginBottom: 4,
    paddingLeft: 8,
  },
  recommendationBullet: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginRight: 8,
  },
  recommendationText: {
    fontSize: 14,
    color: COLORS.text,
    flex: 1,
  },
  wrongAnswersCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  wrongAnswerItem: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: COLORS.background,
    borderRadius: 8,
  },
  questionText: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 10,
  },
  answerRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  answerLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginRight: 8,
    width: 120,
  },
  wrongAnswer: {
    fontSize: 14,
    color: COLORS.error,
    flex: 1,
  },
  correctAnswer: {
    fontSize: 14,
    color: '#4CAF50',
    flex: 1,
  },
  explanationText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  actionsContainer: {
    marginTop: 8,
    marginBottom: 40,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  secondaryButton: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  tertiaryButton: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  tertiaryButtonText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
});

export default LearningTestResultScreen; 