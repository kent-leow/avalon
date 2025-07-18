'use client';

import React, { useState, useEffect, useCallback } from 'react';
import type { 
  SecurityViolation, 
  CheatAttempt, 
  SecurityEvent, 
  GameAction,
  ValidationResult,
  SecurityBreach,
  SanitizedData,
  AuditLog
} from '~/types/security-validation';
import { useSecurityValidation } from '~/hooks/useSecurityValidation';
import { 
  ActionValidator, 
  CheatDetector, 
  InputSanitizer, 
  SecureChannel, 
  AuditLogger 
} from './index';

/**
 * Security Validation System - Main security coordinator
 * Integrates all security validation components and provides comprehensive monitoring
 */

interface SecurityValidationSystemProps {
  children: React.ReactNode;
  roomCode: string;
  playerId: string;
  onSecurityViolation?: (violation: SecurityViolation) => void;
  onValidationPassed?: (action: GameAction) => void;
  onCheatDetected?: (attempt: CheatAttempt) => void;
  onSecurityEvent?: (event: SecurityEvent) => void;
  className?: string;
}

export const SecurityValidationSystem: React.FC<SecurityValidationSystemProps> = ({
  children,
  roomCode,
  playerId,
  onSecurityViolation,
  onValidationPassed,
  onCheatDetected,
  onSecurityEvent,
  className = ''
}) => {
  const [isSystemActive, setIsSystemActive] = useState(true);
  const [lastValidation, setLastValidation] = useState<number>(0);
  const [securityAlerts, setSecurityAlerts] = useState<SecurityViolation[]>([]);

  const {
    isActive,
    isValidating,
    violations,
    cheatAttempts,
    events,
    metrics,
    validateGameAction,
    detectCheatAttempt,
    addSecurityEvent,
    getSecurityLevel,
    isPlayerBlocked,
    getViolationSummary
  } = useSecurityValidation({
    roomCode,
    playerId,
    autoValidate: true,
    strictMode: true,
    onViolation: onSecurityViolation,
    onCheatDetected,
    onValidationPassed: (result: ValidationResult) => {
      if (result.isValid && onValidationPassed) {
        onValidationPassed({
          type: 'validation_success',
          playerId,
          roomCode,
          data: result.sanitizedData,
          timestamp: Date.now()
        });
      }
    }
  });

  // Security status monitoring
  const securityLevel = getSecurityLevel();
  const violationSummary = getViolationSummary();
  const isBlocked = isPlayerBlocked();

  // Handle security violations
  const handleSecurityViolation = useCallback((violation: SecurityViolation) => {
    setSecurityAlerts(prev => [violation, ...prev.slice(0, 4)]); // Keep last 5 alerts
    
    const event: SecurityEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'violation',
      playerId: violation.playerId,
      timestamp: Date.now(),
      details: {
        violationType: violation.type,
        severity: violation.severity,
        prevented: violation.prevented
      },
      roomCode,
      outcome: violation.prevented ? 'blocked' : 'flagged'
    };
    
    addSecurityEvent(event);
    onSecurityEvent?.(event);
  }, [roomCode, addSecurityEvent, onSecurityEvent]);

  // Handle cheat detection
  const handleCheatDetected = useCallback((attempt: CheatAttempt) => {
    const event: SecurityEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'violation',
      playerId: attempt.playerId,
      timestamp: Date.now(),
      details: {
        cheatType: attempt.type,
        severity: attempt.severity,
        prevented: attempt.prevented
      },
      roomCode,
      outcome: attempt.prevented ? 'blocked' : 'flagged'
    };
    
    addSecurityEvent(event);
    onSecurityEvent?.(event);
    onCheatDetected?.(attempt);
  }, [roomCode, addSecurityEvent, onSecurityEvent, onCheatDetected]);

  // Monitor system health
  useEffect(() => {
    const interval = setInterval(() => {
      if (isSystemActive) {
        setLastValidation(Date.now());
        
        // Check for system health issues
        if (violations.length > 10) {
          console.warn('High number of security violations detected');
        }
        
        if (cheatAttempts.length > 3) {
          console.warn('Multiple cheat attempts detected');
        }
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [isSystemActive, violations.length, cheatAttempts.length]);

  // Security status indicator colors
  const getSecurityStatusColor = (level: string): string => {
    switch (level) {
      case 'Excellent': return '#22c55e'; // Green
      case 'Good': return '#3b82f6'; // Blue
      case 'Fair': return '#f59e0b'; // Yellow
      case 'Poor': return '#ef4444'; // Red
      case 'Critical': return '#dc2626'; // Dark Red
      default: return '#6b7280'; // Gray
    }
  };

  const getViolationSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'critical': return '#dc2626'; // Dark Red
      case 'high': return '#ef4444'; // Red
      case 'medium': return '#f59e0b'; // Yellow
      case 'low': return '#22c55e'; // Green
      default: return '#6b7280'; // Gray
    }
  };

  return (
    <div 
      className={`security-validation-system ${className}`}
      data-testid="security-validation-system"
    >
      {/* Security Status Indicator */}
      <div 
        className="security-status-indicator fixed top-4 right-4 z-50"
        style={{ 
          backgroundColor: '#0a0a0f',
          border: `2px solid ${getSecurityStatusColor(securityLevel)}`,
          borderRadius: '8px',
          padding: '8px 12px',
          fontSize: '12px',
          fontWeight: 'bold',
          color: '#ffffff'
        }}
        data-testid="security-status-indicator"
      >
        <div className="flex items-center space-x-2">
          <div 
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: getSecurityStatusColor(securityLevel) }}
          />
          <span>Security: {securityLevel}</span>
          {isValidating && (
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#8b5cf6' }} />
          )}
        </div>
      </div>

      {/* Security Alerts */}
      {securityAlerts.length > 0 && (
        <div 
          className="security-alerts fixed top-20 right-4 z-40 space-y-2"
          data-testid="security-alerts"
        >
          {securityAlerts.map((alert, index) => (
            <div
              key={alert.id}
              className="security-alert p-3 rounded-lg shadow-lg max-w-sm"
              style={{
                backgroundColor: '#1a1a2e',
                border: `1px solid ${getViolationSeverityColor(alert.severity)}`,
                color: '#ffffff'
              }}
              data-testid={`security-alert-${index}`}
            >
              <div className="flex items-start space-x-2">
                <div 
                  className="w-2 h-2 rounded-full mt-1.5"
                  style={{ backgroundColor: getViolationSeverityColor(alert.severity) }}
                />
                <div className="flex-1">
                  <div className="text-sm font-medium">{alert.type.replace('_', ' ').toUpperCase()}</div>
                  <div className="text-xs opacity-75">{alert.details}</div>
                  <div className="text-xs opacity-50 mt-1">
                    {alert.prevented ? 'Blocked' : 'Flagged'} • {alert.severity}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Player Blocked Warning */}
      {isBlocked && (
        <div 
          className="security-blocked-warning fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50"
          style={{
            backgroundColor: '#1a1a2e',
            border: '2px solid #ef4444',
            borderRadius: '12px',
            padding: '24px',
            color: '#ffffff',
            textAlign: 'center',
            maxWidth: '400px'
          }}
          data-testid="security-blocked-warning"
        >
          <div className="text-lg font-bold mb-2" style={{ color: '#ef4444' }}>
            Security Alert
          </div>
          <div className="text-sm mb-4">
            Your actions have been temporarily restricted due to security violations.
          </div>
          <div className="text-xs opacity-75">
            Please contact support if you believe this is an error.
          </div>
        </div>
      )}

      {/* Security Components Integration */}
      <SecureChannel 
        encryptionLevel="high"
        onSecurityBreach={(breach: SecurityBreach) => {
          handleSecurityViolation({
            id: `breach_${Date.now()}`,
            type: 'unauthorized_access',
            severity: 'critical',
            playerId,
            action: {
              type: 'security_breach',
              playerId,
              roomCode,
              data: breach,
              timestamp: Date.now()
            },
            timestamp: Date.now(),
            details: breach.details,
            prevented: breach.mitigated
          });
        }}
        data-testid="secure-channel"
      >
        <InputSanitizer
          onSanitizationComplete={(sanitized: SanitizedData) => {
            if (!sanitized.safe) {
              handleSecurityViolation({
                id: `sanitization_${Date.now()}`,
                type: 'input_injection',
                severity: 'medium',
                playerId,
                action: {
                  type: 'input_sanitization',
                  playerId,
                  roomCode,
                  data: sanitized.original,
                  timestamp: Date.now()
                },
                timestamp: Date.now(),
                details: `Input sanitization violations: ${sanitized.violations.join(', ')}`,
                prevented: true
              });
            }
          }}
          data-testid="input-sanitizer"
        >
          <ActionValidator
            action={{
              type: 'game_action',
              playerId,
              roomCode,
              data: {},
              timestamp: Date.now()
            }}
            gameState={{ phase: 'active', players: [] }}
            playerId={playerId}
            onValidationResult={(result: ValidationResult) => {
              if (!result.isValid) {
                result.violations.forEach(handleSecurityViolation);
              }
            }}
            data-testid="action-validator"
          />
          
          <CheatDetector
            playerActions={[]}
            gameState={{ phase: 'active', players: [] }}
            onCheatDetected={handleCheatDetected}
            data-testid="cheat-detector"
          />
          
          {children}
        </InputSanitizer>
      </SecureChannel>

      {/* Audit Logger */}
      <AuditLogger
        events={events}
        logLevel="warning"
        onLogComplete={(log: AuditLog) => {
          console.log('Security audit log completed:', log);
        }}
        data-testid="audit-logger"
      />

      {/* Debug Info (Development Only) */}
      {process.env.NODE_ENV === 'development' && (
        <div 
          className="security-debug-info fixed bottom-4 left-4 z-40 p-3 rounded-lg text-xs"
          style={{
            backgroundColor: '#0a0a0f',
            border: '1px solid #3d3d7a',
            color: '#ffffff',
            fontFamily: 'monospace'
          }}
          data-testid="security-debug-info"
        >
          <div>Active: {isActive ? 'Yes' : 'No'}</div>
          <div>Validating: {isValidating ? 'Yes' : 'No'}</div>
          <div>Violations: {violationSummary.total}</div>
          <div>Cheats: {cheatAttempts.length}</div>
          <div>Events: {events.length}</div>
          <div>Score: {metrics.securityScore.toFixed(1)}</div>
          <div>Last Check: {lastValidation ? new Date(lastValidation).toLocaleTimeString() : 'Never'}</div>
        </div>
      )}
    </div>
  );
};

export default SecurityValidationSystem;
