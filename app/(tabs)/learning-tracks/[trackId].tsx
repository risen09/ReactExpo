import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
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
import LoadingModal from '@/components/LoadingModal';

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
  const [isScheduleModalVisible, setIsScheduleModalVisible] = useState(false);
  const [lessonTopic, setLessonTopic] = useState('');
  const [isModalLoading, setIsModalLoading] = useState(false);

  // Загружаем данные трека, когда экран в фокусе
  useFocusEffect(
    React.useCallback(() => {
      const fetchTrackData = async () => {
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

          setTrack(fetchedTrack);
        } catch (err) {
          console.error('Ошибка при загрузке учебного трека:', err);
          setError('Не удалось загрузить учебный трек. Пожалуйста, попробуйте позже.');
        } finally {
          setIsLoading(false);
        }
      };

      fetchTrackData();

      // No cleanup needed for useFocusEffect with a simple fetch
      return () => {};
    }, [trackId])
  );

  // Обработчик открытия урока
  const handleOpenLesson = (lesson: Lesson) => {
    router.push({
      pathname: '/screens/LessonScreen',
      params: {
        headerTitle: 'Урок',
        lessonId: lesson._id,
        trackId: track?._id,
      },
    });
  };

  // Обработчик для завершения урока
  const handleMarkComplete = async (lesson: Lesson) => {
    if (!track) return;

    try {
      const updatedLessons = track.lessons.map(l => {
        if (l.lesson._id === lesson._id) {
          return { ...l, lesson: { ...l.lesson, completed: true } };
        }
        return l;
      });

      // Вычисляем новый прогресс
      const completedCount = updatedLessons.filter(l => l.lesson.completed).length;
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
        // await apiClient.tracks.updateTrack(track._id, updatedTrack); // Valera commented out: 'updateTrack' is missing from apiClient.tracks. Add this backend endpoint for progress saving.
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
      trackId: track._id,
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
        lessons: [...track.lessons, { lesson: lessonData }],
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

  const handleTabPress = (tab: 'lessons' | 'schedule') => {
    if (tab === 'schedule') {
      setIsScheduleModalVisible(true);
    } else {
      setActiveTab(tab);
    }
  };

  // Показываем индикатор загрузки
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <LoadingModal visible={true} message={'Загрузка учебного трека...'}/>
          {/* <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Загрузка учебного трека...</Text> */}
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

  // Функция рендеринга элемента списка уроков
  const renderLessonItem = ({ item, index }: { item: {lesson: Lesson, priority?: string}, index: number }) => (
    <TouchableOpacity
      style={[styles.lessonItem, item.lesson.completed && styles.completedLessonItem]}
      onPress={() => handleOpenLesson(item.lesson)}
    >
      <View style={[
        styles.lessonNumberContainer,
        item.priority === 'Высокий' && styles.highPriorityNumber
      ]}>
        <Text style={styles.lessonNumber}>{index + 1}</Text>
      </View>

      <View style={styles.lessonContent}>
        <Text style={styles.lessonTitle}>{item.lesson.title || item.lesson.sub_topic}</Text>
        <View style={styles.lessonMeta}>
          {/* <Text style={styles.lessonDuration}>{formatDuration(item.lesson.estimatedTime ?? 0)}</Text> */}
          {/* Добавляем отображение приоритета */}
          {item.priority && (
            <View style={styles.priorityContainer}>
              <Icon 
                name="priority-high" 
                size={16} 
                color={
                  item.priority === 'Высокий' ? '#F44336' : 
                  item.priority === 'Средний' ? '#FFC107' : '#4CAF50'
                } 
              />
              <Text style={[
                styles.priorityText,
                {
                  color: 
                    item.priority === 'Высокий' ? '#F44336' : 
                    item.priority === 'Средний' ? '#FFC107' : '#4CAF50'
                }
              ]}>
                {item.priority === 'Высокий' ? 'Высокий' : 
                item.priority === 'Средний' ? 'Средний' : 'Низкий'}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* {!item.lesson.completed ? (
        <TouchableOpacity
          style={styles.markCompleteButton}
          onPress={() => handleMarkComplete(item.lesson)}
          disabled
        >
          <Icon name="check-circle-outline" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      ) : (
        <View style={styles.completedIcon}>
          <Icon name="check-circle" size={24} color="#4CAF50" />
        </View>
      )} */}

      {item.lesson.assignment_id && (
        <TouchableOpacity
          style={styles.homeworkBadge}
          onPress={() => router.push(`/assignment/${item.lesson.assignment_id}`)}
        >
          <Icon name="notebook-check-outline" size={16} color={COLORS.white} />
          <Text style={styles.homeworkBadgeText}>ДЗ</Text>
        </TouchableOpacity>
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
      .map(lessonId => track.lessons.find(l => l.lesson._id === lessonId))
      .filter(Boolean) as { lesson: Lesson; priority?: string }[];

    return (
      <View style={styles.scheduleDay}>
        <Text style={styles.scheduleDayDate}>{formatDate(item.date)}</Text>
        {dayLessons.map((lessonItem, index) => (
          <TouchableOpacity
            key={`schedule-lesson-${index}`}
            style={[
              styles.scheduleLessonItem,
              lessonItem.lesson.completed && styles.completedScheduleLessonItem,
            ]}
            onPress={() => handleOpenLesson(lessonItem.lesson)}
          >
            <Icon
              name="book-open-outline" // Replaced getLessonTypeIcon with a generic icon
              size={20}
              color={COLORS.primary}
              style={styles.scheduleLessonIcon}
            />
            <View style={styles.scheduleLessonContent}>
              <Text style={styles.scheduleLessonTitle}>{lessonItem.lesson.sub_topic}</Text>
              <Text style={styles.scheduleLessonDuration}>{formatDuration(lessonItem.lesson.estimatedTime ?? 0)}</Text>
            </View>
            {lessonItem.lesson.completed && <Icon name="check-circle" size={20} color="#4CAF50" />}
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
              {/* <View style={styles.badgeRow>
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
              </View> */}
            </View>
          </View>

          {/*
          <View style={styles.progressSection>
            <View style={styles.progressHeader>
              <Text style={styles.progressTitle>Общий прогресс</Text>
              <Text style={styles.progressPercentage>{track.progress}%</Text>
            </View>
            <View style={styles.progressBarContainer>
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
            onPress={() => handleTabPress('lessons')}
          >
            <Text
              style={[styles.tabButtonText, activeTab === 'lessons' && styles.activeTabButtonText]}
            >
              Уроки
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'schedule' && styles.activeTabButton]}
            onPress={() => handleTabPress('schedule')}
          >
            <Text
              style={[
                styles.tabButtonText,
                activeTab === 'schedule' && styles.activeTabButtonText,
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
                  {renderLessonItem({ item: lesson, index })}
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

      {/* Schedule Modal */}
      <Modal
        animationType="fade"
        transparent
        visible={isScheduleModalVisible}
        onRequestClose={() => setIsScheduleModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Данная функция находится в разработке</Text>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonSubmit]}
              onPress={() => setIsScheduleModalVisible(false)}
            >
              <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>OK</Text>
            </TouchableOpacity>
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
    color: COLORS.textSecondary,
  },
  lessonsContainer: {
    marginBottom: 16,
  },
  scheduleContainer: {
    marginBottom: 16,
  },
  lessonItem: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  completedLessonItem: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  lessonIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
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
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
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
  // New styles for Assignment Component
  homeworkBadge: {
    backgroundColor: COLORS.secondary,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  homeworkBadgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  priorityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  priorityText: {
    fontSize: 12,
    marginLeft: 4,
  },
  lessonNumberContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2196F3', // Material Design Blue
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    marginTop: 0,
  },
  highPriorityNumber: {
    marginTop: -8,
    backgroundColor: '#1976D2', // Darker blue for high priority
  },
  lessonNumber: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
  },
});

export default LearningTrackDetailsScreen;
