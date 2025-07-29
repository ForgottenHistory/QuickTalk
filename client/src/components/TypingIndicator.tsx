import React, { useEffect, useRef } from 'react';
import { useAppContext } from '../context/AppContext';

const TypingIndicator: React.FC = () => {
  const { state } = useAppContext();
  const indicatorRef = useRef<HTMLDivElement>(null);

  // Scroll into view when typing indicator appears or disappears
  useEffect(() => {
    if (indicatorRef.current) {
      indicatorRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [state.typingState.isAITyping]);

  if (!state.typingState.isAITyping) {
    return null;
  }

  return (
    <div ref={indicatorRef} className="message message-ai">
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