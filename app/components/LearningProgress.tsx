import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  Image,
  ActivityIndicator,
  RefreshControl,
  ViewStyle,
  TextStyle
} from 'react-native';
import {
  Star,
  Trophy,
  Clock,
  Target,
  Award,
  BookOpen,
  CheckCircle,
  ChevronRight,
  Calendar,
  Zap
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import api from '../api/client';
import { useLearningTracks } from '../hooks/useLearningTracks';
import { formatDate } from '../utils';

const { width } = Dimensions.get('window');

// Цветовая палитра для компонента
const COLORS = {
  primary: '#5B67CA',
  secondary: '#43C0B4',
  accent1: '#F98D51',
  accent2: '#EC575B',
  accent3: '#FFCA42',
  background: '#F2F5FF',
  card: '#FFFFFF',
  text: '#25335F',
  textSecondary: '#7F8BB7',
  border: '#EAEDF5',
  starGold: '#FFD700',
  starSilver: '#C0C0C0',
  starBronze: '#CD7F32',
  starOutline: '#DADFED'
};

// Интерфейсы для типизации данных
interface Star {
  id: string;
  type: 'bronze' | 'silver' | 'gold';
  completed: boolean;
  earnedAt?: string;
  lesson?: string;
  module?: string;
  description: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  iconType: 'streak' | 'mastery' | 'speed' | 'completion' | 'perfect';
  requiredValue: number;
  currentValue: number;
  isCompleted: boolean;
  completedDate?: string;
  type: 'streak' | 'session' | 'test' | 'chapter';
}

interface Streak {
  current: number;
  longest: number;
  lastUpdated: string;
  daysByDate: Record<string, boolean>;
}

interface ProgressStats {
  completedLessons: number;
  totalLessons: number;
  completedTests: number;
  totalTests: number;
  averageScore: number;
  totalTimeSpent: number; // в минутах
  stars: {
    bronze: number;
    silver: number;
    gold: number;
    total: number;
  };
}

interface LearningProgressProps {
  userId: string;
  trackId?: string; // Опционально - для отображения прогресса конкретного трека
}

interface LessonStyles {
  container: ViewStyle;
  header: ViewStyle;
  backButton: ViewStyle;
  headerContent: ViewStyle;
  headerTitle: TextStyle;
  starsContainer: ViewStyle;
  tabsContainer: ViewStyle;
  tabButton: ViewStyle;
  activeTab: ViewStyle;
  tabText: TextStyle;
  activeTabText: TextStyle;
  content: ViewStyle;
  loadingContainer: ViewStyle;
  loadingText: TextStyle;
  emptyContainer: ViewStyle;
  emptyText: TextStyle;
  contentContainer: ViewStyle;
  completeButton: ViewStyle;
  completeButtonText: TextStyle;
  assignmentsContainer: ViewStyle;
  assignmentDetailContainer: ViewStyle;
  assignmentHeader: ViewStyle;
  backToAssignments: ViewStyle;
  backToAssignmentsText: TextStyle;
  assignmentCard: ViewStyle;
  completedAssignmentCard: ViewStyle;
}

export const LearningProgress = ({ userId, trackId }: LearningProgressProps) => {
  const router = useRouter();
  const { tracks } = useLearningTracks();
  
  // Состояния для хранения данных
  const [stars, setStars] = useState<Star[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [streak, setStreak] = useState<Streak | null>(null);
  const [stats, setStats] = useState<ProgressStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Анимированные значения для эффектов
  const [streakAnimation] = useState(new Animated.Value(0));
  const [starAnimation] = useState(new Animated.Value(0));
  
  // Загрузка данных с сервера
  const fetchUserProgress = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Получение звезд
      const starsResponse = await api.get(`/users/${userId}/stars${trackId ? `?trackId=${trackId}` : ''}`);
      setStars(starsResponse.data as Star[]);
      
      // Получение достижений
      const achievementsResponse = await api.get(`/users/${userId}/achievements${trackId ? `?trackId=${trackId}` : ''}`);
      setAchievements(achievementsResponse.data as Achievement[]);
      
      // Получение статистики прогресса
      const statsResponse = await api.get(`/users/${userId}/progress-stats${trackId ? `?trackId=${trackId}` : ''}`);
      setStats(statsResponse.data as ProgressStats);
      
      // Получение серии выполнения
      const streakResponse = await api.get(`/users/${userId}/streak`);
      setStreak(streakResponse.data as Streak);
      
      // Запуск анимаций
      animateProgress();
    } catch (err) {
      setError('Не удалось загрузить данные о прогрессе');
      console.error('Error fetching user progress:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId, trackId]);
  
  // Загрузка данных при монтировании и изменении параметров
  useEffect(() => {
    fetchUserProgress();
  }, [fetchUserProgress]);
  
  // Обработчик pull-to-refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchUserProgress();
  }, [fetchUserProgress]);
  
  // Анимация прогресса
  const animateProgress = useCallback(() => {
    Animated.parallel([
      Animated.timing(streakAnimation, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: false,
      }),
      Animated.timing(starAnimation, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: false,
      }),
    ]).start();
  }, [streakAnimation, starAnimation]);
  
  // Цвет для звезды в зависимости от типа
  const getStarColor = (type: Star['type'], completed: boolean) => {
    if (!completed) return COLORS.starOutline;
    
    switch (type) {
      case 'gold': return COLORS.starGold;
      case 'silver': return COLORS.starSilver;
      case 'bronze': return COLORS.starBronze;
      default: return COLORS.starOutline;
    }
  };
  
  // Render метод для отображения иконки достижения
  const renderAchievementIcon = (iconType: Achievement['iconType'], size = 24, color = COLORS.primary) => {
    switch (iconType) {
      case 'streak':
        return <Zap size={size} color={color} />;
      case 'mastery':
        return <Trophy size={size} color={color} />;
      case 'speed':
        return <Clock size={size} color={color} />;
      case 'completion':
        return <CheckCircle size={size} color={color} />;
      case 'perfect':
        return <Award size={size} color={color} />;
      default:
        return <Star size={size} color={color} />;
    }
  };
  
  // Если идет загрузка
  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Загрузка прогресса...</Text>
      </View>
    );
  }
  
  // Если произошла ошибка
  if (error && !refreshing) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchUserProgress}>
          <Text style={styles.retryButtonText}>Повторить</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[COLORS.primary]}
          tintColor={COLORS.primary}
        />
      }
    >
      {/* Блок с серией занятий */}
      {streak && (
        <View style={styles.streakCard}>
          <LinearGradient
            colors={['#5B67CA', '#7981E4']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.streakGradient}
          >
            <View style={styles.streakHeader}>
              <Zap size={24} color="#FFFFFF" />
              <Text style={styles.streakTitle}>Серия занятий</Text>
            </View>
            
            <View style={styles.streakContent}>
              <Animated.View style={styles.streakCounter}>
                <Text style={styles.streakNumber}>
                  {streakAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0', streak.current.toString()],
                  }).toString()}
                </Text>
                <Text style={styles.streakLabel}>Дней подряд</Text>
              </Animated.View>
              
              <View style={styles.streakStats}>
                <View style={styles.streakStat}>
                  <Text style={styles.streakStatLabel}>Рекорд</Text>
                  <Text style={styles.streakStatValue}>{streak.longest} дней</Text>
                </View>
                <View style={styles.streakStat}>
                  <Text style={styles.streakStatLabel}>Последнее занятие</Text>
                  <Text style={styles.streakStatValue}>{formatDate(streak.lastUpdated)}</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>
      )}
      
      {/* Звезды за выполненные задания */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Звезды</Text>
          <TouchableOpacity 
            style={styles.viewAllButton}
            onPress={() => router.push('/learning-track/stars')}
          >
            <Text style={styles.viewAllText}>Все звезды</Text>
            <ChevronRight size={16} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.starsContainer}>
          {stats && (
            <View style={styles.starsSummary}>
              <View style={styles.starsSummaryItem}>
                <Star size={18} color={COLORS.starGold} />
                <Text style={styles.starsSummaryCount}>{stats.stars.gold}</Text>
              </View>
              <View style={styles.starsSummaryItem}>
                <Star size={18} color={COLORS.starSilver} />
                <Text style={styles.starsSummaryCount}>{stats.stars.silver}</Text>
              </View>
              <View style={styles.starsSummaryItem}>
                <Star size={18} color={COLORS.starBronze} />
                <Text style={styles.starsSummaryCount}>{stats.stars.bronze}</Text>
              </View>
              <View style={styles.starsSummaryTotal}>
                <Text style={styles.starsSummaryTotalText}>
                  Всего: {stats.stars.total} / {stats.stars.bronze + stats.stars.silver + stats.stars.gold + (stars.filter(s => !s.completed).length)}
                </Text>
              </View>
            </View>
          )}
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.starsScroll}
          >
            {stars.slice(0, 10).map((star, index) => (
              <Animated.View 
                key={star.id}
                style={[
                  styles.starItem,
                  {
                    opacity: starAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 1],
                    }),
                    transform: [
                      {
                        translateY: starAnimation.interpolate({
                          inputRange: [0, 1],
                          outputRange: [20, 0],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <View 
                  style={[
                    styles.starIconContainer, 
                    { backgroundColor: `${getStarColor(star.type, star.completed)}20` }
                  ]}
                >
                  <Star 
                    size={24} 
                    color={getStarColor(star.type, star.completed)} 
                    fill={star.completed ? getStarColor(star.type, star.completed) : 'transparent'}
                  />
                </View>
                <Text 
                  style={[
                    styles.starName,
                    !star.completed && styles.starNameIncomplete
                  ]}
                  numberOfLines={2}
                >
                  {star.description}
                </Text>
                {star.completed && star.earnedAt && (
                  <Text style={styles.starDate}>
                    {formatDate(star.earnedAt)}
                  </Text>
                )}
              </Animated.View>
            ))}
          </ScrollView>
        </View>
      </View>
      
      {/* Общий прогресс */}
      {stats && (
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Общий прогресс</Text>
          </View>
          
          <View style={styles.progressCards}>
            <View style={styles.progressCard}>
              <View style={styles.progressCardIcon}>
                <BookOpen size={20} color={COLORS.primary} />
              </View>
              <View style={styles.progressCardContent}>
                <Text style={styles.progressCardTitle}>Уроков пройдено</Text>
                <View style={styles.progressBarContainer}>
                  <View 
                    style={[
                      styles.progressBar,
                      { width: `${(stats.completedLessons / stats.totalLessons) * 100}%` }
                    ]}
                  />
                </View>
                <Text style={styles.progressCardValue}>
                  {stats.completedLessons} / {stats.totalLessons}
                </Text>
              </View>
            </View>
            
            <View style={styles.progressCard}>
              <View style={styles.progressCardIcon}>
                <Target size={20} color={COLORS.primary} />
              </View>
              <View style={styles.progressCardContent}>
                <Text style={styles.progressCardTitle}>Тестов сдано</Text>
                <View style={styles.progressBarContainer}>
                  <View 
                    style={[
                      styles.progressBar,
                      { width: `${(stats.completedTests / stats.totalTests) * 100}%` }
                    ]}
                  />
                </View>
                <Text style={styles.progressCardValue}>
                  {stats.completedTests} / {stats.totalTests}
                </Text>
              </View>
            </View>
            
            <View style={styles.progressCard}>
              <View style={styles.progressCardIcon}>
                <Award size={20} color={COLORS.primary} />
              </View>
              <View style={styles.progressCardContent}>
                <Text style={styles.progressCardTitle}>Средний балл</Text>
                <Text style={[styles.progressCardValue, { color: COLORS.accent1 }]}>
                  {stats.averageScore.toFixed(1)}%
                </Text>
              </View>
            </View>
            
            <View style={styles.progressCard}>
              <View style={styles.progressCardIcon}>
                <Clock size={20} color={COLORS.primary} />
              </View>
              <View style={styles.progressCardContent}>
                <Text style={styles.progressCardTitle}>Время изучения</Text>
                <Text style={styles.progressCardValue}>
                  {Math.floor(stats.totalTimeSpent / 60)} ч {stats.totalTimeSpent % 60} мин
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}
      
      {/* Последние достижения */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Достижения</Text>
          <TouchableOpacity 
            style={styles.viewAllButton}
            onPress={() => router.push('/learning-track/achievements')}
          >
            <Text style={styles.viewAllText}>Все достижения</Text>
            <ChevronRight size={16} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.achievementsContainer}>
          {achievements.slice(0, 3).map((achievement) => (
            <View key={achievement.id} style={styles.achievementItem}>
              <View 
                style={[
                  styles.achievementIconContainer,
                  achievement.isCompleted ? styles.achievementIconCompleted : {}
                ]}
              >
                {renderAchievementIcon(
                  achievement.iconType, 
                  24, 
                  achievement.isCompleted ? COLORS.card : COLORS.primary
                )}
              </View>
              
              <View style={styles.achievementContent}>
                <Text style={styles.achievementTitle}>{achievement.title}</Text>
                <Text style={styles.achievementDescription} numberOfLines={2}>
                  {achievement.description}
                </Text>
                
                <View style={styles.achievementProgressContainer}>
                  <View style={styles.achievementProgressBar}>
                    <View 
                      style={[
                        styles.achievementProgress,
                        { 
                          width: `${Math.min(100, (achievement.currentValue / achievement.requiredValue) * 100)}%`,
                          backgroundColor: achievement.isCompleted ? COLORS.secondary : COLORS.primary
                        }
                      ]}
                    />
                  </View>
                  <Text style={styles.achievementProgressText}>
                    {achievement.currentValue} / {achievement.requiredValue}
                  </Text>
                </View>
              </View>
              
              {achievement.isCompleted && (
                <View style={styles.achievementCompletedBadge}>
                  <CheckCircle size={16} color={COLORS.secondary} />
                </View>
              )}
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    paddingVertical: 16,
    paddingHorizontal: 16,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.accent2,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: COLORS.card,
    fontSize: 16,
    fontWeight: '500',
  },
  
  // Streak section
  streakCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    elevation: 2,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  streakGradient: {
    padding: 16,
  },
  streakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  streakTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  streakContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  streakCounter: {
    alignItems: 'center',
  },
  streakNumber: {
    color: '#FFFFFF',
    fontSize: 48,
    fontWeight: 'bold',
  },
  streakLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  streakStats: {
    flex: 1,
    marginLeft: 24,
  },
  streakStat: {
    marginBottom: 8,
  },
  streakStatLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
  },
  streakStatValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  
  // Section styling
  sectionContainer: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    color: COLORS.primary,
    marginRight: 4,
  },
  
  // Stars section
  starsContainer: {
    marginBottom: 8,
  },
  starsSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  starsSummaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  starsSummaryCount: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  starsSummaryTotal: {
    flex: 1,
    alignItems: 'flex-end',
  },
  starsSummaryTotalText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  starsScroll: {
    paddingBottom: 8,
  },
  starItem: {
    width: 120,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  starIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  starName: {
    fontSize: 12,
    color: COLORS.text,
    textAlign: 'center',
    height: 32,
  },
  starNameIncomplete: {
    color: COLORS.textSecondary,
  },
  starDate: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 6,
  },
  
  // Progress section
  progressCards: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  progressCard: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  progressCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${COLORS.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  progressCardContent: {
    flex: 1,
    justifyContent: 'center',
  },
  progressCardTitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  progressCardValue: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#E0E6F5',
    borderRadius: 3,
    marginVertical: 8,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  
  // Achievements section
  achievementsContainer: {
    marginTop: 8,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  achievementIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${COLORS.primary}15`,
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
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  achievementProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  achievementProgressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#E0E6F5',
    borderRadius: 3,
    marginRight: 8,
    overflow: 'hidden',
  },
  achievementProgress: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  achievementProgressText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    width: 45,
    textAlign: 'right',
  },
  achievementCompletedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
}); 