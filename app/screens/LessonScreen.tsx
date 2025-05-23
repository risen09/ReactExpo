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

import { LearningStyle, Lesson, Subject, LessonBlock } from '@/types/lesson';
import client from '@/api/client';
import QuizBlock from '@/components/lesson/QuizBlock';

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

// New interface for Quiz Section
interface QuizSection {
    id: string;
    type: 'QUIZ'; // New type for quiz sections
    data: any; // Use any for now, we can refine this type later if needed.
}

type SectionItem = HeaderSection | ContentSection | QuizSection; // Added QuizSection

const LessonScreen: React.FC = () => {
  const params = useLocalSearchParams<{
    lessonId?: string;
    trackId?: string;
  }>();

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    if (params.lessonId) {
      const fetchLesson = async () => {
        setLoading(true);
        setError(null);
        try {
          const response = await client.lessons.getById(params.lessonId!);
          console.log(`\n\n${JSON.stringify(response.data.content, null, 2)}`)
          setLesson(response.data);
        } catch (e) {
          console.error('Blyat! Failed to fetch lesson:', e);
          setError('Ошибка загрузки урока.');
        } finally {
          setLoading(false);
        }
      };

      fetchLesson();
    } else {
      // Handle case where lessonId is not provided
      setError('ID урока отсутствует. Pizdec!');
      setLoading(false);
    }
  }, [params.lessonId]); // Depend on lessonId param

  const openTrackAssistant = () => {
    console.log('Navigating to assistant...');
  };

  // Use the fetched lesson data
  const displayLesson = lesson;
  const isLoading = loading;
  const errorStatus = error;

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Загружаем урок...</Text>
      </View>
    );
  }

  if (errorStatus) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Ошибка: {errorStatus}</Text>
        {!displayLesson && (
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

  // Build sections from fetched lesson content
  const sections: SectionItem[] = [
    { id: 'lessonHeader', type: 'HEADER', data: displayLesson },
    ...(displayLesson.content
      ? displayLesson.content.map((block, index) => {
          // For now, only handle 'paragraph' type and now 'quiz'
          if (block.blockType === 'paragraph') {
            console.log(JSON.stringify(block, null, 2));
            return {
              id: `content-${index}`,
              type: 'CONTENT',
              text: block.content, // Correctly access content for paragraph
              styles: currentMarkdownStyles,
            } as ContentSection;
          } else if (block.blockType === 'quiz') { // Check for quiz block type
            console.log(JSON.stringify(block, null, 2));
            return {
                id: `quiz-${index}`,
                type: 'QUIZ',
                data: block.data, // Pass the quiz data
            } as QuizSection; // Cast to new QuizSection type
          }
           else {
            // Return an empty fragment or similar for unhandled types
            // Use type 'CONTENT' with empty text for now as per SectionItem type
            return {
              id: `content-${index}`,
              type: 'CONTENT',
              text: '',
              styles: {},
            } as ContentSection;
          }
        })
      : []),
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
          <Stack.Screen
            options={{
              title: 'Урок',
            }}
          />
          <Markdown style={item.styles}>{item.text}</Markdown>
        </View>
      );
    }
    if (item.type === 'QUIZ') { // Handle the new QUIZ type
        return (
            <View style={styles.markdownContentContainer}> 
                <QuizBlock data={item.data} /> 
            </View>
        );
    }
    // Unhandled types are now rendered as empty CONTENT blocks.
    return <></>;
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
