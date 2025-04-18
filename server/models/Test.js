const mongoose = require('mongoose');

const TestQuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  options: [String],
  correctAnswer: String,
  type: {
    type: String,
    enum: ['multiple-choice', 'open-ended', 'self-assessment'],
    required: true
  }
});

const TestResultSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  weakTopics: [String],
  successfulTopics: [String],
  score: {
    type: Number,
    required: true
  },
  recommendations: [String],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const TestSchema = new mongoose.Schema({
  trackId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Track'
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  testType: {
    type: String,
    enum: ['T1', 'T2'],
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  topic: String,
  questions: [TestQuestionSchema],
  results: TestResultSchema,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Test = mongoose.model('Test', TestSchema);

module.exports = Test; 