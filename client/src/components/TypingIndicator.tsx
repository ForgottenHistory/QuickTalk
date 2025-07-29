import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';

const TypingIndicator: React.FC = () => {
  const { state } = useAppContext();
  const [showIndicator, setShowIndicator] = useState(false);

  // Use a small delay to prevent flickering when typing state changes rapidly
  useEffect(() => {
    if (state.typingState.isAITyping) {
      setShowIndicator(true);
    } else {
      // Add a small delay before hiding to prevent flickering between messages
      const hideDelay = setTimeout(() => {
        setShowIndicator(false);
      }, 200);
      
      return () => clearTimeout(hideDelay);
    }
  }, [state.typingState.isAITyping]);

  if (!showIndicator) {
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