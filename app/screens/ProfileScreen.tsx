import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Switch,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { 
  User,
  Settings,
  LogOut,
  Edit2,
  Moon,
  Sun,
  Bell,
  Volume2,
  ChevronRight,
  Globe,
  Heart,
  Star,
  Shield,
  HelpCircle,
  BookOpen
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { usePersonalityTest } from '../hooks/usePersonalityTest';
import { mbtiDescriptions } from '../types/personalityTest';
import { LinearGradient } from 'expo-linear-gradient';

// Общая цветовая палитра приложения
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

// API конфигурация
const API_BASE_URL = 'https://j0cl9aplcsh5.share.zrok.io';

interface ProfileSettings {
  theme: 'light' | 'dark';
  language: 'ru' | 'en';
  notifications: boolean;
  soundEffects: boolean;
}

const ProfileScreen: React.FC = () => {
  const [name, setName] = useState('Александр');
  const [email, setEmail] = useState('alexander@example.com');
  const [avatar, setAvatar] = useState('https://i.pravatar.cc/150?img=3');
  const [settings, setSettings] = useState<ProfileSettings>({
    theme: 'light',
    language: 'ru',
    notifications: true,
    soundEffects: true,
  });
  const [personalityType, setPersonalityType] = useState<string | null>(null);
  const [personalityDescription, setPersonalityDescription] = useState<string | null>(null);

  const { getUserTestResults, isLoading, error } = usePersonalityTest();
  
  // Fetch user's personality type using our custom hook
  useEffect(() => {
    const fetchPersonalityData = async () => {
      try {
        const result = await getUserTestResults('user123');
        
        if (result) {
          setPersonalityType(result.personalityType);
          // Get description from our type descriptions
          setPersonalityDescription(mbtiDescriptions[result.personalityType] || 'Описание недоступно');
        }
      } catch (error) {
        console.error('Error fetching personality type:', error);
      }
    };
    
    fetchPersonalityData();
  }, []);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled) {
        setAvatar(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось загрузить изображение');
    }
  };

  const toggleSetting = (setting: keyof ProfileSettings) => {
    if (typeof settings[setting] === 'boolean') {
      setSettings({
        ...settings,
        [setting]: !settings[setting],
      });
    }
  };

  const languages = [
    { id: 'ru', name: 'Русский' },
    { id: 'en', name: 'English' },
  ];

  const themes = [
    { id: 'light', name: 'Светлая', icon: <Sun size={22} color={settings.theme === 'light' ? COLORS.primary : COLORS.textSecondary} /> },
    { id: 'dark', name: 'Темная', icon: <Moon size={22} color={settings.theme === 'dark' ? COLORS.primary : COLORS.textSecondary} /> },
  ];
  
  const handleLogout = () => {
    Alert.alert(
      "Выход из аккаунта",
      "Вы уверены, что хотите выйти?",
      [
        {
          text: "Отмена",
          style: "cancel"
        },
        {
          text: "Выйти",
          onPress: () => {
            // Имитация выхода
            router.replace('/login');
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={[COLORS.primary, '#424D9D']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: avatar }} style={styles.avatar} />
            <TouchableOpacity style={styles.editAvatarButton} onPress={pickImage}>
              <Edit2 size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{name}</Text>
          <Text style={styles.userEmail}>{email}</Text>
        </View>
      </LinearGradient>

      <View style={styles.settingsContainer}>
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Личный профиль</Text>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingIconContainer}>
              <User size={20} color={COLORS.primary} />
            </View>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingText}>Редактировать профиль</Text>
            </View>
            <ChevronRight size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
          
          {/* Personality Test Section */}
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => router.push('/personality-test')}
          >
            <View style={[styles.settingIconContainer, { backgroundColor: '#EEF0FF' }]}>
              <Star size={20} color={COLORS.primary} />
            </View>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingText}>Тест личности MBTI</Text>
              {personalityType && (
                <Text style={styles.settingSubtext}>Ваш тип: {personalityType}</Text>
              )}
            </View>
            <ChevronRight size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => router.push('/achievements' as any)}
          >
            <View style={[styles.settingIconContainer, { backgroundColor: '#FFF8E8' }]}>
              <Star size={20} color={COLORS.accent3} />
            </View>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingText}>Мои достижения</Text>
            </View>
            <ChevronRight size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={[styles.settingIconContainer, { backgroundColor: '#FFF0E8' }]}>
              <BookOpen size={20} color={COLORS.accent1} />
            </View>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingText}>Мои курсы</Text>
            </View>
            <ChevronRight size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Настройки приложения</Text>
          
          {/* Theme Selection */}
          <View style={styles.settingItem}>
            <View style={[styles.settingIconContainer, { backgroundColor: '#E6F8F6' }]}>
              <Settings size={20} color={COLORS.secondary} />
            </View>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingText}>Тема оформления</Text>
            </View>
            <View style={styles.themeToggleContainer}>
              {themes.map((theme) => (
                <TouchableOpacity
                  key={theme.id}
                  style={[
                    styles.themeButton,
                    settings.theme === theme.id && styles.selectedThemeButton,
                  ]}
                  onPress={() => setSettings({ ...settings, theme: theme.id as 'light' | 'dark' })}
                >
                  {theme.icon}
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          {/* Language Selection */}
          <View style={styles.settingItem}>
            <View style={[styles.settingIconContainer, { backgroundColor: '#EEF0FF' }]}>
              <Globe size={20} color={COLORS.primary} />
            </View>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingText}>Язык интерфейса</Text>
              <Text style={styles.settingSubtext}>
                {languages.find(l => l.id === settings.language)?.name}
              </Text>
            </View>
            <ChevronRight size={20} color={COLORS.textSecondary} />
          </View>
          
          {/* Notification Toggle */}
          <View style={styles.settingItem}>
            <View style={[styles.settingIconContainer, { backgroundColor: '#FFF0E8' }]}>
              <Bell size={20} color={COLORS.accent1} />
            </View>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingText}>Уведомления</Text>
            </View>
            <Switch
              value={settings.notifications}
              onValueChange={() => toggleSetting('notifications')}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
              thumbColor={'#FFFFFF'}
              ios_backgroundColor={COLORS.border}
            />
          </View>
          
          {/* Sound Toggle */}
          <View style={styles.settingItem}>
            <View style={[styles.settingIconContainer, { backgroundColor: '#FFF8E8' }]}>
              <Volume2 size={20} color={COLORS.accent3} />
            </View>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingText}>Звуковые эффекты</Text>
            </View>
            <Switch
              value={settings.soundEffects}
              onValueChange={() => toggleSetting('soundEffects')}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
              thumbColor={'#FFFFFF'}
              ios_backgroundColor={COLORS.border}
            />
          </View>
        </View>
        
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>О приложении</Text>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={[styles.settingIconContainer, { backgroundColor: '#EEF0FF' }]}>
              <HelpCircle size={20} color={COLORS.primary} />
            </View>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingText}>Помощь и поддержка</Text>
            </View>
            <ChevronRight size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={[styles.settingIconContainer, { backgroundColor: '#E6F8F6' }]}>
              <Shield size={20} color={COLORS.secondary} />
            </View>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingText}>Политика конфиденциальности</Text>
            </View>
            <ChevronRight size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <LogOut size={20} color={COLORS.accent2} />
          <Text style={styles.logoutText}>Выйти из аккаунта</Text>
        </TouchableOpacity>
        
        <Text style={styles.versionText}>Версия 1.0.0</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  editAvatarButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  settingsContainer: {
    padding: 20,
  },
  settingsSection: {
    marginBottom: 24,
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 20,
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    backgroundColor: '#F0F3FF',
  },
  settingTextContainer: {
    flex: 1,
  },
  settingText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  settingSubtext: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  themeToggleContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.border,
    borderRadius: 20,
    padding: 4,
  },
  themeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedThemeButton: {
    backgroundColor: '#FFFFFF',
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(236, 87, 91, 0.08)',
    padding: 16,
    borderRadius: 16,
    marginVertical: 16,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.accent2,
    marginLeft: 10,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 8,
    marginBottom: 30,
  },
});

export default ProfileScreen; 