import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { TrackAssistantChat } from '../components/ai/TrackAssistantChat';

// Тип для параметров маршрута
interface TrackAssistantScreenParams {
  trackId?: string;
  assistantId?: string;
  lessonId?: string;
  trackName?: string;
}

export const TrackAssistantScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  
  // Получаем параметры из навигации
  const { trackId, assistantId, lessonId, trackName } = route.params as TrackAssistantScreenParams;
  
  // Устанавливаем заголовок экрана, если передано название трека
  React.useEffect(() => {
    if (trackName) {
      navigation.setOptions({
        title: `Ассистент: ${trackName}`
      });
    }
  }, [navigation, trackName]);
  
  const handleClose = () => {
    navigation.goBack();
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <TrackAssistantChat
        trackId={trackId}
        assistantId={assistantId}
        lessonId={lessonId}
        onClose={handleClose}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F5FF',
  }
});

export default TrackAssistantScreen; 