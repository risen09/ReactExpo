import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, ActivityIndicator, TextInput } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import apiClient from '@/api/client';
import Fuse from 'fuse.js';
import LoadingModal from '@/components/LoadingModal';
// Reusing COLORS from DiagnosticsScreen for consistency
const COLORS = {
  primary: '#5B67CA',
  secondary: '#43C0B4',
  background: '#F2F5FF',
  card: '#FFFFFF',
  text: '#25335F',
  textSecondary: '#7F8BB7',
  border: '#EAEDF5',
  success: '#4CAF50',
  danger: '#F44336',
  warning: '#FF9800',
};

// Dummy data for subjects and topics (replace with actual data later)
const SUBJECTS = [
  { id: 'math', name: 'Математика' },
  { id: 'physics', name: 'Физика' },
  { id: 'english', name: 'Английский язык' },
  { id: 'biology', name: 'Биология' },
  { id: 'cs', name: 'Информатика' },
];

const TOPICS: { [key: string]: { id: string; name: string }[] } = {
  math: [
    { id: 'algebra', name: 'Алгебра' },
    { id: 'geometry', name: 'Геометрия' },
    { id: 'calculus', name: 'Мат. анализ' },
    { id: 'probability', name: 'Теория вероятностей' },
    { id: 'trigonometry', name: 'Тригонометрия' },
    { id: 'equations', name: 'Уравнения' },
  ],
  physics: [
    { id: 'mechanics', name: 'Механика' },
    { id: 'thermo', name: 'Термодинамика' },
    { id: 'electricity', name: 'Электричество' },
    { id: 'optics', name: 'Оптика' },
    { id: 'nuclear', name: 'Ядерная физика' },
    { id: 'astrophysics', name: 'Астрофизика' },
  ],
  english: [
    { id: 'grammar', name: 'Грамматика' },
    { id: 'vocab', name: 'Лексика' },
    { id: 'speaking', name: 'Разговорная речь' },
    { id: 'reading', name: 'Чтение' },
    { id: 'writing', name: 'Письмо' },
    { id: 'ielts', name: 'Подготовка к IELTS' },
  ],
  biology: [
    { id: 'cells', name: 'Клетки' },
    { id: 'genetics', name: 'Генетика' },
    { id: 'ecology', name: 'Экология' },
    { id: 'anatomy', name: 'Анатомия человека' },
    { id: 'botany', name: 'Ботаника' },
    { id: 'evolution', name: 'Эволюция' },
  ],
  cs: [
    { id: 'algorithms', name: 'Алгоритмы' },
    { id: 'data_structures', name: 'Структуры данных' },
    { id: 'web_dev', name: 'Веб-разработка' },
    { id: 'python', name: 'Python' },
    { id: 'machine_learning', name: 'Машинное обучение' },
    { id: 'databases', name: 'Базы данных' },
  ],
};

const DIFFICULTIES = [
  { id: 'basic', name: 'Базовый' },
  { id: 'intermediate', name: 'Средний' },
  { id: 'advanced', name: 'Продвинутый' },
];

