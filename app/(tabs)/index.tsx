import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  ImageBackground,
  Dimensions
} from 'react-native';
import { router } from 'expo-router';
import { 
  Search, 
  BookOpen, 
  MessageCircle, 
  User, 
  Trophy, 
  GraduationCap,
  Brain,
  BookMarked,
  Calendar,
  Bell,
  Clock,
  Award
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const cardWidth = width * 0.42;

// Новая цветовая палитра
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

// Mock auth implementation 
const useAuth = () => {
  const [user, setUser] = React.useState<{name: string} | null>(null);
  
  React.useEffect(() => {
    const getUser = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          setUser(JSON.parse(userData));
        }
      } catch (error) {
        console.error('Error getting user:', error);
      }
    };
    
    getUser();
  }, []);
  
  return {
    state: {
      user: user || { name: 'Гость' }
    }
  };
};

export default function HomeScreen() {
  const { state: { user } } = useAuth();
  
  const featureCards = [
    {
      id: 1,
      title: 'Уроки',
      description: 'Интерактивные уроки и курсы',
      icon: <BookOpen size={28} color="#FFFFFF" strokeWidth={2} />,
      gradient: [COLORS.primary, '#424D9D'] as [string, string],
      route: '/(tabs)/lessons'
    },
    {
      id: 2,
      title: 'Тест личности',
      description: 'Узнай свой MBTI тип',
      icon: <Brain size={28} color="#FFFFFF" strokeWidth={2} />,
      gradient: [COLORS.accent1, '#E06B30'] as [string, string],
      route: '/personality-test'
    },
    {
      id: 3,
      title: 'Чат',
      description: 'Общение и поддержка',
      icon: <MessageCircle size={28} color="#FFFFFF" strokeWidth={2} />,
      gradient: [COLORS.secondary, '#328E85'] as [string, string],
      route: '/(tabs)/chat'
    },
    {
      id: 4,
      title: 'Прогресс',
      description: 'Ваши достижения и награды',
      icon: <Award size={28} color="#FFFFFF" strokeWidth={2} />,
      gradient: ['#9661C9', '#7A45B7'] as [string, string],
      route: '/(tabs)/progress'
    }
  ];

  const popularCourses = [
    {
      id: 1,
      title: 'Основы психологии',
      lessons: 12,
      duration: '6 часов',
      image: require('../../assets/images/logo.png')
    },
    {
      id: 2,
      title: 'Развитие эмоционального интеллекта',
      lessons: 8,
      duration: '4 часа',
      image: require('../../assets/images/logo.png')
    }
  ];

  const todayTasks = [
    {
      id: 1,
      title: 'Прохождение теста MBTI',
      time: '10:00 - 10:30',
      completed: false
    },
    {
      id: 2,
      title: 'Урок: Введение в типы личности',
      time: '11:00 - 12:00',
      completed: true
    }
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header with greeting and search */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Привет, {user?.name || 'Гость'}! 👋</Text>
          <Text style={styles.subGreeting}>Готовы к новым знаниям?</Text>
        </View>
        <TouchableOpacity style={styles.searchButton}>
          <Search size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Main Features */}
      <View style={{paddingHorizontal: 20}}>
        <Text style={[styles.sectionTitle, {paddingHorizontal: 0}]}>Основные функции</Text>
      </View>
      <View style={styles.featureGrid}>
        {featureCards.map((card) => (
          <TouchableOpacity 
            key={card.id} 
            style={styles.featureCard}
            onPress={() => router.navigate(card.route as any)}
          >
            <LinearGradient
              colors={card.gradient}
              style={styles.featureCardGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.featureCardIcon}>
                {card.icon}
              </View>
              <View style={{ width: '100%', paddingBottom: 15 }}>
                <Text style={styles.featureCardTitle}>{card.title}</Text>
                <Text style={styles.featureCardDescription}>{card.description}</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </View>

      {/* Popular Courses */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, {paddingHorizontal: 0}]}>Популярные курсы</Text>
        <TouchableOpacity onPress={() => router.navigate('/(tabs)/lessons' as any)}>
          <Text style={styles.seeAllLink}>Все курсы</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.coursesContainer}
      >
        {popularCourses.map((course) => (
          <TouchableOpacity key={course.id} style={styles.courseCard}>
            <Image source={course.image} style={styles.courseImage} />
            <View style={styles.courseInfo}>
              <Text style={styles.courseTitle}>{course.title}</Text>
              <View style={styles.courseMetaContainer}>
                <View style={styles.courseMeta}>
                  <BookOpen size={14} color={COLORS.textSecondary} />
                  <Text style={styles.courseMetaText}>{course.lessons} уроков</Text>
                </View>
                <View style={styles.courseMeta}>
                  <Clock size={14} color={COLORS.textSecondary} />
                  <Text style={styles.courseMetaText}>{course.duration}</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Today's Tasks */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, {paddingHorizontal: 0}]}>Задачи на сегодня</Text>
        <TouchableOpacity>
          <Text style={styles.seeAllLink}>Все задачи</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tasksContainer}>
        {todayTasks.map((task) => (
          <View key={task.id} style={styles.taskCard}>
            <View style={[styles.taskCheckbox, task.completed ? styles.taskCompleted : {}]}>
              {task.completed && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <View style={styles.taskContent}>
              <Text style={[
                styles.taskTitle, 
                task.completed ? styles.taskCompletedText : {}
              ]}>
                {task.title}
              </Text>
              <View style={styles.taskMeta}>
                <Clock size={14} color={COLORS.textSecondary} />
                <Text style={styles.taskMetaText}>{task.time}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* Additional Features */}
      <View style={{paddingHorizontal: 20}}>
        <Text style={[styles.sectionTitle, {paddingHorizontal: 0}]}>Дополнительные возможности</Text>
      </View>
      <View style={styles.additionalFeatures}>
        <TouchableOpacity 
          style={styles.additionalFeatureButton}
          onPress={() => router.navigate('/(tabs)/profile' as any)}
        >
          <View style={[styles.additionalFeatureIcon, { backgroundColor: '#E8F0FB' }]}>
            <User size={20} color={COLORS.primary} />
          </View>
          <Text style={styles.additionalFeatureText}>Профиль</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.additionalFeatureButton}
          onPress={() => {}}
        >
          <View style={[styles.additionalFeatureIcon, { backgroundColor: '#E6F8F6' }]}>
            <Calendar size={20} color={COLORS.secondary} />
          </View>
          <Text style={styles.additionalFeatureText}>Календарь</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.additionalFeatureButton}
          onPress={() => {}}
        >
          <View style={[styles.additionalFeatureIcon, { backgroundColor: '#FFF8E8' }]}>
            <Bell size={20} color={COLORS.accent3} />
          </View>
          <Text style={styles.additionalFeatureText}>Напоминания</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.additionalFeatureButton}
          onPress={() => {}}
        >
          <View style={[styles.additionalFeatureIcon, { backgroundColor: '#FFF0E8' }]}>
            <BookMarked size={20} color={COLORS.accent1} />
          </View>
          <Text style={styles.additionalFeatureText}>Сохраненное</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom spacing */}
      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
  },
  greeting: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  subGreeting: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  searchButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 15,
    marginBottom: 15,
    letterSpacing: -0.5,
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 5,
  },
  featureCard: {
    width: cardWidth,
    height: 180,
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  featureCardGradient: {
    flex: 1,
    padding: 20,
    paddingTop: 16,
    paddingBottom: 25,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  featureCardIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
  featureCardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
    letterSpacing: -0.5,
    textAlign: 'left',
  },
  featureCardDescription: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'left',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 15,
  },
  seeAllLink: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  coursesContainer: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  courseCard: {
    width: 260,
    backgroundColor: COLORS.card,
    borderRadius: 20,
    marginRight: 16,
    overflow: 'hidden',
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  courseImage: {
    width: '100%',
    height: 140,
    resizeMode: 'cover',
  },
  courseInfo: {
    padding: 16,
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  courseMetaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  courseMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  courseMetaText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 4,
    fontWeight: '500',
  },
  tasksContainer: {
    paddingHorizontal: 20,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  taskCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.primary,
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskCompleted: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  taskCompletedText: {
    textDecorationLine: 'line-through',
    color: COLORS.textSecondary,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskMetaText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 4,
    fontWeight: '500',
  },
  additionalFeatures: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  additionalFeatureButton: {
    width: '23%',
    alignItems: 'center',
    marginBottom: 16,
  },
  additionalFeatureIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  additionalFeatureText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    letterSpacing: -0.2,
  },
});