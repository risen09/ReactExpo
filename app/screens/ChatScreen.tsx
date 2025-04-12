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
} from 'react-native';
import { SendHorizontal, Paperclip, Mic, ChevronLeft, MoreVertical } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
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

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
}
export default function ChatScreen() {
  const params = useLocalSearchParams<{ chatId: string }>();
  const [currentChatId, setCurrentChatId] = useState<string>(params?.chatId || ''); // State for current chat ID
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const [isNewChat, setIsNewChat] = useState(!params?.chatId); // Track if this is a new chat

  const defaultWelcomeMessages = useMemo(() => [
    {
      id: '1',
      text: 'Добро пожаловать в образовательный чат! Я ваш AI-ассистент. Как я могу помочь вам сегодня?',
      isUser: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ], []);

  // Fetch messages from API or use default welcome message
  const fetchMessages = useCallback(async () => {
    if (!currentChatId) {
      logger.info('No chat ID available, showing welcome message');
      setMessages(defaultWelcomeMessages);
      return;
    }
    
    logger.info('Fetching chat messages', { chatId: currentChatId });
    setIsLoading(true);
    
    // 1. Получаем админский токен
    let adminToken;
    try {
      console.log('API_BASE_URL', API_BASE_URL); 
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
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/gigachat/chat/${currentChatId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + adminToken
        }
      });
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
  }, [currentChatId, defaultWelcomeMessages]);

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
          'Authorization': 'Basic ' + btoa('admin:admin123')
        }
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
  const createNewChat = async (adminToken: string) => {
    try {
      logger.info('Creating new chat');
      const response = await fetch(`${API_BASE_URL}/api/gigachat/new`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + adminToken
        },
        // No payload needed as per requirements
      });

      if (!response.ok) {
        throw new Error(`Failed to create new chat: ${response.status}`);
      }

      const data = await response.json();
      logger.debug('New chat created', data);
      
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
      // 1. Get admin token
      const adminToken = await getAdminToken();
      if (!adminToken) {
        throw new Error('Не удалось получить токен администратора');
      }

      // 2. Create a new chat if this is a new chat session
      let chatIdToUse = currentChatId;
      if (isNewChat) {
        try {
          const newChatId = await createNewChat(adminToken);
          chatIdToUse = newChatId;
          setCurrentChatId(newChatId);
          setIsNewChat(false); // No longer a new chat after creation
          logger.info('New chat created and set as current', { newChatId });
        } catch (error) {
          logger.error('Failed in chat creation', error);
          throw error;
        }
      }

      setMessages(prev => [...prev, newMessage]);

      // 3. Send the message to the chat (existing or newly created)
      logger.debug('Sending request to API', { message: newMessage.text, chatId: chatIdToUse });
      const response = await fetch(`${API_BASE_URL}/api/gigachat/chat/${chatIdToUse}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + adminToken
        },
        body: JSON.stringify({
          message: newMessage.text,
        }),
      });

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
  }, [inputText, currentChatId, isNewChat]);

  const handleTextChange = useCallback((text: string) => {
    setInputText(text);
  }, []);

  const keyExtractor = useCallback((item: Message) => item.id, []);

  const renderMessage = useCallback(({ item }: { item: Message }) => (
    <View
      style={[
        styles.messageContainer,
        item.isUser ? styles.userMessageContainer : styles.botMessageContainer,
      ]}
    >
      {!item.isUser && (
        <View style={styles.avatarContainer}>
          <Image 
          source={require('../../images/qwen-ai.png')} 
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
  ), []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <ChevronLeft size={24} color={COLORS.text} />
        </TouchableOpacity>
        
        <View style={styles.headerTitleContainer}>
          <View style={styles.assistantAvatarContainer}>
            <Image 
          source={require('../../images/qwen-ai.png')} 
          style={styles.assistantAvatar} 
              resizeMode="contain"
            />
            <View style={styles.statusIndicator} />
          </View>
          <View>
            <Text style={styles.headerTitle}>AI-ассистент</Text>
            <Text style={styles.headerSubtitle}>
              {currentChatId ? 'Онлайн' : 'Новый чат'}
            </Text>
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
            placeholder={isNewChat ? "Начните новый чат..." : "Введите сообщение..."}
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
}); 