/**
 * Game Rules Reference Floating Button
 * 
 * Floating action button that provides quick access to game rules
 * from any screen in the application.
 */

'use client';

import { useState } from 'react';
import { BookOpen, HelpCircle } from 'lucide-react';
import type { RulesFloatingButton, HelpContextType } from '~/types/game-rules';

interface GameRulesFloatingButtonProps {
  position?: RulesFloatingButton['position'];
  size?: RulesFloatingButton['size'];
  hasNotification?: boolean;
  notificationCount?: number;
  contextBadge?: HelpContextType;
  onOpen: () => void;
}

export default function GameRulesFloatingButton({
  position = 'bottom-right',
  size = 'medium',
  hasNotification = false,
  notificationCount = 0,
  contextBadge,
  onOpen
}: GameRulesFloatingButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6'
  };

  const sizeClasses = {
    small: 'w-12 h-12',
    medium: 'w-16 h-16',
    large: 'w-20 h-20'
  };

  const iconSizeClasses = {
    small: 'w-6 h-6',
    medium: 'w-8 h-8',
    large: 'w-10 h-10'
  };

  const contextBadgeColors = {
    lobby: 'bg-blue-500',
    'role-reveal': 'bg-purple-500',
    'mission-proposal': 'bg-yellow-500',
    voting: 'bg-green-500',
    'mission-execution': 'bg-red-500',
    'assassin-attempt': 'bg-red-600',
    'game-results': 'bg-gray-500'
  };

  return (
    <div className={`fixed ${positionClasses[position]} z-50`}>
      <div className="relative">
        {/* Main Button */}
        <button
          onClick={onOpen}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={`
            ${sizeClasses[size]}
            bg-gradient-to-r from-blue-600 to-purple-600
            hover:from-blue-700 hover:to-purple-700
            text-white rounded-full shadow-lg
            transition-all duration-300 ease-in-out
            transform hover:scale-110 active:scale-95
            flex items-center justify-center
            border-2 border-white/20
            ${isHovered ? 'shadow-2xl shadow-blue-500/50' : ''}
          `}
          aria-label="Open game rules"
        >
          <BookOpen className={`${iconSizeClasses[size]} transition-transform duration-300`} />
        </button>

        {/* Notification Badge */}
        {hasNotification && (
          <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold border-2 border-white animate-pulse">
            {notificationCount > 0 ? (notificationCount > 9 ? '9+' : notificationCount) : '!'}
          </div>
        )}

        {/* Context Badge */}
        {contextBadge && (
          <div className={`
            absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white
            ${contextBadgeColors[contextBadge]}
          `}>
            <HelpCircle className="w-full h-full text-white" />
          </div>
        )}

        {/* Pulse Animation */}
        <div className={`
          absolute inset-0 rounded-full
          bg-gradient-to-r from-blue-400 to-purple-400
          animate-ping opacity-20
          ${sizeClasses[size]}
        `} />

        {/* Tooltip */}
        {isHovered && (
          <div className={`
            absolute ${position.includes('right') ? 'right-full mr-4' : 'left-full ml-4'}
            ${position.includes('top') ? 'top-0' : 'bottom-0'}
            bg-gray-900 text-white px-3 py-2 rounded-lg text-sm
            whitespace-nowrap shadow-lg border border-gray-700
            opacity-0 animate-fade-in
            before:content-[''] before:absolute
            ${position.includes('right') 
              ? 'before:left-full before:border-l-gray-900 before:border-l-4 before:border-y-transparent before:border-y-4 before:border-r-0' 
              : 'before:right-full before:border-r-gray-900 before:border-r-4 before:border-y-transparent before:border-y-4 before:border-l-0'
            }
            ${position.includes('top') ? 'before:top-3' : 'before:bottom-3'}
          `}>
            Game Rules & Help
            {contextBadge && (
              <div className="text-xs text-gray-300 mt-1">
                {contextBadge.replace('-', ' ')} help available
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// CSS for fade-in animation
const fadeInKeyframes = `
  @keyframes fade-in {
    0% { opacity: 0; transform: translateY(10px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  
  .animate-fade-in {
    animation: fade-in 0.3s ease-out forwards;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = fadeInKeyframes;
  document.head.appendChild(styleElement);
}
