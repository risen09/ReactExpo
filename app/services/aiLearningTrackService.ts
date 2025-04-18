import { v4 as uuidv4 } from 'uuid';
import apiClient from '@/app/api/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import aiTestService from './aiTestService';

// Расширяем интерфейс apiClient
declare module '@/app/api/client' {
  interface ApiClient {
    ai: {
      generateLearningTrack: (params: {
        testId: string;
        subject: string;
        topic: string;
        difficulty: string;
        includePrerequisites: boolean;
        weakAreas: string[];
      }) => Promise<{ data: LearningTrack }>;
      generateLessonContent: (params: {
        subject: string;
        topic: string;
        difficulty: string;
      }) => Promise<{ data: { content: string } }>;
      generateExercises: (params: {
        subject: string;
        topic: string;
        difficulty: string;
        count: number;
      }) => Promise<{ data: { exercises: ExerciseItem[] } }>;
      generateLessonsStructure: (params: {
        subject: string;
        topic: string;
        difficulty: string;
        weakAreas: string[];
        includePrerequisites: boolean;
      }) => Promise<{ data: { lessons: Array<{ title: string; description: string; type?: string; duration?: number; exerciseCount?: number }> } }>;
      generateSchedule: (params: {
        lessons: Array<{ id: string; title: string; duration: number; type: string }>;
        startDate: string;
        lessonsPerDay: number;
        maxDays: number;
      }) => Promise<{ data: { schedule: LearningTrack['schedule'] } }>;
    };
    tracks: {
      completeLesson: (trackId: string, lessonId: string) => Promise<any>;
    };
  }
}

// Типы для объектов трека обучения
interface LearningTrack {
  id: string;
  title: string;
  subject: string;
  topic: string;
  description: string;
  difficulty: 'basic' | 'intermediate' | 'advanced';
  createdAt: string;
  updatedAt?: string;
  expectedDuration: number; // в минутах
  progress: {
    completedLessons: number;
    totalLessons: number;
    proficiencyLevel: number; // от 1 до 3 (звездочки)
  };
  lessons: LessonItem[];
  schedule?: {
    days: Array<{
      date: string;
      lessons: string[]; // IDs уроков
    }>;
  };
}

interface LessonItem {
  id: string;
  title: string;
  description: string;
  content: string;
  duration: number; // в минутах
  isCompleted: boolean;
  type: 'theory' | 'exercise';
  exercises?: ExerciseItem[];
  completedAt?: string;
}

interface ExerciseItem {
  id: string;
  question: string;
  type: 'text' | 'multiple_choice' | 'single_choice' | 'number';
  options?: string[];
  correctAnswer: any;
  userAnswer?: any;
  isCompleted: boolean;
  explanation?: string;
}

export interface TestResult {
  id: string;
  subject: string;
  topic: string;
  score: number;
  maxScore: number;
  difficulty: 'basic' | 'intermediate' | 'advanced';
  completedAt: string;
  evaluations: Array<{
    questionId: string;
    isCorrect: boolean;
    userAnswer: string;
    correctAnswer: string;
    explanation?: string;
  }>;
  weakAreas?: string[];
  recommendations?: string[];
}

const STORAGE_KEYS = {
  TRACKS: 'learning_tracks',
};

