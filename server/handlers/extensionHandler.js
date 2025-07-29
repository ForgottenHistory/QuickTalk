const sessionManager = require('../managers/sessionManager');
const aiService = require('../services/aiService');

const handleExtension = async (socket, sessionId, decision) => {
  const session = sessionManager.getSession(sessionId);
  if (!session) {
    console.error(`Extension requested for non-existent session: ${sessionId}`);
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
      
      // Extend the session immediately instead of using setTimeout
      sessionManager.extendSession(sessionId);
      console.log(`Session ${sessionId} extended successfully`);
      
      // Mark that extension was successful - don't end the session
      // The frontend will handle hiding the modal after showing the success message
      
    } else {
      console.log(`Extension declined for session ${sessionId}, will end session after delay`);
      
      // End session after delay for message display, but keep session alive for now
      setTimeout(() => {
        const currentSession = sessionManager.getSession(sessionId);
        if (currentSession) {
          sessionManager.endSession(sessionId);
          socket.emit('session-ended');
          console.log(`Session ${sessionId} ended and session-ended event sent`);
        }
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
      const currentSession = sessionManager.getSession(sessionId);
      if (currentSession) {
        sessionManager.endSession(sessionId);
        socket.emit('session-ended');
      }
    }, 2500);
  }
};

module.exports = {
  handleExtension
};