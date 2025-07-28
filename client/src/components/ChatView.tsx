import React from 'react';
import { useAppContext } from '../context/AppContext';
import { useSessionHandling } from '../hooks/useSessionHandling';
import { Container } from './shared';
import ChatHeader from './ChatHeader';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';
import ExtensionModal from './ExtensionModal';
import SettingsPanel from './SettingsPanel';
import CharacterManagementPanel from './CharacterManagementPanel';

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
    <Container variant="chat">
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
      <CharacterManagementPanel />

    </Container>
  );
};

export default ChatView;