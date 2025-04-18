const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Регистрация пользователя
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    // Проверяем, существует ли пользователь с таким email
    let user = await User.findOne({ email });
    
    if (user) {
      return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
    }
    
    // Создаем нового пользователя
    user = new User({
      email,
      password,
      name,
      registrationDate: new Date(),
      authType: 'email',
      mfaEnabled: false,
      cognitiveProfile: {},
      selectedSubjects: [],
      tracks: [],
      completedLessons: [],
      completedTests: [],
      notifications: {
        emailEnabled: true,
        appEnabled: true,
        reminders: {
          dailySummary: true,
          newLessons: true
        }
      },
      achievements: []
    });
    
    // Сохраняем пользователя (пароль хешируется в pre-save хуке модели)
    await user.save();
    
    // Создаем JWT токен
    const payload = {
      user: {
        id: user.id,
        email: user.email
      }
    };
    
    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1 day' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (error) {
    console.error('Error in user registration:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Вход пользователя
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Проверяем, существует ли пользователь
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(400).json({ message: 'Неверные учетные данные' });
    }
    
    // Проверяем пароль
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      return res.status(400).json({ message: 'Неверные учетные данные' });
    }
    
    // Создаем JWT токен
    const payload = {
      user: {
        id: user.id,
        email: user.email
      }
    };
    
    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1 day' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (error) {
    console.error('Error in user login:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Админский вход (для демонстрации)
router.post('/admin', async (req, res) => {
  try {
    // Проверяем Basic Auth заголовок
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Basic ')) {
      return res.status(401).json({ message: 'Неавторизованный запрос' });
    }
    
    // Декодируем Basic Auth
    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [username, password] = credentials.split(':');
    
    // Проверяем учетные данные
    if (username !== 'admin' || password !== 'admin123') {
      return res.status(401).json({ message: 'Неверные учетные данные администратора' });
    }
    
    // Создаем JWT токен для админа
    const payload = {
      user: {
        id: 'admin',
        role: 'admin',
        email: 'admin@example.com'
      }
    };
    
    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1 day' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (error) {
    console.error('Error in admin login:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Получение информации о текущем пользователе
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('tracks')
      .populate('completedLessons')
      .populate('completedTests');
    
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Обновление профиля пользователя
router.patch('/profile', auth, async (req, res) => {
  try {
    const { name, notifications, cognitiveProfile, selectedSubjects } = req.body;
    
    // Находим пользователя
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    
    // Обновляем только предоставленные поля
    if (name) user.name = name;
    if (notifications) user.notifications = { ...user.notifications, ...notifications };
    if (cognitiveProfile) user.cognitiveProfile = { ...user.cognitiveProfile, ...cognitiveProfile };
    if (selectedSubjects) user.selectedSubjects = selectedSubjects;
    
    await user.save();
    
    res.json(user);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

module.exports = router; 