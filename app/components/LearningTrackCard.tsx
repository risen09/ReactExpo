import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { LearningTrack } from '../models/LearningAgents';

// Общая цветовая палитра приложения
const COLORS = {
  primary: '#5B67CA',     // Основной синий/фиолетовый
  secondary: '#43C0B4',   // Бирюзовый
  accent1: '#F98D51',     // Оранжевый
  accent2: '#EC575B',     // Красный
  accent3: '#FFCA42',     // Желтый
  background: '#F2F5FF',  // Светлый фон
  card: '#FFFFFF',        // Белый для карточек
  text: '#25335F',        // Основной текст
  textSecondary: '#7F8BB7',  // Вторичный текст
  border: '#EAEDF5'       // Граница
};

interface LearningTrackCardProps {
  track: LearningTrack;
  onPress?: () => void;
}

const subjectIcons: Record<string, any> = {
  математика: require('../../assets/images/courses/math.svg'),
  физика: require('../../assets/images/courses/physics.svg'),
  английский: require('../../assets/images/courses/english.svg'),
  информатика: require('../../assets/images/courses/python.svg'),
  // Добавьте другие предметы и соответствующие иконки
};

export default function LearningTrackCard({ track, onPress }: LearningTrackCardProps) {
  const completedLessons = track.lessons.filter(lesson => lesson.completed).length;
  const totalLessons = track.lessons.length;
  const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
  
  // Определяем градиент для фона карточки на основе предмета
  const getGradient = (subject: string) => {
    switch (subject.toLowerCase()) {
      case 'математика':
        return ['#5B67CA', '#6E78D1'];
      case 'физика':
        return ['#43C0B4', '#55D1C5'];
      case 'английский':
        return ['#F98D51', '#FFB84D'];
      case 'информатика':
        return ['#4A7BF7', '#5D8DF8'];
      default:
        return ['#7F8BB7', '#9AA4C8'];
    }
  };
  
  const [gradientStart, gradientEnd] = getGradient(track.subject);
  
  // Иконка для предмета
  const subjectIcon = subjectIcons[track.subject.toLowerCase()] || subjectIcons.математика;
  
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/learning-track/${track.id}` as any);
    }
  };
  
  return (
    <TouchableOpacity style={styles.card} onPress={handlePress}>
      <View style={[styles.iconContainer, { backgroundColor: gradientStart }]}>
        <Image source={subjectIcon} style={styles.icon} />
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title}>{track.name}</Text>
        <Text style={styles.subject}>{track.subject}</Text>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${progressPercentage}%`, backgroundColor: gradientStart }
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
  },
  icon: {
    width: 24,
    height: 24,
    tintColor: '#FFFFFF',
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