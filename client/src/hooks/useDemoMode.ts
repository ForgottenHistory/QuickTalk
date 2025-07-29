import { useEffect, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { demoApiService } from '../services/demoApiService';
import { Message } from '../types';

// Simple UUID generator for demo mode
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Hook to handle demo mode functionality
export const useDemoMode = () => {
  const { state, dispatch } = useAppContext();
  const isDemoMode = process.env.NODE_ENV === 'production' && window.location.hostname.includes('github.io');
  const messageTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isDemoMode) return;

    // Initialize demo mode
    const initDemo = () => {
      const aiCharacter = demoApiService.getRandomCharacter();
      
      dispatch({ type: 'SET_CONNECTED', payload: true });
      dispatch({ type: 'SET_SESSION_ID', payload: 'demo-session' });
      dispatch({ type: 'SET_AI_CHARACTER', payload: aiCharacter });
      dispatch({ 
        type: 'SET_TIMER', 
        payload: { minutes: 15, seconds: 0, isActive: true } 
      });
      dispatch({ type: 'SET_CONNECTING', payload: false });

      // Add welcome message
      const welcomeMessage: Message = {
        id: generateId(),
        text: `Hi! I'm ${aiCharacter.name}. ${aiCharacter.personality}. This is a demo version - in the full app, I'd be powered by real AI! Try chatting with me!`,
        sender: 'ai',
        timestamp: new Date()
      };
      
      dispatch({ type: 'ADD_MESSAGE', payload: welcomeMessage });
    };

    initDemo();
  }, [isDemoMode, dispatch]);

  const handleDemoMessage = async (userMessage: string) => {
    if (!isDemoMode || !state.aiCharacter) return false;

    // Add user message
    const userMsg: Message = {
      id: generateId(),
      text: userMessage,
      sender: 'user',
      timestamp: new Date()
    };
    dispatch({ type: 'ADD_MESSAGE', payload: userMsg });

    // Show typing indicator
    dispatch({ 
      type: 'UPDATE_TYPING_STATE', 
      payload: { isAITyping: true } 
    });

    try {
      // Generate AI response
      const aiResponse = await demoApiService.generateResponse(userMessage, state.aiCharacter);
      
      // Stop typing indicator
      dispatch({ 
        type: 'UPDATE_TYPING_STATE', 
        payload: { isAITyping: false } 
      });

      // Add AI response
      const aiMsg: Message = {
        id: generateId(),
        text: aiResponse,
        sender: 'ai',
        timestamp: new Date()
      };
      dispatch({ type: 'ADD_MESSAGE', payload: aiMsg });

    } catch (error) {
      dispatch({ 
        type: 'UPDATE_TYPING_STATE', 
        payload: { isAITyping: false } 
      });
      
      const errorMsg: Message = {
        id: generateId(),
        text: "Sorry, I'm having trouble responding right now. This is just a demo!",
        sender: 'ai',
        timestamp: new Date()
      };
      dispatch({ type: 'ADD_MESSAGE', payload: errorMsg });
    }

    return true; // Handled by demo
  };

  const handleDemoExtension = async (decision: 'extend' | 'decline') => {
    if (!isDemoMode || !state.aiCharacter) return false;

    const aiDecision = await demoApiService.generateExtensionDecision(state.aiCharacter);
    
    dispatch({ 
      type: 'UPDATE_EXTENSION_STATE', 
      payload: {
        userDecision: decision,
        aiDecision: aiDecision
      }
    });

    return true; // Handled by demo
  };

  const handleDemoExit = () => {
    if (!isDemoMode) return false;

    // Get new character
    const newCharacter = demoApiService.getRandomCharacter();
    
    dispatch({ type: 'SET_CONNECTING', payload: true });
    dispatch({ type: 'SET_NEXT_AI', payload: newCharacter });
    
    setTimeout(() => {
      dispatch({ type: 'RESET_SESSION' });
      dispatch({ type: 'SET_SESSION_ID', payload: 'demo-session' });
      dispatch({ type: 'SET_AI_CHARACTER', payload: newCharacter });
      dispatch({ type: 'SET_MESSAGES', payload: [] });
      dispatch({ 
        type: 'SET_TIMER', 
        payload: { minutes: 15, seconds: 0, isActive: true } 
      });
      dispatch({ type: 'SET_CONNECTING', payload: false });
      dispatch({ type: 'SET_NEXT_AI', payload: null });

      // Add welcome message for new character
      const welcomeMessage: Message = {
        id: generateId(),
        text: `Hello! I'm ${newCharacter.name}. ${newCharacter.personality}. Nice to meet you!`,
        sender: 'ai',
        timestamp: new Date()
      };
      dispatch({ type: 'ADD_MESSAGE', payload: welcomeMessage });
    }, 3000);

    return true; // Handled by demo
  };

  return {
    isDemoMode,
    handleDemoMessage,
    handleDemoExtension,
    handleDemoExit
  };
};