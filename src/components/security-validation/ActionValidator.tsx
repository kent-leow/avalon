'use client';

import React, { useState, useEffect, useCallback } from 'react';
import type { 
  GameAction, 
  ValidationResult, 
  SecurityViolation 
} from '~/types/security-validation';
import { validateAction } from '~/lib/security-validation-utils';

/**
 * Action Validator Component
 * Validates all player actions before processing
 */

interface ActionValidatorProps {
  action: GameAction;
  gameState: any;
  playerId: string;
  onValidationResult?: (result: ValidationResult) => void;
  className?: string;
}

export const ActionValidator: React.FC<ActionValidatorProps> = ({
  action,
  gameState,
  playerId,
  onValidationResult,
  className = ''
}) => {
  const [validationState, setValidationState] = useState<'idle' | 'validating' | 'complete'>('idle');
  const [lastResult, setLastResult] = useState<ValidationResult | null>(null);

  // Validate action
  const performValidation = useCallback(async () => {
    setValidationState('validating');
    
    try {
      const result = validateAction(action, { 
        gameState, 
        playerId,
        timestamp: Date.now() 
      });
      
      setLastResult(result);
      setValidationState('complete');
      onValidationResult?.(result);
      
      return result;
    } catch (error) {
      const errorResult: ValidationResult = {
        isValid: false,
        violations: [{
          id: `validation_error_${Date.now()}`,
          type: 'invalid_action',
          severity: 'high',
          playerId,
          action,
          timestamp: Date.now(),
          details: `Validation error: ${error}`,
          prevented: true
        }],
        sanitizedData: action,
        actionAllowed: false,
        processingTime: 0,
        validationRules: ['error_handling']
      };
      
      setLastResult(errorResult);
      setValidationState('complete');
      onValidationResult?.(errorResult);
      
      return errorResult;
    }
  }, [action, gameState, playerId, onValidationResult]);

  // Auto-validate when action changes
  useEffect(() => {
    if (action && action.type) {
      performValidation();
    }
  }, [action, performValidation]);

  // Get validation status color
  const getValidationStatusColor = (): string => {
    if (validationState === 'validating') return '#8b5cf6'; // Purple
    if (lastResult?.isValid) return '#22c55e'; // Green
    if (lastResult && !lastResult.isValid) return '#ef4444'; // Red
    return '#6b7280'; // Gray
  };

  return (
    <div 
      className={`action-validator ${className}`}
      data-testid="action-validator"
    >
      {/* Validation Status Indicator */}
      <div 
        className="validation-status flex items-center space-x-2 text-sm"
        style={{ color: '#ffffff' }}
      >
        <div 
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: getValidationStatusColor() }}
        />
        <span>
          {validationState === 'validating' && 'Validating...'}
          {validationState === 'complete' && lastResult?.isValid && 'Action Valid'}
          {validationState === 'complete' && !lastResult?.isValid && 'Action Invalid'}
          {validationState === 'idle' && 'Awaiting Action'}
        </span>
      </div>

      {/* Validation Details */}
      {lastResult && (
        <div className="validation-details mt-2 text-xs" style={{ color: '#ffffff' }}>
          <div className="flex items-center justify-between">
            <span>Processing Time:</span>
            <span>{lastResult.processingTime}ms</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Rules Applied:</span>
            <span>{lastResult.validationRules.length}</span>
          </div>
          {lastResult.violations.length > 0 && (
            <div className="mt-1">
              <span style={{ color: '#ef4444' }}>
                {lastResult.violations.length} violation(s) detected
              </span>
            </div>
          )}
        </div>
      )}

      {/* Violation Details */}
      {lastResult?.violations.map((violation, index) => (
        <div
          key={violation.id}
          className="violation-detail mt-2 p-2 rounded"
          style={{
            backgroundColor: '#1a1a2e',
            border: '1px solid #ef4444',
            color: '#ffffff'
          }}
          data-testid={`violation-${index}`}
        >
          <div className="text-xs font-medium">{violation.type.replace('_', ' ').toUpperCase()}</div>
          <div className="text-xs opacity-75">{violation.details}</div>
          <div className="text-xs opacity-50 mt-1">
            Severity: {violation.severity} • {violation.prevented ? 'Blocked' : 'Flagged'}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActionValidator;
