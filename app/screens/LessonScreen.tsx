import { FontAwesome } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import Markdown from 'react-native-markdown-display';

import { LearningStyle, Lesson, Subject } from '../../types/lesson';

// Define types for FlatList sections
interface HeaderSection {
  id: string;
  type: 'HEADER';
  data: Lesson;
}

interface ContentSection {
  id: string;
  type: 'CONTENT';
  text: string;
  styles: any; // Using 'any' for simplicity for the markdown styles object, or could be more specific
}

type SectionItem = HeaderSection | ContentSection;

const LessonScreen: React.FC = () => {
  const params = useLocalSearchParams<{
    lessonData?: string;
    lessonId?: string;
    trackId?: string;
  }>();

  const [lessonFromParams, setLessonFromParams] = useState<Lesson | null>(null);
  const [paramError, setParamError] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    if (params.lessonData) {
      try {
        const passedPayload = JSON.parse(params.lessonData);
        const mappedLesson: Lesson = {
          id: passedPayload._id || passedPayload.id || `param-lesson-${Date.now()}`,
          topic: passedPayload.topic || 'Неизвестный тема',
          content: passedPayload.content || 'Содержимое не передано.',
          subject: passedPayload.subject,
          difficulty: passedPayload.difficulty || 1,
          assignments: passedPayload.assignments || [],
          estimatedTime: passedPayload.estimatedTime || 0,
          completed: passedPayload.completed || false,
        };
        setLessonFromParams(mappedLesson);
        setParamError(null);
      } catch (e) {
        console.error('Blyat! Failed to parse lessonData from params:', e);
        setParamError('Ошибка обработки данных урока из параметров.');
        setLessonFromParams(null);
      }
    } else {
      setLessonFromParams(null);
      setParamError(null);
    }
  }, [params.lessonData]);

  const openTrackAssistant = () => {
    console.log('Navigating to assistant...');
  };

  const displayLesson = lessonFromParams;
  const isLoading = !lessonFromParams;
  const error = paramError;

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Загружаем урок...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Ошибка: {error}</Text>
        {!lessonFromParams && (
          <TouchableOpacity style={styles.retryButton} disabled>
            <Text style={styles.retryButtonText}>Попробовать снова</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  if (!displayLesson) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.noLessonText}>Урок не найден</Text>
      </View>
    );
  }

  const currentMarkdownStyles = {
    heading1: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 10,
    },
    heading2: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 10,
    },
    heading3: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 10,
    },
    paragraph: {
      fontSize: 16,
      lineHeight: 24,
    },
  };

  const sections: SectionItem[] = [
    { id: 'lessonHeader', type: 'HEADER', data: displayLesson },
    {
      id: 'lessonContent',
      type: 'CONTENT',
      text: displayLesson.content,
      styles: currentMarkdownStyles,
    },
  ];

  const renderSectionItem = ({ item }: { item: SectionItem }) => {
    if (item.type === 'HEADER') {
      return (
        <View style={styles.header}>
          <Text style={styles.title}>{item.data.topic}</Text>
          {item.data.subject && <Text style={styles.subtitle}>{item.data.subject}</Text>}
        </View>
      );
    }
    if (item.type === 'CONTENT') {
      return (
        <View style={styles.markdownContentContainer}>
          <Stack.Screen options={{
            title: 'Урок',
          }} />
          <Markdown style={item.styles}>{item.text}</Markdown>
        </View>
      );
    }
    return null;
  };

  return (
    <FlatList
      data={sections}
      renderItem={renderSectionItem}
      keyExtractor={item => item.id}
      style={styles.container}
      showsVerticalScrollIndicator={false}
    />
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
  markdownContentContainer: {
    padding: 20,
  },
  stepContent: {
    fontSize: 16,
    lineHeight: 24,
    color: '#212529',
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
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#007bff',
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
    textAlign: 'center',
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
