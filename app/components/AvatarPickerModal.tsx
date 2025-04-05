import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  SafeAreaView
} from 'react-native';
import { X } from 'lucide-react-native';

// Получаем ширину экрана для расчета размера аватаров
const { width } = Dimensions.get('window');
const itemSize = (width - 80) / 3;

interface AvatarPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (avatarUri: string) => void;
  onSelectFromGallery: () => void;
}

// Обновляем массив аватаров, чтобы использовать изображения из папки images
const avatars = [
  { key: 'photo_2025-04-05_15-03-42.jpg', source: require('../../images/photo_2025-04-05_15-03-42.jpg') },
  { key: 'photo_2025-04-05_15-04-48.jpg', source: require('../../images/photo_2025-04-05_15-04-48.jpg') },
  { key: 'photo_2025-04-05_15-20-56.jpg', source: require('../../images/photo_2025-04-05_15-20-56.jpg') },
];

const AvatarPickerModal: React.FC<AvatarPickerModalProps> = ({ visible, onClose, onSelect, onSelectFromGallery }) => {
  const handleSelectAvatar = (avatar: any) => {
    // Вместо создания строки URI, передаем источник изображения (number token)
    console.log('Выбран аватар:', avatar.key);
    onSelect(avatar.key);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Выберите аватар</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={24} color="#25335F" />
            </TouchableOpacity>
          </View>
          
          <ScrollView contentContainerStyle={styles.avatarsContainer}>
            {avatars.map((avatar) => (
              <TouchableOpacity
                key={avatar.key}
                style={styles.avatarItem}
                onPress={() => handleSelectAvatar(avatar)}
              >
                <Image source={avatar.source} style={styles.avatar} />
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          <TouchableOpacity style={styles.galleryButton} onPress={onSelectFromGallery}>
            <Text style={styles.galleryButtonText}>Выбрать из галереи</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#25335F',
  },
  closeButton: {
    padding: 4,
  },
  avatarsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 16,
  },
  avatarItem: {
    width: itemSize,
    height: itemSize,
    margin: 5,
    borderRadius: itemSize / 2,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#EAEDF5',
  },
  avatar: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  galleryButton: {
    backgroundColor: '#5B67CA',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  galleryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AvatarPickerModal;