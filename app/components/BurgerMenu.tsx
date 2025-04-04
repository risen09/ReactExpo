import React from 'react';
import { 
  View, 
  Text, 
  Modal, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView,
  Animated,
  Dimensions,
  ScrollView
} from 'react-native';
import { 
  GraduationCap,
  BookOpen, 
  TrendingUp,
  Award, 
  Bookmark,
  Calendar,
  Bell,
  User, 
  Settings, 
  HelpCircle, 
  LogOut, 
  X,
} from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuth } from '../hooks/useAuth';

const { width, height } = Dimensions.get('window');

interface BurgerMenuProps {
  visible: boolean;
  onClose: () => void;
}

const COLORS = {
  primary: '#5B67CA',
  secondary: '#43C0B4',
  accent1: '#F98D51',
  background: '#F2F5FF',
  card: '#FFFFFF',
  text: '#25335F',
  textSecondary: '#7F8BB7',
  border: '#EAEDF5'
};

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  color?: string;
  bgColor?: string;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

const BurgerMenu: React.FC<BurgerMenuProps> = ({ visible, onClose }) => {
  const { logout } = useAuth();
  const slideAnim = React.useRef(new Animated.Value(-width)).current;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.5,
          duration: 300,
          useNativeDriver: true
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -width,
          duration: 300,
          useNativeDriver: true
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true
        })
      ]).start();
    }
  }, [visible, slideAnim, fadeAnim]);

  const handleLogout = async () => {
    onClose();
    await logout();
  };

  const menuSections: MenuSection[] = [
    {
      title: 'Образование',
      items: [
        {
          icon: <GraduationCap size={24} color="#FFFFFF" />,
          label: 'Экзамены',
          onPress: () => {
            onClose();
            router.push('/(tabs)/subjects');
          },
          bgColor: '#5B67CA'
        },
        {
          icon: <TrendingUp size={24} color="#FFFFFF" />,
          label: 'Прогресс',
          onPress: () => {
            onClose();
            router.push('/(tabs)/progress');
          },
          bgColor: '#43C0B4'
        },
        {
          icon: <Award size={24} color="#FFFFFF" />,
          label: 'Достижения',
          onPress: () => {
            onClose();
            router.push('/(tabs)/achievements');
          },
          bgColor: '#F98D51'
        },
        {
          icon: <Bookmark size={24} color="#FFFFFF" />,
          label: 'Сохраненные уроки',
          onPress: () => {
            onClose();
            router.push('/(tabs)/lessons');
          },
          bgColor: '#5B67CA'
        },
      ]
    },
    {
      title: 'Организация',
      items: [
        {
          icon: <Calendar size={24} color="#FFFFFF" />,
          label: 'Календарь',
          onPress: () => {
            onClose();
            router.push('/(tabs)');
          },
          bgColor: '#F98D51'
        },
        {
          icon: <Bell size={24} color="#FFFFFF" />,
          label: 'Уведомления',
          onPress: () => {
            onClose();
            router.push('/(tabs)');
          },
          bgColor: '#43C0B4'
        },
      ]
    },
    {
      title: 'Аккаунт',
      items: [
        {
          icon: <Settings size={24} color="#FFFFFF" />,
          label: 'Настройки',
          onPress: () => {
            onClose();
            router.push('/(tabs)/profile');
          },
          bgColor: '#5B67CA'
        },
        {
          icon: <HelpCircle size={24} color="#FFFFFF" />,
          label: 'Помощь',
          onPress: () => {
            onClose();
            router.push('/(tabs)');
          },
          bgColor: '#43C0B4'
        },
        {
          icon: <LogOut size={24} color="#FFFFFF" />,
          label: 'Выйти',
          onPress: handleLogout,
          color: '#EC575B',
          bgColor: '#EC575B'
        },
      ]
    }
  ];

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <Animated.View 
          style={[
            styles.backdrop, 
            { opacity: fadeAnim }
          ]} 
        >
          <TouchableOpacity 
            style={{ flex: 1 }} 
            activeOpacity={1} 
            onPress={onClose} 
          />
        </Animated.View>

        <Animated.View 
          style={[
            styles.menuContainer,
            { transform: [{ translateX: slideAnim }] }
          ]}
        >
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Меню</Text>
              <TouchableOpacity 
                style={styles.closeButton} 
                onPress={onClose}
              >
                <X size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
              <View style={styles.menuSections}>
                {menuSections.map((section, sectionIndex) => (
                  <View key={sectionIndex} style={styles.section}>
                    <Text style={styles.sectionTitle}>{section.title}</Text>
                    
                    {section.items.map((item, itemIndex) => (
                      <TouchableOpacity
                        key={itemIndex}
                        style={styles.menuItem}
                        onPress={item.onPress}
                      >
                        <View style={[styles.iconContainer, { backgroundColor: item.bgColor }]}>
                          {item.icon}
                        </View>
                        <Text style={[
                          styles.menuItemLabel, 
                          item.color ? { color: item.color } : null
                        ]}>
                          {item.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ))}
                <View style={styles.bottomPadding} />
              </View>
            </ScrollView>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000',
  },
  menuContainer: {
    width: width * 0.75,
    maxWidth: 300,
    backgroundColor: COLORS.card,
    height: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  safeArea: {
    flex: 1,
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
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  closeButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  menuSections: {
    paddingVertical: 16,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textSecondary,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginBottom: 4,
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuItemLabel: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
  },
  bottomPadding: {
    height: 50,
  },
});

export default BurgerMenu; 