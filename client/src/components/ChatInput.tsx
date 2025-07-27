import React, { useState, KeyboardEvent } from 'react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, disabled = false }) => {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    console.log('ChatInput handleSend:', message, typeof message, message.trim());
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={{
      padding: '20px',
      backgroundColor: '#212121',
      borderTop: '2px solid #ffd900'
    }}>
      <div style={{
        display: 'flex',
        gap: '12px',
        alignItems: 'center'
      }}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={disabled ? "Session ended" : "Type your message..."}
          disabled={disabled}
          style={{
            flex: 1,
            padding: '12px 16px',
            borderRadius: '25px',
            border: 'none',
            backgroundColor: '#000000',
            color: '#ffffff',
            fontSize: '14px',
            outline: 'none'
          }}
        />
        <button
          onClick={handleSend}
          disabled={!message.trim() || disabled}
          style={{
            padding: '12px 20px',
            borderRadius: '25px',
            border: 'none',
            backgroundColor: (!message.trim() || disabled) ? '#212121' : '#ffd900',
            color: (!message.trim() || disabled) ? '#ffffff' : '#000000',
            cursor: (!message.trim() || disabled) ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            fontSize: '14px',
            transition: 'all 0.2s ease'
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatInput;