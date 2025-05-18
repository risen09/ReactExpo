import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useLocalSearchParams, router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '@/api/client';
import { Question, TestInitialResponse } from '@/types/test';

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
};

export const TestScreen: React.FC<TestInitialResponse> = ({ testId }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const route = useRoute();
  const { results } = useLocalSearchParams();
  const parsedResults = results ? JSON.parse(decodeURIComponent(results as string)) : null;

  useEffect(() => {
    setSelectedAnswers({});
    setCurrentQuestionIndex(0);
  }, [testId]);

  useEffect(() => {
    const fetchTest = async () => {
      try {
        const response = await apiClient.tests.getById(testId);
        setQuestions(response.data.questions);
      } catch (error) {
        console.error('Error fetching test:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTest();
  }, [testId]);

  const handleAnswerSelect = (questionId: string, optionIndex: number) => {
    setSelectedAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmit = async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const answers = Object.entries(selectedAnswers).map(([questionId, selectedOption]) => ({
        questionId,
        selectedOption,
      }));
      const response = await apiClient.tests.submit(testId, answers);
      console.log(response.data);
      console.log(testId);
      router.push(
        `/(tabs)/test/results?testId=${testId}&results=${encodeURIComponent(JSON.stringify(response.data))}`
      );
    } catch (error) {
      console.error('Error submitting test:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Загрузка...</Text>
      </View>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          Вопрос {currentQuestionIndex + 1} из {questions.length}
        </Text>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }
            ]} 
          />
        </View>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.questionText}>{currentQuestion.questionText}</Text>
        <View style={styles.optionsContainer}>
          {currentQuestion.options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionButton,
                selectedAnswers[currentQuestionIndex] === index && styles.optionSelected
              ]}
              onPress={() => handleAnswerSelect(currentQuestionIndex.toString(), index)}
            >
              <Text style={[
                styles.optionText,
                selectedAnswers[currentQuestionIndex] === index && styles.optionTextSelected
              ]}>
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.navigationButtons}>
        {currentQuestionIndex > 0 && (
          <TouchableOpacity 
            style={styles.navButton}
            onPress={() => setCurrentQuestionIndex(prev => prev - 1)}
          >
            <Text style={styles.navButtonText}>Назад</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity 
          style={[styles.navButton, styles.nextButton]}
          onPress={() => {
            if (isLastQuestion) {
              handleSubmit();
            } else {
              setCurrentQuestionIndex(prev => prev + 1);
            }
          }}
        >
          <Text style={[styles.navButtonText, styles.nextButton && styles.nextButtonText]}>
            {isLastQuestion ? 'Завершить' : 'Далее'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  progressContainer: {
    padding: 20,
    backgroundColor: COLORS.card,
  },
  progressText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 10,
  },
  progressBar: {
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  questionText: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 20,
  },
  optionsContainer: {
    gap: 10,
  },
  optionButton: {
    padding: 15,
    backgroundColor: COLORS.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  optionSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  optionText: {
    fontSize: 16,
    color: COLORS.text,
  },
  optionTextSelected: {
    color: COLORS.card,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  navButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: COLORS.background,
  },
  nextButton: {
    backgroundColor: COLORS.primary,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
  nextButtonText: {
    color: '#FFFFFF',
  },
});

export default TestScreen; 