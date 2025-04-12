import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Search, Plus } from 'lucide-react-native';
import logger from '../utils/logger';

// Общая цветовая палитра приложения
const COLORS = {
  primary: '#5B67CA',     // Основной синий/фиолетовый
  secondary: '#43C0B4',   // Бирюзовый
  accent1: '#F98D51',     // Оранжевый
  accent2: '#EC575B',     // Красный
  accent3: '#FFCA42',     // Желтый
  background: '#F2F5FF',  // Светлый фон
  card: '#FFFFFF',        // Белый для карточек
  text: '#25335F',        // Основной текст
  textSecondary: '#7F8BB7',  // Вторичный текст
  border: '#EAEDF5'       // Граница
};

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

interface ChatItem {
  id: string;
  lastMessage: string;
}

export default function ChatsListScreen() {
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch chats list from API
  const fetchChats = useCallback(async () => {
    logger.info('Fetching chats list');
    setIsLoading(true);
    
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
      console.log('Admin token received for chats list:', adminToken ? 'YES' : 'NO');
    } catch (adminLoginError) {
      console.error('Admin login error:', adminLoginError);
      throw new Error('Ошибка доступа к системе аутентификации');
    }
    
    if (!adminToken) {
      throw new Error('Не удалось получить токен администратора');
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/gigachat/list`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + adminToken
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch chats: ${response.status}`);
      }
      
      const data = await response.json();
      logger.debug('Received chats data', data);
      
      if (Array.isArray(data)) {
        setChats(data);
        logger.info('Chats loaded successfully', { count: data.length });
      } else {
        logger.warn('Invalid data format for chats', { data });
        // If no chats, we could show some mock data or empty state
        setChats([]);
      }
    } catch (error) {
      logger.error('Failed to fetch chats', error);
      // Show some mock data if API fails
      setChats([
        { id: '1', lastMessage: 'Привет! Как я могу вам помочь сегодня?' },
        { id: '2', lastMessage: 'Вот материалы по математике, которые вы запрашивали.' }
      ]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load chats on component mount
  useEffect(() => {
    logger.info('Chats list screen mounted');
    fetchChats();
    return () => {
      logger.info('Chats list screen unmounted');
    };
  }, [fetchChats]);

  const handleChatPress = useCallback((chatId: string) => {
    logger.info('Chat selected', { chatId });
    // Navigate to chat screen with the selected chat ID
    router.push({
      pathname: "/screens/ChatScreen",
      params: { chatId }
    });
  }, []);

  const handleNewChat = useCallback(() => {
    logger.info('Creating new chat');
    // Logic to create a new chat could be implemented here
    // For now, just navigate to chat screen with no specific ID
    router.push("/screens/ChatScreen");
  }, []);

  const renderChatItem = useCallback(({ item }: { item: ChatItem }) => (
    <TouchableOpacity 
      style={styles.chatItem}
      onPress={() => handleChatPress(item.id)}
    >
      <View style={styles.avatarContainer}>
        <Image 
          source={require('../../images/qwen-ai.png')} 
          style={styles.avatar} 
          resizeMode="contain"
        />
      </View>
      <View style={styles.chatInfo}>
        <View style={styles.chatHeader}>
          <Text style={styles.chatTitle}>AI-ассистент</Text>
          <Text style={styles.timestamp}>Сегодня</Text>
        </View>
        <Text 
          style={styles.lastMessage}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {item.lastMessage}
        </Text>
      </View>
    </TouchableOpacity>
  ), [handleChatPress]);

  const keyExtractor = useCallback((item: ChatItem) => item.id, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Чаты</Text>
        <TouchableOpacity 
          style={styles.newChatButton}
          onPress={handleNewChat}
        >
          <Plus size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={18} color={COLORS.textSecondary} style={styles.searchIcon} />
          <Text style={styles.searchPlaceholder}>Поиск...</Text>
        </View>
      </View>
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Загрузка чатов...</Text>
        </View>
      ) : chats.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>У вас пока нет чатов</Text>
          <TouchableOpacity 
            style={styles.startChatButton}
            onPress={handleNewChat}
          >
            <Text style={styles.startChatButtonText}>Начать новый чат</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={chats}
          renderItem={renderChatItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.chatsList}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
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
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  newChatButton: {
    padding: 8,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.card,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchPlaceholder: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  startChatButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  startChatButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  chatsList: {
    paddingTop: 8,
  },
  chatItem: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.card,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#EEF0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatar: {
    width: 30,
    height: 30,
  },
  chatInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  timestamp: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  lastMessage: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.border,
    marginLeft: 70,
  },
}); 