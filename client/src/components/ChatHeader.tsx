import React from 'react';
import { AICharacter, Timer as TimerType } from '../types';
import { useSettingsContext } from '../context/SettingsContext';
import Timer from './Timer';

interface ChatHeaderProps {
  aiCharacter: AICharacter;
  timer: TimerType;
  onExit: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ aiCharacter, timer, onExit }) => {
  const { dispatch } = useSettingsContext();

  const handleSettingsClick = () => {
    dispatch({ type: 'TOGGLE_SETTINGS' });
  };

  const buttonStyle = {
    padding: '8px 16px',
    borderRadius: '20px',
    border: '2px solid #ffd900',
    backgroundColor: 'transparent',
    color: '#ffd900',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '12px',
    transition: 'all 0.2s ease'
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '16px 20px',
      backgroundColor: '#212121',
      borderBottom: '2px solid #ffd900'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          backgroundColor: '#ffd900',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px'
        }}>
          {aiCharacter.avatar}
        </div>
        <div>
          <h3 style={{ color: '#ffffff', margin: 0, fontSize: '18px' }}>
            {aiCharacter.name}
          </h3>
          <p style={{ 
            color: '#ffec3d', 
            margin: 0, 
            fontSize: '12px',
            fontStyle: 'italic'
          }}>
            {aiCharacter.personality}
          </p>
        </div>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Timer timer={timer} />
        
        <button
          onClick={handleSettingsClick}
          style={buttonStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#ffd900';
            e.currentTarget.style.color = '#000000';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#ffd900';
          }}
        >
          ⚙️ Settings
        </button>
        
        <button
          onClick={onExit}
          style={buttonStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#ffd900';
            e.currentTarget.style.color = '#000000';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#ffd900';
          }}
        >
          Exit Chat
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;