const { v4: uuidv4 } = require('uuid');
const sessionManager = require('../managers/sessionManager');
const aiService = require('../services/aiService');
const textFormatter = require('../services/textFormatter');

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
        
        // Clean and format response, then send as messages
        const formattedResponse = formatAIResponse(aiResponseText);
        if (formattedResponse) {
          await sendMultipleMessages(io, sessionId, formattedResponse, session.aiCharacter.name);
        } else {
          // If entire response was filtered out, send a fallback
          const fallbackResponse = {
            id: uuidv4(),
            text: "Let me rephrase that...",
            sender: 'ai',
            timestamp: new Date()
          };
          sessionManager.addMessage(sessionId, fallbackResponse);
          io.to(sessionId).emit('new-message', fallbackResponse);
        }
        
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

const formatAIResponse = (responseText) => {
  if (!responseText || typeof responseText !== 'string') {
    return null;
  }
  
  // First format the entire response
  const formattedText = textFormatter.formatMessage(responseText);
  
  // If entire response was an action, return null
  if (!formattedText) {
    return null;
  }
  
  // Clean up multiple newlines and whitespace
  let cleaned = formattedText.trim();
  cleaned = cleaned.replace(/[\r\n]{3,}/g, '\n\n');
  cleaned = cleaned.replace(/\n\n+/g, '\n');
  cleaned = cleaned.replace(/\r/g, '');
  
  console.log(`Formatted AI response: "${cleaned}"`);
  return cleaned;
};

const sendMultipleMessages = async (io, sessionId, responseText, aiName) => {
  // Split by newlines and process each part
  const messageParts = responseText.split('\n')
    .map(part => part.trim())
    .filter(part => part.length > 0)
    .map(part => textFormatter.formatMessage(part)) // Format each part
    .filter(part => part !== null); // Remove parts that were entirely actions
  
  console.log(`Splitting AI response into ${messageParts.length} messages for session ${sessionId}`);
  
  // If no valid message parts remain, send fallback
  if (messageParts.length === 0) {
    const fallbackMessage = {
      id: uuidv4(),
      text: "Let me think of another way to respond...",
      sender: 'ai',
      timestamp: new Date()
    };
    sessionManager.addMessage(sessionId, fallbackMessage);
    io.to(sessionId).emit('new-message', fallbackMessage);
    return;
  }
  
  // If only one message part, send normally
  if (messageParts.length <= 1) {
    const aiResponse = {
      id: uuidv4(),
      text: messageParts[0],
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