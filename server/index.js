const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const { v4: uuidv4 } = require('uuid');
const aiService = require('./services/aiService');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage (replace with database later)
const activeSessions = new Map();
const aiCharacters = [
  { id: '1', name: 'Luna', personality: 'Creative and curious assistant', avatar: '🌙' },
  { id: '2', name: 'Max', personality: 'Tech enthusiast and problem solver', avatar: '🤖' },
  { id: '3', name: 'Sage', personality: 'Wise and philosophical thinker', avatar: '🦉' },
  { id: '4', name: 'Zara', personality: 'Energetic and adventurous spirit', avatar: '⚡' },
  { id: '5', name: 'Echo', personality: 'Mysterious and poetic soul', avatar: '🎭' },
  { id: '6', name: 'Nova', personality: 'Scientific and analytical mind', avatar: '🔬' }
];

// Helper functions
const getRandomAICharacter = (excludeId) => {
  const available = excludeId
    ? aiCharacters.filter(char => char.id !== excludeId)
    : aiCharacters;
  return available[Math.floor(Math.random() * available.length)];
};

const generateAIResponse = async (character, userMessage, conversationHistory) => {
  console.log('generateAIResponse called with:', character.name, userMessage);
  const result = await aiService.generateResponse(character, userMessage, conversationHistory);
  console.log('generateAIResponse returning:', result);
  return result;
};

// API Routes
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is running!' });
});

app.post('/api/sessions', (req, res) => {
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

  activeSessions.set(sessionId, session);

  res.json({ sessionId, aiCharacter });
});

app.get('/api/sessions/:sessionId', (req, res) => {
  const session = activeSessions.get(req.params.sessionId);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  res.json(session);
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-session', (sessionId) => {
    const session = activeSessions.get(sessionId);
    if (session) {
      socket.join(sessionId);
      socket.sessionId = sessionId;
      socket.emit('session-joined', session);
    } else {
      socket.emit('error', { message: 'Session not found' });
    }
  });

  socket.on('send-message', async ({ sessionId, message }) => {
    const session = activeSessions.get(sessionId);
    if (!session || !session.isActive) {
      socket.emit('error', { message: 'Session not active' });
      return;
    }

    const userMessage = {
      id: uuidv4(),
      text: message,
      sender: 'user',
      timestamp: new Date()
    };

    session.messages.push(userMessage);
    io.to(sessionId).emit('new-message', userMessage);

    // Generate AI response after delay
    setTimeout(async () => {
      try {
        const aiResponseText = await generateAIResponse(
          session.aiCharacter,
          message,
          session.messages
        );

        const aiResponse = {
          id: uuidv4(),
          text: aiResponseText,
          sender: 'ai',
          timestamp: new Date()
        };

        session.messages.push(aiResponse);
        io.to(sessionId).emit('new-message', aiResponse);
      } catch (error) {
        console.error('Error generating AI response:', error);
        const errorResponse = {
          id: uuidv4(),
          text: "I'm having trouble responding right now. Could you try again?",
          sender: 'ai',
          timestamp: new Date()
        };

        session.messages.push(errorResponse);
        io.to(sessionId).emit('new-message', errorResponse);
      }
    }, 1500);
  });

  socket.on('extend-session', async ({ sessionId, decision }) => {
    const session = activeSessions.get(sessionId);
    if (session) {
      // Get AI decision based on conversation
      const aiDecision = await aiService.generateExtensionDecision(session.aiCharacter, session.messages);

      socket.emit('extension-response', {
        userDecision: decision,
        aiDecision,
        success: decision === 'extend' && aiDecision === 'extend'
      });

      if (decision === 'extend' && aiDecision === 'extend') {
        session.timeRemaining = 15 * 60; // Reset to 15 minutes
      } else {
        session.isActive = false;
      }
    }
  });

  socket.on('end-session', (sessionId) => {
    const session = activeSessions.get(sessionId);
    if (session) {
      session.isActive = false;
      socket.emit('session-ended');
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});