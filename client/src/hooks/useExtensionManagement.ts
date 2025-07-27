import { useEffect, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { useSettingsContext } from '../context/SettingsContext';
import { socketService } from '../services/socketService';

export const useExtensionManagement = () => {
  const { state, dispatch } = useAppContext();
  const { settings } = useSettingsContext();
  const extensionDurationRef = useRef(settings.appSettings.extensionDuration);

  // Update ref when settings change
  useEffect(() => {
    extensionDurationRef.current = settings.appSettings.extensionDuration;
  }, [settings.appSettings.extensionDuration]);

  useEffect(() => {
    if (state.extensionState.userDecision && state.extensionState.aiDecision) {
      setTimeout(() => {
        if (state.extensionState.userDecision === 'extend' && state.extensionState.aiDecision === 'extend') {
          // Both want to extend - reset timer with extension duration from settings (use ref)
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
          // Either declined - end session
          if (state.sessionId) {
            socketService.endSession(state.sessionId);
          }
        }
      }, 2000);
    }
  }, [
    state.extensionState.userDecision, 
    state.extensionState.aiDecision, 
    state.sessionId, 
    dispatch
  ]);
};