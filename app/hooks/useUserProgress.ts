import { useState, useEffect, useCallback } from 'react';
import api from '../api/client';

export interface UserProgressStats {
  totalCompletedLessons: number;
  totalLessonsToComplete: number;
  totalCompletedTracks: number;
  totalTracksEnrolled: number;
  avgDailyStudyTimeMinutes: number;
  weeklyActivityData: {
    date: string;
    minutesLearned: number;
  }[];
  mostActiveDay: string; // день недели ('monday', 'tuesday', etc)
  longestStreak: number;
  currentStreak: number;
  totalStarsEarned: number;
  level: number;
  starsToNextLevel: number;
}

export const useUserProgress = () => {
  const [progressStats, setProgressStats] = useState<UserProgressStats | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProgressStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.progress.getProgressStats();
      setProgressStats(response.data);
    } catch (err) {
      setError('Не удалось загрузить статистику прогресса');
      console.error('Error fetching progress stats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Функция для обновления данных о прогрессе после завершения урока
  const updateProgressAfterLesson = useCallback(async (trackId: string, lessonId: string, minutesSpent: number) => {
    setLoading(true);
    
    try {
      await api.tracks.completeLesson(trackId, lessonId);
      
      // Обновляем локальную статистику
      if (progressStats) {
        setProgressStats(prev => {
          if (!prev) return prev;
          
          // Обновляем общую статистику
          const updatedStats = {
            ...prev,
            totalCompletedLessons: prev.totalCompletedLessons + 1,
            totalStarsEarned: prev.totalStarsEarned + 1, // Предполагаем, что за каждый урок дается 1 звезда
          };
          
          // Обновляем данные об активности за день
          const today = new Date().toISOString().slice(0, 10);
          const updatedWeeklyActivity = [...prev.weeklyActivityData];
          const todayIndex = updatedWeeklyActivity.findIndex(day => day.date === today);
          
          if (todayIndex >= 0) {
            updatedWeeklyActivity[todayIndex].minutesLearned += minutesSpent;
          } else {
            updatedWeeklyActivity.push({
              date: today,
              minutesLearned: minutesSpent
            });
          }
          
          return {
            ...updatedStats,
            weeklyActivityData: updatedWeeklyActivity,
            avgDailyStudyTimeMinutes: calculateAvgDailyTime(updatedWeeklyActivity)
          };
        });
      }
      
      // После обновления локальных данных, можно запросить свежие с сервера
      fetchProgressStats();
    } catch (err) {
      setError('Не удалось обновить прогресс');
      console.error('Error updating progress after lesson:', err);
    } finally {
      setLoading(false);
    }
  }, [progressStats, fetchProgressStats]);

  // Вспомогательная функция для расчета среднего времени обучения в день
  const calculateAvgDailyTime = (weeklyData: { date: string, minutesLearned: number }[]) => {
    if (!weeklyData.length) return 0;
    
    const totalMinutes = weeklyData.reduce((sum, day) => sum + day.minutesLearned, 0);
    return Math.round(totalMinutes / weeklyData.length);
  };

  // Функция для проверки, завершен ли трек
  const isTrackCompleted = useCallback((trackId: string, totalLessonsInTrack: number, completedLessonsInTrack: number) => {
    return completedLessonsInTrack === totalLessonsInTrack;
  }, []);

  // Получить прогресс для конкретного трека (в процентах)
  const getTrackProgress = useCallback((totalLessons: number, completedLessons: number) => {
    if (totalLessons === 0) return 0;
    return Math.round((completedLessons / totalLessons) * 100);
  }, []);

  // Загружаем данные при монтировании компонента
  useEffect(() => {
    fetchProgressStats();
  }, [fetchProgressStats]);

  return {
    progressStats,
    loading,
    error,
    fetchProgressStats,
    updateProgressAfterLesson,
    isTrackCompleted,
    getTrackProgress
  };
};

// Пример данных для тестирования и демонстрации
export const mockProgressStats: UserProgressStats = {
  totalCompletedLessons: 42,
  totalLessonsToComplete: 120,
  totalCompletedTracks: 2,
  totalTracksEnrolled: 5,
  avgDailyStudyTimeMinutes: 35,
  weeklyActivityData: [
    { date: '2023-10-10', minutesLearned: 45 },
    { date: '2023-10-11', minutesLearned: 30 },
    { date: '2023-10-12', minutesLearned: 60 },
    { date: '2023-10-13', minutesLearned: 0 },
    { date: '2023-10-14', minutesLearned: 20 },
    { date: '2023-10-15', minutesLearned: 50 },
    { date: '2023-10-16', minutesLearned: 40 }
  ],
  mostActiveDay: 'wednesday',
  longestStreak: 5,
  currentStreak: 3,
  totalStarsEarned: 58,
  level: 3,
  starsToNextLevel: 12
};

// Мок-реализация хука для тестирования
export const useMockUserProgress = () => {
  const [progressStats, setProgressStats] = useState<UserProgressStats>(mockProgressStats);
  const [loading, setLoading] = useState<boolean>(false);
  
  const updateProgressAfterLesson = (trackId: string, lessonId: string, minutesSpent: number) => {
    setLoading(true);
    
    setTimeout(() => {
      setProgressStats(prev => ({
        ...prev,
        totalCompletedLessons: prev.totalCompletedLessons + 1,
        totalStarsEarned: prev.totalStarsEarned + 1,
        weeklyActivityData: prev.weeklyActivityData.map((day, index) => 
          index === prev.weeklyActivityData.length - 1
            ? { ...day, minutesLearned: day.minutesLearned + minutesSpent }
            : day
        )
      }));
      setLoading(false);
    }, 500);
    
    return Promise.resolve();
  };
  
  return {
    progressStats,
    loading,
    error: null,
    fetchProgressStats: () => Promise.resolve(),
    updateProgressAfterLesson,
    isTrackCompleted: () => false,
    getTrackProgress: (total: number, completed: number) => Math.round((completed / total) * 100)
  };
}; 