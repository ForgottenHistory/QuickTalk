import React from 'react';
import { useAppContext } from '../context/AppContext';
import { useAppInitialization } from '../hooks/useAppInitialization';
import { useTimerManagement } from '../hooks/useTimerManagement';
import { useExtensionManagement } from '../hooks/useExtensionManagement';
import { useMessageHandling } from '../hooks/useMessageHandling';
import { useTypingManagement } from '../hooks/useTypingManagement';
import ChatView from './ChatView';
import ConnectingScreen from '../components/ConnectingScreen';

const AppContainer: React.FC = () => {
  const { state } = useAppContext();
  
  // Initialize app and setup connections
  useAppInitialization();
  
  // Handle timer countdown
  useTimerManagement();
  
  // Handle extension logic
  useExtensionManagement();
  
  // Handle typing indicators
  useTypingManagement();
  
  // Handle message sending
  const { handleSendMessage } = useMessageHandling();

  if (state.isConnecting || !state.aiCharacter) {
    const displayAI = state.nextAI || state.aiCharacter || {
      id: 'loading',
      name: 'Loading',
      personality: 'Connecting to AI...',
      avatar: '⏳'
    };
    return <ConnectingScreen newAI={displayAI} />;
  }

  return <ChatView onSendMessage={handleSendMessage} />;
};

export default AppContainer;