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
  ActivityIndicator,
} from 'react-native';
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
  BookOpen,
  Mail,
  Calendar,
  AtSign,
  Lock,
  Camera,
  Brain,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { usePersonalityTest } from '../hooks/usePersonalityTest';
import { mbtiDescriptions } from '../types/personalityTest';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../hooks/useAuth';
import GenderPickerModal from '../components/GenderPickerModal';
import LanguagePickerModal from '../components/LanguagePickerModal';
import ThemePickerModal from '../components/ThemePickerModal';
import LogoutConfirmModal from '../components/LogoutConfirmModal';

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
  theme: string;
  language: string;
  notifications: boolean;
  soundEffects: boolean;
}

const ProfileScreen: React.FC = () => {
  const { user, logout, updateProfile, isLoading, error } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nickname: '',
    name: '',
    email: '',
    age: '',
    gender: '',
    personalityType: '',
  });
  const [avatar, setAvatar] = useState<string | null>(null);
  const [settings, setSettings] = useState<ProfileSettings>({
    theme: 'light',
    language: 'ru',
    notifications: true,
    soundEffects: true,
  });
  
  const { getUserTestResults } = usePersonalityTest();
  
  const [image, setImage] = useState<string | null>(null);
  const [showGenderPicker, setShowGenderPicker] = useState(false);
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  useEffect(() => {
    if (user) {
      console.log('=== PROFILE DEBUG ===');
      console.log('User data:', JSON.stringify({
        ...user,
        email: user.email ? `${user.email.substring(0, 3)}***` : null // маскируем email для безопасности
      }, null, 2));
      console.log('Personality type:', user.personalityType || 'Not set');
      
      setFormData({
        nickname: user.nickname || '',
        name: user.name || '',
        email: user.email || '',
        age: user.age ? String(user.age) : '',
        gender: user.gender || '',
        personalityType: user.personalityType || '',
      });
      setAvatar(user.avatar || null);
      setImage(user.profileImage || null);
      
      if (user.settings) {
        setSettings(user.settings);
      }
      
      console.log('FormData after update:', JSON.stringify({
        ...formData, 
        email: formData.email ? `${formData.email.substring(0, 3)}***` : null
      }, null, 2));
      console.log('personalityType in formData:', formData.personalityType || 'Not set');
      console.log('=== END PROFILE DEBUG ===');
    }
  }, [user]);

  const getAgeText = () => {
    if (!formData.age || formData.age === '0') return 'Не указан';
    return `${formData.age} лет`;
  };

  const handleSaveProfile = async () => {
    // Валидация обязательных полей
    if (!formData.nickname || !formData.name || !formData.email) {
      Alert.alert('Ошибка', 'Пожалуйста, заполните обязательные поля: никнейм, имя и email');
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Приводим gender к нужному типу
      const gender = (
        formData.gender === 'male' || 
        formData.gender === 'female' || 
        formData.gender === 'other'
      ) 
        ? formData.gender as 'male' | 'female' | 'other' 
        : 'other';
        
      await updateProfile({
        name: formData.name,
        email: formData.email,
        nickname: formData.nickname,
        personalityType: formData.personalityType,
        age: formData.age ? parseInt(formData.age, 10) : 0,
        gender,
        avatar: avatar || undefined,
        profileImage: image || undefined,
        settings,
      });
      
      Alert.alert('Успешно', 'Профиль успешно обновлен');
      setIsEditing(false); // Выходим из режима редактирования после сохранения
    } catch (err) {
      Alert.alert('Ошибка', error || 'Не удалось обновить профиль. Попробуйте позже.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    // Возвращаем оригинальные данные
    if (user) {
      setFormData({
        nickname: user.nickname || '',
        name: user.name || '',
        email: user.email || '',
        age: user.age ? String(user.age) : '',
        gender: user.gender || '',
        personalityType: user.personalityType || '',
      });
      setAvatar(user.avatar || null);
    }
    setIsEditing(false);
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Ошибка', 'Для доступа к галерее необходимо предоставить разрешение');
      return;
    }
    
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    
    if (!result.canceled) {
      const newAvatar = result.assets[0].uri;
      setAvatar(newAvatar);
      
      if (!isEditing) {
        // Если не в режиме редактирования, сразу сохраняем аватар
        await updateProfile({ avatar: newAvatar });
      }
    }
  };

  const toggleSetting = (setting: keyof ProfileSettings) => {
    if (typeof settings[setting] === 'boolean') {
      setSettings(prev => ({
        ...prev,
        [setting]: !prev[setting],
      }));
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
  
  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/(auth)/login');
    } catch (err) {
      Alert.alert('Ошибка', 'Не удалось выйти из аккаунта. Попробуйте позже.');
    }
  };

  // Отдельная функция для обработки нажатия на тег типа личности в шапке
  const handleHeaderPersonalityTagPress = () => {
    // В шапке показывается тип только если он уже определен,
    // поэтому всегда переходим на страницу результатов
    if (formData.personalityType) {
      router.push(`/test-result?type=${formData.personalityType}`);
    }
  };

  // Функция для навигации к тесту личности
  const navigateToPersonalityTest = () => {
    router.push('/personality-test');
  };

  // Функция для навигации к результатам теста
  const navigateToTestResults = () => {
    if (formData.personalityType) {
      router.push(`/test-result?type=${formData.personalityType}`);
    }
  };

  const getPersonalityTypeName = () => {
    // Расширенный список типов личности для правильного отображения
    const types: {[key: string]: string} = {
      // Основные 4 типа
      'analytical': 'Аналитический тип',
      'creative': 'Креативный тип',
      'social': 'Социальный тип',
      'practical': 'Практический тип',
      
      // MBTI типы (16 типов)
      'INTJ': 'Стратег (INTJ)',
      'INTP': 'Мыслитель (INTP)',
      'ENTJ': 'Командир (ENTJ)',
      'ENTP': 'Изобретатель (ENTP)',
      'INFJ': 'Советник (INFJ)',
      'INFP': 'Посредник (INFP)',
      'ENFJ': 'Протагонист (ENFJ)',
      'ENFP': 'Борец (ENFP)',
      'ISTJ': 'Логистик (ISTJ)',
      'ISFJ': 'Защитник (ISFJ)',
      'ESTJ': 'Руководитель (ESTJ)',
      'ESFJ': 'Консул (ESFJ)',
      'ISTP': 'Виртуоз (ISTP)',
      'ISFP': 'Артист (ISFP)',
      'ESTP': 'Делец (ESTP)',
      'ESFP': 'Развлекатель (ESFP)',
    };
    
    // Проверяем, есть ли тип в списке известных типов
    if (formData.personalityType && types[formData.personalityType]) {
      return types[formData.personalityType];
    }
    
    // Если точного совпадения нет, возвращаем сам тип (чтобы ничего не потерялось)
    return formData.personalityType ? `Тип: ${formData.personalityType}` : 'Не определен';
  };

  const getGenderText = () => {
    if (formData.gender === 'male') return 'Мужской';
    if (formData.gender === 'female') return 'Женский';
    return 'Не указан';
  };

  const getLanguageName = () => {
    const languages: {[key: string]: string} = {
      'ru': 'Русский',
      'en': 'English',
      'es': 'Español',
      'fr': 'Français',
      'de': 'Deutsch',
    };
    
    return languages[settings.language] || 'Русский';
  };

  const getThemeName = () => {
    const themes: {[key: string]: string} = {
      'light': 'Светлая',
      'dark': 'Темная',
      'system': 'Системная',
    };
    
    return themes[settings.theme] || 'Светлая';
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Загрузка профиля...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Пользователь не авторизован</Text>
        <TouchableOpacity 
          style={styles.loginButton}
          onPress={() => router.replace('/(auth)/login')}
        >
          <Text style={styles.loginButtonText}>Войти</Text>
        </TouchableOpacity>
      </View>
    );
  }

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
            {image ? (
              <Image 
                source={{ uri: image }} 
                style={styles.avatar} 
              />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <User size={60} color={COLORS.textSecondary} />
              </View>
            )}
            <TouchableOpacity style={styles.editAvatarButton} onPress={pickImage}>
              <Camera size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{formData.name || 'Ваше имя'}</Text>
          <Text style={styles.userNickname}>@{formData.nickname || 'nickname'}</Text>
          {formData.personalityType && (
            <TouchableOpacity style={styles.personalityTypeTag} onPress={handleHeaderPersonalityTagPress}>
              <Brain size={16} color="#FFFFFF" style={styles.personalityTypeIcon} />
              <Text style={styles.personalityTypeText}>{getPersonalityTypeName()}</Text>
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      <View style={styles.settingsContainer}>
        {isEditing ? (
          <View style={styles.editFormContainer}>
            <Text style={styles.editFormTitle}>Редактирование профиля</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Имя</Text>
              <View style={styles.inputContainer}>
                <User size={18} color={COLORS.textSecondary} style={styles.inputIcon} />
                <TextInput 
                  style={styles.input}
                  value={formData.name}
                  onChangeText={(text) => setFormData({...formData, name: text})}
                  placeholder="Введите ваше имя"
                />
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Никнейм</Text>
              <View style={styles.inputContainer}>
                <AtSign size={18} color={COLORS.textSecondary} style={styles.inputIcon} />
                <TextInput 
                  style={styles.input}
                  value={formData.nickname}
                  onChangeText={(text) => setFormData({...formData, nickname: text})}
                  placeholder="Введите никнейм"
                />
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <View style={styles.inputContainer}>
                <Mail size={18} color={COLORS.textSecondary} style={styles.inputIcon} />
                <TextInput 
                  style={styles.input}
                  value={formData.email}
                  onChangeText={(text) => setFormData({...formData, email: text})}
                  placeholder="Введите email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Возраст</Text>
              <View style={styles.inputContainer}>
                <Calendar size={18} color={COLORS.textSecondary} style={styles.inputIcon} />
                <TextInput 
                  style={styles.input}
                  value={formData.age}
                  onChangeText={(text) => setFormData({...formData, age: text})}
                  placeholder="Введите возраст"
                  keyboardType="number-pad"
                />
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Пол</Text>
              <View style={styles.genderContainer}>
                <TouchableOpacity 
                  style={[
                    styles.genderOption, 
                    formData.gender === 'male' && styles.activeGenderOption
                  ]}
                  onPress={() => setFormData({...formData, gender: 'male'})}
                >
                  <Text style={[
                    styles.genderText,
                    formData.gender === 'male' && styles.activeGenderText
                  ]}>Мужской</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[
                    styles.genderOption, 
                    formData.gender === 'female' && styles.activeGenderOption
                  ]}
                  onPress={() => setFormData({...formData, gender: 'female'})}
                >
                  <Text style={[
                    styles.genderText,
                    formData.gender === 'female' && styles.activeGenderText
                  ]}>Женский</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[
                    styles.genderOption, 
                    formData.gender === 'other' && styles.activeGenderOption
                  ]}
                  onPress={() => setFormData({...formData, gender: 'other'})}
                >
                  <Text style={[
                    styles.genderText,
                    formData.gender === 'other' && styles.activeGenderText
                  ]}>Другой</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.editButtonsContainer}>
              <TouchableOpacity 
                style={[styles.editButton, styles.editCancelButton]}
                onPress={handleCancelEdit}
              >
                <Text style={styles.editCancelButtonText}>Отмена</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.editButton, styles.editSaveButton]}
                onPress={handleSaveProfile}
              >
                <Text style={styles.editSaveButtonText}>Сохранить</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <>
            <View style={styles.settingsSection}>
              <Text style={styles.sectionTitle}>Личный профиль</Text>
              
              <TouchableOpacity 
                style={styles.settingItem}
                onPress={() => setIsEditing(true)}
              >
                <View style={styles.settingIconContainer}>
                  <User size={20} color={COLORS.primary} />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingText}>Редактировать профиль</Text>
                </View>
                <ChevronRight size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.settingItem}
                onPress={() => router.push('/change-password')}
              >
                <View style={[styles.settingIconContainer, { backgroundColor: '#EEF0FF' }]}>
                  <Lock size={20} color={COLORS.primary} />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingText}>Изменить пароль</Text>
                </View>
                <ChevronRight size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
              
              <View style={styles.settingItem}>
                <View style={[styles.settingIconContainer, { backgroundColor: '#E8F0FB' }]}>
                  <AtSign size={20} color={COLORS.primary} />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingText}>Никнейм</Text>
                  <Text style={styles.settingSubtext}>@{formData.nickname}</Text>
                </View>
              </View>
              
              <View style={styles.settingItem}>
                <View style={[styles.settingIconContainer, { backgroundColor: '#FFF0E8' }]}>
                  <Mail size={20} color={COLORS.accent1} />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingText}>Email</Text>
                  <Text style={styles.settingSubtext}>{formData.email}</Text>
                </View>
              </View>
              
              <View style={styles.settingItem}>
                <View style={[styles.settingIconContainer, { backgroundColor: '#E6F8F6' }]}>
                  <Calendar size={20} color={COLORS.secondary} />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingText}>Возраст</Text>
                  <Text style={styles.settingSubtext}>{getAgeText()}</Text>
                </View>
              </View>
              
              {/* Personality Test Section */}
              {formData.personalityType ? (
                <View>
                  <TouchableOpacity 
                    style={styles.settingItem}
                    onPress={navigateToTestResults}
                  >
                    <View style={[styles.settingIconContainer, { backgroundColor: '#EEF0FF' }]}>
                      <Star size={20} color={COLORS.primary} />
                    </View>
                    <View style={styles.settingTextContainer}>
                      <Text style={styles.settingText}>Результаты теста личности</Text>
                      <Text style={styles.settingSubtext}>Ваш тип: {formData.personalityType}</Text>
                    </View>
                    <ChevronRight size={20} color={COLORS.textSecondary} />
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.settingItem, { paddingTop: 0 }]}
                    onPress={navigateToPersonalityTest}
                  >
                    <View style={[styles.settingIconContainer, { backgroundColor: '#FFF8E8' }]}>
                      <Brain size={20} color={COLORS.accent3} />
                    </View>
                    <View style={styles.settingTextContainer}>
                      <Text style={styles.settingText}>Пройти тест заново</Text>
                    </View>
                    <ChevronRight size={20} color={COLORS.textSecondary} />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity 
                  style={styles.settingItem}
                  onPress={navigateToPersonalityTest}
                >
                  <View style={[styles.settingIconContainer, { backgroundColor: '#EEF0FF' }]}>
                    <Star size={20} color={COLORS.primary} />
                  </View>
                  <View style={styles.settingTextContainer}>
                    <Text style={styles.settingText}>Тест личности MBTI</Text>
                    <Text style={styles.settingSubtext}>Пройдите тест, чтобы узнать свой тип</Text>
                  </View>
                  <ChevronRight size={20} color={COLORS.textSecondary} />
                </TouchableOpacity>
              )}
              
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
                      onPress={() => setSettings({ ...settings, theme: theme.id as string })}
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
              onPress={() => setShowLogoutConfirm(true)}
            >
              <LogOut size={20} color={COLORS.accent2} />
              <Text style={styles.logoutText}>Выйти из аккаунта</Text>
            </TouchableOpacity>
            
            <Text style={styles.versionText}>Версия 1.0.0</Text>
          </>
        )}
      </View>

      {/* Модальные окна */}
      <GenderPickerModal
        visible={showGenderPicker}
        onClose={() => setShowGenderPicker(false)}
        onSelect={(gender) => setFormData({...formData, gender})}
        selectedGender={formData.gender}
      />
      
      <LanguagePickerModal
        visible={showLanguagePicker}
        onClose={() => setShowLanguagePicker(false)}
        onSelect={(language) => setSettings({...settings, language})}
        selectedLanguage={settings.language}
      />
      
      <ThemePickerModal
        visible={showThemePicker}
        onClose={() => setShowThemePicker(false)}
        onSelect={(theme) => setSettings({...settings, theme})}
        selectedTheme={settings.theme}
      />
      
      <LogoutConfirmModal
        visible={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        loading={isLoading}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.text,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  loginButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
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
  userNickname: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 10,
  },
  personalityTypeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  personalityTypeIcon: {
    marginRight: 6,
  },
  personalityTypeText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
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
  editFormContainer: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  editFormTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 15,
    color: COLORS.text,
  },
  genderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  genderOption: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  activeGenderOption: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  genderText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  activeGenderText: {
    color: '#FFFFFF',
  },
  editButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  editButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editCancelButton: {
    backgroundColor: COLORS.background,
    marginRight: 10,
  },
  editSaveButton: {
    backgroundColor: COLORS.primary,
    marginLeft: 10,
  },
  editCancelButtonText: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '600',
  },
  editSaveButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ProfileScreen; 