const express = require('express');
const { v4: uuidv4 } = require('uuid');
const sessionManager = require('../managers/sessionManager');
const settingsManager = require('../managers/settingsManager');
const { getRandomAICharacter } = require('../utils/aiCharacters');

const router = express.Router();

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Server is running!' });
});

// Create new session
router.post('/sessions', (req, res) => {
  const sessionId = uuidv4();
  const aiCharacter = getRandomAICharacter();
  
  // Use settings for session duration
  const sessionDuration = settingsManager.getSessionDuration();
  
  const session = {
    id: sessionId,
    aiCharacter,
    messages: [],
    timeRemaining: sessionDuration * 60, // Convert minutes to seconds
    isActive: true,
    createdAt: new Date().toISOString()
  };
  
  sessionManager.createSession(sessionId, session);
  
  res.json({ 
    sessionId, 
    aiCharacter,
    sessionDuration // Send duration to frontend
  });
});

// Get session by ID
router.get('/sessions/:sessionId', (req, res) => {
  const session = sessionManager.getSession(req.params.sessionId);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  res.json(session);
});

module.exports = router;