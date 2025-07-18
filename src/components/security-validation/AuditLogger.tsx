'use client';

import React, { useState, useEffect, useCallback } from 'react';
import type { 
  SecurityEvent, 
  AuditLog 
} from '~/types/security-validation';

/**
 * Audit Logger Component
 * Logs security events and violations
 */

interface AuditLoggerProps {
  events: SecurityEvent[];
  logLevel: 'info' | 'warning' | 'error';
  onLogComplete?: (log: AuditLog) => void;
  className?: string;
}

export const AuditLogger: React.FC<AuditLoggerProps> = ({
  events,
  logLevel,
  onLogComplete,
  className = ''
}) => {
  const [loggerActive, setLoggerActive] = useState(true);
  const [logBuffer, setLogBuffer] = useState<SecurityEvent[]>([]);
  const [logStats, setLogStats] = useState({
    totalEvents: 0,
    infoEvents: 0,
    warningEvents: 0,
    errorEvents: 0,
    lastLogTime: Date.now()
  });

  // Process events based on log level
  const processEvents = useCallback(() => {
    if (!loggerActive) return;

    const filteredEvents = events.filter(event => {
      switch (logLevel) {
        case 'error':
          return event.outcome === 'blocked' || event.type === 'breach';
        case 'warning':
          return event.outcome === 'blocked' || event.outcome === 'flagged' || event.type === 'violation';
        case 'info':
        default:
          return true;
      }
    });

    // Add new events to buffer
    const newEvents = filteredEvents.filter(event => 
      !logBuffer.some(bufferedEvent => bufferedEvent.id === event.id)
    );

    if (newEvents.length > 0) {
      setLogBuffer(prev => [...prev, ...newEvents]);
      
      // Update statistics
      setLogStats(prev => ({
        totalEvents: prev.totalEvents + newEvents.length,
        infoEvents: prev.infoEvents + newEvents.filter(e => e.type === 'action').length,
        warningEvents: prev.warningEvents + newEvents.filter(e => e.type === 'violation').length,
        errorEvents: prev.errorEvents + newEvents.filter(e => e.type === 'breach').length,
        lastLogTime: Date.now()
      }));
    }
  }, [events, logLevel, loggerActive, logBuffer]);

  // Generate audit log
  const generateAuditLog = useCallback(() => {
    if (logBuffer.length === 0) return;

    const auditLog: AuditLog = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      events: [...logBuffer],
      timestamp: Date.now(),
      playerId: logBuffer[0]?.playerId || 'system',
      roomCode: logBuffer[0]?.roomCode || 'unknown',
      summary: `Audit log with ${logBuffer.length} events`
    };

    onLogComplete?.(auditLog);
    return auditLog;
  }, [logBuffer, onLogComplete]);

  // Auto-process events
  useEffect(() => {
    processEvents();
  }, [processEvents]);

  // Periodic log generation
  useEffect(() => {
    if (loggerActive) {
      const interval = setInterval(() => {
        if (logBuffer.length > 0) {
          generateAuditLog();
        }
      }, 60000); // Generate logs every minute

      return () => clearInterval(interval);
    }
  }, [loggerActive, generateAuditLog, logBuffer.length]);

  // Get log level color
  const getLogLevelColor = (): string => {
    switch (logLevel) {
      case 'error': return '#ef4444'; // Red
      case 'warning': return '#f59e0b'; // Yellow
      case 'info': return '#3b82f6'; // Blue
      default: return '#6b7280'; // Gray
    }
  };

  const getEventTypeColor = (eventType: string): string => {
    switch (eventType) {
      case 'breach': return '#dc2626'; // Dark Red
      case 'violation': return '#ef4444'; // Red
      case 'action': return '#22c55e'; // Green
      case 'login': return '#3b82f6'; // Blue
      case 'logout': return '#6b7280'; // Gray
      default: return '#8b5cf6'; // Purple
    }
  };

  const getEventIcon = (eventType: string): string => {
    switch (eventType) {
      case 'breach': return '🚨';
      case 'violation': return '⚠️';
      case 'action': return '✅';
      case 'login': return '🔐';
      case 'logout': return '🔓';
      default: return '📝';
    }
  };

  return (
    <div 
      className={`audit-logger ${className}`}
      data-testid="audit-logger"
    >
      {/* Logger Status */}
      <div 
        className="logger-status flex items-center space-x-2 text-sm"
        style={{ color: '#ffffff' }}
      >
        <div 
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: loggerActive ? '#22c55e' : '#6b7280' }}
        />
        <span>Audit Logger: {loggerActive ? 'Active' : 'Inactive'}</span>
      </div>

      {/* Log Level */}
      <div 
        className="log-level flex items-center space-x-2 text-sm mt-1"
        style={{ color: '#ffffff' }}
      >
        <div 
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: getLogLevelColor() }}
        />
        <span>Log Level: {logLevel.toUpperCase()}</span>
      </div>

      {/* Log Statistics */}
      <div className="log-stats mt-2 text-xs" style={{ color: '#ffffff' }}>
        <div className="flex items-center justify-between">
          <span>Total Events:</span>
          <span>{logStats.totalEvents}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Info Events:</span>
          <span>{logStats.infoEvents}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Warning Events:</span>
          <span>{logStats.warningEvents}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Error Events:</span>
          <span>{logStats.errorEvents}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Buffer Size:</span>
          <span>{logBuffer.length}</span>
        </div>
      </div>

      {/* Recent Events */}
      {logBuffer.length > 0 && (
        <div className="recent-events mt-2">
          <div className="text-xs font-medium mb-1" style={{ color: '#ffffff' }}>
            Recent Events ({logBuffer.length})
          </div>
          <div className="max-h-32 overflow-y-auto space-y-1">
            {logBuffer.slice(-5).map((event, index) => (
              <div
                key={event.id}
                className="event-log p-2 rounded text-xs"
                style={{
                  backgroundColor: '#1a1a2e',
                  border: `1px solid ${getEventTypeColor(event.type)}`,
                  color: '#ffffff'
                }}
                data-testid={`event-log-${index}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span>{getEventIcon(event.type)}</span>
                    <span className="font-medium">{event.type.toUpperCase()}</span>
                  </div>
                  <span className="text-xs opacity-75">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="text-xs opacity-75 mt-1">
                  Player: {event.playerId} • Outcome: {event.outcome}
                </div>
                {event.details && (
                  <div className="text-xs opacity-50 mt-1">
                    {typeof event.details === 'string' 
                      ? event.details 
                      : JSON.stringify(event.details).slice(0, 50) + '...'
                    }
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Buffer Warning */}
      {logBuffer.length > 100 && (
        <div 
          className="buffer-warning mt-2 p-2 rounded"
          style={{
            backgroundColor: '#1a1a2e',
            border: '1px solid #f59e0b',
            color: '#ffffff'
          }}
          data-testid="buffer-warning"
        >
          <div className="text-xs font-medium">Log Buffer Warning</div>
          <div className="text-xs opacity-75">
            Buffer is getting full ({logBuffer.length} events). Consider generating audit log.
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="logger-controls mt-2 flex space-x-2">
        <button
          onClick={() => setLoggerActive(!loggerActive)}
          className="px-2 py-1 text-xs rounded"
          style={{
            backgroundColor: loggerActive ? '#ef4444' : '#22c55e',
            color: '#ffffff',
            border: 'none'
          }}
          data-testid="logger-toggle"
        >
          {loggerActive ? 'Disable' : 'Enable'}
        </button>
        <button
          onClick={() => {
            generateAuditLog();
            setLogBuffer([]);
          }}
          className="px-2 py-1 text-xs rounded"
          style={{
            backgroundColor: '#3b82f6',
            color: '#ffffff',
            border: 'none'
          }}
          data-testid="generate-log"
        >
          Generate Log
        </button>
        <button
          onClick={() => {
            setLogBuffer([]);
            setLogStats(prev => ({
              ...prev,
              totalEvents: 0,
              infoEvents: 0,
              warningEvents: 0,
              errorEvents: 0
            }));
          }}
          className="px-2 py-1 text-xs rounded"
          style={{
            backgroundColor: '#6b7280',
            color: '#ffffff',
            border: 'none'
          }}
          data-testid="clear-buffer"
        >
          Clear Buffer
        </button>
      </div>

      {/* Last Log Time */}
      <div className="last-log-time mt-2 text-xs opacity-75" style={{ color: '#ffffff' }}>
        Last log: {new Date(logStats.lastLogTime).toLocaleTimeString()}
      </div>
    </div>
  );
};

export default AuditLogger;
