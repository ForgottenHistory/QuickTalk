import React from 'react';

interface ContainerProps {
  children: React.ReactNode;
  variant?: 'fullscreen' | 'centered' | 'chat';
  className?: string;
}

export const Container: React.FC<ContainerProps> = ({ 
  children, 
  variant = 'fullscreen', 
  className = '' 
}) => {
  return (
    <div className={`container container-${variant} ${className}`}>
      {children}
    </div>
  );
};