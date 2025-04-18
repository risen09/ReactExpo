const express = require('express');
const router = express.Router();
const Track = require('../models/Track');
const Lesson = require('../models/Lesson');
const Test = require('../models/Test');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Получение всех треков пользователя
router.get('/', auth, async (req, res) => {
  try {
    const tracks = await Track.find({ userId: req.user.id })
      .populate({
        path: 'lessons',
        select: 'title difficulty stars completed'
      })
      .populate({
        path: 'tests',
        select: 'title testType subject topic'
      });
    
    res.json(tracks);
  } catch (error) {
    console.error('Error fetching tracks:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Получение конкретного трека по ID
router.get('/:id', auth, async (req, res) => {
  try {
    const track = await Track.findOne({ 
      _id: req.params.id,
      userId: req.user.id
    })
    .populate('lessons')
    .populate('tests');
    
    if (!track) {
      return res.status(404).json({ message: 'Трек не найден' });
    }
    
    res.json(track);
  } catch (error) {
    console.error('Error fetching track:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Создание нового трека
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, subject, topic } = req.body;
    
    const newTrack = new Track({
      userId: req.user.id,
      name,
      description,
      subject,
      topic,
      lessons: [],
      tests: []
    });
    
    await newTrack.save();
    
    // Добавляем трек к пользователю
    await User.findByIdAndUpdate(
      req.user.id,
      { $push: { tracks: newTrack._id } }
    );
    
    res.status(201).json(newTrack);
  } catch (error) {
    console.error('Error creating track:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Добавление урока в трек
router.post('/:id/lessons', auth, async (req, res) => {
  try {
    const track = await Track.findOne({ 
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!track) {
      return res.status(404).json({ message: 'Трек не найден' });
    }
    
    const { title, content, difficulty, examples, assignments } = req.body;
    
    const newLesson = new Lesson({
      trackId: track._id,
      title,
      content,
      difficulty,
      examples,
      assignments,
      stars: 0,
      completed: false
    });
    
    await newLesson.save();
    
    // Добавляем урок в трек
    track.lessons.push(newLesson._id);
    await track.save();
    
    res.status(201).json(newLesson);
  } catch (error) {
    console.error('Error adding lesson:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Добавление теста в трек
router.post('/:id/tests', auth, async (req, res) => {
  try {
    const track = await Track.findOne({ 
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!track) {
      return res.status(404).json({ message: 'Трек не найден' });
    }
    
    const { title, description, testType, subject, topic, questions } = req.body;
    
    const newTest = new Test({
      trackId: track._id,
      title,
      description,
      testType,
      subject,
      topic,
      questions
    });
    
    await newTest.save();
    
    // Добавляем тест в трек
    track.tests.push(newTest._id);
    await track.save();
    
    res.status(201).json(newTest);
  } catch (error) {
    console.error('Error adding test:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Создание расписания для трека
router.post('/:id/schedule', auth, async (req, res) => {
  try {
    const track = await Track.findOne({ 
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!track) {
      return res.status(404).json({ message: 'Трек не найден' });
    }
    
    const { startDate, endDate, dailyHours, sessions } = req.body;
    
    track.schedule = {
      startDate,
      endDate,
      dailyHours,
      sessions
    };
    
    await track.save();
    
    res.json(track);
  } catch (error) {
    console.error('Error creating schedule:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

module.exports = router; 