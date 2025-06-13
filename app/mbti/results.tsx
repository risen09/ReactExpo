import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Check, Share2 } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Share,
} from 'react-native';

import { useAuth } from '../../hooks/useAuth';
import { personalityTypes as allPersonalityTypes } from '../../data/personalityTypes';
import { MbtiPersonalityType } from '../../types/MbtiPersonalityType'
const COLORS = {
  primary: '#5B67CA',
  secondary: '#43C0B4',
  accent1: '#F98D51',
  accent2: '#EC575B',
  background: '#F2F5FF',
  card: '#FFFFFF',
  text: '#25335F',
  textSecondary: '#7F8BB7',
  border: '#EAEDF5',
};

const personalityTypesMap: { [key: string]: MbtiPersonalityType } =
  allPersonalityTypes.reduce((acc, type) => {
    let bgGradient: [string, string];
    switch (type.code.charAt(0)) {
      case 'I':
        bgGradient = ['#43C0B4', '#2C8A81']; // Бирюзовый для Интровертов
        break;
      case 'E':
        bgGradient = ['#F98D51', '#E16F33']; // Оранжевый для Экстравертов
        break;
      default:
        bgGradient = ['#5B67CA', '#424D9D']; // По умолчанию синий
    }

    acc[type.code] = {
      ...type,
      bgGradient: bgGradient,
    };
    return acc;
  }, {} as { [key: string]: MbtiPersonalityType });

