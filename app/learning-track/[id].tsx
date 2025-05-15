import { useLocalSearchParams, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ChevronLeft, Star, BookOpen, ClipboardList, Calendar } from 'lucide-react-native';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';

import { LearningTrack, Lesson } from '../../models/LearningAgents';
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

const subjectIcons: Record<string, any> = {
  математика: require('../../assets/images/courses/math.svg'),
  физика: require('../../assets/images/courses/physics.svg'),
  английский: require('../../assets/images/courses/english.svg'),
  информатика: require('../../assets/images/courses/python.svg'),
  // Добавьте другие предметы и соответствующие иконки
};

export default function LearningTrackDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [track, setTrack] = useState<LearningTrack | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'lessons' | 'tests' | 'schedule'>('lessons');

  useEffect(() => {
    const loadTrack = async () => {
      try {
        setIsLoading(true);

        // В реальном приложении здесь был бы запрос к API
        // Для демонстрации используем моковые данные
        if (id === '1') {
          setTrack({
            id: '1',
            name: 'Квадратные уравнения',
            description:
              'Изучение квадратных уравнений и методов их решения, включая формулу дискриминанта, теорему Виета и методы разложения на множители.',
            subject: 'математика',
            topic: 'квадратные уравнения',
            createdAt: new Date().toISOString(),
            lessons: [
              {
                id: 'lesson-1',
                title: 'Формула дискриминанта',
                content: 'Содержание урока о дискриминанте...',
                difficulty: 1,
                stars: 2,
                assignments: [],
                examples: [],
                completed: true,
              },
              {
                id: 'lesson-2',
                title: 'Теорема Виета',
                content: 'Содержание урока о теореме Виета...',
                difficulty: 2,
                stars: 1,
                assignments: [],
                examples: [],
                completed: false,
              },
              {
                id: 'lesson-3',
                title: 'Разложение на множители',
                content: 'Содержание урока о разложении на множители...',
                difficulty: 2,
                stars: 0,
                assignments: [],
                examples: [],
                completed: false,
              },
              {
                id: 'lesson-4',
                title: 'Биквадратные уравнения',
                content: 'Содержание урока о биквадратных уравнениях...',
                difficulty: 3,
                stars: 0,
                assignments: [],
                examples: [],
                completed: false,
              },
            ],
            tests: [
              {
                id: 'test-1',
                title: 'Входной тест: Квадратные уравнения',
                description: 'Проверка знаний по квадратным уравнениям',
                questions: [],
              },
              {
                id: 'test-2',
                title: 'Итоговый тест: Квадратные уравнения',
                description: 'Проверка усвоения материала по квадратным уравнениям',
                questions: [],
              },
            ],
            schedule: {
              startDate: '2023-08-15',
              endDate: '2023-08-30',
              dailyHours: 2,
              sessions: [
                {
                  date: '2023-08-15',
                  startTime: '18:00',
                  endTime: '20:00',
                  lessons: ['lesson-1'],
                  completed: true,
                },
                {
                  date: '2023-08-17',
                  startTime: '18:00',
                  endTime: '20:00',
                  lessons: ['lesson-2'],
                  completed: false,
                },
                {
                  date: '2023-08-19',
                  startTime: '18:00',
                  endTime: '20:00',
                  lessons: ['lesson-3'],
                  completed: false,
                },
                {
                  date: '2023-08-21',
                  startTime: '18:00',
                  endTime: '20:00',
                  lessons: ['lesson-4'],
                  completed: false,
                },
              ],
            },
          });
        } else if (id === '2') {
          setTrack({
            id: '2',
            name: 'Основы программирования',
            description:
              'Изучение основ программирования на Python, включая переменные, условные операторы, циклы и функции.',
            subject: 'информатика',
            topic: 'python',
            createdAt: new Date().toISOString(),
            lessons: [
              {
                id: 'lesson-py-1',
                title: 'Переменные и типы данных',
                content: 'Содержание урока о переменных...',
                difficulty: 1,
                stars: 3,
                assignments: [],
                examples: [],
                completed: true,
              },
              {
                id: 'lesson-py-2',
                title: 'Условные операторы',
                content: 'Содержание урока об условных операторах...',
                difficulty: 1,
                stars: 2,
                assignments: [],
                examples: [],
                completed: true,
              },
              {
                id: 'lesson-py-3',
                title: 'Циклы',
                content: 'Содержание урока о циклах...',
                difficulty: 2,
                stars: 0,
                assignments: [],
                examples: [],
                completed: false,
              },
              {
                id: 'lesson-py-4',
                title: 'Функции',
                content: 'Содержание урока о функциях...',
                difficulty: 2,
                stars: 0,
                assignments: [],
                examples: [],
                completed: false,
              },
              {
                id: 'lesson-py-5',
                title: 'Работа со списками',
                content: 'Содержание урока о списках...',
                difficulty: 2,
                stars: 0,
                assignments: [],
                examples: [],
                completed: false,
              },
            ],
            tests: [
              {
                id: 'test-py-1',
                title: 'Входной тест: Python',
                description: 'Проверка знаний по основам Python',
                questions: [],
              },
            ],
          });
        } else {
          // Если трек не найден
          router.back();
        }
      } catch (error) {
        logger.error('Error loading track details', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTrack();
  }, [id]);

  const handleLessonPress = (lesson: Lesson) => {
    router.push(`/lesson/${lesson.id}`);
  };

  const handleTestPress = (testId: string) => {
    router.push(`/test/${testId}`);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Загрузка трека...</Text>
      </SafeAreaView>
    );
  }

  if (!track) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.errorText}>Трек не найден</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Вернуться назад</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const subjectIcon = subjectIcons[track.subject.toLowerCase()] || subjectIcons.математика;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{track.name}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.trackInfoContainer}>
          <View style={styles.trackHeaderRow}>
            <View style={styles.iconContainer}>
              <Image source={subjectIcon} style={styles.icon} />
            </View>

            <View style={styles.trackInfo}>
              <Text style={styles.trackSubject}>{track.subject}</Text>
              <Text style={styles.trackTopic}>{track.topic}</Text>

              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${(track.lessons.filter(l => l.completed).length / track.lessons.length) * 100}%`,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>
                  {`${track.lessons.filter(l => l.completed).length}/${track.lessons.length} уроков`}
                </Text>
              </View>
            </View>
          </View>

          <Text style={styles.trackDescription}>{track.description}</Text>
        </View>

        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'lessons' && styles.activeTab]}
            onPress={() => setActiveTab('lessons')}
          >
            <BookOpen
              size={18}
              color={activeTab === 'lessons' ? COLORS.primary : COLORS.textSecondary}
            />
            <Text style={[styles.tabText, activeTab === 'lessons' && styles.activeTabText]}>
              Уроки
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'tests' && styles.activeTab]}
            onPress={() => setActiveTab('tests')}
          >
            <ClipboardList
              size={18}
              color={activeTab === 'tests' ? COLORS.primary : COLORS.textSecondary}
            />
            <Text style={[styles.tabText, activeTab === 'tests' && styles.activeTabText]}>
              Тесты
            </Text>
          </TouchableOpacity>

          {track.schedule && (
            <TouchableOpacity
              style={[styles.tab, activeTab === 'schedule' && styles.activeTab]}
              onPress={() => setActiveTab('schedule')}
            >
              <Calendar
                size={18}
                color={activeTab === 'schedule' ? COLORS.primary : COLORS.textSecondary}
              />
              <Text style={[styles.tabText, activeTab === 'schedule' && styles.activeTabText]}>
                Расписание
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {activeTab === 'lessons' && (
          <View style={styles.lessonsContainer}>
            {track.lessons.map((lesson, index) => (
              <TouchableOpacity
                key={lesson.id}
                style={styles.lessonCard}
                onPress={() => handleLessonPress(lesson)}
              >
                <View style={styles.lessonHeader}>
                  <Text style={styles.lessonNumber}>{`Урок ${index + 1}`}</Text>
                  <View style={styles.starsContainer}>
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        color={i < lesson.stars ? COLORS.accent3 : COLORS.border}
                        fill={i < lesson.stars ? COLORS.accent3 : 'transparent'}
                      />
                    ))}
                  </View>
                </View>

                <Text style={styles.lessonTitle}>{lesson.title}</Text>

                <View style={styles.lessonFooter}>
                  <View
                    style={[
                      styles.difficultyBadge,
                      lesson.difficulty === 1
                        ? styles.easyBadge
                        : lesson.difficulty === 2
                          ? styles.mediumBadge
                          : styles.hardBadge,
                    ]}
                  >
                    <Text style={styles.difficultyText}>
                      {lesson.difficulty === 1
                        ? 'Легкий'
                        : lesson.difficulty === 2
                          ? 'Средний'
                          : 'Сложный'}
                    </Text>
                  </View>

                  {lesson.completed && (
                    <View style={styles.completedBadge}>
                      <Text style={styles.completedText}>Пройден</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {activeTab === 'tests' && (
          <View style={styles.testsContainer}>
            {track.tests.length > 0 ? (
              track.tests.map(test => (
                <TouchableOpacity
                  key={test.id}
                  style={styles.testCard}
                  onPress={() => handleTestPress(test.id)}
                >
                  <Text style={styles.testTitle}>{test.title}</Text>
                  <Text style={styles.testDescription}>{test.description}</Text>

                  <View style={styles.testFooter}>
                    <Text style={styles.testQuestions}>
                      {`${test.questions.length} ${
                        test.questions.length === 1
                          ? 'вопрос'
                          : test.questions.length < 5
                            ? 'вопроса'
                            : 'вопросов'
                      }`}
                    </Text>

                    {test.results && (
                      <View style={styles.testResultBadge}>
                        <Text style={styles.testResultText}>{`${test.results.score}%`}</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Нет доступных тестов</Text>
              </View>
            )}
          </View>
        )}

        {activeTab === 'schedule' && track.schedule && (
          <View style={styles.scheduleContainer}>
            <View style={styles.scheduleInfoCard}>
              <Text style={styles.scheduleTitle}>План обучения</Text>
              <Text style={styles.scheduleDates}>
                {`${new Date(track.schedule.startDate).toLocaleDateString('ru-RU')} - ${new Date(track.schedule.endDate).toLocaleDateString('ru-RU')}`}
              </Text>
              <Text style={styles.scheduleDailyHours}>
                {`${track.schedule.dailyHours} ${
                  track.schedule.dailyHours === 1
                    ? 'час'
                    : track.schedule.dailyHours < 5
                      ? 'часа'
                      : 'часов'
                } в день`}
              </Text>
            </View>

            {track.schedule.sessions.map((session, index) => (
              <View
                key={index}
                style={[styles.sessionCard, session.completed && styles.completedSessionCard]}
              >
                <View style={styles.sessionHeader}>
                  <Text style={styles.sessionDate}>
                    {new Date(session.date).toLocaleDateString('ru-RU', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </Text>
                  <Text
                    style={styles.sessionTime}
                  >{`${session.startTime} - ${session.endTime}`}</Text>
                </View>

                <View style={styles.sessionLessons}>
                  {session.lessons.map(lessonId => {
                    const lesson = track.lessons.find(l => l.id === lessonId);
                    return lesson ? (
                      <Text key={lessonId} style={styles.sessionLessonTitle}>
                        {`• ${lesson.title}`}
                      </Text>
                    ) : null;
                  })}
                </View>

                {session.completed && (
                  <View style={styles.sessionCompletedBadge}>
                    <Text style={styles.sessionCompletedText}>Завершено</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  errorText: {
    fontSize: 18,
    color: COLORS.text,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.primary,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  trackInfoContainer: {
    backgroundColor: COLORS.card,
    padding: 16,
    marginBottom: 16,
  },
  trackHeaderRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  icon: {
    width: 28,
    height: 28,
    tintColor: '#FFFFFF',
  },
  trackInfo: {
    flex: 1,
  },
  trackSubject: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  trackTopic: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 10,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: COLORS.border,
    borderRadius: 3,
    marginRight: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: COLORS.primary,
  },
  progressText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  trackDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.text,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: COLORS.primary,
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
  lessonsContainer: {
    padding: 16,
  },
  lessonCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  lessonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  lessonNumber: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  lessonTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  lessonFooter: {
    flexDirection: 'row',
    gap: 8,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: COLORS.border,
  },
  easyBadge: {
    backgroundColor: 'rgba(67, 192, 180, 0.2)',
  },
  mediumBadge: {
    backgroundColor: 'rgba(255, 202, 66, 0.2)',
  },
  hardBadge: {
    backgroundColor: 'rgba(236, 87, 91, 0.2)',
  },
  difficultyText: {
    fontSize: 12,
    color: COLORS.text,
    fontWeight: '500',
  },
  completedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
  },
  completedText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },
  testsContainer: {
    padding: 16,
  },
  testCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  testTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  testDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  testFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  testQuestions: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  testResultBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: 'rgba(91, 103, 202, 0.2)',
  },
  testResultText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '500',
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  scheduleContainer: {
    padding: 16,
  },
  scheduleInfoCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  scheduleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  scheduleDates: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 4,
  },
  scheduleDailyHours: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  sessionCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  completedSessionCard: {
    borderLeftColor: '#4CAF50',
    opacity: 0.8,
  },
  sessionHeader: {
    marginBottom: 12,
  },
  sessionDate: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  sessionTime: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  sessionLessons: {
    marginBottom: 12,
  },
  sessionLessonTitle: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 4,
    lineHeight: 20,
  },
  sessionCompletedBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
  },
  sessionCompletedText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },
});
