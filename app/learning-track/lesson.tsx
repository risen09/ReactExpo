import { useLocalSearchParams, router } from 'expo-router';
import { Star, ChevronRight, Check, BookOpen, Award } from 'lucide-react-native';
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
  ViewStyle,
  TextStyle,
} from 'react-native';
import Markdown from 'react-native-markdown-display';

import { useAuth } from '../../hooks/useAuth';
import logger from '../../utils/logger';

// Общая цветовая палитра приложения
const COLORS = {
  primary: '#5B67CA', // Основной синий/фиолетовый
  secondary: '#43C0B4', // Бирюзовый
  accent1: '#F98D51', // Оранжевый
  accent2: '#EC575B', // Красный
  accent3: '#FFCA42', // Желтый
  background: '#F2F5FF', // Светлый фон
  card: '#FFFFFF', // Белый для карточек
  text: '#25335F', // Основной текст
  textSecondary: '#7F8BB7', // Вторичный текст
  border: '#EAEDF5', // Граница
};

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

interface Example {
  _id: string;
  title: string;
  content: string;
  solution: string;
}

interface Assignment {
  _id: string;
  question: string;
  difficulty: 1 | 2 | 3;
  solution?: string;
  userAnswer?: string;
  isCorrect?: boolean;
}

interface Lesson {
  _id: string;
  trackId: string;
  title: string;
  content: string;
  difficulty: 1 | 2 | 3;
  stars: 0 | 1 | 2 | 3;
  assignments: Assignment[];
  examples: Example[];
  completed: boolean;
}

// Add type definition for your styles
interface LessonStyles {
  container: ViewStyle;
  header: ViewStyle;
  loadingContainer: ViewStyle;
  loadingText: TextStyle;
  emptyContainer: ViewStyle;
  emptyText: TextStyle;
  assignmentCard: ViewStyle;
  completedAssignmentCard: ViewStyle;
  contentContainer: ViewStyle;
  // ... continue with all other styles
}

