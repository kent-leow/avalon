import type { 
  SecurityViolation, 
  ValidationResult, 
  CheatAttempt, 
  SecurityEvent, 
  GameAction, 
  SecurityMetrics,
  SecurityAction,
  SanitizedData
} from "~/types/security-validation";

/**
 * Security Validation Utilities
 * Provides comprehensive security utility functions for validation, detection, and analysis
 */

// Mock Data Generation
export const createMockSecurityViolation = (overrides?: Partial<SecurityViolation>): SecurityViolation => ({
  id: `violation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  type: 'invalid_action',
  severity: 'medium',
  playerId: 'player_123',
  action: createMockGameAction(),
  timestamp: Date.now(),
  details: 'Invalid action attempted',
  prevented: true,
  metadata: {},
  ...overrides
});

export const createMockGameAction = (overrides?: Partial<GameAction>): GameAction => ({
  type: 'vote',
  playerId: 'player_123',
  roomCode: 'ROOM123',
  data: { vote: 'approve' },
  timestamp: Date.now(),
  ...overrides
});

export const createMockCheatAttempt = (overrides?: Partial<CheatAttempt>): CheatAttempt => ({
  id: `cheat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  playerId: 'player_123',
  type: 'state_hack',
  evidence: {
    type: 'state',
    data: { suspiciousStateChange: true },
    confidence: 0.85,
    timestamp: Date.now()
  },
  timestamp: Date.now(),
  prevented: true,
  severity: 'high',
  actionTaken: {
    type: 'block',
    reason: 'Detected state manipulation',
    automatic: true
  },
  ...overrides
});

export const createMockSecurityEvent = (overrides?: Partial<SecurityEvent>): SecurityEvent => ({
  id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  type: 'action',
  playerId: 'player_123',
  timestamp: Date.now(),
  details: { action: 'vote', result: 'validated' },
  roomCode: 'ROOM123',
  outcome: 'allowed',
  ...overrides
});

// Validation Functions
export const validateAction = (action: GameAction, _context: unknown): ValidationResult => {
  const violations: SecurityViolation[] = [];
  const validationRules = ['timing_check', 'state_validation', 'permission_check'];
  
  // Mock validation logic
  if (!action.playerId) {
    violations.push(createMockSecurityViolation({
      type: 'invalid_action',
      details: 'Missing player ID',
      severity: 'high'
    }));
  }
  
  if (!action.roomCode) {
    violations.push(createMockSecurityViolation({
      type: 'invalid_action',
      details: 'Missing room code',
      severity: 'high'
    }));
  }
  
  const processingTime = Math.random() * 50 + 10; // 10-60ms
  
  return {
    isValid: violations.length === 0,
    violations,
    sanitizedData: action,
    actionAllowed: violations.length === 0,
    processingTime,
    validationRules
  };
};

export const categorizeViolation = (violation: SecurityViolation): {
  category: string;
  risk: string;
  recommendation: string;
} => {
  const { type, severity } = violation;
  
  switch (type) {
    case 'invalid_action':
      return {
        category: 'Action Validation',
        risk: severity === 'critical' ? 'High' : 'Medium',
        recommendation: 'Block action and log event'
      };
    case 'state_manipulation':
      return {
        category: 'State Security',
        risk: 'High',
        recommendation: 'Immediate investigation required'
      };
    case 'timing_violation':
      return {
        category: 'Timing Security',
        risk: 'Medium',
        recommendation: 'Monitor for patterns'
      };
    case 'input_injection':
      return {
        category: 'Input Security',
        risk: 'Critical',
        recommendation: 'Block and sanitize input'
      };
    default:
      return {
        category: 'Unknown',
        risk: 'Medium',
        recommendation: 'Log and monitor'
      };
  }
};

export const analyzeCheatPattern = (attempts: CheatAttempt[]): {
  pattern: string;
  confidence: number;
  recommendation: string;
} => {
  if (attempts.length === 0) {
    return {
      pattern: 'No pattern detected',
      confidence: 0,
      recommendation: 'Continue monitoring'
    };
  }
  
  const recentAttempts = attempts.filter(a => 
    Date.now() - a.timestamp < 300000 // 5 minutes
  );
  
  if (recentAttempts.length >= 3) {
    return {
      pattern: 'Repeated cheat attempts',
      confidence: 0.9,
      recommendation: 'Temporary ban recommended'
    };
  }
  
  const stateHacks = attempts.filter(a => a.type === 'state_hack');
  if (stateHacks.length >= 2) {
    return {
      pattern: 'State manipulation pattern',
      confidence: 0.75,
      recommendation: 'Enhanced monitoring and validation'
    };
  }
  
  return {
    pattern: 'Isolated incidents',
    confidence: 0.4,
    recommendation: 'Continue monitoring'
  };
};

export const sanitizeInput = (input: any, rules: string[] = []): SanitizedData => {
  const violations: string[] = [];
  let sanitized = input;
  
  // Basic sanitization
  if (typeof input === 'string') {
    // Remove potential script tags
    if (input.includes('<script>')) {
      violations.push('Script tag detected');
      sanitized = input.replace(/<script[^>]*>.*?<\/script>/gi, '');
    }
    
    // Remove potential SQL injection
    if (input.toLowerCase().includes('drop table')) {
      violations.push('SQL injection attempt detected');
      sanitized = input.replace(/drop\s+table/gi, '');
    }
    
    // Trim whitespace
    sanitized = sanitized.trim();
  }
  
  return {
    original: input,
    sanitized,
    violations,
    safe: violations.length === 0
  };
};

