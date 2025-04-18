import { useState, useEffect, useCallback } from 'react';
import api from '../api/client';
import { Track } from './useLearningTracks';

export interface ScheduleSettings {
  learningDays: boolean[];  // По дням недели (0 - воскресенье, 6 - суббота)
  dailyTimeMinutes: number; // Сколько минут в день выделяется на обучение
  preferredTimeOfDay: 'morning' | 'afternoon' | 'evening';
  exclusionDates: string[]; // Даты, когда пользователь не может учиться
}

export interface ScheduleItem {
  id: string;
  date: string;
  startTime: string; // HH:MM формат
  endTime: string;   // HH:MM формат
  trackId: string;
  lessonId: string;
  lessonTitle: string;
  isCompleted: boolean;
  isMissed: boolean;
}

export interface Schedule {
  items: ScheduleItem[];
  startDate: string;
  endDate: string;
  totalLessons: number;
  completedLessons: number;
}

export const useSchedule = () => {
  const [settings, setSettings] = useState<ScheduleSettings | null>(null);
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Загрузка настроек расписания пользователя
  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.schedule.getSettings();
      setSettings(response.data);
    } catch (err) {
      setError('Не удалось загрузить настройки расписания');
      console.error('Error fetching schedule settings:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Загрузка текущего расписания
  const fetchSchedule = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.schedule.getSchedule();
      setSchedule(response.data);
    } catch (err) {
      setError('Не удалось загрузить расписание');
      console.error('Error fetching schedule:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Сохранение настроек расписания
  const saveSettings = useCallback(async (newSettings: ScheduleSettings) => {
    setLoading(true);
    setError(null);
    
    try {
      await api.schedule.saveSettings(newSettings);
      setSettings(newSettings);
    } catch (err) {
      setError('Не удалось сохранить настройки расписания');
      console.error('Error saving schedule settings:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Генерация расписания для трека
  const generateSchedule = useCallback(async (trackId: string, options?: {
    startDate?: string,
    endDate?: string
  }) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.schedule.generate({
        trackId,
        ...options
      });
      setSchedule(response.data);
    } catch (err) {
      setError('Не удалось сгенерировать расписание');
      console.error('Error generating schedule:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Отметка урока как завершенного
  const markLessonCompleted = useCallback(async (itemId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await api.schedule.markCompleted(itemId);
      
      // Обновляем локальное состояние
      setSchedule(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          items: prev.items.map(item => 
            item.id === itemId
              ? { ...item, isCompleted: true }
              : item
          ),
          completedLessons: prev.completedLessons + 1
        };
      });
    } catch (err) {
      setError('Не удалось отметить урок как завершенный');
      console.error('Error marking lesson as completed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Перенос урока на другое время
  const rescheduleLesson = useCallback(async (itemId: string, newDate: string, newStartTime: string, newEndTime: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await api.schedule.reschedule(itemId, {
        date: newDate,
        startTime: newStartTime,
        endTime: newEndTime
      });
      
      // Обновляем локальное состояние
      setSchedule(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          items: prev.items.map(item => 
            item.id === itemId
              ? { ...item, date: newDate, startTime: newStartTime, endTime: newEndTime }
              : item
          )
        };
      });
    } catch (err) {
      setError('Не удалось перенести урок');
      console.error('Error rescheduling lesson:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Получение уроков на конкретную дату
  const getLessonsForDate = useCallback((date: string) => {
    if (!schedule) return [];
    return schedule.items.filter(item => item.date === date);
  }, [schedule]);

  // Получение уроков на текущую неделю
  const getLessonsForCurrentWeek = useCallback(() => {
    if (!schedule) return [];
    
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Воскресенье текущей недели
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Суббота текущей недели
    endOfWeek.setHours(23, 59, 59, 999);
    
    return schedule.items.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate >= startOfWeek && itemDate <= endOfWeek;
    });
  }, [schedule]);

  // Загружаем настройки при монтировании компонента
  useEffect(() => {
    fetchSettings();
    fetchSchedule();
  }, [fetchSettings, fetchSchedule]);

  return {
    settings,
    schedule,
    loading,
    error,
    fetchSettings,
    fetchSchedule,
    saveSettings,
    generateSchedule,
    markLessonCompleted,
    rescheduleLesson,
    getLessonsForDate,
    getLessonsForCurrentWeek
  };
};

// Примеры данных для демо (можно удалить при интеграции с реальным API)
export const mockScheduleSettings: ScheduleSettings = {
  learningDays: [false, true, true, true, true, true, false], // Пн-Пт
  dailyTimeMinutes: 45,
  preferredTimeOfDay: 'evening',
  exclusionDates: ['2023-12-25', '2024-01-01']
};

export const mockSchedule: Schedule = {
  items: [
    {
      id: '1',
      date: '2023-10-16',
      startTime: '18:30',
      endTime: '19:15',
      trackId: '1',
      lessonId: '101',
      lessonTitle: 'Введение в Python',
      isCompleted: false,
      isMissed: false
    },
    {
      id: '2',
      date: '2023-10-17',
      startTime: '18:30',
      endTime: '19:15',
      trackId: '1',
      lessonId: '102',
      lessonTitle: 'Основы синтаксиса Python',
      isCompleted: false,
      isMissed: false
    },
    {
      id: '3',
      date: '2023-10-18',
      startTime: '18:30',
      endTime: '19:15',
      trackId: '1',
      lessonId: '103',
      lessonTitle: 'Условные операторы',
      isCompleted: false,
      isMissed: false
    }
  ],
  startDate: '2023-10-16',
  endDate: '2023-10-30',
  totalLessons: 10,
  completedLessons: 0
};

// Мок-реализация хука для демо и тестирования
export const useMockSchedule = () => {
  const [settings, setSettings] = useState<ScheduleSettings>(mockScheduleSettings);
  const [schedule, setSchedule] = useState<Schedule>(mockSchedule);
  const [loading, setLoading] = useState<boolean>(false);
  
  const generateRandomSchedule = (trackId: string) => {
    const now = new Date();
    const startDate = new Date(now);
    const items: ScheduleItem[] = [];
    
    for (let i = 0; i < 10; i++) {
      const itemDate = new Date(startDate);
      itemDate.setDate(startDate.getDate() + i);
      
      if (settings.learningDays[itemDate.getDay()]) {
        items.push({
          id: `${i+1}`,
          date: itemDate.toISOString().slice(0, 10),
          startTime: '18:30',
          endTime: '19:15',
          trackId,
          lessonId: `${100 + i}`,
          lessonTitle: `Урок ${i+1}`,
          isCompleted: false,
          isMissed: false
        });
      }
    }
    
    return {
      items,
      startDate: startDate.toISOString().slice(0, 10),
      endDate: items[items.length - 1].date,
      totalLessons: items.length,
      completedLessons: 0
    };
  };
  
  const saveSettings = (newSettings: ScheduleSettings) => {
    setLoading(true);
    setTimeout(() => {
      setSettings(newSettings);
      setLoading(false);
    }, 500);
    return Promise.resolve();
  };
  
  const generateSchedule = (trackId: string) => {
    setLoading(true);
    setTimeout(() => {
      setSchedule(generateRandomSchedule(trackId));
      setLoading(false);
    }, 500);
    return Promise.resolve();
  };
  
  const markLessonCompleted = (itemId: string) => {
    setLoading(true);
    setTimeout(() => {
      setSchedule(prev => ({
        ...prev,
        items: prev.items.map(item => 
          item.id === itemId
            ? { ...item, isCompleted: true }
            : item
        ),
        completedLessons: prev.completedLessons + 1
      }));
      setLoading(false);
    }, 500);
    return Promise.resolve();
  };
  
  const getLessonsForDate = (date: string) => {
    return schedule.items.filter(item => item.date === date);
  };
  
  const getLessonsForCurrentWeek = () => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    return schedule.items.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate >= startOfWeek && itemDate <= endOfWeek;
    });
  };
  
  return {
    settings,
    schedule,
    loading,
    error: null,
    fetchSettings: () => Promise.resolve(),
    fetchSchedule: () => Promise.resolve(),
    saveSettings,
    generateSchedule,
    markLessonCompleted,
    rescheduleLesson: () => Promise.resolve(),
    getLessonsForDate,
    getLessonsForCurrentWeek
  };
}; 