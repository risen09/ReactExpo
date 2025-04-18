import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Image,
  Alert
} from 'react-native';
import { Book, Star, Calendar, Clock, ChevronRight, BookOpen, TestTube } from 'lucide-react-native';
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

interface Lesson {
  _id: string;
  title: string;
  difficulty: number;
  stars: number;
  completed: boolean;
}

interface Test {
  _id: string;
  title: string;
  testType: 'T1' | 'T2';
  subject: string;
  topic: string;
}

interface Track {
  _id: string;
  name: string;
  description: string;
  subject: string;
  topic: string;
  createdAt: string;
  lessons: Lesson[];
  tests: Test[];
  schedule?: {
    startDate: string;
    endDate: string;
    dailyHours: number;
    sessions: {
      date: string;
      startTime: string;
      endTime: string;
      lessons: string[];
      completed: boolean;
    }[];
  };
}

export default function LearningTrackScreen() {
  const params = useLocalSearchParams<{ trackId: string }>();
  const { token } = useAuth();
  const [track, setTrack] = useState<Track | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'lessons' | 'tests' | 'schedule'>('lessons');
  
  // Получение данных трека
  const fetchTrack = useCallback(async () => {
    if (!params.trackId || !token) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/tracks/${params.trackId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch track data');
      }
      
      const data = await response.json();
      setTrack(data);
    } catch (error) {
      logger.error('Error fetching track', error);
      Alert.alert('Ошибка', 'Не удалось загрузить данные трека');
    } finally {
      setIsLoading(false);
    }
  }, [params.trackId, token]);
  
  useEffect(() => {
    fetchTrack();
  }, [fetchTrack]);
  
  // Обработчик перехода к уроку
  const handleLessonPress = useCallback((lessonId: string) => {
    router.push({
      pathname: "/learning-track/lesson",
      params: { lessonId }
    });
  }, []);
  
  // Обработчик перехода к тесту
  const handleTestPress = useCallback((testId: string) => {
    router.push({
      pathname: "/learning-track/test",
      params: { testId }
    });
  }, []);
  
  // Рендер карточки урока
  const renderLessonItem = useCallback(({ item }: { item: Lesson }) => (
    <TouchableOpacity
      style={styles.itemCard}
      onPress={() => handleLessonPress(item._id)}
    >
      <View style={styles.itemIconContainer}>
        <BookOpen size={24} color={COLORS.primary} />
      </View>
      
      <View style={styles.itemContent}>
        <Text style={styles.itemTitle}>{item.title}</Text>
        
        <View style={styles.itemDetails}>
          <View style={styles.difficultyContainer}>
            {Array.from({ length: item.difficulty }).map((_, i) => (
              <View 
                key={`diff-${i}`} 
                style={[
                  styles.difficultyDot,
                  { backgroundColor: 
                    item.difficulty === 1 ? '#43C0B4' : 
                    item.difficulty === 2 ? '#FFCA42' : 
                    '#EC575B'
                  }
                ]} 
              />
            ))}
          </View>
          
          <View style={styles.starsContainer}>
            {Array.from({ length: 3 }).map((_, i) => (
              <Star
                key={`star-${i}`}
                size={16}
                color={i < item.stars ? COLORS.accent3 : '#D1D5DB'}
                fill={i < item.stars ? COLORS.accent3 : 'none'}
              />
            ))}
          </View>
          
          {item.completed && (
            <View style={styles.completedBadge}>
              <Text style={styles.completedText}>Пройден</Text>
            </View>
          )}
        </View>
      </View>
      
      <ChevronRight size={20} color={COLORS.textSecondary} />
    </TouchableOpacity>
  ), [handleLessonPress]);
  
  // Рендер карточки теста
  const renderTestItem = useCallback(({ item }: { item: Test }) => (
    <TouchableOpacity
      style={styles.itemCard}
      onPress={() => handleTestPress(item._id)}
    >
      <View style={styles.itemIconContainer}>
        <TestTube size={24} color={COLORS.primary} />
      </View>
      
      <View style={styles.itemContent}>
        <Text style={styles.itemTitle}>{item.title}</Text>
        
        <View style={styles.itemDetails}>
          <View style={styles.testTypeBadge}>
            <Text style={styles.testTypeText}>
              {item.testType === 'T1' ? 'Тест по теме' : 'Диагностика'}
            </Text>
          </View>
        </View>
      </View>
      
      <ChevronRight size={20} color={COLORS.textSecondary} />
    </TouchableOpacity>
  ), [handleTestPress]);
  
  // Рендер сессии расписания
  const renderScheduleItem = useCallback(({ item }: { item: Track['schedule']['sessions'][0] }) => {
    const dateObj = new Date(item.date);
    const formattedDate = dateObj.toLocaleDateString('ru-RU', { 
      day: 'numeric', 
      month: 'long'
    });
    
    return (
      <View style={styles.scheduleCard}>
        <View style={styles.scheduleHeader}>
          <View style={styles.scheduleDateContainer}>
            <Calendar size={18} color={COLORS.primary} />
            <Text style={styles.scheduleDate}>{formattedDate}</Text>
          </View>
          
          <View style={styles.scheduleTimeContainer}>
            <Clock size={18} color={COLORS.primary} />
            <Text style={styles.scheduleTime}>{item.startTime} - {item.endTime}</Text>
          </View>
        </View>
        
        <View style={styles.scheduleContent}>
          {item.lessons.length > 0 ? (
            <Text style={styles.scheduleLessons}>
              {`${item.lessons.length} ${item.lessons.length === 1 ? 'урок' : 
                item.lessons.length < 5 ? 'урока' : 'уроков'}`}
            </Text>
          ) : (
            <Text style={styles.schedulePlaceholder}>Нет запланированных уроков</Text>
          )}
        </View>
        
        {item.completed ? (
          <View style={styles.scheduleCompletedBadge}>
            <Text style={styles.scheduleCompletedText}>Выполнено</Text>
          </View>
        ) : (
          <TouchableOpacity style={styles.scheduleActionButton}>
            <Text style={styles.scheduleActionText}>Начать занятие</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }, []);
  
  // Секции табов
  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Загрузка...</Text>
        </View>
      );
    }
    
    if (!track) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Трек не найден</Text>
        </View>
      );
    }
    
    switch (activeTab) {
      case 'lessons':
        return (
          <FlatList
            data={track.lessons}
            renderItem={renderLessonItem}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>В треке пока нет уроков</Text>
              </View>
            }
          />
        );
        
      case 'tests':
        return (
          <FlatList
            data={track.tests}
            renderItem={renderTestItem}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>В треке пока нет тестов</Text>
              </View>
            }
          />
        );
        
      case 'schedule':
        if (!track.schedule) {
          return (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Расписание еще не создано</Text>
              <TouchableOpacity 
                style={styles.createScheduleButton}
                onPress={() => router.push({
                  pathname: "/learning-track/create-schedule",
                  params: { trackId: track._id }
                })}
              >
                <Text style={styles.createScheduleText}>Создать расписание</Text>
              </TouchableOpacity>
            </View>
          );
        }
        
        return (
          <FlatList
            data={track.schedule.sessions}
            renderItem={renderScheduleItem}
            keyExtractor={(item, index) => `session-${index}`}
            contentContainerStyle={styles.listContainer}
            ListHeaderComponent={
              <View style={styles.scheduleInfoContainer}>
                <Text style={styles.scheduleInfoText}>
                  {`Начало: ${new Date(track.schedule.startDate).toLocaleDateString('ru-RU')}`}
                </Text>
                <Text style={styles.scheduleInfoText}>
                  {`Завершение: ${new Date(track.schedule.endDate).toLocaleDateString('ru-RU')}`}
                </Text>
                <Text style={styles.scheduleInfoText}>
                  {`Часов в день: ${track.schedule.dailyHours}`}
                </Text>
              </View>
            }
          />
        );
    }
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
          <Text style={styles.headerTitle}>{track?.name || 'Учебный трек'}</Text>
          <Text style={styles.headerSubtitle}>
            {track ? `${track.subject} - ${track.topic || 'Общий курс'}` : ''}
          </Text>
        </View>
      </View>
      
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'lessons' && styles.activeTab]}
          onPress={() => setActiveTab('lessons')}
        >
          <Book size={18} color={activeTab === 'lessons' ? COLORS.primary : COLORS.textSecondary} />
          <Text style={[
            styles.tabText, 
            activeTab === 'lessons' && styles.activeTabText
          ]}>
            Уроки
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'tests' && styles.activeTab]}
          onPress={() => setActiveTab('tests')}
        >
          <TestTube size={18} color={activeTab === 'tests' ? COLORS.primary : COLORS.textSecondary} />
          <Text style={[
            styles.tabText, 
            activeTab === 'tests' && styles.activeTabText
          ]}>
            Тесты
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'schedule' && styles.activeTab]}
          onPress={() => setActiveTab('schedule')}
        >
          <Calendar size={18} color={activeTab === 'schedule' ? COLORS.primary : COLORS.textSecondary} />
          <Text style={[
            styles.tabText, 
            activeTab === 'schedule' && styles.activeTabText
          ]}>
            Расписание
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.content}>
        {renderContent()}
      </View>
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
  listContainer: {
    padding: 16,
  },
  itemCard: {
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
  itemIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary + '15', // 15% прозрачности
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  itemDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  difficultyContainer: {
    flexDirection: 'row',
    marginRight: 12,
  },
  difficultyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 3,
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: 12,
  },
  completedBadge: {
    backgroundColor: '#EDFCF4',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  completedText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '500',
  },
  testTypeBadge: {
    backgroundColor: COLORS.primary + '15', // 15% прозрачности
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  testTypeText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '500',
  },
  scheduleCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  scheduleDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scheduleDate: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
    marginLeft: 6,
  },
  scheduleTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scheduleTime: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
    marginLeft: 6,
  },
  scheduleContent: {
    marginBottom: 12,
  },
  scheduleLessons: {
    fontSize: 14,
    color: COLORS.text,
  },
  schedulePlaceholder: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  scheduleCompletedBadge: {
    backgroundColor: '#EDFCF4',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  scheduleCompletedText: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '500',
  },
  scheduleActionButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  scheduleActionText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
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
    paddingTop: 40,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 16,
  },
  createScheduleButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  createScheduleText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  scheduleInfoContainer: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  scheduleInfoText: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 4,
  },
}); 