import { useCallback } from 'react';
import { useAppContext } from '../context/AppContext';
import { socketService } from '../services/socketService';

export const useMessageHandling = () => {
  const { state } = useAppContext();

  const handleSendMessage = useCallback((text: string) => {
    console.log('Sending message:', text, typeof text);
    if (state.sessionId && state.isConnected) {
      socketService.sendMessage(state.sessionId, text);
    }
  }, [state.sessionId, state.isConnected]);

  return {
    handleSendMessage
  };
};