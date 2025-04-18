import { router } from 'expo-router';
import logger from '../utils/logger';

// Интерфейсы для типизации данных
export interface TestQuestion {
  id: string;
  question: string;
  options?: string[];
  correctAnswer?: string;
  type: 'multiple-choice' | 'open-ended' | 'self-assessment';
}

export interface TestResult {
  userId: string;
  testId: string;
  weakTopics: string[];
  successfulTopics: string[];
  score: number;
  recommendations: string[];
}

export interface LearningTrack {
  id: string;
  name: string;
  description: string;
  subject: string;
  topic: string;
  createdAt: string;
  lessons: Lesson[];
  tests: Test[];
  schedule?: Schedule;
}

export interface Lesson {
  id: string;
  title: string;
  content: string;
  difficulty: 1 | 2 | 3; // 1=Легкий, 2=Средний, 3=Сложный
  stars: 0 | 1 | 2 | 3; // Количество звезд, которые пользователь получил
  assignments: Assignment[];
  examples: Example[];
  completed: boolean;
}

export interface Assignment {
  id: string;
  question: string;
  difficulty: 1 | 2 | 3;
  solution?: string;
  userAnswer?: string;
  isCorrect?: boolean;
}

export interface Example {
  id: string;
  title: string;
  content: string;
  solution: string;
}

export interface Test {
  id: string;
  title: string;
  description: string;
  questions: TestQuestion[];
  results?: TestResult;
}

export interface Schedule {
  startDate: string;
  endDate: string;
  dailyHours: number;
  sessions: ScheduleSession[];
}

export interface ScheduleSession {
  date: string;
  startTime: string;
  endTime: string;
  lessons: string[]; // ID уроков
  completed: boolean;
}

// Класс агента-ассистента (чат-бот)
export class AssistantAgent {
  private apiBaseUrl: string;
  private token: string;

  constructor(apiBaseUrl: string, token: string) {
    this.apiBaseUrl = apiBaseUrl;
    this.token = token;
  }

  // Метод для отправки сообщения и обработки ответа
  async processUserQuery(message: string): Promise<{
    response: string;
    action?: 'START_TEST' | 'SHOW_MENU' | 'GENERATE_TRACK';
    testType?: 'T1' | 'T2';
    subject?: string;
    topic?: string;
  }> {
    try {
      // Анализируем сообщение пользователя
      const { subject, topic, urgent } = this.analyzeUserMessage(message);
      
      // Определяем, нужно ли начать тест
      if (subject && topic) {
        // Если запрос содержит предмет и тему, предлагаем тест T1
        return {
          response: `Вы хотите разобраться с темой "${topic}" по предмету "${subject}". Предлагаю пройти короткий тест, чтобы я мог лучше понять ваш текущий уровень знаний.`,
          action: 'START_TEST',
          testType: 'T1',
          subject,
          topic
        };
      } else if (subject && urgent) {
        // Если запрос содержит только предмет и упоминание срока, предлагаем тест T2
        return {
          response: `Вы хотите освоить предмет "${subject}" в ограниченные сроки. Давайте проведем диагностику ваших текущих знаний, чтобы составить эффективную программу обучения.`,
          action: 'START_TEST',
          testType: 'T2',
          subject
        };
      }
      
      // Стандартный ответ, если не удалось определить конкретное намерение
      return {
        response: `Привет! Я ваш образовательный ассистент. Расскажите, с каким предметом или темой у вас возникли сложности, и я помогу вам разобраться.`
      };
    } catch (error) {
      logger.error('Error in processUserQuery', error);
      return {
        response: 'Извините, произошла ошибка при обработке вашего запроса. Пожалуйста, попробуйте еще раз.'
      };
    }
  }

  // Метод для анализа сообщения пользователя
  private analyzeUserMessage(message: string): { 
    subject?: string; 
    topic?: string; 
    urgent?: boolean 
  } {
    const lowerMessage = message.toLowerCase();
    
    // Определяем предмет
    let subject: string | undefined;
    if (lowerMessage.includes('математик')) subject = 'математика';
    else if (lowerMessage.includes('физик')) subject = 'физика';
    else if (lowerMessage.includes('химия')) subject = 'химия';
    else if (lowerMessage.includes('биолог')) subject = 'биология';
    else if (lowerMessage.includes('истори')) subject = 'история';
    else if (lowerMessage.includes('географ')) subject = 'география';
    else if (lowerMessage.includes('информатик')) subject = 'информатика';
    else if (lowerMessage.includes('программирован')) subject = 'программирование';
    else if (lowerMessage.includes('английск')) subject = 'английский';
    
    // Определяем, есть ли упоминание о сроке
    const urgent = lowerMessage.includes('срок') || 
                   lowerMessage.includes('быстро') || 
                   lowerMessage.includes('скоро') ||
                   lowerMessage.includes('экзамен');
    
    // Определяем тему (это сложнее и требует более продвинутого NLP)
    // Для демонстрации используем упрощенный подход
    let topic: string | undefined;
    
    // Темы по математике
    if (subject === 'математика') {
      if (lowerMessage.includes('дискриминант')) topic = 'дискриминант';
      else if (lowerMessage.includes('уравнен')) topic = 'уравнения';
      else if (lowerMessage.includes('функц')) topic = 'функции';
      else if (lowerMessage.includes('производн')) topic = 'производные';
      else if (lowerMessage.includes('интеграл')) topic = 'интегралы';
      else if (lowerMessage.includes('треугольник')) topic = 'треугольники';
      else if (lowerMessage.includes('геометр')) topic = 'геометрия';
    }
    
    return { subject, topic, urgent };
  }
}

