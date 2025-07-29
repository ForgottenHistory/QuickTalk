const { v4: uuidv4 } = require('uuid');
const sessionManager = require('../managers/sessionManager');
const aiService = require('../services/aiService');
const textFormatter = require('../services/textFormatter');

// Track last API call time to avoid rate limiting
let lastApiCall = 0;
const MIN_DELAY_BETWEEN_CALLS = 2000; // 2 seconds minimum between API calls

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
        
        // Process and send response as messages
        await sendMultipleMessages(io, sessionId, aiResponseText, session.aiCharacter.name);
        
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

const sendFirstMessage = async (io, sessionId, aiCharacter) => {
  // 70% chance to send a first message
  const shouldSendFirst = Math.random() < 0.7;
  
  if (!shouldSendFirst) {
    console.log(`AI ${aiCharacter.name} chose not to send first message for session ${sessionId}`);
    return;
  }

  console.log(`AI ${aiCharacter.name} will send first message for session ${sessionId}`);

  // Check rate limiting - add extra delay if needed
  const now = Date.now();
  const timeSinceLastCall = now - lastApiCall;
  const additionalDelay = Math.max(0, MIN_DELAY_BETWEEN_CALLS - timeSinceLastCall);
  
  // Delay before sending first message (1-3 seconds + rate limit protection)
  const initialDelay = Math.random() * 2000 + 1000 + additionalDelay;
  
  setTimeout(async () => {
    const session = sessionManager.getSession(sessionId);
    if (!session || !session.isActive) {
      console.log(`Session ${sessionId} no longer active, skipping first message`);
      return;
    }

    // Show typing indicator
    io.to(sessionId).emit('typing-update', { 
      isTyping: true, 
      sender: 'ai' 
    });

    // Typing duration for first message (1-2.5 seconds)
    const typingDuration = Math.random() * 1500 + 1000;

    setTimeout(async () => {
      try {
        // Update last API call time
        lastApiCall = Date.now();
        
        // Generate first message
        const firstMessagePrompt = `You are ${aiCharacter.name}. ${aiCharacter.personality}. 

This is the start of a new conversation. Send a brief, friendly greeting that matches your personality. Keep it natural and conversational. Keep it under 50 words and match your personality.`;

        console.log(`Generating first message for ${aiCharacter.name} in session ${sessionId}`);
        
        const aiResponseText = await aiService.generateResponse(
          aiCharacter,
          firstMessagePrompt,
          [], // No conversation history for first message
          session.timeRemaining
        );

        // Stop typing indicator
        io.to(sessionId).emit('typing-update', { 
          isTyping: false, 
          sender: 'ai' 
        });

        console.log(`First message generated for session ${sessionId}: "${aiResponseText}"`);

        // Send the first message (use single message, not multiple)
        if (aiResponseText && aiResponseText.trim()) {
          // Clean up the response
          let cleaned = aiResponseText.trim();
          
          // Apply text formatter
          const formatted = textFormatter.formatMessage(cleaned);
          
          if (formatted) {
            const firstMessage = {
              id: uuidv4(),
              text: formatted,
              sender: 'ai',
              timestamp: new Date()
            };

            sessionManager.addMessage(sessionId, firstMessage);
            io.to(sessionId).emit('new-message', firstMessage);
            
            console.log(`First message sent for session ${sessionId}: "${formatted}"`);
          } else {
            console.log(`First message was filtered out for session ${sessionId}, sending fallback`);
            // Send fallback if formatted message was filtered
            const fallbackMessage = {
              id: uuidv4(),
              text: `Hello! I'm ${aiCharacter.name}. Nice to meet you!`,
              sender: 'ai',
              timestamp: new Date()
            };
            
            sessionManager.addMessage(sessionId, fallbackMessage);
            io.to(sessionId).emit('new-message', fallbackMessage);
          }
        } else {
          console.log(`Empty first message generated for session ${sessionId}, sending fallback`);
          // Send fallback if no message generated
          const fallbackMessage = {
            id: uuidv4(),
            text: `Hi there! I'm ${aiCharacter.name}. How are you doing today?`,
            sender: 'ai',
            timestamp: new Date()
          };
          
          sessionManager.addMessage(sessionId, fallbackMessage);
          io.to(sessionId).emit('new-message', fallbackMessage);
        }

      } catch (error) {
        console.error('Error generating first message:', error);
        
        // Stop typing indicator on error
        io.to(sessionId).emit('typing-update', { 
          isTyping: false, 
          sender: 'ai' 
        });
        
        // Send a simple fallback first message
        const fallbackMessage = {
          id: uuidv4(),
          text: `Hello! I'm ${aiCharacter.name}. Nice to meet you!`,
          sender: 'ai',
          timestamp: new Date()
        };
        
        sessionManager.addMessage(sessionId, fallbackMessage);
        io.to(sessionId).emit('new-message', fallbackMessage);
        
        console.log(`Sent fallback first message for session ${sessionId}`);
      }
    }, typingDuration);

  }, initialDelay);
};

