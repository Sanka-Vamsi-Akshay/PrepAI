import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface InterviewTimerProps {
  isActive: boolean;
  onDurationChange?: (seconds: number) => void;
}

export const InterviewTimer: React.FC<InterviewTimerProps> = ({
  isActive,
  onDurationChange,
}) => {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    let interval: any = null;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds((prev) => {
          const nextVal = prev + 1;
          if (onDurationChange) onDurationChange(nextVal);
          return nextVal;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, onDurationChange]);

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    
    return [
      hours > 0 ? hours.toString().padStart(2, '0') : null,
      mins.toString().padStart(2, '0'),
      secs.toString().padStart(2, '0'),
    ]
      .filter(Boolean)
      .join(':');
  };

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 text-red-650 dark:text-red-400 border border-red-500/20 rounded-lg font-mono font-bold text-xs">
      <Clock className="w-3.5 h-3.5 animate-pulse" />
      <span>{formatTime(seconds)}</span>
    </div>
  );
};
export default InterviewTimer;
