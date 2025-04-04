import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  Animated, 
  Dimensions,
  ScrollView
} from 'react-native';
import { router } from 'expo-router';
import { 
  Settings, 
  Award, 
  HelpCircle, 
  BookMarked, 
  LogOut,
  X,
  Trophy,
  Calendar,
  GraduationCap,
  Bell
} from 'lucide-react-native';

interface MenuItem {
  icon: JSX.Element;
  title: string;
  onPress: () => void;
  color?: string;
  bgColor?: string;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

interface BurgerMenuProps {
  visible: boolean;
  onClose: () => void;
}

// Новая цветовая палитра
const COLORS = {
  primary: '#5B67CA',     // Основной синий/фиолетовый
  secondary: '#43C0B4',   // Бирюзовый
  accent1: '#F98D51',     // Оранжевый
  accent2: '#EC575B',     // Красный
  accent3: '#FFCA42',     // Желтый
  background: '#F2F5FF',  // Светлый фон
  card: '#FFFFFF',        // Белый для карточек
  text: '#25335F',        // Основной текст
  textSecondary: '#7F8BB7',  // Вторичный текст
  border: '#EAEDF5'       // Граница
};

const BurgerMenu: React.FC<BurgerMenuProps> = ({ visible, onClose }) => {
  const [animation] = useState(new Animated.Value(0));
  const screenHeight = Dimensions.get('window').height;

  React.useEffect(() => {
    if (visible) {
      Animated.timing(animation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(animation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, animation]);

  const translateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [-screenHeight, 0],
  });

  const menuSections: MenuSection[] = [
    {
      title: "Образование",
      items: [
        {
          icon: <GraduationCap size={24} color="#FFFFFF" />,
          title: 'Экзамены',
          onPress: () => {
            onClose();
            router.navigate('/exams' as any);
          },
          color: COLORS.primary,
          bgColor: COLORS.primary
        },
        {
          icon: <Trophy size={24} color="#FFFFFF" />,
          title: 'Прогресс',
          onPress: () => {
            onClose();
            router.navigate('/(tabs)/progress' as any);
          },
          color: COLORS.secondary,
          bgColor: COLORS.secondary
        },
        {
          icon: <Award size={24} color="#FFFFFF" />,
          title: 'Достижения',
          onPress: () => {
            onClose();
            router.navigate('/achievements' as any);
          },
          color: COLORS.accent1,
          bgColor: COLORS.accent1
        },
        {
          icon: <BookMarked size={24} color="#FFFFFF" />,
          title: 'Сохраненные уроки',
          onPress: () => {
            onClose();
            router.navigate('/saved-lessons' as any);
          },
          color: COLORS.primary,
          bgColor: COLORS.primary
        },
      ]
    },
    {
      title: "Организация",
      items: [
        {
          icon: <Calendar size={24} color="#FFFFFF" />,
          title: 'Календарь',
          onPress: () => {
            onClose();
            router.navigate('/calendar' as any);
          },
          color: COLORS.accent3,
          bgColor: COLORS.accent3
        },
        {
          icon: <Bell size={24} color="#FFFFFF" />,
          title: 'Напоминания',
          onPress: () => {
            onClose();
            router.navigate('/reminders' as any);
          },
          color: COLORS.secondary,
          bgColor: COLORS.secondary
        },
      ]
    },
    {
      title: "Аккаунт",
      items: [
        {
          icon: <Settings size={24} color="#FFFFFF" />,
          title: 'Настройки',
          onPress: () => {
            onClose();
            router.navigate('/settings' as any);
          },
          color: COLORS.textSecondary,
          bgColor: COLORS.textSecondary
        },
        {
          icon: <HelpCircle size={24} color="#FFFFFF" />,
          title: 'Помощь',
          onPress: () => {
            onClose();
            router.navigate('/help' as any);
          },
          color: COLORS.primary,
          bgColor: COLORS.primary
        },
        {
          icon: <LogOut size={24} color="#FFFFFF" />,
          title: 'Выйти',
          onPress: () => {
            onClose();
            // Логика выхода из аккаунта
          },
          color: COLORS.accent2,
          bgColor: COLORS.accent2
        },
      ]
    },
  ];

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View 
          style={[
            styles.menuContainer,
            { transform: [{ translateY }] }
          ]}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Меню</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.divider} />
          
          <ScrollView 
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            {menuSections.map((section, sectionIndex) => (
              <View key={sectionIndex} style={styles.section}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                
                {section.items.map((item, itemIndex) => (
                  <TouchableOpacity
                    key={itemIndex}
                    style={[
                      styles.menuItem,
                      item.title === 'Выйти' && styles.logoutItem
                    ]}
                    onPress={item.onPress}
                  >
                    <View style={[styles.iconContainer, { backgroundColor: item.bgColor }]}>
                      {item.icon}
                    </View>
                    <Text 
                      style={[
                        styles.menuItemText,
                        item.title === 'Выйти' ? styles.logoutText : { color: COLORS.text }
                      ]}
                    >
                      {item.title}
                    </Text>
                  </TouchableOpacity>
                ))}
                
                {sectionIndex < menuSections.length - 1 && (
                  <View style={styles.sectionDivider} />
                )}
              </View>
            ))}
            <View style={styles.scrollBottomPadding} />
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(37, 51, 95, 0.5)',
    justifyContent: 'flex-end',
  },
  menuContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  closeButton: {
    padding: 6,
    backgroundColor: '#F2F5FF',
    borderRadius: 12,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 16,
    paddingLeft: 8,
    letterSpacing: -0.3,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginTop: 16,
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 8,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  logoutItem: {
    marginTop: 12,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  logoutText: {
    color: COLORS.accent2,
  },
  scrollView: {
    flexGrow: 0,
  },
  scrollBottomPadding: {
    height: 32,
  },
});

export default BurgerMenu; 