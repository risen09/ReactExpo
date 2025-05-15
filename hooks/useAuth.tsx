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
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  handleVkLogin: (code: string, verifier: string, deviceId: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (profileData: Partial<UserProfile>) => Promise<void>;
  updatePersonalityType: (type: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  nickname?: string;
  username?: string;
  gender?: 'male' | 'female' | 'other';
  age?: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
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
          const userData = await AsyncStorage.getItem('user_data');
          if (userData) {
            setUser(JSON.parse(userData));
          } else {
            // Если токен есть, но данных нет - получаем профиль пользователя
            await fetchUserProfile(storedToken);
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const fetchUserProfile = async (authToken: string) => {
    try {
      // Используем новый эндпоинт /api/user для получения данных текущего пользователя
      const response = await fetch(`${API_BASE_URL}/api/user`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        // Если запрос не удался (например, токен истек), выходим из аккаунта
        throw new Error('Failed to fetch user profile');
      }

      const userData = await response.json();
      setUser(userData);
      await AsyncStorage.setItem('user_data', JSON.stringify(userData));
    } catch (error) {
      console.error('Fetch profile error:', error);
      await logout();
    }
  };

  const login = async (email: string, password: string) => {
    setError(null);
    setIsLoading(true);

    console.log('=== LOGIN DEBUG START ===');
    console.log('1. Login attempt initiated');
    console.log('Email provided:', email ? 'YES' : 'NO');
    console.log('Password provided:', password ? 'YES' : 'NO');

    try {
      console.log('2. Validating input parameters');

      // Проверка на null/undefined и базовые типы
      if (email === null || email === undefined) {
        console.log('ERROR: Email is null or undefined');
        throw new Error('Email не указан');
      }

      if (password === null || password === undefined) {
        console.log('ERROR: Password is null or undefined');
        console.log('Password value:', password);
        console.log('Password type:', typeof password);
        throw new Error('Пароль не указан');
      }

      if (password === '') {
        console.log('ERROR: Password is empty string');
        throw new Error('Пароль не может быть пустым');
      }

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

      // Используем новый эндпоинт /api/login, который принимает email и password в теле запроса
      const loginResponse = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: sanitizedEmail,
          password: safePassword,
        }),
      });

      console.log('7. Login response status:', loginResponse.status);

      if (!loginResponse.ok) {
        let errorMessage = 'Ошибка входа';
        try {
          const errorData = await loginResponse.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (e) {
          console.error('Error parsing login error response:', e);
        }
        throw new Error(errorMessage);
      }

      const authData = await loginResponse.json();
      console.log('8. Login successful, token received:', authData.token ? 'YES' : 'NO');

      if (!authData.token) {
        throw new Error('Токен не получен от сервера');
      }

      // Сохраняем токен и данные пользователя
      await AsyncStorage.setItem('auth_token', authData.token);

      if (authData.user) {
        setUser(authData.user);
        await AsyncStorage.setItem('user_data', JSON.stringify(authData.user));
      } else {
        // Если данные пользователя не пришли с токеном, получаем их отдельно
        await fetchUserProfile(authData.token);
      }

      setToken(authData.token);
      console.log('9. User data saved, redirecting to home');

      // Перенаправляем на главную страницу
      router.replace('/(tabs)');
      console.log('=== LOGIN DEBUG END ===');
    } catch (error) {
      console.error('Login error:', error);
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
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL}/api/auth/vk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          code_verifier: verifier,
          device_id: deviceId,
          redirect_uri: REDIRECT_URI,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        await AsyncStorage.setItem('auth_token', data.token);

        if (data.user) {
          setUser(data.user);
          await AsyncStorage.setItem('user_data', JSON.stringify(data.user));
        } else {
          // Если данные пользователя не пришли с токеном, получаем их отдельно
          await fetchUserProfile(data.token);
        }

        setToken(data.token);
        console.log('9. User data saved, redirecting to home');

        // Перенаправляем на главную страницу
        router.replace('/(tabs)');
      } else {
        Alert.alert('Backend Error', data.message || 'Failed to exchange code for token.');
      }
    } catch (error) {
      console.error('Error exchanging code:', error);
      Alert.alert('Pizdec!', 'Network error or backend is sleeping.');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    setError(null);
    setIsLoading(true);

    try {
      // Debug logging
      console.log('=== REGISTRATION DEBUG ===');
      console.log('1. Registration process started');

      // Input validation
      if (!userData) {
        throw new Error('User data is missing');
      }

      // Create sanitized user data with defaults
      const sanitizedEmail = userData.email?.trim().toLowerCase() || '';
      const sanitizedPassword = userData.password || '';

      // Проверка на непечатаемые символы
      const containsNonPrintable = /[^\x20-\x7E]/.test(sanitizedPassword);
      console.log('- Contains non-printable characters:', containsNonPrintable);

      // Проверка на пробелы
      const trimmedPassword = sanitizedPassword.trim();
      const hasLeadingOrTrailingSpaces = sanitizedPassword !== trimmedPassword;
      console.log('- Has leading/trailing spaces:', hasLeadingOrTrailingSpaces);

      // Обработанный пароль
      const processedPassword = trimmedPassword;
      console.log('- Final password length after processing:', processedPassword.length);

      const safeUserData = {
        email: sanitizedEmail,
        password: processedPassword,
        name: userData.name || '',
        nickname: userData.nickname || userData.name || '',
        gender: userData.gender || 'other',
        age: userData.age || 0,
      };

      // Log sanitized data (masked password)
      console.log(
        '2. Sanitized user data:',
        JSON.stringify({
          ...safeUserData,
          password: '***MASKED***',
        })
      );

      // Validate email format - упрощенная проверка на наличие @
      if (!sanitizedEmail.includes('@')) {
        console.log('3. Invalid email format:', sanitizedEmail);
        throw new Error('Пожалуйста, введите корректный email адрес');
      }

      // Validate required fields
      if (!safeUserData.email || !safeUserData.password || !safeUserData.name) {
        console.log('3. Missing required fields:');
        console.log('Email:', safeUserData.email ? 'OK' : 'MISSING');
        console.log('Password:', safeUserData.password ? 'OK' : 'MISSING');
        console.log('Name:', safeUserData.name ? 'OK' : 'MISSING');
        throw new Error('Пожалуйста, заполните все обязательные поля');
      }

      console.log('4. All required fields present, sending registration request');

      // Выбираем URL API
      let apiUrl = API_BASE_URL;

      // Проверяем доступность основного URL
      console.log('Checking server availability at:', apiUrl);
      const isMainServerAvailable = await checkServerAvailability(apiUrl);

      // Если основной сервер недоступен, пробуем использовать резервный URL
      if (!isMainServerAvailable && apiUrl !== FALLBACK_API_URL) {
        console.log('Main server not available, trying fallback URL:', FALLBACK_API_URL);
        const isFallbackAvailable = await checkServerAvailability(FALLBACK_API_URL);

        if (isFallbackAvailable) {
          apiUrl = FALLBACK_API_URL;
          console.log('Using fallback API URL:', apiUrl);
        } else {
          console.error('Both main and fallback servers are unavailable');
          throw new Error('Сервер недоступен. Пожалуйста, попробуйте позже.');
        }
      }

      console.log('Using API_BASE_URL:', apiUrl);
      const fullUrl = `${apiUrl}/api/register`;
      console.log('Full registration URL:', fullUrl);
      console.log(
        'Request data:',
        JSON.stringify({
          ...safeUserData,
          password: '***MASKED***',
        })
      );

      // Используем новый публичный эндпоинт /api/register для создания пользователя
      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(safeUserData),
      });

      console.log('5. Registration response status:', response.status);
      console.log('Content-Type:', response.headers.get('Content-Type'));

      // Проверяем успешность регистрации (коды 200-299)
      if (response.ok) {
        // Успешная регистрация
        console.log('6. Registration successful');

        try {
          // Пробуем прочитать данные в формате JSON
          const responseClone = response.clone();
          const responseText = await responseClone.text();
          let registrationData = { token: null, user: null };

          // Проверяем, похож ли ответ на JSON
          if (responseText.trim().startsWith('{') || responseText.trim().startsWith('[')) {
            try {
              registrationData = JSON.parse(responseText);
              console.log('Response data structure:', Object.keys(registrationData).join(', '));
            } catch (parseError) {
              console.warn('Failed to parse response as JSON, but registration was successful');
            }
          } else {
            console.log('Response is not in JSON format, but registration was successful');
          }

          // Если токен получен, сохраняем его
          if (registrationData.token) {
            await AsyncStorage.setItem('auth_token', registrationData.token);
            setToken(registrationData.token);

            if (registrationData.user) {
              setUser(registrationData.user);
              await AsyncStorage.setItem('user_data', JSON.stringify(registrationData.user));
            }
          } else {
            // Даже если токен не получен, пробуем войти с только что созданными данными
            console.log('No token received, attempting to login with the new credentials');

            try {
              await login(sanitizedEmail, processedPassword);
              // После успешного входа редирект произойдет в функции login
              return;
            } catch (loginError) {
              console.warn('Auto-login after registration failed:', loginError);
              // Если автологин не сработал, все равно перенаправляем в приложение
              // так как регистрация прошла успешно
            }
          }
        } catch (e) {
          console.warn('Error processing registration response:', e);
          // Но регистрация все равно считается успешной
        }

        // В любом случае показываем уведомление об успешной регистрации
        Alert.alert('Регистрация успешна', 'Ваша учетная запись успешно создана.', [
          { text: 'OK' },
        ]);

        console.log('7. Redirecting to home page');
        router.replace('/(tabs)');
        return;
      }

      // Если мы дошли до сюда, значит регистрация не удалась
      let errorMessage = 'Ошибка регистрации';

      // Клонируем ответ, чтобы иметь возможность прочитать его как текст
      const responseClone = response.clone();

      // Логируем полный ответ в виде текста для диагностики
      try {
        const responseText = await responseClone.text();
        console.log(
          'Error response raw text:',
          responseText.substring(0, 500) + (responseText.length > 500 ? '...' : '')
        );

        // Проверяем, похож ли ответ на JSON
        if (responseText.trim().startsWith('{') || responseText.trim().startsWith('[')) {
          try {
            const errorData = JSON.parse(responseText);
            errorMessage = errorData.error || errorData.message || errorMessage;
          } catch (parseError) {
            console.error('Failed to parse error response as JSON:', parseError);
          }
        } else {
          console.log('Response is not in JSON format');
        }
      } catch (e) {
        console.error('Error reading response text:', e);
      }

      throw new Error(errorMessage);
    } catch (error) {
      console.error('Registration error:', error);

      // Выводим дополнительную информацию об ошибке
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        setError(error.message);
      } else {
        console.error('Unknown error type:', typeof error);
        setError('Failed to register: Unknown error');
      }
    } finally {
      if (isLoading) setIsLoading(false);
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
        await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL}/api/auth/vk/logout`, {
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

  const updateProfile = async (profileData: Partial<UserProfile>) => {
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
      const response = await fetch(`${API_BASE_URL}/api/user`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        console.error('Ошибка обновления профиля. Статус:', response.status);

        if (response.status === 401) {
          console.error(
            'Ошибка авторизации. Токен:',
            token ? token.substring(0, 10) + '...' : 'null'
          );
          throw new Error('Ошибка авторизации. Пожалуйста, войдите в аккаунт снова.');
        }

        // Попытка получить текст ошибки
        try {
          const errorData = await response.json();
          console.error('Текст ошибки от сервера:', errorData);
          throw new Error(errorData.error || 'Не удалось обновить профиль');
        } catch (jsonError) {
          console.error('Не удалось прочитать ответ сервера:', jsonError);
          throw new Error(`Ошибка обновления профиля (${response.status})`);
        }
      }

      // Получаем обновленные данные пользователя
      const updatedUserData = await response.json();

      console.log(
        'Профиль успешно обновлен. Новые данные:',
        JSON.stringify(
          {
            ...updatedUserData,
            email: updatedUserData.email ? `${updatedUserData.email.substring(0, 3)}***` : null,
          },
          null,
          2
        )
      );

      setUser(updatedUserData);
      await AsyncStorage.setItem('user_data', JSON.stringify(updatedUserData));
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
      const response = await fetch(`${API_BASE_URL}/api/user`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ personalityType: type }),
      });

      console.log('Personality type update response status:', response.status);

      if (!response.ok) {
        let errorMessage = 'Failed to update personality type';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (jsonError) {
          console.error('Error parsing error response:', jsonError);
        }
        throw new Error(errorMessage);
      }

      // Получаем обновленные данные пользователя
      const updatedUserData = await response.json();
      console.log('Personality type updated successfully');

      // Обновляем локальные данные
      const updatedUser = { ...user, personalityType: type };
      setUser(updatedUser);
      await AsyncStorage.setItem('user_data', JSON.stringify(updatedUser));

      // Показываем уведомление об успешном обновлении
      Alert.alert('Тип личности обновлен', 'Ваш тип личности успешно сохранен в профиле', [
        { text: 'OK' },
      ]);
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

      // Используем эндпоинт /api/user для обновления пароля
      const response = await fetch(`${API_BASE_URL}/api/user`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword,
          password: newPassword,
        }),
      });

      if (!response.ok) {
        let errorMessage = 'Не удалось обновить пароль';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (error) {
          console.error('Error parsing error response:', error);
        }
        throw new Error(errorMessage);
      }

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
