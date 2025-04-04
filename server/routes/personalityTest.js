const express = require('express');
const router = express.Router();
const PersonalityTest = require('../models/PersonalityTest');

// Submit test results
router.post('/', async (req, res) => {
  try {
    const { userId, answers, personalityType, mbtiScores } = req.body;
    
    if (!userId || !answers || !personalityType) {
      return res.status(400).json({ 
        error: 'Missing required fields: userId, answers, and personalityType are required' 
      });
    }
    
    // Create new test result
    const testResult = new PersonalityTest({
      userId,
      answers,
      personalityType,
      mbtiScores
    });
    
    const savedResult = await testResult.save();
    
    return res.status(201).json({
      success: true,
      data: savedResult,
    });
  } catch (error) {
    console.error('Error saving test results:', error);
    return res.status(500).json({ 
      error: 'Server error while saving test results'
    });
  }
});

// Get test results for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const testResults = await PersonalityTest.find({ userId })
      .sort({ createdAt: -1 })
      .limit(1);
    
    if (!testResults.length) {
      return res.status(404).json({ 
        message: 'No test results found for this user' 
      });
    }
    
    return res.status(200).json({
      success: true,
      data: testResults[0],
    });
  } catch (error) {
    console.error('Error fetching test results:', error);
    return res.status(500).json({ 
      error: 'Server error while fetching test results'
    });
  }
});

module.exports = router; 