// Класс агента генерации контента
export class ContentGenerationAgent {
  private apiBaseUrl: string;
  private token: string;

  constructor(apiBaseUrl: string, token: string) {
    this.apiBaseUrl = apiBaseUrl;
    this.token = token;
  }

  // Метод для генерации урока
  async generateLesson(subject: string, topic: string, userLevel: number): Promise<Lesson> {
    try {
      // Здесь будет запрос к API для генерации урока
      // В настоящей реализации использовался бы запрос к GigaChat API
      
      // Для демонстрации возвращаем моковые данные
      const lessonId = `lesson-${Date.now()}`;
      
      return {
        id: lessonId,
        title: `${topic} - ${subject}`,
        content: `# ${topic}\n\nЭто содержание урока по теме "${topic}" по предмету "${subject}".\n\nЗдесь будет полное объяснение темы с примерами.`,
        difficulty: userLevel as 1 | 2 | 3,
        stars: 0,
        assignments: await this.generateAssignments(subject, topic, userLevel),
        examples: await this.generateExamples(subject, topic),
        completed: false
      };
    } catch (error) {
      logger.error('Error in generateLesson', error);
      throw error;
    }
  }

  // Метод для генерации заданий
  async generateAssignments(subject: string, topic: string, difficulty: number): Promise<Assignment[]> {
    try {
      // Моковые задания разной сложности
      return [
        {
          id: `assignment-basic-${Date.now()}`,
          question: `Базовое задание по теме "${topic}"`,
          difficulty: 1
        },
        {
          id: `assignment-medium-${Date.now()}`,
          question: `Задание среднего уровня по теме "${topic}"`,
          difficulty: 2
        },
        {
          id: `assignment-advanced-${Date.now()}`,
          question: `Сложное задание по теме "${topic}"`,
          difficulty: 3
        }
      ];
    } catch (error) {
      logger.error('Error in generateAssignments', error);
      throw error;
    }
  }

  // Метод для генерации примеров с решениями
  async generateExamples(subject: string, topic: string): Promise<Example[]> {
    try {
      return [
        {
          id: `example-1-${Date.now()}`,
          title: `Пример 1 по теме "${topic}"`,
          content: `Здесь описание примера...`,
          solution: `Здесь подробное решение примера...`
        },
        {
          id: `example-2-${Date.now()}`,
          title: `Пример 2 по теме "${topic}"`,
          content: `Здесь описание примера...`,
          solution: `Здесь подробное решение примера...`
        }
      ];
    } catch (error) {
      logger.error('Error in generateExamples', error);
      throw error;
    }
  }
}

// Класс агента проверки заданий
export class AssignmentCheckAgent {
  private apiBaseUrl: string;
  private token: string;

  constructor(apiBaseUrl: string, token: string) {
    this.apiBaseUrl = apiBaseUrl;
    this.token = token;
  }

  // Метод для проверки решения пользователя
  async checkSolution(assignment: Assignment, userAnswer: string): Promise<{
    isCorrect: boolean;
    feedback: string;
    stars?: number;
  }> {
    try {
      // Здесь будет проверка решения через API
      // В реальной реализации отправлялся бы запрос к GigaChat API
      
      // Для демонстрации используем случайный результат
      const isCorrect = Math.random() > 0.3; // 70% шанс правильного ответа
      
      return {
        isCorrect,
        feedback: isCorrect 
          ? `Верно! Вы правильно решили задание.` 
          : `К сожалению, решение содержит ошибки. Попробуйте еще раз.`,
        stars: isCorrect ? assignment.difficulty : 0
      };
    } catch (error) {
      logger.error('Error in checkSolution', error);
      throw error;
    }
  }
}

// Класс аналитического агента
export class AnalyticalAgent {
  private apiBaseUrl: string;
  private token: string;

