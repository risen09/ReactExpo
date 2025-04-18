const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const CognitiveProfileSchema = new mongoose.Schema({
  learningStyle: {
    type: String,
    enum: ['visual', 'auditory', 'kinesthetic', 'mixed'],
    default: 'mixed'
  },
  testResults: [Number],
  preferences: {
    explanationStyle: {
      type: String,
      enum: ['detailed', 'concise', 'example-based'],
      default: 'detailed'
    },
    difficultyLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'intermediate'
    }
  }
});

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String
  },
  registrationDate: {
    type: Date,
    default: Date.now
  },
  authType: {
    type: String,
    enum: ['email', 'google', 'social'],
    default: 'email'
  },
  mfaEnabled: {
    type: Boolean,
    default: false
  },
  cognitiveProfile: {
    type: CognitiveProfileSchema,
    default: () => ({})
  },
  selectedSubjects: [String],
  tracks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Track'
  }],
  completedLessons: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson'
  }],
  completedTests: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Test'
  }],
  notifications: {
    emailEnabled: {
      type: Boolean,
      default: true
    },
    appEnabled: {
      type: Boolean,
      default: true
    },
    reminders: {
      dailySummary: {
        type: Boolean,
        default: true
      },
      newLessons: {
        type: Boolean,
        default: true
      }
    }
  },
  achievements: [{
    title: String,
    date: {
      type: Date,
      default: Date.now
    }
  }]
});

// Хеширование пароля перед сохранением
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Метод для сравнения паролей
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', UserSchema);

module.exports = User; 