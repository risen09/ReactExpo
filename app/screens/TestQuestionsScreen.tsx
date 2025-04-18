import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  ActivityIndicator,
  Alert 
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import COLORS from '@/app/config/colors';
import apiClient from '@/app/api/client';
import aiTestService from '@/app/services/aiTestService';

// Типы для тестовых вопросов (из TestScreen.tsx)
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
  timeLimit?: number;
  questions: TestQuestion[];
  subject: string;
  topic: string;
  difficulty: 'basic' | 'intermediate' | 'advanced';
}

// Тип для ответов пользователя
interface UserAnswers {
  [questionId: string]: string | string[] | number;
}

// Тип для результатов оценки
interface EvaluationResults {
  score: number;
  maxScore: number;
  percentage: number;
  correctAnswers: number;
  totalQuestions: number;
  evaluations: {
    questionId: string;
    question: string;
    userAnswer: any;
    isCorrect: boolean;
    correctAnswer: any;
    explanation?: string;
  }[];
  recommendations: {
    nextSteps: string[];
    suggestedTopics: string[];
    recommendedDifficulty: 'basic' | 'intermediate' | 'advanced';
  };
}

const TestQuestionsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  
  // Получаем тест из параметров навигации
  const { test } = route.params as { test: Test };
  
  // Состояния для управления отображением вопросов и ответов
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswers>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false); // Состояние для отслеживания процесса оценки
  
  // Вычисляем текущий вопрос
  const currentQuestion = test?.questions[currentQuestionIndex];
  
  // Обработчик ответа на вопрос с одним вариантом
  const handleSingleChoiceAnswer = (option: string) => {
    if (!currentQuestion) return;
    
    setUserAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: option
    }));
  };
  
  // Обработчик ответа на вопрос с несколькими вариантами
  const handleMultipleChoiceAnswer = (option: string) => {
    if (!currentQuestion) return;
    
    setUserAnswers(prev => {
      const currentAnswers = (prev[currentQuestion.id] as string[]) || [];
      
      // Если опция уже выбрана, убираем её
      if (currentAnswers.includes(option)) {
        return {
          ...prev,
          [currentQuestion.id]: currentAnswers.filter(item => item !== option)
        };
      } 
      // Иначе добавляем
      else {
        return {
          ...prev,
          [currentQuestion.id]: [...currentAnswers, option]
        };
      }
    });
  };
  
  // Обработчик ввода текстового ответа
  const handleTextAnswer = (text: string) => {
    if (!currentQuestion) return;
    
    setUserAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: text
    }));
  };
  
  // Обработчик ввода числового ответа
  const handleNumberAnswer = (text: string) => {
    if (!currentQuestion) return;
    
    const numValue = parseFloat(text);
    if (!isNaN(numValue)) {
      setUserAnswers(prev => ({
        ...prev,
        [currentQuestion.id]: numValue
      }));
    } else if (text === '') {
      // Если поле пустое, удаляем ответ
      const { [currentQuestion.id]: _, ...rest } = userAnswers;
      setUserAnswers(rest);
    }
  };
  
  // Проверка, отвечен ли текущий вопрос
  const isCurrentQuestionAnswered = () => {
    if (!currentQuestion) return false;
    
    const answer = userAnswers[currentQuestion.id];
    
    if (currentQuestion.type === 'multiple_choice') {
      return Array.isArray(answer) && answer.length > 0;
    }
    
    return answer !== undefined && answer !== '';
  };
  
  // Оценка текущего ответа с помощью AI перед переходом к следующему вопросу
  const evaluateCurrentAnswer = async () => {
    if (!currentQuestion || !isCurrentQuestionAnswered()) return true;
    
    setIsEvaluating(true);
    
    try {
      const evaluationResult = await aiTestService.evaluateAnswer({
        subject: test.subject,
        topic: test.topic,
        question: currentQuestion.question,
        answer: userAnswers[currentQuestion.id],
        questionType: currentQuestion.type
      });
      
      // Если ответ неверный, показываем пользователю объяснение
      if (!evaluationResult.isCorrect) {
        Alert.alert(
          'Неверный ответ',
          `${evaluationResult.explanation}\n\nПравильный ответ: ${evaluationResult.correctAnswer || 'Не указан'}`,
          [
            {
              text: 'Понятно, перейти к следующему вопросу',
              onPress: () => goToNextQuestion()
            }
          ]
        );
        return false;
      }
      
      return true;
    } catch (err) {
      console.error('Ошибка при оценке ответа:', err);
      // В случае ошибки, просто продолжаем
      return true;
    } finally {
      setIsEvaluating(false);
    }
  };
  
  // Переход к следующему вопросу
  const goToNextQuestion = () => {
    if (currentQuestionIndex < test.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };
  
  // Переход к следующему вопросу с оценкой текущего ответа
  const handleNextQuestion = async () => {
    // Оцениваем текущий ответ, и если всё в порядке, переходим к следующему вопросу
    const shouldProceed = await evaluateCurrentAnswer();
    if (shouldProceed) {
      goToNextQuestion();
    }
  };
  
  // Переход к предыдущему вопросу
  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };
  
  // Проверка, все ли вопросы отвечены
  const areAllQuestionsAnswered = () => {
    if (!test || !test.questions) return false;
    
    return test.questions.every(question => {
      const answer = userAnswers[question.id];
      
      if (question.type === 'multiple_choice') {
        return Array.isArray(answer) && answer.length > 0;
      }
      
      return answer !== undefined && answer !== '';
    });
  };
  
  // Отправка ответов на сервер и оценка с помощью AI
  const handleSubmitTest = async () => {
    if (!test || isSubmitting) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      console.log('TestQuestionsScreen: Начало отправки ответов на тест:', {
        test: { id: test.id, subject: test.subject, topic: test.topic },
        userAnswersCount: Object.keys(userAnswers).length
      });
      
      // Оцениваем результаты теста с использованием AI
      const aiResults = await aiTestService.evaluateTestResults(
        test.subject,
        test.topic,
        test.questions,
        userAnswers
      );
      
      console.log('TestQuestionsScreen: Получены результаты AI оценки:', {
        score: aiResults.score,
        maxScore: aiResults.maxScore,
        percentage: aiResults.percentage
      });
      
      // Попытка отправить результаты на сервер
      try {
        // Исправляем формат передачи ответов согласно ожиданиям API
        const answersArray = Object.entries(userAnswers).map(([questionId, answer]) => ({
          questionId,
          answer
        }));
        
        await apiClient.tests.submit(test.id, answersArray);
        console.log('TestQuestionsScreen: Результаты успешно отправлены на сервер');
      } catch (apiError) {
        console.warn('Не удалось отправить результаты на сервер:', apiError);
        // Продолжаем работу даже если не удалось отправить на сервер
      }
      
      console.log('TestQuestionsScreen: Переход на экран результатов с параметрами:', {
        testId: test.id,
        subject: test.subject,
        topic: test.topic,
        resultScore: aiResults.score
      });
      
      // Добавляем небольшую задержку перед навигацией для стабильности
      setTimeout(() => {
        // Переходим на экран результатов с результатами AI-оценки
        // @ts-ignore - игнорируем для простоты
        navigation.navigate('test-result', { 
          testId: test.id,
          result: aiResults,
          subject: test.subject,
          topic: test.topic
        });
      }, 300);
    } catch (err) {
      console.error('Ошибка при отправке ответов на тест:', err);
      setError('Не удалось обработать ответы. Попробуйте ещё раз.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Если тест не загружен
  if (!test || !test.questions || test.questions.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Тест не найден или не содержит вопросов</Text>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Вернуться назад</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  // Если текущего вопроса нет
  if (!currentQuestion) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Вопрос не найден</Text>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Вернуться к списку тестов</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  // Рендер вопроса в зависимости от типа
  const renderQuestion = () => {
    if (!currentQuestion) return null;
    
    return (
      <View style={styles.questionContainer}>
        <Text style={styles.questionNumber}>
          Вопрос {currentQuestionIndex + 1} из {test.questions.length}
        </Text>
        
        <Text style={styles.questionText}>{currentQuestion.question}</Text>
        
        {/* Однозначный выбор */}
        {currentQuestion.type === 'single_choice' && (
          <View style={styles.optionsContainer}>
            {currentQuestion.options?.map((option, index) => (
              <TouchableOpacity
                key={`option-${index}`}
                style={[
                  styles.optionButton,
                  userAnswers[currentQuestion.id] === option && styles.selectedOption
                ]}
                onPress={() => handleSingleChoiceAnswer(option)}
              >
                <Text style={[
                  styles.optionText,
                  userAnswers[currentQuestion.id] === option && styles.selectedOptionText
                ]}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        
        {/* Множественный выбор */}
        {currentQuestion.type === 'multiple_choice' && (
          <View style={styles.optionsContainer}>
            {currentQuestion.options?.map((option, index) => {
              const isSelected = Array.isArray(userAnswers[currentQuestion.id]) && 
                (userAnswers[currentQuestion.id] as string[])?.includes(option);
              
              return (
                <TouchableOpacity
                  key={`option-${index}`}
                  style={[
                    styles.optionButton,
                    isSelected && styles.selectedOption
                  ]}
                  onPress={() => handleMultipleChoiceAnswer(option)}
                >
                  <Text style={[
                    styles.optionText,
                    isSelected && styles.selectedOptionText
                  ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
        
        {/* Текстовый ответ */}
        {currentQuestion.type === 'text' && (
          <TextInput
            style={styles.textInput}
            multiline
            placeholder="Введите ваш ответ..."
            value={userAnswers[currentQuestion.id] as string || ''}
            onChangeText={handleTextAnswer}
          />
        )}
        
        {/* Числовой ответ */}
        {currentQuestion.type === 'number' && (
          <TextInput
            style={styles.numberInput}
            placeholder="Введите число..."
            keyboardType="numeric"
            value={(userAnswers[currentQuestion.id] as number)?.toString() || ''}
            onChangeText={handleNumberAnswer}
          />
        )}
      </View>
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>{test.title || 'Диагностический тест'}</Text>
        </View>
        
        {renderQuestion()}
        
        {error && (
          <Text style={styles.errorMessage}>{error}</Text>
        )}
        
        <View style={styles.navigationButtons}>
          <TouchableOpacity
            style={[
              styles.navigationButton,
              currentQuestionIndex === 0 && styles.disabledButton
            ]}
            onPress={goToPreviousQuestion}
            disabled={currentQuestionIndex === 0}
          >
            <Text style={styles.navigationButtonText}>Назад</Text>
          </TouchableOpacity>
          
          {currentQuestionIndex < test.questions.length - 1 ? (
            <TouchableOpacity
              style={[
                styles.navigationButton,
                (!isCurrentQuestionAnswered() || isEvaluating) && styles.disabledButton
              ]}
              onPress={handleNextQuestion}
              disabled={!isCurrentQuestionAnswered() || isEvaluating}
            >
              {isEvaluating ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.navigationButtonText}>Далее</Text>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[
                styles.submitButton,
                (!isCurrentQuestionAnswered() || !areAllQuestionsAnswered() || isSubmitting) && styles.disabledButton
              ]}
              onPress={handleSubmitTest}
              disabled={!isCurrentQuestionAnswered() || !areAllQuestionsAnswered() || isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>Завершить тест</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.progressContainer}>
          {test.questions.map((_, index) => (
            <View
              key={`progress-${index}`}
              style={[
                styles.progressDot,
                index === currentQuestionIndex && styles.activeProgressDot,
                userAnswers[test.questions[index].id] !== undefined && styles.answeredProgressDot
              ]}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex:.1,
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
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
  },
  questionContainer: {
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
  questionNumber: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 16,
  },
  optionsContainer: {
    marginTop: 8,
  },
  optionButton: {
    backgroundColor: COLORS.background,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  selectedOption: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  optionText: {
    fontSize: 16,
    color: COLORS.text,
  },
  selectedOptionText: {
    color: COLORS.white,
  },
  textInput: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  numberInput: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  navigationButton: {
    backgroundColor: COLORS.secondary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 0.48,
    alignItems: 'center',
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 0.48,
    alignItems: 'center',
  },
  navigationButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.border,
    margin: 4,
  },
  activeProgressDot: {
    backgroundColor: COLORS.primary,
    width: 12,
    height: 12,
  },
  answeredProgressDot: {
    backgroundColor: COLORS.secondary,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 16,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  errorMessage: {
    color: COLORS.error,
    marginBottom: 16,
    textAlign: 'center',
  },
});

export default TestQuestionsScreen; 