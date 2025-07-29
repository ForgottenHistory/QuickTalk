const { v4: uuidv4 } = require('uuid');
const sessionManager = require('../managers/sessionManager');
const aiService = require('../services/aiService');

const handleMessage = async (io, socket, sessionId, message) => {
  console.log(`Received message for session ${sessionId}: "${message}"`);
  
  const session = sessionManager.getSession(sessionId);
  if (!session || !session.isActive) {
    console.error(`Session ${sessionId} not found or not active`);
    socket.emit('error', { message: 'Session not active' });
    return;
  }
  
  const userMessage = {
    id: uuidv4(),
    text: message,
    sender: 'user',
    timestamp: new Date()
  };
  
  console.log(`Adding user message to session ${sessionId}:`, userMessage);
  sessionManager.addMessage(sessionId, userMessage);
  
  console.log(`Broadcasting user message to room ${sessionId}`);
  io.to(sessionId).emit('new-message', userMessage);
  
  // Natural delay before AI starts "typing" (300ms - 1.2s)
  const thinkingDelay = Math.random() * 900 + 300;
  
  setTimeout(() => {
    console.log(`AI starting to "type" for session ${sessionId}`);
    // Show AI typing indicator
    io.to(sessionId).emit('typing-update', { 
      isTyping: true, 
      sender: 'ai' 
    });
    
    // Generate AI response with additional typing delay
    const typingDuration = Math.random() * 2500 + 1500; // 1.5-4s of "typing"
    
    setTimeout(async () => {
      try {
        console.log(`Generating AI response for session ${sessionId}`);
        const aiResponseText = await aiService.generateResponse(
          session.aiCharacter, 
          message, 
          session.messages
        );
        
        console.log(`AI response generated for session ${sessionId}: "${aiResponseText}"`);
        
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
        
        console.log(`Adding AI response to session ${sessionId}:`, aiResponse);
        sessionManager.addMessage(sessionId, aiResponse);
        
        console.log(`Broadcasting AI response to room ${sessionId}`);
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
    }, typingDuration);
    
  }, thinkingDelay);
};

module.exports = {
  handleMessage
};