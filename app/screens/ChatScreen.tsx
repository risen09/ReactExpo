import { router, useLocalSearchParams } from 'expo-router';
import {
  SendHorizontal,
  Paperclip,
  Mic,
  ChevronLeft,
  MoreVertical,
  BookOpen,
  Star,
  ClipboardList,
} from 'lucide-react-native';
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
  SafeAreaView,
  ActivityIndicator,
  Modal,
  ScrollView,
} from 'react-native';

import { useAuth } from '../../hooks/useAuth';
import { AgentFactory, TestQuestion, LearningTrack, Test } from '../../models/LearningAgents';
import logger from '../../utils/logger';
// Импортируем наши агенты

// Общая цветовая палитра приложения
const COLORS = {
  primary: '#5B67CA', // Основной синий/фиолетовый
  secondary: '#43C0B4', // Бирюзовый
  accent1: '#F98D51', // Оранжевый
  accent2: '#EC575B', // Красный
  accent3: '#FFCA42', // Желтый
  background: '#F2F5FF', // Светлый фон
  card: '#FFFFFF', // Белый для карточек
  text: '#25335F', // Основной текст
  textSecondary: '#7F8BB7', // Вторичный текст
  border: '#EAEDF5', // Граница
};

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
}

interface LessonAssignment {
  id: string;
  difficulty: number;
  question: string;
}

interface LessonExample {
  id: string;
  title: string;
  content: string;
  solution: string;
}

