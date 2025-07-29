import React, { useState, useEffect } from 'react';
import { AICharacter } from '../types';
import { Container, Avatar } from './shared';

interface ConnectingScreenProps {
  newAI: AICharacter;
}

const ConnectingScreen: React.FC<ConnectingScreenProps> = ({ newAI }) => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <Container variant="centered">
      <div className="loading-content">
        <Avatar emoji={newAI.avatar} size="large" />
        <div className="loading-text">
          Connecting to {newAI.name}{dots}
        </div>
        <div className="loading-subtext">
          {newAI.personality}
        </div>
        <div className="loading-bar">
          <div className="loading-progress" />
        </div>
      </div>
    </Container>
  );
};

export default ConnectingScreen;