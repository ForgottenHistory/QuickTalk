import { useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { useSettingsContext } from '../context/SettingsContext';
import { socketService, SessionData, ExtensionResponse } from '../services/socketService';
import { apiService } from '../services/apiService';
import { Message } from '../types';

export const useAppInitialization = () => {
  const { state, dispatch } = useAppContext();
  const { settings } = useSettingsContext();

  useEffect(() => {
    // Don't initialize if settings are still loading or already connected
    if (!settings.initialLoadComplete || state.isConnected || state.sessionId) {
      return;
    }

    const initializeApp = async () => {
      try {
        console.log('Connecting to server...');
        await socketService.connect();
        dispatch({ type: 'SET_CONNECTED', payload: true });

        console.log('Creating new session...');
        const response = await apiService.createSession();
        const { sessionId: newSessionId, aiCharacter: newAI, sessionDuration } = response;
        
        dispatch({ type: 'SET_SESSION_ID', payload: newSessionId });
        dispatch({ type: 'SET_AI_CHARACTER', payload: newAI });
        
        // Join the socket session
        socketService.joinSession(newSessionId);
        
        // Setup socket listeners
        setupSocketListeners();
        
        // Use session duration from backend (which uses settings)
        const duration = sessionDuration || settings.appSettings.sessionDuration;
        dispatch({ 
          type: 'SET_TIMER', 
          payload: { minutes: duration, seconds: 0, isActive: true } 
        });
        
        dispatch({ type: 'SET_CONNECTING', payload: false });
      } catch (error) {
        console.error('Failed to initialize app:', error);
        dispatch({ type: 'SET_CONNECTING', payload: false });
      }
    };

    const setupSocketListeners = () => {
      socketService.onSessionJoined((session: SessionData) => {
        console.log('Session joined:', session);
        dispatch({ type: 'SET_MESSAGES', payload: session.messages });
      });

      socketService.onNewMessage((message: Message) => {
        console.log('Received message:', message);
        dispatch({ type: 'ADD_MESSAGE', payload: message });
      });

      socketService.onExtensionResponse((response: ExtensionResponse) => {
        dispatch({ 
          type: 'UPDATE_EXTENSION_STATE', 
          payload: {
            userDecision: response.userDecision,
            aiDecision: response.aiDecision
          }
        });
      });

      socketService.onSessionEnded(() => {
        console.log('Session ended event received in app initialization');
        // This will be handled by session management hook
      });

      socketService.onError((error) => {
        console.error('Socket error:', error);
        
        // If it's a "Session not found" error and we have a session ID,
        // it means the session was ended on the backend but frontend doesn't know
        if (error.message === 'Session not found' && state.sessionId) {
          console.log('Session not found error - session may have ended, triggering reconnection');
          // Force a reconnection by dispatching session end
          dispatch({ type: 'SET_CONNECTING', payload: true });
          // Reset session to trigger new connection
          setTimeout(() => {
            window.location.reload(); // Simple but effective solution
          }, 1000);
        }
      });
    };

    initializeApp();

    // Cleanup only on unmount
    return () => {
      socketService.disconnect();
    };
  }, [settings.initialLoadComplete]); // Only depend on initial load completion
};