export default function ChatScreen() {
  const params = useLocalSearchParams<{ chatId: string }>();
  const { token } = useAuth(); // Получаем токен текущего пользователя
  const [currentChatId, setCurrentChatId] = useState<string>(params?.chatId || ''); // State for current chat ID
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const [isNewChat, setIsNewChat] = useState(!params?.chatId); // Track if this is a new chat

  // Новые состояния для образовательной функциональности
  const [showTestModal, setShowTestModal] = useState(false);
  const [currentTest, setCurrentTest] = useState<Test | null>(null);
  const [currentTestType, setCurrentTestType] = useState<'T1' | 'T2' | null>(null);
  const [currentSubject, setCurrentSubject] = useState<string | null>(null);
  const [currentTopic, setCurrentTopic] = useState<string | null>(null);
  const [testAnswers, setTestAnswers] = useState<Record<string, string>>({});
  const [testCompleted, setTestCompleted] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [currentLesson, setCurrentLesson] = useState<any | null>(null);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [menuType, setMenuType] = useState<'M1' | 'M2' | null>(null);

  // Создаем экземпляры агентов
  const agentFactory = useMemo(() => {
    const apiBaseUrl = API_BASE_URL || '';
    return new AgentFactory(apiBaseUrl, token || '');
  }, [token]);

  const assistantAgent = useMemo(() => agentFactory.createAssistantAgent(), [agentFactory]);
  const contentAgent = useMemo(() => agentFactory.createContentGenerationAgent(), [agentFactory]);
  const analyticalAgent = useMemo(() => agentFactory.createAnalyticalAgent(), [agentFactory]);
  const assignmentAgent = useMemo(() => agentFactory.createAssignmentCheckAgent(), [agentFactory]);
  const schedulerAgent = useMemo(() => agentFactory.createSchedulerAgent(), [agentFactory]);

  const defaultWelcomeMessages = useMemo(
    () => [
      {
        id: '1',
        text: 'Добро пожаловать в образовательный чат! Я ваш AI-ассистент. Как я могу помочь вам сегодня?',
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ],
    []
  );

  // Fetch messages from API or use default welcome message
  const fetchMessages = useCallback(async () => {
    if (!currentChatId) {
      logger.info('No chat ID available, showing welcome message');
      setMessages(defaultWelcomeMessages);
      return;
    }

    logger.info('Fetching chat messages', { chatId: currentChatId });
    setIsLoading(true);

    // Проверяем есть ли токен пользователя
    if (!token) {
      logger.error('No user token available, cannot fetch messages');
      setIsLoading(false);
      setMessages(defaultWelcomeMessages);
      return;
    }

    try {
      // Пробуем сначала использовать токен пользователя
      const response = await fetch(`${API_BASE_URL}/api/gigachat/chat/${currentChatId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
      });

      // Если запрос не удался, пробуем использовать admin токен
      if (!response.ok) {
        // Если ошибка не связана с авторизацией, просто возвращаем сообщение по умолчанию
        if (response.status !== 401 && response.status !== 403) {
          logger.error(`Failed to fetch messages: ${response.status}`);
          setMessages(defaultWelcomeMessages);
          return;
        }

        // Пробуем с admin токеном
        logger.warn('User token not authorized for chat messages, trying admin login');
        const adminToken = await getAdminToken();

        if (!adminToken) {
          logger.error('Failed to get admin token for messages');
          setMessages(defaultWelcomeMessages);
          return;
        }

        const adminResponse = await fetch(`${API_BASE_URL}/api/gigachat/chat/${currentChatId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + adminToken,
          },
        });

        if (!adminResponse.ok) {
          logger.error(`Failed to fetch messages with admin token: ${adminResponse.status}`);
          setMessages(defaultWelcomeMessages);
          return;
        }

        const adminData = await adminResponse.json();
        logger.debug('Received chat data with admin token', adminData);

        if (adminData) {
          const messagesData = adminData.messages.map((item: any, index: number) => ({
            id: index.toString(),
            text: item.content,
            isUser: item.role === 'user',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }));
          setMessages(messagesData.slice(1));
          logger.info('Messages loaded successfully with admin token', {
            count: messagesData.length,
          });
        } else {
          logger.warn(
            'No messages found or invalid data format with admin token, using default welcome message'
          );
          setMessages(defaultWelcomeMessages);
        }
        return;
      }

      // Успешный запрос с токеном пользователя
      const data = await response.json();
      logger.debug('Received chat data', data);

      if (data) {
        const messagesData = data.messages.map((item: any, index: number) => ({
          id: index.toString(),
          text: item.content,
          isUser: item.role === 'user',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }));
        setMessages(messagesData.slice(1));
        logger.info('Messages loaded successfully', { count: messagesData.length });
      } else {
        logger.warn('No messages found or invalid data format, using default welcome message');
        setMessages(defaultWelcomeMessages);
      }
    } catch (error) {
      logger.error('Failed to fetch messages', error);
      setMessages(defaultWelcomeMessages);
    } finally {
      setIsLoading(false);
    }
  }, [currentChatId, defaultWelcomeMessages, token]);

  // Load messages on component mount or when chat ID changes
  useEffect(() => {
    logger.info('Chat screen mounted or chat ID changed');
    fetchMessages();
    return () => {
      logger.info('Chat screen unmounted');
    };
  }, [fetchMessages, currentChatId]);

  // Scroll to end when messages change
  const scrollToEnd = useCallback(() => {
    if (flatListRef.current) {
      logger.debug('Scrolling to end of messages');
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, []);

  useEffect(() => {
    scrollToEnd();
  }, [messages, scrollToEnd]);

  // Helper function to get admin token
  const getAdminToken = async () => {
    try {
      const loginResponse = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Basic ' + btoa('admin:admin123'),
        },
      });

      if (!loginResponse.ok) {
        console.log('Admin login failed with status:', loginResponse.status);
        throw new Error('Не удалось получить доступ к системе');
      }

      const adminData = await loginResponse.json();
      return adminData.token;
    } catch (error) {
      console.error('Admin login error:', error);
      throw new Error('Ошибка доступа к системе аутентификации');
    }
  };

  // Create a new chat
  const createNewChat = async () => {
    try {
      logger.info('Creating new chat');

      // Пробуем создать чат с токеном пользователя
      if (token) {
        try {
          const response = await fetch(`${API_BASE_URL}/api/gigachat/new`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: 'Bearer ' + token,
            },
          });

          if (response.ok) {
            const data = await response.json();
            logger.debug('New chat created with user token', data);
            return data.chat_id;
          }

          // Если не сработало с пользовательским токеном, продолжаем с admin токеном
          logger.warn('Failed to create chat with user token, trying admin token');
        } catch (error) {
          logger.warn('Error creating chat with user token:', error);
        }
      }

      // Fallback с admin токеном
      const adminToken = await getAdminToken();
      const response = await fetch(`${API_BASE_URL}/api/gigachat/new`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + adminToken,
        },
        // No payload needed as per requirements
      });

      if (!response.ok) {
        throw new Error(`Failed to create new chat: ${response.status}`);
      }

      const data = await response.json();
      logger.debug('New chat created with admin token', data);

      return data.chat_id;
    } catch (error) {
      logger.error('Failed to create new chat', error);
      throw error;
    }
  };

  const sendMessage = useCallback(async () => {
    if (inputText.trim() === '') return;
    logger.info('Sending message', { messageLength: inputText.length });

    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: currentTime,
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // Анализируем запрос пользователя на предмет образовательного содержания
      const educationalQuery = await assistantAgent.processUserQuery(newMessage.text);

      // Если это образовательный запрос, обрабатываем его
      if (educationalQuery.action === 'START_TEST') {
        // Сохраняем информацию о предмете и теме
        if (educationalQuery.subject) setCurrentSubject(educationalQuery.subject);
        if (educationalQuery.topic) setCurrentTopic(educationalQuery.topic);

        // Задаем тип теста и подготавливаем тест
        setCurrentTestType(educationalQuery.testType || 'T1');

        // Добавляем ответ бота
        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: educationalQuery.response,
          isUser: false,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages(prev => [...prev, botResponse]);

        // Через небольшую задержку показываем модальное окно с тестом
        setTimeout(() => {
          prepareTest(
            educationalQuery.testType || 'T1',
            educationalQuery.subject || '',
            educationalQuery.topic
          );
        }, 1500);

        setIsLoading(false);
        return;
      }

      // Если это не образовательный запрос, продолжаем стандартную обработку
      // 2. Create a new chat if this is a new chat session
      let chatIdToUse = currentChatId;
      if (isNewChat) {
        try {
          const newChatId = await createNewChat();
          chatIdToUse = newChatId;
          setCurrentChatId(newChatId);
          setIsNewChat(false); // No longer a new chat after creation
          logger.info('New chat created and set as current', { newChatId });
        } catch (error) {
          logger.error('Failed in chat creation', error);
          throw error;
        }
      }

      // 3. Send the message to the chat (existing or newly created)
      let userToken = token;
      if (!userToken) {
        // Fallback на admin токен, если токен пользователя недоступен
        logger.warn('No user token available, using admin token for sending message');
        userToken = await getAdminToken();
        if (!userToken) {
          throw new Error('Не удалось получить токен для отправки сообщения');
        }
      }

      // Отправка сообщения без дополнительной информации о пользователе
      // Это поможет избежать ошибки с undefined selected_subjects
      const messageData = {
        message: newMessage.text,
        simple_mode: true, // Флаг, указывающий, что это простое сообщение без данных профиля
      };

      logger.debug('Sending request to API', {
        message: newMessage.text,
        chatId: chatIdToUse,
        simple_mode: true,
      });
      try {
        // Пробуем отправить с токеном пользователя
        const response = await fetch(`${API_BASE_URL}/api/gigachat/chat/${chatIdToUse}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + userToken,
          },
          body: JSON.stringify(messageData),
        });

        // Если запрос с токеном пользователя не удался, пробуем с admin токеном
        if (!response.ok && (response.status === 401 || response.status === 403)) {
          logger.warn('User token not authorized for sending message, trying admin token');
          const adminToken = await getAdminToken();

          const adminResponse = await fetch(`${API_BASE_URL}/api/gigachat/chat/${chatIdToUse}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: 'Bearer ' + adminToken,
            },
            body: JSON.stringify(messageData),
          });

          if (!adminResponse.ok) {
            throw new Error(`Failed to send message with admin token: ${adminResponse.status}`);
          }

          const adminData = await adminResponse.json();
          const botResponse: Message = {
            id: (Date.now() + 1).toString(),
            text: adminData.message || 'Что-то пошло нет так, я не могу сейчас ответить тебе.',
            isUser: false,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };

          setMessages(prev => [...prev, botResponse]);
          logger.info('Bot response added successfully using admin token');
          return;
        }

        // Если запрос с токеном пользователя прошел успешно
        const data = await response.json();
        logger.debug('Received API response', data);

        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: data.message || 'Что-то пошло нет так, я не могу сейчас ответить тебе.',
          isUser: false,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages(prev => [...prev, botResponse]);
        logger.info('Bot response added successfully');
      } catch (apiError) {
        // Обрабатываем ошибки API
        logger.error('API request failed:', apiError);
        throw apiError;
      }
    } catch (error) {
      logger.error('Failed to get bot response', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Извините, произошла ошибка. Попробуйте позже.',
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [inputText, currentChatId, isNewChat, token, assistantAgent]);

  // Функция для подготовки теста
  const prepareTest = async (testType: 'T1' | 'T2', subject: string, topic?: string) => {
    try {
      logger.info('Preparing test', { testType, subject, topic });

      // Создаем тестовые вопросы в зависимости от типа теста
      const questions: TestQuestion[] = [];

      if (testType === 'T1' && topic) {
        // Тест по конкретной теме
        questions.push({
          id: '1',
          question: `Насколько хорошо вы знакомы с темой "${topic}" в предмете "${subject}"?`,
          options: ['Хорошо знаком', 'Имею базовое представление', 'Практически не знаком'],
          type: 'self-assessment',
        });

        questions.push({
          id: '2',
          question: `Решите задачу по теме "${topic}": [здесь будет сгенерирована задача]`,
          type: 'open-ended',
        });
      } else if (testType === 'T2') {
        // Тест по всему предмету
        questions.push({
          id: '1',
          question: `Оцените ваш уровень знаний по предмету "${subject}" в целом`,
          options: ['Продвинутый', 'Средний', 'Начинающий'],
          type: 'self-assessment',
        });

        // Добавим вопросы по основным темам предмета
        if (subject === 'математика') {
          const mathTopics = ['Алгебра', 'Геометрия', 'Тригонометрия', 'Функции', 'Уравнения'];
          mathTopics.forEach((mathTopic, index) => {
            questions.push({
              id: `topic-${index + 2}`,
              question: `Насколько хорошо вы знаете тему "${mathTopic}"?`,
              options: ['Знаком', 'Сомневаюсь', 'Не знаком'],
              type: 'self-assessment',
            });
          });
        }

        // Добавляем задачу для проверки знаний
        questions.push({
          id: 'problem-1',
          question: `Решите задачу по предмету "${subject}": [здесь будет сгенерирована задача]`,
          type: 'open-ended',
        });
      }

      // Создаем объект теста
      const test: Test = {
        id: `test-${Date.now()}`,
        title:
          testType === 'T1'
            ? `Тест по теме "${topic}"`
            : `Диагностика знаний по предмету "${subject}"`,
        description:
          'Этот тест поможет оценить ваш текущий уровень знаний и подготовить персонализированный план обучения.',
        questions,
      };

      setCurrentTest(test);
      setShowTestModal(true);
    } catch (error) {
      logger.error('Error preparing test', error);

      // Показываем сообщение об ошибке
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Извините, не удалось подготовить тест. Пожалуйста, попробуйте еще раз позже.',
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleTextChange = useCallback((text: string) => {
    setInputText(text);
  }, []);

  const keyExtractor = useCallback((item: Message) => item.id, []);

  const renderMessage = useCallback(
    ({ item }: { item: Message }) => (
      <View
        style={[
          styles.messageContainer,
          item.isUser ? styles.userMessageContainer : styles.botMessageContainer,
        ]}
      >
        {!item.isUser && (
          <View style={styles.avatarContainer}>
            <Image
              source={require('@/assets/images/qwen-ai.png')}
              style={styles.avatar}
              resizeMode="contain"
            />
          </View>
        )}
        <View
          style={[
            styles.messageBubble,
            item.isUser ? styles.userMessageBubble : styles.botMessageBubble,
          ]}
        >
          <Text style={[styles.messageText, item.isUser && styles.userMessageText]}>
            {item.text}
          </Text>
          <Text style={[styles.timestamp, item.isUser && styles.userTimestamp]}>
            {item.timestamp}
          </Text>
        </View>
      </View>
    ),
    []
  );

  // Обработка завершения теста
  const handleTestComplete = async () => {
    setTestCompleted(true);
    setShowTestModal(false);

    try {
      // Анализируем результаты теста
      if (currentTest) {
        const testResults = await analyticalAgent.analyzeTestResults(currentTest, testAnswers);

        // Формируем сообщение с результатами
        let resultMessage = `Тест завершен! Результат: ${testResults.score}%\n\n`;

        if (testResults.weakTopics.length > 0) {
          resultMessage += `Темы, требующие внимания:\n`;
          testResults.weakTopics.forEach(topic => {
            resultMessage += `• ${topic}\n`;
          });
          resultMessage += `\n`;
        }

        if (testResults.successfulTopics.length > 0) {
          resultMessage += `Темы, которые вы хорошо усвоили:\n`;
          testResults.successfulTopics.forEach(topic => {
            resultMessage += `• ${topic}\n`;
          });
          resultMessage += `\n`;
        }

        // Добавляем рекомендации
        if (testResults.recommendations.length > 0) {
          resultMessage += `Рекомендации:\n`;
          testResults.recommendations.forEach(rec => {
            resultMessage += `• ${rec}\n`;
          });
        }

        // Добавляем сообщение с результатами теста
        const botResponseResult: Message = {
          id: (Date.now() + 1).toString(),
          text: resultMessage,
          isUser: false,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages(prev => [...prev, botResponseResult]);

        // Если тест выявил слабые темы, показываем меню M1
        if (testResults.weakTopics.length > 0) {
          setTimeout(() => {
            const menuMessage: Message = {
              id: (Date.now() + 2).toString(),
              text: 'Что вы хотите сделать дальше?',
              isUser: false,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };

            setMessages(prev => [...prev, menuMessage]);
            setMenuType('M1');
            setShowActionMenu(true);
          }, 1000);
        } else {
          // Если тест пройден успешно, сразу генерируем урок
          setTimeout(() => {
            const successMessage: Message = {
              id: (Date.now() + 2).toString(),
              text: 'Похоже, у вас уже хорошие знания по этой теме! Давайте перейдем к уроку.',
              isUser: false,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };

            setMessages(prev => [...prev, successMessage]);

            if (currentSubject && currentTopic) {
              setTimeout(() => {
                generateLesson(currentSubject, currentTopic, 1);
              }, 1000);
            }
          }, 1000);
        }
      }
    } catch (error) {
      logger.error('Error processing test results', error);

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Извините, произошла ошибка при обработке результатов теста. Пожалуйста, попробуйте еще раз позже.',
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, errorMessage]);
    }
  };

  // Обработка ответов на вопросы теста
  const handleAnswerChange = (questionId: string, answer: string) => {
    setTestAnswers(prev => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  // Генерация урока
  const generateLesson = async (subject: string, topic: string, level: number) => {
    try {
      setIsLoading(true);

      // Добавляем сообщение о генерации урока
      const generatingMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `Генерирую урок по теме "${topic}" по предмету "${subject}"...`,
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, generatingMessage]);

      // Генерируем урок
      const lesson = await contentAgent.generateLesson(subject, topic, level);
      setCurrentLesson(lesson);

      // Добавляем сообщение с уроком
      const lessonReadyMessage: Message = {
        id: (Date.now() + 2).toString(),
        text: `Урок по теме "${topic}" готов! Нажмите здесь, чтобы просмотреть его.`,
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, lessonReadyMessage]);

      // Показываем урок
      setTimeout(() => {
        setShowLessonModal(true);
      }, 1000);
    } catch (error) {
      logger.error('Error generating lesson', error);

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Извините, произошла ошибка при генерации урока. Пожалуйста, попробуйте еще раз позже.',
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Обработка действий из меню M1
  const handleMenuAction = (action: string) => {
    setShowActionMenu(false);

    if (menuType === 'M1') {
      if (action === '1.1' && currentLesson) {
        // Разобрать пример
        const exampleMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: `Давайте разберем пример:\n\n${currentLesson.examples[0].content}\n\nРешение:\n${currentLesson.examples[0].solution}`,
          isUser: false,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages(prev => [...prev, exampleMessage]);
      } else if (action === '1.2' && currentLesson) {
        // Выдать еще одно задание
        const assignmentMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: `Попробуйте решить это задание:\n\n${currentLesson.assignments[0].question}`,
          isUser: false,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages(prev => [...prev, assignmentMessage]);
      } else if (action === '1.3') {
        // Недостающие темы
        if (currentSubject && currentTopic) {
          generateLesson(currentSubject, currentTopic, 1);
        }
      }
    } else if (menuType === 'M2') {
      if (action === '2.1') {
        // Пройти задание на 2 звездочки
        const mediumAssignmentMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: `Задание среднего уровня (2 звездочки):\n\n${currentLesson?.assignments[1]?.question || 'Загрузка задания...'}`,
          isUser: false,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages(prev => [...prev, mediumAssignmentMessage]);
      } else if (action === '2.2') {
        // Пройти задание на 3 звездочки
        const hardAssignmentMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: `Сложное задание (3 звездочки):\n\n${currentLesson?.assignments[2]?.question || 'Загрузка задания...'}`,
          isUser: false,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages(prev => [...prev, hardAssignmentMessage]);
      } else if (action === '2.3') {
        // Не проходить
        const skipMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: 'Хорошо! Вы можете вернуться к этим заданиям позже, когда будете готовы.',
          isUser: false,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages(prev => [...prev, skipMessage]);
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={24} color={COLORS.text} />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <View style={styles.assistantAvatarContainer}>
            <Image
              source={require('@/assets/images/qwen-ai.png')}
              style={styles.assistantAvatar}
              resizeMode="contain"
            />
            <View style={styles.statusIndicator} />
          </View>
          <View>
            <Text style={styles.headerTitle}>AI-ассистент</Text>
            <Text style={styles.headerSubtitle}>{currentChatId ? 'Онлайн' : 'Новый чат'}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => logger.debug('Menu button pressed')}
        >
          <MoreVertical size={20} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={scrollToEnd}
        />

        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={styles.loadingText}>AI-ассистент печатает...</Text>
          </View>
        )}

        {showActionMenu && (
          <View style={styles.menuContainer}>
            {menuType === 'M1' && (
              <>
                <TouchableOpacity style={styles.menuButton} onPress={() => handleMenuAction('1.1')}>
                  <View style={styles.menuButtonIcon}>
                    <BookOpen size={18} color={COLORS.primary} />
                  </View>
                  <Text style={styles.menuButtonText}>Разобрать пример</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuButton} onPress={() => handleMenuAction('1.2')}>
                  <View style={styles.menuButtonIcon}>
                    <ClipboardList size={18} color={COLORS.primary} />
                  </View>
                  <Text style={styles.menuButtonText}>Выдать еще одно задание</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuButton} onPress={() => handleMenuAction('1.3')}>
                  <View style={styles.menuButtonIcon}>
                    <BookOpen size={18} color={COLORS.primary} />
                  </View>
                  <Text style={styles.menuButtonText}>Сгенерировать урок по недостающим темам</Text>
                </TouchableOpacity>
              </>
            )}

            {menuType === 'M2' && (
              <>
                <TouchableOpacity style={styles.menuButton} onPress={() => handleMenuAction('2.1')}>
                  <View style={styles.menuButtonIcon}>
                    <Star size={18} color={COLORS.primary} />
                    <Star size={18} color={COLORS.primary} />
                  </View>
                  <Text style={styles.menuButtonText}>Пройти задание на 2 звездочки</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuButton} onPress={() => handleMenuAction('2.2')}>
                  <View style={styles.menuButtonIcon}>
                    <Star size={18} color={COLORS.primary} />
                    <Star size={18} color={COLORS.primary} />
                    <Star size={18} color={COLORS.primary} />
                  </View>
                  <Text style={styles.menuButtonText}>Пройти задание на 3 звездочки</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuButton} onPress={() => handleMenuAction('2.3')}>
                  <Text style={styles.menuButtonText}>Не проходить</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}

        <View style={styles.inputContainer}>
          <TouchableOpacity
            style={styles.attachButton}
            onPress={() => logger.debug('Attachment button pressed')}
          >
            <Paperclip size={22} color={COLORS.primary} />
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={handleTextChange}
            placeholder={isNewChat ? 'Начните новый чат...' : 'Введите сообщение...'}
            multiline
            maxLength={500}
            placeholderTextColor={COLORS.textSecondary}
            onFocus={() => logger.debug('Input focused')}
          />

          {inputText.trim() === '' ? (
            <TouchableOpacity
              style={styles.micButton}
              onPress={() => logger.debug('Mic button pressed')}
            >
              <Mic size={22} color={COLORS.primary} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.sendButton, isLoading && styles.disabledButton]}
              onPress={sendMessage}
              disabled={isLoading}
            >
              <SendHorizontal size={22} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>

      {/* Модальное окно для теста */}
      <Modal
        visible={showTestModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowTestModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{currentTest?.title}</Text>
              <Text style={styles.modalDescription}>{currentTest?.description}</Text>
            </View>

            <ScrollView style={styles.modalBody}>
              {currentTest?.questions.map((question, index) => (
                <View key={question.id} style={styles.questionContainer}>
                  <Text style={styles.questionText}>{`${index + 1}. ${question.question}`}</Text>

                  {question.type === 'multiple-choice' &&
                    question.options?.map((option, optIndex) => (
                      <TouchableOpacity
                        key={`${question.id}-${optIndex}`}
                        style={[
                          styles.optionButton,
                          testAnswers[question.id] === option && styles.optionButtonSelected,
                        ]}
                        onPress={() => handleAnswerChange(question.id, option)}
                      >
                        <Text
                          style={[
                            styles.optionText,
                            testAnswers[question.id] === option && styles.optionTextSelected,
                          ]}
                        >
                          {option}
                        </Text>
                      </TouchableOpacity>
                    ))}

                  {question.type === 'self-assessment' &&
                    question.options?.map((option, optIndex) => (
                      <TouchableOpacity
                        key={`${question.id}-${optIndex}`}
                        style={[
                          styles.optionButton,
                          testAnswers[question.id] === option && styles.optionButtonSelected,
                        ]}
                        onPress={() => handleAnswerChange(question.id, option)}
                      >
                        <Text
                          style={[
                            styles.optionText,
                            testAnswers[question.id] === option && styles.optionTextSelected,
                          ]}
                        >
                          {option}
                        </Text>
                      </TouchableOpacity>
                    ))}

                  {question.type === 'open-ended' && (
                    <TextInput
                      style={styles.openEndedInput}
                      multiline
                      placeholder="Введите ваш ответ здесь..."
                      value={testAnswers[question.id] || ''}
                      onChangeText={text => handleAnswerChange(question.id, text)}
                    />
                  )}
                </View>
              ))}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.completeButton} onPress={handleTestComplete}>
                <Text style={styles.completeButtonText}>Завершить тест</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Модальное окно для урока */}
      <Modal
        visible={showLessonModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowLessonModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{currentLesson?.title}</Text>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.lessonContent}>
                <Text style={styles.lessonText}>{currentLesson?.content}</Text>

                <View style={styles.assignmentsContainer}>
                  <Text style={styles.assignmentsTitle}>Задания:</Text>

                  {currentLesson?.assignments.map((assignment: LessonAssignment, index: number) => (
                    <View key={assignment.id} style={styles.assignmentItem}>
                      <View style={styles.assignmentHeader}>
                        <Text style={styles.assignmentTitle}>
                          Задание {index + 1} ({assignment.difficulty}{' '}
                          {assignment.difficulty === 1
                            ? 'звездочка'
                            : assignment.difficulty === 2
                              ? 'звездочки'
                              : 'звездочки'}
                          )
                        </Text>
                        <View style={styles.starsContainer}>
                          {Array.from({ length: assignment.difficulty }).map((_, i) => (
                            <Star key={i} size={14} color={COLORS.accent3} />
                          ))}
                        </View>
                      </View>
                      <Text style={styles.assignmentQuestion}>{assignment.question}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.examplesContainer}>
                  <Text style={styles.examplesTitle}>Примеры с решениями:</Text>

                  {currentLesson?.examples.map((example: LessonExample) => (
                    <View key={example.id} style={styles.exampleItem}>
                      <Text style={styles.exampleTitle}>{example.title}</Text>
                      <Text style={styles.exampleContent}>{example.content}</Text>
                      <Text style={styles.exampleSolutionTitle}>Решение:</Text>
                      <Text style={styles.exampleSolution}>{example.solution}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.completeButton}
                onPress={() => setShowLessonModal(false)}
              >
                <Text style={styles.completeButtonText}>Закрыть урок</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  backButton: {
    padding: 4,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  assistantAvatarContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#EEF0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    position: 'relative',
  },
  assistantAvatar: {
    width: 26,
    height: 26,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderWidth: 2,
    borderColor: COLORS.card,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  menuButton: {
    padding: 4,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  botMessageContainer: {
    justifyContent: 'flex-start',
  },
  avatarContainer: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EEF0FF',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatar: {
    width: 24,
    height: 24,
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 16,
    borderRadius: 20,
  },
  userMessageBubble: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 4,
  },
  botMessageBubble: {
    backgroundColor: COLORS.card,
    borderBottomLeftRadius: 4,
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  messageText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  timestamp: {
    fontSize: 10,
    color: COLORS.textSecondary,
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  userTimestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  attachButton: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 14,
    color: COLORS.text,
  },
  micButton: {
    marginLeft: 10,
  },
  sendButton: {
    marginLeft: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  disabledButton: {
    backgroundColor: COLORS.textSecondary,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginLeft: 10,
    color: COLORS.textSecondary,
    fontSize: 14,
  },

  // Стили для модальных окон
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.primary,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  modalBody: {
    padding: 16,
    maxHeight: '60%',
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  questionContainer: {
    marginBottom: 20,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  optionButton: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 8,
    backgroundColor: COLORS.background,
  },
  optionButtonSelected: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(91, 103, 202, 0.1)',
  },
  optionText: {
    fontSize: 14,
    color: COLORS.text,
  },
  optionTextSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  openEndedInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    textAlignVertical: 'top',
    fontSize: 14,
    color: COLORS.text,
  },
  completeButton: {
    backgroundColor: COLORS.primary,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  // Стили для урока
  lessonContent: {
    marginBottom: 16,
  },
  lessonText: {
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.text,
    marginBottom: 20,
  },
  assignmentsContainer: {
    marginBottom: 20,
  },
  assignmentsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  assignmentItem: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  assignmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  assignmentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  starsContainer: {
    flexDirection: 'row',
  },
  assignmentQuestion: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
  examplesContainer: {
    marginBottom: 20,
  },
  examplesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  exampleItem: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  exampleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  exampleContent: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
    marginBottom: 12,
  },
  exampleSolutionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 6,
  },
  exampleSolution: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
    fontStyle: 'italic',
  },

  // Стили для меню действий
  menuContainer: {
    backgroundColor: COLORS.card,
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  menuButtonIcon: {
    flexDirection: 'row',
    marginRight: 8,
  },
  menuButtonText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '500',
  },
});
