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
  
  // Generate AI response after delay
  setTimeout(async () => {
    try {
      const aiResponseText = await aiService.generateResponse(
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
      
      sessionManager.addMessage(sessionId, aiResponse);
      io.to(sessionId).emit('new-message', aiResponse);
    } catch (error) {
      console.error('Error generating AI response:', error);
      const errorResponse = {
        id: uuidv4(),
        text: "I'm having trouble responding right now. Could you try again?",
        sender: 'ai',
        timestamp: new Date()
      };
      
      sessionManager.addMessage(sessionId, errorResponse);
      io.to(sessionId).emit('new-message', errorResponse);
    }
  }, 1500);
};

module.exports = {
  handleMessage
};