export default function TestResultScreen() {
  const { type } = useLocalSearchParams<{ type: string }>();
  const [personalityType, setPersonalityType] = useState<MbtiPersonalityType | null>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const { updatePersonalityType, user } = useAuth();

  useEffect(() => {
    console.log('=== TEST RESULT SCREEN DEBUG ===');
    console.log('Type parameter:', type);

    // Проверяем, является ли params.type валидным значением
    if (type) {
      if (typeof type === 'string') {
        console.log('Type parameter is a valid string:', type);
      } else {
        console.log('Type parameter is not a string:', typeof type);
      }
    } else {
      console.log('No type parameter found in params');
    }

    console.log('=== END TEST RESULT DEBUG ===');
  }, [type]);

  // Проверяем наличие параметра type
  if (!type) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Ошибка загрузки результатов</Text>
        <Text style={styles.errorMessage}>
          Не указан тип личности. Пожалуйста, вернитесь и пройдите тест снова.
        </Text>
      </View>
    );
  }

  useEffect(() => {
    console.log('=== TEST RESULT SCREEN COMPONENT DEBUG ===');
    console.log('Received type parameter:', type);
    console.log('Available personality types:', Object.keys(personalityTypesMap));
    console.log('Type exists in dictionary:', type ? !!personalityTypesMap[type] : false);

    if (type) {
      if (personalityTypesMap[type]) {
        // Если тип найден в нашем словаре
        console.log('Setting personality type from dictionary');
        setPersonalityType(personalityTypesMap[type]);

        // Проверяем, совпадает ли тип личности с сохраненным в профиле
        if (user?.personalityType === type) {
          setSaved(true);
        }
      } else {
        // Если типа нет в словаре, создаем временный тип для отображения
        // Это может быть MBTI тип, который не включен в базовый словарь
        console.log('Creating fallback personality type for:', type);

        // Определяем градиент в зависимости от первой буквы MBTI
        let gradient: [string, string] = ['#5B67CA', '#424D9D']; // По умолчанию синий
        if (type.startsWith('E')) gradient = ['#F98D51', '#E16F33']; // Оранжевый для Экстравертов
        if (type.startsWith('I')) gradient = ['#43C0B4', '#2C8A81']; // Бирюзовый для Интровертов

        const tempType: MbtiPersonalityType = {
          id: type,
          code: type,
          name: `Тип личности ${type}`,
          description: `Это ваш результат теста личности MBTI: ${type}. Более подробное описание данного типа личности будет добавлено позже.`,
          strengths: [
            'Аналитическое мышление',
            'Способность к планированию',
            'Внимание к деталям',
            'Организованность',
            'Целеустремленность',
          ],
          weaknesses: [
            'Может потребоваться работа над гибкостью',
            'Иногда чрезмерная критичность',
            'Стремление к перфекционизму',
            'Трудности с принятием неопределенности',
            'Может быть сложно работать в хаотичных условиях',
          ],
          careerOptions: [
            'Аналитические профессии',
            'Исследовательская деятельность',
            'Консультирование',
            'Проектная работа',
            'Стратегическое планирование',
          ],
          imagePath: require('../../assets/images/logo.png'),
          bgGradient: gradient,
        };

        setPersonalityType(tempType);

        // Проверяем, совпадает ли тип личности с сохраненным в профиле
        if (user?.personalityType === type) {
          setSaved(true);
        }
      }
    } else {
      console.log('No type parameter provided');
    }

    console.log('=== END TEST RESULT SCREEN COMPONENT DEBUG ===');
  }, [type, user]);

  const handleSaveToProfile = async () => {
    if (!personalityType) return;

    setLoading(true);
    try {
      await updatePersonalityType(personalityType.code);
      setSaved(true);
      Alert.alert('Успешно сохранено', 'Тип личности сохранен в вашем профиле.');
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось сохранить тип личности. Пожалуйста, попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  const handleShareResult = async () => {
    if (!personalityType) return;

    try {
      await Share.share({
        message: `Мой тип личности: ${personalityType.name}\n\n${personalityType.description}`,
        title: 'Мой результат теста личности',
      });
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось поделиться результатом');
    }
  };

  const handleRetakeTest = () => {
    router.push('/mbti');
  };

  if (!personalityType) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      <Stack.Screen
        options={{
          title: 'Твой тип личности',
        }}
      />
      <LinearGradient
        colors={personalityType.bgGradient}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.imageContainer}>
          <Image source={personalityType.imagePath} style={styles.image} resizeMode="cover" />
        </View>
        <Text style={styles.headerTitle}>{personalityType.name}</Text>
      </LinearGradient>

      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Описание</Text>
        <Text style={styles.description}>{personalityType.description}</Text>

        <Text style={styles.sectionTitle}>Сильные стороны</Text>
        <View style={styles.listContainer}>
          {personalityType.strengths.map((strength, index) => (
            <View key={`strength-${index}`} style={styles.listItem}>
              <View style={styles.bulletPoint}>
                <Check size={14} color="#FFFFFF" />
              </View>
              <Text style={styles.listText}>{strength}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Области для развития</Text>
        <View style={styles.listContainer}>
          {personalityType.weaknesses.map((weakness, index) => (
            <View key={`weakness-${index}`} style={styles.listItem}>
              <View style={[styles.bulletPoint, styles.weaknessBullet]}>
                <Check size={14} color="#FFFFFF" />
              </View>
              <Text style={styles.listText}>{weakness}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Рекомендуемые профессии</Text>
        <View style={styles.listContainer}>
          {personalityType.careerOptions.map((career, index) => (
            <View key={`career-${index}`} style={styles.listItem}>
              <View style={[styles.bulletPoint, styles.careerBullet]}>
                <Check size={14} color="#FFFFFF" />
              </View>
              <Text style={styles.listText}>{career}</Text>
            </View>
          ))}
        </View>

        <View style={styles.actionsContainer}>
          {!saved && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleSaveToProfile}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Check size={18} color="#FFFFFF" style={styles.buttonIcon} />
                  <Text style={styles.buttonText}>Сохранить в профиле</Text>
                </>
              )}
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.actionButton, styles.shareButton]}
            onPress={handleShareResult}
          >
            <Share2 size={18} color="#FFFFFF" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Поделиться</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.retakeButton]}
            onPress={handleRetakeTest}
          >
            <Text style={styles.buttonText}>Пройти тест заново</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Вернуться на главную</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  header: {
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  imageContainer: {
    width: 150,
    height: 150,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 75,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  container: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 24,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.text,
    marginBottom: 8,
  },
  listContainer: {
    marginBottom: 16,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  bulletPoint: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  weaknessBullet: {
    backgroundColor: COLORS.accent2,
  },
  careerBullet: {
    backgroundColor: COLORS.secondary,
  },
  listText: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 24,
  },
  actionsContainer: {
    padding: 20,
    marginTop: 8,
    marginBottom: 24,
  },
  actionButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 12,
  },
  shareButton: {
    backgroundColor: COLORS.accent1,
  },
  retakeButton: {
    backgroundColor: COLORS.accent2,
    marginTop: 8,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  actionButtonDisabled: {
    backgroundColor: COLORS.textSecondary,
    opacity: 0.6,
  },
  backButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  backButtonText: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.background,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.accent2,
    marginBottom: 10,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});
