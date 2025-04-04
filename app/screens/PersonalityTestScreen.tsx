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
import { MaterialIcons } from '@expo/vector-icons';
import { mbtiQuestions } from '../data';
import QuestionCard from '../components/QuestionCard';
import ResultsCard from '../components/ResultsCard';
import ProgressBar from '../components/ProgressBar';
import { calculateMBTIScores, determineMBTIType, calculateProgress } from '../utils/mbtiCalculator';
import { MBTIScores, mbtiDescriptions } from '../types/personalityTest';
import { useAuth } from '../hooks/useAuth';

// API configuration
const API_BASE_URL = 'https://j0cl9aplcsh5.share.zrok.io';

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
        contentContainerStyle={styles.scrollContent}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.loadingText}>Анализируем ваши ответы...</Text>
          </View>
        ) : testComplete && personalityType && description ? (
          <>
            <ResultsCard
              personalityType={personalityType}
              description={description}
              scores={scores || undefined}
              onRestart={restartTest}
            />
            <TouchableOpacity
              style={styles.returnButton}
              onPress={returnToProfile}
            >
              <MaterialIcons name="arrow-back" size={18} color="#4CAF50" />
              <Text style={styles.returnButtonText}>Вернуться в профиль</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <View style={styles.progressSection}>
              <Text style={styles.progressText}>
                Вопрос {currentQuestionIndex + 1} из {mbtiQuestions.length}
              </Text>
              <ProgressBar progress={progress} height={6} fillColor="#4CAF50" />
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
                <MaterialIcons
                  name="arrow-back"
                  size={18}
                  color={currentQuestionIndex === 0 ? '#bbb' : '#333'}
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
                <MaterialIcons
                  name="arrow-forward"
                  size={18}
                  color={!isCurrentQuestionAnswered ? '#bbb' : 'white'}
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
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 16,
  },
  progressSection: {
    marginBottom: 16,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 16,
  },
  categoryText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 12,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 32,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  backButton: {
    backgroundColor: '#f0f0f0',
  },
  nextButton: {
    backgroundColor: '#4CAF50',
  },
  disabledButton: {
    backgroundColor: '#e0e0e0',
  },
  navButtonText: {
    fontWeight: '600',
    fontSize: 15,
    marginHorizontal: 4,
  },
  nextButtonText: {
    color: 'white',
  },
  disabledButtonText: {
    color: '#bbb',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
  },
  returnButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    padding: 12,
  },
  returnButtonText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default PersonalityTestScreen; 