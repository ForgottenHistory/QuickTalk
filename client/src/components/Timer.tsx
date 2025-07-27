import React from 'react';
import { Timer as TimerType } from '../types';

interface TimerProps {
  timer: TimerType;
}

const Timer: React.FC<TimerProps> = ({ timer }) => {
  const formatTime = (minutes: number, seconds: number): string => {
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const isLowTime = timer.minutes < 3;

  return (
    <div style={{
      backgroundColor: isLowTime ? '#ffd900' : '#212121',
      color: isLowTime ? '#000000' : '#ffffff',
      padding: '8px 16px',
      borderRadius: '20px',
      fontWeight: 'bold',
      fontSize: '18px',
      minWidth: '70px',
      textAlign: 'center',
      transition: 'all 0.3s ease',
      animation: isLowTime ? 'pulse 1s infinite' : 'none'
    }}>
      {formatTime(timer.minutes, timer.seconds)}
      <style>
        {`
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
          }
        `}
      </style>
    </div>
  );
};

export default Timer;