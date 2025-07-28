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
  const isImageFile = emoji && !emoji.startsWith('data:') && emoji.includes('.');
  const isEmoji = emoji && emoji.length <= 4 && !emoji.includes('.');
  
  if (isImageFile) {
    // It's a saved image file - construct URL
    const imageUrl = `http://localhost:5000/api/characters/images/${emoji}`;
    
    return (
      <div className={`avatar avatar-${size} ${className}`}>
        <img 
          src={imageUrl} 
          alt="Character Avatar"
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            objectFit: 'cover'
          }}
          onError={(e) => {
            // Fallback to default emoji if image fails to load
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            target.parentElement!.textContent = '🤖';
          }}
        />
      </div>
    );
  }
  
  if (isEmoji) {
    // It's an emoji
    return (
      <div className={`avatar avatar-${size} ${className}`}>
        {emoji}
      </div>
    );
  }
  
  // Fallback for any other case
  return (
    <div className={`avatar avatar-${size} ${className}`}>
      🤖
    </div>
  );
};