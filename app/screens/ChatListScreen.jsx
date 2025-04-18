import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import apiClient from '../api/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

// Константы цветов для приложения
const COLORS = {
  primary: '#0066CC',
  secondary: '#00897B',
  background: '#F5F5F5',
  text: '#333333',
  textSecondary: '#666666',
  border: '#EEEEEE',
  error: '#D32F2F',
  errorBackground: '#FFEBEE',
};

// Мок-данные для работы в автономном режиме
const MOCK_CHATS = [
  {
    id: 'mock-1',
    lastMessage: 'Это демо-чат для тестирования. Сервер недоступен.',
    type: 'gigachat',
    timestamp: new Date().toISOString()
  },
  {
    id: 'mock-2',
    lastMessage: 'Диагностический чат (демо). Сервер недоступен.',
    type: 'diagnostic',
    createdAt: new Date().toISOString()
  }
];

const ChatListScreen = () => {
  const [chats, setChats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const navigation = useNavigation();
  // Добавляем ref для отслеживания монтирования компонента
  const isMounted = React.useRef(true);
  const [isOpeningChat, setIsOpeningChat] = useState(false);

  // Устанавливаем флаг монтирования при размонтировании компонента
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Загрузка списка чатов при монтировании
  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  // Функция загрузки списка чатов - оптимизируем с useCallback
  const fetchChats = React.useCallback(async () => {
    if (!isMounted.current) return; // Не выполняем операции, если компонент размонтирован
    
    setIsLoading(true);
    setError(null);

    try {
      // Загрузка обычных чатов
      let gigaChats = [];
      try {
        const gigaChatsResponse = await apiClient.gigachat.list();
        
        // Проверяем и обрабатываем ответ API
        if (gigaChatsResponse.data && Array.isArray(gigaChatsResponse.data)) {
          gigaChats = gigaChatsResponse.data.map(chat => ({
            id: chat.id || chat._id,
            lastMessage: chat.lastMessage || 'Новый чат',
            type: 'gigachat',
            timestamp: chat.timestamp || chat.createdAt || new Date().toISOString()
          }));
        } else if (gigaChatsResponse.data) {
          console.log('Нестандартный формат данных от API:', gigaChatsResponse.data);
        }
      } catch (err) {
        console.warn('Ошибка загрузки GigaChat чатов:', err);
        // Если основной API недоступен, активируем автономный режим
        if (isMounted.current) {
          setIsOfflineMode(true);
        }
      }

      // Загрузка диагностических чатов
      let diagnosticChats = [];
      try {
        const diagnosticResponse = await apiClient.initial_diagnostics.list();
        
        // Проверяем и обрабатываем ответ API
        if (diagnosticResponse.data && Array.isArray(diagnosticResponse.data)) {
          diagnosticChats = diagnosticResponse.data.map(chat => ({
            id: chat._id || chat.id,
            lastMessage: 
              chat.messages && chat.messages.length > 0 
                ? chat.messages[chat.messages.length - 1]?.content 
                : 'Новый диагностический чат',
            type: 'diagnostic',
            createdAt: chat.createdAt || new Date().toISOString(),
            status: chat.status || 'active'
          }));
        } else if (diagnosticResponse.data) {
          console.log('Нестандартный формат данных от API:', diagnosticResponse.data);
        }
      } catch (err) {
        console.warn('Ошибка загрузки диагностических чатов:', err);
      }

      // Проверяем, что компонент все еще смонтирован перед обновлением состояния
      if (!isMounted.current) return;

      // Если оба запроса не удались и у нас нет данных, используем мок-данные
      if (gigaChats.length === 0 && diagnosticChats.length === 0 && isOfflineMode) {
        console.log('Используем мок-данные для офлайн-режима');
        setChats(MOCK_CHATS);
        setError('Сервер временно недоступен. Отображаются демо-данные.');
      } else {
        // Объединяем и сортируем по дате
        const allChats = [...gigaChats, ...diagnosticChats].sort((a, b) => {
          const dateA = a.timestamp || a.createdAt || new Date();
          const dateB = b.timestamp || b.createdAt || new Date();
          return new Date(dateB) - new Date(dateA);
        });

        setChats(allChats);
      }
    } catch (err) {
      console.error('Ошибка загрузки чатов:', err);
      // Проверяем, что компонент все еще смонтирован перед обновлением состояния
      if (isMounted.current) {
        setError('Не удалось загрузить список чатов. Проверьте подключение к интернету.');
        setIsOfflineMode(true);
        setChats(MOCK_CHATS);
      }
    } finally {
      // Проверяем, что компонент все еще смонтирован перед обновлением состояния
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [isOfflineMode, isMounted]);

  // Открыть существующий чат
  const openChat = React.useCallback((item) => {
    if (isOfflineMode) {
      Alert.alert(
        'Автономный режим', 
        'Сервер временно недоступен. Пожалуйста, проверьте подключение к интернету и попробуйте позже.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    // Проверяем, есть ли у элемента ID
    if (!item.id) {
      console.error('Ошибка: отсутствует ID чата', item);
      Alert.alert('Ошибка', 'Невозможно открыть чат: отсутствует идентификатор.');
      return;
    }
    
    // Предотвращаем повторные нажатия
    if (isOpeningChat) return;
    setIsOpeningChat(true);
    
    try {
      // Очищаем состояние чата и добавляем задержку между операциями
      AsyncStorage.setItem('current_chat_cleared', 'true')
        .then(() => {
          console.log(`Открываем чат типа ${item.type} с ID: ${item.id}`);
          
          // Используем увеличенную задержку
          setTimeout(() => {
            // Простой подход к навигации
            if (item.type === 'diagnostic') {
              navigation.navigate('DiagnosticChat', { 
                chatId: item.id,
                timestamp: new Date().getTime() // Добавляем timestamp для уникальности
              });
            } else {
              navigation.navigate('Chat', { 
                chatId: item.id,
                timestamp: new Date().getTime() // Добавляем timestamp для уникальности
              });
            }
            
            // Сбрасываем флаг с задержкой
            setTimeout(() => {
              if (isMounted.current) {
                setIsOpeningChat(false);
              }
            }, 1000);
          }, 500);
        });
    } catch (err) {
      console.error('Ошибка при навигации:', err);
      Alert.alert('Ошибка', 'Не удалось открыть чат. Возможно, возникла проблема с навигацией.');
      setIsOpeningChat(false);
    }
  }, [isOfflineMode, navigation, isOpeningChat, isMounted]);

  // Создание нового диагностического чата
  const createNewDiagnosticChat = React.useCallback(() => {
    if (isOfflineMode) {
      Alert.alert(
        'Автономный режим', 
        'Сервер временно недоступен. Пожалуйста, проверьте подключение к интернету и попробуйте позже.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    // Предотвращаем повторные нажатия
    if (isOpeningChat) return;
    setIsOpeningChat(true);
    
    try {
      console.log('Создаем новый диагностический чат');
      
      // Очищаем состояние чата перед навигацией с увеличенной задержкой
      AsyncStorage.setItem('current_chat_cleared', 'true')
        .then(() => {
          setTimeout(() => {
            // Используем простую навигацию вместо reset
            navigation.navigate('DiagnosticChat', {
              timestamp: new Date().getTime() // Уникальный параметр
            });
            
            // Сбрасываем флаг с задержкой
            setTimeout(() => {
              if (isMounted.current) {
                setIsOpeningChat(false);
              }
            }, 1000);
          }, 500);
        });
    } catch (err) {
      console.error('Ошибка при навигации к DiagnosticChat:', err);
      Alert.alert('Ошибка', 'Не удалось открыть диагностический чат. Пожалуйста, попробуйте позже.');
      setIsOpeningChat(false);
    }
  }, [isOfflineMode, navigation, isOpeningChat, isMounted]);

  // Создание нового обычного чата
  const createNewChat = React.useCallback(async () => {
    if (isOfflineMode) {
      Alert.alert(
        'Автономный режим', 
        'Сервер временно недоступен. Пожалуйста, проверьте подключение к интернету и попробуйте позже.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    // Предотвращаем повторные нажатия
    if (isOpeningChat) return;
    setIsOpeningChat(true);
    
    try {
      if (!isMounted.current) {
        setIsOpeningChat(false);
        return;
      }
      
      setIsLoading(true);
      console.log('Запрашиваем создание нового чата');
      
      // Очищаем состояние перед запросом API
      await AsyncStorage.setItem('current_chat_cleared', 'true');
      
      // Добавляем искусственную задержку
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const response = await apiClient.gigachat.new();
      console.log('Ответ API на создание чата:', response.data);
      
      // Проверяем, что компонент все еще смонтирован
      if (!isMounted.current) {
        setIsOpeningChat(false);
        setIsLoading(false);
        return;
      }
      
      // Увеличенная задержка перед навигацией
      setTimeout(() => {
        // Проверяем формат ответа
        if (response.data && response.data.chat_id) {
          // Стандартный ответ, как ожидается
          navigation.navigate('Chat', { 
            chatId: response.data.chat_id,
            timestamp: new Date().getTime() // Уникальный параметр
          });
        } else if (response.data && response.data._id) {
          // Альтернативный формат ответа от VPS
          navigation.navigate('Chat', { 
            chatId: response.data._id,
            timestamp: new Date().getTime() // Уникальный параметр
          });
        } else {
          console.error('Неожиданный формат ответа API:', response.data);
          Alert.alert('Ошибка', 'Получен некорректный ответ от сервера при создании чата.');
        }
        
        // Сбрасываем флаг с задержкой
        setTimeout(() => {
          if (isMounted.current) {
            setIsOpeningChat(false);
            setIsLoading(false);
          }
        }, 1000);
      }, 500);
    } catch (err) {
      console.error('Ошибка создания чата:', err);
      if (isMounted.current) {
        Alert.alert('Ошибка', 'Не удалось создать новый чат. Попробуйте позже.');
        setIsOpeningChat(false);
        setIsLoading(false);
      }
    }
  }, [isOfflineMode, navigation, isMounted, isOpeningChat]);

  // Рендер пустого списка
  const renderEmptyList = React.useCallback(() => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>У вас пока нет чатов.</Text>
      <Text style={styles.emptySubtext}>Начните новую консультацию!</Text>
    </View>
  ), []);

  // Вспомогательная функция форматирования даты
  const formatChatDate = React.useCallback((dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffMinutes < 1) return 'Сейчас';
    if (diffMinutes < 60) return `${diffMinutes} мин.`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} ч.`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} д.`;
    
    return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
  }, []);

  // Рендер элемента чата
  const renderChatItem = React.useCallback(({ item }) => (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() => openChat(item)}
    >
      <View style={styles.chatInfo}>
        <Text style={styles.chatTitle} numberOfLines={1}>
          {item.title || 'Новая консультация'}
        </Text>
        <Text style={styles.chatPreview} numberOfLines={1}>
          {item.lastMessage || 'Нет сообщений'}
        </Text>
      </View>
      <View style={styles.chatMeta}>
        <Text style={styles.chatDate}>
          {item.updatedAt ? formatChatDate(item.updatedAt) : 'Сейчас'}
        </Text>
        <MaterialIcons name="chevron-right" size={24} color={COLORS.textSecondary} />
      </View>
    </TouchableOpacity>
  ), [openChat]);
  
  // Показываем индикатор загрузки если идет загрузка
  if (isLoading && chats.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066CC" />
          <Text style={styles.loadingText}>Загрузка чатов...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Кнопки создания новых чатов */}
      <View style={styles.newChatButtons}>
        <TouchableOpacity 
          style={[styles.newChatButton, styles.diagnosticButton]} 
          onPress={createNewDiagnosticChat}
        >
          <MaterialIcons name="psychology" size={24} color="#FFFFFF" />
          <Text style={styles.newChatButtonText}>Диагностический чат</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.newChatButton, styles.regularButton]} 
          onPress={createNewChat}
        >
          <MaterialIcons name="chat" size={24} color="#FFFFFF" />
          <Text style={styles.newChatButtonText}>Обычный чат</Text>
        </TouchableOpacity>
      </View>

      {/* Показываем ошибку, если есть */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchChats}>
            <Text style={styles.retryButtonText}>Повторить</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Список чатов */}
      <FlatList
        data={chats}
        renderItem={renderChatItem}
        keyExtractor={(item) => 
          // Обеспечиваем уникальность ключа, добавляя к ID тип чата
          `${item.type}-${item.id}`
        }
        extraData={[isLoading, error]} // Обновляем список при изменении этих переменных
        contentContainerStyle={styles.chatList}
        ListEmptyComponent={renderEmptyList}
        onRefresh={fetchChats}
        refreshing={isLoading && chats.length > 0}
        // Отключаем множественное обновление
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        windowSize={5}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666666',
  },
  newChatButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  newChatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
  },
  diagnosticButton: {
    backgroundColor: '#0066CC',
  },
  regularButton: {
    backgroundColor: '#00897B',
  },
  newChatButtonText: {
    color: '#FFFFFF',
    marginLeft: 8,
    fontWeight: 'bold',
  },
  chatList: {
    flexGrow: 1,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  chatInfo: {
    flex: 1,
  },
  chatTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  chatPreview: {
    fontSize: 14,
    color: '#666666',
  },
  chatMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatDate: {
    fontSize: 14,
    color: '#666666',
    marginRight: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    marginTop: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginTop: 8,
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#D32F2F',
    textAlign: 'center',
    marginBottom: 8,
  },
  retryButton: {
    backgroundColor: '#D32F2F',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default ChatListScreen; 