import React, { useEffect, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { Message as MessageType } from '../types';
import Message from './Message';
import TypingIndicator from './TypingIndicator';

interface ChatMessagesProps {
  messages: MessageType[];
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ messages }) => {
  const { state } = useAppContext();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Also scroll when typing state changes (when indicator appears/disappears)
  useEffect(() => {
    // Small delay to ensure the typing indicator has rendered
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 50);
    
    return () => clearTimeout(timer);
  }, [state.typingState.isAITyping]);

  return (
    <div className="messages-container">
      {messages.length === 0 ? (
        <div className="empty-state">
          Start your conversation...
        </div>
      ) : (
        <>
          {messages.map((message) => (
            <Message key={message.id} message={message} />
          ))}
          <TypingIndicator />
        </>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessages;