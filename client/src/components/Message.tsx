import React from 'react';
import { Message as MessageType } from '../types';

interface MessageProps {
  message: MessageType;
}

const Message: React.FC<MessageProps> = ({ message }) => {
  const isUser = message.sender === 'user';
  
  // Handle both Date objects and string timestamps
  const getFormattedTime = (timestamp: Date | string): string => {
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };
  
  return (
    <div style={{
      display: 'flex',
      justifyContent: isUser ? 'flex-end' : 'flex-start',
      marginBottom: '16px',
      padding: '0 20px'
    }}>
      <div style={{
        maxWidth: '70%',
        padding: '12px 16px',
        borderRadius: '18px',
        backgroundColor: isUser ? '#ffd900' : '#212121',
        color: isUser ? '#000000' : '#ffffff',
        wordWrap: 'break-word',
        lineHeight: '1.4'
      }}>
        <div style={{ fontSize: '14px' }}>
          {typeof message.text === 'string' ? message.text : 'Message could not be displayed'}
        </div>
        <div style={{
          fontSize: '11px',
          opacity: 0.7,
          marginTop: '4px',
          textAlign: 'right'
        }}>
          {getFormattedTime(message.timestamp)}
        </div>
      </div>
    </div>
  );
};

export default Message;