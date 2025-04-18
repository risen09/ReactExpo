import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  Text,
  ActivityIndicator,
  ScrollView,
  Keyboard,
  Dimensions,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import { useNavigation, useRoute } from '@react-navigation/native';
import COLORS from '@/app/config/colors';
import ChatHeader from '@/app/components/chat/ChatHeader';
import MessageBubble from '@/app/components/chat/MessageBubble';
import LoadingScreen from '@/app/components/LoadingScreen';
import ErrorScreen from '@/app/components/ErrorScreen';
import { useInitialDiagnostics } from '@/app/hooks/useInitialDiagnostics';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DiagnosticChatScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const scrollViewRef = useRef(null);
  const isMounted = useRef(true);
  const { chatId } = route.params || {};
  const [messageInput, setMessageInput] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [screenHeight, setScreenHeight] = useState(Dimensions.get('window').height);

  // Используем хук для управления диагностическим чатом
  const {
    messages,
    isLoading,
    error,
    sendMessage,
    diagnosticResult,
    resetState,
  } = useInitialDiagnostics(chatId);

  // Эффект для обновления размеров экрана при изменении ориентации
  useEffect(() => {
    const handleDimensionsChange = ({ window }) => {
      if (isMounted.current) {
        setScreenHeight(window.height);
      }
    };

    const dimensionsListener = Dimensions.addEventListener('change', handleDimensionsChange);

    return () => {
      dimensionsListener.remove();
    };
  }, []);

  // Эффект для отслеживания клавиатуры
  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        if (isMounted.current) {
          setKeyboardHeight(e.endCoordinates.height);
          setIsKeyboardVisible(true);
        }
      }
    );

    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        if (isMounted.current) {
          setKeyboardHeight(0);
          setIsKeyboardVisible(false);
        }
      }
    );

    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, []);

  // Эффект для очистки при размонтировании компонента
  useEffect(() => {
    return () => {
      isMounted.current = false;
      console.log('DiagnosticChatScreen размонтирован');
    };
  }, []);

  // Эффект для прокрутки вниз при получении новых сообщений
  useEffect(() => {
    if (messages.length > 0 && scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  // Эффект для сброса состояния при изменении chatId
  useEffect(() => {
    console.log('DiagnosticChatScreen: chatId изменен или инициализирован:', chatId);
    
    const checkResetNeeded = async () => {
      try {
        const shouldReset = await AsyncStorage.getItem('current_chat_cleared');
        if (shouldReset === 'true') {
          console.log('DiagnosticChatScreen: Сбрасываем состояние');
          resetState();
          await AsyncStorage.setItem('current_chat_cleared', 'false');
        }
      } catch (err) {
        console.error('Ошибка при проверке необходимости сброса:', err);
      }
    };
    
    checkResetNeeded();
  }, [chatId, resetState]);

  // Обработчик отправки сообщения
  const handleSendMessage = useCallback(() => {
    if (!messageInput.trim()) return;
    
    Keyboard.dismiss();
    const tempInput = messageInput;
    setMessageInput('');
    
    if (scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
    
    sendMessage(tempInput);
  }, [messageInput, sendMessage]);

  // Если загрузка, показываем индикатор
  if (isLoading && messages.length === 0) {
    return <LoadingScreen text="Загрузка диагностического чата..." />;
  }

  // Если ошибка и нет сообщений, показываем экран ошибки
  if (error && messages.length === 0) {
    return (
      <ErrorScreen
        message={`Не удалось загрузить диагностический чат: ${error}`}
        onRetry={() => resetState()}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ChatHeader
          title="Диагностический чат"
          showBackButton
          onBackPress={() => navigation.goBack()}
        />

        {/* Область сообщений */}
        <ScrollView
          ref={scrollViewRef}
          style={[
            styles.messagesContainer,
            {
              maxHeight: isKeyboardVisible
                ? screenHeight - keyboardHeight - 180
                : screenHeight - 180,
            },
          ]}
          contentContainerStyle={styles.messagesContent}
          keyboardShouldPersistTaps="handled"
        >
          {messages.map((message, index) => (
            <MessageBubble
              key={`msg-${index}-${message.timestamp || Date.now()}`}
              message={message}
              isUser={message.role === 'user'}
              diagnosticResult={
                message.role === 'assistant' && 
                index === messages.length - 1 && 
                diagnosticResult ? 
                diagnosticResult : null
              }
            />
          ))}
          
          {/* Индикатор загрузки ответа */}
          {isLoading && messages.length > 0 && (
            <View style={styles.typingIndicator}>
              <ActivityIndicator size="small" color={COLORS.primary} />
              <Text style={styles.typingText}>Анализирую ваш ответ...</Text>
            </View>
          )}
        </ScrollView>

        {/* Область ввода */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Введите ваше сообщение..."
            placeholderTextColor={COLORS.textSecondary}
            value={messageInput}
            onChangeText={setMessageInput}
            multiline
            maxHeight={100}
            onSubmitEditing={handleSendMessage}
          />
          <Text
            style={[
              styles.sendButton,
              !messageInput.trim() && styles.sendButtonDisabled,
            ]}
            onPress={handleSendMessage}
            disabled={!messageInput.trim()}
          >
            Отправить
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: COLORS.background,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    color: COLORS.text,
  },
  sendButton: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 16,
    padding: 10,
  },
  sendButtonDisabled: {
    color: COLORS.textSecondary,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: COLORS.background,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginVertical: 5,
  },
  typingText: {
    marginLeft: 10,
    color: COLORS.textSecondary,
    fontSize: 14,
  },
});

export default DiagnosticChatScreen; 