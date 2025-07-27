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
    <div className={`timer ${isLowTime ? 'timer-warning' : ''}`}>
      {formatTime(timer.minutes, timer.seconds)}
    </div>
  );
};

export default Timer;
