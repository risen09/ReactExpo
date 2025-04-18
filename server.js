const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/experts', authenticate, require('./routes/agents/subject-expert'));
app.use('/api/homework', authenticate, require('./routes/agents/homework-helper'));
app.use('/api/study-plans', authenticate, require('./routes/agents/study-plan'));
app.use('/api/track-assistants', authenticate, require('./routes/agents/track-assistant'));
app.use('/api/progress-analyzer', authenticate, require('./routes/agents/progress-analyzer'));
// Добавляем маршрут для начальной диагностики
app.use('/api/initial-diagnostics', authenticate, require('./routes/agents/initial-diagnostics'));
// Добавляем маршрут для работы с тестами
app.use('/api/tests', authenticate, require('./routes/agents/tests'));

const SECRET = process.env.JWT_SECRET || 'ваш_резервный_секрет';
const MONGODB_URI = process.env.MONGODB_URI;

// ... остальной код server.js без изменений ... 