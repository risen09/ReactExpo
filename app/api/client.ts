import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LearningTrack } from '../models/LearningAgents';
import { Track } from '../types/track';
import { Lesson } from '../types/lesson';

// Базовый URL API из переменных окружения или резервный URL
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://j0cl9aplcsh5.share.zrok.io';
const FALLBACK_API_URL = 'https://j0cl9aplcsh5.share.zrok.io';
const LOCAL_MOCK_API_URL = 'http://localhost:3000'; // Локальный мок-сервер для разработки

// Функция для проверки доступности сервера
const checkServerAvailability = async (url: string): Promise<boolean> => {
  try {
    // Попробуем проверить базовую доступность без использования /api/health,
    // так как это может требовать авторизации (код ответа 401)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    const response = await fetch(`${url}`, {
      method: 'HEAD',
      headers: { 'Accept': 'application/json' },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    // Считаем сервер доступным, если получили любой ответ
    return response.status < 500;
  } catch (error) {
    console.warn(`Server at ${url} is not available:`, error);
    return false;
  }
};

// Инициализация с проверкой доступности серверов
let BASE_URL = API_BASE_URL;

// Проверяем доступность серверов при загрузке
(async () => {
  try {
    const isPrimaryAvailable = await checkServerAvailability(API_BASE_URL);
    
    if (!isPrimaryAvailable) {
      console.log('Primary API server is not available, switching to fallback URL');
      BASE_URL = FALLBACK_API_URL;
      
      // Проверяем доступность резервного URL
      const isFallbackAvailable = await checkServerAvailability(FALLBACK_API_URL);
      if (!isFallbackAvailable) {
        console.log('Fallback API server is not available, trying local mock server');
        
        // Проверяем доступность локального мок-сервера
        const isLocalMockAvailable = await checkServerAvailability(LOCAL_MOCK_API_URL);
        if (isLocalMockAvailable) {
          console.log('Connected to local mock server');
          BASE_URL = LOCAL_MOCK_API_URL;
        } else {
          console.error('All API servers are not available. Using fallback but expect errors.');
        }
      } else {
        console.log('Successfully connected to fallback API server');
      }
    } else {
      console.log('Successfully connected to primary API server');
    }
  } catch (error) {
    console.error('Error checking server availability:', error);
  }
})();

