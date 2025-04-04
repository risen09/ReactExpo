import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { mbtiQuestions } from '../data';
import QuestionCard from '../components/QuestionCard';
import ResultsCard from '../components/ResultsCard';
import ProgressBar from '../components/ProgressBar';
import { calculateMBTIScores, determineMBTIType, calculateProgress } from '../utils/mbtiCalculator';
import { MBTIScores, mbtiDescriptions } from '../types/personalityTest';
import { useAuth } from '../hooks/useAuth';

const COLORS = {
  primary: '#5B67CA',     // Основной синий/фиолетовый
  secondary: '#43C0B4',   // Бирюзовый
  accent1: '#F98D51',     // Оранжевый
  accent2: '#EC575B',     // Красный
  background: '#F2F5FF',  // Светлый фон
  card: '#FFFFFF',        // Белый для карточек
  text: '#25335F',        // Основной текст
  textSecondary: '#7F8BB7',  // Вторичный текст
  border: '#EAEDF5'       // Граница
};

const PersonalityTestScreen: React.FC = () => {
  const { user, updatePersonalityType } = useAuth();
  const params = useLocalSearchParams();
  const showResults = params.showResults === 'true';
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [testComplete, setTestComplete] = useState(false);
  const [personalityType, setPersonalityType] = useState<string | null>(null);
  const [description, setDescription] = useState<string | null>(null);
  const [scores, setScores] = useState<MBTIScores | null>(null);
  
  // Создаем ref для ScrollView
  const scrollViewRef = useRef<ScrollView>(null);
  
  // При загрузке компонента проверяем, есть ли у пользователя сохраненный тип личности
  useEffect(() => {
    if (showResults && user?.personalityType) {
      // Если нужно показать результаты и тип личности есть, подготовим его
      const type = user.personalityType;
      setPersonalityType(type);
      
      // Получаем описание для типа
      const typeDescription = mbtiDescriptions[type] || 
        'Описание для этого типа личности еще не добавлено.';
      setDescription(typeDescription);
      
      // TODO: В будущем можно добавить загрузку полных результатов теста
      // А пока просто показываем тип
      setTestComplete(true);
    }
  }, [user, showResults]);
  
  // Function to select an answer
  const selectAnswer = (value: number) => {
    const currentQuestion = mbtiQuestions[currentQuestionIndex];
    
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: value,
    }));
  };

  // Navigate to the next question
  const goToNextQuestion = () => {
    if (currentQuestionIndex < mbtiQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      // Плавно скроллим вверх вместо window.scrollTo
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    } else {
      completeTest();
    }
  };

  // Navigate to the previous question
  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
      // Плавно скроллим вверх вместо window.scrollTo
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }
  };

  // Function to complete the test and calculate results
  const completeTest = async () => {
    setLoading(true);
    
    try {
      // Calculate MBTI scores
      const mbtiScores = calculateMBTIScores(answers);
      setScores(mbtiScores);
      
      // Determine personality type
      const type = determineMBTIType(mbtiScores);
      setPersonalityType(type);
      
      // Get description for the type
      const typeDescription = mbtiDescriptions[type] || 
        'Описание для этого типа личности еще не добавлено.';
      setDescription(typeDescription);
      
      // Сохраняем тип личности в профиле пользователя
      if (type) {
        await updatePersonalityType(type);
      }
      
      setTestComplete(true);
    } catch (error) {
      console.error('Test completion error:', error);
      Alert.alert('Ошибка', 'Не удалось обработать результаты теста');
    } finally {
      setLoading(false);
    }
  };

  // Restart the test
  const restartTest = () => {
    setAnswers({});
    setCurrentQuestionIndex(0);
    setTestComplete(false);
    setPersonalityType(null);
    setDescription(null);
    setScores(null);
  };

  // Return to profile screen
  const returnToProfile = () => {
    router.back();
  };

  // Navigate to test results
  const viewResults = () => {
    if (personalityType) {
      router.push(`/test-result?type=${personalityType}`);
    }
  };

  // Calculate current progress
  const progress = calculateProgress(currentQuestionIndex, mbtiQuestions.length);
  
  // Get current question
  const currentQuestion = mbtiQuestions[currentQuestionIndex];
  
  // Check if the current question has been answered
  const isCurrentQuestionAnswered = currentQuestion && answers[currentQuestion.id] !== undefined;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        ref={scrollViewRef} 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Анализируем ваши ответы...</Text>
          </View>
        ) : testComplete && personalityType && description ? (
          <View style={styles.resultsContainer}>
            <ResultsCard
              personalityType={personalityType}
              description={description}
              scores={scores || undefined}
              onRestart={restartTest}
            />
            
            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity
                style={[styles.actionButton, styles.viewResultsButton]}
                onPress={viewResults}
              >
                <Text style={styles.buttonText}>Посмотреть результаты</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.actionButton, styles.returnButton]}
                onPress={returnToProfile}
              >
                <Text style={styles.buttonText}>Вернуться в профиль</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <>
            <View style={styles.progressSection}>
              <Text style={styles.progressText}>
                Вопрос {currentQuestionIndex + 1} из {mbtiQuestions.length}
              </Text>
              <ProgressBar progress={progress} height={6} fillColor={COLORS.primary} />
            </View>

            {currentQuestion && (
              <>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{currentQuestion.category}</Text>
                </View>
              
                <QuestionCard
                  question={currentQuestion}
                  selectedValue={answers[currentQuestion.id] || null}
                  onSelect={selectAnswer}
                />
              </>
            )}

            <View style={styles.navigationButtons}>
              <TouchableOpacity
                style={[styles.navButton, styles.backButton]}
                onPress={goToPreviousQuestion}
                disabled={currentQuestionIndex === 0}
              >
                <ChevronLeft
                  size={20}
                  color={currentQuestionIndex === 0 ? COLORS.textSecondary : COLORS.text}
                />
                <Text
                  style={[
                    styles.navButtonText,
                    currentQuestionIndex === 0 && styles.disabledButtonText,
                  ]}
                >
                  Назад
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.navButton,
                  styles.nextButton,
                  !isCurrentQuestionAnswered && styles.disabledButton,
                ]}
                onPress={goToNextQuestion}
                disabled={!isCurrentQuestionAnswered}
              >
                <Text
                  style={[
                    styles.navButtonText,
                    styles.nextButtonText,
                    !isCurrentQuestionAnswered && styles.disabledButtonText,
                  ]}
                >
                  {currentQuestionIndex === mbtiQuestions.length - 1
                    ? 'Завершить тест'
                    : 'Далее'}
                </Text>
                <ChevronRight
                  size={20}
                  color={!isCurrentQuestionAnswered ? COLORS.textSecondary : '#FFFFFF'}
                />
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: 20,
  },
  progressSection: {
    marginBottom: 20,
  },
  progressText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginBottom: 20,
  },
  categoryText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 32,
    marginBottom: 24,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
  },
  backButton: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  nextButton: {
    backgroundColor: COLORS.primary,
  },
  disabledButton: {
    backgroundColor: COLORS.textSecondary,
    opacity: 0.6,
  },
  navButtonText: {
    fontWeight: '600',
    fontSize: 16,
    marginHorizontal: 8,
    color: COLORS.text,
  },
  nextButtonText: {
    color: '#FFFFFF',
  },
  disabledButtonText: {
    color: '#FFFFFF',
    opacity: 0.7,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: COLORS.text,
    textAlign: 'center',
  },
  resultsContainer: {
    padding: 20,
  },
  actionButtonsContainer: {
    marginTop: 24,
  },
  actionButton: {
    borderRadius: 12,
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  viewResultsButton: {
    backgroundColor: COLORS.primary,
  },
  returnButton: {
    backgroundColor: COLORS.accent1,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PersonalityTestScreen; 