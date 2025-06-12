import { useAuth } from '@/hooks/useAuth';
import apiClient from '@/api/client';
import LearningTrackCard from '@/components/LearningTrackCard';
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
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
  Modal,
} from 'react-native';
import { Track } from '@/types/track';

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
  const [recentTracks, setRecentTracks] = useState<Track[]>([]);
  const [tracksLoading, setTracksLoading] = useState(true);
  const [tracksError, setTracksError] = useState<string | null>(null);
  const [showChatModal, setShowChatModal] = useState(false);

  useEffect(() => {
    if (!user?.personalityType) {
      router.replace('/mbti');
    }
    apiClient.tracks.getAll()
       .then(res => {
         setRecentTracks(res.data.slice(0, 3));
         setTracksLoading(false);
       })
       .catch(err => {
         setTracksError('Не удалось загрузить треки');
         setTracksLoading(false);
       });
  }, [user]);

  const featureCards = [
    {
      id: 1,
      title: 'Треки',
      description: 'Твой персонализированный план обучение',
      icon: <BookOpen size={28} color="#FFFFFF" strokeWidth={2} />,
      gradient: [COLORS.primary, '#424D9D'] as [string, string],
      route: '/(tabs)/learning-tracks',
    },
    {
      id: 2,
      title: 'Чат',
      description: 'Общение и поддержка',
      icon: <MessageCircle size={28} color="#FFFFFF" strokeWidth={2} />,
      gradient: [COLORS.secondary, '#328E85'] as [string, string],
      route: 'chat',
    },
  ];

  const handleFeaturePress = (route: string) => {
    if (route === 'chat') {
      setShowChatModal(true);
    } else {
      router.navigate(route as any);
    }
  };

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
            onPress={() => handleFeaturePress(card.route)}
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

      {/* Chat Modal */}
      <Modal
        visible={showChatModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowChatModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Данная функция находится в разработке</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowChatModal(false)}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Recent Tracks Section */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { paddingHorizontal: 0 }]}>Недавние треки</Text>
        <TouchableOpacity onPress={() => router.navigate('/(tabs)/learning-tracks' as any)}>
          <Text style={styles.seeAllLink}>Все треки</Text>
        </TouchableOpacity>
      </View>
      {tracksLoading ? (
        <View style={{ paddingHorizontal: 20, paddingBottom: 10 }}>
          <Text style={{ color: COLORS.textSecondary }}>Загрузка...</Text>
        </View>
      ) : tracksError ? (
        <View style={{ paddingHorizontal: 20, paddingBottom: 10 }}>
          <Text style={{ color: COLORS.textSecondary }}>{tracksError}</Text>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.coursesContainer}
        >
          {recentTracks.map(track => (
            <View key={track._id} style={{ marginRight: 16, width: 260 }}>
              <LearningTrackCard track={track} onPress={() => router.push(`/(tabs)/learning-tracks/${track._id}`)} />
            </View>
          ))}
        </ScrollView>
      )}

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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 24,
    width: '80%',
    alignItems: 'center',
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  modalText: {
    fontSize: 16,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '500',
  },
  modalButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
