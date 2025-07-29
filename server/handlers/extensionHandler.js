const sessionManager = require('../managers/sessionManager');
const aiService = require('../services/aiService');

const handleExtension = async (socket, sessionId, decision) => {
  const session = sessionManager.getSession(sessionId);
  if (!session) {
    socket.emit('error', { message: 'Session not found' });
    return;
  }

  try {
    console.log(`Extension request for session ${sessionId}: user=${decision}`);
    
    // Get AI decision immediately when user makes their choice
    console.log(`Getting AI decision for session ${sessionId}...`);
    const aiDecision = await aiService.generateExtensionDecision(
      session.aiCharacter, 
      session.messages
    );
    
    console.log(`AI decision for session ${sessionId}: ai=${aiDecision}`);
    
    // Send response to client with both decisions
    socket.emit('extension-response', {
      userDecision: decision,
      aiDecision,
      success: decision === 'extend' && aiDecision === 'extend'
    });
    
    // Handle session state based on decisions
    if (decision === 'extend' && aiDecision === 'extend') {
      console.log(`Both parties want to extend session ${sessionId}`);
      // Session will be extended by frontend after showing message
      setTimeout(() => {
        sessionManager.extendSession(sessionId);
        console.log(`Session ${sessionId} extended`);
      }, 2500); // Give time for frontend message display
    } else {
      console.log(`Extension declined for session ${sessionId}, ending session`);
      // End session and notify client after delay for message display
      setTimeout(() => {
        sessionManager.endSession(sessionId);
        socket.emit('session-ended');
        console.log(`Session ${sessionId} ended and session-ended event sent`);
      }, 2500); // Give time for frontend message display
    }
    
  } catch (error) {
    console.error('Error handling extension:', error);
    
    // On error, assume AI declines and end session
    socket.emit('extension-response', {
      userDecision: decision,
      aiDecision: 'decline',
      success: false
    });
    
    setTimeout(() => {
      sessionManager.endSession(sessionId);
      socket.emit('session-ended');
    }, 2500);
  }
};

module.exports = {
  handleExtension
};