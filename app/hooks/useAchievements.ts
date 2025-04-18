import { useState, useEffect, useCallback } from 'react';
import api from '../api/client';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  iconUrl: string;
  unlockedAt?: string;  // Дата и время получения достижения
  isUnlocked: boolean;
  category: 'learning' | 'streak' | 'completion' | 'exploration';
  requiredCriteria: string; // Описание требований для получения
}

export interface StarProgress {
  totalEarned: number;
  currentLevel: number;
  nextLevelRequirement: number;
  progressToNextLevel: number; // от 0 до 1
}

export interface Streak {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate?: string;
  streakHistory: {
    date: string;
    hasActivity: boolean;
  }[];
}

export const useAchievements = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [starProgress, setStarProgress] = useState<StarProgress | null>(null);
  const [streakData, setStreakData] = useState<Streak | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAchievements = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.progress.getAchievements();
      setAchievements(response.data);
    } catch (err) {
      setError('Не удалось загрузить достижения');
      console.error('Error fetching achievements:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStarProgress = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.progress.getStars();
      setStarProgress(response.data);
    } catch (err) {
      setError('Не удалось загрузить прогресс звезд');
      console.error('Error fetching star progress:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStreakData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.progress.getStreaks();
      setStreakData(response.data);
    } catch (err) {
      setError('Не удалось загрузить данные о серии');
      console.error('Error fetching streak data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAllProgressData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        fetchAchievements(),
        fetchStarProgress(),
        fetchStreakData()
      ]);
    } catch (err) {
      setError('Не удалось загрузить все данные о прогрессе');
      console.error('Error fetching all progress data:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchAchievements, fetchStarProgress, fetchStreakData]);

  // Загружаем данные при монтировании компонента
  useEffect(() => {
    fetchAllProgressData();
  }, [fetchAllProgressData]);

  // Проверка, готова ли к получению новая звезда
  const hasNewStarAvailable = useCallback(() => {
    if (!starProgress) return false;
    return starProgress.progressToNextLevel >= 1;
  }, [starProgress]);

  // Проверка активности серии (стрика)
  const isStreakActive = useCallback(() => {
    if (!streakData || !streakData.lastActivityDate) return false;
    
    const now = new Date();
    const lastActivity = new Date(streakData.lastActivityDate);
    const diffTime = Math.abs(now.getTime() - lastActivity.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays <= 1; // Серия активна, если последняя активность была сегодня или вчера
  }, [streakData]);

  return {
    achievements,
    starProgress,
    streakData,
    loading,
    error,
    fetchAchievements,
    fetchStarProgress,
    fetchStreakData,
    fetchAllProgressData,
    hasNewStarAvailable,
    isStreakActive
  };
};

// Примеры данных для демо (можно удалить при интеграции с реальным API)
export const mockAchievements: Achievement[] = [
  {
    id: '1',
    title: 'Первые шаги',
    description: 'Завершите свой первый урок',
    iconUrl: 'https://example.com/achievement1.png',
    unlockedAt: '2023-10-05T12:30:00Z',
    isUnlocked: true,
    category: 'learning',
    requiredCriteria: 'Завершить 1 урок'
  },
  {
    id: '2',
    title: 'Неделя знаний',
    description: 'Учитесь 7 дней подряд',
    iconUrl: 'https://example.com/achievement2.png',
    isUnlocked: false,
    category: 'streak',
    requiredCriteria: '7 дней активности подряд'
  },
  {
    id: '3',
    title: 'Мастер Python',
    description: 'Завершите курс по Python на 100%',
    iconUrl: 'https://example.com/achievement3.png',
    isUnlocked: false,
    category: 'completion',
    requiredCriteria: 'Завершить курс "Основы Python"'
  }
];

export const mockStarProgress: StarProgress = {
  totalEarned: 45,
  currentLevel: 2,
  nextLevelRequirement: 60,
  progressToNextLevel: 0.75
};

export const mockStreakData: Streak = {
  currentStreak: 3,
  longestStreak: 5,
  lastActivityDate: new Date().toISOString(), // Сегодня
  streakHistory: [
    { date: '2023-10-10', hasActivity: true },
    { date: '2023-10-11', hasActivity: true },
    { date: '2023-10-12', hasActivity: true },
    { date: '2023-10-13', hasActivity: false },
    { date: '2023-10-14', hasActivity: true },
    { date: '2023-10-15', hasActivity: true },
    { date: '2023-10-16', hasActivity: true }
  ]
};

// Мок-реализация хука для демо и тестирования
export const useMockAchievements = () => {
  const [achievements, setAchievements] = useState<Achievement[]>(mockAchievements);
  const [starProgress, setStarProgress] = useState<StarProgress>(mockStarProgress);
  const [streakData, setStreakData] = useState<Streak>(mockStreakData);
  const [loading, setLoading] = useState<boolean>(false);
  
  const fetch = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 500);
    return Promise.resolve();
  }, []);

  return {
    achievements,
    starProgress,
    streakData,
    loading,
    error: null,
    fetchAchievements: fetch,
    fetchStarProgress: fetch,
    fetchStreakData: fetch,
    fetchAllProgressData: fetch,
    hasNewStarAvailable: () => true,
    isStreakActive: () => true
  };
}; 