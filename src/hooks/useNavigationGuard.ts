/**
 * Use Navigation Guard Hook
 * 
 * Custom hook for managing navigation protection during active gameplay
 * with state backup and recovery capabilities.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import type { UseNavigationGuardReturn } from '~/types/dynamic-phase-router';
import type { GameState } from '~/types/game-state';

/**
 * Custom hook for managing navigation guard state
 * 
 * Provides centralized navigation protection with automatic state backup
 * and recovery mechanisms for active game sessions.
 */
export function useNavigationGuard(
  isGameActive: boolean = false,
  autoBackup: boolean = true,
  backupInterval: number = 30000
): UseNavigationGuardReturn {
  const [isNavigationBlocked, setIsNavigationBlocked] = useState(false);
  const backupTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastBackupTime = useRef<number>(0);
  const backupDataRef = useRef<GameState | null>(null);

  /**
   * Block navigation
   */
  const blockNavigation = useCallback(() => {
    setIsNavigationBlocked(true);
  }, []);

  /**
   * Unblock navigation
   */
  const unblockNavigation = useCallback(() => {
    setIsNavigationBlocked(false);
  }, []);

  /**
   * Backup game state
   */
  const backupState = useCallback((gameState: GameState) => {
    const now = Date.now();
    
    // Throttle backups to prevent excessive calls
    if (now - lastBackupTime.current < 5000) {
      return;
    }

    try {
      const backupData = {
        gameState,
        timestamp: now,
        version: '1.0.0',
        sessionId: crypto.randomUUID?.() || `session-${now}`,
      };

      // Store in localStorage
      localStorage.setItem('avalon-navigation-backup', JSON.stringify(backupData));
      
      // Keep reference
      backupDataRef.current = gameState;
      lastBackupTime.current = now;
    } catch (error) {
      console.error('Failed to backup game state:', error);
    }
  }, []);

  /**
   * Restore game state from backup
   */
  const restoreState = useCallback((): GameState | null => {
    try {
      const backupData = localStorage.getItem('avalon-navigation-backup');
      if (!backupData) {
        return backupDataRef.current;
      }

      const parsed = JSON.parse(backupData);
      
      // Validate backup data structure
      if (!parsed.gameState || !parsed.timestamp) {
        return null;
      }

      // Check if backup is not too old (max 1 hour)
      const now = Date.now();
      const maxAge = 60 * 60 * 1000; // 1 hour
      
      if (now - parsed.timestamp > maxAge) {
        // Remove old backup
        localStorage.removeItem('avalon-navigation-backup');
        return null;
      }

      return parsed.gameState;
    } catch (error) {
      console.error('Failed to restore game state from backup:', error);
      return backupDataRef.current;
    }
  }, []);

  /**
   * Clear backup data
   */
  const clearBackup = useCallback(() => {
    try {
      localStorage.removeItem('avalon-navigation-backup');
      backupDataRef.current = null;
      lastBackupTime.current = 0;
    } catch (error) {
      console.error('Failed to clear backup data:', error);
    }
  }, []);

  /**
   * Check if backup exists
   */
  const hasBackup = useCallback((): boolean => {
    try {
      const backupData = localStorage.getItem('avalon-navigation-backup');
      return backupData !== null || backupDataRef.current !== null;
    } catch (error) {
      console.error('Failed to check for backup:', error);
      return false;
    }
  }, []);

  /**
   * Start automatic backup
   */
  const startAutoBackup = useCallback(() => {
    if (backupTimeoutRef.current) {
      clearTimeout(backupTimeoutRef.current);
    }

    if (autoBackup && isGameActive) {
      const scheduleBackup = () => {
        backupTimeoutRef.current = setTimeout(() => {
          // Backup current state if available
          if (backupDataRef.current) {
            backupState(backupDataRef.current);
          }
          
          // Schedule next backup
          scheduleBackup();
        }, backupInterval);
      };

      scheduleBackup();
    }
  }, [autoBackup, isGameActive, backupInterval, backupState]);

  /**
   * Stop automatic backup
   */
  const stopAutoBackup = useCallback(() => {
    if (backupTimeoutRef.current) {
      clearTimeout(backupTimeoutRef.current);
      backupTimeoutRef.current = null;
    }
  }, []);

  /**
   * Handle beforeunload event
   */
  const handleBeforeUnload = useCallback((event: BeforeUnloadEvent) => {
    if (isNavigationBlocked && isGameActive) {
      // Backup current state
      if (backupDataRef.current) {
        backupState(backupDataRef.current);
      }

      // Show warning
      const message = 'You are about to leave an active game. Your progress may be lost.';
      event.preventDefault();
      event.returnValue = message;
      return message;
    }
  }, [isNavigationBlocked, isGameActive, backupState]);

  /**
   * Handle page visibility change
   */
  const handleVisibilityChange = useCallback(() => {
    if (document.hidden && isGameActive && backupDataRef.current) {
      // User switched away from tab, backup state
      backupState(backupDataRef.current);
    }
  }, [isGameActive, backupState]);

  /**
   * Effect to manage navigation guard based on game state
   */
  useEffect(() => {
    if (isGameActive) {
      setIsNavigationBlocked(true);
      startAutoBackup();
    } else {
      setIsNavigationBlocked(false);
      stopAutoBackup();
    }
  }, [isGameActive, startAutoBackup, stopAutoBackup]);

  /**
   * Effect to setup event listeners
   */
  useEffect(() => {
    if (isGameActive) {
      window.addEventListener('beforeunload', handleBeforeUnload);
      document.addEventListener('visibilitychange', handleVisibilityChange);

      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }
  }, [isGameActive, handleBeforeUnload, handleVisibilityChange]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      stopAutoBackup();
    };
  }, [stopAutoBackup]);

  return {
    isNavigationBlocked,
    blockNavigation,
    unblockNavigation,
    backupState,
    restoreState,
    clearBackup,
    hasBackup,
  };
}

/**
 * Utility function to get navigation guard state from localStorage
 */
export function getNavigationGuardState(): {
  gameState: GameState;
  timestamp: number;
  version: string;
  sessionId: string;
} | null {
  try {
    const backupData = localStorage.getItem('avalon-navigation-backup');
    if (!backupData) return null;

    const parsed = JSON.parse(backupData);
    
    // Validate backup data structure
    if (!parsed.gameState || !parsed.timestamp) {
      return null;
    }

    // Check if backup is not too old (max 1 hour)
    const now = Date.now();
    const maxAge = 60 * 60 * 1000; // 1 hour
    
    if (now - parsed.timestamp > maxAge) {
      // Remove old backup
      localStorage.removeItem('avalon-navigation-backup');
      return null;
    }

    return parsed;
  } catch (error) {
    console.error('Failed to get navigation guard state:', error);
    return null;
  }
}

/**
 * Utility function to clear navigation guard state
 */
export function clearNavigationGuardState(): void {
  try {
    localStorage.removeItem('avalon-navigation-backup');
  } catch (error) {
    console.error('Failed to clear navigation guard state:', error);
  }
}

export default useNavigationGuard;
