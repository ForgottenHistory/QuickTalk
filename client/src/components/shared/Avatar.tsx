import React from 'react';

interface AvatarProps {
  emoji: string;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ 
  emoji, 
  size = 'medium', 
  className = '' 
}) => {
  return (
    <div className={`avatar avatar-${size} ${className}`}>
      {emoji}
    </div>
  );
};
