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
    
    // The actual session extension/ending will be handled by the frontend
    // after showing the appropriate message to the user
    
  } catch (error) {
    console.error('Error handling extension:', error);
    
    // On error, assume AI declines to be safe
    socket.emit('extension-response', {
      userDecision: decision,
      aiDecision: 'decline',
      success: false
    });
  }
};

module.exports = {
  handleExtension
};