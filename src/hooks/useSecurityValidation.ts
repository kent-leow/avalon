'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { 
  SecurityViolation, 
  CheatAttempt, 
  SecurityEvent, 
  GameAction,
  ValidationResult,
  SecurityMetrics,
  PlayerAction,
  SecurityConfig
} from '~/types/security-validation';
import { 
  createMockSecurityViolation, 
  createMockCheatAttempt, 
  createMockSecurityEvent,
  validateAction,
  analyzeCheatPattern,
  shouldBlockAction,
  createSecurityAction,
  calculateSecurityMetrics,
  sanitizeInput
} from '~/lib/security-validation-utils';
import { useSecurityValidationContext } from '~/context/SecurityValidationContext';

/**
 * Security Validation Hook
 * Provides comprehensive security validation operations and monitoring
 */

interface UseSecurityValidationOptions {
  roomCode?: string;
  playerId?: string;
  autoValidate?: boolean;
  strictMode?: boolean;
  onViolation?: (violation: SecurityViolation) => void;
  onCheatDetected?: (attempt: CheatAttempt) => void;
  onValidationPassed?: (result: ValidationResult) => void;
}

interface SecurityValidationState {
  isActive: boolean;
  isValidating: boolean;
  violations: SecurityViolation[];
  cheatAttempts: CheatAttempt[];
  events: SecurityEvent[];
  metrics: SecurityMetrics;
  lastValidation?: number;
  config: SecurityConfig;
}

