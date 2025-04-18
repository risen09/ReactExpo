import { useState, useCallback, useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import apiClient from '../api/client';
import { ChatMessage } from '../types/aiAssistants';

// Типы для работы с диагностикой
interface DiagnosticResult {
  subjectArea: string;
  topic: string;
  difficulty: 'basic' | 'intermediate' | 'advanced';
  needsInitialTest: boolean;
  suggestedTopics?: string[];
  testId?: string;
}

// Интерфейсы для API ответов
interface GigaChatNewResponse {
  chat_id: string;
}

interface GigaChatMessageResponse {
  message: string;
  timestamp?: string;
  diagnosticResult?: DiagnosticResult;
  nextAction?: 'start_test' | 'create_track' | 'continue_chat';
}

// Добавляем новый интерфейс для ответа initial_diagnostics.get
interface DiagnosticChatResponse {
  messages: ChatMessage[];
  diagnosticResult?: DiagnosticResult;
  chatId: string;
}

interface TestInitialResponse {
  testId: string;
}

// Типы ошибок
enum ErrorType {
  NETWORK = 'network',
  SERVER = 'server',
  AUTH = 'auth',
  UNKNOWN = 'unknown'
}

// Интерфейс для расширенной информации об ошибке
interface ApiError {
  type: ErrorType;
  message: string;
  original?: any;
}

// Начальное сообщение от ассистента
const INITIAL_ASSISTANT_MESSAGE: ChatMessage = {
  role: 'assistant',
  content: 'Здравствуйте! Я ваш образовательный помощник. Расскажите, с каким предметом или темой вам нужна помощь? Например: "математика, 7 класс, тема дискриминант" или просто "помоги с физикой".',
  timestamp: new Date().toISOString()
};

export const useInitialDiagnostics = (initialChatId?: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_ASSISTANT_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [diagnosticResult, setDiagnosticResult] = useState<DiagnosticResult | null>(null);
  const [lastApiError, setLastApiError] = useState<ApiError | null>(null);
  const [chatId, setChatId] = useState<string | null>(initialChatId || null);
  const initializingRef = useRef(false);
  const isMounted = useRef(true);
  
  const navigation = useNavigation();

  // Отслеживаем размонтирование
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Инициализация чата при первой загрузке или при изменении initialChatId
  useEffect(() => {
    // Если initialChatId изменился, обновляем его
    if (initialChatId !== undefined && initialChatId !== chatId) {
      setChatId(initialChatId);
      
      // Если новый ID передан, загружаем историю
      if (initialChatId) {
        fetchChatHistory(initialChatId);
      }
    } else if (chatId && !initializingRef.current) {
      // Если chatId установлен и чат не инициализируется, загружаем историю
      fetchChatHistory(chatId);
    } else if (!chatId && !initializingRef.current) {
      // Если chatId не передан и чат еще не инициализируется, создаем новый
      initializingRef.current = true;
      initializeChat();
    }
  }, [initialChatId, chatId]);

  // Функция сброса состояния хука
  const resetState = useCallback(() => {
    if (!isMounted.current) return;
    
    setMessages([INITIAL_ASSISTANT_MESSAGE]);
    setDiagnosticResult(null);
    setError(null);
    setLastApiError(null);
    
    // Если нет текущего chatId, инициализируем новый чат
    if (!chatId && !initializingRef.current) {
      initializingRef.current = true;
      initializeChat();
    }
  }, [chatId]);

  // Загрузка истории сообщений
  const fetchChatHistory = async (id: string) => {
    if (!isMounted.current) return;
    
    setIsLoading(true);
    try {
      const response = await apiClient.initial_diagnostics.get(id);
      
      // Проверяем, что компонент все еще смонтирован после запроса
      if (!isMounted.current) return;
      
      const chatData = response.data as DiagnosticChatResponse;
      
      if (chatData && chatData.messages) {
        // Фильтруем системные сообщения
        const chatMessages = chatData.messages.filter(
          (msg: any) => msg.role !== 'system'
        ) as ChatMessage[];
        
        // Если нет сообщений, добавляем начальное приветствие
        if (chatMessages.length === 0) {
          setMessages([INITIAL_ASSISTANT_MESSAGE]);
        } else {
          setMessages(chatMessages);
        }
        
        // Сохраняем результаты диагностики, если есть
        if (chatData.diagnosticResult) {
          setDiagnosticResult(chatData.diagnosticResult);
        }
      }
    } catch (err: any) {
      // Проверяем, что компонент все еще смонтирован после ошибки
      if (isMounted.current) {
        handleApiError(err);
      }
    } finally {
      // Проверяем, что компонент все еще смонтирован в finally
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  };

  // Функция для инициализации нового чата
  const initializeChat = async () => {
    if (!isMounted.current) {
      initializingRef.current = false;
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await apiClient.initial_diagnostics.new();
      
      // Проверяем, что компонент все еще смонтирован после запроса
      if (!isMounted.current) {
        initializingRef.current = false;
        return;
      }
      
      const newChatResponse = response.data as GigaChatNewResponse;
      setChatId(newChatResponse.chat_id);
      // Сбрасываем сообщения до начального приветствия
      setMessages([INITIAL_ASSISTANT_MESSAGE]);
    } catch (err: any) {
      // Проверяем, что компонент все еще смонтирован после ошибки
      if (isMounted.current) {
        handleApiError(err);
      }
    } finally {
      // Проверяем, что компонент все еще смонтирован в finally
      if (isMounted.current) {
        setIsLoading(false);
      }
      initializingRef.current = false;
    }
  };

  // Вспомогательная функция для обработки ошибок API
  const handleApiError = (err: any): ApiError => {
    let errorType = ErrorType.UNKNOWN;
    let errorMessage = 'Произошла неизвестная ошибка';
    
    if (!err.response) {
      // Ошибка сети (отсутствие соединения, таймаут и т.д.)
      errorType = ErrorType.NETWORK;
      errorMessage = 'Ошибка подключения к серверу. Проверьте интернет-соединение.';
    } else if (err.response.status === 401 || err.response.status === 403) {
      // Ошибка авторизации
      errorType = ErrorType.AUTH;
      errorMessage = 'Требуется авторизация. Пожалуйста, войдите в систему снова.';
    } else if (err.response.status >= 500) {
      // Серверная ошибка
      errorType = ErrorType.SERVER;
      errorMessage = 'Ошибка сервера. Попробуйте позже.';
    } else if (err.response.data && err.response.data.message) {
      // Сообщение об ошибке от сервера
      errorMessage = err.response.data.message;
    }
    
    console.error(`API Error (${errorType}):`, errorMessage, err);
    
    // Сохраняем информацию об ошибке
    const apiError = { type: errorType, message: errorMessage, original: err };
    setLastApiError(apiError);
    setError(errorMessage);
    
    return apiError;
  };

  // Отправка сообщения диагностическому чат-боту
  const sendMessage = useCallback(async (message: string) => {
    if (!chatId) {
      if (isMounted.current) {
        setError('Чат не инициализирован. Пожалуйста, перезапустите приложение.');
      }
      return;
    }
    
    if (!isMounted.current) return;

    setIsLoading(true);
    setError(null);
    
    // Добавляем сообщение пользователя в чат
    const userMessage: ChatMessage = {
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    };
    
    // Обновляем состояние сообщений сразу, чтобы пользователь видел свое сообщение
    setMessages(prev => [...prev, userMessage]);
    
    try {
      // Отправляем сообщение в диагностический API
      const response = await apiClient.initial_diagnostics.sendMessage(chatId, message);
      
      // Проверяем, что компонент все еще смонтирован после запроса
      if (!isMounted.current) return;
      
      const messageResponse = response.data as GigaChatMessageResponse;
      
      // Добавляем ответ ассистента в чат
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: messageResponse.message,
        timestamp: messageResponse.timestamp || new Date().toISOString()
      };
      
      // Обновляем сообщения
      setMessages(prev => {
        const messages = [...prev];
        // Проверяем, не было ли уже добавлено это сообщение от ассистента
        const existingIndex = messages.findIndex(
          msg => msg.role === 'assistant' && 
                 msg.timestamp === assistantMessage.timestamp
        );
        
        if (existingIndex >= 0) {
          // Если сообщение уже есть, обновляем его
          messages[existingIndex] = assistantMessage;
        } else {
          // Иначе добавляем новое
          messages.push(assistantMessage);
        }
        
        return messages;
      });

      // Если в ответе есть результаты диагностики - обрабатываем их
      if (messageResponse.diagnosticResult) {
        const result = messageResponse.diagnosticResult;
        setDiagnosticResult(result);
        
        // Обрабатываем следующее действие
        if (messageResponse.nextAction === 'start_test' && result.testId) {
          // Предлагаем начать тест
          setTimeout(() => {
            if (isMounted.current) {
              Alert.alert(
                'Диагностический тест',
                `Рекомендуется пройти тест по теме "${result.topic}" для определения уровня знаний.`,
                [
                  {
                    text: 'Отложить',
                    style: 'cancel'
                  },
                  {
                    text: 'Начать тест',
                    onPress: () => startInitialTest(result.subjectArea, result.topic)
                  }
                ]
              );
            }
          }, 500);
        }
      }
    } catch (err: any) {
      // Проверяем, что компонент все еще смонтирован после ошибки
      if (isMounted.current) {
        handleApiError(err);
      }
    } finally {
      // Проверяем, что компонент все еще смонтирован в finally
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [chatId, isMounted]);

  // Явный запрос на начало тестирования
  const startInitialTest = useCallback(async (subject: string, topic: string) => {
    if (!isMounted.current) return;
    
    setIsLoading(true);
    try {
      const response = await apiClient.tests.startInitialTest(subject, topic);
      
      // Проверяем, что компонент все еще смонтирован
      if (!isMounted.current) return;
      
      const testResponse = response.data as TestInitialResponse;
      
      if (testResponse.testId) {
        // Получаем уровень сложности из результатов диагностики или используем 'basic' по умолчанию
        const difficulty = diagnosticResult?.difficulty || 'basic';
        
        console.log('Переходим на экран теста:', {
          testId: testResponse.testId,
          subject,
          topic,
          difficulty,
          needsInitialTest: true
        });
        
        // Переходим на экран теста по новому маршруту
        // @ts-ignore - используем игнорирование проверки типов для навигации
        navigation.navigate('test-screen', {
          testId: testResponse.testId,
          subject,
          topic,
          difficulty,
          needsInitialTest: true
        });
      } else {
        console.error('Не удалось получить ID теста');
        if (isMounted.current) {
          Alert.alert(
            'Ошибка',
            'Не удалось создать тест. Попробуйте позже.',
            [{ text: 'OK' }]
          );
        }
      }
    } catch (err: any) {
      console.error('Ошибка при создании теста:', err);
      if (isMounted.current) {
        handleApiError(err);
        Alert.alert(
          'Ошибка',
          'Не удалось создать тест. Пожалуйста, попробуйте позже.',
          [{ text: 'OK' }]
        );
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [navigation, isMounted, diagnosticResult]);

  return {
    messages,
    isLoading,
    error,
    diagnosticResult,
    sendMessage,
    startInitialTest,
    resetState
  };
};

export default useInitialDiagnostics; 