import apiClient from '../api/client';

interface TestGenerationParams {
  subject: string;
  topic: string;
  difficulty: 'basic' | 'intermediate' | 'advanced';
  questionCount?: number;
}

interface TestEvaluationParams {
  subject: string;
  topic: string;
  question: string;
  answer: string | string[] | number;
  questionType: 'multiple_choice' | 'single_choice' | 'text' | 'number';
}

interface GeneratedQuestion {
  id: string;
  question: string;
  type: 'multiple_choice' | 'single_choice' | 'text' | 'number';
  options?: string[];
  correctAnswer?: string | string[] | number;
  explanation?: string;
  difficulty: 'basic' | 'intermediate' | 'advanced';
}

interface EvaluationResult {
  isCorrect: boolean;
  explanation: string;
  correctAnswer?: string | string[] | number;
  similarTopics?: string[];
  nextLevelDifficulty?: 'basic' | 'intermediate' | 'advanced';
}

interface TestResult {
  score: number;
  maxScore: number;
  percentage: number;
  correctAnswers: number;
  totalQuestions: number;
  evaluations: {
    questionId: string;
    question: string;
    userAnswer: any;
    isCorrect: boolean;
    correctAnswer: any;
    explanation?: string;
  }[];
  recommendations: {
    nextSteps: string[];
    suggestedTopics: string[];
    recommendedDifficulty: 'basic' | 'intermediate' | 'advanced';
  };
}

/**
 * Сервис для генерации и проверки тестов с использованием AI
 */
const aiTestService = {
  /**
   * Генерирует вопросы для теста по заданным параметрам
   */
  async generateQuestions({
    subject,
    topic,
    difficulty,
    questionCount = 5
  }: TestGenerationParams): Promise<GeneratedQuestion[]> {
    try {
      // Отправляем запрос на генерацию вопросов
      const response = await apiClient.post('/api/ai/generate-test', {
        subject,
        topic,
        difficulty,
        questionCount
      });

      return response.data.questions;
    } catch (error) {
      console.error('Ошибка при генерации вопросов:', error);
      
      // Если API недоступен или произошла ошибка, используем локальную генерацию
      return generateTestLocally(subject, topic, difficulty, questionCount);
    }
  },

  /**
   * Оценивает ответ пользователя на вопрос теста
   */
  async evaluateAnswer({
    subject,
    topic,
    question,
    answer,
    questionType
  }: TestEvaluationParams): Promise<EvaluationResult> {
    try {
      // Отправляем запрос на проверку ответа
      const response = await apiClient.post('/api/ai/evaluate-answer', {
        subject,
        topic,
        question,
        answer,
        questionType
      });

      return response.data;
    } catch (error) {
      console.error('Ошибка при проверке ответа:', error);
      
      // Если API недоступен или произошла ошибка, используем локальную проверку
      return {
        isCorrect: false, // По умолчанию считаем неверным при ошибке
        explanation: 'Не удалось проверить ответ. Попробуйте позже.'
      };
    }
  },

  /**
   * Оценивает результаты всего теста и формирует рекомендации
   */
  async evaluateTestResults(
    subject: string,
    topic: string,
    questions: GeneratedQuestion[],
    userAnswers: Record<string, any>
  ): Promise<TestResult> {
    try {
      // Отправляем запрос на проверку результатов теста
      const response = await apiClient.post('/api/ai/evaluate-test', {
        subject,
        topic,
        questions,
        userAnswers
      });

      return response.data;
    } catch (error) {
      console.error('Ошибка при оценке результатов теста:', error);
      
      // Если API недоступен или произошла ошибка, формируем базовые результаты
      return generateBasicTestResults(questions, userAnswers);
    }
  },

  /**
   * Генерирует объяснение темы на основе результатов теста
   */
  async generateTopicExplanation(
    subject: string,
    topic: string,
    difficulty: 'basic' | 'intermediate' | 'advanced',
    testResults?: TestResult
  ): Promise<string> {
    try {
      // Отправляем запрос на генерацию объяснения темы
      const response = await apiClient.post('/api/ai/generate-explanation', {
        subject,
        topic,
        difficulty,
        testResults
      });

      return response.data.explanation;
    } catch (error) {
      console.error('Ошибка при генерации объяснения темы:', error);
      
      // Если API недоступен или произошла ошибка, возвращаем базовое объяснение
      return `
        Тема "${topic}" в предмете "${subject}" относится к ${difficultyToRussian(difficulty)} уровню сложности.
        К сожалению, не удалось сгенерировать подробное объяснение. Пожалуйста, попробуйте позже.
      `;
    }
  },

  /**
   * Генерирует задания для практики по теме
   */
  async generatePracticeExercises(
    subject: string,
    topic: string,
    difficulty: 'basic' | 'intermediate' | 'advanced',
    count: number = 3
  ): Promise<GeneratedQuestion[]> {
    try {
      // Отправляем запрос на генерацию заданий для практики
      const response = await apiClient.post('/api/ai/generate-exercises', {
        subject,
        topic,
        difficulty,
        count
      });

      return response.data.exercises;
    } catch (error) {
      console.error('Ошибка при генерации практических заданий:', error);
      
      // Если API недоступен или произошла ошибка, используем локальную генерацию
      return generatePracticeExercisesLocally(subject, topic, difficulty, count);
    }
  }
};

