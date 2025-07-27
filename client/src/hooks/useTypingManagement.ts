import { useEffect, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { socketService } from '../services/socketService';

export const useTypingManagement = () => {
  const { state, dispatch } = useAppContext();
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle user typing indicator
  const handleUserTyping = () => {
    if (!state.sessionId || !state.isConnected) return;

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Send typing start if not already typing
    if (!state.typingState.isUserTyping) {
      socketService.sendTypingStatus(state.sessionId, true);
      dispatch({ 
        type: 'UPDATE_TYPING_STATE', 
        payload: { isUserTyping: true } 
      });
    }

    // Set timeout to stop typing after 3 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      if (state.sessionId) {
        socketService.sendTypingStatus(state.sessionId, false);
        dispatch({ 
          type: 'UPDATE_TYPING_STATE', 
          payload: { isUserTyping: false } 
        });
      }
    }, 3000);
  };

  const stopUserTyping = () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    if (state.typingState.isUserTyping && state.sessionId) {
      socketService.sendTypingStatus(state.sessionId, false);
      dispatch({ 
        type: 'UPDATE_TYPING_STATE', 
        payload: { isUserTyping: false } 
      });
    }
  };

  // Setup socket listeners for typing events
  useEffect(() => {
    const handleTypingUpdate = (data: { isTyping: boolean; sender: 'user' | 'ai' }) => {
      if (data.sender === 'ai') {
        dispatch({
          type: 'UPDATE_TYPING_STATE',
          payload: { isAITyping: data.isTyping }
        });
      }
    };

    socketService.onTypingUpdate(handleTypingUpdate);

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [dispatch]);

  // Reset typing state when session changes
  useEffect(() => {
    dispatch({
      type: 'SET_TYPING_STATE',
      payload: { isAITyping: false, isUserTyping: false }
    });
  }, [state.sessionId, dispatch]);

  return {
    handleUserTyping,
    stopUserTyping
  };
};