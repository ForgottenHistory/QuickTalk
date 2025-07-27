import { useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { socketService, SessionData, ExtensionResponse } from '../services/socketService';
import { apiService } from '../services/apiService';
import { Message } from '../types';

export const useAppInitialization = () => {
  const { state, dispatch } = useAppContext();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('Connecting to server...');
        await socketService.connect();
        dispatch({ type: 'SET_CONNECTED', payload: true });

        console.log('Creating new session...');
        const { sessionId: newSessionId, aiCharacter: newAI } = await apiService.createSession();
        
        dispatch({ type: 'SET_SESSION_ID', payload: newSessionId });
        dispatch({ type: 'SET_AI_CHARACTER', payload: newAI });
        
        // Join the socket session
        socketService.joinSession(newSessionId);
        
        // Setup socket listeners
        setupSocketListeners();
        
        dispatch({ 
          type: 'SET_TIMER', 
          payload: { minutes: 15, seconds: 0, isActive: true } 
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
        // This will be handled by session management hook
      });

      socketService.onError((error) => {
        console.error('Socket error:', error);
      });
    };

    initializeApp();

    return () => {
      socketService.disconnect();
    };
  }, [dispatch]);
};