const SUBTOPICS: { [key: string]: { id: string; name: string }[] } = {
  algebra: [
    { id: 'linear', name: 'Линейные уравнения' },
    { id: 'quadratic', name: 'Квадратные уравнения' },
    { id: 'inequalities', name: 'Неравенства' },
    { id: 'rational_numbers', name: 'Рациональные числа' },
    { id: 'polynomials', name: 'Многочлены' },
    { id: 'functions', name: 'Функции' },
    { id: 'progressions', name: 'Прогрессии' },
    { id: 'logarithms', name: 'Логарифмы' },
    { id: 'exponents', name: 'Степени и показатели' },
  ],
  geometry: [
    { id: 'triangles', name: 'Треугольники' },
    { id: 'circles', name: 'Окружности' },
    { id: 'polygons', name: 'Многоугольники' },
    { id: 'angles', name: 'Углы' },
    { id: 'area', name: 'Площадь фигур' },
    { id: 'volume', name: 'Объем тел' },
    { id: 'similarity', name: 'Подобие фигур' },
    { id: 'coordinates', name: 'Координатная геометрия' },
  ],
  mechanics: [
    { id: 'newton_first_law', name: 'Первый закон Ньютона' },
    { id: 'newton_second_law', name: 'Второй закон Ньютона' },
    { id: 'newton_third_law', name: 'Третий закон Ньютона' },
    { id: 'kinematics', name: 'Кинематика' },
    { id: 'dynamics', name: 'Динамика' },
    { id: 'statics', name: 'Статика' },
    { id: 'work_energy', name: 'Работа и энергия' },
    { id: 'momentum', name: 'Импульс' },
    { id: 'oscillations', name: 'Колебания' },
    { id: 'rotational_motion', name: 'Вращательное движение' },
  ],
  calculus: [
    { id: 'limits', name: 'Пределы' },
    { id: 'derivatives', name: 'Производные' },
    { id: 'integrals', name: 'Интегралы' },
    { id: 'series', name: 'Ряды' },
    { id: 'differential_equations', name: 'Дифференциальные уравнения' },
  ],
  probability: [
    { id: 'combinatorics', name: 'Комбинаторика' },
    { id: 'random_variables', name: 'Случайные величины' },
    { id: 'distributions', name: 'Распределения' },
    { id: 'law_of_large_numbers', name: 'Закон больших чисел' },
    { id: 'central_limit_theorem', name: 'Центральная предельная теорема' },
  ],
  trigonometry: [
    { id: 'trig_functions', name: 'Тригонометрические функции' },
    { id: 'identities', name: 'Тождества' },
    { id: 'equations', name: 'Тригонометрические уравнения' },
    { id: 'graphs', name: 'Графики функций' },
    { id: 'applications', name: 'Применения тригонометрии' },
  ],
  equations: [
    { id: 'linear_eq', name: 'Линейные уравнения' },
    { id: 'quadratic_eq', name: 'Квадратные уравнения' },
    { id: 'systems', name: 'Системы уравнений' },
    { id: 'exponential_eq', name: 'Показательные уравнения' },
    { id: 'logarithmic_eq', name: 'Логарифмические уравнения' },
  ],
  thermo: [
    { id: 'temperature', name: 'Температура' },
    { id: 'heat', name: 'Теплота' },
    { id: 'laws', name: 'Законы термодинамики' },
    { id: 'engines', name: 'Тепловые двигатели' },
  ],
  electricity: [
    { id: 'current', name: 'Электрический ток' },
    { id: 'circuits', name: 'Электрические цепи' },
    { id: 'magnetism', name: 'Магнетизм' },
    { id: 'electrostatics', name: 'Электростатика' },
    { id: 'induction', name: 'Электромагнитная индукция' },
  ],
  optics: [
    { id: 'reflection', name: 'Отражение' },
    { id: 'refraction', name: 'Преломление' },
    { id: 'lenses', name: 'Линзы' },
    { id: 'mirrors', name: 'Зеркала' },
    { id: 'diffraction', name: 'Дифракция' },
  ],
  nuclear: [
    { id: 'radioactivity', name: 'Радиоактивность' },
    { id: 'fission', name: 'Деление ядра' },
    { id: 'fusion', name: 'Термоядерный синтез' },
    { id: 'nuclear_reactions', name: 'Ядерные реакции' },
  ],
  astrophysics: [
    { id: 'stars', name: 'Звезды' },
    { id: 'galaxies', name: 'Галактики' },
    { id: 'cosmology', name: 'Космология' },
    { id: 'black_holes', name: 'Черные дыры' },
  ],
};

type Step = 'subject' | 'topic' | 'subtopic' | 'difficulty' | 'summary';

