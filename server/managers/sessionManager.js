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
    session.timeRemaining = 15 * 60; // Reset to 15 minutes
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