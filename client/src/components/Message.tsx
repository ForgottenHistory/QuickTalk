import React from 'react';
import { Message as MessageType } from '../types';

interface MessageProps {
  message: MessageType;
}

const Message: React.FC<MessageProps> = ({ message }) => {
  const isUser = message.sender === 'user';
  
  const getFormattedTime = (timestamp: Date | string): string => {
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };
  
  return (
    <div className={`message ${isUser ? 'message-user' : 'message-ai'}`}>
      <div className={`message-bubble ${isUser ? 'message-bubble-user' : 'message-bubble-ai'}`}>
        <div className="message-text">
          {typeof message.text === 'string' ? message.text : 'Message could not be displayed'}
        </div>
        <div className="message-time">
          {getFormattedTime(message.timestamp)}
        </div>
      </div>
    </div>
  );
};

export default Message;