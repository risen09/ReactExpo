import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';

import type { Subject } from '../../types/lesson';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  progress: number;
  maxProgress: number;
  subject: Subject;
  unlocked: boolean;
  reward: string;
}

const achievements: Achievement[] = [
  {
    id: '1',
    title: 'Мастер математики',
    description: 'Решите 100 математических задач',
    icon: '🔢',
    progress: 75,
    maxProgress: 100,
    subject: 'mathematics',
    unlocked: false,
    reward: '500 очков',
  },
  {
    id: '2',
    title: 'Физик-теоретик',
    description: 'Пройдите все уроки по квантовой физике',
    icon: '⚡',
    progress: 30,
    maxProgress: 30,
    subject: 'physics',
    unlocked: true,
    reward: '1000 очков',
  },
  {
    id: '3',
    title: 'Химик-практик',
    description: 'Выполните 50 виртуальных экспериментов',
    icon: '🧪',
    progress: 35,
    maxProgress: 50,
    subject: 'chemistry',
    unlocked: false,
    reward: '750 очков',
  },
  {
    id: '4',
    title: 'Биолог года',
    description: 'Изучите все темы по биологии',
    icon: '🧬',
    progress: 20,
    maxProgress: 40,
    subject: 'biology',
    unlocked: false,
    reward: '1000 очков',
  },
];

const AchievementsScreen: React.FC = () => {
  const renderAchievement = (achievement: Achievement) => (
    <TouchableOpacity
      key={achievement.id}
      style={[styles.achievementCard, achievement.unlocked && styles.unlockedCard]}
    >
      <View style={styles.achievementHeader}>
        <Text style={styles.achievementIcon}>{achievement.icon}</Text>
        <View style={styles.achievementTitleContainer}>
          <Text style={styles.achievementTitle}>{achievement.title}</Text>
          <Text style={styles.achievementDescription}>{achievement.description}</Text>
        </View>
        {achievement.unlocked && <MaterialIcons name="verified" size={24} color="#4caf50" />}
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${(achievement.progress / achievement.maxProgress) * 100}%` },
              achievement.unlocked && styles.unlockedProgressFill,
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {achievement.progress} / {achievement.maxProgress}
        </Text>
      </View>

      <View style={styles.rewardContainer}>
        <MaterialIcons name="stars" size={20} color="#ffc107" />
        <Text style={styles.rewardText}>Награда: {achievement.reward}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Достижения</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{achievements.filter(a => a.unlocked).length}</Text>
            <Text style={styles.statLabel}>Получено</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{achievements.length}</Text>
            <Text style={styles.statLabel}>Всего</Text>
          </View>
        </View>
      </View>

      <View style={styles.achievementsContainer}>{achievements.map(renderAchievement)}</View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
    marginBottom: 15,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    borderRadius: 12,
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
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196f3',
  },
  statLabel: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 5,
  },
  achievementsContainer: {
    padding: 15,
  },
  achievementCard: {
    backgroundColor: '#fff',
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
  unlockedCard: {
    backgroundColor: '#f8fdf9',
    borderColor: '#4caf50',
    borderWidth: 1,
  },
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  achievementIcon: {
    fontSize: 32,
    marginRight: 15,
  },
  achievementTitleContainer: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 5,
  },
  achievementDescription: {
    fontSize: 14,
    color: '#6c757d',
  },
  progressContainer: {
    marginBottom: 15,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 5,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2196f3',
    borderRadius: 4,
  },
  unlockedProgressFill: {
    backgroundColor: '#4caf50',
  },
  progressText: {
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'right',
  },
  rewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rewardText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#212529',
  },
});

export default AchievementsScreen;
