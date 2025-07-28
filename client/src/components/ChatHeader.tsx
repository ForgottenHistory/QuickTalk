import React, { useState } from 'react';
import { AICharacter, Timer as TimerType } from '../types';
import { useSettingsContext } from '../context/SettingsContext';
import { useCharacterContext } from '../context/CharacterContext';
import { Button, Avatar, Container } from './shared';
import Timer from './Timer';
import PromptInspector from './PromptInspector';

interface ChatHeaderProps {
  aiCharacter: AICharacter;
  timer: TimerType;
  onExit: () => void;
  currentUserMessage?: string;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ 
  aiCharacter, 
  timer, 
  onExit,
  currentUserMessage = ''
}) => {
  const { dispatch } = useSettingsContext();
  const { dispatch: characterDispatch } = useCharacterContext();
  const [showPromptInspector, setShowPromptInspector] = useState(false);

  console.log('ChatHeader aiCharacter:', JSON.stringify(aiCharacter, null, 2));

  const handleSettingsClick = () => {
    dispatch({ type: 'TOGGLE_SETTINGS' });
  };

  const handlePromptInspectorClick = () => {
    setShowPromptInspector(true);
  };

  const handlePromptInspectorClose = () => {
    setShowPromptInspector(false);
  };

  return (
    <>
      <div className="header">
        <div className="header-left">
          <Avatar emoji={aiCharacter.avatar} />
          <div>
            <h3 className="header-title">{aiCharacter.name}</h3>
            <p className="header-subtitle">{aiCharacter.personality}</p>
          </div>
        </div>

        <div className="header-right">
          <Timer timer={timer} />
          <Button onClick={handlePromptInspectorClick} variant="secondary">
            🔍 Prompt
          </Button>
          <Button onClick={handleSettingsClick} variant="secondary">
            ⚙️ Settings
          </Button>
          <Button onClick={() => characterDispatch({ type: 'TOGGLE_MANAGEMENT' })} variant="secondary">
            👥 Characters
          </Button>
          <Button onClick={onExit} variant="secondary">
            Exit Chat
          </Button>
        </div>
      </div>

      <PromptInspector
        isVisible={showPromptInspector}
        onClose={handlePromptInspectorClose}
        currentUserMessage={currentUserMessage}
      />
    </>
  );
};

export default ChatHeader;