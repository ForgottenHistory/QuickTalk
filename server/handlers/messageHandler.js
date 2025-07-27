const { v4: uuidv4 } = require('uuid');
const sessionManager = require('../managers/sessionManager');
const aiService = require('../services/aiService');

const handleMessage = async (io, socket, sessionId, message) => {
  const session = sessionManager.getSession(sessionId);
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
  
  sessionManager.addMessage(sessionId, userMessage);
  io.to(sessionId).emit('new-message', userMessage);
  
  // Show AI typing indicator immediately
  io.to(sessionId).emit('typing-update', { 
    isTyping: true, 
    sender: 'ai' 
  });
  
  // Generate AI response with realistic delay
  setTimeout(async () => {
    try {
      const aiResponseText = await aiService.generateResponse(
        session.aiCharacter, 
        message, 
        session.messages
      );
      
      // Stop typing indicator
      io.to(sessionId).emit('typing-update', { 
        isTyping: false, 
        sender: 'ai' 
      });
      
      const aiResponse = {
        id: uuidv4(),
        text: aiResponseText,
        sender: 'ai',
        timestamp: new Date()
      };
      
      sessionManager.addMessage(sessionId, aiResponse);
      io.to(sessionId).emit('new-message', aiResponse);
    } catch (error) {
      console.error('Error generating AI response:', error);
      
      // Stop typing indicator on error
      io.to(sessionId).emit('typing-update', { 
        isTyping: false, 
        sender: 'ai' 
      });
      
      const errorResponse = {
        id: uuidv4(),
        text: "I'm having trouble responding right now. Could you try again?",
        sender: 'ai',
        timestamp: new Date()
      };
      
      sessionManager.addMessage(sessionId, errorResponse);
      io.to(sessionId).emit('new-message', errorResponse);
    }
  }, Math.random() * 2000 + 1500); // Random delay between 1.5-3.5 seconds
};

module.exports = {
  handleMessage
};