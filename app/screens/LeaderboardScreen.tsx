import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import type { Subject } from '../types/lesson';

interface LeaderboardUser {
  id: string;
  name: string;
  avatar: string;
  score: number;
  rank: number;
  level: number;
  achievements: string[];
}

const mockUsers: LeaderboardUser[] = [
  {
    id: '1',
    name: 'Анна С.',
    avatar: 'https://i.pravatar.cc/150?img=1',
    score: 2500,
    rank: 1,
    level: 15,
    achievements: ['Мастер математики', 'Физик-теоретик'],
  },
  {
    id: '2',
    name: 'Михаил К.',
    avatar: 'https://i.pravatar.cc/150?img=2',
    score: 2350,
    rank: 2,
    level: 14,
    achievements: ['Химик-практик', 'Биолог года'],
  },
  // Добавьте больше пользователей здесь
];

const LeaderboardScreen: React.FC = () => {
  const [selectedSubject, setSelectedSubject] = useState<Subject>('mathematics');

  const subjects = [
    { id: 'mathematics' as Subject, name: 'Математика', icon: '🔢' },
    { id: 'physics' as Subject, name: 'Физика', icon: '⚡' },
    { id: 'chemistry' as Subject, name: 'Химия', icon: '🧪' },
    { id: 'biology' as Subject, name: 'Биология', icon: '🧬' },
  ];

  const renderUser = ({ item, index }: { item: LeaderboardUser; index: number }) => (
    <View style={styles.userCard}>
      <View style={styles.rankContainer}>
        <Text style={styles.rankText}>#{item.rank}</Text>
      </View>
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.name}</Text>
        <View style={styles.achievementsContainer}>
          {item.achievements.map((achievement, i) => (
            <View key={i} style={styles.achievementBadge}>
              <Text style={styles.achievementText}>{achievement}</Text>
            </View>
          ))}
        </View>
      </View>
      <View style={styles.scoreContainer}>
        <Text style={styles.scoreText}>{item.score}</Text>
        <Text style={styles.levelText}>Уровень {item.level}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Таблица лидеров</Text>
      </View>

      <View style={styles.subjectsContainer}>
        <FlatList
          data={subjects}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.subjectButton,
                selectedSubject === item.id && styles.selectedSubject,
              ]}
              onPress={() => setSelectedSubject(item.id)}
            >
              <Text style={styles.subjectIcon}>{item.icon}</Text>
              <Text
                style={[
                  styles.subjectText,
                  selectedSubject === item.id && styles.selectedSubjectText,
                ]}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.subjectsList}
        />
      </View>

      <FlatList
        data={mockUsers}
        renderItem={renderUser}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.usersList}
        showsVerticalScrollIndicator={false}
      />
    </View>
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
  },
  subjectsContainer: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  subjectsList: {
    paddingHorizontal: 15,
  },
  subjectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  selectedSubject: {
    backgroundColor: '#e3f2fd',
  },
  subjectIcon: {
    fontSize: 18,
    marginRight: 5,
  },
  subjectText: {
    fontSize: 16,
    color: '#6c757d',
  },
  selectedSubjectText: {
    color: '#2196f3',
    fontWeight: '600',
  },
  usersList: {
    padding: 15,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  rankContainer: {
    width: 40,
    alignItems: 'center',
  },
  rankText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 5,
  },
  achievementsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  achievementBadge: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 5,
    marginBottom: 5,
  },
  achievementText: {
    fontSize: 12,
    color: '#2196f3',
  },
  scoreContainer: {
    alignItems: 'flex-end',
  },
  scoreText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2196f3',
  },
  levelText: {
    fontSize: 14,
    color: '#6c757d',
  },
});

export default LeaderboardScreen; 