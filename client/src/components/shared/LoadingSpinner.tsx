import React from 'react';

interface LoadingSpinnerProps {
  text?: string;
  subtext?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  text = 'Loading...', 
  subtext 
}) => {
  return (
    <div className="loading-container">
      <div className="loading-content">
        {text && <div className="loading-text">{text}</div>}
        {subtext && <div className="loading-subtext">{subtext}</div>}
        <div className="loading-bar">
          <div className="loading-progress" />
        </div>
      </div>
    </div>
  );
};