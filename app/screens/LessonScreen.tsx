import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter, useNavigation } from 'expo-router';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import {
  selectCurrentLesson,
  selectLessonLoading,
  selectLessonError,
  generateLesson,
} from '../../store/features/lessonSlice';
import type { AppDispatch } from '../../store/store';
import type { Subject, LearningStyle } from '../types/lesson';

const LessonScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const navigation = useNavigation();
  const currentLesson = useSelector(selectCurrentLesson);
  const loading = useSelector(selectLessonLoading);
  const error = useSelector(selectLessonError);
  const [currentStep, setCurrentStep] = useState(0);

  const handleGenerateLesson = async (subject: Subject, learningStyle: LearningStyle) => {
    try {
      await dispatch(generateLesson({ subject, learningStyle })).unwrap();
    } catch (err) {
      console.error('Failed to generate lesson:', err);
    }
  };

  const handleNextStep = () => {
    if (currentLesson && currentStep < currentLesson.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const openTrackAssistant = () => {
    if (currentLesson) {
      // Навигация к экрану ассистента трека
      // @ts-ignore - игнорируем ошибку типа для простоты
      navigation.navigate('TrackAssistantScreen', {
        trackId: currentLesson.trackId,
        lessonId: currentLesson.id,
        trackName: currentLesson.trackTitle || currentLesson.title
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Generating your personalized lesson...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => handleGenerateLesson('mathematics', 'visual')}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!currentLesson) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.noLessonText}>No lesson selected</Text>
        <TouchableOpacity
          style={styles.generateButton}
          onPress={() => handleGenerateLesson('mathematics', 'visual')}
        >
          <Text style={styles.generateButtonText}>Generate New Lesson</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{currentLesson.title}</Text>
        <Text style={styles.subtitle}>{currentLesson.subject}</Text>
        
        <TouchableOpacity 
          style={styles.assistantButton}
          onPress={openTrackAssistant}
        >
          <FontAwesome name="question-circle" size={20} color="#5B67CA" />
          <Text style={styles.assistantButtonText}>Спросить ассистента</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.stepContainer}>
          <Text style={styles.stepTitle}>
            Step {currentStep + 1} of {currentLesson.steps.length}
          </Text>
          <Text style={styles.stepContent}>
            {currentLesson.steps[currentStep].content}
          </Text>
        </View>
      </ScrollView>

      <View style={styles.navigation}>
        <TouchableOpacity
          style={[styles.navButton, currentStep === 0 && styles.disabledButton]}
          onPress={handlePreviousStep}
          disabled={currentStep === 0}
        >
          <MaterialIcons name="navigate-before" size={24} color="white" />
          <Text style={styles.navButtonText}>Previous</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.navButton,
            currentStep === currentLesson.steps.length - 1 && styles.disabledButton,
          ]}
          onPress={handleNextStep}
          disabled={currentStep === currentLesson.steps.length - 1}
        >
          <Text style={styles.navButtonText}>Next</Text>
          <MaterialIcons name="navigate-next" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
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
    padding: 20,
  },
  header: {
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
    marginTop: 5,
  },
  assistantButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF1FF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  assistantButtonText: {
    color: '#5B67CA',
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 14,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  stepContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#495057',
  },
  stepContent: {
    fontSize: 16,
    lineHeight: 24,
    color: '#212529',
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  navButtonText: {
    color: '#fff',
    fontSize: 16,
    marginHorizontal: 5,
  },
  disabledButton: {
    backgroundColor: '#6c757d',
    opacity: 0.5,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6c757d',
  },
  errorText: {
    color: '#dc3545',
    fontSize: 16,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  noLessonText: {
    fontSize: 18,
    color: '#6c757d',
    marginBottom: 20,
  },
  generateButton: {
    backgroundColor: '#28a745',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default LessonScreen; 