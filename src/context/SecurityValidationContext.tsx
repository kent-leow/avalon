'use client';

import React, { createContext, useContext, useReducer, useCallback } from 'react';
import type { 
  SecurityState, 
  SecurityViolation, 
  CheatAttempt, 
  SecurityEvent, 
  SecurityConfig,
  SecurityMetrics,
  GameAction,
  ValidationResult
} from '~/types/security-validation';
import { 
  createMockSecurityViolation, 
  createMockCheatAttempt, 
  createMockSecurityEvent,
  calculateSecurityMetrics,
  shouldBlockAction,
  createSecurityAction
} from '~/lib/security-validation-utils';

/**
 * Security Validation Context
 * Provides global security state management and validation operations
 */

// Context Types
interface SecurityValidationContextType {
  state: SecurityState;
  addViolation: (violation: SecurityViolation) => void;
  addCheatAttempt: (attempt: CheatAttempt) => void;
  addEvent: (event: SecurityEvent) => void;
  clearViolations: () => void;
  clearCheatAttempts: () => void;
  updateConfig: (config: Partial<SecurityConfig>) => void;
  validateAction: (action: GameAction) => ValidationResult;
  getSecurityLevel: () => string;
  isPlayerBlocked: (playerId: string) => boolean;
}

// Actions
type SecurityAction = 
  | { type: 'ADD_VIOLATION'; payload: SecurityViolation }
  | { type: 'ADD_CHEAT_ATTEMPT'; payload: CheatAttempt }
  | { type: 'ADD_EVENT'; payload: SecurityEvent }
  | { type: 'CLEAR_VIOLATIONS' }
  | { type: 'CLEAR_CHEAT_ATTEMPTS' }
  | { type: 'UPDATE_CONFIG'; payload: Partial<SecurityConfig> }
  | { type: 'UPDATE_METRICS'; payload: SecurityMetrics };

// Initial State
const initialState: SecurityState = {
  isActive: true,
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
  config: {
    validation: {
      enabled: true,
      rules: [],
      strictMode: false,
      logLevel: 'warning'
    },
    cheatDetection: {
      enabled: true,
      rules: [],
      sensitivity: 0.7,
      autoBlock: true
    },
    sanitization: {
      enabled: true,
      rules: [],
      stripUnknown: true
    },
    audit: {
      enabled: true,
      retention: 604800000, // 7 days
      logEvents: ['violation', 'breach', 'action']
    }
  },
  lastUpdate: Date.now()
};

// Reducer
const securityReducer = (state: SecurityState, action: SecurityAction): SecurityState => {
  switch (action.type) {
    case 'ADD_VIOLATION':
      return {
        ...state,
        violations: [...state.violations, action.payload],
        lastUpdate: Date.now()
      };
    
    case 'ADD_CHEAT_ATTEMPT':
      return {
        ...state,
        cheatAttempts: [...state.cheatAttempts, action.payload],
        lastUpdate: Date.now()
      };
    
    case 'ADD_EVENT':
      return {
        ...state,
        events: [...state.events, action.payload],
        lastUpdate: Date.now()
      };
    
    case 'CLEAR_VIOLATIONS':
      return {
        ...state,
        violations: [],
        lastUpdate: Date.now()
      };
    
    case 'CLEAR_CHEAT_ATTEMPTS':
      return {
        ...state,
        cheatAttempts: [],
        lastUpdate: Date.now()
      };
    
    case 'UPDATE_CONFIG':
      return {
        ...state,
        config: {
          ...state.config,
          ...action.payload
        },
        lastUpdate: Date.now()
      };
    
    case 'UPDATE_METRICS':
      return {
        ...state,
        metrics: action.payload,
        lastUpdate: Date.now()
      };
    
    default:
      return state;
  }
};

// Context
const SecurityValidationContext = createContext<SecurityValidationContextType | null>(null);

// Provider Component
interface SecurityValidationProviderProps {
  children: React.ReactNode;
  roomCode?: string;
  playerId?: string;
  config?: Partial<SecurityConfig>;
}

