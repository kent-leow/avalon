'use client';

import { useEffect, useState, useCallback } from 'react';
import { type HapticFeedbackType } from '~/types/mobile-experience';
import { triggerHapticFeedback, isHapticFeedbackSupported } from '~/lib/mobile-experience-utils';

interface HapticFeedbackSystemProps {
  enabled: boolean;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  className?: string;
}

interface HapticState {
  isSupported: boolean;
  lastFeedback: {
    type: HapticFeedbackType;
    timestamp: number;
  } | null;
  feedbackHistory: Array<{
    type: HapticFeedbackType;
    timestamp: number;
    context?: string;
  }>;
}

export function HapticFeedbackSystem({
  enabled,
  deviceType,
  className,
}: HapticFeedbackSystemProps) {
  const [hapticState, setHapticState] = useState<HapticState>({
    isSupported: false,
    lastFeedback: null,
    feedbackHistory: [],
  });

  // Check haptic support on mount
  useEffect(() => {
    setHapticState(prev => ({
      ...prev,
      isSupported: isHapticFeedbackSupported(),
    }));
  }, []);

  // Trigger haptic feedback with context
  const triggerFeedback = useCallback((type: HapticFeedbackType, context?: string) => {
    if (!enabled || !hapticState.isSupported) return;

    const now = Date.now();
    const lastFeedback = hapticState.lastFeedback;
    
    // Throttle feedback to prevent overwhelming the user
    if (lastFeedback && now - lastFeedback.timestamp < 50) {
      return;
    }

    // Trigger the actual haptic feedback
    triggerHapticFeedback(type);

    // Update state
    setHapticState(prev => ({
      ...prev,
      lastFeedback: { type, timestamp: now },
      feedbackHistory: [
        ...prev.feedbackHistory.slice(-10), // Keep last 10 entries
        { type, timestamp: now, context }
      ],
    }));
  }, [enabled, hapticState.isSupported, hapticState.lastFeedback]);

  // Game-specific haptic feedback functions
  const gameHaptics = {
    // Voting actions
    voteSubmitted: () => triggerFeedback('light', 'vote_submitted'),
    voteChanged: () => triggerFeedback('selection', 'vote_changed'),
    votingComplete: () => triggerFeedback('heavy', 'voting_complete'),
    
    // Mission actions
    missionStart: () => triggerFeedback('medium', 'mission_start'),
    missionSuccess: () => triggerFeedback('notification', 'mission_success'),
    missionFailure: () => triggerFeedback('impact', 'mission_failure'),
    
    // Game state changes
    gameStart: () => triggerFeedback('heavy', 'game_start'),
    gameEnd: () => triggerFeedback('notification', 'game_end'),
    phaseChange: () => triggerFeedback('selection', 'phase_change'),
    
    // Player actions
    playerJoin: () => triggerFeedback('light', 'player_join'),
    playerLeave: () => triggerFeedback('selection', 'player_leave'),
    roleRevealed: () => triggerFeedback('medium', 'role_revealed'),
    
    // UI interactions
    buttonPress: () => triggerFeedback('light', 'button_press'),
    cardFlip: () => triggerFeedback('selection', 'card_flip'),
    menuOpen: () => triggerFeedback('light', 'menu_open'),
    
    // Error states
    error: () => triggerFeedback('impact', 'error'),
    warning: () => triggerFeedback('medium', 'warning'),
    
    // Success states
    success: () => triggerFeedback('notification', 'success'),
    confirmation: () => triggerFeedback('medium', 'confirmation'),
  };

  // Auto-wire haptic feedback to common UI elements
  useEffect(() => {
    if (!enabled || !hapticState.isSupported || deviceType === 'desktop') return;

    const handleClick = (event: Event) => {
      const target = event.target as HTMLElement;
      
      // Determine appropriate haptic feedback based on element
      if (target.matches('button')) {
        const button = target as HTMLButtonElement;
        
        // Different feedback based on button type/class
        if (button.classList.contains('btn-primary') || button.classList.contains('vote-button')) {
          gameHaptics.buttonPress();
        } else if (button.classList.contains('btn-danger') || button.classList.contains('fail-button')) {
          gameHaptics.error();
        } else if (button.classList.contains('btn-success') || button.classList.contains('success-button')) {
          gameHaptics.success();
        } else {
          gameHaptics.buttonPress();
        }
      } else if (target.matches('a')) {
        gameHaptics.buttonPress();
      } else if (target.matches('input, select, textarea')) {
        triggerFeedback('selection', 'input_interaction');
      } else if (target.matches('.card, .player-card, .mission-card')) {
        gameHaptics.cardFlip();
      }
    };

    // Add event listeners
    document.addEventListener('click', handleClick, { passive: true });
    document.addEventListener('touchstart', handleClick, { passive: true });

    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('touchstart', handleClick);
    };
  }, [enabled, hapticState.isSupported, deviceType, gameHaptics]);

  // Expose haptic functions to global scope for use by other components
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).haptics = gameHaptics;
    }
  }, [gameHaptics]);

  // Don't render anything if haptic feedback is not supported
  if (!hapticState.isSupported) {
    return null;
  }

  return (
    <div 
      className={`haptic-feedback-system ${className || ''}`}
      data-enabled={enabled}
      data-device-type={deviceType}
      data-supported={hapticState.isSupported}
    >
      {/* Haptic Feedback Styles */}
      <style jsx global>{`
        /* Haptic feedback visual indicators */
        .haptic-feedback-enabled {
          transition: transform 0.1s ease-out;
        }
        
        .haptic-feedback-enabled:active {
          transform: scale(0.98);
        }
        
        .haptic-button {
          position: relative;
          overflow: hidden;
        }
        
        .haptic-button::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          transform: translate(-50%, -50%);
          transition: width 0.6s, height 0.6s;
        }
        
        .haptic-button:active::after {
          width: 300px;
          height: 300px;
        }
        
        /* Haptic feedback disabled state */
        .haptic-feedback-disabled {
          opacity: 0.8;
        }
        
        .haptic-feedback-disabled::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: repeating-linear-gradient(
            45deg,
            transparent,
            transparent 10px,
            rgba(255, 255, 255, 0.1) 10px,
            rgba(255, 255, 255, 0.1) 20px
          );
          pointer-events: none;
        }
      `}</style>
      
      {/* Development Mode Haptic Info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="haptic-feedback-info fixed bottom-100 left-4 z-50 rounded-lg bg-black/80 p-2 text-xs text-white">
          <div>Haptic: {enabled ? 'Enabled' : 'Disabled'}</div>
          <div>Supported: {hapticState.isSupported ? 'Yes' : 'No'}</div>
          <div>Device: {deviceType}</div>
          {hapticState.lastFeedback && (
            <div>Last: {hapticState.lastFeedback.type}</div>
          )}
          <div>Count: {hapticState.feedbackHistory.length}</div>
          
          {/* Haptic Test Buttons */}
          <div className="mt-2 space-x-1">
            <button 
              onClick={() => triggerFeedback('light', 'test')}
              className="rounded bg-blue-600 px-1 py-0.5 text-xs hover:bg-blue-700"
            >
              Light
            </button>
            <button 
              onClick={() => triggerFeedback('medium', 'test')}
              className="rounded bg-green-600 px-1 py-0.5 text-xs hover:bg-green-700"
            >
              Medium
            </button>
            <button 
              onClick={() => triggerFeedback('heavy', 'test')}
              className="rounded bg-red-600 px-1 py-0.5 text-xs hover:bg-red-700"
            >
              Heavy
            </button>
          </div>
        </div>
      )}
      
      {/* Haptic Feedback History (Development Mode) */}
      {process.env.NODE_ENV === 'development' && hapticState.feedbackHistory.length > 0 && (
        <div className="haptic-feedback-history fixed bottom-116 left-4 z-50 max-h-32 w-48 overflow-y-auto rounded-lg bg-black/80 p-2 text-xs text-white">
          <div className="mb-1 font-semibold">Haptic History:</div>
          {hapticState.feedbackHistory.slice(-5).map((feedback, index) => (
            <div key={index} className="mb-1 border-b border-gray-600 pb-1">
              <div className="flex justify-between">
                <span>{feedback.type}</span>
                <span>{new Date(feedback.timestamp).toLocaleTimeString()}</span>
              </div>
              {feedback.context && (
                <div className="text-gray-400">{feedback.context}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
