/**
 * Navigation Guard Component
 * 
 * Protects against accidental navigation during active game sessions
 * with state backup and recovery capabilities.
 */

'use client';

import { useEffect, useRef, useCallback } from 'react';
import type { NavigationGuardProps } from '~/types/dynamic-phase-router';
import type { GameState } from '~/types/game-state';

/**
 * Navigation Guard Component
 * 
 * Provides protection against accidental navigation during active gameplay
 * with automatic state backup and recovery mechanisms.
 */
export function NavigationGuard({
  isGameActive,
  currentPhase,
  gameState,
  allowNavigation = false,
  warningMessage = 'You are about to leave an active game. Your progress may be lost. Are you sure you want to continue?',
  onNavigationAttempt,
  onStateBackup,
}: NavigationGuardProps) {
  const hasSetupGuard = useRef(false);
  const lastBackupTime = useRef(0);
  const backupInterval = useRef<NodeJS.Timeout | null>(null);

  /**
   * Backup game state
   */
  const backupGameState = useCallback(() => {
    if (!gameState || !isGameActive) return;

    const now = Date.now();
    
    // Only backup if enough time has passed since last backup
    if (now - lastBackupTime.current < 5000) return;

    try {
      const backupData = {
        gameState,
        currentPhase,
        timestamp: now,
        version: '1.0.0',
      };

      // Store in localStorage
      localStorage.setItem('avalon-game-backup', JSON.stringify(backupData));
      
      // Call external backup handler
      onStateBackup?.(gameState);
      
      lastBackupTime.current = now;
    } catch (error) {
      console.error('Failed to backup game state:', error);
    }
  }, [gameState, currentPhase, isGameActive, onStateBackup]);

  /**
   * Handle beforeunload event
   */
  const handleBeforeUnload = useCallback((event: BeforeUnloadEvent) => {
    // Skip if navigation is explicitly allowed
    if (allowNavigation || !isGameActive) {
      return;
    }

    // Backup state before potential navigation
    backupGameState();

    // Call external handler
    onNavigationAttempt?.(event);

    // Show browser warning
    const message = warningMessage;
    event.preventDefault();
    event.returnValue = message;
    return message;
  }, [isGameActive, allowNavigation, warningMessage, onNavigationAttempt, backupGameState]);

  /**
   * Handle visibility change (tab switching)
   */
  const handleVisibilityChange = useCallback(() => {
    if (document.hidden && isGameActive) {
      // User switched away from tab, backup state
      backupGameState();
    }
  }, [isGameActive, backupGameState]);

  /**
   * Handle page focus/blur
   */
  const handlePageBlur = useCallback(() => {
    if (isGameActive) {
      backupGameState();
    }
  }, [isGameActive, backupGameState]);

  /**
   * Start periodic backup
   */
  const startPeriodicBackup = useCallback(() => {
    if (backupInterval.current) {
      clearInterval(backupInterval.current);
    }

    if (isGameActive) {
      backupInterval.current = setInterval(() => {
        backupGameState();
      }, 30000); // Backup every 30 seconds
    }
  }, [isGameActive, backupGameState]);

  /**
   * Stop periodic backup
   */
  const stopPeriodicBackup = useCallback(() => {
    if (backupInterval.current) {
      clearInterval(backupInterval.current);
      backupInterval.current = null;
    }
  }, []);

  /**
   * Setup navigation guard
   */
  useEffect(() => {
    if (!isGameActive || hasSetupGuard.current) return;

    // Add event listeners
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handlePageBlur);

    // Start periodic backup
    startPeriodicBackup();

    hasSetupGuard.current = true;

    return () => {
      // Cleanup event listeners
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handlePageBlur);
      
      // Stop periodic backup
      stopPeriodicBackup();
      
      hasSetupGuard.current = false;
    };
  }, [isGameActive, handleBeforeUnload, handleVisibilityChange, handlePageBlur, startPeriodicBackup, stopPeriodicBackup]);

  /**
   * Update periodic backup when game state changes
   */
  useEffect(() => {
    if (isGameActive) {
      startPeriodicBackup();
    } else {
      stopPeriodicBackup();
    }
  }, [isGameActive, startPeriodicBackup, stopPeriodicBackup]);

  /**
   * Backup state when game state changes
   */
  useEffect(() => {
    if (isGameActive && gameState) {
      // Debounced backup on state change
      const timeoutId = setTimeout(() => {
        backupGameState();
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [gameState, isGameActive, backupGameState]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      stopPeriodicBackup();
    };
  }, [stopPeriodicBackup]);

  // This component doesn't render anything visible
  return null;
}

/**
 * Utility function to restore game state from backup
 */
export function restoreGameStateFromBackup(): {
  gameState: GameState;
  currentPhase: string;
  timestamp: number;
  version: string;
} | null {
  try {
    const backupData = localStorage.getItem('avalon-game-backup');
    if (!backupData) return null;

    const parsed = JSON.parse(backupData);
    
    // Validate backup data structure
    if (!parsed.gameState || !parsed.currentPhase || !parsed.timestamp) {
      return null;
    }

    // Check if backup is not too old (max 1 hour)
    const now = Date.now();
    const maxAge = 60 * 60 * 1000; // 1 hour
    
    if (now - parsed.timestamp > maxAge) {
      // Remove old backup
      localStorage.removeItem('avalon-game-backup');
      return null;
    }

    return parsed;
  } catch (error) {
    console.error('Failed to restore game state from backup:', error);
    return null;
  }
}

/**
 * Utility function to clear game state backup
 */
export function clearGameStateBackup(): void {
  try {
    localStorage.removeItem('avalon-game-backup');
  } catch (error) {
    console.error('Failed to clear game state backup:', error);
  }
}

/**
 * Utility function to check if backup exists
 */
export function hasGameStateBackup(): boolean {
  try {
    const backupData = localStorage.getItem('avalon-game-backup');
    return backupData !== null;
  } catch (error) {
    console.error('Failed to check for game state backup:', error);
    return false;
  }
}

export default NavigationGuard;