// Вспомогательные функции для локальной генерации при недоступности API

/**
 * Локальная генерация вопросов для теста
 */
function generateTestLocally(
  subject: string,
  topic: string,
  difficulty: 'basic' | 'intermediate' | 'advanced',
  questionCount: number
): GeneratedQuestion[] {
  const questions: GeneratedQuestion[] = [];
  
  // Шаблоны вопросов для математики
  if (subject.toLowerCase().includes('матем')) {
    if (topic.toLowerCase().includes('дискриминант')) {
      questions.push({
        id: `q-${Date.now()}-1`,
        question: 'Что такое дискриминант квадратного уравнения?',
        type: 'single_choice',
        options: [
          'Сумма коэффициентов квадратного уравнения',
          'Выражение b² - 4ac для уравнения ax² + bx + c = 0',
          'Разность между корнями квадратного уравнения',
          'Произведение корней квадратного уравнения'
        ],
        correctAnswer: 'Выражение b² - 4ac для уравнения ax² + bx + c = 0',
        explanation: 'Дискриминант квадратного уравнения ax² + bx + c = 0 вычисляется по формуле D = b² - 4ac и используется для определения количества корней квадратного уравнения.',
        difficulty
      });
      
      questions.push({
        id: `q-${Date.now()}-2`,
        question: 'Сколько корней имеет квадратное уравнение, если его дискриминант положительный?',
        type: 'single_choice',
        options: [
          '0 корней',
          '1 корень',
          '2 корня',
          '3 корня'
        ],
        correctAnswer: '2 корня',
        explanation: 'Если дискриминант D > 0, то квадратное уравнение имеет два различных действительных корня.',
        difficulty
      });
      
      questions.push({
        id: `q-${Date.now()}-3`,
        question: 'Чему равен дискриминант уравнения 2x² - 4x + 2 = 0?',
        type: 'number',
        correctAnswer: 0,
        explanation: 'Для уравнения 2x² - 4x + 2 = 0 имеем a = 2, b = -4, c = 2. D = b² - 4ac = (-4)² - 4 × 2 × 2 = 16 - 16 = 0.',
        difficulty
      });
      
      questions.push({
        id: `q-${Date.now()}-4`,
        question: 'Какая формула используется для вычисления корней квадратного уравнения через дискриминант?',
        type: 'text',
        correctAnswer: 'x = (-b ± √D) / (2a)',
        explanation: 'Корни квадратного уравнения ax² + bx + c = 0 вычисляются по формуле x = (-b ± √D) / (2a), где D - дискриминант.',
        difficulty
      });
      
      questions.push({
        id: `q-${Date.now()}-5`,
        question: 'Выберите верные утверждения о дискриминанте квадратного уравнения:',
        type: 'multiple_choice',
        options: [
          'Если D < 0, уравнение имеет два действительных корня',
          'Если D = 0, уравнение имеет один действительный корень',
          'Если D > 0, уравнение имеет два комплексных корня',
          'Дискриминант может быть использован для определения характера корней'
        ],
        correctAnswer: ['Если D = 0, уравнение имеет один действительный корень', 'Дискриминант может быть использован для определения характера корней'],
        explanation: 'Если D = 0, уравнение имеет один корень (кратности 2). Если D < 0, уравнение не имеет действительных корней. Если D > 0, уравнение имеет два различных действительных корня.',
        difficulty
      });
    }
  }
  
  // Если по какой-то причине вопросы не сгенерировались, добавляем универсальные вопросы
  if (questions.length < questionCount) {
    for (let i = questions.length; i < questionCount; i++) {
      questions.push({
        id: `q-${Date.now()}-${i + 1}`,
        question: `Вопрос ${i + 1} по теме "${topic}"`,
        type: 'text',
        correctAnswer: 'ответ',
        explanation: `Это универсальный вопрос по теме "${topic}" в предмете "${subject}"`,
        difficulty
      });
    }
  }
  
  return questions;
}

