const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async function(req, res, next) {
  // Получаем токен из заголовка
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'Нет токена, авторизация отклонена' });
  }
  
  try {
    // Проверяем токен
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Находим пользователя по ID из токена
    const user = await User.findById(decoded.user.id);
    
    if (!user) {
      return res.status(401).json({ message: 'Пользователь не найден' });
    }
    
    // Добавляем пользователя к запросу
    req.user = {
      id: user._id,
      email: user.email
    };
    
    next();
  } catch (err) {
    res.status(401).json({ message: 'Недействительный токен' });
  }
}; 