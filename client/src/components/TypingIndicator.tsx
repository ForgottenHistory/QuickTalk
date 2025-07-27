import React from 'react';
import { useAppContext } from '../context/AppContext';

const TypingIndicator: React.FC = () => {
  const { state } = useAppContext();

  if (!state.typingState.isAITyping) {
    return null;
  }

  return (
    <div className="message message-ai">
      <div className="message-bubble message-bubble-ai typing-indicator">
        <div className="typing-dots">
          <div className="typing-dot" />
          <div className="typing-dot" />
          <div className="typing-dot" />
        </div>
        <span className="typing-text">
          {state.aiCharacter?.name} is typing...
        </span>
      </div>
    </div>
  );
};

export default TypingIndicator;