  constructor(apiBaseUrl: string, token: string) {
    this.apiBaseUrl = apiBaseUrl;
    this.token = token;
  }

  // Метод для анализа результатов теста
  async analyzeTestResults(test: Test, answers: Record<string, string>): Promise<TestResult> {
    try {
      // Здесь будет анализ результатов теста через API
      // В настоящей реализации использовался бы запрос к GigaChat API
      
      // Для демонстрации возвращаем моковые данные
      return {
        userId: 'user-123',
        testId: test.id,
        weakTopics: ['дискриминант', 'производные'],
        successfulTopics: ['простые уравнения', 'линейные функции'],
        score: 65, // процент выполнения
        recommendations: [
          'Рекомендуется повторить тему "дискриминант"',
          'Необходимо изучить базовые принципы дифференцирования'
        ]
      };
    } catch (error) {
      logger.error('Error in analyzeTestResults', error);
      throw error;
    }
  }

  // Метод для расчета времени обучения
  calculateLearningTime(weakTopics: string[], userLevel: number): {
    totalHours: number;
    recommendedDailyHours: number;
    recommendedDays: number;
  } {
    // Примерный расчет времени на основе количества тем и уровня пользователя
    const hoursPerTopic = userLevel === 1 ? 4 : userLevel === 2 ? 3 : 2;
    const totalHours = weakTopics.length * hoursPerTopic;
    
    const recommendedDailyHours = 2; // Рекомендуем 2 часа в день
    const recommendedDays = Math.ceil(totalHours / recommendedDailyHours);
    
    return {
      totalHours,
      recommendedDailyHours,
      recommendedDays
    };
  }
}

// Класс планировщика
export class SchedulerAgent {
  // Метод для создания расписания
  createSchedule(
    startDate: Date, 
    topics: string[], 
    hoursPerDay: number, 
    deadline?: Date
  ): Schedule {
    const startDateStr = startDate.toISOString().split('T')[0];
    let endDate: Date;
    
    if (deadline) {
      endDate = new Date(deadline);
    } else {
      // Если дедлайн не указан, рассчитываем примерную дату окончания
      const totalDays = Math.ceil((topics.length * 3) / hoursPerDay); // 3 часа на тему
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + totalDays);
    }
    
    const endDateStr = endDate.toISOString().split('T')[0];
    const sessions: ScheduleSession[] = this.generateSessions(startDate, endDate, topics, hoursPerDay);
    
    return {
      startDate: startDateStr,
      endDate: endDateStr,
      dailyHours: hoursPerDay,
      sessions
    };
  }
  
  // Генерация сессий обучения
  private generateSessions(
    startDate: Date, 
    endDate: Date, 
    topics: string[], 
    hoursPerDay: number
  ): ScheduleSession[] {
    const sessions: ScheduleSession[] = [];
    const currentDate = new Date(startDate);
    let topicIndex = 0;
    
    while (currentDate <= endDate && topicIndex < topics.length) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const startTime = '18:00'; // Начало занятий (можно настроить)
      const endTime = `${18 + hoursPerDay}:00`; // Конец занятий
      
      // Определяем темы для этого дня
      const lessonsForDay: string[] = [];
      const topicsPerDay = Math.ceil(hoursPerDay / 2); // Примерно 2 часа на тему
      
      for (let i = 0; i < topicsPerDay && topicIndex < topics.length; i++) {
        lessonsForDay.push(`lesson-${topics[topicIndex]}`);
        topicIndex++;
      }
      
      sessions.push({
        date: dateStr,
        startTime,
        endTime,
        lessons: lessonsForDay,
        completed: false
      });
      
      // Переходим к следующему дню
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return sessions;
  }
}

// Фабрика для создания агентов
export class AgentFactory {
  private apiBaseUrl: string;
  private token: string;
  
  constructor(apiBaseUrl: string, token: string) {
    this.apiBaseUrl = apiBaseUrl;
    this.token = token;
  }
  
  // Создаем необходимые агенты
  createAssistantAgent(): AssistantAgent {
    return new AssistantAgent(this.apiBaseUrl, this.token);
  }
  
  createContentGenerationAgent(): ContentGenerationAgent {
    return new ContentGenerationAgent(this.apiBaseUrl, this.token);
  }
  
  createAssignmentCheckAgent(): AssignmentCheckAgent {
    return new AssignmentCheckAgent(this.apiBaseUrl, this.token);
  }
  
  createAnalyticalAgent(): AnalyticalAgent {
    return new AnalyticalAgent(this.apiBaseUrl, this.token);
  }
  
  createSchedulerAgent(): SchedulerAgent {
    return new SchedulerAgent();
  }
} 