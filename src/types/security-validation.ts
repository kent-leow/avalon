/**
 * Security Validation Types - Integrated Security Validation System
 * Provides comprehensive security measures across all game features
 */

// Core Security Types
export interface SecurityViolation {
  id: string;
  type: ViolationType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  playerId: string;
  action: GameAction;
  timestamp: number;
  details: string;
  prevented: boolean;
  metadata?: Record<string, any>;
}

export interface ValidationResult {
  isValid: boolean;
  violations: SecurityViolation[];
  sanitizedData?: any;
  actionAllowed: boolean;
  processingTime: number;
  validationRules: string[];
}

export interface CheatAttempt {
  id: string;
  playerId: string;
  type: CheatType;
  evidence: CheatEvidence;
  timestamp: number;
  prevented: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  actionTaken: SecurityAction;
}

export interface SecurityEvent {
  id: string;
  type: SecurityEventType;
  playerId: string;
  timestamp: number;
  details: Record<string, any>;
  roomCode?: string;
  outcome: 'allowed' | 'blocked' | 'flagged';
}

export interface CheatEvidence {
  type: 'timing' | 'state' | 'action' | 'network';
  data: Record<string, any>;
  confidence: number;
  timestamp: number;
}

export interface SecurityAction {
  type: 'warn' | 'block' | 'kick' | 'ban' | 'log';
  duration?: number;
  reason: string;
  automatic: boolean;
}

export interface GameAction {
  type: string;
  playerId: string;
  roomCode: string;
  data: Record<string, any>;
  timestamp: number;
}

export interface AuditLog {
  id: string;
  events: SecurityEvent[];
  timestamp: number;
  playerId: string;
  roomCode: string;
  summary: string;
}

export interface SanitizedData {
  original: any;
  sanitized: any;
  violations: string[];
  safe: boolean;
}

export interface SecurityBreach {
  id: string;
  type: 'data' | 'network' | 'injection' | 'manipulation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  playerId: string;
  timestamp: number;
  details: string;
  mitigated: boolean;
}

// Validation Rules
export interface ValidationRule {
  id: string;
  name: string;
  category: 'action' | 'state' | 'timing' | 'input';
  enabled: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  validate: (data: any, context: ValidationContext) => ValidationResult;
}

export interface ValidationContext {
  playerId: string;
  roomCode: string;
  gameState: any;
  timestamp: number;
  previousActions: GameAction[];
}

export interface CheatDetectionRule {
  id: string;
  name: string;
  type: CheatType;
  enabled: boolean;
  sensitivity: number;
  detect: (actions: PlayerAction[], context: DetectionContext) => CheatAttempt[];
}

export interface DetectionContext {
  playerId: string;
  gameState: any;
  timeWindow: number;
  playerHistory: PlayerAction[];
}

export interface SanitizationRule {
  id: string;
  name: string;
  field: string;
  type: 'text' | 'number' | 'boolean' | 'object';
  sanitize: (value: any) => SanitizedData;
}

export interface PlayerAction {
  id: string;
  playerId: string;
  type: string;
  data: any;
  timestamp: number;
  valid: boolean;
}

// Security Configuration
export interface SecurityConfig {
  validation: {
    enabled: boolean;
    rules: ValidationRule[];
    strictMode: boolean;
    logLevel: 'info' | 'warning' | 'error';
  };
  cheatDetection: {
    enabled: boolean;
    rules: CheatDetectionRule[];
    sensitivity: number;
    autoBlock: boolean;
  };
  sanitization: {
    enabled: boolean;
    rules: SanitizationRule[];
    stripUnknown: boolean;
  };
  audit: {
    enabled: boolean;
    retention: number;
    logEvents: SecurityEventType[];
  };
}

export interface SecurityMetrics {
  totalValidations: number;
  violationsDetected: number;
  cheatsBlocked: number;
  sanitizationsPerformed: number;
  averageValidationTime: number;
  securityScore: number;
}

// Security State
export interface SecurityState {
  isActive: boolean;
  violations: SecurityViolation[];
  cheatAttempts: CheatAttempt[];
  events: SecurityEvent[];
  metrics: SecurityMetrics;
  config: SecurityConfig;
  lastUpdate: number;
}

// Action Types
export interface ValidatedAction {
  action: GameAction;
  result: ValidationResult;
  timestamp: number;
  processed: boolean;
}

// Enums
export type ViolationType = 
  | 'invalid_action' 
  | 'state_manipulation' 
  | 'timing_violation' 
  | 'input_injection'
  | 'unauthorized_access'
  | 'data_tampering'
  | 'rate_limiting'
  | 'session_hijacking';

export type CheatType = 
  | 'state_hack' 
  | 'action_replay' 
  | 'timing_abuse' 
  | 'information_leak'
  | 'bot_detection'
  | 'multiple_accounts'
  | 'network_manipulation'
  | 'client_modification';

export type SecurityEventType = 
  | 'login' 
  | 'action' 
  | 'violation' 
  | 'breach' 
  | 'recovery'
  | 'logout'
  | 'session_timeout'
  | 'authentication_failure';

// Constants
export const SECURITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
} as const;

export const VALIDATION_TIMEOUTS = {
  QUICK: 100,
  NORMAL: 500,
  THOROUGH: 1000
} as const;

export const CHEAT_DETECTION_SENSITIVITY = {
  LOW: 0.3,
  MEDIUM: 0.6,
  HIGH: 0.8,
  MAXIMUM: 0.95
} as const;

export const SECURITY_ACTIONS = {
  WARN: 'warn',
  BLOCK: 'block',
  KICK: 'kick',
  BAN: 'ban',
  LOG: 'log'
} as const;

export const AUDIT_RETENTION = {
  HOUR: 3600000,
  DAY: 86400000,
  WEEK: 604800000,
  MONTH: 2592000000
} as const;
