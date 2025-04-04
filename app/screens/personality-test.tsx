import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Animated,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';

const { width } = Dimensions.get('window');

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

interface Question {
  id: number;
  text: string;
  options: {
    text: string;
    scores: {
      analytical: number;
      creative: number;
      social: number;
      practical: number;
    };
  }[];
}

// Тестовые вопросы
const questions: Question[] = [
  {
    id: 1,
    text: 'Как вы предпочитаете решать сложные проблемы?',
    options: [
      {
        text: 'Анализирую все возможные варианты и выбираю самый логичный',
        scores: { analytical: 3, creative: 0, social: 0, practical: 1 }
      },
      {
        text: 'Ищу нестандартные, творческие подходы',
        scores: { analytical: 0, creative: 3, social: 1, practical: 0 }
      },
      {
        text: 'Обсуждаю с другими людьми, чтобы найти лучшее решение',
        scores: { analytical: 0, creative: 1, social: 3, practical: 0 }
      },
      {
        text: 'Выбираю проверенные, практичные способы решения',
        scores: { analytical: 1, creative: 0, social: 0, practical: 3 }
      }
    ]
  },
  {
    id: 2,
    text: 'Что вас больше мотивирует?',
    options: [
      {
        text: 'Понимание того, как устроены вещи',
        scores: { analytical: 3, creative: 1, social: 0, practical: 0 }
      },
      {
        text: 'Создание чего-то нового и уникального',
        scores: { analytical: 0, creative: 3, social: 0, practical: 0 }
      },
      {
        text: 'Возможность помочь другим и сделать мир лучше',
        scores: { analytical: 0, creative: 0, social: 3, practical: 1 }
      },
      {
        text: 'Достижение конкретных результатов',
        scores: { analytical: 1, creative: 0, social: 0, practical: 3 }
      }
    ]
  },
  {
    id: 3,
    text: 'Как вы принимаете важные решения?',
    options: [
      {
        text: 'Анализирую все за и против, опираясь на факты',
        scores: { analytical: 3, creative: 0, social: 0, practical: 1 }
      },
      {
        text: 'Доверяю интуиции и ищу неординарные решения',
        scores: { analytical: 0, creative: 3, social: 0, practical: 0 }
      },
      {
        text: 'Учитываю чувства и мнения всех заинтересованных сторон',
        scores: { analytical: 0, creative: 0, social: 3, practical: 0 }
      },
      {
        text: 'Опираюсь на свой опыт и проверенные методы',
        scores: { analytical: 0, creative: 0, social: 1, practical: 3 }
      }
    ]
  },
  {
    id: 4,
    text: 'Что вам важнее в работе?',
    options: [
      {
        text: 'Интеллектуальные вызовы и возможность исследования',
        scores: { analytical: 3, creative: 1, social: 0, practical: 0 }
      },
      {
        text: 'Свобода самовыражения и креативность',
        scores: { analytical: 0, creative: 3, social: 0, practical: 0 }
      },
      {
        text: 'Работа в команде и позитивная атмосфера',
        scores: { analytical: 0, creative: 0, social: 3, practical: 0 }
      },
      {
        text: 'Конкретные задачи и измеримые результаты',
        scores: { analytical: 1, creative: 0, social: 0, practical: 3 }
      }
    ]
  },
  {
    id: 5,
    text: 'Как вы реагируете на изменения?',
    options: [
      {
        text: 'Анализирую все последствия, прежде чем принять изменения',
        scores: { analytical: 3, creative: 0, social: 0, practical: 1 }
      },
      {
        text: 'Приветствую новые возможности и идеи',
        scores: { analytical: 0, creative: 3, social: 0, practical: 0 }
      },
      {
        text: 'Беспокоюсь о том, как изменения повлияют на людей',
        scores: { analytical: 0, creative: 0, social: 3, practical: 0 }
      },
      {
        text: 'Предпочитаю стабильность и проверенные подходы',
        scores: { analytical: 1, creative: 0, social: 0, practical: 3 }
      }
    ]
  },
  {
    id: 6,
    text: 'Что вас больше привлекает в обучении?',
    options: [
      {
        text: 'Глубокое погружение в теорию и концепции',
        scores: { analytical: 3, creative: 0, social: 0, practical: 0 }
      },
      {
        text: 'Исследование новых идей и возможностей',
        scores: { analytical: 0, creative: 3, social: 0, practical: 0 }
      },
      {
        text: 'Групповые обсуждения и обмен мнениями',
        scores: { analytical: 0, creative: 0, social: 3, practical: 0 }
      },
      {
        text: 'Получение навыков, которые можно сразу применить',
        scores: { analytical: 0, creative: 0, social: 0, practical: 3 }
      }
    ]
  },
  {
    id: 7,
    text: 'Как вы предпочитаете проводить свободное время?',
    options: [
      {
        text: 'Читать, изучать что-то новое или решать головоломки',
        scores: { analytical: 3, creative: 1, social: 0, practical: 0 }
      },
      {
        text: 'Заниматься творчеством или исследовать новые места',
        scores: { analytical: 0, creative: 3, social: 0, practical: 0 }
      },
      {
        text: 'Общаться с друзьями или заниматься волонтерством',
        scores: { analytical: 0, creative: 0, social: 3, practical: 0 }
      },
      {
        text: 'Заниматься спортом или практическими хобби',
        scores: { analytical: 0, creative: 0, social: 0, practical: 3 }
      }
    ]
  },
  {
    id: 8,
    text: 'Какие книги/фильмы вас больше привлекают?',
    options: [
      {
        text: 'Научная литература, документалистика',
        scores: { analytical: 3, creative: 0, social: 0, practical: 1 }
      },
      {
        text: 'Фантастика, искусство, необычные истории',
        scores: { analytical: 0, creative: 3, social: 0, practical: 0 }
      },
      {
        text: 'Истории о людях, их взаимоотношениях и развитии',
        scores: { analytical: 0, creative: 0, social: 3, practical: 0 }
      },
      {
        text: 'Практические руководства, биографии успешных людей',
        scores: { analytical: 1, creative: 0, social: 0, practical: 3 }
      }
    ]
  },
  {
    id: 9,
    text: 'Как вы относитесь к правилам?',
    options: [
      {
        text: 'Анализирую их логичность и целесообразность',
        scores: { analytical: 3, creative: 0, social: 0, practical: 1 }
      },
      {
        text: 'Предпочитаю гибкость и возможность для интерпретации',
        scores: { analytical: 0, creative: 3, social: 0, practical: 0 }
      },
      {
        text: 'Важно, чтобы правила были справедливы для всех',
        scores: { analytical: 0, creative: 0, social: 3, practical: 1 }
      },
      {
        text: 'Следую правилам, если они проверены и работают',
        scores: { analytical: 1, creative: 0, social: 0, practical: 3 }
      }
    ]
  },
  {
    id: 10,
    text: 'Что для вас важнее при выборе карьеры?',
    options: [
      {
        text: 'Возможность для интеллектуального роста и исследований',
        scores: { analytical: 3, creative: 1, social: 0, practical: 0 }
      },
      {
        text: 'Свобода самовыражения и творческая реализация',
        scores: { analytical: 0, creative: 3, social: 0, practical: 0 }
      },
      {
        text: 'Помощь людям и позитивное влияние на общество',
        scores: { analytical: 0, creative: 0, social: 3, practical: 0 }
      },
      {
        text: 'Стабильность, практичность и конкретные результаты',
        scores: { analytical: 0, creative: 0, social: 0, practical: 3 }
      }
    ]
  }
];

