import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Plus } from 'lucide-react-native';
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';

import LearningTrackCard from '../../../components/LearningTrackCard';
import { useAuth } from '../../../hooks/useAuth';
import logger from '../../../utils/logger';

import { Track } from '@/types/track';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

// Общая цветовая палитра приложения
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

export default function LearningTracksScreen() {
  const { token } = useAuth();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Загрузка треков обучения из хранилища или API
    const loadTracks = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/tracks`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error('Failed to load tracks.');
        }

        setTracks(data);
      } catch (error) {
        logger.error('Error loading learning tracks', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTracks();
  }, []);

  const handleTrackPress = (track: Track) => {
    router.push({
      pathname: `/learning-tracks/${track._id}`,
      params: { trackId: track._id },
    } as any);
  };

  const handleCreateTrack = () => {
    // В реальном приложении здесь был бы переход к созданию трека
    // или вызов чат-ассистента
    router.push('/');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

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
          <TouchableOpacity style={styles.startChatButton} onPress={() => router.push('/')}>
            <Text style={styles.startChatButtonText}>Начать чат</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={tracks}
          renderItem={({ item }) => (
            <LearningTrackCard track={item} onPress={() => handleTrackPress(item)} />
          )}
          keyExtractor={item => item._id}
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
