import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  SafeAreaView
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useInitialDiagnostics } from '../../hooks/useInitialDiagnostics';

// Компонент для отображения одного сообщения
const MessageItem = React.memo(({ message, isUser }) => {
  return (
    <View style={[styles.messageBubble, isUser ? styles.userMessage : styles.assistantMessage]}>
      <Text style={styles.messageText}>{message.content}</Text>
      {message.timestamp && (
        <Text style={styles.timestampText}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      )}
    </View>
  );
});

// Компонент чата с диагностическим ассистентом
const ChatScreen = ({ chatId }) => {
  const { messages, isLoading, error, sendMessage } = useInitialDiagnostics(chatId);
  const [inputMessage, setInputMessage] = useState('');
  const flatListRef = useRef(null);
  const navigation = useNavigation();
  
  // Прокрутка к последнему сообщению при изменении списка сообщений
  useEffect(() => {
    if (messages.length > 0 && flatListRef.current) {
      // Добавляем небольшую задержку для корректной прокрутки
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);
  
  // Обработчик отправки сообщения
  const handleSendMessage = useCallback(async () => {
    if (inputMessage.trim() === '') return;
    
    const messageToSend = inputMessage.trim();
    setInputMessage('');
    
    try {
      await sendMessage(messageToSend);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }, [inputMessage, sendMessage]);
  
  // Рендер отдельного сообщения - используем ключи и уникальные идентификаторы
  const renderItem = useCallback(({ item, index }) => {
    const isUser = item.role === 'user';
    // Используем index как часть key, чтобы избежать конфликтов
    return (
      <MessageItem 
        key={`message-${index}-${item.timestamp}`} 
        message={item} 
        isUser={isUser} 
      />
    );
  }, []);
  
  // Используем extraction key для FlatList для улучшения производительности
  const keyExtractor = useCallback((item, index) => `msg-${index}-${item.timestamp || Date.now()}`, []);
  
  // Разделитель между сообщениями
  const ItemSeparatorComponent = useCallback(() => <View style={styles.messageSeparator} />, []);
  
  // ListEmptyComponent когда нет сообщений
  const ListEmptyComponent = useCallback(() => (
    <View style={styles.emptyListContainer}>
      <Text style={styles.emptyListText}>
        Начните разговор с ассистентом
      </Text>
    </View>
  ), []);
  
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Заголовок */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Диагностический чат</Text>
        </View>
        
        {/* Индикатор ошибки */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
        
        {/* Список сообщений */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          ItemSeparatorComponent={ItemSeparatorComponent}
          ListEmptyComponent={ListEmptyComponent}
          contentContainerStyle={styles.messagesList}
          // Решение проблемы с автопрокруткой
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
          // Избегаем проблем с рендерингом длинных списков
          removeClippedSubviews={Platform.OS === 'android'}
          maxToRenderPerBatch={10}
          windowSize={10}
        />
        
        {/* Индикатор загрузки */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#0066CC" />
            <Text style={styles.loadingText}>Ассистент печатает...</Text>
          </View>
        )}
        
        {/* Поле ввода сообщения */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Напишите сообщение..."
            value={inputMessage}
            onChangeText={setInputMessage}
            multiline
            maxHeight={100}
            returnKeyType="send"
            onSubmitEditing={handleSendMessage}
            blurOnSubmit={false}
            editable={!isLoading}
          />
          <TouchableOpacity 
            style={[styles.sendButton, isLoading || inputMessage.trim() === '' ? styles.sendButtonDisabled : {}]}
            onPress={handleSendMessage}
            disabled={isLoading || inputMessage.trim() === ''}
          >
            <Text style={styles.sendButtonText}>Отправить</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// Добавляем значения по умолчанию для props
ChatScreen.defaultProps = {
  chatId: null
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    height: 60,
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  messagesList: {
    flexGrow: 1,
    padding: 10,
    paddingBottom: 20,
  },
  messageSeparator: {
    height: 8,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyListText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginVertical: 4,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#DCF8C6',
    borderBottomRightRadius: 4,
  },
  assistantMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    color: '#303030',
  },
  timestampText: {
    fontSize: 11,
    color: '#919191',
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
    fontSize: 16,
    backgroundColor: '#F8F8F8',
  },
  sendButton: {
    marginLeft: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#0066CC',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#B0C4DE',
  },
  sendButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  errorContainer: {
    padding: 10,
    backgroundColor: '#FFEBEE',
    borderRadius: 4,
    margin: 10,
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 14,
  },
});

export default ChatScreen; 