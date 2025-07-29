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
        
        // Get current session time remaining for AI awareness
        const timeRemaining = session.timeRemaining || 0;
        console.log(`Session ${sessionId} has ${timeRemaining} seconds remaining`);
        
        const aiResponseText = await aiService.generateResponse(
          session.aiCharacter, 
          message, 
          session.messages,
          timeRemaining
        );
        
        console.log(`AI response generated for session ${sessionId}: "${aiResponseText}"`);
        
        // Stop typing indicator
        io.to(sessionId).emit('typing-update', { 
          isTyping: false, 
          sender: 'ai' 
        });
        
        // Clean and split response by newlines and send as separate messages
        const cleanedResponse = cleanResponse(aiResponseText);
        await sendMultipleMessages(io, sessionId, cleanedResponse, session.aiCharacter.name);
        
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

const cleanResponse = (responseText) => {
  if (!responseText || typeof responseText !== 'string') {
    return '';
  }
  
  // First, trim the entire response
  let cleaned = responseText.trim();
  
  // Replace multiple consecutive newlines with single newlines
  // This handles cases like \n\n\n or \r\n\r\n
  cleaned = cleaned.replace(/[\r\n]{3,}/g, '\n\n');
  
  // Replace double newlines with single newlines (converts paragraph breaks to message breaks)
  cleaned = cleaned.replace(/\n\n+/g, '\n');
  
  // Remove any remaining carriage returns
  cleaned = cleaned.replace(/\r/g, '');
  
  console.log(`Original response: "${responseText}"`);
  console.log(`Cleaned response: "${cleaned}"`);
  
  return cleaned;
};

const sendMultipleMessages = async (io, sessionId, responseText, aiName) => {
  // Split by newlines and filter out empty/whitespace-only lines
  const messageParts = responseText.split('\n')
    .map(part => part.trim())
    .filter(part => part.length > 0);
  
  console.log(`Splitting AI response into ${messageParts.length} messages for session ${sessionId}`);
  
  // If only one message part, send normally
  if (messageParts.length <= 1) {
    const aiResponse = {
      id: uuidv4(),
      text: responseText.trim(),
      sender: 'ai',
      timestamp: new Date()
    };
    
    sessionManager.addMessage(sessionId, aiResponse);
    io.to(sessionId).emit('new-message', aiResponse);
    return;
  }
  
  // Send multiple messages with delays between them
  for (let i = 0; i < messageParts.length; i++) {
    const part = messageParts[i];
    
    // Add delay between messages (except for the first one)
    if (i > 0) {
      // Show typing indicator between messages
      io.to(sessionId).emit('typing-update', { 
        isTyping: true, 
        sender: 'ai' 
      });
      
      // Wait 800ms - 2s between messages
      const delayBetweenMessages = Math.random() * 1200 + 800;
      await new Promise(resolve => setTimeout(resolve, delayBetweenMessages));
      
      // Stop typing before sending next message
      io.to(sessionId).emit('typing-update', { 
        isTyping: false, 
        sender: 'ai' 
      });
    }
    
    const aiResponse = {
      id: uuidv4(),
      text: part,
      sender: 'ai',
      timestamp: new Date()
    };
    
    console.log(`Sending AI message part ${i + 1}/${messageParts.length} for session ${sessionId}: "${part}"`);
    sessionManager.addMessage(sessionId, aiResponse);
    io.to(sessionId).emit('new-message', aiResponse);
  }
};

module.exports = {
  handleMessage
};