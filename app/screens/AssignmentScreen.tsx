import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Modal } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import client from '@/api/client';
import { Assignment } from '@/types/assignment';
import LoadingModal from '@/components/LoadingModal';

const AssignmentScreen: React.FC = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [feedback, setFeedback] = useState<{ [key: string]: string }>({});
  const [verdicts, setVerdicts] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<string>("Загружаем задание...");

  useEffect(() => {
    console.log('Blyat! useEffect: Initial state: isLoading=', isLoading, 'assignment=', assignment, 'error=', error);
    const fetchAssignment = async () => {
      console.log('Blyat! fetchAssignment: id=', id);
      if (!id) {
        setError('ID задания не найден');
        setIsLoading(false);
        console.log('fetchAssignment: No ID, setting error and isLoading=false');
        return;
      }

      try {
        const response = await client.assignments.getById(id);
        setAssignment(response.data);
      } catch (err: any) {
        console.error('Error fetching assignment:', err);
        setError(err.response?.data?.message || 'Ошибка при загрузке задания');
      } finally {
        setIsLoading(false);
        console.log('fetchAssignment: Finally, setting isLoading=false');
      }
    };

    fetchAssignment();
    console.log('useEffect: Calling fetchAssignment');
  }, [id]);

  const handleSubmit = async (taskId: number) => {
    console.log('Submitting answer for task:', taskId);
    setLoadingMessage("Отправляем ответ...");
    setIsLoading(true);

    try {
      const response = await client.assignments.submit(id, taskId, answers[taskId]);
      console.log('Submission response status:', response.status);
      setFeedback(prev => ({
        ...prev,
        [taskId]: response.data.feedback
      }));
      setVerdicts(prev => ({
        ...prev,
        [taskId]: response.data.verdict
      }));
    } catch (err: any) {
      console.error('Error submitting answer:', err);
      setError(err.response?.data?.message || 'Ошибка при отправке ответа');
    } finally {
      setIsLoading(false);
      setLoadingMessage("Загружаем задание...");
    }
  };

  const handleAnswerChange = (taskId: number, text: string) => {
    setAnswers(prev => ({
      ...prev,
      [taskId]: text
    }));
  };

  return (
    <View style={styles.screenContainer}>
      <Stack.Screen
        options={{
          title: assignment?.title || 'Задание',
        }}
      />
      <LoadingModal visible={isLoading} message={loadingMessage} />

      {error && !isLoading && (
        <View style={styles.messageContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {!assignment && !isLoading && !error && (
        <View style={styles.messageContainer}>
          <Text style={styles.errorText}>Задание не найдено</Text>
        </View>
      )}

      {assignment && (
        <ScrollView style={styles.contentContainer}>
          {assignment.tasks.map((task, index) => (
            <View key={index} style={styles.taskContainer}>
              <View style={styles.taskHeader}>
                <Text style={styles.taskNumber}>Задача {index + 1}</Text>
                {verdicts[index] && (
                  <Text style={[
                    styles.verdictText,
                    verdicts[index] === 'correct' && styles.correctVerdict,
                    verdicts[index] === 'incorrect' && styles.incorrectVerdict,
                    verdicts[index] === 'partially_correct' && styles.partialVerdict,
                  ]}>
                    {verdicts[index] === 'correct' && '✓ Правильно'}
                    {verdicts[index] === 'incorrect' && '✗ Неправильно'}
                    {verdicts[index] === 'partially_correct' && '~ Частично правильно'}
                  </Text>
                )}
              </View>
              <Text style={styles.taskText}>{task.task}</Text>
              <TextInput
                style={styles.input}
                multiline
                placeholder="Введите ваш ответ..."
                value={answers[index] || ''}
                onChangeText={(text) => handleAnswerChange(index, text)}
              />
              {feedback[index] && (
                <View style={styles.feedbackContainer}>
                  <Text style={styles.feedbackText}>{feedback[index]}</Text>
                </View>
              )}
              <TouchableOpacity 
                style={styles.submitButton}
                onPress={() => handleSubmit(index)}
                disabled={isLoading}
              >
                <Text style={styles.submitButtonText}>Отправить</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  contentContainer: {
    flex: 1,
  },
  messageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskContainer: {
    marginBottom: 24,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskNumber: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#495057',
  },
  taskText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#212529',
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 4,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  submitButton: {
    backgroundColor: '#28a745',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 6,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#dc3545',
    textAlign: 'center',
  },
  feedbackContainer: {
    backgroundColor: '#e9ecef',
    padding: 12,
    borderRadius: 4,
    marginBottom: 12,
  },
  feedbackText: {
    fontSize: 14,
    color: '#495057',
    lineHeight: 20,
  },
  verdictText: {
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  correctVerdict: {
    backgroundColor: '#d4edda',
    color: '#155724',
  },
  incorrectVerdict: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
  },
  partialVerdict: {
    backgroundColor: '#fff3cd',
    color: '#856404',
  },
});

export default AssignmentScreen; 