export const useSecurityValidation = (options: UseSecurityValidationOptions = {}) => {
  const {
    roomCode,
    playerId,
    autoValidate = true,
    strictMode = false,
    onViolation,
    onCheatDetected,
    onValidationPassed
  } = options;

  const context = useSecurityValidationContext();
  const [localState, setLocalState] = useState<SecurityValidationState>({
    isActive: true,
    isValidating: false,
    violations: [],
    cheatAttempts: [],
    events: [],
    metrics: {
      totalValidations: 0,
      violationsDetected: 0,
      cheatsBlocked: 0,
      sanitizationsPerformed: 0,
      averageValidationTime: 0,
      securityScore: 100
    },
    config: context.state.config
  });

  const validationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync with context state
  useEffect(() => {
    setLocalState(prev => ({
      ...prev,
      violations: context.state.violations,
      cheatAttempts: context.state.cheatAttempts,
      events: context.state.events,
      metrics: context.state.metrics,
      config: context.state.config
    }));
  }, [context.state]);

  // Auto-retry mechanism for failed validations
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  // Validate action with comprehensive checks
  const validateGameAction = useCallback(async (action: GameAction): Promise<ValidationResult> => {
    if (!localState.isActive) {
      return {
        isValid: false,
        violations: [createMockSecurityViolation({
          type: 'invalid_action',
          details: 'Security validation is inactive',
          severity: 'medium',
          action
        })],
        sanitizedData: action,
        actionAllowed: false,
        processingTime: 0,
        validationRules: []
      };
    }

    setLocalState(prev => ({ ...prev, isValidating: true }));

    try {
      const result = await new Promise<ValidationResult>((resolve) => {
        validationTimeoutRef.current = setTimeout(() => {
          const validationResult = validateAction(action, { 
            roomCode, 
            playerId, 
            strictMode 
          });
          resolve(validationResult);
        }, 50); // 50ms delay to simulate validation
      });

      // Update local state
      setLocalState(prev => ({
        ...prev,
        isValidating: false,
        lastValidation: Date.now(),
        metrics: {
          ...prev.metrics,
          totalValidations: prev.metrics.totalValidations + 1
        }
      }));

      // Handle validation result
      if (result.isValid) {
        onValidationPassed?.(result);
      } else {
        result.violations.forEach(violation => {
          context.addViolation(violation);
          onViolation?.(violation);
        });
      }

      return result;
    } catch (error) {
      setLocalState(prev => ({ ...prev, isValidating: false }));
      
      const errorViolation = createMockSecurityViolation({
        type: 'invalid_action',
        details: `Validation error: ${error}`,
        severity: 'high',
        action
      });

      context.addViolation(errorViolation);
      onViolation?.(errorViolation);

      return {
        isValid: false,
        violations: [errorViolation],
        sanitizedData: action,
        actionAllowed: false,
        processingTime: 0,
        validationRules: ['error_handling']
      };
    }
  }, [localState.isActive, roomCode, playerId, strictMode, context, onViolation, onValidationPassed]);

  // Detect cheat attempts
  const detectCheatAttempt = useCallback((playerActions: PlayerAction[]): CheatAttempt[] => {
    const attempts: CheatAttempt[] = [];
    
    // Mock cheat detection logic
    const recentActions = playerActions.filter(a => 
      Date.now() - a.timestamp < 10000 // 10 seconds
    );
    
    // Detect rapid fire actions (potential bot)
    if (recentActions.length > 5) {
      const attempt = createMockCheatAttempt({
        playerId: playerId || 'unknown',
        type: 'bot_detection',
        evidence: {
          type: 'timing',
          data: { actionCount: recentActions.length, timeWindow: 10000 },
          confidence: 0.8,
          timestamp: Date.now()
        },
        severity: 'high'
      });
      attempts.push(attempt);
    }
    
    // Detect duplicate actions (potential replay attack)
    const duplicateActions = recentActions.filter((action, index) => 
      recentActions.findIndex(a => a.type === action.type && a.data === action.data) !== index
    );
    
    if (duplicateActions.length > 0) {
      const attempt = createMockCheatAttempt({
        playerId: playerId || 'unknown',
        type: 'action_replay',
        evidence: {
          type: 'action',
          data: { duplicateCount: duplicateActions.length },
          confidence: 0.9,
          timestamp: Date.now()
        },
        severity: 'high'
      });
      attempts.push(attempt);
    }
    
    // Add attempts to context and trigger callbacks
    attempts.forEach(attempt => {
      context.addCheatAttempt(attempt);
      onCheatDetected?.(attempt);
    });
    
    return attempts;
  }, [playerId, context, onCheatDetected]);

  // Sanitize input data
  const sanitizeInputData = useCallback((data: any): { sanitized: any; violations: string[] } => {
    const result = sanitizeInput(data);
    
    if (!result.safe) {
      const violation = createMockSecurityViolation({
        type: 'input_injection',
        details: `Input sanitization violations: ${result.violations.join(', ')}`,
        severity: 'medium',
        playerId: playerId || 'unknown',
        action: {
          type: 'input_sanitization',
          playerId: playerId || 'unknown',
          roomCode: roomCode || 'unknown',
          data: result.original,
          timestamp: Date.now()
        }
      });
      
      context.addViolation(violation);
      onViolation?.(violation);
    }
    
    return {
      sanitized: result.sanitized,
      violations: result.violations
    };
  }, [playerId, roomCode, context, onViolation]);

  // Add manual violation
  const addViolation = useCallback((violation: Partial<SecurityViolation>) => {
    const fullViolation = createMockSecurityViolation({
      playerId: playerId || 'unknown',
      ...violation
    });
    
    context.addViolation(fullViolation);
    onViolation?.(fullViolation);
  }, [playerId, context, onViolation]);

  // Add security event
  const addSecurityEvent = useCallback((event: Partial<SecurityEvent>) => {
    const fullEvent = createMockSecurityEvent({
      playerId: playerId || 'unknown',
      roomCode,
      ...event
    });
    
    context.addEvent(fullEvent);
  }, [playerId, roomCode, context]);

  // Check if player is blocked
  const isPlayerBlocked = useCallback((targetPlayerId?: string): boolean => {
    return context.isPlayerBlocked(targetPlayerId || playerId || 'unknown');
  }, [context, playerId]);

  // Get security level
  const getSecurityLevel = useCallback((): string => {
    return context.getSecurityLevel();
  }, [context]);

  // Clear violations
  const clearViolations = useCallback(() => {
    context.clearViolations();
    setRetryCount(0);
  }, [context]);

  // Clear cheat attempts
  const clearCheatAttempts = useCallback(() => {
    context.clearCheatAttempts();
  }, [context]);

  // Update configuration
  const updateConfig = useCallback((newConfig: Partial<SecurityConfig>) => {
    context.updateConfig(newConfig);
  }, [context]);

  // Get violation summary
  const getViolationSummary = useCallback(() => {
    const violations = localState.violations;
    const critical = violations.filter(v => v.severity === 'critical').length;
    const high = violations.filter(v => v.severity === 'high').length;
    const medium = violations.filter(v => v.severity === 'medium').length;
    const low = violations.filter(v => v.severity === 'low').length;
    
    return {
      total: violations.length,
      critical,
      high,
      medium,
      low,
      lastViolation: violations[violations.length - 1]
    };
  }, [localState.violations]);

  // Auto-validation for actions
  useEffect(() => {
    if (autoValidate && localState.isActive) {
      // Set up periodic validation checks
      const interval = setInterval(() => {
        if (localState.events.length > 0) {
          const recentEvents = localState.events.filter(e => 
            Date.now() - e.timestamp < 60000 // 1 minute
          );
          
          if (recentEvents.length > 10) {
            addViolation({
              type: 'rate_limiting',
              details: 'High frequency of events detected',
              severity: 'medium'
            });
          }
        }
      }, 30000); // Check every 30 seconds
      
      return () => clearInterval(interval);
    }
  }, [autoValidate, localState.isActive, localState.events, addViolation]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }
    };
  }, []);

  return {
    // State
    isActive: localState.isActive,
    isValidating: localState.isValidating,
    violations: localState.violations,
    cheatAttempts: localState.cheatAttempts,
    events: localState.events,
    metrics: localState.metrics,
    config: localState.config,
    retryCount,
    
    // Actions
    validateGameAction,
    detectCheatAttempt,
    sanitizeInputData,
    addViolation,
    addSecurityEvent,
    clearViolations,
    clearCheatAttempts,
    updateConfig,
    
    // Utilities
    isPlayerBlocked,
    getSecurityLevel,
    getViolationSummary,
    
    // State setters
    setIsActive: (active: boolean) => setLocalState(prev => ({ ...prev, isActive: active }))
  };
};

export default useSecurityValidation;
