const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');

const Track = require('../../models/Track'); // Правильный путь к модели Track

// Маршрут для создания ассистента трека
router.post('/create/:trackId', auth, async (req, res) => {
  try {
    const track = await Track.findById(req.params.trackId);
    
    if (!track) {
      return res.status(404).json({ msg: 'Трек не найден' });
    }
    
    // Проверка, принадлежит ли трек пользователю
    if (track.userId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Нет разрешения на создание ассистента для этого трека' });
    }
    
    // Здесь должна быть логика создания ассистента трека
    // Например, сохранение информации о новом ассистенте в базе данных
    
    res.json({ 
      assistant_id: 'new_assistant_id', // Замените на реальный ID ассистента
      track_id: req.params.trackId,
      track_info: {
        name: track.name,
        subject: track.subject,
        topic: track.topic || ''
      }
    });
    
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Ошибка сервера');
  }
});

// Маршрут для отправки вопроса ассистенту
router.post('/:assistantId/ask', auth, [
  check('message', 'Сообщение не может быть пустым').not().isEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    const { message, lessonId } = req.body;
    
    // Здесь должна быть логика обработки вопроса пользователя
    // и генерации ответа от ассистента
    
    res.json({
      reply: 'Ответ от ассистента трека', // Замените на реальный ответ
      timestamp: new Date().toISOString()
    });
    
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Ошибка сервера');
  }
});

module.exports = router; 