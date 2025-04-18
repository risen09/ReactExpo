const mongoose = require('mongoose');

const ExampleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  solution: {
    type: String,
    required: true
  }
});

const AssignmentSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  difficulty: {
    type: Number,
    enum: [1, 2, 3], // 1=Легкий, 2=Средний, 3=Сложный
    required: true
  },
  solution: {
    type: String
  },
  userAnswer: {
    type: String
  },
  isCorrect: {
    type: Boolean
  }
});

const LessonSchema = new mongoose.Schema({
  trackId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Track'
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  difficulty: {
    type: Number,
    enum: [1, 2, 3], // 1=Легкий, 2=Средний, 3=Сложный
    required: true
  },
  stars: {
    type: Number,
    enum: [0, 1, 2, 3], // Количество звезд, которые пользователь получил
    default: 0
  },
  assignments: [AssignmentSchema],
  examples: [ExampleSchema],
  completed: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Lesson = mongoose.model('Lesson', LessonSchema);

module.exports = Lesson; 