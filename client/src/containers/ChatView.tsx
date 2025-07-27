import React from 'react';
import { useAppContext } from '../context/AppContext';
import { useSessionHandling } from '../hooks/useSessionHandling';
import ChatHeader from '../components/ChatHeader';
import ChatMessages from '../components/ChatMessages';
import ChatInput from '../components/ChatInput';
import ExtensionModal from '../components/ExtensionModal';
import SettingsPanel from '../components/SettingsPanel';

interface ChatViewProps {
  onSendMessage: (text: string) => void;
}

const ChatView: React.FC<ChatViewProps> = ({ onSendMessage }) => {
  const { state } = useAppContext();
  const { handleExit, handleExtend, handleDecline } = useSessionHandling();

  if (!state.aiCharacter) {
    return null;
  }

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#000000'
    }}>
      <ChatHeader 
        aiCharacter={state.aiCharacter} 
        timer={state.timer} 
        onExit={handleExit} 
      />
      
      <ChatMessages messages={state.messages} />
      
      <ChatInput 
        onSendMessage={onSendMessage} 
        disabled={!state.timer.isActive || !state.isConnected}
      />
      
      <ExtensionModal
        isVisible={state.extensionState.isModalVisible}
        onExtend={handleExtend}
        onDecline={handleDecline}
        aiWantsExtension={state.extensionState.aiDecision === 'extend'}
        userDecision={state.extensionState.userDecision}
      />
      
      <SettingsPanel />
    </div>
  );
};

export default ChatView;