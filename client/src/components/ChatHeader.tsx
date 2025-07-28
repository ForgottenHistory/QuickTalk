import React from 'react';
import { AICharacter, Timer as TimerType } from '../types';
import { useSettingsContext } from '../context/SettingsContext';
import { useCharacterContext } from '../context/CharacterContext';
import { Button, Avatar, Container } from './shared';
import Timer from './Timer';

interface ChatHeaderProps {
  aiCharacter: AICharacter;
  timer: TimerType;
  onExit: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ aiCharacter, timer, onExit }) => {
  const { dispatch } = useSettingsContext();
  const { dispatch: characterDispatch } = useCharacterContext();

  const handleSettingsClick = () => {
    dispatch({ type: 'TOGGLE_SETTINGS' });
  };

  return (
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
  );
};

export default ChatHeader;