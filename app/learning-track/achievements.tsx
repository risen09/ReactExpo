import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { ChevronRight, Star, Award, Calendar, Clock, Book, GraduationCap } from 'lucide-react-native';
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

// Типы достижений
interface Achievement {
  id: string;
  title: string;
  description: string;
  iconType: 'star' | 'award' | 'calendar' | 'clock' | 'book' | 'graduation';
  requiredValue: number;
  currentValue: number;
  isCompleted: boolean;
  completedAt?: string;
  type: 'streak' | 'session' | 'test' | 'chapter';
}

// Основной компонент достижений
export default function AchievementsScreen() {
  const params = useLocalSearchParams<{ trackId: string }>();
  const { token, user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [stats, setStats] = useState({
    totalStars: 0,
    completedAchievements: 0,
    longestStreak: 0,
    totalSessions: 0,
    averageScore: 0,
  });

  // Загрузка достижений
  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    if (!token) {
      Alert.alert('Ошибка авторизации', 'Пожалуйста, авторизуйтесь снова');
      return;
    }

    try {
      setIsLoading(true);
      // Запрос на получение достижений
      const response = await fetch(`${API_BASE_URL}/api/users/achievements${params.trackId ? `?trackId=${params.trackId}` : ''}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch achievements');
      }

      const data = await response.json();
      setAchievements(data.achievements);
      setStats({
        totalStars: data.stats.totalStars,
        completedAchievements: data.stats.completedAchievements,
        longestStreak: data.stats.longestStreak,
        totalSessions: data.stats.totalSessions,
        averageScore: data.stats.averageScore,
      });
    } catch (error) {
      logger.error('Error fetching achievements', error);
      Alert.alert('Ошибка', 'Не удалось загрузить достижения');
    } finally {
      setIsLoading(false);
    }
  };

  // Функция для отображения иконки достижения
  const renderAchievementIcon = (iconType: string, size: number = 24, color: string = COLORS.primary) => {
    switch (iconType) {
      case 'star':
        return <Star size={size} color={color} />;
      case 'award':
        return <Award size={size} color={color} />;
      case 'calendar':
        return <Calendar size={size} color={color} />;
      case 'clock':
        return <Clock size={size} color={color} />;
      case 'book':
        return <Book size={size} color={color} />;
      case 'graduation':
        return <GraduationCap size={size} color={color} />;
      default:
        return <Star size={size} color={color} />;
    }
  };

  // Категории достижений
  const achievementCategories = [
    { type: 'streak', title: 'Регулярность', description: 'Достижения за непрерывные занятия' },
    { type: 'session', title: 'Практика', description: 'Достижения за количество занятий' },
    { type: 'test', title: 'Результаты тестов', description: 'Достижения за успешное прохождение тестов' },
    { type: 'chapter', title: 'Прогресс обучения', description: 'Достижения за изучение материалов' },
  ];

  // Фильтрация достижений по категории
  const getAchievementsByCategory = (category: string) => {
    return achievements.filter(achievement => achievement.type === category);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Загрузка достижений...</Text>
      </SafeAreaView>
    );
  }

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
          <Text style={styles.headerTitle}>Достижения и прогресс</Text>
          <Text style={styles.headerSubtitle}>
            Отслеживайте свои успехи и получайте награды
          </Text>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Статистика пользователя */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Star size={24} color={COLORS.accent3} />
            <Text style={styles.statValue}>{stats.totalStars}</Text>
            <Text style={styles.statLabel}>Звезд</Text>
          </View>
          
          <View style={styles.statCard}>
            <Award size={24} color={COLORS.accent1} />
            <Text style={styles.statValue}>{stats.completedAchievements}</Text>
            <Text style={styles.statLabel}>Достижений</Text>
          </View>
          
          <View style={styles.statCard}>
            <Calendar size={24} color={COLORS.secondary} />
            <Text style={styles.statValue}>{stats.longestStreak}</Text>
            <Text style={styles.statLabel}>Макс. серия</Text>
          </View>
        </View>

        {/* Список достижений по категориям */}
        {achievementCategories.map((category) => {
          const categoryAchievements = getAchievementsByCategory(category.type);
          
          if (categoryAchievements.length === 0) {
            return null;
          }
          
          return (
            <View key={category.type} style={styles.categorySection}>
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryTitle}>{category.title}</Text>
                <Text style={styles.categoryDescription}>{category.description}</Text>
              </View>
              
              {categoryAchievements.map((achievement) => (
                <View key={achievement.id} style={styles.achievementCard}>
                  <View style={[
                    styles.achievementIconContainer,
                    achievement.isCompleted && styles.achievementIconCompleted
                  ]}>
                    {renderAchievementIcon(
                      achievement.iconType, 
                      24, 
                      achievement.isCompleted ? '#FFFFFF' : COLORS.primary
                    )}
                  </View>
                  
                  <View style={styles.achievementContent}>
                    <View style={styles.achievementHeader}>
                      <Text style={styles.achievementTitle}>{achievement.title}</Text>
                      {achievement.isCompleted && (
                        <Star size={16} color={COLORS.accent3} />
                      )}
                    </View>
                    
                    <Text style={styles.achievementDescription}>{achievement.description}</Text>
                    
                    {/* Прогресс-бар */}
                    <View style={styles.progressContainer}>
                      <View style={styles.progressBackground}>
                        <View 
                          style={[
                            styles.progressFill,
                            { 
                              width: `${Math.min(100, (achievement.currentValue / achievement.requiredValue) * 100)}%`,
                              backgroundColor: achievement.isCompleted ? COLORS.secondary : COLORS.primary
                            }
                          ]} 
                        />
                      </View>
                      <Text style={styles.progressText}>
                        {achievement.currentValue} / {achievement.requiredValue}
                      </Text>
                    </View>
                    
                    {achievement.isCompleted && achievement.completedAt && (
                      <Text style={styles.completedText}>
                        Получено: {new Date(achievement.completedAt).toLocaleDateString()}
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          );
        })}
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
    marginTop: 12,
    fontSize: 16,
    color: COLORS.text,
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
  content: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  categorySection: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  categoryHeader: {
    marginBottom: 12,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  categoryDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  achievementCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  achievementIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  achievementIconCompleted: {
    backgroundColor: COLORS.primary,
  },
  achievementContent: {
    flex: 1,
  },
  achievementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  achievementDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  progressContainer: {
    marginBottom: 8,
  },
  progressBackground: {
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'right',
  },
  completedText: {
    fontSize: 12,
    color: COLORS.secondary,
    fontStyle: 'italic',
  },
}); 