export default function PersonalityTestScreen() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>(Array(questions.length).fill(-1));
  const [isLoading, setIsLoading] = useState(false);
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);

  const handleAnswer = (questionIndex: number, optionIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = optionIndex;
    setAnswers(newAnswers);
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentQuestionIndex + 1,
        animated: true,
      });
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      flatListRef.current?.scrollToIndex({
        index: currentQuestionIndex - 1,
        animated: true,
      });
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const calculatePersonalityType = () => {
    let scores = {
      analytical: 0,
      creative: 0,
      social: 0,
      practical: 0
    };

    answers.forEach((answerIndex, questionIndex) => {
      if (answerIndex !== -1) {
        const question = questions[questionIndex];
        const option = question.options[answerIndex];
        
        scores.analytical += option.scores.analytical;
        scores.creative += option.scores.creative;
        scores.social += option.scores.social;
        scores.practical += option.scores.practical;
      }
    });

    // Определить доминирующий тип личности
    const types = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    return types[0][0]; // Возвращаем название типа с наивысшим баллом
  };

  const completeTest = () => {
    // Проверка, что на все вопросы есть ответы
    if (answers.includes(-1)) {
      Alert.alert(
        'Незавершенный тест', 
        'Пожалуйста, ответьте на все вопросы перед завершением теста.'
      );
      return;
    }

    setIsLoading(true);
    
    // Имитация загрузки/обработки результатов
    setTimeout(() => {
      setIsLoading(false);
      const personalityType = calculatePersonalityType();
      router.push(`/screens/test-result?type=${personalityType}`);
    }, 1500);
  };

  const isTestComplete = !answers.includes(-1);
  const progress = (currentQuestionIndex + 1) / questions.length;

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Тест личности',
          headerTitleStyle: { 
            color: COLORS.text, 
            fontWeight: 'bold',
            fontSize: 18,
          },
          headerStyle: {
            backgroundColor: COLORS.card,
          },
        }} 
      />
      
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
          </View>
          <Text style={styles.progressText}>
            Вопрос {currentQuestionIndex + 1} из {questions.length}
          </Text>
        </View>

        <FlatList
          ref={flatListRef}
          data={questions}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEnabled={false}
          renderItem={({ item, index }) => (
            <View style={styles.questionContainer}>
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.questionText}>{item.text}</Text>
                
                <View style={styles.optionsContainer}>
                  {item.options.map((option, optionIndex) => (
                    <TouchableOpacity
                      key={optionIndex}
                      style={[
                        styles.optionButton,
                        answers[index] === optionIndex && styles.selectedOption,
                      ]}
                      onPress={() => handleAnswer(index, optionIndex)}
                    >
                      <Text 
                        style={[
                          styles.optionText,
                          answers[index] === optionIndex && styles.selectedOptionText,
                        ]}
                      >
                        {option.text}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}
          keyExtractor={(item) => item.id.toString()}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false }
          )}
          onMomentumScrollEnd={(event) => {
            const newIndex = Math.floor(
              event.nativeEvent.contentOffset.x / width
            );
            setCurrentQuestionIndex(newIndex);
          }}
          getItemLayout={(_, index) => ({
            length: width,
            offset: width * index,
            index,
          })}
        />

        <View style={styles.navigationContainer}>
          <TouchableOpacity
            style={[styles.navButton, currentQuestionIndex === 0 && styles.disabledButton]}
            onPress={goToPreviousQuestion}
            disabled={currentQuestionIndex === 0}
          >
            <ChevronLeft size={24} color={currentQuestionIndex === 0 ? COLORS.textSecondary : COLORS.primary} />
            <Text style={[styles.navButtonText, currentQuestionIndex === 0 && styles.disabledButtonText]}>
              Назад
            </Text>
          </TouchableOpacity>

          {currentQuestionIndex < questions.length - 1 ? (
            <TouchableOpacity
              style={[styles.navButton, answers[currentQuestionIndex] === -1 && styles.disabledButton]}
              onPress={goToNextQuestion}
              disabled={answers[currentQuestionIndex] === -1}
            >
              <Text style={[styles.navButtonText, answers[currentQuestionIndex] === -1 && styles.disabledButtonText]}>
                Далее
              </Text>
              <ChevronRight size={24} color={answers[currentQuestionIndex] === -1 ? COLORS.textSecondary : COLORS.primary} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.completeButton, !isTestComplete && styles.disabledCompleteButton]}
              onPress={completeTest}
              disabled={!isTestComplete || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.completeButtonText}>
                  Завершить тест
                </Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: 16,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'right',
  },
  questionContainer: {
    width,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  questionText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 24,
  },
  optionsContainer: {
    marginBottom: 24,
  },
  optionButton: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  selectedOption: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  optionText: {
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 24,
  },
  selectedOptionText: {
    color: '#FFFFFF',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  navButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 4,
  },
  disabledButton: {
    opacity: 0.5,
  },
  disabledButtonText: {
    color: COLORS.textSecondary,
  },
  completeButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  disabledCompleteButton: {
    backgroundColor: COLORS.textSecondary,
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
}); 