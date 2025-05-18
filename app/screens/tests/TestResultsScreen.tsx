import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { TestResultsScreenProps } from '@/types/test';

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

export const TestResultsScreen: React.FC<TestResultsScreenProps> = ({ testId, results }) => {
  const navigation = useNavigation();
  const route = useRoute();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreTitle}>Ваш результат</Text>
          <Text style={styles.scoreValue}>{results.score}%</Text>
          <Text style={styles.levelText}>Уровень: {results.assessedLevel}</Text>
        </View>

        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>
            Правильных ответов: {results.correctAnswers} из {results.totalQuestions}
          </Text>
        </View>

        <View style={styles.answersContainer}>
          <Text style={styles.answersTitle}>Детали ответов</Text>
          {results.results.map((result, index) => (
            <View key={index} style={styles.answerItem}>
              <View style={styles.answerHeader}>
                <Ionicons
                  name={result.isCorrect ? 'checkmark-circle' : 'close-circle'}
                  size={24}
                  color={result.isCorrect ? COLORS.success : COLORS.danger}
                />
                <Text style={styles.questionNumber}>Вопрос {index + 1}</Text>
              </View>
              <Text style={styles.explanation}>{result.explanation}</Text>
              <Text style={styles.answerDetails}>
                Ваш ответ: {typeof result.selectedOption.selectedOption === 'number'
                  ? `Вариант ${result.selectedOption.selectedOption + 1}`
                  : 'Нет ответа'}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.continueButton}
          // onPress={() => navigation.navigate('LearningTrack', { id: results.learningTrackId })}
          onPress={() => {console.log("Продолжить обучение")}}
        >
          <Text style={styles.continueButtonText}>Продолжить обучение</Text>
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
  content: {
    flex: 1,
  },
  scoreContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.card,
    marginBottom: 20,
  },
  scoreTitle: {
    fontSize: 18,
    color: COLORS.textSecondary,
    marginBottom: 10,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 10,
  },
  levelText: {
    fontSize: 20,
    color: COLORS.text,
    fontWeight: '600',
  },
  statsContainer: {
    padding: 20,
    backgroundColor: COLORS.card,
    marginBottom: 20,
  },
  statsText: {
    fontSize: 16,
    color: COLORS.text,
    textAlign: 'center',
  },
  answersContainer: {
    padding: 20,
  },
  answersTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 15,
  },
  answerItem: {
    backgroundColor: COLORS.card,
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  answerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  questionNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: 10,
  },
  explanation: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 10,
    fontStyle: 'italic',
  },
  answerDetails: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 5,
  },
  footer: {
    padding: 20,
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  continueButton: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  continueButtonText: {
    color: COLORS.card,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TestResultsScreen; 