import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ChatInterface } from './ChatInterface';
import useTrackAssistant from '../../hooks/useTrackAssistant';

interface TrackAssistantChatProps {
  trackId?: string;
  assistantId?: string;
  lessonId?: string;
  onClose?: () => void;
}

export const TrackAssistantChat: React.FC<TrackAssistantChatProps> = ({
  trackId,
  assistantId: propAssistantId,
  lessonId,
  onClose
}) => {
  const {
    assistantId,
    messages,
    isLoading,
    error,
    trackAssistant,
    createAssistant,
    sendMessage
  } = useTrackAssistant({
    trackId,
    assistantId: propAssistantId
  });

  const [isInitializing, setIsInitializing] = useState(!propAssistantId);

  useEffect(() => {
    const initializeAssistant = async () => {
      if (!propAssistantId && trackId) {
        await createAssistant(trackId);
        setIsInitializing(false);
      }
    };

    if (isInitializing) {
      initializeAssistant();
    }
  }, [createAssistant, isInitializing, propAssistantId, trackId]);

  const handleSendMessage = async (message: string) => {
    await sendMessage(message, lessonId);
  };

  const renderHeader = () => {
    return (
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {trackAssistant?.track_info?.name 
            ? `Ассистент: ${trackAssistant.track_info.name}` 
            : 'Ассистент трека'}
        </Text>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (isInitializing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5B67CA" />
        <Text style={styles.loadingText}>Создание ассистента...</Text>
      </View>
    );
  }

  if (error && messages.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Ошибка: {error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => {
            if (!propAssistantId && trackId) {
              setIsInitializing(true);
            }
          }}
        >
          <Text style={styles.retryButtonText}>Повторить</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ChatInterface
        messages={messages}
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        placeholder="Задайте вопрос ассистенту..."
        headerComponent={renderHeader()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F5FF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EAEDF5',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#25335F',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F2F5FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#25335F',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F2F5FF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#25335F',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F2F5FF',
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#FF5252',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#5B67CA',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default TrackAssistantChat; 