import React from 'react';
import { useAppContext } from '../context/AppContext';

const TypingIndicator: React.FC = () => {
  const { state } = useAppContext();

  if (!state.typingState.isAITyping) {
    return null;
  }

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'flex-start',
      marginBottom: '16px',
      padding: '0 20px'
    }}>
      <div style={{
        maxWidth: '70%',
        padding: '12px 16px',
        borderRadius: '18px',
        backgroundColor: '#212121',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#ffd900',
            animation: 'typing 1.4s infinite ease-in-out'
          }} />
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#ffd900',
            animation: 'typing 1.4s infinite ease-in-out 0.2s'
          }} />
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#ffd900',
            animation: 'typing 1.4s infinite ease-in-out 0.4s'
          }} />
        </div>
        <span style={{
          fontSize: '12px',
          color: '#ffec3d',
          fontStyle: 'italic'
        }}>
          {state.aiCharacter?.name} is typing...
        </span>
        
        <style>
          {`
            @keyframes typing {
              0%, 60%, 100% {
                transform: translateY(0);
                opacity: 0.4;
              }
              30% {
                transform: translateY(-10px);
                opacity: 1;
              }
            }
          `}
        </style>
      </div>
    </div>
  );
};

export default TypingIndicator;