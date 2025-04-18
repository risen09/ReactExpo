import { useState, useEffect, useCallback } from 'react';
import api from '../api/client';

export interface LessonContent {
  id: string;
  title: string;
  type: 'video' | 'text' | 'quiz' | 'coding' | 'interactive';
  content: string; // HTML контент или URL в случае видео
  estimatedTimeMinutes: number;
  position: number; // Порядковый номер в треке
  videoUrl?: string;
  quizQuestions?: QuizQuestion[];
  codeExercises?: CodeExercise[];
  interactiveElements?: InteractiveElement[];
  nextLessonId?: string;
  previousLessonId?: string;
}

export interface Lesson {
  id: string;
  trackId: string;
  title: string;
  description: string;
  type: 'video' | 'text' | 'quiz' | 'coding' | 'interactive';
  position: number;
  estimatedTimeMinutes: number;
  isCompleted: boolean;
  isAvailable: boolean; // Доступен ли урок (может быть заблокирован)
  completedAt?: string;
  thumbnailUrl?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

export interface CodeExercise {
  id: string;
  title: string;
  description: string;
  startingCode: string;
  language: 'javascript' | 'python' | 'java' | 'csharp' | 'cpp';
  solutionCode: string;
  testCases: {
    input: string;
    expectedOutput: string;
  }[];
}

export interface InteractiveElement {
  id: string;
  type: 'drag-drop' | 'fill-blank' | 'match' | 'code-editor';
  title: string;
  content: any; // Структура зависит от типа интерактивного элемента
}

export interface LessonProgress {
  userId: string;
  lessonId: string;
  trackId: string;
  startedAt: string;
  completedAt?: string;
  lastPosition?: number; // Для отслеживания прогресса в видео
  isCompleted: boolean;
  timeSpentMinutes: number;
  attempts: number; // Количество попыток (для квизов)
  score?: number; // Оценка (для квизов и упражнений)
}

export const useLessons = (trackId: string) => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [currentLesson, setCurrentLesson] = useState<LessonContent | null>(null);
  const [lessonProgress, setLessonProgress] = useState<LessonProgress | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Загрузка всех уроков трека
  const fetchLessons = useCallback(async () => {
    if (!trackId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get(`/learning/tracks/${trackId}/lessons`);
      setLessons(response.data);
    } catch (err) {
      setError('Не удалось загрузить уроки');
      console.error('Error fetching lessons:', err);
    } finally {
      setLoading(false);
    }
  }, [trackId]);

  // Загрузка конкретного урока
  const fetchLessonById = useCallback(async (lessonId: string) => {
    if (!trackId || !lessonId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get(`/learning/tracks/${trackId}/lessons/${lessonId}`);
      setCurrentLesson(response.data);
      
      // Загружаем прогресс урока
      await fetchLessonProgress(lessonId);
    } catch (err) {
      setError('Не удалось загрузить урок');
      console.error(`Error fetching lesson ${lessonId}:`, err);
    } finally {
      setLoading(false);
    }
  }, [trackId]);

  // Загрузка прогресса урока
  const fetchLessonProgress = useCallback(async (lessonId: string) => {
    if (!trackId || !lessonId) return;
    
    try {
      const response = await api.get(`/learning/tracks/${trackId}/lessons/${lessonId}/progress`);
      setLessonProgress(response.data);
    } catch (err) {
      console.error(`Error fetching lesson progress for ${lessonId}:`, err);
      // Не устанавливаем ошибку, так как это не критично
    }
  }, [trackId]);

  // Обновление прогресса урока
  const updateLessonProgress = useCallback(async (
    lessonId: string, 
    progressData: Partial<LessonProgress>
  ) => {
    if (!trackId || !lessonId) return;
    
    setLoading(true);
    
    try {
      const response = await api.post(
        `/learning/tracks/${trackId}/lessons/${lessonId}/progress`, 
        progressData
      );
      setLessonProgress(response.data);
    } catch (err) {
      setError('Не удалось обновить прогресс урока');
      console.error(`Error updating lesson progress for ${lessonId}:`, err);
    } finally {
      setLoading(false);
    }
  }, [trackId]);

