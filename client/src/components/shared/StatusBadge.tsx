import React from 'react';

interface StatusBadgeProps {
  text: string;
  variant?: 'warning' | 'success' | 'error' | 'info';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  text, 
  variant = 'info', 
  className = '' 
}) => {
  return (
    <span className={`status-badge status-${variant} ${className}`}>
      {text}
    </span>
  );
};