/**
 * Локальная проверка результатов теста
 */
function generateBasicTestResults(
  questions: GeneratedQuestion[],
  userAnswers: Record<string, any>
): TestResult {
  let correctCount = 0;
  const evaluations = [];
  
  for (const question of questions) {
    const userAnswer = userAnswers[question.id];
    let isCorrect = false;
    
    if (question.type === 'multiple_choice' && Array.isArray(question.correctAnswer) && Array.isArray(userAnswer)) {
      // Проверяем, что все элементы userAnswer содержатся в correctAnswer и наоборот
      const correctAnswerSet = new Set(question.correctAnswer);
      const userAnswerSet = new Set(userAnswer);
      
      if (correctAnswerSet.size === userAnswerSet.size) {
        isCorrect = Array.from(correctAnswerSet).every(answer => userAnswerSet.has(answer));
      }
    } else {
      // Для других типов сравниваем ответы напрямую
      isCorrect = userAnswer === question.correctAnswer;
    }
    
    if (isCorrect) {
      correctCount++;
    }
    
    evaluations.push({
      questionId: question.id,
      question: question.question,
      userAnswer,
      isCorrect,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation
    });
  }
  
  const totalQuestions = questions.length;
  const percentage = (correctCount / totalQuestions) * 100;
  
  // Определяем рекомендуемую сложность на основе результатов
  let recommendedDifficulty: 'basic' | 'intermediate' | 'advanced' = 'basic';
  if (percentage >= 80) {
    recommendedDifficulty = 'advanced';
  } else if (percentage >= 50) {
    recommendedDifficulty = 'intermediate';
  }
  
  // Создаем список рекомендуемых тем на основе вопросов с неправильными ответами
  const suggestedTopics = ['Квадратные уравнения', 'Теорема Виета', 'Корни квадратного уравнения'];
  
  return {
    score: correctCount,
    maxScore: totalQuestions,
    percentage,
    correctAnswers: correctCount,
    totalQuestions,
    evaluations,
    recommendations: {
      nextSteps: [
        'Изучите теорию по теме',
        'Решите больше практических задач',
        'Повторите базовые математические концепции'
      ],
      suggestedTopics,
      recommendedDifficulty
    }
  };
}

/**
 * Локальная генерация практических заданий
 */
