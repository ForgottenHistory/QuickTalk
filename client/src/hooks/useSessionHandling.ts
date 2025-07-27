import { useCallback } from 'react';
import { useAppContext } from '../context/AppContext';
import { socketService } from '../services/socketService';
import { apiService } from '../services/apiService';

export const useSessionHandling = () => {
  const { state, dispatch } = useAppContext();

  const handleSessionEnd = useCallback(async () => {
    try {
      console.log('Session ended, creating new session...');
      const { sessionId: newSessionId, aiCharacter: newAI } = await apiService.createSession();
      
      dispatch({ type: 'SET_NEXT_AI', payload: newAI });
      dispatch({ type: 'SET_CONNECTING', payload: true });
      
      // Clean up current session
      if (state.sessionId) {
        socketService.endSession(state.sessionId);
      }
      
      // Connect to new session after delay
      setTimeout(() => {
        dispatch({ type: 'SET_SESSION_ID', payload: newSessionId });
        dispatch({ type: 'SET_AI_CHARACTER', payload: newAI });
        dispatch({ type: 'SET_MESSAGES', payload: [] });
        dispatch({ 
          type: 'SET_TIMER', 
          payload: { minutes: 15, seconds: 0, isActive: true } 
        });
        dispatch({
          type: 'SET_EXTENSION_STATE',
          payload: {
            isModalVisible: false,
            userDecision: null,
            aiDecision: null,
            hasBeenOffered: false
          }
        });
        
        socketService.joinSession(newSessionId);
        dispatch({ type: 'SET_CONNECTING', payload: false });
        dispatch({ type: 'SET_NEXT_AI', payload: null });
      }, 3000);
    } catch (error) {
      console.error('Failed to create new session:', error);
    }
  }, [state.sessionId, dispatch]);

  const handleExit = useCallback(() => {
    if (state.sessionId) {
      socketService.endSession(state.sessionId);
    }
    handleSessionEnd();
  }, [state.sessionId, handleSessionEnd]);

  const handleExtend = useCallback(() => {
    if (state.sessionId) {
      socketService.requestExtension(state.sessionId, 'extend');
    }
    dispatch({ 
      type: 'UPDATE_EXTENSION_STATE', 
      payload: { userDecision: 'extend' } 
    });
  }, [state.sessionId, dispatch]);

  const handleDecline = useCallback(() => {
    if (state.sessionId) {
      socketService.requestExtension(state.sessionId, 'decline');
    }
    dispatch({ 
      type: 'UPDATE_EXTENSION_STATE', 
      payload: { userDecision: 'decline' } 
    });
  }, [state.sessionId, dispatch]);

  return {
    handleExit,
    handleExtend,
    handleDecline,
    handleSessionEnd
  };
};