export const GreetingScreen = () => {
  const [step, setStep] = useState<Step>('subject');
  const [selectedSubject, setSelectedSubject] = useState<{ id: string; name: string } | null>(null);
  const [selectedTopics, setSelectedTopics] = useState<{ id: string; name: string }[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<{ id: string; name: string } | null>(
    null
  );
  const [selectedSubtopic, setSelectedSubtopic] = useState<{ id: string; name: string }[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [subtopicSearch, setSubtopicSearch] = useState('');
  const router = useRouter();

  const handleSubjectSelect = (subject: { id: string; name: string }) => {
    setSelectedSubject(subject);
    setSelectedTopics([]);
    setSelectedDifficulty(null);
    setStep('topic');
  };

  const handleTopicSelect = (topic: { id: string; name: string }) => {
    setSelectedTopics([topic]);
    setSelectedSubtopic([]);
    setStep('subtopic');
  };

  const handleProceedToSubtopic = () => {
    if (selectedTopics.length > 0) {
      setStep('subtopic');
    } else {
      console.warn('Please select at least one topic.');
    }
  };

  const handleDifficultySelect = (difficulty: { id: string; name: string }) => {
    setSelectedDifficulty(difficulty);
    setStep('summary');
  };

  const handleReset = () => {
    setSelectedSubject(null);
    setSelectedTopics([]);
    setSelectedDifficulty(null);
    setStep('subject');
  };

  const handleSubtopicSelect = (subtopic: { id: string; name: string }) => {
    setSelectedSubtopic(prev => {
      const exists = prev.some(s => s.id === subtopic.id);
      if (exists) {
        return prev.filter(s => s.id !== subtopic.id);
      } else {
        return [...prev, subtopic];
      }
    });
  };

  const handleStartLearning = async () => {
    try {
      setIsGenerating(true);
      const grade = 9;
      const subtopicParam = selectedSubtopic.length > 0 ? selectedSubtopic.map(s => s.name).join(', ') : undefined;
      const response = await apiClient.tests.startInitialTest(
        selectedSubject?.id || '',
        selectedTopics[0]?.id || '',
        subtopicParam,
        selectedDifficulty?.id || '',
        grade
      );

      const { testId } = response.data;
      router.push(`/(tabs)/test/${testId}`);
    } catch (error) {
      console.error('Error starting test:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 'subject':
        return (
          <>
            <Text style={styles.stepTitle}>1. Выбери предмет:</Text>
            <View style={styles.buttonContainer}>
              {SUBJECTS.map(subject => (
                <TouchableOpacity
                  key={subject.id}
                  style={styles.button}
                  onPress={() => handleSubjectSelect(subject)}
                >
                  <Text style={styles.buttonText}>{subject.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        );
      case 'topic':
        if (!selectedSubject) return null;
        const availableTopics = TOPICS[selectedSubject.id] || [];
        return (
          <>
            <TouchableOpacity onPress={() => setStep('subject')} style={styles.backButton}>
              <Ionicons name="arrow-back" size={18} color={COLORS.primary} />
              <Text style={styles.backButtonText}>{selectedSubject.name}</Text>
            </TouchableOpacity>
            <Text style={styles.stepTitle}>2. Выбери тему:</Text>
            <View style={styles.buttonContainer}>
              {availableTopics.map(topic => {
                const isSelected = selectedTopics.some(t => t.id === topic.id);
                return (
                  <TouchableOpacity
                    key={topic.id}
                    style={[styles.button, isSelected && styles.buttonSelected]}
                    onPress={() => handleTopicSelect(topic)}
                  >
                    <Text style={[styles.buttonText, isSelected && styles.buttonTextSelected]}>
                      {topic.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <TouchableOpacity
              style={[
                styles.confirmButton,
                { marginTop: 20, opacity: selectedTopics.length > 0 ? 1 : 0.5 },
              ]}
              onPress={handleProceedToSubtopic}
              disabled={selectedTopics.length === 0}
            >
              <Text style={styles.confirmButtonText}>Далее</Text>
            </TouchableOpacity>
          </>
        );
      case 'subtopic':
        if (!selectedTopics.length) return null;
        const topicId = selectedTopics[0].id;
        const availableSubtopics = SUBTOPICS[topicId] || [];
        const fuse = new Fuse(availableSubtopics, {
          keys: ['name'],
          threshold: 0.4,
        });
        const filteredSubtopics =
          subtopicSearch.trim().length > 0
            ? fuse.search(subtopicSearch).map(result => result.item)
            : availableSubtopics;
        return (
          <>
            <TouchableOpacity onPress={() => setStep('topic')} style={styles.backButton}>
              <Ionicons name="arrow-back" size={18} color={COLORS.primary} />
              <Text style={styles.backButtonText}>{selectedTopics[0].name}</Text>
            </TouchableOpacity>
            <Text style={styles.stepTitle}>2.1. Выбери подтему:</Text>
            <View style={{ marginBottom: 12 }}>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: COLORS.border,
                  borderRadius: 10,
                  padding: 10,
                  backgroundColor: COLORS.card,
                  fontSize: 15,
                  color: COLORS.text,
                }}
                placeholder="Поиск по подтемам"
                placeholderTextColor={COLORS.textSecondary}
                value={subtopicSearch}
                onChangeText={setSubtopicSearch}
              />
            </View>
            <View style={styles.buttonContainer}>
              {filteredSubtopics.map(subtopic => {
                const isSelected = selectedSubtopic.some(s => s.id === subtopic.id);
                return (
                  <TouchableOpacity
                    key={subtopic.id}
                    style={[styles.button, isSelected && styles.buttonSelected]}
                    onPress={() => handleSubtopicSelect(subtopic)}
                  >
                    <Text
                      style={[
                        styles.buttonText,
                        isSelected && styles.buttonTextSelected,
                      ]}
                    >
                      {subtopic.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <TouchableOpacity
              style={[
                styles.confirmButton,
                { marginTop: 20, opacity: 1 },
              ]}
              onPress={() => setStep('difficulty')}
            >
              <Text style={styles.confirmButtonText}>Далее</Text>
            </TouchableOpacity>
          </>
        );
      case 'difficulty':
        if (!selectedSubject || selectedTopics.length === 0) return null;
        return (
          <>
            <TouchableOpacity onPress={() => setStep('topic')} style={styles.backButton}>
              <Ionicons name="arrow-back" size={18} color={COLORS.primary} />
              <Text style={styles.backButtonText}>
                {selectedSubject.name} ({selectedTopics.length} тем)
              </Text>
            </TouchableOpacity>
            <Text style={styles.stepTitle}>3. Выбери уровень сложности:</Text>
            <View style={styles.buttonContainer}>
              {DIFFICULTIES.map(difficulty => {
                const isSelected = selectedDifficulty?.id === difficulty.id;
                return (
                  <TouchableOpacity
                    key={difficulty.id}
                    style={[styles.button, isSelected && styles.buttonSelected]}
                    onPress={() => handleDifficultySelect(difficulty)}
                  >
                    <Text style={[styles.buttonText, isSelected && styles.buttonTextSelected]}>
                      {difficulty.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        );
      case 'summary':
        if (!selectedSubject || selectedTopics.length === 0 || !selectedDifficulty) return null;
        return (
          <>
            <TouchableOpacity onPress={() => setStep('difficulty')} style={styles.backButton}>
              <Ionicons name="arrow-back" size={18} color={COLORS.primary} />
              <Text style={styles.backButtonText}>Выбор уровня</Text>
            </TouchableOpacity>

            <Text style={styles.summaryTitle}>Ваш выбор:</Text>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Предмет:</Text>
              <Text style={styles.summaryValue}>{selectedSubject.name}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Темы:</Text>
              <View style={styles.summaryTopicsContainer}>
                {selectedTopics.map(topic => (
                  <Text key={topic.id} style={styles.summaryValueChip}>
                    {topic.name}
                  </Text>
                ))}
              </View>
            </View>
            {selectedSubtopic && selectedSubtopic.length > 0 && (
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Подтемы:</Text>
                <View style={styles.summaryTopicsContainer}>
                  {selectedSubtopic.map(sub => (
                    <Text key={sub.id} style={styles.summaryValueChip}>
                      {sub.name}
                    </Text>
                  ))}
                </View>
              </View>
            )}
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Уровень:</Text>
              <Text style={styles.summaryValue}>{selectedDifficulty.name}</Text>
            </View>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleStartLearning}
            >
              <Text style={styles.confirmButtonText}>Пройти тест</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.resetButton]} onPress={handleReset}>
              <Text style={[styles.buttonText, styles.resetButtonText]}>Начать заново</Text>
            </TouchableOpacity>
          </>
        );
      default:
        return null;
    }
  };

  const LoadingOverlay = () => (
    <View style={styles.loadingOverlay}>
      <View style={styles.loadingContent}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Подождите, тест генерируется...</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          title: "Создания трека"
        }}
      />
      <StatusBar style="dark" />
      {isGenerating && <LoadingModal visible={isGenerating} message='Генерация теста...' />}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Расскажи, чему ты хочешь научиться?</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>{renderStepContent()}</ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  scrollContent: {
    padding: 20,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 15,
    marginTop: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  button: {
    backgroundColor: COLORS.card,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: '500',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    alignSelf: 'flex-start',
    paddingVertical: 5,
  },
  backButtonText: {
    marginLeft: 5,
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    flexShrink: 1,
    textAlign: 'right',
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resetButton: {
    marginTop: 15,
    backgroundColor: 'transparent',
    borderColor: COLORS.secondary,
  },
  resetButtonText: {
    color: COLORS.secondary,
  },
  buttonSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  buttonTextSelected: {
    color: COLORS.card,
  },
  summaryTopicsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    flex: 1,
    marginLeft: 10,
  },
  summaryValueChip: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.primary,
    backgroundColor: COLORS.background,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginLeft: 4,
    marginBottom: 4,
    textAlign: 'center',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingContent: {
    backgroundColor: COLORS.card,
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.text,
    textAlign: 'center',
  },
});

export default GreetingScreen;
