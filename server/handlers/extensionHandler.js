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
    
    // Get AI decision based on conversation
    const aiDecision = await aiService.generateExtensionDecision(
      session.aiCharacter, 
      session.messages
    );
    
    console.log(`AI decision for session ${sessionId}: ai=${aiDecision}`);
    
    // Send response to client
    socket.emit('extension-response', {
      userDecision: decision,
      aiDecision,
      success: decision === 'extend' && aiDecision === 'extend'
    });
    
    if (decision === 'extend' && aiDecision === 'extend') {
      // Both want to extend - extend the session
      console.log(`Extending session ${sessionId}`);
      sessionManager.extendSession(sessionId);
    } else {
      // Either party declined - end session
      console.log(`Ending session ${sessionId} due to extension decline`);
      sessionManager.endSession(sessionId);
      
      // Emit session-ended event to trigger new AI connection
      socket.emit('session-ended');
    }
  } catch (error) {
    console.error('Error handling extension:', error);
    socket.emit('error', { message: 'Failed to process extension request' });
  }
};

module.exports = {
  handleExtension
};