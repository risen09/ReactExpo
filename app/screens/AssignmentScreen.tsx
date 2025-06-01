import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import client from '@/api/client';
import { Assignment } from '@/types/lesson';

const AssignmentScreen: React.FC = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssignment = async () => {
      if (!id) {
        setError('ID задания не найден');
        setIsLoading(false);
        return;
      }

      try {
        const response = await client.assignments.getById(id);
        setAssignment(response.data);
      } catch (err: any) {
        console.error('Blyat! Error fetching assignment:', err);
        setError(err.response?.data?.message || 'Ошибка при загрузке задания');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssignment();
  }, [id]);

  const handleSubmit = (taskId: number) => {
    // TODO: Implement submission logic
    console.log('Submitting answer for task:', taskId, answers[taskId]);
  };

  const handleAnswerChange = (taskId: number, text: string) => {
    setAnswers(prev => ({
      ...prev,
      [taskId]: text
    }));
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            title: 'Задание',
          }}
        />
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Загружаем задание...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            title: 'Задание',
          }}
        />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!assignment) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            title: 'Задание',
          }}
        />
        <Text style={styles.errorText}>Задание не найдено</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen
        options={{
          title: assignment.title,
        }}
      />
      {assignment.tasks.map((task, index) => (
        <View key={index} style={styles.taskContainer}>
          <Text style={styles.taskNumber}>Задача {index + 1}</Text>
          <Text style={styles.taskText}>{task.task}</Text>
          <TextInput
            style={styles.input}
            multiline
            placeholder="Введите ваш ответ..."
            value={answers[index] || ''}
            onChangeText={(text) => handleAnswerChange(index, text)}
          />
          <TouchableOpacity 
            style={styles.submitButton}
            onPress={() => handleSubmit(index)}
          >
            <Text style={styles.submitButtonText}>Отправить</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  taskContainer: {
    marginBottom: 24,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
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
});

export default AssignmentScreen; 