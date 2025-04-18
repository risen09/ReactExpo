import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { ChatMessage } from '../../types/aiAssistants';

// Цветовая палитра для компонента
const COLORS = {
  primary: '#5B67CA',
  secondary: '#43C0B4',
  background: '#F2F5FF',
  card: '#FFFFFF',
  text: '#25335F',
  textSecondary: '#7F8BB7',
  border: '#EAEDF5',
};

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => Promise<void>;
  isLoading?: boolean;
  placeholder?: string;
  disabled?: boolean;
  headerComponent?: React.ReactNode;
  inputComponent?: React.ReactNode;
}

export const ChatInterface = ({
  messages,
  onSendMessage,
  isLoading = false,
  placeholder = 'Введите сообщение...',
  disabled = false,
  headerComponent,
  inputComponent,
}: ChatInterfaceProps) => {
  const [inputMessage, setInputMessage] = useState('');
  const flatListRef = useRef<FlatList>(null);

  const handleSend = async () => {
    if (!inputMessage.trim() || isLoading || disabled) return;
    
    const messageToSend = inputMessage;
    setInputMessage('');
    
    try {
      await onSendMessage(messageToSend);
      // Прокрутка к последнему сообщению
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 200);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    // Не показываем системные сообщения
    if (item.role === 'system') return null;

    const isUser = item.role === 'user';

    return (
      <View
        style={[
          styles.messageContainer,
          isUser ? styles.userMessageContainer : styles.assistantMessageContainer,
        ]}
      >
        <Text style={[
          styles.messageText,
          isUser ? styles.userMessageText : styles.assistantMessageText,
        ]}>
          {item.content}
        </Text>
        {item.timestamp && (
          <Text style={styles.timestampText}>
            {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {headerComponent && headerComponent}
      
      <FlatList
        ref={flatListRef}
        data={messages.filter(m => m.role !== 'system')}
        renderItem={renderMessage}
        keyExtractor={(_, index) => `message-${index}`}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
      />
      
      {inputComponent || (
        <View style={styles.inputContainer}>
          <TextInput
            style={{
              ...styles.input, 
              maxHeight: 100
            }}
            value={inputMessage}
            onChangeText={setInputMessage}
            placeholder={placeholder}
            placeholderTextColor={COLORS.textSecondary}
            multiline
            editable={!disabled}
          />
          
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!inputMessage.trim() || isLoading || disabled) && styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={!inputMessage.trim() || isLoading || disabled}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.sendButtonText}>Отправить</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 16,
  },
  messageContainer: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  userMessageContainer: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.primary,
  },
  assistantMessageContainer: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  messageText: {
    fontSize: 16,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  assistantMessageText: {
    color: COLORS.text,
  },
  timestampText: {
    fontSize: 10,
    color: '#FFFFFFAA',
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  input: {
    flex: 1,
    backgroundColor: '#F7F9FC',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: COLORS.text,
  },
  sendButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: 12,
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 90,
  },
  sendButtonDisabled: {
    backgroundColor: '#B8C1E0',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
}); 