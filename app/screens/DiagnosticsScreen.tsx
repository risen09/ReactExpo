import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { ChatInterface } from '../components/ai/ChatInterface';
import useInitialDiagnostics from '../hooks/useInitialDiagnostics';

// Цветовая палитра
const COLORS = {
  primary: '#5B67CA',
  secondary: '#43C0B4',
  background: '#F2F5FF',
  card: '#FFFFFF',
  text: '#25335F',
  textSecondary: '#7F8BB7',
  border: '#EAEDF5',
  success: '#4CAF50',
  danger: '#F44336',
  warning: '#FF9800',
};

// Примеры запросов для помощи пользователю
const EXAMPLE_QUERIES = [
  'Математика, 7 класс, дискриминант',
  'Физика, 9 класс, законы Ньютона',
  'Английский язык, Present Perfect',
  'Биология, системы организма человека',
  'Информатика, алгоритмы сортировки'
];

export const DiagnosticsScreen = () => {
  const {
    messages,
    isLoading,
    error,
    diagnosticResult,
    sendMessage,
    startInitialTest
  } = useInitialDiagnostics();

  const [showExamples, setShowExamples] = useState(true);

  // Сбрасываем состояние при фокусе на экране
  useFocusEffect(
    useCallback(() => {
      setShowExamples(true);
    }, [])
  );

  const handleSendMessage = async (message: string) => {
    // Скрываем примеры после первого сообщения
    setShowExamples(false);
    await sendMessage(message);
  };

  // Обработчик для примеров запросов
  const handleExamplePress = async (example: string) => {
    setShowExamples(false);
    await sendMessage(example);
  };

  const renderExampleQueries = () => {
    if (!showExamples) return null;

    return (
      <View style={styles.examplesContainer}>
        <Text style={styles.examplesTitle}>Примеры запросов:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.examplesScroll}>
          {EXAMPLE_QUERIES.map((query, index) => (
            <TouchableOpacity
              key={index}
              style={styles.exampleButton}
              onPress={() => handleExamplePress(query)}
            >
              <Text style={styles.exampleText}>{query}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderHeader = () => {
    return (
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Образовательный помощник</Text>
        {diagnosticResult && (
          <TouchableOpacity 
            style={styles.startTestButton}
            onPress={() => {
              if (diagnosticResult) {
                startInitialTest(diagnosticResult.subjectArea, diagnosticResult.topic);
              }
            }}
          >
            <Ionicons name="school-outline" size={18} color="#FFFFFF" />
            <Text style={styles.startTestText}>Начать тест</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // Если есть ошибка, показываем сообщение
  if (error && messages.length <= 1) {
    return (
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={COLORS.danger} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => window.location.reload()}
          >
            <Text style={styles.retryButtonText}>Перезагрузить</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <ChatInterface
        messages={messages}
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        placeholder="Опишите предмет и тему, с которыми нужна помощь..."
        headerComponent={renderHeader()}
        inputComponent={
          <>
            {renderExampleQueries()}
            {null /* Используем стандартный ввод из ChatInterface */}
          </>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  startTestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  startTestText: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 8,
  },
  examplesContainer: {
    padding: 16,
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  examplesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  examplesScroll: {
    flexDirection: 'row',
  },
  exampleButton: {
    backgroundColor: COLORS.background,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 8,
  },
  exampleText: {
    color: COLORS.primary,
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.danger,
    marginTop: 12,
    marginBottom: 24,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DiagnosticsScreen; 