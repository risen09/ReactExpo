import { useAuth } from '@/hooks/useAuth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
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
  Award,
} from 'lucide-react-native';
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');
const cardWidth = width * 0.42;

// Новая цветовая палитра
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

export default function HomeScreen() {
  const { user } = useAuth(); 

  const featureCards = [
    {
      id: 1,
      title: 'Уроки',
      description: 'Интерактивные уроки и курсы',
      icon: <BookOpen size={28} color="#FFFFFF" strokeWidth={2} />,
      gradient: [COLORS.primary, '#424D9D'] as [string, string],
      route: '/(tabs)/lessons',
    },
    {
      id: 2,
      title: 'Тест личности',
      description: 'Узнай свой MBTI тип',
      icon: <Brain size={28} color="#FFFFFF" strokeWidth={2} />,
      gradient: [COLORS.accent1, '#E06B30'] as [string, string],
      route: '/mbti',
    },
    {
      id: 3,
      title: 'Чат',
      description: 'Общение и поддержка',
      icon: <MessageCircle size={28} color="#FFFFFF" strokeWidth={2} />,
      gradient: [COLORS.secondary, '#328E85'] as [string, string],
      route: '/(tabs)/chat',
    },
    {
      id: 4,
      title: 'Прогресс',
      description: 'Ваши достижения и награды',
      icon: <Award size={28} color="#FFFFFF" strokeWidth={2} />,
      gradient: ['#9661C9', '#7A45B7'] as [string, string],
      route: '/(tabs)/progress',
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header with greeting and search */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Привет, {user?.name || 'Гость'}! 👋</Text>
          <Text style={styles.subGreeting}>Готовы к новым знаниям?</Text>
        </View>
        {/* <TouchableOpacity style={styles.searchButton}>
          <Search size={20} color={COLORS.primary} />
        </TouchableOpacity> */}
      </View>

      {/* Main Features */}
      <View style={{ paddingHorizontal: 20 }}>
        <Text style={[styles.sectionTitle, { paddingHorizontal: 0 }]}>Основные функции</Text>
      </View>
      <View style={styles.featureGrid}>
        {featureCards.map(card => (
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
              <View style={styles.featureCardIcon}>{card.icon}</View>
              <View style={{ width: '100%', paddingBottom: 15 }}>
                <Text style={styles.featureCardTitle}>{card.title}</Text>
                <Text style={styles.featureCardDescription}>{card.description}</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))}
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
