'use client';

import { useState } from 'react';
import { validateRoomCode } from '~/lib/room-code-generator';

interface PlayerNameInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export function PlayerNameInput({ 
  value, 
  onChange, 
  error, 
  disabled = false, 
  className = '' 
}: PlayerNameInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    // Limit to 50 characters
    if (newValue.length <= 50) {
      onChange(newValue);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <label 
        htmlFor="playerName" 
        className="block text-sm font-medium text-slate-200 opacity-75 uppercase tracking-wide"
      >
        Your Name
      </label>
      <div className="relative">
        <input
          id="playerName"
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Enter your name"
          className={`w-full px-4 py-3 bg-[#1a1a2e] border-2 rounded-xl text-white placeholder-slate-400 transition-all duration-300 ${
            error 
              ? 'border-red-500 ring-4 ring-red-500/30' 
              : isFocused 
                ? 'border-blue-500 ring-4 ring-blue-500/30 transform scale-102' 
                : 'border-slate-600/30 hover:border-slate-500/50'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={disabled}
          maxLength={50}
          required
          data-testid="player-name-input"
        />
        <div className="absolute right-3 top-3 text-xs text-slate-400">
          {value.length}/50
        </div>
      </div>
      {error && (
        <div className="text-red-500 text-sm font-medium bg-red-500/10 border border-red-500/30 rounded-lg p-2 animate-shake">
          {error}
        </div>
      )}
    </div>
  );
}
