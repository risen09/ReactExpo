import { useState, useCallback, useEffect } from 'react';
import apiClient from '../api/client';
import { ChatMessage, TrackAssistant } from '../types/aiAssistants';
import { Alert } from 'react-native';

interface UseTrackAssistantProps {
  trackId?: string;
  assistantId?: string;
}

// Интерфейсы для типизации ответов API
interface CreateAssistantResponse {
  assistant_id: string;
  track_id: string;
  track_info: {
    name: string;
    subject: string;
    topic?: string;
  };
}

interface AskQuestionResponse {
  reply: string;
  timestamp?: string;
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

export const useTrackAssistant = ({ trackId, assistantId: initialAssistantId }: UseTrackAssistantProps) => {
  const [assistantId, setAssistantId] = useState<string | undefined>(initialAssistantId);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trackAssistant, setTrackAssistant] = useState<TrackAssistant | null>(null);
  const [lastApiError, setLastApiError] = useState<ApiError | null>(null);

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
    
    return apiError;
  };

  // Создать ассистента для конкретного трека
  const createAssistant = useCallback(async (trackIdParam?: string) => {
    if (!trackIdParam && !trackId) {
      setError('ID трека не указан');
      return null;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.trackAssistants.create(trackIdParam || trackId as string);
      const data = response.data as CreateAssistantResponse;
      
      setAssistantId(data.assistant_id);
      setTrackAssistant({
        assistant_id: data.assistant_id,
        track_id: data.track_id,
        track_info: data.track_info,
        messages: [],
        created_at: new Date().toISOString()
      });
      
      return data.assistant_id;
    } catch (err: any) {
      const apiError = handleApiError(err);
      setError(apiError.message);
      
      // Показываем уведомление о проблеме с сетью
      if (apiError.type === ErrorType.NETWORK) {
        Alert.alert(
          'Проблема с подключением',
          'Не удалось создать ассистента. Проверьте подключение к интернету и повторите попытку.',
          [{ text: 'ОК' }]
        );
      }
      
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [trackId]);

  // Отправить вопрос ассистенту
  const sendMessage = useCallback(async (message: string, lessonId?: string) => {
    if (!assistantId) {
      setError('ID ассистента не указан');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    // Обновляем состояние сообщений с сообщением пользователя
    const userMessage: ChatMessage = {
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    try {
      const response = await apiClient.trackAssistants.askQuestion(
        assistantId,
        message,
        lessonId
      );
      
      const responseData = response.data as AskQuestionResponse;
      
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: responseData.reply,
        timestamp: responseData.timestamp || new Date().toISOString()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      if (trackAssistant) {
        setTrackAssistant({
          ...trackAssistant,
          messages: [...trackAssistant.messages, userMessage, assistantMessage],
          last_interaction: new Date().toISOString()
        });
      }
      
      return responseData;
    } catch (err: any) {
      const apiError = handleApiError(err);
      setError(apiError.message);
      
      // Добавляем сообщение об ошибке
      const errorContent = apiError.type === ErrorType.NETWORK
        ? 'Извините, не удалось получить ответ из-за проблем с подключением к серверу.'
        : 'Извините, произошла ошибка при получении ответа.';
      
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: errorContent,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
      // Для критических ошибок показываем Alert
      if (apiError.type === ErrorType.AUTH) {
        Alert.alert(
          'Требуется авторизация',
          'Ваша сессия истекла. Пожалуйста, войдите снова.',
          [{ text: 'ОК' }]
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, [assistantId, trackAssistant]);

  // Инициализация при наличии ID ассистента
  useEffect(() => {
    if (assistantId) {
      // Здесь можно реализовать загрузку предыдущих сообщений,
      // если такой API метод будет добавлен в клиент
    }
  }, [assistantId]);

  return {
    assistantId,
    messages,
    isLoading,
    error,
    trackAssistant,
    createAssistant,
    sendMessage,
    lastApiError
  };
};

export default useTrackAssistant; 