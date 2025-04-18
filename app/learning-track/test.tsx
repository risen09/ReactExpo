import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { ChevronRight, Check, AlertCircle } from 'lucide-react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useAuth } from '../hooks/useAuth';
import logger from '../utils/logger';

// Общая цветовая палитра приложения
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

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

interface TestQuestion {
  _id: string;
  question: string;
  options?: string[];
  correctAnswer?: string;
  type: 'multiple-choice' | 'open-ended' | 'self-assessment';
}

interface TestResult {
  userId: string;
  weakTopics: string[];
  successfulTopics: string[];
  score: number;
  recommendations: string[];
}

interface Test {
  _id: string;
  trackId: string;
  title: string;
  description: string;
  testType: 'T1' | 'T2';
  subject: string;
  topic: string;
  questions: TestQuestion[];
  results?: TestResult;
}

export default function TestScreen() {
  const params = useLocalSearchParams<{ testId: string }>();
  const { token } = useAuth();
  const [test, setTest] = useState<Test | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);
  
  // Получение теста
  const fetchTest = useCallback(async () => {
    if (!params.testId || !token) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/tests/${params.testId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch test data');
      }
      
      const data = await response.json();
      setTest(data);
      
      // Если тест уже имеет результаты, показываем их
      if (data.results) {
        setTestResult(data.results);
        setShowResultModal(true);
      }
    } catch (error) {
      logger.error('Error fetching test', error);
      Alert.alert('Ошибка', 'Не удалось загрузить тест');
    } finally {
      setIsLoading(false);
    }
  }, [params.testId, token]);
  
  useEffect(() => {
    fetchTest();
  }, [fetchTest]);
  
  // Обработка ответа на вопрос
  const handleAnswer = useCallback((questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  }, []);
  
  // Переход к следующему вопросу
  const handleNextQuestion = useCallback(() => {
    if (!test) return;
    
    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < test.questions.length) {
      setCurrentQuestionIndex(nextIndex);
    }
  }, [currentQuestionIndex, test]);
  
  // Переход к предыдущему вопросу
  const handlePrevQuestion = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  }, [currentQuestionIndex]);
  
  // Отправка ответов и завершение теста
  const handleSubmitTest = useCallback(async () => {
    if (!test || !token) return;
    
    // Проверяем, что на все вопросы есть ответы
    const unansweredQuestions = test.questions.filter(q => !answers[q._id]);
    
    if (unansweredQuestions.length > 0) {
      Alert.alert(
        'Внимание',
        `У вас есть ${unansweredQuestions.length} неотвеченных вопросов. Хотите завершить тест?`,
        [
          { text: 'Отмена', style: 'cancel' },
          { text: 'Завершить', onPress: submitAnswers }
        ]
      );
    } else {
      submitAnswers();
    }
    
    async function submitAnswers() {
      setIsSubmitting(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/tests/${params.testId}/submit`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ answers })
        });
        
        if (!response.ok) {
          throw new Error('Failed to submit test');
        }
        
        const result = await response.json();
        setTestResult(result);
        setShowResultModal(true);
      } catch (error) {
        logger.error('Error submitting test', error);
        Alert.alert('Ошибка', 'Не удалось отправить ответы');
      } finally {
        setIsSubmitting(false);
      }
    }
  }, [test, answers, token, params.testId]);
  
  // Проверка готовности к переходу к следующему вопросу
  const canMoveNext = useCallback(() => {
    if (!test) return false;
    
    const currentQuestion = test.questions[currentQuestionIndex];
    return !!answers[currentQuestion._id];
  }, [test, currentQuestionIndex, answers]);
  
  // Проверка, все ли вопросы отвечены
  const allQuestionsAnswered = useCallback(() => {
    if (!test) return false;
    
    return test.questions.every(q => !!answers[q._id]);
  }, [test, answers]);
  
  // Рендер текущего вопроса
  const renderCurrentQuestion = () => {
    if (!test) return null;
    
    const currentQuestion = test.questions[currentQuestionIndex];
    
    return (
      <View style={styles.questionContainer}>
        <View style={styles.questionHeader}>
          <Text style={styles.questionNumber}>
            Вопрос {currentQuestionIndex + 1} из {test.questions.length}
          </Text>
          {answers[currentQuestion._id] && (
            <View style={styles.answeredBadge}>
              <Check size={16} color="#10B981" />
              <Text style={styles.answeredText}>Отвечено</Text>
            </View>
          )}
        </View>
        
        <Text style={styles.questionText}>{currentQuestion.question}</Text>
        
        {currentQuestion.type === 'multiple-choice' && currentQuestion.options && (
          <View style={styles.optionsContainer}>
            {currentQuestion.options.map((option, index) => (
              <TouchableOpacity
                key={`${currentQuestion._id}-option-${index}`}
                style={[
                  styles.optionButton,
                  answers[currentQuestion._id] === option && styles.selectedOptionButton
                ]}
                onPress={() => handleAnswer(currentQuestion._id, option)}
              >
                <Text style={[
                  styles.optionText,
                  answers[currentQuestion._id] === option && styles.selectedOptionText
                ]}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        
        {currentQuestion.type === 'self-assessment' && currentQuestion.options && (
          <View style={styles.optionsContainer}>
            {currentQuestion.options.map((option, index) => (
              <TouchableOpacity
                key={`${currentQuestion._id}-option-${index}`}
                style={[
                  styles.optionButton,
                  answers[currentQuestion._id] === option && styles.selectedOptionButton
                ]}
                onPress={() => handleAnswer(currentQuestion._id, option)}
              >
                <Text style={[
                  styles.optionText,
                  answers[currentQuestion._id] === option && styles.selectedOptionText
                ]}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        
        {currentQuestion.type === 'open-ended' && (
          <TextInput
            style={styles.answerInput}
            multiline
            numberOfLines={6}
            placeholder="Введите ваш ответ здесь..."
            value={answers[currentQuestion._id] || ''}
            onChangeText={(text) => handleAnswer(currentQuestion._id, text)}
          />
        )}
        
        <View style={styles.navigationButtons}>
          <TouchableOpacity
            style={[styles.navButton, styles.prevButton]}
            onPress={handlePrevQuestion}
            disabled={currentQuestionIndex === 0}
          >
            <ChevronRight 
              size={20} 
              color={currentQuestionIndex === 0 ? COLORS.textSecondary : COLORS.primary} 
              style={{ transform: [{ rotate: '180deg' }] }}
            />
            <Text style={[
              styles.navButtonText,
              currentQuestionIndex === 0 && styles.disabledButtonText
            ]}>
              Назад
            </Text>
          </TouchableOpacity>
          
          {currentQuestionIndex < test.questions.length - 1 ? (
            <TouchableOpacity
              style={[styles.navButton, styles.nextButton, !canMoveNext() && styles.disabledButton]}
              onPress={handleNextQuestion}
              disabled={!canMoveNext()}
            >
              <Text style={[
                styles.navButtonText, 
                styles.nextButtonText,
                !canMoveNext() && styles.disabledButtonText
              ]}>
                Далее
              </Text>
              <ChevronRight 
                size={20} 
                color={canMoveNext() ? '#FFFFFF' : 'rgba(255, 255, 255, 0.5)'} 
              />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.navButton, styles.submitButton, isSubmitting && styles.disabledButton]}
              onPress={handleSubmitTest}
              disabled={isSubmitting}
            >
              <Text style={[styles.navButtonText, styles.submitButtonText]}>
                Завершить тест
              </Text>
              {isSubmitting && (
                <ActivityIndicator size="small" color="#FFFFFF" style={{ marginLeft: 8 }} />
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };
  
  // Рендер индикатора прогресса
  const renderProgressIndicator = () => {
    if (!test) return null;
    
    const progress = (currentQuestionIndex + 1) / test.questions.length;
    
    return (
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
      </View>
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ChevronRight size={24} color={COLORS.text} style={{ transform: [{ rotate: '180deg' }] }} />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{test?.title || 'Тест'}</Text>
          <Text style={styles.headerSubtitle}>
            {test?.testType === 'T1' ? 'Тест по теме' : 'Диагностика знаний'}
          </Text>
        </View>
      </View>
      
      {renderProgressIndicator()}
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Загрузка теста...</Text>
        </View>
      ) : !test ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Тест не найден</Text>
        </View>
      ) : (
        <ScrollView style={styles.content}>
          <View style={styles.testContainer}>
            {test.description && (
              <View style={styles.descriptionContainer}>
                <Text style={styles.descriptionText}>{test.description}</Text>
              </View>
            )}
            
            {renderCurrentQuestion()}
          </View>
        </ScrollView>
      )}
      
      {/* Модальное окно с результатами теста */}
      <Modal
        visible={showResultModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowResultModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Результаты теста</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => {
                  setShowResultModal(false);
                  router.back();
                }}
              >
                <Text style={styles.closeButtonText}>Закрыть</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              {testResult && (
                <View>
                  <View style={styles.scoreContainer}>
                    <Text style={styles.scoreValue}>{testResult.score}%</Text>
                    <Text style={styles.scoreLabel}>Результат</Text>
                  </View>
                  
                  {testResult.weakTopics.length > 0 && (
                    <View style={styles.topicsSection}>
                      <Text style={styles.topicsSectionTitle}>
                        Темы, требующие внимания:
                      </Text>
                      {testResult.weakTopics.map((topic, index) => (
                        <View key={`weak-${index}`} style={styles.topicItem}>
                          <AlertCircle size={16} color={COLORS.accent2} />
                          <Text style={styles.weakTopicText}>{topic}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                  
                  {testResult.successfulTopics.length > 0 && (
                    <View style={styles.topicsSection}>
                      <Text style={styles.topicsSectionTitle}>
                        Успешно усвоенные темы:
                      </Text>
                      {testResult.successfulTopics.map((topic, index) => (
                        <View key={`success-${index}`} style={styles.topicItem}>
                          <Check size={16} color="#10B981" />
                          <Text style={styles.successTopicText}>{topic}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                  
                  {testResult.recommendations.length > 0 && (
                    <View style={styles.recommendationsSection}>
                      <Text style={styles.recommendationsSectionTitle}>
                        Рекомендации:
                      </Text>
                      {testResult.recommendations.map((recommendation, index) => (
                        <View key={`rec-${index}`} style={styles.recommendationItem}>
                          <Text style={styles.recommendationText}>
                            {recommendation}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}
                  
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => {
                      setShowResultModal(false);
                      if (test?.trackId) {
                        router.push({
                          pathname: "/learning-track",
                          params: { trackId: test.trackId }
                        });
                      } else {
                        router.back();
                      }
                    }}
                  >
                    <Text style={styles.actionButtonText}>
                      Вернуться к учебному треку
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: 4,
  },
  headerContent: {
    marginLeft: 12,
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  progressContainer: {
    height: 4,
    backgroundColor: '#E5E7EB',
    width: '100%',
  },
  progressBar: {
    height: 4,
    backgroundColor: COLORS.primary,
  },
  content: {
    flex: 1,
  },
  testContainer: {
    padding: 16,
  },
  descriptionContainer: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  descriptionText: {
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 24,
  },
  questionContainer: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  questionNumber: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  answeredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDFCF4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  answeredText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '500',
    marginLeft: 4,
  },
  questionText: {
    fontSize: 18,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: 24,
    lineHeight: 26,
  },
  optionsContainer: {
    marginBottom: 24,
  },
  optionButton: {
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  selectedOptionButton: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10', // 10% прозрачности
  },
  optionText: {
    fontSize: 16,
    color: COLORS.text,
  },
  selectedOptionText: {
    color: COLORS.primary,
    fontWeight: '500',
  },
  answerInput: {
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: COLORS.text,
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: 24,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  navButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  prevButton: {
    backgroundColor: '#F1F5F9',
    marginRight: 8,
  },
  nextButton: {
    backgroundColor: COLORS.primary,
    marginLeft: 8,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    marginLeft: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  nextButtonText: {
    color: '#FFFFFF',
  },
  submitButtonText: {
    color: '#FFFFFF',
  },
  disabledButtonText: {
    color: COLORS.textSecondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    width: '90%',
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },
  modalBody: {
    padding: 16,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  scoreLabel: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  topicsSection: {
    marginBottom: 24,
  },
  topicsSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  topicItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  weakTopicText: {
    fontSize: 16,
    color: COLORS.text,
    marginLeft: 8,
  },
  successTopicText: {
    fontSize: 16,
    color: COLORS.text,
    marginLeft: 8,
  },
  recommendationsSection: {
    marginBottom: 24,
  },
  recommendationsSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  recommendationItem: {
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  recommendationText: {
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 24,
  },
  actionButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
}); 