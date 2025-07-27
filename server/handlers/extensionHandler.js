const sessionManager = require('../managers/sessionManager');
const aiService = require('../services/aiService');

const handleExtension = async (socket, sessionId, decision) => {
  const session = sessionManager.getSession(sessionId);
  if (!session) {
    socket.emit('error', { message: 'Session not found' });
    return;
  }

  try {
    // Get AI decision based on conversation
    const aiDecision = await aiService.generateExtensionDecision(
      session.aiCharacter, 
      session.messages
    );
    
    socket.emit('extension-response', {
      userDecision: decision,
      aiDecision,
      success: decision === 'extend' && aiDecision === 'extend'
    });
    
    if (decision === 'extend' && aiDecision === 'extend') {
      sessionManager.extendSession(sessionId);
    } else {
      sessionManager.endSession(sessionId);
    }
  } catch (error) {
    console.error('Error handling extension:', error);
    socket.emit('error', { message: 'Failed to process extension request' });
  }
};

module.exports = {
  handleExtension
};