'use client';

import React from 'react';
import type { GamePhase } from '~/types/game-state';
import type { GameNavigationBarProps } from '~/types/game-layout';
import { useGameLayout } from '~/context/GameLayoutContext';
import { getNavigationBarClasses, createMockGameProgress, createMockNavigationItems } from '~/lib/game-layout-utils';

/**
 * Game Navigation Bar
 * 
 * Top navigation bar showing game progress, room info, and navigation controls.
 */

export function GameNavigationBar({
  currentPhase,
  gameProgress,
  roomCode,
  playerCount,
  onSidebarToggle,
  onSettingsOpen,
  navigationItems,
  className = ''
}: GameNavigationBarProps) {
  const { layout, toggleSidebar } = useGameLayout();
  
  // Use mock data if not provided
  const progress = gameProgress || createMockGameProgress(currentPhase);
  const navItems = navigationItems || createMockNavigationItems(currentPhase);
  
  const navClasses = getNavigationBarClasses(layout);

  const handleSidebarToggle = () => {
    if (onSidebarToggle) {
      onSidebarToggle();
    } else {
      toggleSidebar();
    }
  };

  const handleSettingsOpen = () => {
    if (onSettingsOpen) {
      onSettingsOpen();
    } else {
      console.log('Settings opened');
    }
  };

  return (
    <nav className={`${navClasses} ${className}`}>
      <div className="flex items-center justify-between w-full">
        {/* Left section - Menu and room info */}
        <div className="flex items-center space-x-4">
          <button
            onClick={handleSidebarToggle}
            className="p-2 hover:bg-[#3d3d7a] rounded-lg transition-colors"
            aria-label="Toggle sidebar"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="text-lg font-semibold text-[#f39c12]">
              Avalon
            </div>
            <div className="text-sm text-[#9ca3af]">
              Room: {roomCode}
            </div>
            {playerCount && (
              <div className="text-sm text-[#9ca3af]">
                Players: {playerCount}
              </div>
            )}
          </div>
        </div>

        {/* Center section - Game progress (desktop only) */}
        {!layout.isMobile && (
          <div className="flex items-center space-x-4">
            <div className="text-sm text-[#9ca3af]">
              Round {progress.currentRound} of {progress.totalRounds}
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-32 bg-[#3d3d7a] rounded-full h-2">
                <div 
                  className="bg-[#f39c12] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress.phaseProgress}%` }}
                />
              </div>
              <div className="text-sm text-[#9ca3af]">
                {progress.phaseProgress}%
              </div>
            </div>
          </div>
        )}

        {/* Right section - Settings and actions */}
        <div className="flex items-center space-x-2">
          {progress.timeRemaining && (
            <div className="text-sm text-[#f39c12] font-mono">
              {Math.floor(progress.timeRemaining / 60000)}:
              {String(Math.floor((progress.timeRemaining % 60000) / 1000)).padStart(2, '0')}
            </div>
          )}
          
          <button
            onClick={handleSettingsOpen}
            className="p-2 hover:bg-[#3d3d7a] rounded-lg transition-colors"
            aria-label="Open settings"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile progress bar */}
      {layout.isMobile && (
        <div className="mt-3 pt-3 border-t border-[#3d3d7a]">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-[#9ca3af]">
              Round {progress.currentRound} of {progress.totalRounds}
            </div>
            <div className="text-sm text-[#9ca3af]">
              {progress.phaseProgress}%
            </div>
          </div>
          <div className="w-full bg-[#3d3d7a] rounded-full h-2">
            <div 
              className="bg-[#f39c12] h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress.phaseProgress}%` }}
            />
          </div>
        </div>
      )}
    </nav>
  );
}

// Export default for easier importing
export default GameNavigationBar;
