import React, { useState, useEffect } from 'react';
import { AICharacter } from '../types';

interface ConnectingScreenProps {
  onConnected: (newAI: AICharacter) => void;
  newAI: AICharacter;
}

const ConnectingScreen: React.FC<ConnectingScreenProps> = ({ onConnected, newAI }) => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    console.log('ConnectingScreen mounted for:', newAI.name); // Debug log
    
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);

    const timeout = setTimeout(() => {
      console.log('Calling onConnected for:', newAI.name); // Debug log
      onConnected(newAI);
    }, 3000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [onConnected, newAI]);

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#000000',
      color: '#ffffff'
    }}>
      <div style={{
        textAlign: 'center',
        maxWidth: '400px'
      }}>
        <div style={{
          fontSize: '48px',
          marginBottom: '20px'
        }}>
          {newAI.avatar}
        </div>
        
        <div style={{
          fontSize: '24px',
          color: '#ffd900',
          marginBottom: '12px',
          fontWeight: 'bold'
        }}>
          Connecting to {newAI.name}{dots}
        </div>
        
        <div style={{
          fontSize: '16px',
          color: '#ffec3d',
          fontStyle: 'italic',
          marginBottom: '30px'
        }}>
          {newAI.personality}
        </div>
        
        <div style={{
          width: '200px',
          height: '4px',
          backgroundColor: '#212121',
          borderRadius: '2px',
          overflow: 'hidden',
          margin: '0 auto'
        }}>
          <div style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#ffd900',
            animation: 'loading 2s ease-in-out infinite'
          }} />
        </div>
        
        <style>
          {`
            @keyframes loading {
              0% { transform: translateX(-100%); }
              50% { transform: translateX(0%); }
              100% { transform: translateX(100%); }
            }
          `}
        </style>
      </div>
    </div>
  );
};

export default ConnectingScreen;