import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { Alert } from 'react-native';

const API_BASE_URL = 'https://j0cl9aplcsh5.share.zrok.io';

export interface UserProfile {
  _id?: string;
  email: string;
  name: string;
  username: string;
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
      const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Accept': 'application/json'
        }
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
        console.log('3. Email sanitized successfully:', 
                    sanitizedEmail.substring(0, 3) + '***' + 
                    (sanitizedEmail.includes('@') ? sanitizedEmail.substring(sanitizedEmail.indexOf('@')) : ''));
      } catch (emailError) {
        console.log('ERROR during email sanitization:', emailError);
        throw new Error('Ошибка при обработке email. Пожалуйста, введите корректный email.');
      }
      
      // Проверяем, что email не пустой после обработки
      if (!sanitizedEmail || sanitizedEmail.length < 1) {
        console.log('ERROR: Email is empty after sanitization');
        throw new Error('Email не может быть пустым');
      }
      
      // Очень упрощенная проверка формата (почти любой текст допустим)
      console.log('4. Email validation check passed');
      
      // Проверка пароля
      let safePassword = '';
      try {
        safePassword = String(password);
        console.log('5. Password converted to string, length:', safePassword.length);
        
        // Проверка на непечатаемые символы или специальные символы
        const containsSpecialChars = /[^\x20-\x7E]/.test(safePassword);
        if (containsSpecialChars) {
          console.log('WARNING: Password contains non-printable or special characters');
        }
        
        // Проверка на пробелы в начале и конце
        const hasLeadingOrTrailingSpaces = safePassword !== safePassword.trim();
        if (hasLeadingOrTrailingSpaces) {
          const oldLength = safePassword.length;
          safePassword = safePassword.trim();
          console.log(`WARNING: Password had leading/trailing spaces. Length before: ${oldLength}, after: ${safePassword.length}`);
        }
        
        // Дополнительные логи для отладки
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
      
      console.log('5. Password validation check passed');
      
      // НОВЫЙ ПОДХОД: Проверяем пользователя по коллекции users
      console.log('6. Attempting to find user using admin auth');
      
      // 1. Получаем админский токен
      let adminToken;
      try {
        const loginResponse = await fetch(`${API_BASE_URL}/api/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + btoa('admin:admin123')
          }
        });

        if (!loginResponse.ok) {
          console.log('Admin login failed with status:', loginResponse.status);
          throw new Error('Не удалось получить доступ к системе');
        }

        const adminData = await loginResponse.json();
        adminToken = adminData.token;
        console.log('6. Admin token received for user lookup:', adminToken ? 'YES' : 'NO');
      } catch (adminLoginError) {
        console.error('Admin login error:', adminLoginError);
        throw new Error('Ошибка доступа к системе аутентификации');
      }
      
      // 2. Ищем пользователя в базе данных
      if (!adminToken) {
        throw new Error('Не удалось получить токен администратора');
      }
      
      console.log('7. Searching for user with email:', sanitizedEmail);
      let userData;
      try {
        const usersResponse = await fetch(`${API_BASE_URL}/api/users?email=${encodeURIComponent(sanitizedEmail)}`, {
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Accept': 'application/json'
          }
        });
        
        if (!usersResponse.ok) {
          console.log('User search failed with status:', usersResponse.status);
          throw new Error('Не удалось выполнить поиск пользователя');
        }
        
        const users = await usersResponse.json();
        console.log('Found users:', users.length);
        
        // Находим пользователя по email и проверяем пароль
        const user = users.find((u: any) => 
          u.email && u.email.toLowerCase() === sanitizedEmail.toLowerCase()
        );
        
        if (!user) {
          console.log('User not found with email:', sanitizedEmail);
          throw new Error('Пользователь с указанным email не найден');
        }
        
        console.log('8. User found, checking password');
        
        // Проверяем пароль
        if (!user.password || user.password !== safePassword) {
          console.log('Password mismatch');
          throw new Error('Неверный пароль');
        }
        
        // Пользователь найден и пароль верный
        console.log('9. Password matches, using admin token for authentication');
        userData = user;
      } catch (userSearchError) {
        console.error('User search error:', userSearchError);
        throw new Error(userSearchError instanceof Error ? userSearchError.message : 'Ошибка поиска пользователя');
      }
      
      // 3. Используем админский токен для фактической авторизации
      console.log('10. Authentication successful, saving user data');
      
      // Сохраняем данные пользователя
      await AsyncStorage.setItem('auth_token', adminToken);
      await AsyncStorage.setItem('user_data', JSON.stringify(userData));
      
      // Обновляем состояние приложения
      setToken(adminToken);
      setUser(userData);
      
      console.log('11. Login successful, navigating to home');
      
      // Перенаправляем на главную страницу
      router.replace('/');
      console.log('=== LOGIN DEBUG END ===');
    } catch (error) {
      console.error('Login error:', error);
      setError(error instanceof Error ? error.message : 'Failed to login');
      console.log('=== LOGIN DEBUG FAILED ===');
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
      
      // Проверяем пароль
      console.log('Checking registration password:');
      console.log('- Password provided:', !!sanitizedPassword);
      console.log('- Password length:', sanitizedPassword.length);
      console.log('- Password type:', typeof sanitizedPassword);
      
      // Проверка на непечатаемые символы
      const containsNonPrintable = /[^\x20-\x7E]/.test(sanitizedPassword);
      console.log('- Contains non-printable characters:', containsNonPrintable);
      
      // Проверка на пробелы
      const trimmedPassword = sanitizedPassword.trim();
      const hasLeadingOrTrailingSpaces = sanitizedPassword !== trimmedPassword;
      console.log('- Has leading/trailing spaces:', hasLeadingOrTrailingSpaces);
      
      // Обработанный пароль (обязательно в той же форме, что и при входе)
      const processedPassword = trimmedPassword;
      console.log('- Final password length after processing:', processedPassword.length);
      
      const safeUserData = {
        ...userData,
        email: sanitizedEmail,
        password: processedPassword, // Используем обработанный пароль
        username: userData.username || userData.name || 'User',
        gender: userData.gender || 'other',
        age: userData.age || 0
      };
      
      // Log sanitized data (masked password)
      console.log('2. Sanitized user data:', JSON.stringify({
        ...safeUserData,
        password: '***MASKED***'
      }));
      
      // Validate email format - упрощенная проверка на наличие @
      const emailRegex = /@/;
      
      console.log('Validating registration email:', sanitizedEmail, 'Symbol @ present:', sanitizedEmail.includes('@'));
      
      if (!emailRegex.test(sanitizedEmail)) {
        console.log('3. Invalid email format:', sanitizedEmail);
        throw new Error('Пожалуйста, введите email адрес, содержащий символ @');
      }
      
      // Обработка пароля для регистрации/логина
      let finalPassword = processedPassword;
      if (__DEV__ && finalPassword.length < 6) {
        console.log('DEV MODE: Enforcing minimum password length of 6 characters');
        // Если пароль слишком короткий, добавляем к нему "123" для тестирования
        finalPassword = finalPassword.length < 3 ? 'test123' : finalPassword + '123';
        console.log('DEV MODE: Final password length:', finalPassword.length);
      }
      
      // Validate required fields
      if (!safeUserData.email || !safeUserData.password || !safeUserData.name) {
        console.log('3. Missing required fields:');
        console.log('Email:', safeUserData.email ? 'OK' : 'MISSING');
        console.log('Password:', safeUserData.password ? 'OK' : 'MISSING');
        console.log('Name:', safeUserData.name ? 'OK' : 'MISSING');
        throw new Error('Пожалуйста, заполните все обязательные поля');
      }
      
      console.log('3. All required fields present');
      
      // Шаг 1: Получаем админский токен для создания пользователя
      console.log('4. Attempting admin login');
      let adminToken;
      try {
        const loginResponse = await fetch(`${API_BASE_URL}/api/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + btoa('admin:admin123')
          }
        });

        console.log('5. Admin login response status:', loginResponse.status);
        
        if (!loginResponse.ok) {
          let error = await loginResponse.text();
          console.log('6. Admin login failed:', error);
          throw new Error(`Admin login failed: ${error}`);
        }

        const adminData = await loginResponse.json();
        adminToken = adminData.token;
        console.log('6. Admin token received:', adminToken ? 'YES' : 'NO');
      } catch (adminLoginError) {
        console.log('Admin login error:', adminLoginError);
        throw new Error('Failed to authenticate for user creation');
      }

      // Шаг 2: Проверяем, не существует ли уже пользователь с таким email
      console.log('7. Checking if user already exists');
      try {
        const checkUserResponse = await fetch(`${API_BASE_URL}/api/users?email=${encodeURIComponent(sanitizedEmail)}`, {
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Accept': 'application/json'
          }
        });
        
        if (checkUserResponse.ok) {
          const existingUsers = await checkUserResponse.json();
          
          if (Array.isArray(existingUsers) && existingUsers.length > 0) {
            const existingUser = existingUsers.find((u: any) => 
              u.email && u.email.toLowerCase() === sanitizedEmail.toLowerCase()
            );
            
            if (existingUser) {
              console.log('User with this email already exists');
              throw new Error('Пользователь с таким email уже существует');
            }
          }
        }
      } catch (checkError) {
        if (checkError instanceof Error && checkError.message.includes('already exists')) {
          throw checkError;
        }
        // Если ошибка не связана с существованием пользователя, продолжаем
        console.log('Error checking existing user (continuing):', checkError);
      }

      // Шаг 3: Создаем пользователя
      console.log('8. Creating user with admin token');
      let newUser;
      try {
        if (!finalPassword || finalPassword.length < 1) {
          console.log('КРИТИЧЕСКАЯ ОШИБКА: Пароль пустой перед созданием пользователя');
          throw new Error('Пароль не может быть пустым');
        }
        
        // Создаем пользователя в коллекции users
        const userCreatePayload = {
          email: safeUserData.email,
          password: finalPassword,
          name: safeUserData.name,
          username: safeUserData.username,
          registration_date: new Date().toISOString().split('T')[0],
          gender: safeUserData.gender,
          age: safeUserData.age,
          role: 'user',
          created_at: new Date().toISOString()
        };
        
        console.log('9. User creation payload:', JSON.stringify({
          ...userCreatePayload,
          password: '***MASKED***'
        }));
        
        // Используем эндпоинт для создания записи в коллекции users
        const response = await fetch(`${API_BASE_URL}/api/users`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(userCreatePayload)
        });

        console.log('10. User creation response status:', response.status);

        if (!response.ok) {
          let errorText = '';
          try {
            const errorData = await response.json();
            errorText = typeof errorData === 'string' ? errorData :
                       errorData.message || errorData.error || JSON.stringify(errorData);
            console.log('11. User creation failed with JSON:', errorText);
          } catch (jsonError) {
            try {
              errorText = await response.text();
              console.log('11. User creation failed with text:', errorText);
            } catch (textError) {
              errorText = 'Unknown server error';
              console.log('11. Failed to get error details');
            }
          }
          throw new Error(`Ошибка создания пользователя: ${errorText}`);
        }

        newUser = await response.json();
        console.log('11. User created successfully:', newUser?._id ? 'YES' : 'NO');
        console.log('New user ID:', newUser?._id || 'Not available');
      } catch (userCreateError) {
        console.log('User creation error:', userCreateError);
        throw userCreateError;
      }
      
      // Шаг 4: Автоматически пытаемся войти от имени пользователя
      console.log('12. Registration successful, attempting automatic login');
      
      Alert.alert(
        'Регистрация успешна',
        'Ваша учетная запись создана успешно.',
        [{ text: 'OK' }]
      );
      
      try {
        // Аутентифицируем пользователя через обычный вход
        await login(sanitizedEmail, finalPassword);
      } catch (loginError) {
        console.error('Auto-login after registration failed:', loginError);
        
        // Если автоматический вход не удался, перенаправляем на страницу входа
        Alert.alert(
          'Необходим вход',
          'Пожалуйста, войдите с вашими новыми учетными данными.',
          [{ 
            text: 'OK', 
            onPress: () => {
              router.replace({
                pathname: '/(auth)/login',
                params: { email: sanitizedEmail, fromRegistration: 'true' }
              });
            }
          }]
        );
      }
      
      setIsLoading(false);
      return;
    } catch (error) {
      console.error('Registration error:', error);
      setError(error instanceof Error ? error.message : 'Failed to register');
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
      
      // Перенаправление на страницу входа
      router.replace('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateProfile = async (profileData: Partial<UserProfile>) => {
    setError(null);
    setIsLoading(true);

    try {
      console.log('Обновление профиля. Данные:', JSON.stringify({
        ...profileData,
        // маскируем чувствительные данные в логах
        email: profileData.email ? `${profileData.email.substring(0, 3)}***` : undefined,
      }, null, 2));
      
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
      
      console.log('Отправка данных на сервер:', profileData.avatar);
      
      const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        console.error('Ошибка обновления профиля. Статус:', response.status);
        
        if (response.status === 401) {
          console.error('Ошибка авторизации. Токен:', token ? token.substring(0, 10) + '...' : 'null');
          throw new Error('Ошибка авторизации. Пожалуйста, войдите в аккаунт снова.');
        }
        
        // Попытка получить текст ошибки
        try {
          const errorData = await response.json();
          console.error('Текст ошибки от сервера:', errorData);
          throw new Error(errorData.message || 'Не удалось обновить профиль');
        } catch (jsonError) {
          console.error('Не удалось прочитать ответ сервера:', jsonError);
          throw new Error(`Ошибка обновления профиля (${response.status})`);
        }
      }

      // Получаем обновленные данные пользователя
      const updatedUserData = await response.json();
      
      console.log('Профиль успешно обновлен. Новые данные:', JSON.stringify({
        ...updatedUserData,
        email: updatedUserData.email ? `${updatedUserData.email.substring(0, 3)}***` : null
      }, null, 2));
      
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
      console.log('Updating personality type for user:', user?._id, 'to type:', type);
      
      // Проверка наличия ID пользователя
      if (!user._id) {
        throw new Error('Не удалось определить ID пользователя');
      }
      
      // Используем тот же эндпоинт, что и для обновления профиля
      const response = await fetch(`${API_BASE_URL}/api/users/${user._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ personalityType: type })
      });
      
      console.log('Personality type update response status:', response.status);

      if (!response.ok) {
        let errorMessage = 'Failed to update personality type';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (jsonError) {
          console.error('Error parsing error response:', jsonError);
          try {
            errorMessage = await response.text();
          } catch (textError) {
            console.error('Error getting response text:', textError);
          }
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
      Alert.alert(
        'Тип личности обновлен',
        'Ваш тип личности успешно сохранен в профиле',
        [{ text: 'OK' }]
      );
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
    if (!token || !user || !user._id) {
      setError('Не авторизован');
      return false;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Changing password for user:', user.email);
      
      // Сначала проверяем текущий пароль
      const checkResponse = await fetch(`${API_BASE_URL}/api/users?email=${encodeURIComponent(user.email)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      if (!checkResponse.ok) {
        throw new Error('Не удалось проверить текущие учетные данные');
      }
      
      const users = await checkResponse.json();
      const currentUser = users.find((u: any) => 
        u.email && u.email.toLowerCase() === user.email.toLowerCase()
      );
      
      if (!currentUser) {
        throw new Error('Пользователь не найден');
      }
      
      // Проверяем, что текущий пароль верный
      if (currentUser.password !== currentPassword) {
        throw new Error('Текущий пароль введен неверно');
      }
      
      // Обновляем пароль
      const response = await fetch(`${API_BASE_URL}/api/users/${user._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          password: newPassword
        })
      });
      
      if (!response.ok) {
        let errorMessage = 'Не удалось обновить пароль';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (error) {
          console.error('Error parsing error response:', error);
        }
        throw new Error(errorMessage);
      }
      
      // Обновляем данные пользователя в локальном хранилище
      const updatedUser = { ...user, password: newPassword };
      await AsyncStorage.setItem('user_data', JSON.stringify(updatedUser));
      
      Alert.alert(
        'Успех',
        'Пароль успешно изменен',
        [{ text: 'OK' }]
      );
      
      return true;
    } catch (error) {
      console.error('Change password error:', error);
      setError(error instanceof Error ? error.message : 'Не удалось изменить пароль');
      
      Alert.alert(
        'Ошибка',
        error instanceof Error ? error.message : 'Не удалось изменить пароль',
        [{ text: 'OK' }]
      );
      
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
        register, 
        logout, 
        updateProfile,
        updatePersonalityType,
        changePassword
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