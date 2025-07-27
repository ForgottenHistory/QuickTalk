import { useCallback, useRef, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { useSettingsContext } from '../context/SettingsContext';
import { socketService } from '../services/socketService';
import { apiService } from '../services/apiService';

export const useSessionHandling = () => {
  const { state, dispatch } = useAppContext();
  const { settings } = useSettingsContext();
  const autoConnectRef = useRef(settings.appSettings.autoConnect);
  const sessionDurationRef = useRef(settings.appSettings.sessionDuration);

  // Update refs when settings change
  useEffect(() => {
    autoConnectRef.current = settings.appSettings.autoConnect;
    sessionDurationRef.current = settings.appSettings.sessionDuration;
  }, [settings.appSettings.autoConnect, settings.appSettings.sessionDuration]);

  const handleSessionEnd = useCallback(async () => {
    try {
      console.log('Session ended, checking auto-connect setting...');
      
      // Check auto-connect setting (use ref to avoid dependency)
      if (!autoConnectRef.current) {
        console.log('Auto-connect disabled, not creating new session');
        dispatch({ type: 'SET_CONNECTING', payload: false });
        return;
      }

      console.log('Creating new session...');
      const response = await apiService.createSession();
      const { sessionId: newSessionId, aiCharacter: newAI, sessionDuration } = response;
      
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
        
        // Use session duration from backend (which uses settings)
        const duration = sessionDuration || sessionDurationRef.current;
        dispatch({ 
          type: 'SET_TIMER', 
          payload: { minutes: duration, seconds: 0, isActive: true } 
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