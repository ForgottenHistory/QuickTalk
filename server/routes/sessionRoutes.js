const express = require('express');
const { v4: uuidv4 } = require('uuid');
const sessionManager = require('../managers/sessionManager');
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
  
  const session = {
    id: sessionId,
    aiCharacter,
    messages: [],
    timeRemaining: 15 * 60, // 15 minutes in seconds
    isActive: true,
    createdAt: new Date().toISOString()
  };
  
  sessionManager.createSession(sessionId, session);
  
  res.json({ sessionId, aiCharacter });
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