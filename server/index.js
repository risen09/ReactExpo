const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-tutor', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Import routes
const personalityTestRoutes = require('./routes/personalityTest');
const authRoutes = require('./routes/auth');
const tracksRoutes = require('./routes/tracks');
const lessonsRoutes = require('./routes/lessons');
const testsRoutes = require('./routes/tests');
const gigachatRoutes = require('./routes/gigachat');
const trackAssistantRoutes = require('./routes/agents/track-assistant');

// Use routes
app.use('/api/personality-test', personalityTestRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/tracks', tracksRoutes);
app.use('/api/lessons', lessonsRoutes);
app.use('/api/tests', testsRoutes);
app.use('/api/gigachat', gigachatRoutes);
app.use('/api/track-assistants', trackAssistantRoutes);

// Маршрут для админской авторизации
app.post('/api/login', authRoutes);

// Default route
app.get('/', (req, res) => {
  res.send('AI Tutor API is running');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app; 