  // Отметить урок как выполненный
  const markLessonAsCompleted = useCallback(async (lessonId: string, timeSpentMinutes: number) => {
    if (!trackId || !lessonId) return;
    
    setLoading(true);
    
    try {
      await api.tracks.completeLesson(trackId, lessonId);
      
      // Обновляем локальное состояние
      setLessons(prevLessons => 
        prevLessons.map(lesson => 
          lesson.id === lessonId
            ? { ...lesson, isCompleted: true, completedAt: new Date().toISOString() }
            : lesson
        )
      );
      
      // Обновляем прогресс урока
      await updateLessonProgress(lessonId, {
        isCompleted: true,
        completedAt: new Date().toISOString(),
        timeSpentMinutes: timeSpentMinutes
      });
      
    } catch (err) {
      setError('Не удалось отметить урок как выполненный');
      console.error(`Error marking lesson ${lessonId} as completed:`, err);
    } finally {
      setLoading(false);
    }
  }, [trackId, updateLessonProgress]);

  // Отправка результатов квиза
  const submitQuizResults = useCallback(async (
    lessonId: string, 
    answers: { questionId: string, selectedOptionIndex: number }[],
    timeSpentMinutes: number
  ) => {
    if (!trackId || !lessonId) return;
    
    setLoading(true);
    
    try {
      const response = await api.post(
        `/learning/tracks/${trackId}/lessons/${lessonId}/quiz-results`, 
        { answers, timeSpentMinutes }
      );
      
      const result = response.data;
      
      // Если результат положительный, отмечаем урок как выполненный
      if (result.passed) {
        await markLessonAsCompleted(lessonId, timeSpentMinutes);
      }
      
      return result;
    } catch (err) {
      setError('Не удалось отправить результаты квиза');
      console.error(`Error submitting quiz results for ${lessonId}:`, err);
    } finally {
      setLoading(false);
    }
  }, [trackId, markLessonAsCompleted]);

  // Отправка результатов кодинг-упражнения
  const submitCodeExercise = useCallback(async (
    lessonId: string, 
    exerciseId: string,
    code: string,
    timeSpentMinutes: number
  ) => {
    if (!trackId || !lessonId) return;
    
    setLoading(true);
    
    try {
      const response = await api.post(
        `/learning/tracks/${trackId}/lessons/${lessonId}/code-exercise-results`, 
        { exerciseId, code, timeSpentMinutes }
      );
      
      const result = response.data;
      
      // Если все тесты прошли, отмечаем урок как выполненный
      if (result.allTestsPassed) {
        await markLessonAsCompleted(lessonId, timeSpentMinutes);
      }
      
      return result;
    } catch (err) {
      setError('Не удалось проверить код');
      console.error(`Error submitting code exercise for ${lessonId}:`, err);
    } finally {
      setLoading(false);
    }
  }, [trackId, markLessonAsCompleted]);

  // Получить следующий доступный урок
  const getNextAvailableLesson = useCallback(() => {
    if (!lessons.length) return null;
    
    // Сначала пытаемся найти следующий урок от текущего
    if (currentLesson) {
      const currentIndex = lessons.findIndex(lesson => lesson.id === currentLesson.id);
      
      if (currentIndex !== -1 && currentIndex < lessons.length - 1) {
        const nextLesson = lessons[currentIndex + 1];
        if (nextLesson.isAvailable) {
          return nextLesson;
        }
      }
    }
    
    // Если нет текущего урока или следующий недоступен, 
    // находим первый незавершенный доступный урок
    const nextLesson = lessons.find(lesson => !lesson.isCompleted && lesson.isAvailable);
    return nextLesson || null;
  }, [lessons, currentLesson]);

  // Загружаем уроки при монтировании компонента или изменении trackId
  useEffect(() => {
    if (trackId) {
      fetchLessons();
    }
  }, [trackId, fetchLessons]);

  return {
    lessons,
    currentLesson,
    lessonProgress,
    loading,
    error,
    fetchLessons,
    fetchLessonById,
    updateLessonProgress,
    markLessonAsCompleted,
    submitQuizResults,
    submitCodeExercise,
    getNextAvailableLesson
  };
};

