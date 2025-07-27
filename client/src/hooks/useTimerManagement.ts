import { useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { socketService } from '../services/socketService';

export const useTimerManagement = () => {
  const { state, dispatch } = useAppContext();

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (state.timer.isActive) {
      interval = setInterval(() => {
        dispatch({ type: 'UPDATE_TIMER', payload: {} }); // This will trigger the timer update logic
        
        const currentTimer = state.timer;
        
        if (currentTimer.seconds > 0) {
          dispatch({ 
            type: 'UPDATE_TIMER', 
            payload: { seconds: currentTimer.seconds - 1 } 
          });
        } else if (currentTimer.minutes > 0) {
          dispatch({ 
            type: 'UPDATE_TIMER', 
            payload: { 
              minutes: currentTimer.minutes - 1, 
              seconds: 59 
            } 
          });
        } else {
          dispatch({ 
            type: 'UPDATE_TIMER', 
            payload: { isActive: false } 
          });
          
          // Auto end session when timer reaches 0
          if (state.sessionId) {
            socketService.endSession(state.sessionId);
          }
        }
        
        // Show extension modal at 2 minutes remaining
        if (currentTimer.minutes === 2 && currentTimer.seconds === 0 && !state.extensionState.hasBeenOffered) {
          dispatch({ 
            type: 'UPDATE_EXTENSION_STATE', 
            payload: {
              isModalVisible: true,
              hasBeenOffered: true
            }
          });
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [state.timer.isActive, state.extensionState.hasBeenOffered, state.sessionId, dispatch, state.timer]);
};