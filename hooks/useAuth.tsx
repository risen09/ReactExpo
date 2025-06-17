import client from '@/api/client';
import { LoginRequest, LoginRequestSchema, LoginResponseSchema, RegisterRequest } from '@/types/auth';
import { User, UserSchema } from '@/types/user';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';

// Основной URL API из переменных окружения
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://j0cl9aplcsh5.share.zrok.io';

// Резервный URL API на случай, если основной недоступен
const FALLBACK_API_URL = 'https://j0cl9aplcsh5.share.zrok.io';

const YOUR_CLIENT_ID = process.env.EXPO_PUBLIC_VK_CLIENT_ID;
const YOUR_REDIRECT_SCHEME = YOUR_CLIENT_ID ? 'vk' + YOUR_CLIENT_ID : ''; // e.g., vk1234567
const YOUR_REDIRECT_HOST = 'vk.com'; // Or whatever you configure, but docs use this
const REDIRECT_URI = YOUR_REDIRECT_SCHEME
  ? `${YOUR_REDIRECT_SCHEME}://${YOUR_REDIRECT_HOST}/blank.html`
  : '';

// Функция для проверки доступности сервера
const checkServerAvailability = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(`${url}/api/health`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      // Устанавливаем короткий таймаут
      signal: AbortSignal.timeout(5000),
    });
    return response.ok;
  } catch (error) {
    console.warn(`Server at ${url} is not available:`, error);
    return false;
  }
};

export interface UserProfile {
  _id?: string;
  email: string;
  name: string;
  nickname?: string;
  username?: string;
  gender: 'male' | 'female' | 'other';
  age: number;
  personalityType?: string;
  avatar?: string;
  profileImage?: string;
  registrationDate?: Date;
  settings?: {
    theme: string;
    language: string;
    notifications: boolean;
    soundEffects: boolean;
  };
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  login: (loginData: LoginRequest) => Promise<void>;
  handleVkLogin: (code: string, verifier: string, deviceId: string) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (profileData: Partial<UserProfile>) => Promise<void>;
  updatePersonalityType: (type: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Проверка авторизации при загрузке приложения
    const checkAuth = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('auth_token');
        if (storedToken) {
          setToken(storedToken);
          // const userData = await AsyncStorage.getItem('user_data');
          await fetchUserProfile();
          // if (userData != null) {
          //   console.log('Профиль пользователя:', userData);
          //   setUser(JSON.parse(userData));
          // } else {
          //   // Если токен есть, но данных нет - получаем профиль пользователя
          //   console.log('надо получить пользователя')
          //   await fetchUserProfile();
          // }
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await client.user.get();
      UserSchema.parse(response.data);

      const userData = await response.data;
      console.log('Fetched user data:', userData);
      setUser(userData);
      await AsyncStorage.setItem('user_data', JSON.stringify(userData));
    } catch (error) {
      console.error('Fetch profile error:', error);
      await logout();
    }
  };

