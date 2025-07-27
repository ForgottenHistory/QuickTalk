import { useEffect, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { useSettingsContext } from '../context/SettingsContext';
import { socketService } from '../services/socketService';

export const useTimerManagement = () => {
  const { state, dispatch } = useAppContext();
  const { settings } = useSettingsContext();
  const warningTimeRef = useRef(settings.appSettings.extensionWarningTime);

  // Update ref when settings change
  useEffect(() => {
    warningTimeRef.current = settings.appSettings.extensionWarningTime;
  }, [settings.appSettings.extensionWarningTime]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (state.timer.isActive) {
      interval = setInterval(() => {
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
        
        // Show extension modal based on settings (use ref to avoid dependency)
        if (currentTimer.minutes === warningTimeRef.current && 
            currentTimer.seconds === 0 && 
            !state.extensionState.hasBeenOffered) {
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
  }, [
    state.timer.isActive, 
    state.extensionState.hasBeenOffered, 
    state.sessionId, 
    dispatch, 
    state.timer.minutes,
    state.timer.seconds
  ]);
};