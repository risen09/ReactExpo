import { router } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { Track } from '@/types/track';

// Импортируем изображения
const mathIcon = require('../assets/images/chatgpt-maths-1.png');
const physicsIcon = require('../assets/images/photo_2025-04-05_15-03-42.jpg');
const informaticsIcon = require('../assets/images/photo_2025-04-05_15-20-56.jpg');
const englishIcon = require('../assets/images/english.jpg');
const biologyIcon = require('../assets/images/biology.png');
const defaultIcon = require('../assets/images/qwen-ai.png');

// Общая цветовая палитра приложения
const COLORS = {
  primary: '#5B67CA', // Основной синий/фиолетовый
  secondary: '#43C0B4', // Бирюзовый
  accent1: '#F98D51', // Оранжевый
  accent2: '#EC575B', // Красный
  accent3: '#FFCA42', // Желтый
  background: '#F2F5FF', // Светлый фон
  card: '#FFFFFF', // Белый для карточек
  text: '#25335F', // Основной текст
  textSecondary: '#7F8BB7', // Вторичный текст
  border: '#EAEDF5', // Граница
};

interface LearningTrackCardProps {
  track: Track;
  onPress?: () => void;
}

// Иконки для предметов
const SubjectIcon = ({ subject }: { subject: string }) => {
  const subjectLower = subject.toLowerCase();
  
  if (subjectLower === 'math') {
    return (
      <Image
        source={mathIcon}
        style={[styles.subjectIcon, { backgroundColor: 'transparent' }]}
        resizeMode="cover"
      />
    );
  }
  
  if (subjectLower === 'physics') {
    return (
      <Image
        source={physicsIcon}
        style={styles.subjectIcon}
        resizeMode="cover"
      />
    );
  }
  
  if (subjectLower === 'cs') {
    return (
      <Image
        source={informaticsIcon}
        style={styles.subjectIcon}
        resizeMode="cover"
      />
    );
  }

  if (subjectLower === 'english') {
    return (
      <Image
        source={englishIcon}
        style={styles.subjectIcon}
        resizeMode="cover"
      />
    );
  }

  if (subjectLower === 'biology') {
    return (
      <Image
        source={biologyIcon}
        style={styles.subjectIcon}
        resizeMode="cover"
      />
    );
  }

  return (
    <Image
      source={defaultIcon}
      style={styles.subjectIcon}
      resizeMode="cover"
    />
  );
};

export default function LearningTrackCard({ track, onPress }: LearningTrackCardProps) {
  const completedLessons = track.lessons.filter(item => item.lesson.completed).length;
  const totalLessons = track.lessons.length;
  const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  // Определяем градиент для фона карточки на основе предмета
  const getGradient = (subject: string) => {
    switch (subject.toLowerCase()) {
      case 'math':
        return ['#5B67CA', '#6E78D1'];
      case 'physics':
        return ['#43C0B4', '#55D1C5'];
      case 'english':
        return ['#F98D51', '#FFB84D'];
      case 'cs':
        return ['#4A7BF7', '#5D8DF8'];
      default:
        return ['#7F8BB7', '#9AA4C8'];
    }
  };

  const [gradientStart, gradientEnd] = getGradient(track.subject);

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/learning-track/${track._id}` as any);
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress}>
      <View style={[styles.iconContainer, { backgroundColor: gradientStart }]}>
        <SubjectIcon subject={track.subject} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{track.name}</Text>
        <Text style={styles.subject}>{track.subject}</Text>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${progressPercentage}%`, backgroundColor: gradientStart },
              ]}
            />
          </View>
          <Text style={styles.progressText}>{`${completedLessons}/${totalLessons} уроков`}</Text>
        </View>
      </View>

      <View style={styles.chevronContainer}>
        <ChevronRight size={20} color={COLORS.textSecondary} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    overflow: 'hidden',
  },
  subjectIcon: {
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  subject: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 10,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: COLORS.border,
    borderRadius: 3,
    marginRight: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  chevronContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
