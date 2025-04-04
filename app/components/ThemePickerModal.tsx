import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Animated,
} from 'react-native';
import { X, Check, Sun, Moon, Smartphone } from 'lucide-react-native';

interface ThemeOption {
  id: string;
  name: string;
  icon: React.ReactNode;
}

interface ThemePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (theme: string) => void;
  selectedTheme: string;
}

const COLORS = {
  primary: '#5B67CA',
  secondary: '#43C0B4',
  accent1: '#F98D51',
  background: '#F2F5FF',
  card: '#FFFFFF',
  text: '#25335F',
  textSecondary: '#7F8BB7',
  border: '#EAEDF5',
};

const ThemePickerModal: React.FC<ThemePickerModalProps> = ({
  visible,
  onClose,
  onSelect,
  selectedTheme,
}) => {
  const scaleAnim = React.useRef(new Animated.Value(0)).current;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          friction: 8,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.5,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, scaleAnim, fadeAnim]);

  const themes: ThemeOption[] = [
    {
      id: 'light',
      name: 'Светлая',
      icon: <Sun size={24} color={selectedTheme === 'light' ? "#FFFFFF" : COLORS.text} />,
    },
    {
      id: 'dark',
      name: 'Темная',
      icon: <Moon size={24} color={selectedTheme === 'dark' ? "#FFFFFF" : COLORS.text} />,
    },
    {
      id: 'system',
      name: 'Системная',
      icon: <Smartphone size={24} color={selectedTheme === 'system' ? "#FFFFFF" : COLORS.text} />,
    },
  ];

  const handleSelect = (theme: string) => {
    onSelect(theme);
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent={true} animationType="none" onRequestClose={onClose}>
      <View style={styles.container}>
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
        </Animated.View>

        <Animated.View
          style={[
            styles.modalContainer,
            {
              transform: [
                { scale: scaleAnim },
              ],
            },
          ]}
        >
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Выбор темы</Text>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <X size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.optionsContainer}>
              {themes.map((theme) => (
                <TouchableOpacity
                  key={theme.id}
                  style={[
                    styles.optionItem,
                    selectedTheme === theme.id && styles.selectedOption,
                  ]}
                  onPress={() => handleSelect(theme.id)}
                >
                  <View style={styles.optionContent}>
                    <View style={styles.iconContainer}>
                      {theme.icon}
                    </View>
                    <Text
                      style={[
                        styles.optionText,
                        selectedTheme === theme.id && styles.selectedOptionText,
                      ]}
                    >
                      {theme.name}
                    </Text>
                  </View>
                  
                  {selectedTheme === theme.id && (
                    <View style={styles.checkIcon}>
                      <Check size={20} color="#FFFFFF" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.hint}>
              Выберите предпочитаемую тему оформления приложения
            </Text>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000',
  },
  modalContainer: {
    width: '85%',
    maxWidth: 340,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  safeArea: {
    flex: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  closeButton: {
    padding: 4,
  },
  optionsContainer: {
    padding: 16,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: COLORS.background,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(91, 103, 202, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  selectedOption: {
    backgroundColor: COLORS.primary,
  },
  optionText: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
  },
  selectedOptionText: {
    color: '#FFFFFF',
  },
  checkIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hint: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
});

export default ThemePickerModal; 