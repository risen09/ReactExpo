const express = require('express');
const router = express.Router();
const Test = require('../models/Test');
const Track = require('../models/Track');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Получение теста по ID
router.get('/:id', auth, async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);
    
    if (!test) {
      return res.status(404).json({ message: 'Тест не найден' });
    }
    
    // Проверка доступа пользователя к тесту через трек
    const track = await Track.findOne({ 
      _id: test.trackId,
      userId: req.user.id
    });
    
    if (!track) {
      return res.status(403).json({ message: 'Нет доступа к тесту' });
    }
    
    res.json(test);
  } catch (error) {
    console.error('Error fetching test:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Отправка ответов на тест и получение результатов
router.post('/:id/submit', auth, async (req, res) => {
  try {
    const { answers } = req.body; // Объект с ответами в формате { questionId: 'ответ' }
    
    const test = await Test.findById(req.params.id);
    
    if (!test) {
      return res.status(404).json({ message: 'Тест не найден' });
    }
    
    // Проверка доступа пользователя к тесту через трек
    const track = await Track.findOne({ 
      _id: test.trackId,
      userId: req.user.id
    });
    
    if (!track) {
      return res.status(403).json({ message: 'Нет доступа к тесту' });
    }
    
    // Простой алгоритм для демонстрации (в реальности здесь использовался бы GigaChat API)
    const weakTopics = [];
    const successfulTopics = [];
    let correct = 0;
    let total = test.questions.length;
    
    // Проверяем ответы
    for (const question of test.questions) {
      const userAnswer = answers[question._id];
      const isCorrect = question.type === 'self-assessment' || 
                        (userAnswer && question.correctAnswer && 
                         userAnswer.toLowerCase() === question.correctAnswer.toLowerCase());
      
      if (isCorrect) {
        correct++;
        
        // Добавляем успешные темы
        if (question.type === 'self-assessment' && 
            userAnswer === 'Хорошо знаком' || 
            userAnswer === 'Знаком') {
          const topic = question.question.match(/тему "([^"]+)"/) || 
                       question.question.match(/тему «([^»]+)»/);
          if (topic && topic[1]) {
            successfulTopics.push(topic[1]);
          }
        }
      } else {
        // Добавляем слабые темы
        if (question.type === 'self-assessment' && 
            (userAnswer === 'Сомневаюсь' || 
             userAnswer === 'Не знаком' || 
             userAnswer === 'Практически не знаком')) {
          const topic = question.question.match(/тему "([^"]+)"/) || 
                       question.question.match(/тему «([^»]+)»/);
          if (topic && topic[1]) {
            weakTopics.push(topic[1]);
          }
        } else if (question.type === 'open-ended') {
          weakTopics.push('Практические задания');
        }
      }
    }
    
    // Вычисляем процент правильных ответов
    const score = Math.round((correct / total) * 100);
    
    // Генерируем рекомендации
    const recommendations = [];
    
    if (weakTopics.length > 0) {
      for (const topic of weakTopics) {
        recommendations.push(`Рекомендуется изучить тему "${topic}"`);
      }
    }
    
    if (score < 50) {
      recommendations.push('Рекомендуется начать с базового уровня');
    } else if (score < 80) {
      recommendations.push('Рекомендуется повторить ключевые концепции');
    } else {
      recommendations.push('Вы можете перейти к продвинутым темам');
    }
    
    // Создаем результат теста
    const testResult = {
      userId: req.user.id,
      weakTopics,
      successfulTopics,
      score,
      recommendations
    };
    
    // Сохраняем результат
    test.results = testResult;
    await test.save();
    
    // Добавляем тест в завершенные тесты пользователя
    await User.findByIdAndUpdate(
      req.user.id,
      { $addToSet: { completedTests: test._id } }
    );
    
    res.json(testResult);
  } catch (error) {
    console.error('Error submitting test:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

module.exports = router; 