export default function LessonScreen() {
  const params = useLocalSearchParams<{ lessonId: string }>();
  const { token } = useAuth();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'content' | 'assignments' | 'examples'>('content');
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSolutionModal, setShowSolutionModal] = useState(false);
  const [showExampleModal, setShowExampleModal] = useState(false);
  const [selectedExample, setSelectedExample] = useState<Example | null>(null);
  const [showAwardModal, setShowAwardModal] = useState(false);
  const [earnedStars, setEarnedStars] = useState(0);

  // Получение урока
  const fetchLesson = useCallback(async () => {
    if (!params.lessonId || !token) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/lessons/${params.lessonId}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch lesson data');
      }

      const data = await response.json();
      setLesson(data);
    } catch (error) {
      logger.error('Error fetching lesson', error);
      Alert.alert('Ошибка', 'Не удалось загрузить урок');
    } finally {
      setIsLoading(false);
    }
  }, [params.lessonId, token]);

  useEffect(() => {
    fetchLesson();
  }, [fetchLesson]);

  // Проверка задания
  const handleCheckAnswer = useCallback(async () => {
    if (!selectedAssignment || !userAnswer.trim() || !token) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/lessons/${params.lessonId}/assignment/${selectedAssignment._id}/check`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ userAnswer }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to check answer');
      }

      const data = await response.json();

      // Обновляем данные задания в уроке
      if (lesson) {
        const updatedAssignments = lesson.assignments.map(assignment =>
          assignment._id === selectedAssignment._id
            ? { ...assignment, isCorrect: data.isCorrect, userAnswer }
            : assignment
        );

        setLesson({ ...lesson, assignments: updatedAssignments });

        // Если ответ правильный и заработаны новые звезды
        if (data.isCorrect && data.stars > lesson.stars) {
          setEarnedStars(data.stars);
          setShowAwardModal(true);

          // Обновляем звезды урока
          setLesson(prev => (prev ? { ...prev, stars: data.stars as 0 | 1 | 2 | 3 } : null));
        }
      }

      // Показываем результат
      Alert.alert(data.isCorrect ? 'Правильно!' : 'Неправильно', data.feedback, [
        {
          text: 'OK',
          onPress: () => {
            if (data.isCorrect) {
              setSelectedAssignment(null);
              setUserAnswer('');
            }
          },
        },
      ]);
    } catch (error) {
      logger.error('Error checking answer', error);
      Alert.alert('Ошибка', 'Не удалось проверить ответ');
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedAssignment, userAnswer, token, params.lessonId, lesson]);

  // Завершение урока
  const handleCompleteLesson = useCallback(async () => {
    if (!lesson || !token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/lessons/${params.lessonId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ completed: true }),
      });

      if (!response.ok) {
        throw new Error('Failed to complete lesson');
      }

      setLesson(prev => (prev ? { ...prev, completed: true } : null));

      Alert.alert('Поздравляем!', 'Урок успешно завершен!');
    } catch (error) {
      logger.error('Error completing lesson', error);
      Alert.alert('Ошибка', 'Не удалось отметить урок как завершенный');
    }
  }, [lesson, token, params.lessonId]);

  // Выбор задания для решения
  const handleSelectAssignment = useCallback((assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setUserAnswer(assignment.userAnswer || '');
  }, []);

  // Показ решения примера
  const handleShowExample = useCallback((example: Example) => {
    setSelectedExample(example);
    setShowExampleModal(true);
  }, []);

  // Рендер содержимого урока
  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={(styles as any).loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={(styles as any).loadingText}>Загрузка урока...</Text>
        </View>
      );
    }

    if (!lesson) {
      return (
        <View style={(styles as any).emptyContainer}>
          <Text style={(styles as any).emptyText}>Урок не найден</Text>
        </View>
      );
    }

    switch (activeTab) {
      case 'content':
        return (
          <View style={(styles as any).contentContainer}>
            <Markdown style={markdownStyles}>{lesson.content}</Markdown>

            <TouchableOpacity
              style={[
                (styles as any).completeButton,
                lesson?.completed && { backgroundColor: '#10B981' },
              ]}
              onPress={handleCompleteLesson}
              disabled={lesson.completed}
            >
              <Text style={(styles as any).completeButtonText}>
                {lesson.completed ? 'Урок завершен' : 'Завершить урок'}
              </Text>
              {lesson.completed && <Check size={18} color="#FFFFFF" style={{ marginLeft: 8 }} />}
            </TouchableOpacity>
          </View>
        );

      case 'assignments':
        return (
          <View style={(styles as any).assignmentsContainer}>
            {selectedAssignment ? (
              <View style={(styles as any).assignmentDetailContainer}>
                <View style={(styles as any).assignmentHeader}>
                  <TouchableOpacity
                    style={(styles as any).backToAssignments}
                    onPress={() => {
                      setSelectedAssignment(null);
                      setUserAnswer('');
                    }}
                  >
                    <ChevronRight
                      size={20}
                      color={COLORS.primary}
                      style={{ transform: [{ rotate: '180deg' }] }}
                    />
                    <Text style={(styles as any).backToAssignmentsText}>К списку</Text>
                  </TouchableOpacity>

                  <View style={(styles as any).difficultyBadge}>
                    <Text style={(styles as any).difficultyText}>
                      {selectedAssignment.difficulty === 1
                        ? 'Легкий'
                        : selectedAssignment.difficulty === 2
                          ? 'Средний'
                          : 'Сложный'}
                    </Text>
                  </View>
                </View>

                <View style={(styles as any).questionContainer}>
                  <Text style={(styles as any).questionText}>{selectedAssignment.question}</Text>
                </View>

                <TextInput
                  style={(styles as any).answerInput}
                  multiline
                  numberOfLines={6}
                  placeholder="Введите ваш ответ здесь..."
                  value={userAnswer}
                  onChangeText={setUserAnswer}
                  editable={!isSubmitting}
                />

                <View style={(styles as any).actionButtons}>
                  {selectedAssignment.isCorrect === false && selectedAssignment.solution && (
                    <TouchableOpacity
                      style={(styles as any).solutionButton}
                      onPress={() => setShowSolutionModal(true)}
                    >
                      <Text style={(styles as any).solutionButtonText}>Посмотреть решение</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={(styles as any).checkButton}
                    onPress={handleCheckAnswer}
                    disabled={isSubmitting || !userAnswer.trim()}
                  >
                    <Text style={(styles as any).checkButtonText}>Проверить</Text>
                    {isSubmitting && (
                      <ActivityIndicator size="small" color="#FFFFFF" style={{ marginLeft: 8 }} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View>
                <Text style={(styles as any).assignmentsTitle}>
                  Выберите задание для выполнения:
                </Text>

                {lesson.assignments.map(assignment => (
                  <TouchableOpacity
                    key={assignment._id}
                    style={[
                      (styles as any).assignmentCard,
                      assignment.isCorrect && (styles as any).completedAssignmentCard,
                    ]}
                    onPress={() => handleSelectAssignment(assignment)}
                  >
                    <View style={(styles as any).assignmentCardContent}>
                      <View style={(styles as any).assignmentCardHeader}>
                        <Text style={(styles as any).assignmentCardTitle} numberOfLines={1}>
                          {`Задание ${assignment.difficulty === 1 ? '★' : assignment.difficulty === 2 ? '★★' : '★★★'}`}
                        </Text>

                        {assignment.isCorrect && (
                          <View style={(styles as any).correctBadge}>
                            <Check size={16} color="#10B981" />
                            <Text style={(styles as any).correctBadgeText}>Решено</Text>
                          </View>
                        )}
                      </View>

                      <Text style={(styles as any).assignmentCardDescription} numberOfLines={2}>
                        {assignment.question}
                      </Text>
                    </View>

                    <ChevronRight size={20} color={COLORS.textSecondary} />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        );

      case 'examples':
        return (
          <View style={(styles as any).examplesContainer}>
            <Text style={(styles as any).examplesTitle}>Примеры с решениями:</Text>

            {lesson.examples.map(example => (
              <TouchableOpacity
                key={example._id}
                style={(styles as any).exampleCard}
                onPress={() => handleShowExample(example)}
              >
                <View style={(styles as any).exampleCardContent}>
                  <Text style={(styles as any).exampleCardTitle}>{example.title}</Text>
                  <Text style={(styles as any).exampleCardDescription} numberOfLines={2}>
                    {example.content}
                  </Text>
                </View>

                <ChevronRight size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            ))}
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={(styles as any).container}>
      <View style={(styles as any).header}>
        <TouchableOpacity style={(styles as any).backButton} onPress={() => router.back()}>
          <ChevronRight
            size={24}
            color={COLORS.text}
            style={{ transform: [{ rotate: '180deg' }] }}
          />
        </TouchableOpacity>

        <View style={(styles as any).headerContent}>
          <Text style={(styles as any).headerTitle}>{lesson?.title || 'Урок'}</Text>
          <View style={(styles as any).starsContainer}>
            {Array.from({ length: 3 }).map((_, i) => (
              <Star
                key={`star-${i}`}
                size={18}
                color={lesson && i < lesson.stars ? COLORS.accent3 : '#D1D5DB'}
                fill={lesson && i < lesson.stars ? COLORS.accent3 : 'none'}
              />
            ))}
          </View>
        </View>
      </View>

      <View style={(styles as any).tabsContainer}>
        <TouchableOpacity
          style={[(styles as any).tabButton, activeTab === 'content' && (styles as any).activeTab]}
          onPress={() => setActiveTab('content')}
        >
          <BookOpen
            size={18}
            color={activeTab === 'content' ? COLORS.primary : COLORS.textSecondary}
          />
          <Text
            style={[
              (styles as any).tabText,
              activeTab === 'content' && (styles as any).activeTabText,
            ]}
          >
            Содержание
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            (styles as any).tabButton,
            activeTab === 'assignments' && (styles as any).activeTab,
          ]}
          onPress={() => setActiveTab('assignments')}
        >
          <Star
            size={18}
            color={activeTab === 'assignments' ? COLORS.primary : COLORS.textSecondary}
          />
          <Text
            style={[
              (styles as any).tabText,
              activeTab === 'assignments' && (styles as any).activeTabText,
            ]}
          >
            Задания
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[(styles as any).tabButton, activeTab === 'examples' && (styles as any).activeTab]}
          onPress={() => setActiveTab('examples')}
        >
          <Award
            size={18}
            color={activeTab === 'examples' ? COLORS.primary : COLORS.textSecondary}
          />
          <Text
            style={[
              (styles as any).tabText,
              activeTab === 'examples' && (styles as any).activeTabText,
            ]}
          >
            Примеры
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={(styles as any).content}>{renderContent()}</ScrollView>

      {/* Модальное окно с решением */}
      <Modal
        visible={showSolutionModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSolutionModal(false)}
      >
        <View style={(styles as any).modalContainer}>
          <View style={(styles as any).modalContent}>
            <View style={(styles as any).modalHeader}>
              <Text style={(styles as any).modalTitle}>Решение</Text>
              <TouchableOpacity
                style={(styles as any).closeButton}
                onPress={() => setShowSolutionModal(false)}
              >
                <Text style={(styles as any).closeButtonText}>Закрыть</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={(styles as any).modalBody}>
              <Text style={(styles as any).solutionText}>
                {selectedAssignment?.solution || 'Решение не найдено'}
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Модальное окно с примером */}
      <Modal
        visible={showExampleModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowExampleModal(false)}
      >
        <View style={(styles as any).modalContainer}>
          <View style={(styles as any).modalContent}>
            <View style={(styles as any).modalHeader}>
              <Text style={(styles as any).modalTitle}>{selectedExample?.title || 'Пример'}</Text>
              <TouchableOpacity
                style={(styles as any).closeButton}
                onPress={() => setShowExampleModal(false)}
              >
                <Text style={(styles as any).closeButtonText}>Закрыть</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={(styles as any).modalBody}>
              <View style={(styles as any).exampleSection}>
                <Text style={(styles as any).exampleSectionTitle}>Условие:</Text>
                <Text style={(styles as any).exampleContent}>{selectedExample?.content || ''}</Text>
              </View>

              <View style={(styles as any).exampleSection}>
                <Text style={(styles as any).exampleSectionTitle}>Решение:</Text>
                <Text style={(styles as any).exampleContent}>
                  {selectedExample?.solution || ''}
                </Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Модальное окно с наградой */}
      <Modal
        visible={showAwardModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAwardModal(false)}
      >
        <View style={(styles as any).modalContainer}>
          <View style={(styles as any).awardModalContent}>
            <Text style={(styles as any).awardTitle}>Поздравляем!</Text>
            <Text style={(styles as any).awardText}>
              Вы достигли {earnedStars} {earnedStars === 1 ? 'звезды' : 'звезд'} в этом уроке!
            </Text>

            <View style={(styles as any).starsContainer}>
              {Array.from({ length: earnedStars }).map((_, i) => (
                <Star
                  key={`award-star-${i}`}
                  size={40}
                  color={COLORS.accent3}
                  fill={COLORS.accent3}
                />
              ))}
            </View>

            <TouchableOpacity
              style={(styles as any).awardButton}
              onPress={() => setShowAwardModal(false)}
            >
              <Text style={(styles as any).awardButtonText}>Продолжить</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const markdownStyles = {
  body: {
    color: COLORS.text,
    fontSize: 16,
    lineHeight: 24,
  },
  heading1: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
    marginTop: 24,
  },
  heading2: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
    marginTop: 20,
  },
  heading3: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 10,
    marginTop: 16,
  },
  paragraph: {
    marginBottom: 16,
    fontSize: 16,
    lineHeight: 24,
  },
  list_item: {
    marginBottom: 8,
  },
  bullet_list: {
    marginBottom: 16,
  },
  ordered_list: {
    marginBottom: 16,
  },
  code_block: {
    backgroundColor: '#F1F5F9',
    padding: 16,
    borderRadius: 8,
    marginVertical: 16,
    fontFamily: 'monospace',
  },
  code_inline: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 4,
    borderRadius: 4,
    fontFamily: 'monospace',
  },
  blockquote: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    paddingLeft: 16,
    marginVertical: 16,
    fontStyle: 'italic',
  },
};

// Then type your StyleSheet correctly
const styles = StyleSheet.create<LessonStyles>({
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
    marginBottom: 4,
  },
  starsContainer: {
    flexDirection: 'row',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    marginTop: 8,
    borderRadius: 8,
    marginHorizontal: 16,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: COLORS.primary + '20', // 20% прозрачности
  },
  tabText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: 6,
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    marginTop: 8,
  },
  loadingContainer: {
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 12,
  },
  emptyContainer: {
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  contentContainer: {
    padding: 16,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    margin: 16,
  },
  completeButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  assignmentsContainer: {
    padding: 16,
  },
  assignmentsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  assignmentCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  completedAssignmentCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  assignmentCardContent: {
    flex: 1,
  },
  assignmentCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  assignmentCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  correctBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDFCF4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  correctBadgeText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '500',
    marginLeft: 4,
  },
  assignmentCardDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  assignmentDetailContainer: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
  },
  assignmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  backToAssignments: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backToAssignmentsText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },
  difficultyBadge: {
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  difficultyText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '500',
  },
  questionContainer: {
    marginBottom: 16,
  },
  questionText: {
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 24,
  },
  answerInput: {
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: COLORS.text,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  solutionButton: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  solutionButtonText: {
    color: COLORS.text,
    fontWeight: '500',
    fontSize: 14,
  },
  checkButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
    fontSize: 14,
  },
  examplesContainer: {
    padding: 16,
  },
  examplesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  exampleCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  exampleCardContent: {
    flex: 1,
  },
  exampleCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  exampleCardDescription: {
    fontSize: 14,
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
    maxHeight: '80%',
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
  solutionText: {
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 24,
  },
  exampleSection: {
    marginBottom: 16,
  },
  exampleSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  exampleContent: {
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 24,
  },
  awardModalContent: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    width: '80%',
    padding: 24,
    alignItems: 'center',
  },
  awardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  awardText: {
    fontSize: 16,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 24,
  },
  awardButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 24,
  },
  awardButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});