const sendMultipleMessages = async (io, sessionId, responseText, aiName) => {
  if (!responseText || typeof responseText !== 'string') {
    console.log('Empty or invalid response text, sending fallback');
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

  // Clean up the response text first
  let cleaned = responseText.trim();
  cleaned = cleaned.replace(/[\r\n]{3,}/g, '\n\n'); // Replace 3+ newlines with 2
  cleaned = cleaned.replace(/\r/g, ''); // Remove carriage returns
  
  console.log(`Original response: "${responseText}"`);
  console.log(`Cleaned response: "${cleaned}"`);
  
  // Split by double newlines first (paragraph breaks), then single newlines
  let messageParts = [];
  
  // First split by double newlines (paragraph breaks)
  const paragraphs = cleaned.split('\n\n').filter(p => p.trim().length > 0);
  
  // Then split each paragraph by single newlines if needed
  paragraphs.forEach(paragraph => {
    const lines = paragraph.split('\n').filter(line => line.trim().length > 0);
    if (lines.length === 1) {
      // Single line paragraph - add as is
      messageParts.push(lines[0].trim());
    } else {
      // Multi-line paragraph - treat each line as separate message
      lines.forEach(line => {
        if (line.trim().length > 0) {
          messageParts.push(line.trim());
        }
      });
    }
  });
  
  console.log(`Split into ${messageParts.length} parts:`, messageParts);
  
  // Now filter through text formatter
  const validParts = [];
  messageParts.forEach(part => {
    const formatted = textFormatter.formatMessage(part);
    if (formatted !== null) {
      validParts.push(formatted);
    } else {
      console.log(`Filtered out action-only message: "${part}"`);
    }
  });
  
  console.log(`After filtering: ${validParts.length} valid parts:`, validParts);
  
  // If no valid message parts remain, send fallback
  if (validParts.length === 0) {
    console.log('All parts were filtered out, sending fallback');
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
  if (validParts.length === 1) {
    console.log(`Sending single message: "${validParts[0]}"`);
    const aiResponse = {
      id: uuidv4(),
      text: validParts[0],
      sender: 'ai',
      timestamp: new Date()
    };
    
    sessionManager.addMessage(sessionId, aiResponse);
    io.to(sessionId).emit('new-message', aiResponse);
    return;
  }
  
  // Send multiple messages with delays between them
  console.log(`Sending ${validParts.length} messages with delays`);
  for (let i = 0; i < validParts.length; i++) {
    const part = validParts[i];
    
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
    
    console.log(`Sending AI message part ${i + 1}/${validParts.length} for session ${sessionId}: "${part}"`);
    sessionManager.addMessage(sessionId, aiResponse);
    io.to(sessionId).emit('new-message', aiResponse);
  }
};

module.exports = {
  handleMessage,
  sendFirstMessage
};