'use client';

import React from 'react';
import type { GamePhase } from '~/types/game-state';
import type { PhaseContentAreaProps } from '~/types/game-layout';
import { useGameLayout } from '~/context/GameLayoutContext';
import { getContentAreaClasses } from '~/lib/game-layout-utils';

/**
 * Phase Content Area
 * 
 * Main content area that adapts to different game phases and layout modes.
 */

export function PhaseContentArea({
  children,
  currentPhase,
  layoutMode,
  isMobile,
  className = ''
}: PhaseContentAreaProps) {
  const { layout } = useGameLayout();
  
  // Use layout state if not provided via props
  const phase = currentPhase || layout.currentPhase;
  const mode = layoutMode || layout.layoutMode;
  const mobile = isMobile ?? layout.isMobile;
  
  const contentClasses = getContentAreaClasses({
    ...layout,
    currentPhase: phase,
    layoutMode: mode,
    isMobile: mobile
  });

  // Get phase-specific styling
  const getPhaseClasses = (phase: GamePhase): string => {
    switch (phase) {
      case 'roleReveal':
        return 'bg-gradient-to-br from-[#1a1a2e] to-[#16213e] text-center';
      case 'missionSelect':
        return 'bg-[#0a0a0f]';
      case 'voting':
        return 'bg-[#0a0a0f]';
      case 'missionVote':
        return 'bg-gradient-to-br from-[#1a1a2e] to-[#16213e]';
      case 'missionResult':
        return 'bg-[#0a0a0f]';
      case 'assassinAttempt':
        return 'bg-gradient-to-br from-[#2d1b2e] to-[#1a1a2e] text-center';
      case 'gameOver':
        return 'bg-gradient-to-br from-[#1a1a2e] to-[#16213e] text-center';
      default:
        return 'bg-[#0a0a0f]';
    }
  };

  const phaseClasses = getPhaseClasses(phase);

  return (
    <div className={`${contentClasses} ${phaseClasses} ${className}`}>
      {/* Phase indicator for development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-4 right-4 bg-[#f39c12] text-[#0a0a0f] px-3 py-1 rounded-full text-sm font-medium z-10">
          {phase}
        </div>
      )}
      
      {/* Content wrapper */}
      <div className="w-full h-full">
        {children}
      </div>
    </div>
  );
}

// Export default for easier importing
export default PhaseContentArea;
