import React from 'react';
import { Modal, View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';
import bounce_ball from '@/assets/animations/loading/bounce_ball.json';

interface LoadingModalProps {
  visible: boolean;
  message: string;
}

const LoadingModal: React.FC<LoadingModalProps> = ({ visible, message }) => {
  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={visible}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* <ActivityIndicator size="large" color="#007bff" /> */}
          <LottieView
            autoPlay={true}
            loop={true}
            source={bounce_ball}
            style={styles.loader}
          />
          <Text style={styles.modalText}>{message}</Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalText: {
    marginTop: 10,
    fontSize: 16,
    color: '#495057',
  },
  loader: {
    width: 200,
    height: 200,
    backgroundColor: 'white'
  }
});

export default LoadingModal; 