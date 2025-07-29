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

  // Listen for session-ended events from socket
  useEffect(() => {
    const handleSessionEnded = () => {
      console.log('Session ended event received');
      handleSessionEnd();
    };

    socketService.onSessionEnded(handleSessionEnded);

    // Clean up only session-ended listeners when component unmounts
    return () => {
      socketService.removeSessionEndedListeners();
    };
  }, []);

  const handleSessionEnd = useCallback(async () => {
    try {
      console.log('Handling session end, checking auto-connect setting...');
      
      // Set connecting state immediately
      dispatch({ type: 'SET_CONNECTING', payload: true });
      
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
      
      // Clean up current session state
      dispatch({ type: 'RESET_SESSION' });
      
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
        
        // Join new session
        socketService.joinSession(newSessionId);
        dispatch({ type: 'SET_CONNECTING', payload: false });
        dispatch({ type: 'SET_NEXT_AI', payload: null });
        
        console.log('Successfully connected to new AI:', newAI.name);
      }, 3000);
    } catch (error) {
      console.error('Failed to create new session:', error);
      dispatch({ type: 'SET_CONNECTING', payload: false });
    }
  }, [dispatch]);

  const handleExit = useCallback(() => {
    console.log('User manually exiting session');
    if (state.sessionId) {
      socketService.endSession(state.sessionId);
    }
    // The session-ended event will trigger handleSessionEnd
  }, [state.sessionId]);

  const handleExtend = useCallback(() => {
    console.log('User wants to extend session');
    if (state.sessionId) {
      socketService.requestExtension(state.sessionId, 'extend');
    }
    dispatch({ 
      type: 'UPDATE_EXTENSION_STATE', 
      payload: { userDecision: 'extend' } 
    });
  }, [state.sessionId, dispatch]);

  const handleDecline = useCallback(() => {
    console.log('User declined extension');
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