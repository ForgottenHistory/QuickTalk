import React, { useState, KeyboardEvent, ChangeEvent } from 'react';
import { useTypingManagement } from '../hooks/useTypingManagement';
import { Button } from './shared';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onInputChange?: (message: string) => void;
  disabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ 
  onSendMessage, 
  onInputChange,
  disabled = false 
}) => {
  const [message, setMessage] = useState('');
  const { handleUserTyping, stopUserTyping } = useTypingManagement();

  const handleSend = () => {
    if (message.trim() && !disabled) {
      stopUserTyping();
      onSendMessage(message.trim());
      setMessage('');
      onInputChange?.(''); // Clear the parent's tracking too
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setMessage(newValue);
    onInputChange?.(newValue); // Notify parent of input changes
    
    if (!disabled && newValue.length > 0) {
      handleUserTyping();
    }
  };

  return (
    <div className="input-container">
      <div className="input-row">
        <input
          type="text"
          value={message}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          onBlur={stopUserTyping}
          placeholder={disabled ? "Session ended" : "Type your message..."}
          disabled={disabled}
          className="text-input"
        />
        <Button
          onClick={handleSend}
          disabled={!message.trim() || disabled}
          variant="primary"
        >
          Send
        </Button>
      </div>
    </div>
  );
};

export default ChatInput;