class AILearningTrackService {
  /**
   * Создает учебный трек на основе результатов теста
   */
  async createTrackFromTest(
    testResult: TestResult, 
    includePrerequisites: boolean = true
  ): Promise<LearningTrack> {
    try {
      // Пытаемся создать трек через API
      let track: LearningTrack | null = null;
      
      try {
        const response = await (apiClient as any).ai.generateLearningTrack({
          testId: testResult.id,
          subject: testResult.subject,
          topic: testResult.topic,
          difficulty: testResult.difficulty,
          includePrerequisites,
          weakAreas: testResult.weakAreas || [],
        });
        
        track = response.data;
      } catch (error) {
        console.warn('Не удалось создать трек через API:', error);
      }
      
      // Если не удалось создать через API, создаем локально
      if (!track) {
        track = {
          id: uuidv4(),
          title: `${testResult.subject}: ${testResult.topic}`,
          subject: testResult.subject,
          topic: testResult.topic,
          description: `Учебный трек по теме "${testResult.topic}" предмета "${testResult.subject}"`,
          difficulty: testResult.difficulty,
          createdAt: new Date().toISOString(),
          expectedDuration: 120, // Примерно 2 часа
          progress: {
            completedLessons: 0,
            totalLessons: 0,
            proficiencyLevel: 0
          },
          lessons: [],
        };
        
        // Генерируем уроки с помощью AI
        const generatedLessons = await this.generateLessonsForTrack(
          track.subject,
          track.topic,
          track.difficulty,
          testResult.weakAreas,
          includePrerequisites
        );
        
        track.lessons = generatedLessons;
        
        // Создаем расписание
        const schedule = await this.createSchedule(
          track.lessons,
          new Date(),
          3, // уроков в день
          14 // дней максимум
        );
        
        track.schedule = schedule;
        
        // Сохраняем трек локально
        await this.saveTrack(track);
      }
      
      return track;
    } catch (error) {
      console.error('Ошибка при создании учебного трека:', error);
      throw new Error('Не удалось создать учебный трек');
    }
  }
  
  /**
   * Генерирует контент для урока
   */
  async generateLessonContent(
    subject: string,
    topic: string,
    difficulty: 'basic' | 'intermediate' | 'advanced'
  ): Promise<string> {
    try {
      // Пытаемся получить контент через API
      try {
        const response = await (apiClient as any).ai.generateLessonContent({
          subject,
          topic,
          difficulty,
        });
        
        return response.data.content;
      } catch (error) {
        console.warn('Не удалось получить контент урока через API:', error);
      }
      
      // Если не удалось через API, возвращаем заглушку
      return `# ${topic}\n\n## Введение\n\nЭто учебный материал по теме "${topic}" предмета "${subject}".\n\n## Основная часть\n\nЗдесь должно быть содержание урока.\n\n## Заключение\n\nВ этом разделе подводится итог изученному материалу.`;
    } catch (error) {
      console.error('Ошибка при генерации контента урока:', error);
      throw new Error('Не удалось сгенерировать контент урока');
    }
  }
  
  /**
   * Генерирует упражнения для урока
   */
  async generateExercises(
    subject: string,
    topic: string,
    difficulty: 'basic' | 'intermediate' | 'advanced',
    count: number = 5
  ): Promise<ExerciseItem[]> {
    try {
      // Пытаемся получить упражнения через API
      try {
        const response = await (apiClient as any).ai.generateExercises({
          subject,
          topic,
          difficulty,
          count,
        });
        
        return response.data.exercises;
      } catch (error) {
        console.warn('Не удалось получить упражнения через API:', error);
      }
      
      // Если не удалось через API, возвращаем заглушки
      const exercises: ExerciseItem[] = [];
      
      for (let i = 0; i < count; i++) {
        exercises.push({
          id: uuidv4(),
          question: `Вопрос ${i + 1} по теме "${topic}"`,
          type: 'text',
          correctAnswer: `Ответ на вопрос ${i + 1}`,
          isCompleted: false,
          explanation: `Объяснение ответа на вопрос ${i + 1}`,
        });
      }
      
      return exercises;
    } catch (error) {
      console.error('Ошибка при генерации упражнений:', error);
      throw new Error('Не удалось сгенерировать упражнения');
    }
  }
  