  const login = async (loginData: LoginRequest) => {
    setError(null);
    setIsLoading(true);

    console.log('=== LOGIN DEBUG START ===');
    console.log('1. Login attempt initiated');
    console.log('Email provided:', loginData.email ? 'YES' : 'NO');
    console.log('Password provided:', loginData.password ? 'YES' : 'NO');

    try {
      console.log('2. Validating input parameters');

      const loginValidateResult = LoginRequestSchema.parse(loginData);
      const { email, password } = loginValidateResult;

      // Безопасное преобразование email
      let sanitizedEmail = '';

      // Принудительное преобразование к строке и обрезка лишних пробелов
      try {
        sanitizedEmail = String(email).trim().toLowerCase();
        console.log(
          '3. Email sanitized successfully:',
          sanitizedEmail.substring(0, 3) +
            '***' +
            (sanitizedEmail.includes('@')
              ? sanitizedEmail.substring(sanitizedEmail.indexOf('@'))
              : '')
        );
      } catch (emailError) {
        console.log('ERROR during email sanitization:', emailError);
        throw new Error('Ошибка при обработке email. Пожалуйста, введите корректный email.');
      }

      // Проверяем, что email не пустой после обработки
      if (!sanitizedEmail || sanitizedEmail.length < 1) {
        console.log('ERROR: Email is empty after sanitization');
        throw new Error('Email не может быть пустым');
      }

      // Проверка пароля
      let safePassword = '';
      try {
        safePassword = String(password);
        console.log('5. Password converted to string, length:', safePassword.length);

        // Дополнительные проверки пароля
        if (safePassword.length < 1) {
          console.log('WARNING: Password is empty after conversion');
        } else if (safePassword.length < 4) {
          console.log('WARNING: Password is very short:', safePassword.length, 'chars');
        } else {
          console.log('Password seems valid (length:', safePassword.length, 'chars)');
        }
      } catch (passwordError) {
        console.log('ERROR during password conversion:', passwordError);
        throw new Error('Ошибка при обработке пароля');
      }

      if (!safePassword || safePassword.trim().length < 1) {
        console.log('ERROR: Password is invalid after conversion');
        throw new Error('Пароль не может быть пустым');
      }

      console.log('6. Username/password validation passed, attempting to login');

      const loginResponse = await client.auth.login({
        email, password
      })

      console.log('7. Login response status:', loginResponse.status);
      const authData = await loginResponse.data;
      LoginResponseSchema.parse(authData);
      console.log('8. Login successful, token received:', authData.token ? 'YES' : 'NO');

      // Сохраняем токен и данные пользователя
      await AsyncStorage.setItem('auth_token', authData.token);

      setToken(authData.token);

      await fetchUserProfile();

      console.log('9. User data saved, checking if first time login');

      // Check if this is first time login
        // Перенаправляем на главную страницу
        // router.replace('/(tabs)');

      console.log('=== LOGIN DEBUG END ===');
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Ошибка', 'Ошибка при входе в систему');
      setError(error instanceof Error ? error.message : 'Failed to login');
      console.log('=== LOGIN DEBUG FAILED ===');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVkLogin = async (code: string, verifier: string, deviceId: string) => {
    setError(null);
    setIsLoading(true);
    try {
      const response = await client.auth.vk.login({
        code,
        code_verifier: verifier,
        device_id: deviceId,
        redirect_uri: REDIRECT_URI
      })
      const data = await response.data;
      await AsyncStorage.setItem('auth_token', data.token);

      await fetchUserProfile();

      setToken(data.token);
      console.log('9. User data saved, redirecting to home');
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error exchanging code:', error);
      Alert.alert('Network error or backend is sleeping.');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterRequest) => {
    setError(null);
    setIsLoading(true);

    try {
      // Debug logging
      console.log('=== REGISTRATION DEBUG ===');
      console.log('1. Registration process started in useAuth');

      // Input validation
      if (!userData) {
        console.error('User data is missing');
        throw new Error('Данные пользователя отсутствуют');
      }

      // Sanitize and prepare data according to RegisterRequest
      const sanitizedEmail = userData.email?.trim().toLowerCase() || '';
      const sanitizedPassword = userData.password || '';
      const finalName = userData.name?.trim() || '';
      const finalUsername = userData.username?.trim() || '';
      const finalGender = userData.gender || '';
      const finalAge = userData.age;

      console.log(
        '2. Sanitized user data (password masked):',
        JSON.stringify({
          name: finalName,
          email: sanitizedEmail,
          password: '***MASKED***',
          username: finalUsername,
          gender: finalGender,
          age: finalAge,
        })
      );

      if (!finalName || !sanitizedEmail || !sanitizedPassword || !finalUsername || !finalGender || finalAge === undefined || finalAge === null) {
        console.error('3. Missing required fields:', {
          name: finalName ? 'OK' : 'MISSING',
          email: sanitizedEmail ? 'OK' : 'MISSING',
          password: sanitizedPassword ? 'OK' : 'MISSING',
          username: finalUsername ? 'OK' : 'MISSING',
          gender: finalGender ? 'OK' : 'MISSING',
          age: (finalAge !== undefined && finalAge !== null) ? 'OK' : 'MISSING',
        });
        throw new Error('Пожалуйста, заполните все обязательные поля');
      }
      if (!sanitizedEmail.includes('@') || !sanitizedEmail.includes('.')) {
        console.error('3. Invalid email format:', sanitizedEmail);
        throw new Error('Пожалуйста, введите корректный email адрес');
      }
      if (sanitizedPassword.length < 6) {
        console.error('3. Password too short');
        throw new Error('Пароль должен содержать не менее 6 символов');
      }
      if (finalAge < 7 || finalAge > 18) {
        console.error('3. Invalid age:', finalAge);
        throw new Error('Возраст должен быть от 7 до 18 лет');
      }

      const dataToSend: RegisterRequest = {
        name: finalName,
        email: sanitizedEmail,
        password: sanitizedPassword,
        username: finalUsername,
        gender: finalGender,
        age: finalAge,
      };

      console.log('4. All required fields present and validated, sending registration request with:', dataToSend);

      // client.auth.register is an axios call. Axios throws an error for non-2xx responses by default.
      // So, if the request fails (e.g. 400, 401, 500), it will be caught in the catch block.
      const response = await client.auth.register(dataToSend);

      console.log('5. Registration response status:', response.status);
      console.log('6. Registration successful. Response data:', response.data); // response.data is RegisterResponse { user: string }

      // If we reach here, it means the request was successful (status 2xx)
      // The definition of RegisterResponse is { user: string }, which might be a user ID or simple confirmation.
      // Assuming successful registration leads to login or dashboard.
      console.log('7. Redirecting to home page /_layout.tsx/(tabs)');
      router.replace('/(tabs)');
      return; // Important to return after successful registration and navigation

    } catch (error: any) { // Catch any error, including AxiosError
      console.error('Registration error in useAuth catch block:', error);
      let displayError = 'Не удалось зарегистрироваться. Пожалуйста, попробуйте позже.';

      if (error.response && error.response.data) {
        // Axios error, try to get message from backend response
        const serverError = error.response.data;
        if (typeof serverError === 'string') {
          displayError = serverError;
        } else if (serverError.message) {
          displayError = serverError.message;
        } else if (serverError.error) {
          displayError = serverError.error;
        } else {
          // Fallback if error structure is unknown
          displayError = `Ошибка сервера: ${error.response.status}`;
        }
        console.error('Server error details:', serverError);
      } else if (error instanceof Error) {
        // Network error or other client-side error before request was made or after non-axios error
        displayError = error.message;
        console.error('Client-side error message:', error.message);
        if (error.stack) {
            console.error('Client-side error stack:', error.stack);
        }
      } else {
        // Unknown error type
        console.error('Unknown error type:', typeof error, error);
      }
      setError(displayError);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Очищаем данные из AsyncStorage
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('user_data');

      setToken(null);
      setUser(null);

      try {
        // Handling VK logout
        console.log('Logging out from VK');
        await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL}/api/v2/auth/vk/logout`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (error) {
        console.error('Vk logout error:', error);
      }

      // Перенаправление на страницу входа
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateProfile = async (profileData: Partial<User>) => {
    setError(null);
    setIsLoading(true);

    try {
      console.log(
        'Обновление профиля. Данные:',
        JSON.stringify(
          {
            ...profileData,
            // маскируем чувствительные данные в логах
            email: profileData.email ? `${profileData.email.substring(0, 3)}***` : undefined,
          },
          null,
          2
        )
      );

      // Проверяем наличие токена
      if (!token) {
        console.error('Ошибка: отсутствует токен авторизации');
        throw new Error('Вы не авторизованы. Пожалуйста, войдите в аккаунт снова.');
      }

      // Проверка и обработка аватара
      if (profileData.avatar) {
        console.log('Обработка аватара:', profileData.avatar.substring(0, 20) + '...');

        // Если путь к аватару начинается с ../images/ или ../../images/,
        // значит это путь к изображению в проекте, а не URI
        if (profileData.avatar.includes('images/')) {
          console.log('Аватар является внутренним изображением проекта');
          // Извлекаем имя файла из пути
          const parts = profileData.avatar.split('/');
          const filename = parts[parts.length - 1];
          console.log('Имя файла аватара:', filename);

          // Обновляем данные, чтобы использовать только имя файла
          profileData.avatar = filename;
        }
      }

      console.log('Отправка данных на сервер');

      // Используем новый эндпоинт /api/user для обновления данных текущего пользователя
      const response = await client.user.update(profileData);
      // Получаем обновленные данные пользователя
      const updatedUserData = await response.data;

      setUser(updatedUserData);
    } catch (error) {
      console.error('Ошибка при обновлении профиля:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Неизвестная ошибка при обновлении профиля');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const updatePersonalityType = async (type: string) => {
    if (!token || !user) {
      setError('Not authenticated');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('Updating personality type to:', type);

      // Используем PUT /api/user для обновления типа личности
      const response = await client.user.update({ personalityType: type });
      console.log('Personality type update response status:', response.status);
      console.log('Personality type updated successfully');

      // Обновляем локальные данные
      const updatedUser = { ...user, personalityType: type };
      setUser(updatedUser);
      await AsyncStorage.setItem('user_data', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Update personality type error:', error);
      setError(error instanceof Error ? error.message : 'Failed to update personality type');

      // Информируем пользователя об ошибке
      Alert.alert(
        'Ошибка обновления',
        'Не удалось обновить тип личности. Пожалуйста, попробуйте позже.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    if (!token || !user) {
      setError('Не авторизован');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('Changing password for user:', user.email);

      // Используем отдельный эндпоинт для смены пароля
      const response = await client.user.changePassword(
        currentPassword,
        newPassword
      );

      Alert.alert('Успех', 'Пароль успешно изменен', [{ text: 'OK' }]);

      return true;
    } catch (error) {
      console.error('Change password error:', error);
      setError(error instanceof Error ? error.message : 'Не удалось изменить пароль');

      Alert.alert('Ошибка', error instanceof Error ? error.message : 'Не удалось изменить пароль', [
        { text: 'OK' },
      ]);

      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!token,
        error,
        login,
        handleVkLogin,
        register,
        logout,
        updateProfile,
        updatePersonalityType,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
