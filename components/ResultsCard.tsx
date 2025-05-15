import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

import ProgressBar from './ProgressBar';
import { MBTIScores } from '../types/personalityTest';

interface ResultsCardProps {
  personalityType: string;
  description: string;
  scores?: MBTIScores;
  onRestart: () => void;
}

function ResultsCard({ personalityType, description, scores, onRestart }: ResultsCardProps) {
  const getPersonalityTypeName = (type: string): string => {
    const typeNames: Record<string, string> = {
      INTJ: 'Стратег',
      INTP: 'Логик',
      ENTJ: 'Командир',
      ENTP: 'Новатор',
      INFJ: 'Советник',
      INFP: 'Посредник',
      ENFJ: 'Вдохновитель',
      ENFP: 'Борец',
      ISTJ: 'Инспектор',
      ISFJ: 'Защитник',
      ESTJ: 'Администратор',
      ESFJ: 'Консул',
      ISTP: 'Виртуоз',
      ISFP: 'Композитор',
      ESTP: 'Делец',
      ESFP: 'Развлекатель',
    };

    return typeNames[type] || 'Неизвестный тип';
  };

  const renderScores = () => {
    if (!scores) return null;

    const totalE = scores.extraversion;
    const totalI = scores.introversion;
    const totalS = scores.sensing;
    const totalN = scores.intuition;
    const totalT = scores.thinking;
    const totalF = scores.feeling;
    const totalJ = scores.judging;
    const totalP = scores.perceiving;

    const calculatePercentage = (a: number, b: number) => {
      const total = a + b;
      return total > 0 ? Math.round((a / total) * 100) : 50;
    };

    const ePercentage = calculatePercentage(totalE, totalI);
    const sPercentage = calculatePercentage(totalS, totalN);
    const tPercentage = calculatePercentage(totalT, totalF);
    const jPercentage = calculatePercentage(totalJ, totalP);

    return (
      <View style={styles.scoresContainer}>
        <Text style={styles.scoresTitle}>Подробный анализ</Text>

        <View style={styles.scoreRow}>
          <Text style={styles.scaleLabel}>I</Text>
          <View style={styles.progressContainer}>
            <ProgressBar progress={100 - ePercentage} fillColor="#3498db" height={10} />
          </View>
          <Text style={styles.scaleLabel}>E</Text>
          <Text style={styles.percentageText}>{ePercentage}%</Text>
        </View>

        <View style={styles.scoreRow}>
          <Text style={styles.scaleLabel}>N</Text>
          <View style={styles.progressContainer}>
            <ProgressBar progress={100 - sPercentage} fillColor="#2ecc71" height={10} />
          </View>
          <Text style={styles.scaleLabel}>S</Text>
          <Text style={styles.percentageText}>{sPercentage}%</Text>
        </View>

        <View style={styles.scoreRow}>
          <Text style={styles.scaleLabel}>F</Text>
          <View style={styles.progressContainer}>
            <ProgressBar progress={100 - tPercentage} fillColor="#e74c3c" height={10} />
          </View>
          <Text style={styles.scaleLabel}>T</Text>
          <Text style={styles.percentageText}>{tPercentage}%</Text>
        </View>

        <View style={styles.scoreRow}>
          <Text style={styles.scaleLabel}>P</Text>
          <View style={styles.progressContainer}>
            <ProgressBar progress={100 - jPercentage} fillColor="#9b59b6" height={10} />
          </View>
          <Text style={styles.scaleLabel}>J</Text>
          <Text style={styles.percentageText}>{jPercentage}%</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Ваш тип личности</Text>
      <View style={styles.typeContainer}>
        <Text style={styles.personalityType}>{personalityType}</Text>
        <Text style={styles.typeName}>{getPersonalityTypeName(personalityType)}</Text>
      </View>
      <Text style={styles.description}>{description}</Text>

      {renderScores()}

      <Text style={styles.learningInfo}>
        На основе вашего типа личности мы создадим персонализированную программу обучения, которая
        будет соответствовать вашим когнитивным особенностям.
      </Text>

      <TouchableOpacity style={styles.button} onPress={onRestart}>
        <Text style={styles.buttonText}>Пройти тест заново</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
    color: '#333',
  },
  typeContainer: {
    marginVertical: 16,
    alignItems: 'center',
  },
  personalityType: {
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    color: '#2c3e50',
  },
  typeName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4CAF50',
    marginTop: 4,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
    color: '#555',
  },
  scoresContainer: {
    marginVertical: 16,
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
  },
  scoresTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  scaleLabel: {
    width: 20,
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 16,
    color: '#555',
  },
  progressContainer: {
    flex: 1,
    marginHorizontal: 8,
  },
  percentageText: {
    width: 40,
    textAlign: 'right',
    fontSize: 14,
    color: '#777',
  },
  learningInfo: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginVertical: 16,
    color: '#666',
    fontStyle: 'italic',
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ResultsCard;
