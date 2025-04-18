import { useState, useEffect, useCallback } from 'react';
import api from '../api/client';

export interface Track {
  id: string;
  title: string;
  description: string;
  totalLessons: number;
  completedLessons: number;
  progress: number;  // от 0 до 1
  thumbnailUrl?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string; // например, '2 часа'
  stars: number; // количество звезд получено
  totalStars: number; // всего можно получить звезд
  lastAccessedAt?: string; // Дата последнего доступа
}

export const useLearningTracks = () => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [activeTrack, setActiveTrack] = useState<Track | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTracks = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.tracks.getAll();
      setTracks(response.data);
    } catch (err) {
      setError('Не удалось загрузить треки обучения');
      console.error('Error fetching tracks:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTrackById = useCallback(async (trackId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.tracks.getById(trackId);
      setActiveTrack(response.data);
      return response.data;
    } catch (err) {
      setError('Не удалось загрузить данные трека');
      console.error('Error fetching track:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const startTrack = useCallback(async (trackId: string) => {
    try {
      await api.tracks.startTrack(trackId);
      return true;
    } catch (err) {
      console.error('Error starting track:', err);
      return false;
    }
  }, []);

  const completeLesson = useCallback(async (trackId: string, lessonId: string) => {
    try {
      await api.tracks.completeLesson(trackId, lessonId);
      // Обновляем данные о треке после завершения урока
      await fetchTrackById(trackId);
      return true;
    } catch (err) {
      console.error('Error completing lesson:', err);
      return false;
    }
  }, [fetchTrackById]);

  // Загружаем треки при монтировании компонента
  useEffect(() => {
    fetchTracks();
  }, [fetchTracks]);

  // Получение последнего активного трека
  const getLastActiveTrack = useCallback(() => {
    if (tracks.length === 0) return null;
    
    // Сортируем треки по времени последнего доступа (если доступно)
    const sortedTracks = [...tracks].sort((a, b) => {
      if (!a.lastAccessedAt) return 1;
      if (!b.lastAccessedAt) return -1;
      return new Date(b.lastAccessedAt).getTime() - new Date(a.lastAccessedAt).getTime();
    });
    
    return sortedTracks[0];
  }, [tracks]);

  return {
    tracks,
    activeTrack,
    loading,
    error,
    fetchTracks,
    fetchTrackById,
    startTrack,
    completeLesson,
    getLastActiveTrack
  };
};

// Примеры данных для демо (можно удалить при интеграции с реальным API)
export const mockTracks: Track[] = [
  {
    id: '1',
    title: 'Основы Python',
    description: 'Освоите базовые концепции языка Python и научитесь писать первые программы',
    totalLessons: 10,
    completedLessons: 7,
    progress: 0.7,
    thumbnailUrl: 'https://example.com/python.png',
    difficulty: 'beginner',
    estimatedTime: '2 часа',
    stars: 12,
    totalStars: 20,
    lastAccessedAt: '2023-10-12T14:30:00Z'
  },
  {
    id: '2',
    title: 'Алгоритмы и структуры данных',
    description: 'Изучите основные алгоритмы и структуры данных для эффективного решения задач',
    totalLessons: 15,
    completedLessons: 3,
    progress: 0.2,
    thumbnailUrl: 'https://example.com/algorithms.png',
    difficulty: 'intermediate',
    estimatedTime: '5 часов',
    stars: 5,
    totalStars: 30,
    lastAccessedAt: '2023-10-10T09:15:00Z'
  },
  {
    id: '3',
    title: 'Машинное обучение',
    description: 'Погрузитесь в основы машинного обучения и начните создавать свои модели',
    totalLessons: 12,
    completedLessons: 0,
    progress: 0,
    thumbnailUrl: 'https://example.com/ml.png',
    difficulty: 'advanced',
    estimatedTime: '8 часов',
    stars: 0,
    totalStars: 24,
  }
];

// Мок-реализация хука для демо и тестирования
export const useMockLearningTracks = () => {
  const [tracks, setTracks] = useState<Track[]>(mockTracks);
  const [activeTrack, setActiveTrack] = useState<Track | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTracks = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      setTracks(mockTracks);
      setLoading(false);
    }, 500);
    return Promise.resolve();
  }, []);

  const fetchTrackById = useCallback((trackId: string) => {
    setLoading(true);
    const track = mockTracks.find(t => t.id === trackId) || null;
    setTimeout(() => {
      setActiveTrack(track);
      setLoading(false);
    }, 500);
    return Promise.resolve(track);
  }, []);

  return {
    tracks,
    activeTrack,
    loading,
    error,
    fetchTracks,
    fetchTrackById,
    startTrack: () => Promise.resolve(true),
    completeLesson: () => Promise.resolve(true),
    getLastActiveTrack: () => tracks[0]
  };
}; 