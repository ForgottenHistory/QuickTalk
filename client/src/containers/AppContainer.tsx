import React from 'react';
import { useAppContext } from '../context/AppContext';
import { useAppInitialization } from '../hooks/useAppInitialization';
import { useTimerManagement } from '../hooks/useTimerManagement';
import { useExtensionManagement } from '../hooks/useExtensionManagement';
import { useMessageHandling } from '../hooks/useMessageHandling';
import { useTypingManagement } from '../hooks/useTypingManagement';
import { useSessionHandling } from '../hooks/useSessionHandling';
import { useDemoMode } from '../hooks/useDemoMode';
import ChatView from '../components/ChatView';
import ConnectingScreen from '../components/ConnectingScreen';

const AppContainer: React.FC = () => {
  const { state } = useAppContext();
  
  // Demo mode functionality
  const { isDemoMode, handleDemoMessage, handleDemoExtension, handleDemoExit } = useDemoMode();
  
  // Regular app hooks (only run if not in demo mode)
  useAppInitialization();
  useTimerManagement();
  useExtensionManagement();
  useTypingManagement();
  
  // Message and session handling
  const { handleSendMessage } = useMessageHandling();
  const { handleExit, handleExtend, handleDecline } = useSessionHandling();

  // Choose handlers based on mode
  const messageHandler = isDemoMode ? handleDemoMessage : handleSendMessage;
  const exitHandler = isDemoMode ? handleDemoExit : handleExit;
  const extendHandler = isDemoMode 
    ? () => handleDemoExtension('extend')
    : handleExtend;
  const declineHandler = isDemoMode 
    ? () => handleDemoExtension('decline') 
    : handleDecline;

  // Custom message handler for demo mode
  const handleMessage = async (text: string) => {
    if (isDemoMode) {
      await handleDemoMessage(text);
    } else {
      handleSendMessage(text);
    }
  };

  if (state.isConnecting || !state.aiCharacter) {
    const displayAI = state.nextAI || state.aiCharacter || {
      id: 'loading',
      name: 'Loading',
      personality: isDemoMode ? 'Demo Mode - Connecting...' : 'Connecting to AI...',
      avatar: '⏳'
    };
    return <ConnectingScreen newAI={displayAI} />;
  }

  return (
    <ChatView 
      onSendMessage={handleMessage}
      onExit={exitHandler}
      onExtend={extendHandler}
      onDecline={declineHandler}
      isDemoMode={isDemoMode}
    />
  );
};

export default AppContainer;