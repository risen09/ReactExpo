import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import {
  Trophy,
  BookOpen,
  Star,
  Award,
  TrendingUp,
  Calendar,
  ChevronRight,
  BarChart,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

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

interface CourseProgress {
  id: number;
  title: string;
  progress: number;
  lessons: number;
  completedLessons: number;
}

interface Achievement {
  id: number;
  title: string;
  date: string;
  icon: JSX.Element;
  color: string;
}

const ProgressScreen: React.FC = () => {
  const courseProgress: CourseProgress[] = [
    {
      id: 1,
      title: 'Основы психологии',
      progress: 65,
      lessons: 12,
      completedLessons: 8,
    },
    {
      id: 2,
      title: 'Развитие эмоционального интеллекта',
      progress: 30,
      lessons: 8,
      completedLessons: 2,
    },
  ];

  const recentAchievements: Achievement[] = [
    {
      id: 1,
      title: 'Первый урок',
      date: '19.05.2023',
      icon: <BookOpen size={22} color="#FFFFFF" strokeWidth={2} />,
      color: COLORS.primary,
    },
    {
      id: 2,
      title: 'MBTI Тест',
      date: '20.05.2023',
      icon: <Star size={22} color="#FFFFFF" strokeWidth={2} />,
      color: COLORS.accent1,
    },
  ];

  const weeklyStats = [
    {
      day: 'Пн',
      hours: 1.2,
      active: true,
    },
    {
      day: 'Вт',
      hours: 0.8,
      active: true,
    },
    {
      day: 'Ср',
      hours: 2.0,
      active: true,
    },
    {
      day: 'Чт',
      hours: 1.5,
      active: true,
    },
    {
      day: 'Пт',
      hours: 0.5,
      active: true,
    },
    {
      day: 'Сб',
      hours: 0,
      active: false,
    },
    {
      day: 'Вс',
      hours: 0,
      active: false,
    },
  ];

  const viewAllAchievements = () => {
    router.navigate('/achievements' as any);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <LinearGradient
            colors={[COLORS.primary, '#424D9D']}
            style={styles.headerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.trophyContainer}>
              <Trophy size={32} color="#FFFFFF" strokeWidth={2} />
            </View>
            <Text style={styles.headerTitle}>Ваш прогресс</Text>
            <Text style={styles.headerSubtitle}>Продолжайте обучение</Text>
          </LinearGradient>
        </View>
      </View>

      {/* Course Progress */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Прогресс по курсам</Text>
        <TouchableOpacity style={styles.seeAllButton}>
          <Text style={styles.seeAllButtonText}>Все</Text>
          <ChevronRight size={16} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
      <View style={styles.coursesContainer}>
        {courseProgress.map((course) => (
          <TouchableOpacity key={course.id} style={styles.courseCard}>
            <Text style={styles.courseTitle}>{course.title}</Text>
            <View style={styles.progressInfo}>
              <Text style={styles.progressText}>Прогресс: {course.progress}%</Text>
              <Text style={styles.lessonsText}>
                {course.completedLessons}/{course.lessons} уроков
              </Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill,
                    { width: `${course.progress}%` }
                  ]} 
                />
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Weekly Stats */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Статистика за неделю</Text>
        <TouchableOpacity style={styles.calendarButton}>
          <Calendar size={16} color={COLORS.textSecondary} strokeWidth={2} />
        </TouchableOpacity>
      </View>
      <View style={styles.weeklyStatsCard}>
        <View style={styles.weeklyStatsHeader}>
          <View>
            <Text style={styles.weeklyStatsTitle}>Всего часов</Text>
            <Text style={styles.weeklyStatsValue}>6 ч 30 мин</Text>
          </View>
          <View style={styles.trendContainer}>
            <TrendingUp size={14} color={COLORS.secondary} strokeWidth={2} />
            <Text style={styles.trendText}>+15%</Text>
          </View>
        </View>
        <View style={styles.chartContainer}>
          {weeklyStats.map((day, index) => (
            <View key={index} style={styles.chartColumn}>
              <View style={styles.barContainer}>
                <View 
                  style={[
                    styles.bar,
                    day.active ? { height: `${(day.hours/2) * 100}%` } : { height: 0 },
                    day.active ? { backgroundColor: COLORS.primary } : { backgroundColor: 'transparent' }
                  ]} 
                />
              </View>
              <Text style={styles.dayLabel}>{day.day}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Recent Achievements */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Недавние достижения</Text>
        <TouchableOpacity onPress={viewAllAchievements}>
          <Text style={styles.seeAllButtonText}>Все достижения</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.achievementsContainer}>
        {recentAchievements.map((achievement) => (
          <TouchableOpacity key={achievement.id} style={styles.achievementCard}>
            <View 
              style={[
                styles.achievementIcon,
                { backgroundColor: achievement.color }
              ]}
            >
              {achievement.icon}
            </View>
            <View style={styles.achievementInfo}>
              <Text style={styles.achievementTitle}>{achievement.title}</Text>
              <Text style={styles.achievementDate}>{achievement.date}</Text>
            </View>
            <Award size={20} color={COLORS.accent3} strokeWidth={2} />
          </TouchableOpacity>
        ))}
        <TouchableOpacity 
          style={styles.viewAllButton}
          onPress={viewAllAchievements}
        >
          <Text style={styles.viewAllButtonText}>Посмотреть все достижения</Text>
        </TouchableOpacity>
      </View>

      {/* Weekly Stats Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Подробная аналитика</Text>
        <TouchableOpacity>
          <Text style={styles.seeAllButtonText}>Подробнее</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.analyticsCard}>
        <View style={styles.analyticsIconContainer}>
          <BarChart size={24} color={COLORS.card} strokeWidth={2} />
        </View>
        <View style={styles.analyticsContent}>
          <Text style={styles.analyticsTitle}>Статистика обучения</Text>
          <Text style={styles.analyticsDescription}>
            Детальный анализ вашего прогресса и эффективности обучения
          </Text>
        </View>
        <ChevronRight size={20} color={COLORS.textSecondary} strokeWidth={2} />
      </TouchableOpacity>

      {/* Bottom spacing */}
      <View style={{ height: 30 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  header: {
    alignItems: 'center',
  },
  headerGradient: {
    width: '100%',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  trophyContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 8,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllButtonText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
    marginRight: 4,
  },
  calendarButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  coursesContainer: {
    paddingHorizontal: 20,
    marginBottom: 5,
  },
  courseCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  progressText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  lessonsText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  progressBarContainer: {
    height: 8,
    marginTop: 4,
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  weeklyStatsCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  weeklyStatsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  weeklyStatsTitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  weeklyStatsValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 4,
    letterSpacing: -0.5,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(67, 192, 180, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  trendText: {
    color: COLORS.secondary,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  chartContainer: {
    height: 120,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  chartColumn: {
    flex: 1,
    alignItems: 'center',
  },
  barContainer: {
    height: 100,
    width: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  bar: {
    width: '100%',
    borderRadius: 4,
  },
  dayLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  achievementsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  achievementDate: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  viewAllButton: {
    backgroundColor: '#EEF0FF',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  viewAllButtonText: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: 15,
  },
  analyticsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  analyticsIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  analyticsContent: {
    flex: 1,
  },
  analyticsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  analyticsDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
    lineHeight: 18,
  },
});

export default ProgressScreen; 