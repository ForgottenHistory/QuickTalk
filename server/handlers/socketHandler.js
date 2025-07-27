const { v4: uuidv4 } = require('uuid');
const sessionManager = require('../managers/sessionManager');
const messageHandler = require('./messageHandler');
const extensionHandler = require('./extensionHandler');

const socketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    
    socket.on('join-session', (sessionId) => {
      const session = sessionManager.getSession(sessionId);
      if (session) {
        socket.join(sessionId);
        socket.sessionId = sessionId;
        socket.emit('session-joined', session);
      } else {
        socket.emit('error', { message: 'Session not found' });
      }
    });
    
    socket.on('send-message', async ({ sessionId, message }) => {
      await messageHandler.handleMessage(io, socket, sessionId, message);
    });
    
    // NEW: Handle typing status
    socket.on('typing-status', ({ sessionId, isTyping, sender }) => {
      const session = sessionManager.getSession(sessionId);
      if (session) {
        // Broadcast typing status to other participants in the session
        socket.to(sessionId).emit('typing-update', { 
          isTyping, 
          sender 
        });
      }
    });
    
    socket.on('extend-session', async ({ sessionId, decision }) => {
      await extensionHandler.handleExtension(socket, sessionId, decision);
    });
    
    socket.on('end-session', (sessionId) => {
      const session = sessionManager.getSession(sessionId);
      if (session) {
        sessionManager.endSession(sessionId);
        socket.emit('session-ended');
      }
    });
    
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
};

module.exports = socketHandler;