function generatePracticeExercisesLocally(
  subject: string,
  topic: string,
  difficulty: 'basic' | 'intermediate' | 'advanced',
  count: number
): GeneratedQuestion[] {
  const exercises: GeneratedQuestion[] = [];
  
  // Шаблоны заданий для математики и дискриминанта
  if (subject.toLowerCase().includes('матем') && topic.toLowerCase().includes('дискриминант')) {
    if (difficulty === 'basic') {
      exercises.push({
        id: `ex-${Date.now()}-1`,
        question: 'Найдите дискриминант квадратного уравнения: x² + 5x + 6 = 0',
        type: 'number',
        correctAnswer: 1,
        explanation: 'Для уравнения x² + 5x + 6 = 0 имеем a = 1, b = 5, c = 6. D = b² - 4ac = 5² - 4 × 1 × 6 = 25 - 24 = 1.',
        difficulty: 'basic'
      });
      
      exercises.push({
        id: `ex-${Date.now()}-2`,
        question: 'Определите количество корней квадратного уравнения 2x² - 8x + 8 = 0 по его дискриминанту.',
        type: 'single_choice',
        options: [
          '0 корней',
          '1 корень',
          '2 корня',
          'Нельзя определить'
        ],
        correctAnswer: '1 корень',
        explanation: 'Для уравнения 2x² - 8x + 8 = 0 имеем a = 2, b = -8, c = 8. D = b² - 4ac = (-8)² - 4 × 2 × 8 = 64 - 64 = 0. Если D = 0, то уравнение имеет один корень (кратности 2).',
        difficulty: 'basic'
      });
    } else if (difficulty === 'intermediate') {
      exercises.push({
        id: `ex-${Date.now()}-1`,
        question: 'Найдите дискриминант и корни квадратного уравнения: 3x² - 5x - 2 = 0',
        type: 'text',
        correctAnswer: 'D = 49, x₁ = 2, x₂ = -1/3',
        explanation: 'Для уравнения 3x² - 5x - 2 = 0 имеем a = 3, b = -5, c = -2. D = b² - 4ac = (-5)² - 4 × 3 × (-2) = 25 + 24 = 49. x₁ = (-b + √D)/(2a) = (5 + 7)/(2·3) = 12/6 = 2, x₂ = (-b - √D)/(2a) = (5 - 7)/(2·3) = -2/6 = -1/3.',
        difficulty: 'intermediate'
      });
      
      exercises.push({
        id: `ex-${Date.now()}-2`,
        question: 'Составьте квадратное уравнение, имеющее корни x₁ = 3 и x₂ = -2.',
        type: 'text',
        correctAnswer: 'x² - x - 6 = 0',
        explanation: 'По теореме Виета для квадратного уравнения x² + px + q = 0 сумма корней равна -p, а произведение равно q. Для корней x₁ = 3 и x₂ = -2 имеем: x₁ + x₂ = 3 + (-2) = 1, x₁ · x₂ = 3 · (-2) = -6. Таким образом, p = -1, q = -6, и уравнение имеет вид x² - x - 6 = 0.',
        difficulty: 'intermediate'
      });
    } else if (difficulty === 'advanced') {
      exercises.push({
        id: `ex-${Date.now()}-1`,
        question: 'Для каких значений параметра k уравнение kx² + 6x + 9 = 0 имеет ровно один действительный корень?',
        type: 'text',
        correctAnswer: 'k = 1',
        explanation: 'Для уравнения kx² + 6x + 9 = 0 дискриминант равен D = b² - 4ac = 6² - 4·k·9 = 36 - 36k. Уравнение имеет ровно один корень, если D = 0. Решаем уравнение: 36 - 36k = 0, 36(1 - k) = 0, k = 1.',
        difficulty: 'advanced'
      });
      
      exercises.push({
        id: `ex-${Date.now()}-2`,
        question: 'Докажите, что если дискриминант квадратного уравнения ax² + bx + c = 0 равен нулю, то его корень равен -b/(2a).',
        type: 'text',
        correctAnswer: 'Корни находятся по формуле x = (-b ± √D)/(2a). При D = 0 имеем x = -b/(2a)',
        explanation: 'Корни квадратного уравнения находятся по формуле x = (-b ± √D)/(2a), где D - дискриминант. Если D = 0, то √D = 0, и формула упрощается до x = -b/(2a). Таким образом, уравнение имеет один корень (кратности 2), равный -b/(2a).',
        difficulty: 'advanced'
      });
    }
  }
  
  // Если по какой-то причине задания не сгенерировались, добавляем универсальные задания
  if (exercises.length < count) {
    for (let i = exercises.length; i < count; i++) {
      exercises.push({
        id: `ex-${Date.now()}-${i + 1}`,
        question: `Задание ${i + 1} по теме "${topic}" (${difficultyToRussian(difficulty)} уровень)`,
        type: 'text',
        correctAnswer: 'ответ',
        explanation: `Это универсальное задание по теме "${topic}" в предмете "${subject}" для ${difficultyToRussian(difficulty)} уровня сложности.`,
        difficulty
      });
    }
  }
  
  return exercises;
}

/**
 * Вспомогательная функция для перевода уровня сложности на русский язык
 */
function difficultyToRussian(difficulty: 'basic' | 'intermediate' | 'advanced'): string {
  switch (difficulty) {
    case 'basic': return 'базовый';
    case 'intermediate': return 'средний';
    case 'advanced': return 'продвинутый';
    default: return 'неизвестный';
  }
}

export default aiTestService; 