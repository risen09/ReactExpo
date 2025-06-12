import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { get } from 'axios';

import { Lesson } from '../types/lesson';
import { Track } from '../types/track';
import { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse, VkLoginRequest } from '@/types/auth';
import { User } from '@/types/user';
import { TestInitialResponse, TestResponse } from '../types/test';
import { Assignment, SubmissionResponse } from '@/types/assignment';

// Базовый URL API из переменных окружения или резервный URL
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

// Функция для проверки доступности сервера
const checkServerAvailability = async (url: string): Promise<boolean> => {
  try {
    // Попробуем проверить базовую доступность без использования /api/health,
    // так как это может требовать авторизации (код ответа 401)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const response = await fetch(`${url}`, {
      method: 'HEAD',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Считаем сервер доступным, если получили любой ответ
    return response.status < 500;
  } catch (error) {
    console.warn(`Server at ${url} is not available:`, error);
    return false;
  }
};

// Проверяем доступность серверов при загрузке
(async () => {
  try {
    if (!API_BASE_URL) {
      console.warn('API_BASE_URL is not defined.');
    }
    const isPrimaryAvailable = await checkServerAvailability(API_BASE_URL!);

    if (!isPrimaryAvailable) {
      console.error('Primary API server is not available');
    } else {
      console.log('Successfully connected to primary API server');
    }
  } catch (error) {
    console.error('Error checking server availability:', error);
  }
})();

// Создаем инстанс axios с настройками
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
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
  error => Promise.reject(error)
);

// Интерцептор для обработки ответов
api.interceptors.response.use(
  response => {
    return response;
  },
  async error => {
    const originalRequest = error.config;

    // Проверяем, есть ли ответ вообще (проблемы сети, DNS и т.д.)
    if (!error.response) {
      // Повторяем запрос до трех раз в случае сетевых ошибок
      if (!originalRequest._retry || originalRequest._retry < 3) {
        originalRequest._retry = (originalRequest._retry || 0) + 1;
        console.log(
          `[API] Повторная попытка (${originalRequest._retry}/3) для ${originalRequest.url}`
        );

        // Пауза перед повторной попыткой (возрастающая)
        const delay = originalRequest._retry * 1000; // 1s, 2s, 3s
        await new Promise(resolve => setTimeout(resolve, delay));

        return api(originalRequest);
      }
      return Promise.reject(
        new Error('Невозможно установить соединение с сервером после нескольких попыток')
      );
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

        const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
          refresh_token: refreshToken,
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
    login: (loginData: LoginRequest) => api.post<LoginResponse>('/api/v2/auth/login', loginData),
    register: (userData: RegisterRequest) => api.post<RegisterResponse>('/api/v2/auth/register', userData),
    logout: () => api.post('/api/logout'),
    // Добавляем функцию для проверки авторизации
    checkAuth: () => api.get('/api/user'),
    // Функция обновления токена
    refreshToken: (refreshToken: string) =>
      api.post('/api/auth/refresh', { refresh_token: refreshToken }),

    vk: {
      login: (request: VkLoginRequest) => api.post<LoginResponse>('/api/v2/auth/vk', request),
    }
  },

  // Пользователи
  users: {
    update: (id: string, userData: Partial<User>) => api.post(`/api/users/${id}`, userData),
    getById: (userId: string) => api.get<User>(`/api/v2/users/${userId}`),
  },

  user: {
    get: () => api.get<User>('/api/v2/user'),
    update: (userData: Partial<User>) => api.post<User>('/api/v2/user', userData),
  },

  // Треки обучения
  tracks: {
    getAll: () => api.get<Track[]>('/api/v2/tracks'),
    getById: (trackId: string) => api.get<Track>(`/api/v2/tracks/${trackId}`),
    requestLesson: (trackId: string, topic: string) =>
      api.post<{ lessonId: string }>(
        `/api/v2/tracks/${trackId}/requestLesson`,
        {
          topic,
        },
        {
          timeout: 1000000,
        }
      ),
  },

  lessons: {
    getById: (lessonId: string) => api.get<Lesson>(`/api/lessons/${lessonId}`),
  },

  assignments: {
    getById: (assignmentId: string) => api.get<Assignment>(`/api/v1/assignments/${assignmentId}`),
    submit: (assignmentId: string, taskId: number, submission: string) => api.post<SubmissionResponse>(`/api/v1/assignments/${assignmentId}/submit/${taskId}`, { submission }),
  }, 

  tests: {
    startInitialTest: (subject: string, topic: string, sub_topic: string | undefined, difficulty: string, grade: number) =>
      api.post<TestInitialResponse>('/api/tests/startInitialTest', { subject, topic, sub_topic, difficulty, grade }),
    getById: (testId: string) => api.get<TestResponse>(`/api/tests/${testId}`),
    submit: (testId: string, answers: any[]) => api.post(`/api/tests/${testId}/submit`, { answers }, {
      timeout: 120000
    }),
  },

  // GigaChat API
  gigachat: {
    new: () => api.post('/api/gigachat/new'),
    list: () => api.get('/api/gigachat/list'),
    sendMessage: (chatId: string, message: string) =>
      api.post(`/api/gigachat/chat/${chatId}`, { message }),
    getHistory: (chatId: string) => api.get(`/api/gigachat/chat/${chatId}`),
  },

  // Общий метод GET
  get: (url: string, params?: any) => api.get(url, { params }),

  // Общий метод POST
  post: (url: string, data?: any) => api.post(url, data),

  // Общий метод PUT
  put: (url: string, data?: any) => api.put(url, data),

  // Общий метод DELETE
  delete: (url: string) => api.delete(url),

};
