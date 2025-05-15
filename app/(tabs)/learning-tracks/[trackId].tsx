import { useRoute, useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  FlatList,
  Modal,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import apiClient from '@/api/client';
import COLORS from '@/config/colors';
import { Lesson } from '@/types/lesson';
import { Track } from '@/types/track';

const LearningTrackDetailsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();

  // Получаем параметры из навигации
  const { trackId, trackData } = route.params as { trackId: string; trackData?: Track };

  const [track, setTrack] = useState<Track | null>(trackData || null);
  const [isLoading, setIsLoading] = useState(!trackData);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'lessons' | 'schedule'>('lessons');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [lessonTopic, setLessonTopic] = useState('');
  const [isModalLoading, setIsModalLoading] = useState(false);

  // Загружаем данные трека, если они не были переданы через параметры
  useEffect(() => {
    const fetchTrackData = async () => {
      if (trackData) {
        setTrack(trackData);
        return;
      }

      if (!trackId) {
        setError('Идентификатор учебного трека не найден');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        // Пытаемся получить трек из API
        const response = await apiClient.tracks.getById(trackId);
        const fetchedTrack = response.data;
        console.log('Загружен трек:', fetchedTrack);

        setTrack(fetchedTrack);
      } catch (err) {
        console.error('Ошибка при загрузке учебного трека:', err);
        setError('Не удалось загрузить учебный трек. Пожалуйста, попробуйте позже.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrackData();
  }, [trackId, trackData]);

  // Обработчик открытия урока
  const handleOpenLesson = (lesson: Lesson) => {
    // @ts-ignore - still ignoring for simplicity, but ensure 'lesson' has at least 'id', 'topic', 'content', and 'subject' if used by LessonScreen
    const lessonPayload = {
      _id: lesson.id, // Assuming lesson.id maps to _id, or use lesson._id if available
      topic: lesson.topic, // Assuming lesson.title maps to topic
      content: lesson.content,
      subject: (lesson as any).subject, // If lesson object has subject
      // Add other fields from the lesson object that LessonScreen might need from the payload
      // For example, if your 'lessonData' in the error log is what 'lesson' object looks like:
      // topic: lesson.topic, subject: lesson.subject, grade: lesson.grade, etc.
    };

    router.push({
      pathname: '/screens/LessonScreen',
      params: {
        headerTitle: 'Урок',
        lessonId: lesson.id,
        trackId: track?._id,
        lessonData: JSON.stringify(lessonPayload), // Pass the prepared payload
      },
    });
  };

  // Обработчик для завершения урока
  const handleMarkComplete = async (lesson: Lesson) => {
    if (!track) return;

    try {
      const updatedLessons = track.lessons.map(l => {
        if (l.id === lesson.id) {
          return { ...l, isCompleted: true };
        }
        return l;
      });

      // Вычисляем новый прогресс
      const completedCount = updatedLessons.filter(l => l.isCompleted).length;
      const totalCount = updatedLessons.length;
      const newProgress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

      const updatedTrack = {
        ...track,
        lessons: updatedLessons,
        progress: newProgress,
      };

      setTrack(updatedTrack);

      // Сохраняем обновленный трек в API
      try {
        await apiClient.tracks.updateTrack(track.id, updatedTrack);
      } catch (err) {
        console.warn('Не удалось сохранить прогресс на сервере:', err);
        // Здесь можно добавить логику для сохранения локально
      }

      if (newProgress === 100) {
        Alert.alert(
          'Поздравляем!',
          'Вы завершили учебный трек! Хотите пройти тест для проверки знаний?',
          [
            {
              text: 'Да, пройти тест',
              onPress: () => handleStartFinalTest(),
            },
            {
              text: 'Не сейчас',
              style: 'cancel',
            },
          ]
        );
      }
    } catch (err) {
      console.error('Ошибка при обновлении статуса урока:', err);
      Alert.alert('Ошибка', 'Не удалось обновить статус урока. Пожалуйста, попробуйте позже.', [
        { text: 'OK' },
      ]);
    }
  };

  // Обработчик для запуска итогового теста
  const handleStartFinalTest = () => {
    if (!track) return;

    // @ts-ignore - and ignore for simplicity
    navigation.navigate('TestScreen', {
      subject: track.subject,
      topic: track.topic,
      difficulty: track.difficulty,
      isFinalTest: true,
      trackId: track.id,
    });
  };

  // Обработчик возврата назад
  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleRequestLesson = async () => {
    if (!track?.subject) {
      Alert.alert('Ошибка', 'Информация о треке не загружена.');
      return;
    }
    if (!lessonTopic.trim()) {
      Alert.alert('Ошибка', 'Пожалуйста, введите тему урока.');
      return;
    }

    setIsModalLoading(true);

    try {
      console.log(`Запрос на урок по теме: "${lessonTopic}" для предмета: ${track.subject}`);

      const requestResponse = await apiClient.tracks.requestLesson(track._id, lessonTopic);
      const { lessonId } = await requestResponse.data;
      console.log('Lesson ID:', lessonId);
      const lessonResponse = await apiClient.lessons.getById(lessonId);
      const lessonData = await lessonResponse.data;
      console.log('Lesson Data:', lessonData);

      const updatedTrack = {
        ...track,
        lessons: [...track.lessons, lessonData],
      };
      setTrack(updatedTrack);
      setLessonTopic(''); // Очищаем поле ввода
      setIsModalVisible(false);
    } catch (error) {
      console.error('Ошибка при запросе урока:', error);
      Alert.alert('Ошибка', 'Не удалось запросить урок. Попробуйте еще раз.');
    } finally {
      setIsModalLoading(false);
    }
  };

  // Показываем индикатор загрузки
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Загрузка учебного трека...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Показываем сообщение об ошибке
  if (error || !track) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Произошла ошибка</Text>
          <Text style={styles.errorText}>{error || 'Учебный трек не найден'}</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={handleGoBack}>
            <Text style={styles.primaryButtonText}>Вернуться назад</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Функция для форматирования длительности
  const formatDuration = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} мин`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours} ч ${mins} мин` : `${hours} ч`;
  };

  // Функция для преобразования сложности в текст
  const getDifficultyText = (difficulty: string): string => {
    switch (difficulty) {
      case 'basic':
        return 'Базовый';
      case 'intermediate':
        return 'Средний';
      case 'advanced':
        return 'Продвинутый';
      default:
        return 'Не указан';
    }
  };

  // Функция для отображения значка типа урока
  const getLessonTypeIcon = (type: string): string => {
    return type === 'theory' ? 'book-open-variant' : 'pencil';
  };

  // Функция рендеринга элемента списка уроков
  const renderLessonItem = ({ item }: { item: Lesson }) => (
    <TouchableOpacity
      style={[styles.lessonItem, item.isCompleted && styles.completedLessonItem]}
      onPress={() => handleOpenLesson(item)}
    >
      <View style={styles.lessonIconContainer}>
        <Icon name={getLessonTypeIcon('lesson')} size={24} color={COLORS.primary} />
      </View>

      <View style={styles.lessonContent}>
        <Text style={styles.lessonTitle}>{item.topic}</Text>
        <View style={styles.lessonMeta}>
          <Text style={styles.lessonDuration}>{formatDuration(item.duration ?? 0)}</Text>
        </View>
      </View>

      {!item.isCompleted ? (
        <TouchableOpacity
          style={styles.markCompleteButton}
          onPress={() => handleMarkComplete(item)}
          disabled
        >
          <Icon name="check-circle-outline" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      ) : (
        <View style={styles.completedIcon}>
          <Icon name="check-circle" size={24} color="#4CAF50" />
        </View>
      )}
    </TouchableOpacity>
  );

  // Функция для форматирования даты
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  };

  // Рендеринг дня расписания
  const renderScheduleDay = ({ item }: { item: { date: string; lessons: string[] } }) => {
    const dayLessons = item.lessons
      .map(lessonId => track.lessons.find(l => l.id === lessonId))
      .filter(Boolean) as LessonItem[];

    return (
      <View style={styles.scheduleDay}>
        <Text style={styles.scheduleDayDate}>{formatDate(item.date)}</Text>
        {dayLessons.map((lesson, index) => (
          <TouchableOpacity
            key={`schedule-lesson-${index}`}
            style={[
              styles.scheduleLessonItem,
              lesson.isCompleted && styles.completedScheduleLessonItem,
            ]}
            onPress={() => handleOpenLesson(lesson)}
          >
            <Icon
              name={getLessonTypeIcon(lesson.type)}
              size={20}
              color={COLORS.primary}
              style={styles.scheduleLessonIcon}
            />
            <View style={styles.scheduleLessonContent}>
              <Text style={styles.scheduleLessonTitle}>{lesson.title}</Text>
              <Text style={styles.scheduleLessonDuration}>{formatDuration(lesson.duration)}</Text>
            </View>
            {lesson.isCompleted && <Icon name="check-circle" size={20} color="#4CAF50" />}
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.trackInfoCard}>
          <View style={styles.trackHeader}>
            <View>
              <Text style={styles.trackTitle}>{track.name}</Text>
              <Text style={styles.trackSubject}>
                {track.subject}: {track.topic}
              </Text>
              <View style={styles.badgeRow}>
                <View style={styles.difficultyBadge}>
                  <Text style={styles.difficultyText}>{getDifficultyText(track.difficulty)}</Text>
                </View>
                <View style={styles.durationBadge}>
                  <Icon
                    name="clock-outline"
                    size={14}
                    color={COLORS.white}
                    style={styles.badgeIcon}
                  />
                  <Text style={styles.durationText}>
                    {formatDuration(track.expectedDuration ?? 60)}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/*
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Общий прогресс</Text>
              <Text style={styles.progressPercentage}>{track.progress}%</Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View 
                style={[
                  styles.progressBar,
                  { width: `${track.progress}%` }
                ]} 
              />
            </View>
          </View>
          */}

          <Text style={styles.trackDescription}>{track.description}</Text>
        </View>

        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'lessons' && styles.activeTabButton]}
            onPress={() => setActiveTab('lessons')}
          >
            <Text
              style={[styles.tabButtonText, activeTab === 'lessons' && styles.activeTabButtonText]}
            >
              Уроки
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'schedule' && styles.activeTabButton]}
            onPress={() => setActiveTab('schedule')}
            disabled={!track.schedule}
          >
            <Text
              style={[
                styles.tabButtonText,
                activeTab === 'schedule' && styles.activeTabButtonText,
                !track.schedule && styles.disabledTabButtonText,
              ]}
            >
              Расписание
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'lessons' ? (
          <View style={styles.lessonsContainer}>
            {track.lessons.length > 0 ? (
              track.lessons.map((lesson, index) => (
                <React.Fragment key={`lesson-${index}`}>
                  {renderLessonItem({ item: lesson })}
                </React.Fragment>
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Уроки не найдены</Text>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.scheduleContainer}>
            {track.schedule && track.schedule.days.length > 0 ? (
              track.schedule.days.map((day, index) => (
                <React.Fragment key={`day-${index}`}>
                  {renderScheduleDay({ item: day })}
                </React.Fragment>
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Расписание не доступно</Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.secondaryButton} onPress={() => setIsModalVisible(true)}>
            <Text style={styles.primaryButtonText}>Запросить урок</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleStartFinalTest} disabled>
            <Text style={styles.primaryButtonText}>Пройти итоговый тест</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent
        visible={isModalVisible}
        onRequestClose={() => {
          if (!isModalLoading) {
            setIsModalVisible(!isModalVisible);
          }
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {isModalLoading ? (
              <View style={styles.modalLoadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.modalLoadingText}>Запрашиваем урок...</Text>
              </View>
            ) : (
              <>
                <Text style={styles.modalTitle}>
                  Какую тему по этому предмету ({track?.subject || 'выбранному предмету'}) ты хочешь
                  изучить?
                </Text>

                <Text style={styles.inputLabel}>Тема урока</Text>
                <TextInput
                  style={styles.textInput}
                  onChangeText={setLessonTopic}
                  value={lessonTopic}
                  placeholder="Введите тему урока"
                  placeholderTextColor={COLORS.textSecondary}
                />

                <View style={styles.modalButtonsContainer}>
                  <TouchableOpacity
                    style={[
                      styles.modalButton,
                      styles.modalButtonCancel,
                      isModalLoading && styles.disabledButton,
                    ]}
                    onPress={() => setIsModalVisible(false)}
                    disabled={isModalLoading}
                  >
                    <Text style={[styles.modalButtonText, styles.modalButtonCancelText]}>
                      Отмена
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.modalButton,
                      styles.modalButtonSubmit,
                      isModalLoading && styles.disabledButton,
                    ]}
                    onPress={handleRequestLesson}
                    disabled={isModalLoading}
                  >
                    <Text style={styles.modalButtonText}>Запросить</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  backButton: {
    padding: 8,
  },
  scrollContent: {
    padding: 16,
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
  trackInfoCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  trackHeader: {
    marginBottom: 16,
  },
  trackTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  trackSubject: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  difficultyBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  difficultyText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '500',
  },
  durationBadge: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeIcon: {
    marginRight: 4,
  },
  durationText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '500',
  },
  progressSection: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressTitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.primary,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  trackDescription: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: COLORS.border,
  },
  activeTabButton: {
    borderBottomColor: COLORS.primary,
  },
  tabButtonText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  activeTabButtonText: {
    color: COLORS.primary,
  },
  disabledTabButtonText: {
    color: COLORS.disabled,
  },
  lessonsContainer: {
    marginBottom: 16,
  },
  scheduleContainer: {
    marginBottom: 16,
  },
  lessonItem: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  completedLessonItem: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  lessonIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.lightBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  lessonContent: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 4,
  },
  lessonDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  lessonMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lessonDuration: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginRight: 12,
  },
  lessonType: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  markCompleteButton: {
    padding: 8,
  },
  completedIcon: {
    padding: 8,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  scheduleDay: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  scheduleDayDate: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 12,
    textTransform: 'capitalize',
  },
  scheduleLessonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  completedScheduleLessonItem: {
    opacity: 0.7,
  },
  scheduleLessonIcon: {
    marginRight: 12,
  },
  scheduleLessonContent: {
    flex: 1,
  },
  scheduleLessonTitle: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 2,
  },
  scheduleLessonDuration: {
    fontSize: 12,
    color: COLORS.textSecondary,
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
    backgroundColor: COLORS.secondary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    alignSelf: 'flex-start',
    marginBottom: 6,
    marginLeft: 4, // to align with text input border
  },
  textInput: {
    width: '100%',
    height: 48,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 20,
    fontSize: 16,
    color: COLORS.text,
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  modalButtonCancel: {
    backgroundColor: COLORS.border,
  },
  modalButtonCancelText: {
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  modalButtonSubmit: {
    backgroundColor: COLORS.primary,
  },
  modalButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalLoadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  modalLoadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default LearningTrackDetailsScreen;