export const SecurityValidationProvider: React.FC<SecurityValidationProviderProps> = ({
  children,
  roomCode,
  playerId,
  config
}) => {
  const [state, dispatch] = useReducer(securityReducer, {
    ...initialState,
    config: { ...initialState.config, ...config }
  });

  // Actions
  const addViolation = useCallback((violation: SecurityViolation) => {
    dispatch({ type: 'ADD_VIOLATION', payload: violation });
    
    // Add corresponding event
    const event: SecurityEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'violation',
      playerId: violation.playerId,
      timestamp: Date.now(),
      details: { violation: violation.type, severity: violation.severity },
      roomCode,
      outcome: violation.prevented ? 'blocked' : 'flagged'
    };
    dispatch({ type: 'ADD_EVENT', payload: event });
    
    // Auto-block if configured
    if (state.config.cheatDetection.autoBlock && shouldBlockAction(violation, state.violations)) {
      console.warn('Auto-blocking player due to security violation:', violation);
    }
  }, [state.violations, state.config.cheatDetection.autoBlock, roomCode]);

  const addCheatAttempt = useCallback((attempt: CheatAttempt) => {
    dispatch({ type: 'ADD_CHEAT_ATTEMPT', payload: attempt });
    
    // Add corresponding event
    const event: SecurityEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'violation',
      playerId: attempt.playerId,
      timestamp: Date.now(),
      details: { cheatType: attempt.type, severity: attempt.severity },
      roomCode,
      outcome: attempt.prevented ? 'blocked' : 'flagged'
    };
    dispatch({ type: 'ADD_EVENT', payload: event });
  }, [roomCode]);

  const addEvent = useCallback((event: SecurityEvent) => {
    dispatch({ type: 'ADD_EVENT', payload: event });
  }, []);

  const clearViolations = useCallback(() => {
    dispatch({ type: 'CLEAR_VIOLATIONS' });
  }, []);

  const clearCheatAttempts = useCallback(() => {
    dispatch({ type: 'CLEAR_CHEAT_ATTEMPTS' });
  }, []);

  const updateConfig = useCallback((newConfig: Partial<SecurityConfig>) => {
    dispatch({ type: 'UPDATE_CONFIG', payload: newConfig });
  }, []);

  const validateAction = useCallback((action: GameAction): ValidationResult => {
    const validationStart = Date.now();
    const violations: SecurityViolation[] = [];
    
    // Basic validation
    if (!action.playerId) {
      violations.push(createMockSecurityViolation({
        type: 'invalid_action',
        playerId: action.playerId || 'unknown',
        details: 'Missing player ID',
        severity: 'high',
        action
      }));
    }
    
    if (!action.roomCode) {
      violations.push(createMockSecurityViolation({
        type: 'invalid_action',
        playerId: action.playerId || 'unknown',
        details: 'Missing room code',
        severity: 'high',
        action
      }));
    }
    
    // Add violations to state
    violations.forEach(violation => addViolation(violation));
    
    const processingTime = Date.now() - validationStart;
    const result: ValidationResult = {
      isValid: violations.length === 0,
      violations,
      sanitizedData: action,
      actionAllowed: violations.length === 0,
      processingTime,
      validationRules: ['basic_validation', 'player_check', 'room_check']
    };
    
    // Update metrics
    const newMetrics = calculateSecurityMetrics(
      state.violations,
      state.cheatAttempts,
      state.metrics.totalValidations + 1
    );
    dispatch({ type: 'UPDATE_METRICS', payload: newMetrics });
    
    return result;
  }, [state.violations, state.cheatAttempts, state.metrics.totalValidations, addViolation]);

  const getSecurityLevel = useCallback((): string => {
    if (state.metrics.securityScore >= 90) return 'Excellent';
    if (state.metrics.securityScore >= 75) return 'Good';
    if (state.metrics.securityScore >= 60) return 'Fair';
    if (state.metrics.securityScore >= 40) return 'Poor';
    return 'Critical';
  }, [state.metrics.securityScore]);

  const isPlayerBlocked = useCallback((targetPlayerId: string): boolean => {
    const playerViolations = state.violations.filter(v => v.playerId === targetPlayerId);
    const recentViolations = playerViolations.filter(v => 
      Date.now() - v.timestamp < 300000 // 5 minutes
    );
    
    return recentViolations.some(v => v.severity === 'critical') || 
           recentViolations.length >= 3;
  }, [state.violations]);

  const contextValue: SecurityValidationContextType = {
    state,
    addViolation,
    addCheatAttempt,
    addEvent,
    clearViolations,
    clearCheatAttempts,
    updateConfig,
    validateAction,
    getSecurityLevel,
    isPlayerBlocked
  };

  return (
    <SecurityValidationContext.Provider value={contextValue}>
      {children}
    </SecurityValidationContext.Provider>
  );
};

// Hook
export const useSecurityValidationContext = (): SecurityValidationContextType => {
  const context = useContext(SecurityValidationContext);
  if (!context) {
    throw new Error('useSecurityValidationContext must be used within a SecurityValidationProvider');
  }
  return context;
};

export default SecurityValidationContext;
