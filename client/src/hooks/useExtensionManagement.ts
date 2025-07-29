import { useEffect, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { useSettingsContext } from '../context/SettingsContext';

export const useExtensionManagement = () => {
  const { state, dispatch } = useAppContext();
  const { settings } = useSettingsContext();
  const extensionDurationRef = useRef(settings.appSettings.extensionDuration);

  // Update ref when settings change
  useEffect(() => {
    extensionDurationRef.current = settings.appSettings.extensionDuration;
  }, [settings.appSettings.extensionDuration]);

  // Only proceed when BOTH user and AI decisions are available
  useEffect(() => {
    // Don't proceed unless we have both decisions
    if (!state.extensionState.userDecision || !state.extensionState.aiDecision) {
      return;
    }

    console.log('Extension decisions:', {
      user: state.extensionState.userDecision,
      ai: state.extensionState.aiDecision
    });

    // Wait 2 seconds to show the result message, then act
    setTimeout(() => {
      if (state.extensionState.userDecision === 'extend' && state.extensionState.aiDecision === 'extend') {
        // Both want to extend - reset timer with extension duration from settings
        console.log('Both parties want to extend, extending session');
        dispatch({
          type: 'SET_TIMER',
          payload: { minutes: extensionDurationRef.current, seconds: 0, isActive: true }
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
      } else {
        // Either party declined - hide modal and wait for backend to send session-ended
        console.log('Extension declined, hiding modal and waiting for session-ended event');
        dispatch({
          type: 'SET_EXTENSION_STATE',
          payload: {
            isModalVisible: false,
            userDecision: null,
            aiDecision: null,
            hasBeenOffered: false
          }
        });
        // Don't call socketService.endSession here - let backend handle it
        // The session-ended event will trigger the new AI connection
      }
    }, 2000);
  }, [
    state.extensionState.userDecision, 
    state.extensionState.aiDecision, 
    dispatch
  ]);
};