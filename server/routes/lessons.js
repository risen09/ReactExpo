const express = require('express');
const router = express.Router();
const Lesson = require('../models/Lesson');
const Track = require('../models/Track');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Получение урока по ID
router.get('/:id', auth, async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    
    if (!lesson) {
      return res.status(404).json({ message: 'Урок не найден' });
    }
    
    // Проверка доступа пользователя к уроку через трек
    const track = await Track.findOne({ 
      _id: lesson.trackId,
      userId: req.user.id
    });
    
    if (!track) {
      return res.status(403).json({ message: 'Нет доступа к уроку' });
    }
    
    res.json(lesson);
  } catch (error) {
    console.error('Error fetching lesson:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Обновление статуса урока (завершен/не завершен)
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { completed } = req.body;
    
    const lesson = await Lesson.findById(req.params.id);
    
    if (!lesson) {
      return res.status(404).json({ message: 'Урок не найден' });
    }
    
    // Проверка доступа пользователя к уроку через трек
    const track = await Track.findOne({ 
      _id: lesson.trackId,
      userId: req.user.id
    });
    
    if (!track) {
      return res.status(403).json({ message: 'Нет доступа к уроку' });
    }
    
    // Обновляем статус
    lesson.completed = completed;
    await lesson.save();
    
    // Если урок завершен, добавляем его в completedLessons пользователя
    if (completed) {
      await User.findByIdAndUpdate(
        req.user.id,
        { $addToSet: { completedLessons: lesson._id } }
      );
    }
    
    res.json(lesson);
  } catch (error) {
    console.error('Error updating lesson status:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Обновление звезд урока (достижения пользователя по уроку)
router.patch('/:id/stars', auth, async (req, res) => {
  try {
    const { stars } = req.body;
    
    if (![1, 2, 3].includes(stars)) {
      return res.status(400).json({ message: 'Количество звезд должно быть от 1 до 3' });
    }
    
    const lesson = await Lesson.findById(req.params.id);
    
    if (!lesson) {
      return res.status(404).json({ message: 'Урок не найден' });
    }
    
    // Проверка доступа пользователя к уроку через трек
    const track = await Track.findOne({ 
      _id: lesson.trackId,
      userId: req.user.id
    });
    
    if (!track) {
      return res.status(403).json({ message: 'Нет доступа к уроку' });
    }
    
    // Обновляем только если новое значение больше текущего
    if (stars > lesson.stars) {
      lesson.stars = stars;
      await lesson.save();
      
      // Добавляем достижение пользователю
      let achievementTitle = '';
      if (stars === 1) achievementTitle = `Базовый уровень по теме "${lesson.title}"`;
      if (stars === 2) achievementTitle = `Средний уровень по теме "${lesson.title}"`;
      if (stars === 3) achievementTitle = `Продвинутый уровень по теме "${lesson.title}"`;
      
      await User.findByIdAndUpdate(
        req.user.id,
        { 
          $push: { 
            achievements: {
              title: achievementTitle,
              date: new Date()
            }
          }
        }
      );
    }
    
    res.json(lesson);
  } catch (error) {
    console.error('Error updating lesson stars:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Проверка задания
router.post('/:id/assignment/:assignmentId/check', auth, async (req, res) => {
  try {
    const { userAnswer } = req.body;
    
    const lesson = await Lesson.findById(req.params.id);
    
    if (!lesson) {
      return res.status(404).json({ message: 'Урок не найден' });
    }
    
    // Проверка доступа пользователя к уроку через трек
    const track = await Track.findOne({ 
      _id: lesson.trackId,
      userId: req.user.id
    });
    
    if (!track) {
      return res.status(403).json({ message: 'Нет доступа к уроку' });
    }
    
    // Находим задание
    const assignment = lesson.assignments.id(req.params.assignmentId);
    
    if (!assignment) {
      return res.status(404).json({ message: 'Задание не найдено' });
    }
    
    // Здесь должна быть логика проверки ответа с использованием GigaChat API
    // Для демонстрации используем простую проверку
    
    // Обновляем ответ пользователя
    assignment.userAnswer = userAnswer;
    
    // Используем вероятностную проверку для демонстрации
    const isCorrect = Math.random() > 0.3; // 70% шанс правильного ответа
    assignment.isCorrect = isCorrect;
    
    await lesson.save();
    
    // Если задание выполнено правильно, обновляем звезды урока
    let stars = 0;
    if (isCorrect) {
      stars = assignment.difficulty;
      
      // Если звезды больше текущих, обновляем
      if (stars > lesson.stars) {
        lesson.stars = stars;
        await lesson.save();
        
        // Добавляем достижение пользователю
        let achievementTitle = '';
        if (stars === 1) achievementTitle = `Базовый уровень по теме "${lesson.title}"`;
        if (stars === 2) achievementTitle = `Средний уровень по теме "${lesson.title}"`;
        if (stars === 3) achievementTitle = `Продвинутый уровень по теме "${lesson.title}"`;
        
        await User.findByIdAndUpdate(
          req.user.id,
          { 
            $push: { 
              achievements: {
                title: achievementTitle,
                date: new Date()
              }
            }
          }
        );
      }
    }
    
    res.json({
      assignment,
      isCorrect,
      feedback: isCorrect 
        ? `Верно! Вы правильно решили задание.` 
        : `К сожалению, решение содержит ошибки. Попробуйте еще раз.`,
      stars: isCorrect ? stars : 0
    });
  } catch (error) {
    console.error('Error checking assignment:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

module.exports = router; 