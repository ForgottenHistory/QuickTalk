import { useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { socketService } from '../services/socketService';

export const useExtensionManagement = () => {
  const { state, dispatch } = useAppContext();

  useEffect(() => {
    if (state.extensionState.userDecision && state.extensionState.aiDecision) {
      setTimeout(() => {
        if (state.extensionState.userDecision === 'extend' && state.extensionState.aiDecision === 'extend') {
          // Both want to extend - reset timer
          dispatch({
            type: 'SET_TIMER',
            payload: { minutes: 15, seconds: 0, isActive: true }
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
  }, [state.extensionState.userDecision, state.extensionState.aiDecision, state.sessionId, dispatch]);
};