  /**
   * Генерирует уроки для учебного трека
   */
  async generateLessonsForTrack(
    subject: string,
    topic: string,
    difficulty: 'basic' | 'intermediate' | 'advanced',
    weakAreas?: string[],
    includePrerequisites: boolean = true
  ): Promise<LessonItem[]> {
    try {
      // Пытаемся получить структуру уроков через API
      try {
        const response = await (apiClient as any).ai.generateLessonsStructure({
          subject,
          topic,
          difficulty,
          weakAreas: weakAreas || [],
          includePrerequisites,
        });
        
        const lessonStructures = response.data.lessons;
        const lessons: LessonItem[] = [];
        
        // Генерируем контент для каждого урока
        for (const lessonStructure of lessonStructures) {
          const lesson: LessonItem = {
            id: uuidv4(),
            title: lessonStructure.title,
            description: lessonStructure.description,
            content: await this.generateLessonContent(subject, lessonStructure.title, difficulty),
            duration: lessonStructure.duration || 15,
            isCompleted: false,
            type: lessonStructure.type || 'theory',
          };
          
          // Если урок с упражнениями, генерируем упражнения
          if (lesson.type === 'exercise') {
            lesson.exercises = await this.generateExercises(
              subject,
              lessonStructure.title,
              difficulty,
              lessonStructure.exerciseCount || 5
            );
          }
          
          lessons.push(lesson);
        }
        
        return lessons;
      } catch (error) {
        console.warn('Не удалось получить структуру уроков через API:', error);
      }
      
      // Если не удалось через API, создаем заглушки
      const lessons: LessonItem[] = [];
      
      // Теоретический урок
      const theoryLesson: LessonItem = {
        id: uuidv4(),
        title: `Теория: ${topic}`,
        description: `Основные понятия и принципы по теме "${topic}"`,
        content: await this.generateLessonContent(subject, topic, difficulty),
        duration: 30,
        isCompleted: false,
        type: 'theory',
      };
      
      // Урок с упражнениями
      const exerciseLesson: LessonItem = {
        id: uuidv4(),
        title: `Практика: ${topic}`,
        description: `Упражнения для закрепления знаний по теме "${topic}"`,
        content: `# Упражнения: ${topic}\n\nВыполните следующие упражнения для закрепления материала.`,
        duration: 20,
        isCompleted: false,
        type: 'exercise',
        exercises: await this.generateExercises(subject, topic, difficulty),
      };
      
      lessons.push(theoryLesson, exerciseLesson);
      
      return lessons;
    } catch (error) {
      console.error('Ошибка при генерации уроков:', error);
      throw new Error('Не удалось сгенерировать уроки');
    }
  }
  
  /**
   * Создает расписание для учебного трека
   */
  async createSchedule(
    lessons: LessonItem[],
    startDate: Date = new Date(),
    lessonsPerDay: number = 2,
    maxDays: number = 7
  ): Promise<LearningTrack['schedule']> {
    try {
      // Пытаемся создать расписание через API
      try {
        const response = await (apiClient as any).ai.generateSchedule({
          lessons: lessons.map(lesson => ({
            id: lesson.id,
            title: lesson.title,
            duration: lesson.duration,
            type: lesson.type,
          })),
          startDate: startDate.toISOString(),
          lessonsPerDay,
          maxDays,
        });
        
        return response.data.schedule;
      } catch (error) {
        console.warn('Не удалось создать расписание через API:', error);
      }
      
      // Если не удалось через API, создаем локально
      const schedule: LearningTrack['schedule'] = { days: [] };
      const currentDate = new Date(startDate);
      
      // Распределяем уроки по дням
      let currentDay = 0;
      let currentLessonsInDay = 0;
      let currentDayLessons: string[] = [];
      
      for (const lesson of lessons) {
        if (currentLessonsInDay >= lessonsPerDay) {
          // Добавляем день в расписание
          schedule.days.push({
            date: new Date(currentDate).toISOString(),
            lessons: [...currentDayLessons],
          });
          
          // Переходим к следующему дню
          currentDate.setDate(currentDate.getDate() + 1);
          currentDay++;
          currentLessonsInDay = 0;
          currentDayLessons = [];
          
          // Проверяем, не превысили ли максимальное количество дней
          if (currentDay >= maxDays) {
            break;
          }
        }
        
        // Добавляем урок в текущий день
        currentDayLessons.push(lesson.id);
        currentLessonsInDay++;
      }
      
      // Если остались уроки в последнем дне, добавляем их
      if (currentDayLessons.length > 0) {
        schedule.days.push({
          date: new Date(currentDate).toISOString(),
          lessons: [...currentDayLessons],
        });
      }
      
      return schedule;
    } catch (error) {
      console.error('Ошибка при создании расписания:', error);
      throw new Error('Не удалось создать расписание');
    }
  }
  
