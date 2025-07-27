const settingsManager = require('./settingsManager');

// In-memory storage (replace with database later)
const activeSessions = new Map();

const createSession = (sessionId, sessionData) => {
  activeSessions.set(sessionId, sessionData);
  return sessionData;
};

const getSession = (sessionId) => {
  return activeSessions.get(sessionId);
};

const addMessage = (sessionId, message) => {
  const session = activeSessions.get(sessionId);
  if (session) {
    session.messages.push(message);
    return true;
  }
  return false;
};

const extendSession = (sessionId) => {
  const session = activeSessions.get(sessionId);
  if (session) {
    // Use settings for extension duration
    const extensionDuration = settingsManager.getExtensionDuration();
    session.timeRemaining = extensionDuration * 60; // Convert minutes to seconds
    return true;
  }
  return false;
};

const endSession = (sessionId) => {
  const session = activeSessions.get(sessionId);
  if (session) {
    session.isActive = false;
    return true;
  }
  return false;
};

const getAllSessions = () => {
  return Array.from(activeSessions.values());
};

const deleteSession = (sessionId) => {
  return activeSessions.delete(sessionId);
};

module.exports = {
  createSession,
  getSession,
  addMessage,
  extendSession,
  endSession,
  getAllSessions,
  deleteSession
};