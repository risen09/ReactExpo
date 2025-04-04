import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch } from 'react-redux';
import { MaterialIcons } from '@expo/vector-icons';
import { generateLesson } from '../../store/features/lessonSlice';
import type { AppDispatch } from '../../store/store';
import type { Subject, LearningStyle } from '../types/lesson';

interface SubjectCard {
  id: Subject;
  title: string;
  icon: string;
  description: string;
}

interface LearningStyleCard {
  id: LearningStyle;
  title: string;
  icon: string;
  description: string;
}

const subjects: SubjectCard[] = [
  {
    id: 'mathematics',
    title: 'Математика',
    icon: '🔢',
    description: 'Алгебра, геометрия и математический анализ',
  },
  {
    id: 'physics',
    title: 'Физика',
    icon: '⚡',
    description: 'Механика, электричество и квантовая физика',
  },
  {
    id: 'chemistry',
    title: 'Химия',
    icon: '🧪',
    description: 'Органическая и неорганическая химия',
  },
  {
    id: 'biology',
    title: 'Биология',
    icon: '🧬',
    description: 'Анатомия, генетика и экология',
  },
];

const learningStyles: LearningStyleCard[] = [
  {
    id: 'visual',
    title: 'Визуальный',
    icon: '👁️',
    description: 'Обучение через диаграммы, графики и видео',
  },
  {
    id: 'auditory',
    title: 'Аудиальный',
    icon: '👂',
    description: 'Обучение через аудио-лекции и обсуждения',
  },
  {
    id: 'kinesthetic',
    title: 'Кинестетический',
    icon: '✋',
    description: 'Обучение через практические упражнения',
  },
];

const SubjectSelectionScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<LearningStyle | null>(null);

  const handleStartLearning = async () => {
    if (selectedSubject && selectedStyle) {
      try {
        await dispatch(generateLesson({
          subject: selectedSubject,
          learningStyle: selectedStyle,
        })).unwrap();
        router.push({
          pathname: '/lessons',
        });
      } catch (error) {
        console.error('Failed to generate lesson:', error);
      }
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Выберите предмет</Text>
        <View style={styles.grid}>
          {subjects.map((subject) => (
            <TouchableOpacity
              key={subject.id}
              style={[
                styles.card,
                selectedSubject === subject.id && styles.selectedCard,
              ]}
              onPress={() => setSelectedSubject(subject.id)}
            >
              <Text style={styles.cardIcon}>{subject.icon}</Text>
              <Text style={styles.cardTitle}>{subject.title}</Text>
              <Text style={styles.cardDescription}>{subject.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Выберите стиль обучения</Text>
        <View style={styles.grid}>
          {learningStyles.map((style) => (
            <TouchableOpacity
              key={style.id}
              style={[
                styles.card,
                selectedStyle === style.id && styles.selectedCard,
              ]}
              onPress={() => setSelectedStyle(style.id)}
            >
              <Text style={styles.cardIcon}>{style.icon}</Text>
              <Text style={styles.cardTitle}>{style.title}</Text>
              <Text style={styles.cardDescription}>{style.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.startButton,
          (!selectedSubject || !selectedStyle) && styles.disabledButton,
        ]}
        onPress={handleStartLearning}
        disabled={!selectedSubject || !selectedStyle}
      >
        <Text style={styles.startButtonText}>Начать обучение</Text>
        <MaterialIcons name="arrow-forward" size={24} color="white" />
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#212529',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedCard: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196f3',
    borderWidth: 2,
  },
  cardIcon: {
    fontSize: 32,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
    color: '#212529',
  },
  cardDescription: {
    fontSize: 14,
    color: '#6c757d',
  },
  startButton: {
    backgroundColor: '#2196f3',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 40,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 10,
  },
  disabledButton: {
    backgroundColor: '#6c757d',
    opacity: 0.5,
  },
});

export default SubjectSelectionScreen; 