import React, { useState } from 'react';
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
} from 'react-native';
import { SendHorizontal, Paperclip, Mic, ChevronLeft, MoreVertical } from 'lucide-react-native';

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

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
}

export default function ChatScreen() {
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Добро пожаловать в образовательный чат! Я ваш AI-ассистент. Как я могу помочь вам сегодня?',
      isUser: false,
      timestamp: '10:00',
    },
    {
      id: '2',
      text: 'Привет! Мне нужна помощь с математикой.',
      isUser: true,
      timestamp: '10:01',
    },
    {
      id: '3',
      text: 'Конечно! Какой раздел математики вас интересует?',
      isUser: false,
      timestamp: '10:02',
    },
    {
      id: '4',
      text: 'Я изучаю алгебру, конкретно решение уравнений.',
      isUser: true,
      timestamp: '10:03',
    },
    {
      id: '5',
      text: 'Отлично! Давайте разберемся с решением уравнений. У вас есть конкретный пример, который вызывает затруднения?',
      isUser: false,
      timestamp: '10:04',
    },
  ]);

  const sendMessage = () => {
    if (inputText.trim() === '') return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages([...messages, newMessage]);
    setInputText('');

    // Имитация ответа бота
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Я получил ваш запрос и скоро отвечу!',
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prevMessages => [...prevMessages, botResponse]);
    }, 1000);
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.messageContainer,
        item.isUser ? styles.userMessageContainer : styles.botMessageContainer,
      ]}
    >
      {!item.isUser && (
        <View style={styles.avatarContainer}>
          <Image 
            source={require('../../assets/images/icon.png')} 
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
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <ChevronLeft size={24} color={COLORS.text} />
        </TouchableOpacity>
        
        <View style={styles.headerTitleContainer}>
          <View style={styles.assistantAvatarContainer}>
            <Image 
              source={require('../../assets/images/icon.png')} 
              style={styles.assistantAvatar} 
              resizeMode="contain"
            />
            <View style={styles.statusIndicator} />
          </View>
          <View>
            <Text style={styles.headerTitle}>AI-ассистент</Text>
            <Text style={styles.headerSubtitle}>Онлайн</Text>
          </View>
        </View>
        
        <TouchableOpacity style={styles.menuButton}>
          <MoreVertical size={20} color={COLORS.text} />
        </TouchableOpacity>
      </View>
      
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          inverted={false}
        />

        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.attachButton}>
            <Paperclip size={22} color={COLORS.primary} />
          </TouchableOpacity>
          
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Введите сообщение..."
            multiline
            placeholderTextColor={COLORS.textSecondary}
          />
          
          {inputText.trim() === '' ? (
            <TouchableOpacity style={styles.micButton}>
              <Mic size={22} color={COLORS.primary} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
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
}); 