export const calculateSecurityMetrics = (
  violations: SecurityViolation[],
  cheatAttempts: CheatAttempt[],
  validations: number
): SecurityMetrics => {
  const totalValidations = validations;
  const violationsDetected = violations.length;
  const cheatsBlocked = cheatAttempts.filter(c => c.prevented).length;
  const sanitizationsPerformed = Math.floor(totalValidations * 0.1); // Mock 10% sanitization rate
  const averageValidationTime = 25; // Mock 25ms average
  
  // Calculate security score (0-100)
  const violationRate = violationsDetected / totalValidations;
  const cheatRate = cheatsBlocked / totalValidations;
  const securityScore = Math.max(0, Math.min(100, 
    100 - (violationRate * 50) - (cheatRate * 30)
  ));
  
  return {
    totalValidations,
    violationsDetected,
    cheatsBlocked,
    sanitizationsPerformed,
    averageValidationTime,
    securityScore
  };
};

export const generateSecurityReport = (
  violations: SecurityViolation[],
  cheatAttempts: CheatAttempt[],
  events: SecurityEvent[]
): string => {
  const criticalViolations = violations.filter(v => v.severity === 'critical');
  const highViolations = violations.filter(v => v.severity === 'high');
  const preventedCheats = cheatAttempts.filter(c => c.prevented);
  
  return `Security Report:
- Total Violations: ${violations.length}
- Critical Violations: ${criticalViolations.length}
- High Severity Violations: ${highViolations.length}
- Cheats Prevented: ${preventedCheats.length}
- Security Events: ${events.length}
- Last Update: ${new Date().toISOString()}`;
};

export const shouldBlockAction = (
  violation: SecurityViolation,
  playerHistory: SecurityViolation[]
): boolean => {
  // Always block critical violations
  if (violation.severity === 'critical') {
    return true;
  }
  
  // Block high severity violations
  if (violation.severity === 'high') {
    return true;
  }
  
  // Block if player has multiple recent violations
  const recentViolations = playerHistory.filter(v => 
    v.playerId === violation.playerId &&
    Date.now() - v.timestamp < 300000 // 5 minutes
  );
  
  if (recentViolations.length >= 3) {
    return true;
  }
  
  return false;
};

export const createSecurityAction = (
  violation: SecurityViolation,
  automatic: boolean = true
): SecurityAction => {
  switch (violation.severity) {
    case 'critical':
      return {
        type: 'ban',
        duration: 24 * 60 * 60 * 1000, // 24 hours
        reason: `Critical security violation: ${violation.details}`,
        automatic
      };
    case 'high':
      return {
        type: 'kick',
        reason: `High severity violation: ${violation.details}`,
        automatic
      };
    case 'medium':
      return {
        type: 'warn',
        reason: `Security warning: ${violation.details}`,
        automatic
      };
    default:
      return {
        type: 'log',
        reason: `Security event: ${violation.details}`,
        automatic
      };
  }
};

export const isConnectionSecure = (
  events: SecurityEvent[],
  timeWindow: number = 60000
): boolean => {
  const recentEvents = events.filter(e => 
    Date.now() - e.timestamp < timeWindow
  );
  
  const breaches = recentEvents.filter(e => e.type === 'breach');
  const failures = recentEvents.filter(e => e.type === 'authentication_failure');
  
  // Connection is secure if no breaches and minimal failures
  return breaches.length === 0 && failures.length < 3;
};

export const getSecurityLevel = (metrics: SecurityMetrics): string => {
  if (metrics.securityScore >= 90) return 'Excellent';
  if (metrics.securityScore >= 75) return 'Good';
  if (metrics.securityScore >= 60) return 'Fair';
  if (metrics.securityScore >= 40) return 'Poor';
  return 'Critical';
};

export const formatSecurityMessage = (
  violation: SecurityViolation,
  action: SecurityAction
): string => {
  const severity = violation.severity.toUpperCase();
  const actionType = action.type.toUpperCase();
  
  return `[${severity}] Security violation detected: ${violation.details}. Action taken: ${actionType}`;
};

export const createAuditLogEntry = (
  event: SecurityEvent,
  context: Record<string, unknown> = {}
): SecurityEvent => {
  return {
    ...event,
    details: {
      ...event.details,
      context,
      auditLevel: 'standard',
      source: 'security_validation_system'
    }
  };
};

// Security Constants
export const SECURITY_THRESHOLDS = {
  MAX_VIOLATIONS_PER_MINUTE: 5,
  MAX_CHEAT_ATTEMPTS_PER_HOUR: 3,
  CRITICAL_VIOLATION_THRESHOLD: 1,
  HIGH_VIOLATION_THRESHOLD: 3,
  VALIDATION_TIMEOUT: 1000
} as const;

export const SECURITY_MESSAGES = {
  ACTION_BLOCKED: 'Action blocked due to security violation',
  CHEAT_DETECTED: 'Cheat attempt detected and prevented',
  VALIDATION_FAILED: 'Action validation failed',
  SANITIZATION_REQUIRED: 'Input sanitization required',
  SECURITY_BREACH: 'Security breach detected',
  AUDIT_LOGGED: 'Security event logged for audit'
} as const;