// Создаем инстанс axios с настройками
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Интерцептор для добавления токена авторизации
api.interceptors.request.use(
  async (config: any) => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (token) {
        if (!config.headers) config.headers = {};
        config.headers.Authorization = `Bearer ${token}`;
        
        // Добавляем дополнительную информацию для отладки
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] API Request: ${config.method?.toUpperCase()} ${config.url}`);
      } else {
        console.warn('Токен авторизации отсутствует');
      }
    } catch (error) {
      console.error('Ошибка при получении токена:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Интерцептор для обработки ответов
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Проверяем, есть ли ответ вообще (проблемы сети, DNS и т.д.)
    if (!error.response) {
      // Повторяем запрос до трех раз в случае сетевых ошибок
      if (!originalRequest._retry || originalRequest._retry < 3) {
        originalRequest._retry = (originalRequest._retry || 0) + 1;
        console.log(`[API] Повторная попытка (${originalRequest._retry}/3) для ${originalRequest.url}`);
        
        // Пауза перед повторной попыткой (возрастающая)
        const delay = originalRequest._retry * 1000; // 1s, 2s, 3s
        await new Promise(resolve => setTimeout(resolve, delay));
        
        return api(originalRequest);
      }
      return Promise.reject(new Error('Невозможно установить соединение с сервером после нескольких попыток'));
    }
    
    // Если ошибка 401 (неавторизован) и не было попытки обновить токен
    if (error.response?.status === 401 && !originalRequest._authRetry) {
      originalRequest._authRetry = true;
      
      try {
        // Обновляем токен
        const refreshToken = await AsyncStorage.getItem('refresh_token');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }
        
        const response = await axios.post(`${BASE_URL}/api/auth/refresh`, {
          refresh_token: refreshToken
        });
        
        const { token } = response.data as { token: string };
        
        // Сохраняем новый токен
        await AsyncStorage.setItem('auth_token', token);
        
        // Обновляем заголовок и повторяем запрос
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Если не удалось обновить токен, перенаправляем на логин
        await AsyncStorage.removeItem('auth_token');
        await AsyncStorage.removeItem('refresh_token');
        // Здесь можно добавить навигацию на экран логина
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Экспортируем различные методы API для удобного использования
export default {
  // Аутентификация
  auth: {
    login: (email: string, password: string) => 
      api.post('/api/login', { email, password }),
    register: (userData: any) => 
      api.post('/api/register', userData),
    logout: () => 
      api.post('/api/logout'),
    // Добавляем функцию для проверки авторизации
    checkAuth: () => 
      api.get('/api/user'),
    // Функция обновления токена
    refreshToken: (refreshToken: string) => 
      api.post('/api/auth/refresh', { refresh_token: refreshToken }),
  },
  
  // Профиль пользователя
  user: {
    getProfile: () => 
      api.get('/api/user/profile'),
    updateProfile: (profileData: any) => 
      api.put('/api/user/profile', profileData),
  },
  
  // Прогресс обучения
  progress: {
    getProgressStats: () => 
      api.get('/api/learning/progress'),
    getAchievements: () => 
      api.get('/api/learning/achievements'),
    getStreaks: () => 
      api.get('/api/learning/streaks'),
    getStars: () => 
      api.get('/api/learning/stars'),
  },
  
  // Треки обучения
  tracks: {
    getAll: () => 
      api.get<Track[]>('/api/tracks'),
    getById: (trackId: string) => 
      api.get<Track>(`/api/tracks/${trackId}`),
    requestLesson: (trackId: string, topic: string) =>
      api.post<{ lessonId: string }>(`/api/tracks/${trackId}/requestLesson`, { 
        topic
       }, {
        timeout: 1000000,
       }),
    startTrack: (trackId: string) => 
      api.post(`/api/learning/tracks/${trackId}/start`),
    completeLesson: (trackId: string, lessonId: string) => 
      api.post(`/api/learning/tracks/${trackId}/lessons/${lessonId}/complete`),
  },
  
  lessons: {
    getById: (lessonId: string) =>
      api.get<Lesson>(`/api/lessons/${lessonId}`),
  },
  
  // AI ассистенты: предметные эксперты
  experts: {
    getList: () => 
      api.get('/api/experts/list'),
    create: (subject: string) => 
      api.post('/api/experts/new', { subject }),
    getChat: (chatId: string) => 
      api.get(`/api/experts/chat/${chatId}`),
    sendMessage: (chatId: string, message: string) => 
      api.post(`/api/experts/chat/${chatId}`, { message }),
  },
  
  // AI ассистенты: помощник по домашним заданиям
  homework: {
    getList: () => 
      api.get('/api/homework/list'),
    create: (subject: string, title: string) => 
      api.post('/api/homework/new', { subject, title }),
    getById: (homeworkId: string) => 
      api.get(`/api/homework/chat/${homeworkId}`),
    sendMessage: (homeworkId: string, message: string) => 
      api.post(`/api/homework/chat/${homeworkId}`, { message }),
    markComplete: (homeworkId: string) => 
      api.post(`/api/homework/complete/${homeworkId}`),
  },
  
  // AI ассистенты: учебные планы
  studyPlans: {
    getList: () => 
      api.get('/api/study-plans/list'),
    generate: (planData: { subject: string, goal: string, timeframe?: string, difficulty?: string }) => 
      api.post('/api/study-plans/generate', planData),
    getById: (planId: string) => 
      api.get(`/api/study-plans/${planId}`),
    updateStatus: (planId: string, status: 'active' | 'completed' | 'paused' | 'archived') => 
      api.post(`/api/study-plans/${planId}/status`, { status }),
  },
  
  // AI ассистенты: ассистент трека обучения
  trackAssistants: {
    create: (trackId: string) => 
      api.post(`/api/track-assistants/create/${trackId}`),
    askQuestion: (assistantId: string, message: string, lessonId?: string) => 
      api.post(`/api/track-assistants/${assistantId}/ask`, { message, lessonId }),
  },
  
  // AI ассистенты: анализ прогресса
  progressAnalysis: {
    analyzeTrack: (trackId: string) => 
      api.post(`/api/progress-analyzer/analyze/${trackId}`),
  },

  // Расписание обучения
  schedule: {
    getSettings: () => 
      api.get('/api/schedule/settings'),
    saveSettings: (settings: any) => 
      api.post('/api/schedule/settings', settings),
    getSchedule: () => 
      api.get('/api/schedule'),
    generate: (options: { trackId: string, startDate?: string, endDate?: string }) => 
      api.post('/api/schedule/generate', options),
    markCompleted: (itemId: string) => 
      api.post(`/api/schedule/items/${itemId}/complete`),
    reschedule: (itemId: string, newSchedule: { date: string, startTime: string, endTime: string }) => 
      api.put(`/api/schedule/items/${itemId}`, newSchedule),
  },
  
  // Общий метод GET
  get: (url: string, params?: any) => 
    api.get(url, { params }),
  
  // Общий метод POST
  post: (url: string, data?: any) => 
    api.post(url, data),
  
  // Общий метод PUT
  put: (url: string, data?: any) => 
    api.put(url, data),
  
  // Общий метод DELETE
  delete: (url: string) => 
    api.delete(url),
  
  // GigaChat API (убираем mock, добавляем диагностические методы)
  gigachat: {
    new: () => 
      api.post('/api/gigachat/new'),
    list: () => 
      api.get('/api/gigachat/list'),
    sendMessage: (chatId: string, message: string) => 
      api.post(`/api/gigachat/chat/${chatId}`, { message }),
    getHistory: (chatId: string) => 
      api.get(`/api/gigachat/chat/${chatId}`),
    analyzeSubject: (chatId: string, subject: string, topic?: string) => 
      api.post(`/api/gigachat/analyze`, { chatId, subject, topic }),
  },
  
  // Начальная диагностика
  initial_diagnostics: {
    new: () => 
      api.post('/api/initial-diagnostics/new'),
    get: (chatId: string) => 
      api.get(`/api/initial-diagnostics/${chatId}`),
    sendMessage: (chatId: string, message: string) => 
      api.post('/api/initial-diagnostics/sendMessage', {
        chat_id: chatId,
        message
      }),
    list: () => 
      api.get('/api/initial-diagnostics'),
  },
  
  // Тесты и диагностика
  tests: {
    // Существующие методы
    startInitialTest: (subject: string, topic: string) => 
      api.post('/api/tests/initial', { subject, topic }),
    startFullSubjectTest: (subject: string) => 
      api.post('/api/tests/subject', { subject }),
    getQuestions: (testId: string) => 
      api.get(`/api/tests/${testId}/questions`),
    submitAnswer: (testId: string, questionId: string, answer: any) => 
      api.post(`/api/tests/${testId}/questions/${questionId}/answer`, { answer }),
    getResult: (testId: string) => 
      api.get(`/api/tests/${testId}/result`),
    
    // Новые методы для работы с тестами
    generate: (subject: string, topic: string, difficulty: string) => 
      api.post('/api/tests/generate', { subject, topic, difficulty }),
    getById: (testId: string) => 
      api.get(`/api/tests/${testId}`),
    submit: (testId: string, answers: any[]) => 
      api.post(`/api/tests/${testId}/submit`, { answers }),
    getRecommendations: (testId: string) => 
      api.get(`/api/tests/${testId}/recommendations`),
  },
}; 