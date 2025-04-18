import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { LearningTrack } from '../models/LearningAgents';
import LearningTrackCard from '../components/LearningTrackCard';
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

export default function LearningTracksScreen() {
  const { user } = useAuth();
  const [tracks, setTracks] = useState<LearningTrack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Загрузка треков обучения из хранилища или API
    const loadTracks = async () => {
      try {
        setIsLoading(true);
        
        // В реальном приложении здесь был бы запрос к API
        // Для демонстрации используем моковые данные
        const mockTracks: LearningTrack[] = [
          {
            id: '1',
            name: 'Квадратные уравнения',
            description: 'Изучение квадратных уравнений и методов их решения',
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
                completed: true
              },
              {
                id: 'lesson-2',
                title: 'Теорема Виета',
                content: 'Содержание урока о теореме Виета...',
                difficulty: 2,
                stars: 1,
                assignments: [],
                examples: [],
                completed: false
              }
            ],
            tests: []
          },
          {
            id: '2',
            name: 'Основы программирования',
            description: 'Изучение основ программирования на Python',
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
                completed: true
              },
              {
                id: 'lesson-py-2',
                title: 'Условные операторы',
                content: 'Содержание урока об условных операторах...',
                difficulty: 1,
                stars: 2,
                assignments: [],
                examples: [],
                completed: true
              },
              {
                id: 'lesson-py-3',
                title: 'Циклы',
                content: 'Содержание урока о циклах...',
                difficulty: 2,
                stars: 0,
                assignments: [],
                examples: [],
                completed: false
              }
            ],
            tests: []
          }
        ];
        
        setTracks(mockTracks);
      } catch (error) {
        logger.error('Error loading learning tracks', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTracks();
  }, []);
  
  const handleTrackPress = (track: LearningTrack) => {
    router.push(`/learning-track/${track.id}` as any);
  };
  
  const handleCreateTrack = () => {
    // В реальном приложении здесь был бы переход к созданию трека
    // или вызов чат-ассистента
    router.push('/');
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <Text style={styles.title}>Образовательные треки</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleCreateTrack}>
          <Plus size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      
      {isLoading ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Загрузка треков...</Text>
        </View>
      ) : tracks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>У вас пока нет треков обучения</Text>
          <Text style={styles.emptySubtext}>
            Начните чат с AI-ассистентом, чтобы создать свой первый образовательный трек
          </Text>
          <TouchableOpacity 
            style={styles.startChatButton}
            onPress={() => router.push('/')}
          >
            <Text style={styles.startChatButtonText}>Начать чат</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={tracks}
          renderItem={({ item }) => (
            <LearningTrackCard 
              track={item} 
              onPress={() => handleTrackPress(item)}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.tracksList}
          showsVerticalScrollIndicator={false}
        />
      )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  tracksList: {
    padding: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  startChatButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  startChatButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
}); 