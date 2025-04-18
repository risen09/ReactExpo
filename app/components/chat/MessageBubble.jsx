import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import COLORS from '@/app/config/colors';
import { useNavigation } from '@react-navigation/native';

const MessageBubble = ({ message, isUser, diagnosticResult }) => {
  const navigation = useNavigation();

  // Функция для перехода к тесту
  const handleStartTest = () => {
    if (diagnosticResult && diagnosticResult.subjectArea && diagnosticResult.topic) {
      console.log('MessageBubble: Переход к тесту с параметрами:', {
        subject: diagnosticResult.subjectArea,
        topic: diagnosticResult.topic,
        difficulty: diagnosticResult.difficulty || 'basic',
        needsInitialTest: true
      });
      
      // Включаем небольшую задержку перед навигацией для стабильности
      setTimeout(() => {
        // Используем экспо-роутер для навигации на новый маршрут
        navigation.navigate('test-screen', {
          subject: diagnosticResult.subjectArea,
          topic: diagnosticResult.topic,
          difficulty: diagnosticResult.difficulty || 'basic',
          needsInitialTest: true
        });
      }, 300);
    } else {
      console.error('MessageBubble: Недостаточно данных для перехода к тесту:', diagnosticResult);
    }
  };

  // Функция для форматирования списка тем
  const renderSuggestedTopics = (topics) => {
    if (!topics || !Array.isArray(topics) || topics.length === 0) return null;
    
    return (
      <View style={styles.suggestedTopicsContainer}>
        <Text style={styles.diagnosticSectionTitle}>Смежные темы для изучения:</Text>
        {topics.map((topic, index) => (
          <Text key={`topic-${index}`} style={styles.suggestedTopic}>
            • {topic}
          </Text>
        ))}
      </View>
    );
  };

  return (
    <View 
      style={[
        styles.messageBubble, 
        isUser ? styles.userMessage : styles.assistantMessage
      ]}
    >
      <Text style={styles.messageText}>{message.content}</Text>
      
      {/* Если есть результат диагностики и это сообщение ассистента */}
      {!isUser && diagnosticResult && (
        <View style={styles.diagnosticResult}>
          <Text style={styles.diagnosticTitle}>Результат диагностики:</Text>
          
          <View style={styles.diagnosticSection}>
            <Text style={styles.diagnosticSectionTitle}>Предмет:</Text>
            <Text style={styles.diagnosticText}>{diagnosticResult.subjectArea || 'Не определен'}</Text>
          </View>
          
          <View style={styles.diagnosticSection}>
            <Text style={styles.diagnosticSectionTitle}>Тема:</Text>
            <Text style={styles.diagnosticText}>{diagnosticResult.topic || 'Не определена'}</Text>
          </View>
          
          <View style={styles.diagnosticSection}>
            <Text style={styles.diagnosticSectionTitle}>Уровень сложности:</Text>
            <Text style={styles.diagnosticText}>
              {diagnosticResult.difficulty === 'basic' ? 'Базовый' : 
               diagnosticResult.difficulty === 'intermediate' ? 'Средний' : 
               diagnosticResult.difficulty === 'advanced' ? 'Продвинутый' : 
               'Не определен'}
            </Text>
          </View>
          
          {renderSuggestedTopics(diagnosticResult.suggestedTopics)}
          
          {/* Показываем кнопку если нужно пройти тест */}
          {diagnosticResult.needsInitialTest && (
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleStartTest}
            >
              <Text style={styles.actionButtonText}>Пройти тест по теме</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
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
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    color: COLORS.text,
  },
  diagnosticResult: {
    marginTop: 12,
    padding: 12,
    backgroundColor: 'rgba(0, 102, 204, 0.1)',
    borderRadius: 8,
  },
  diagnosticTitle: {
    fontWeight: 'bold',
    color: COLORS.primary,
    fontSize: 16,
    marginBottom: 10,
  },
  diagnosticSection: {
    marginBottom: 8,
  },
  diagnosticSectionTitle: {
    fontWeight: 'bold',
    color: COLORS.text,
    fontSize: 14,
    marginBottom: 2,
  },
  diagnosticText: {
    color: COLORS.text,
    fontSize: 14,
  },
  suggestedTopicsContainer: {
    marginTop: 4,
    marginBottom: 8,
  },
  suggestedTopic: {
    color: COLORS.text,
    fontSize: 14,
    marginLeft: 8,
    marginVertical: 2,
  },
  actionButton: {
    backgroundColor: COLORS.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  actionButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 14,
  }
});

export default MessageBubble; 