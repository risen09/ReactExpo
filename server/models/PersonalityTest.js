const mongoose = require('mongoose');

const personalityTestSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    answers: {
      type: Map,
      of: Number,
      required: true,
    },
    mbtiScores: {
      extraversion: Number,
      introversion: Number,
      sensing: Number,
      intuition: Number,
      thinking: Number,
      feeling: Number,
      judging: Number,
      perceiving: Number,
    },
    personalityType: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PersonalityTest', personalityTestSchema); 