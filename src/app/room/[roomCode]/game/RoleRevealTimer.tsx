"use client";

import { useState, useEffect } from "react";

interface RoleRevealTimerProps {
  timeRemaining: number;
  onTimeUp: () => void;
  className?: string;
}

export default function RoleRevealTimer({
  timeRemaining,
  onTimeUp,
  className = "",
}: RoleRevealTimerProps) {
  const [seconds, setSeconds] = useState(timeRemaining);

  useEffect(() => {
    setSeconds(timeRemaining);
  }, [timeRemaining]);

  useEffect(() => {
    if (seconds <= 0) {
      onTimeUp();
      return;
    }

    const timer = setTimeout(() => {
      setSeconds(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [seconds, onTimeUp]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const remainingSeconds = time % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    if (seconds <= 10) return 'text-red-500';
    if (seconds <= 30) return 'text-amber-500';
    return 'text-blue-500';
  };

  const getGlowColor = () => {
    if (seconds <= 10) return 'shadow-red-500/50';
    if (seconds <= 30) return 'shadow-amber-500/50';
    return 'shadow-blue-500/50';
  };

  return (
    <div 
      className={`flex items-center justify-center ${className}`}
      data-testid="role-reveal-timer"
    >
      <div className={`relative bg-[#252547]/90 backdrop-blur-xl rounded-xl p-6 border border-[#2d2d5f]/30 shadow-2xl ${getGlowColor()}`}>
        {/* Particle effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-2 right-2 w-1 h-1 bg-purple-400 rounded-full animate-pulse"></div>
          <div className="absolute bottom-2 left-2 w-1 h-1 bg-pink-400 rounded-full animate-bounce"></div>
        </div>

        {/* Timer display */}
        <div className="text-center">
          <div className="text-sm text-slate-300 uppercase tracking-widest mb-2">
            Time Remaining
          </div>
          <div className={`text-4xl font-mono font-bold tabular-nums ${getTimerColor()} ${seconds <= 10 ? 'animate-pulse' : ''}`}>
            {formatTime(seconds)}
          </div>
        </div>

        {/* Progress ring */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <svg className="w-full h-full transform -rotate-90 opacity-30" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              className="text-[#2d2d5f]"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              className={`transition-all duration-1000 ease-out ${getTimerColor()}`}
              style={{
                strokeDasharray: `${2 * Math.PI * 45}`,
                strokeDashoffset: `${2 * Math.PI * 45 * (1 - seconds / timeRemaining)}`,
              }}
            />
          </svg>
        </div>

        {/* Warning indicator */}
        {seconds <= 10 && (
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full animate-pulse">
            <div className="absolute inset-0 bg-red-500 rounded-full animate-ping"></div>
          </div>
        )}
      </div>
    </div>
  );
}
