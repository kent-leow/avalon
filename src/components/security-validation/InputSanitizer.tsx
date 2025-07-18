'use client';

import React, { useState, useEffect, useCallback } from 'react';
import type { 
  SanitizedData, 
  SanitizationRule 
} from '~/types/security-validation';
import { sanitizeInput } from '~/lib/security-validation-utils';

/**
 * Input Sanitizer Component
 * Sanitizes and validates all user inputs
 */

interface InputSanitizerProps {
  children: React.ReactNode;
  onSanitizationComplete?: (sanitized: SanitizedData) => void;
  sanitizationRules?: SanitizationRule[];
  className?: string;
}

export const InputSanitizer: React.FC<InputSanitizerProps> = ({
  children,
  onSanitizationComplete,
  sanitizationRules = [],
  className = ''
}) => {
  const [sanitizationActive, setSanitizationActive] = useState(true);
  const [sanitizationStats, setSanitizationStats] = useState({
    totalInputs: 0,
    sanitizedInputs: 0,
    violationsFound: 0,
    lastSanitization: 0
  });

  // Sanitize input data
  const sanitizeData = useCallback((data: any): SanitizedData => {
    if (!sanitizationActive) {
      return {
        original: data,
        sanitized: data,
        violations: [],
        safe: true
      };
    }

    const result = sanitizeInput(data, sanitizationRules.map(rule => rule.name));
    
    // Update statistics
    setSanitizationStats(prev => ({
      totalInputs: prev.totalInputs + 1,
      sanitizedInputs: prev.sanitizedInputs + (result.violations.length > 0 ? 1 : 0),
      violationsFound: prev.violationsFound + result.violations.length,
      lastSanitization: Date.now()
    }));

    // Trigger callback
    onSanitizationComplete?.(result);

    return result;
  }, [sanitizationActive, sanitizationRules, onSanitizationComplete]);

  // Intercept form submissions and input changes
  const handleFormSubmit = useCallback((event: Event) => {
    if (event.target instanceof HTMLFormElement) {
      const formData = new FormData(event.target);
      const data: Record<string, any> = {};
      
      formData.forEach((value, key) => {
        data[key] = value;
      });

      const sanitized = sanitizeData(data);
      
      if (!sanitized.safe) {
        event.preventDefault();
        console.warn('Form submission blocked due to sanitization violations:', sanitized.violations);
      }
    }
  }, [sanitizeData]);

  const handleInputChange = useCallback((event: Event) => {
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
      const sanitized = sanitizeData(event.target.value);
      
      if (!sanitized.safe && sanitized.sanitized !== event.target.value) {
        event.target.value = sanitized.sanitized;
      }
    }
  }, [sanitizeData]);

  // Set up event listeners
  useEffect(() => {
    if (sanitizationActive) {
      document.addEventListener('submit', handleFormSubmit);
      document.addEventListener('input', handleInputChange);
      
      return () => {
        document.removeEventListener('submit', handleFormSubmit);
        document.removeEventListener('input', handleInputChange);
      };
    }
  }, [sanitizationActive, handleFormSubmit, handleInputChange]);

  // Get sanitization status color
  const getSanitizationStatusColor = (): string => {
    if (!sanitizationActive) return '#6b7280'; // Gray
    if (sanitizationStats.violationsFound === 0) return '#22c55e'; // Green
    if (sanitizationStats.violationsFound < 5) return '#f59e0b'; // Yellow
    return '#ef4444'; // Red
  };

  const getSanitizationLevel = (): string => {
    if (!sanitizationActive) return 'Disabled';
    if (sanitizationStats.violationsFound === 0) return 'Clean';
    if (sanitizationStats.violationsFound < 5) return 'Moderate';
    return 'High Risk';
  };

  return (
    <div 
      className={`input-sanitizer ${className}`}
      data-testid="input-sanitizer"
    >
      {/* Sanitization Status */}
      <div 
        className="sanitization-status flex items-center space-x-2 text-sm"
        style={{ color: '#ffffff' }}
      >
        <div 
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: getSanitizationStatusColor() }}
        />
        <span>Input Sanitization: {getSanitizationLevel()}</span>
      </div>

      {/* Sanitization Statistics */}
      <div className="sanitization-stats mt-2 text-xs" style={{ color: '#ffffff' }}>
        <div className="flex items-center justify-between">
          <span>Total Inputs:</span>
          <span>{sanitizationStats.totalInputs}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Sanitized:</span>
          <span>{sanitizationStats.sanitizedInputs}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Violations Found:</span>
          <span>{sanitizationStats.violationsFound}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Success Rate:</span>
          <span>
            {sanitizationStats.totalInputs > 0 
              ? (((sanitizationStats.totalInputs - sanitizationStats.violationsFound) / sanitizationStats.totalInputs) * 100).toFixed(1) + '%'
              : '100%'
            }
          </span>
        </div>
      </div>

      {/* Warning for High Risk */}
      {sanitizationStats.violationsFound >= 5 && (
        <div 
          className="sanitization-warning mt-2 p-2 rounded"
          style={{
            backgroundColor: '#1a1a2e',
            border: '1px solid #ef4444',
            color: '#ffffff'
          }}
          data-testid="sanitization-warning"
        >
          <div className="text-xs font-medium">High Risk Input Detected</div>
          <div className="text-xs opacity-75">
            Multiple sanitization violations found. Enhanced monitoring active.
          </div>
        </div>
      )}

      {/* Rules Status */}
      {sanitizationRules.length > 0 && (
        <div className="rules-status mt-2">
          <div className="text-xs font-medium mb-1" style={{ color: '#ffffff' }}>
            Active Rules ({sanitizationRules.length})
          </div>
          <div className="flex flex-wrap gap-1">
            {sanitizationRules.slice(0, 3).map((rule, index) => (
              <div
                key={rule.id}
                className="px-2 py-1 text-xs rounded"
                style={{
                  backgroundColor: '#252547',
                  color: '#ffffff',
                  fontSize: '10px'
                }}
                data-testid={`rule-${index}`}
              >
                {rule.name}
              </div>
            ))}
            {sanitizationRules.length > 3 && (
              <div
                className="px-2 py-1 text-xs rounded"
                style={{
                  backgroundColor: '#3d3d7a',
                  color: '#ffffff',
                  fontSize: '10px'
                }}
              >
                +{sanitizationRules.length - 3} more
              </div>
            )}
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="sanitization-controls mt-2 flex space-x-2">
        <button
          onClick={() => setSanitizationActive(!sanitizationActive)}
          className="px-2 py-1 text-xs rounded"
          style={{
            backgroundColor: sanitizationActive ? '#ef4444' : '#22c55e',
            color: '#ffffff',
            border: 'none'
          }}
          data-testid="sanitization-toggle"
        >
          {sanitizationActive ? 'Disable' : 'Enable'}
        </button>
        <button
          onClick={() => setSanitizationStats({
            totalInputs: 0,
            sanitizedInputs: 0,
            violationsFound: 0,
            lastSanitization: 0
          })}
          className="px-2 py-1 text-xs rounded"
          style={{
            backgroundColor: '#6b7280',
            color: '#ffffff',
            border: 'none'
          }}
          data-testid="clear-stats"
        >
          Clear Stats
        </button>
      </div>

      {/* Last Sanitization */}
      {sanitizationStats.lastSanitization > 0 && (
        <div className="last-sanitization mt-2 text-xs opacity-75" style={{ color: '#ffffff' }}>
          Last sanitization: {new Date(sanitizationStats.lastSanitization).toLocaleTimeString()}
        </div>
      )}

      {/* Wrapped Children */}
      <div className="sanitizer-content mt-2">
        {children}
      </div>
    </div>
  );
};

export default InputSanitizer;
