import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { MaterialIcons } from '@expo/vector-icons';
import { selectCurrentLesson } from '../../store/features/lessonSlice';
import type { AppDispatch } from '../../store/store';
import type { Practice } from '../types/lesson';

interface PracticeAnswer {
  practiceId: string;
  answer: string;
  isCorrect: boolean;
  explanation?: string;
}

const PracticeScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const currentLesson = useSelector(selectCurrentLesson);
  const [currentPracticeIndex, setCurrentPracticeIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [answers, setAnswers] = useState<PracticeAnswer[]>([]);
  const [loading, setLoading] = useState(false);

  const currentPractice = currentLesson?.practices[currentPracticeIndex];

  const checkAnswer = async () => {
    if (!currentPractice || !answer.trim()) return;

    setLoading(true);
    try {
      // TODO: Implement API call to check answer with OpenAI
      const response = await fetch('YOUR_API_ENDPOINT/check-answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: currentPractice.question,
          correctAnswer: currentPractice.correctAnswer,
          userAnswer: answer,
        }),
      });

      const result = await response.json();
      const practiceAnswer: PracticeAnswer = {
        practiceId: currentPractice.id,
        answer: answer,
        isCorrect: result.isCorrect,
        explanation: result.explanation,
      };

      setAnswers([...answers, practiceAnswer]);

      if (result.isCorrect && currentPracticeIndex < currentLesson!.practices.length - 1) {
        setTimeout(() => {
          setCurrentPracticeIndex(currentPracticeIndex + 1);
          setAnswer('');
        }, 1500);
      }
    } catch (error) {
      console.error('Failed to check answer:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!currentLesson || !currentPractice) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>No practice available</Text>
      </View>
    );
  }

  const currentAnswer = answers.find(a => a.practiceId === currentPractice.id);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.progress}>
          Задание {currentPracticeIndex + 1} из {currentLesson.practices.length}
        </Text>
      </View>

      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>{currentPractice.question}</Text>
      </View>

      <View style={styles.answerContainer}>
        <TextInput
          style={styles.answerInput}
          placeholder="Введите ваш ответ..."
          value={answer}
          onChangeText={setAnswer}
          multiline
          editable={!currentAnswer}
        />

        {!currentAnswer && (
          <TouchableOpacity
            style={[styles.submitButton, !answer.trim() && styles.disabledButton]}
            onPress={checkAnswer}
            disabled={!answer.trim() || loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.submitButtonText}>Проверить</Text>
                <MaterialIcons name="check" size={24} color="white" />
              </>
            )}
          </TouchableOpacity>
        )}
      </View>

      {currentAnswer && (
        <View style={styles.resultContainer}>
          <View
            style={[
              styles.resultBanner,
              currentAnswer.isCorrect ? styles.correctBanner : styles.incorrectBanner,
            ]}
          >
            <MaterialIcons
              name={currentAnswer.isCorrect ? 'check-circle' : 'error'}
              size={24}
              color={currentAnswer.isCorrect ? '#4caf50' : '#f44336'}
            />
            <Text
              style={[
                styles.resultText,
                currentAnswer.isCorrect ? styles.correctText : styles.incorrectText,
              ]}
            >
              {currentAnswer.isCorrect ? 'Правильно!' : 'Неправильно'}
            </Text>
          </View>

          {currentAnswer.explanation && (
            <View style={styles.explanationContainer}>
              <Text style={styles.explanationTitle}>Объяснение:</Text>
              <Text style={styles.explanationText}>{currentAnswer.explanation}</Text>
            </View>
          )}

          {!currentAnswer.isCorrect && (
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => {
                setAnswers(answers.filter(a => a.practiceId !== currentPractice.id));
                setAnswer('');
              }}
            >
              <Text style={styles.retryButtonText}>Попробовать снова</Text>
              <MaterialIcons name="refresh" size={24} color="white" />
            </TouchableOpacity>
          )}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  progress: {
    fontSize: 18,
    color: '#6c757d',
  },
  questionContainer: {
    padding: 20,
  },
  questionText: {
    fontSize: 20,
    color: '#212529',
    lineHeight: 28,
  },
  answerContainer: {
    padding: 20,
  },
  answerInput: {
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#2196f3',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 10,
  },
  disabledButton: {
    backgroundColor: '#6c757d',
    opacity: 0.5,
  },
  resultContainer: {
    padding: 20,
  },
  resultBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  correctBanner: {
    backgroundColor: '#e8f5e9',
  },
  incorrectBanner: {
    backgroundColor: '#ffebee',
  },
  resultText: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
  },
  correctText: {
    color: '#4caf50',
  },
  incorrectText: {
    color: '#f44336',
  },
  explanationContainer: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  explanationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 10,
  },
  explanationText: {
    fontSize: 16,
    color: '#495057',
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: '#f44336',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 10,
  },
  errorText: {
    fontSize: 18,
    color: '#dc3545',
  },
});

export default PracticeScreen; 