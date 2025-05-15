import { useRoute, useNavigation } from '@react-navigation/native';
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

// Заглушка для экрана создания трека обучения
// В полной реализации здесь будет интерфейс для создания трека

interface CreateTrackScreenParams {
  subject: string;
  topic: string;
  suggestedTopics?: string[];
}

export const CreateTrackScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();

  // Получаем параметры из навигации
  const { subject, topic, suggestedTopics = [] } = route.params as CreateTrackScreenParams;

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        <View style={styles.infoContainer}>
          <Text style={styles.title}>Создание трека обучения</Text>
          <Text style={styles.subtitle}>Предмет: {subject}</Text>
          <Text style={styles.subtitle}>Основная тема: {topic}</Text>

          {suggestedTopics.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Рекомендуемые темы для изучения:</Text>
              {suggestedTopics.map((suggestedTopic, index) => (
                <View key={index} style={styles.topicItem}>
                  <Text style={styles.topicText}>
                    {index + 1}. {suggestedTopic}
                  </Text>
                </View>
              ))}
            </>
          )}

          <Text style={styles.note}>
            (Это временная заглушка. В полной реализации здесь будет интерфейс для настройки трека
            обучения.)
          </Text>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            // @ts-ignore
            navigation.navigate('(tabs)', { screen: 'learning-tracks' });
          }}
        >
          <Text style={styles.buttonText}>Создать трек и перейти к трекам обучения</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={() => {
            // @ts-ignore
            navigation.navigate('(tabs)');
          }}
        >
          <Text style={styles.secondaryButtonText}>Вернуться на главную</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#F2F5FF',
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  infoContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#25335F',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#25335F',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#25335F',
    marginTop: 20,
    marginBottom: 12,
  },
  topicItem: {
    backgroundColor: '#F2F5FF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  topicText: {
    fontSize: 15,
    color: '#5B67CA',
  },
  note: {
    fontSize: 14,
    color: '#7F8BB7',
    fontStyle: 'italic',
    marginTop: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#5B67CA',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 12,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#5B67CA',
  },
  secondaryButtonText: {
    color: '#5B67CA',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default CreateTrackScreen;
