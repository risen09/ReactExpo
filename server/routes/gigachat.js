const express = require('express');
const router = express.Router();
const axios = require('axios');
const auth = require('../middleware/auth');

// Конфигурация GigaChat API (требуется настроить переменные окружения)
const GIGACHAT_API_URL = process.env.GIGACHAT_API_URL || 'https://gigachat-api.ru/api';
const GIGACHAT_API_KEY = process.env.GIGACHAT_API_KEY;

// Создание нового чата
router.post('/new', auth, async (req, res) => {
  try {
    // В реальном проекте здесь был бы запрос к GigaChat API
    // Для демонстрации используем моковый ответ
    const chatId = `chat-${Date.now()}`;
    
    res.json({
      chat_id: chatId,
      created_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error creating new chat:', error);
    res.status(500).json({ message: 'Ошибка при создании чата' });
  }
});

// Получение списка чатов
router.get('/list', auth, async (req, res) => {
  try {
    // В реальном проекте здесь был бы запрос к GigaChat API
    // Для демонстрации используем моковый ответ
    res.json([
      { id: 'chat-1', lastMessage: 'Привет! Как я могу вам помочь сегодня?' },
      { id: 'chat-2', lastMessage: 'Вот материалы по математике, которые вы запрашивали.' }
    ]);
  } catch (error) {
    console.error('Error fetching chat list:', error);
    res.status(500).json({ message: 'Ошибка при получении списка чатов' });
  }
});

// Получение истории сообщений чата
router.get('/chat/:chatId', auth, async (req, res) => {
  try {
    const { chatId } = req.params;
    
    // В реальном проекте здесь был бы запрос к GigaChat API
    // Для демонстрации используем моковый ответ
    res.json({
      chat_id: chatId,
      messages: [
        {
          role: 'assistant',
          content: 'Привет! Я ваш образовательный помощник. Как я могу вам помочь?',
          timestamp: new Date().toISOString()
        },
        {
          role: 'user',
          content: 'Мне нужна помощь с математикой, 7 класс, тема дискриминант',
          timestamp: new Date().toISOString()
        },
        {
          role: 'assistant',
          content: 'Я могу помочь вам с темой "дискриминант" по математике для 7 класса. Давайте проведем небольшой тест, чтобы определить ваш текущий уровень знаний и подобрать оптимальный способ объяснения.',
          timestamp: new Date().toISOString()
        }
      ]
    });
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    res.status(500).json({ message: 'Ошибка при получении сообщений чата' });
  }
});

// Отправка сообщения в чат
router.post('/chat/:chatId', auth, async (req, res) => {
  try {
    const { chatId } = req.params;
    const { message } = req.body;
    
    // В реальном проекте здесь был бы запрос к GigaChat API
    // Для демонстрации используем простую логику для имитации ответов
    
    let response = '';
    
    // Простая логика для генерации ответов на основе ключевых слов
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('математика') && lowerMessage.includes('дискриминант')) {
      response = 'Дискриминант - это выражение, которое помогает определить, сколько корней имеет квадратное уравнение. Для квадратного уравнения ax² + bx + c = 0 дискриминант вычисляется по формуле D = b² - 4ac. Давайте проведем тест для определения вашего уровня знаний по этой теме.';
    } else if (lowerMessage.includes('математика') && lowerMessage.includes('7 класс')) {
      response = 'Математика 7 класса включает такие темы как линейные уравнения, линейная функция, системы линейных уравнений, степень с натуральным показателем и другие. С какой конкретной темой вам нужна помощь?';
    } else if (lowerMessage.includes('тест')) {
      response = 'Хорошо, давайте проведем тест. Пожалуйста, ответьте на несколько вопросов для определения вашего уровня знаний.';
    } else if (lowerMessage.includes('задание') || lowerMessage.includes('задача')) {
      response = 'Вот задание для практики: Решите квадратное уравнение x² - 5x + 6 = 0 с использованием дискриминанта.';
    } else {
      response = 'Я готов помочь вам с обучением. Пожалуйста, скажите с каким предметом или темой вам нужна помощь.';
    }
    
    res.json({
      chat_id: chatId,
      message: response,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error sending message to chat:', error);
    res.status(500).json({ message: 'Ошибка при отправке сообщения' });
  }
});

// Генерация урока
router.post('/generate-lesson', auth, async (req, res) => {
  try {
    const { subject, topic, difficulty } = req.body;
    
    // В реальном проекте здесь был бы запрос к GigaChat API
    // Для демонстрации используем моковый ответ
    
    // Генерируем примеры для урока
    const examples = [
      {
        title: 'Простой пример',
        content: `Пример использования ${topic} в контексте ${subject}`,
        solution: `Подробное решение примера для темы ${topic}`
      },
      {
        title: 'Более сложный пример',
        content: `Углубленный пример для темы ${topic}`,
        solution: `Шаг за шагом решение сложного примера для темы ${topic}`
      }
    ];
    
    // Генерируем задания для урока
    const assignments = [
      {
        question: `Базовое задание по теме "${topic}"`,
        difficulty: 1,
        solution: `Решение базового задания по теме "${topic}"`
      },
      {
        question: `Задание среднего уровня по теме "${topic}"`,
        difficulty: 2,
        solution: `Решение задания среднего уровня по теме "${topic}"`
      },
      {
        question: `Сложное задание по теме "${topic}"`,
        difficulty: 3,
        solution: `Решение сложного задания по теме "${topic}"`
      }
    ];
    
    res.json({
      title: `${topic} - ${subject}`,
      content: `# ${topic}\n\nЭто содержание урока по теме "${topic}" по предмету "${subject}".\n\nДискриминант - это выражение, которое помогает определить количество корней квадратного уравнения.\n\nДля квадратного уравнения ax² + bx + c = 0, дискриминант (D) вычисляется по формуле:\n\nD = b² - 4ac\n\nЗначение дискриминанта позволяет определить количество корней уравнения:\n- Если D > 0, уравнение имеет два различных действительных корня\n- Если D = 0, уравнение имеет один действительный корень (два совпадающих корня)\n- Если D < 0, уравнение не имеет действительных корней`,
      difficulty,
      examples,
      assignments
    });
  } catch (error) {
    console.error('Error generating lesson:', error);
    res.status(500).json({ message: 'Ошибка при генерации урока' });
  }
});

// Генерация теста
router.post('/generate-test', auth, async (req, res) => {
  try {
    const { subject, topic, testType } = req.body;
    
    // В реальном проекте здесь был бы запрос к GigaChat API
    // Для демонстрации используем моковый ответ
    
    let questions = [];
    
    if (testType === 'T1' && topic) {
      // Тест по конкретной теме
      questions = [
        {
          question: `Насколько хорошо вы знакомы с темой "${topic}" в предмете "${subject}"?`,
          options: ['Хорошо знаком', 'Имею базовое представление', 'Практически не знаком'],
          type: 'self-assessment'
        },
        {
          question: `Что такое ${topic} в контексте ${subject}?`,
          options: ['Вариант 1', 'Вариант 2', 'Вариант 3', 'Вариант 4'],
          correctAnswer: 'Вариант 2',
          type: 'multiple-choice'
        },
        {
          question: `Решите задачу по теме "${topic}": [сгенерированная задача]`,
          type: 'open-ended'
        }
      ];
    } else if (testType === 'T2') {
      // Тест по всему предмету
      questions = [
        {
          question: `Оцените ваш уровень знаний по предмету "${subject}" в целом`,
          options: ['Продвинутый', 'Средний', 'Начинающий'],
          type: 'self-assessment'
        }
      ];
      
      // Добавляем вопросы по основным темам предмета
      if (subject === 'математика') {
        const mathTopics = ['Алгебра', 'Геометрия', 'Тригонометрия', 'Функции', 'Уравнения'];
        mathTopics.forEach((mathTopic) => {
          questions.push({
            question: `Насколько хорошо вы знаете тему "${mathTopic}"?`,
            options: ['Знаком', 'Сомневаюсь', 'Не знаком'],
            type: 'self-assessment'
          });
        });
      }
      
      // Добавляем задачу для проверки знаний
      questions.push({
        question: `Решите задачу по предмету "${subject}": [сгенерированная задача]`,
        type: 'open-ended'
      });
    }
    
    res.json({
      title: testType === 'T1' ? `Тест по теме "${topic}"` : `Диагностика знаний по предмету "${subject}"`,
      description: 'Этот тест поможет оценить ваш текущий уровень знаний и подготовить персонализированный план обучения.',
      testType,
      subject,
      topic,
      questions
    });
  } catch (error) {
    console.error('Error generating test:', error);
    res.status(500).json({ message: 'Ошибка при генерации теста' });
  }
});

// Проверка задания
router.post('/check-assignment', auth, async (req, res) => {
  try {
    const { assignment, userAnswer } = req.body;
    
    // В реальном проекте здесь был бы запрос к GigaChat API
    // Для демонстрации используем простую проверку
    
    // Используем вероятностную проверку для демонстрации
    const isCorrect = Math.random() > 0.3; // 70% шанс правильного ответа
    
    res.json({
      isCorrect,
      feedback: isCorrect 
        ? `Верно! Вы правильно решили задание.` 
        : `К сожалению, решение содержит ошибки. Попробуйте еще раз.`,
      stars: isCorrect ? assignment.difficulty : 0
    });
  } catch (error) {
    console.error('Error checking assignment:', error);
    res.status(500).json({ message: 'Ошибка при проверке задания' });
  }
});

// Анализ результатов теста
router.post('/analyze-test', auth, async (req, res) => {
  try {
    const { test, answers } = req.body;
    
    // В реальном проекте здесь был бы запрос к GigaChat API
    // Для демонстрации используем моковый ответ
    
    res.json({
      userId: req.user.id,
      testId: test.id,
      weakTopics: ['дискриминант', 'производные'],
      successfulTopics: ['простые уравнения', 'линейные функции'],
      score: 65, // процент выполнения
      recommendations: [
        'Рекомендуется повторить тему "дискриминант"',
        'Необходимо изучить базовые принципы дифференцирования'
      ]
    });
  } catch (error) {
    console.error('Error analyzing test results:', error);
    res.status(500).json({ message: 'Ошибка при анализе результатов теста' });
  }
});

// Создание расписания обучения
router.post('/create-schedule', auth, async (req, res) => {
  try {
    const { startDate, topics, hoursPerDay, deadline } = req.body;
    
    // В реальном проекте здесь был бы запрос к GigaChat API
    // Для демонстрации используем моковый ответ
    
    // Рассчитываем количество дней до дедлайна
    const start = new Date(startDate);
    const end = deadline ? new Date(deadline) : new Date(start);
    if (deadline) {
      end.setDate(end.getDate() + Math.ceil(topics.length * 2)); // Приблизительно 2 дня на тему
    }
    
    // Генерируем сессии
    const sessions = [];
    let currentDate = new Date(start);
    
    while (currentDate <= end) {
      // Добавляем сессию
      sessions.push({
        date: new Date(currentDate).toISOString().split('T')[0],
        startTime: '09:00',
        endTime: `${9 + hoursPerDay}:00`,
        lessons: [],
        completed: false
      });
      
      // Увеличиваем дату на 1 день
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    res.json({
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      dailyHours: hoursPerDay,
      sessions
    });
  } catch (error) {
    console.error('Error creating schedule:', error);
    res.status(500).json({ message: 'Ошибка при создании расписания' });
  }
});

module.exports = router; 