// Примеры данных для демо (можно удалить при интеграции с реальным API)
export const mockLessons: Lesson[] = [
  {
    id: '1',
    trackId: '1',
    title: 'Введение в Python',
    description: 'Базовое знакомство с языком Python',
    type: 'video',
    position: 1,
    estimatedTimeMinutes: 15,
    isCompleted: true,
    isAvailable: true,
    completedAt: '2023-10-10T14:30:00Z',
    thumbnailUrl: 'https://example.com/thumbnail1.jpg'
  },
  {
    id: '2',
    trackId: '1',
    title: 'Основы синтаксиса Python',
    description: 'Изучение основных конструкций языка',
    type: 'text',
    position: 2,
    estimatedTimeMinutes: 20,
    isCompleted: true,
    isAvailable: true,
    completedAt: '2023-10-11T16:45:00Z'
  },
  {
    id: '3',
    trackId: '1',
    title: 'Условные операторы',
    description: 'Изучение if/else в Python',
    type: 'text',
    position: 3,
    estimatedTimeMinutes: 25,
    isCompleted: false,
    isAvailable: true
  },
  {
    id: '4',
    trackId: '1',
    title: 'Проверка знаний: основы Python',
    description: 'Тест по пройденному материалу',
    type: 'quiz',
    position: 4,
    estimatedTimeMinutes: 15,
    isCompleted: false,
    isAvailable: false
  }
];

export const mockLessonContent: LessonContent = {
  id: '3',
  title: 'Условные операторы',
  type: 'text',
  content: `
    <h1>Условные операторы в Python</h1>
    <p>Условные операторы позволяют выполнять различные действия в зависимости от условий.</p>
    <h2>Синтаксис if-else:</h2>
    <pre>
    if условие:
        # код, который выполняется, если условие истинно
    else:
        # код, который выполняется, если условие ложно
    </pre>
    <p>Пример:</p>
    <pre>
    x = 10
    if x > 5:
        print("x больше 5")
    else:
        print("x меньше или равен 5")
    </pre>
  `,
  estimatedTimeMinutes: 25,
  position: 3,
  previousLessonId: '2',
  nextLessonId: '4'
};

export const mockLessonProgress: LessonProgress = {
  userId: 'user123',
  lessonId: '3',
  trackId: '1',
  startedAt: '2023-10-15T10:15:00Z',
  isCompleted: false,
  timeSpentMinutes: 8,
  attempts: 0
};

// Мок-реализация хука для демо и тестирования
export const useMockLessons = (trackId: string) => {
  const [lessons, setLessons] = useState<Lesson[]>(mockLessons);
  const [currentLesson, setCurrentLesson] = useState<LessonContent | null>(null);
  const [lessonProgress, setLessonProgress] = useState<LessonProgress | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  
  const fetchLessonById = async (lessonId: string) => {
    setLoading(true);
    
    // Имитация задержки сети
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const foundLesson = mockLessons.find(lesson => lesson.id === lessonId);
    
    if (foundLesson) {
      setCurrentLesson(mockLessonContent);
      setLessonProgress(mockLessonProgress);
    }
    
    setLoading(false);
  };
  
  const markLessonAsCompleted = async (lessonId: string) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setLessons(prevLessons => 
      prevLessons.map(lesson => 
        lesson.id === lessonId
          ? { ...lesson, isCompleted: true, completedAt: new Date().toISOString() }
          : lesson
      )
    );
    
    // Разблокируем следующий урок, если он существует
    const currentIndex = lessons.findIndex(lesson => lesson.id === lessonId);
    if (currentIndex !== -1 && currentIndex < lessons.length - 1) {
      const nextLessonId = lessons[currentIndex + 1].id;
      setLessons(prevLessons => 
        prevLessons.map(lesson => 
          lesson.id === nextLessonId
            ? { ...lesson, isAvailable: true }
            : lesson
        )
      );
    }
    
    setLoading(false);
    return true;
  };
  
  return {
    lessons,
    currentLesson,
    lessonProgress,
    loading,
    error: null,
    fetchLessons: async () => {},
    fetchLessonById,
    updateLessonProgress: async () => {},
    markLessonAsCompleted,
    submitQuizResults: async () => ({ score: 80, passed: true }),
    submitCodeExercise: async () => ({ allTestsPassed: true }),
    getNextAvailableLesson: () => lessons.find(lesson => !lesson.isCompleted && lesson.isAvailable) || null
  };
}; 