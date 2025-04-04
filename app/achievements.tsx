import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Stack, router } from 'expo-router';
import { Award, ArrowLeft, Trophy, Star, Zap, Brain, BookOpen } from 'lucide-react-native';
import BurgerMenu from './components/BurgerMenu';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: JSX.Element;
  unlocked: boolean;
  progress?: number;
  color: string;
}

export default function AchievementsScreen() {
  const [menuVisible, setMenuVisible] = useState(false);

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  const achievements: Achievement[] = [
    {
      id: '1',
      title: 'Начинающий ученик',
      description: 'Пройдите свой первый урок',
      icon: <BookOpen size={24} color="#FFFFFF" />,
      unlocked: true,
      color: '#4A6CFA',
    },
    {
      id: '2',
      title: 'MBTI Мастер',
      description: 'Пройдите тест личности',
      icon: <Brain size={24} color="#FFFFFF" />,
      unlocked: true,
      color: '#FF7043',
    },
    {
      id: '3',
      title: 'Стремительный прогресс',
      description: 'Пройдите 5 уроков за неделю',
      icon: <Zap size={24} color="#FFFFFF" />,
      unlocked: false,
      progress: 60,
      color: '#FFC107',
    },
    {
      id: '4',
      title: 'Звезда знаний',
      description: 'Получите пять отличных оценок',
      icon: <Star size={24} color="#FFFFFF" />,
      unlocked: false,
      progress: 40,
      color: '#9C27B0',
    },
    {
      id: '5',
      title: 'Чемпион курса',
      description: 'Завершите целый курс',
      icon: <Trophy size={24} color="#FFFFFF" />,
      unlocked: false,
      progress: 25,
      color: '#4CAF50',
    },
  ];

  return (
    <>
      <BurgerMenu 
        visible={menuVisible} 
        onClose={() => setMenuVisible(false)} 
      />
    
      <Stack.Screen
        options={{
          title: 'Достижения',
          headerTitleStyle: {
            fontWeight: '600',
            fontSize: 18,
            color: '#333333',
          },
          headerStyle: {
            backgroundColor: '#FFFFFF',
          },
          headerShadowVisible: false,
          headerLeft: () => (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <ArrowLeft size={24} color="#333333" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={toggleMenu} style={styles.headerRight}>
              <View style={styles.burgerMenu}>
                <View style={styles.burgerLine} />
                <View style={styles.burgerLine} />
                <View style={styles.burgerLine} />
              </View>
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Award size={32} color="#FF9800" />
          <Text style={styles.title}>Ваши достижения</Text>
          <Text style={styles.subtitle}>
            Прогресс, награды и цели
          </Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>2</Text>
            <Text style={styles.statLabel}>Разблокировано</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>3</Text>
            <Text style={styles.statLabel}>В процессе</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>5</Text>
            <Text style={styles.statLabel}>Всего</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Все достижения</Text>

        {achievements.map((achievement) => (
          <View 
            key={achievement.id} 
            style={[
              styles.achievementCard,
              !achievement.unlocked && styles.lockedCard
            ]}
          >
            <View 
              style={[
                styles.achievementIcon,
                { backgroundColor: achievement.color },
                !achievement.unlocked && styles.lockedIcon
              ]}
            >
              {achievement.icon}
            </View>
            <View style={styles.achievementContent}>
              <Text style={styles.achievementTitle}>
                {achievement.title}
                {achievement.unlocked && (
                  <Text style={styles.unlockedBadge}> ✓</Text>
                )}
              </Text>
              <Text style={styles.achievementDescription}>
                {achievement.description}
              </Text>
              
              {achievement.progress !== undefined && (
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill,
                        { width: `${achievement.progress}%`, backgroundColor: achievement.color }
                      ]} 
                    />
                  </View>
                  <Text style={styles.progressText}>{achievement.progress}%</Text>
                </View>
              )}
            </View>
          </View>
        ))}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FD',
  },
  backButton: {
    marginLeft: 16,
  },
  header: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 12,
  },
  subtitle: {
    fontSize: 14,
    color: '#757575',
    marginTop: 6,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 25,
    paddingVertical: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 5,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 13,
    color: '#757575',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: '70%',
    backgroundColor: '#EEEEEE',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  achievementCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  lockedCard: {
    opacity: 0.7,
  },
  achievementIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  lockedIcon: {
    backgroundColor: '#BDBDBD',
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  unlockedBadge: {
    color: '#4CAF50',
    fontSize: 16,
  },
  achievementDescription: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 10,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#F0F0F0',
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
    fontWeight: '500',
    color: '#757575',
    width: 32,
  },
  headerRight: {
    marginRight: 16,
    padding: 8,
  },
  burgerMenu: {
    width: 24,
    height: 18,
    justifyContent: 'space-between',
  },
  burgerLine: {
    width: '100%',
    height: 2,
    backgroundColor: '#333333',
    borderRadius: 4,
  },
}); 