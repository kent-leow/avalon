'use client';

import React, { useEffect } from 'react';
import type { LayoutControllerProps } from '~/types/game-layout';
import { GameLayoutProvider, useGameLayout } from '~/context/GameLayoutContext';

/**
 * Layout Controller
 * 
 * High-level controller that manages layout state and provides layout context.
 */

function LayoutControllerInternal({
  children,
  onLayoutChange,
  className = ''
}: Omit<LayoutControllerProps, 'initialLayout'>) {
  const { layout } = useGameLayout();

  // Notify parent of layout changes
  useEffect(() => {
    if (onLayoutChange) {
      onLayoutChange(layout);
    }
  }, [layout, onLayoutChange]);

  return (
    <div className={`game-layout-controller ${className}`}>
      {children}
    </div>
  );
}

export function LayoutController({
  children,
  onLayoutChange,
  initialLayout = {},
  className = ''
}: LayoutControllerProps) {
  return (
    <GameLayoutProvider initialLayout={initialLayout}>
      <LayoutControllerInternal
        onLayoutChange={onLayoutChange}
        className={className}
      >
        {children}
      </LayoutControllerInternal>
    </GameLayoutProvider>
  );
}

// Export default for easier importing
export default LayoutController;
