import React, { useState, useEffect } from 'react';
import { Modal, View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';
import bounce_ball from '@/assets/animations/loading/bounce_ball.json';
import atom from '@/assets/animations/loading/atom.json'
import sine_net from '@/assets/animations/loading/sine_net.json'
import dna from '@/assets/animations/loading/dna.json'

interface LoadingModalProps {
  visible: boolean;
  message: string;
}

const funFacts = [
  {
    category: 'Physics',
    facts: [
      'Вы знали? Свет движется со скоростью 299 792 458 метров в секунду!',
      'Молния в пять раз горячее поверхности Солнца!',
      'Человеческое тело содержит достаточно углерода, чтобы сделать 900 карандашей!'
    ]
  },
  {
    category: 'Math',
    facts: [
      'Ноль — единственное число, которое нельзя представить римскими цифрами!',
      '«Джиффи» — это реальная единица времени: 1/100 секунды!',
      'Символ деления (÷) называется обелусом!'
    ]
  },
  {
    category: 'History',
    facts: [
      'Великая Китайская стена не видна из космоса невооруженным глазом!',
      'Самая короткая война в истории была между Британией и Занзибаром в 1896 году — она длилась всего 38 минут!',
      'Первым программистом была женщина по имени Ада Лавлейс!'
    ]
  }
];

const animations = [
  { source: bounce_ball, name: 'Bouncing Ball' },
  { source: atom, name: 'Atom' },
  { source: dna, name: 'DNA' },
];

const LoadingModal: React.FC<LoadingModalProps> = ({ visible, message }) => {
  const [currentFact, setCurrentFact] = useState('');
  const [currentAnimation, setCurrentAnimation] = useState(animations[0]);

  useEffect(() => {
    if (visible) {
      // Select random category and fact
      const randomCategory = funFacts[Math.floor(Math.random() * funFacts.length)];
      const randomFact = randomCategory.facts[Math.floor(Math.random() * randomCategory.facts.length)];
      setCurrentFact(randomFact);

      // Select random animation
      const randomAnimation = animations[Math.floor(Math.random() * animations.length)];
      setCurrentAnimation(randomAnimation);
    }
  }, [visible]);

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
            source={currentAnimation.source}
            style={styles.loader}
          />
          <Text style={styles.funFact}>{currentFact}</Text>
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
    maxWidth: '80%',
  },
  modalText: {
    marginTop: 10,
    fontSize: 16,
    color: '#495057',
    textAlign: 'center',
  },
  funFact: {
    marginTop: 10,
    fontSize: 14,
    color: '#007bff',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  loader: {
    width: 200,
    height: 200,
    backgroundColor: 'white'
  }
});

export default LoadingModal; 