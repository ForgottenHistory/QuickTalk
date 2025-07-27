import React, { useState, KeyboardEvent, ChangeEvent } from 'react';
import { useTypingManagement } from '../hooks/useTypingManagement';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, disabled = false }) => {
  const [message, setMessage] = useState('');
  const { handleUserTyping, stopUserTyping } = useTypingManagement();

  const handleSend = () => {
    console.log('ChatInput handleSend:', message, typeof message, message.trim());
    if (message.trim() && !disabled) {
      stopUserTyping(); // Stop typing indicator when sending
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

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    
    // Trigger typing indicator if not disabled and has content
    if (!disabled && e.target.value.length > 0) {
      handleUserTyping();
    }
  };

  const handleInputBlur = () => {
    // Stop typing when input loses focus
    stopUserTyping();
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
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          onBlur={handleInputBlur}
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