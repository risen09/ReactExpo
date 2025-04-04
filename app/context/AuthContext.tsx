import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { User, AuthState, LoginCredentials, RegisterCredentials } from '../types/auth';

// Начальное состояние авторизации
const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Создаем контекст
interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (credentials: RegisterCredentials) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUserProfile: (userData: Partial<User>) => Promise<boolean>;
  updatePersonalityType: (type: string) => Promise<boolean>;
  checkAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Хук для использования контекста
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

const API_BASE_URL = 'https://your-api-url.com/api'; // Замените на ваш реальный API URL

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AuthState>(initialState);

  // Проверка аутентификации при запуске приложения
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const userData = await AsyncStorage.getItem('user');

        if (token && userData) {
          setState({
            user: JSON.parse(userData),
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } else {
          setState({
            ...initialState,
            isLoading: false,
          });
        }
      } catch (error) {
        console.error('Error loading user data', error);
        setState({
          ...initialState,
          isLoading: false,
          error: 'Failed to load user data',
        });
      }
    };

    loadUser();
  }, []);

  // Метод для проверки аутентификации
  const checkAuth = async (): Promise<boolean> => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userData = await AsyncStorage.getItem('user');
      
      if (token && userData) {
        setState({
          user: JSON.parse(userData),
          token,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error checking auth', error);
      return false;
    }
  };

  // Метод для входа в систему
  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    setState({
      ...state,
      isLoading: true,
      error: null,
    });

    try {
      // Симуляция API запроса (замените на реальный API вызов)
      // const response = await fetch(`${API_BASE_URL}/auth/login`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(credentials),
      // });
      // const data = await response.json();

      // Мокаем данные для примера
      const user: User = {
        id: '1',
        name: 'Пользователь',
        email: credentials.email,
        avatar: null,
        personalityType: null,
        created_at: new Date().toISOString(),
      };
      const token = 'sample-auth-token';

      // Сохраняем данные в AsyncStorage
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));

      setState({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return true;
    } catch (error) {
      console.error('Login error', error);
      setState({
        ...state,
        isLoading: false,
        error: 'Failed to login. Please check your credentials.',
      });
      return false;
    }
  };

  // Метод для регистрации
  const register = async (credentials: RegisterCredentials): Promise<boolean> => {
    setState({
      ...state,
      isLoading: true,
      error: null,
    });

    try {
      // Симуляция API запроса (замените на реальный API вызов)
      // const response = await fetch(`${API_BASE_URL}/auth/register`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(credentials),
      // });
      // const data = await response.json();

      // Мокаем данные для примера
      const user: User = {
        id: '1',
        name: credentials.name,
        email: credentials.email,
        avatar: null,
        personalityType: null,
        created_at: new Date().toISOString(),
      };
      const token = 'sample-auth-token';

      // Сохраняем данные в AsyncStorage
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));

      setState({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return true;
    } catch (error) {
      console.error('Register error', error);
      setState({
        ...state,
        isLoading: false,
        error: 'Failed to register. Please try again.',
      });
      return false;
    }
  };

  // Метод для выхода из системы
  const logout = async (): Promise<void> => {
    try {
      // Удаляем данные из AsyncStorage
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');

      setState({
        ...initialState,
        isLoading: false,
      });
      
      // Перенаправляем на экран логина
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Logout error', error);
    }
  };

  // Метод для обновления профиля пользователя
  const updateUserProfile = async (userData: Partial<User>): Promise<boolean> => {
    try {
      if (!state.user) {
        setState({
          ...state,
          error: 'User not authenticated',
        });
        return false;
      }

      // Симуляция API запроса для обновления профиля
      // const response = await fetch(`${API_BASE_URL}/users/${state.user.id}`, {
      //   method: 'PATCH',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${state.token}`,
      //   },
      //   body: JSON.stringify(userData),
      // });
      // const data = await response.json();

      // Обновляем локальные данные
      const updatedUser = { ...state.user, ...userData };
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));

      setState({
        ...state,
        user: updatedUser,
        error: null,
      });

      return true;
    } catch (error) {
      console.error('Update profile error', error);
      setState({
        ...state,
        error: 'Failed to update profile',
      });
      return false;
    }
  };

  // Метод для обновления типа личности
  const updatePersonalityType = async (type: string): Promise<boolean> => {
    return updateUserProfile({ personalityType: type });
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateUserProfile,
    updatePersonalityType,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 