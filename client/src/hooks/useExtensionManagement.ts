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

    // Check if both parties want to extend
    const bothWantExtension = state.extensionState.userDecision === 'extend' && 
                             state.extensionState.aiDecision === 'extend';

    if (bothWantExtension) {
      console.log('Both parties want to extend, extending session immediately');
      
      // Extend the timer immediately since backend already extended the session
      dispatch({
        type: 'SET_TIMER',
        payload: { minutes: extensionDurationRef.current, seconds: 0, isActive: true }
      });
    }

    // Wait 2 seconds to show the result message, then hide modal
    setTimeout(() => {
      console.log('Hiding extension modal after showing result');
      dispatch({
        type: 'SET_EXTENSION_STATE',
        payload: {
          isModalVisible: false,
          userDecision: null,
          aiDecision: null,
          hasBeenOffered: false
        }
      });

      // If extension was declined, the backend will send session-ended event
      // The session handling hook will handle connecting to a new AI

    }, 2000);

  }, [
    state.extensionState.userDecision, 
    state.extensionState.aiDecision, 
    dispatch
  ]);
};