  /**
   * Сохраняет трек в локальное хранилище
   */
  async saveTrack(track: LearningTrack): Promise<LearningTrack> {
    try {
      // Получаем все треки
      const allTracks = await this.getAllTracks();
      
      // Ищем индекс текущего трека
      const index = allTracks.findIndex(t => t.id === track.id);
      
      if (index !== -1) {
        // Обновляем существующий трек
        allTracks[index] = track;
      } else {
        // Добавляем новый трек
        allTracks.push(track);
      }
      
      // Сохраняем все треки
      await AsyncStorage.setItem(STORAGE_KEYS.TRACKS, JSON.stringify(allTracks));
      
      return track;
    } catch (error) {
      console.error('Ошибка при сохранении трека:', error);
      throw new Error('Не удалось сохранить трек');
    }
  }
  
  /**
   * Получает трек из локального хранилища
   */
  async getTrack(trackId: string): Promise<LearningTrack | null> {
    try {
      // Получаем все треки
      const tracksJson = await AsyncStorage.getItem(STORAGE_KEYS.TRACKS);
      const tracks: LearningTrack[] = tracksJson ? JSON.parse(tracksJson) : [];
      
      // Ищем трек с нужным id
      const track = tracks.find(t => t.id === trackId);
      
      return track || null;
    } catch (error) {
      console.error('Ошибка при получении трека:', error);
      throw new Error('Не удалось получить трек');
    }
  }
  
  /**
   * Получает все треки из локального хранилища
   */
  async getAllTracks(): Promise<LearningTrack[]> {
    try {
      // Получаем все треки
      const tracksJson = await AsyncStorage.getItem(STORAGE_KEYS.TRACKS);
      const tracks: LearningTrack[] = tracksJson ? JSON.parse(tracksJson) : [];
      
      return tracks;
    } catch (error) {
      console.error('Ошибка при получении всех треков:', error);
      throw new Error('Не удалось получить треки');
    }
  }
  
  /**
   * Удаляет трек из локального хранилища
   */
  async deleteTrack(trackId: string): Promise<void> {
    try {
      // Получаем все треки
      const tracksJson = await AsyncStorage.getItem(STORAGE_KEYS.TRACKS);
      const tracks: LearningTrack[] = tracksJson ? JSON.parse(tracksJson) : [];
      
      // Фильтруем треки, исключая трек с нужным id
      const updatedTracks = tracks.filter(t => t.id !== trackId);
      
      // Сохраняем обновленный список треков
      await AsyncStorage.setItem(STORAGE_KEYS.TRACKS, JSON.stringify(updatedTracks));
    } catch (error) {
      console.error('Ошибка при удалении трека:', error);
      throw new Error('Не удалось удалить трек');
    }
  }
  
  /**
   * Обновляет прогресс трека
   */
  async updateTrackProgress(trackId: string, lessonId: string, isCompleted: boolean): Promise<LearningTrack> {
    try {
      // Получаем трек
      const track = await this.getTrack(trackId);
      
      if (!track) {
        throw new Error('Трек не найден');
      }
      
      // Находим урок
      const lessonIndex = track.lessons.findIndex(lesson => lesson.id === lessonId);
      
      if (lessonIndex === -1) {
        throw new Error('Урок не найден в треке');
      }
      
      // Обновляем статус урока
      const lesson = track.lessons[lessonIndex];
      lesson.isCompleted = isCompleted;
      
      // Если урок завершен, обновляем время завершения
      if (isCompleted) {
        lesson.completedAt = new Date().toISOString();
      } else {
        // Если отменяем завершение, удаляем время завершения
        delete lesson.completedAt;
      }
      
      // Обновляем прогресс
      const completedLessons = track.lessons.filter(lesson => lesson.isCompleted).length;
      const totalLessons = track.lessons.length;
      
      // Обновляем прогресс трека с правильным типом
      track.progress = {
        completedLessons,
        totalLessons,
        proficiencyLevel: Math.floor((completedLessons / totalLessons) * 100)
      };
      
      // Обновляем время изменения
      track.updatedAt = new Date().toISOString();
      
      // Сохраняем обновленный трек
      await this.saveTrack(track);
      
      // Пытаемся обновить на сервере
      try {
        await (apiClient as any).tracks.completeLesson(trackId, lessonId);
      } catch (error) {
        console.warn('Не удалось обновить прогресс на сервере:', error);
      }
      
      return track;
    } catch (error) {
      console.error('Ошибка при обновлении прогресса:', error);
      throw new Error('Не удалось обновить прогресс трека');
    }
  }
}

const aiLearningTrackService = new AILearningTrackService();
export default aiLearningTrackService; 