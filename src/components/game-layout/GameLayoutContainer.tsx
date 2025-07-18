'use client';

import React, { useEffect } from 'react';
import type { GamePhase } from '~/types/game-state';
import type { GameLayoutContainerProps } from '~/types/game-layout';
import { useGameLayout } from '~/context/GameLayoutContext';
import { getLayoutContainerClasses } from '~/lib/game-layout-utils';
import { GameNavigationBar } from './GameNavigationBar';
import { GameSidebar } from './GameSidebar';
import { PhaseContentArea } from './PhaseContentArea';
import { GameFooter } from './GameFooter';

/**
 * Game Layout Container
 * 
 * Main layout container that orchestrates the game interface layout,
 * providing navigation, sidebar, content area, and footer.
 */

export function GameLayoutContainer({
  children,
  roomCode,
  gamePhase,
  isMobile,
  sidebarOpen = false,
  onLayoutChange,
  className = ''
}: GameLayoutContainerProps) {
  const { layout, updateLayout } = useGameLayout();

  // Update layout when props change
  useEffect(() => {
    updateLayout({
      currentPhase: gamePhase,
      isMobile,
      sidebarOpen: sidebarOpen ?? layout.sidebarOpen
    });
  }, [gamePhase, isMobile, sidebarOpen, updateLayout, layout.sidebarOpen]);

  // Notify parent of layout changes
  useEffect(() => {
    if (onLayoutChange) {
      onLayoutChange(layout);
    }
  }, [layout, onLayoutChange]);

  const containerClasses = getLayoutContainerClasses(layout);

  return (
    <div className={`${containerClasses} ${className}`}>
      <GameNavigationBar 
        currentPhase={gamePhase}
        roomCode={roomCode}
        playerCount={5}
        onSidebarToggle={() => {
          // Toggle sidebar handler
        }}
        onSettingsOpen={() => {
          // Open settings handler
        }}
      />
      
      <div className="flex flex-1 overflow-hidden">
        <GameSidebar />
        
        <main className="flex-1 flex flex-col overflow-hidden">
          <PhaseContentArea>
            {children}
          </PhaseContentArea>
          
          <GameFooter />
        </main>
      </div>
    </div>
  );
}

// Export default for easier importing
export default GameLayoutContainer;
