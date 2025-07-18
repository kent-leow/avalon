'use client';

import React, { useState, useEffect, useCallback } from 'react';
import type { SecurityBreach } from '~/types/security-validation';

/**
 * Secure Channel Component
 * Provides secure communication channels
 */

interface SecureChannelProps {
  children: React.ReactNode;
  encryptionLevel: 'basic' | 'standard' | 'high';
  onSecurityBreach?: (breach: SecurityBreach) => void;
  className?: string;
}

export const SecureChannel: React.FC<SecureChannelProps> = ({
  children,
  encryptionLevel,
  onSecurityBreach,
  className = ''
}) => {
  const [channelStatus, setChannelStatus] = useState<'secure' | 'compromised' | 'breached'>('secure');
  const [connectionHealth, setConnectionHealth] = useState(100);
  const [encryptionActive, setEncryptionActive] = useState(true);
  const [securityMetrics, setSecurityMetrics] = useState({
    totalConnections: 0,
    secureConnections: 0,
    breachAttempts: 0,
    lastSecurityCheck: Date.now()
  });

  // Monitor connection security
  const checkConnectionSecurity = useCallback(() => {
    const currentTime = Date.now();
    const timeSinceLastCheck = currentTime - securityMetrics.lastSecurityCheck;
    
    // Simulate security checks
    let health = connectionHealth;
    
    // Random security events for demo
    if (Math.random() < 0.05) { // 5% chance of security event
      health -= 10;
      setSecurityMetrics(prev => ({
        ...prev,
        breachAttempts: prev.breachAttempts + 1,
        lastSecurityCheck: currentTime
      }));
      
      if (health < 50) {
        setChannelStatus('compromised');
      }
      
      if (health < 20) {
        setChannelStatus('breached');
        
        const breach: SecurityBreach = {
          id: `breach_${currentTime}`,
          type: 'network',
          severity: 'high',
          playerId: 'unknown',
          timestamp: currentTime,
          details: 'Potential network security breach detected',
          mitigated: false
        };
        
        onSecurityBreach?.(breach);
      }
    } else {
      // Gradual health recovery
      health = Math.min(100, health + 1);
      if (health > 80) {
        setChannelStatus('secure');
      }
    }
    
    setConnectionHealth(health);
    setSecurityMetrics(prev => ({
      ...prev,
      totalConnections: prev.totalConnections + 1,
      secureConnections: prev.secureConnections + (health > 70 ? 1 : 0),
      lastSecurityCheck: currentTime
    }));
  }, [connectionHealth, securityMetrics.lastSecurityCheck, onSecurityBreach]);

  // Periodic security checks
  useEffect(() => {
    const interval = setInterval(checkConnectionSecurity, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, [checkConnectionSecurity]);

  // Get encryption level details
  const getEncryptionDetails = () => {
    switch (encryptionLevel) {
      case 'basic':
        return { strength: 'Basic', color: '#f59e0b', description: 'Standard encryption' };
      case 'standard':
        return { strength: 'Standard', color: '#3b82f6', description: 'Enhanced encryption' };
      case 'high':
        return { strength: 'High', color: '#22c55e', description: 'Military-grade encryption' };
      default:
        return { strength: 'Unknown', color: '#6b7280', description: 'Unknown encryption' };
    }
  };

  // Get status color
  const getStatusColor = (): string => {
    switch (channelStatus) {
      case 'secure': return '#22c55e'; // Green
      case 'compromised': return '#f59e0b'; // Yellow
      case 'breached': return '#ef4444'; // Red
      default: return '#6b7280'; // Gray
    }
  };

  const encryptionDetails = getEncryptionDetails();

  return (
    <div 
      className={`secure-channel ${className}`}
      data-testid="secure-channel"
    >
      {/* Channel Status */}
      <div 
        className="channel-status flex items-center space-x-2 text-sm"
        style={{ color: '#ffffff' }}
      >
        <div 
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: getStatusColor() }}
        />
        <span>Channel: {channelStatus.toUpperCase()}</span>
      </div>

      {/* Encryption Status */}
      <div 
        className="encryption-status flex items-center space-x-2 text-sm mt-1"
        style={{ color: '#ffffff' }}
      >
        <div 
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: encryptionActive ? encryptionDetails.color : '#6b7280' }}
        />
        <span>Encryption: {encryptionActive ? encryptionDetails.strength : 'Disabled'}</span>
      </div>

      {/* Connection Health */}
      <div className="connection-health mt-2">
        <div className="flex items-center justify-between text-xs" style={{ color: '#ffffff' }}>
          <span>Connection Health</span>
          <span>{connectionHealth}%</span>
        </div>
        <div 
          className="health-bar mt-1 h-2 rounded"
          style={{ backgroundColor: '#252547' }}
        >
          <div 
            className="health-fill h-full rounded transition-all duration-300"
            style={{ 
              width: `${connectionHealth}%`,
              backgroundColor: connectionHealth > 70 ? '#22c55e' : connectionHealth > 40 ? '#f59e0b' : '#ef4444'
            }}
          />
        </div>
      </div>

      {/* Security Metrics */}
      <div className="security-metrics mt-2 text-xs" style={{ color: '#ffffff' }}>
        <div className="flex items-center justify-between">
          <span>Total Connections:</span>
          <span>{securityMetrics.totalConnections}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Secure Connections:</span>
          <span>{securityMetrics.secureConnections}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Breach Attempts:</span>
          <span>{securityMetrics.breachAttempts}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Security Rate:</span>
          <span>
            {securityMetrics.totalConnections > 0 
              ? ((securityMetrics.secureConnections / securityMetrics.totalConnections) * 100).toFixed(1) + '%'
              : '100%'
            }
          </span>
        </div>
      </div>

      {/* Channel Status Details */}
      {channelStatus !== 'secure' && (
        <div 
          className="channel-warning mt-2 p-2 rounded"
          style={{
            backgroundColor: '#1a1a2e',
            border: `1px solid ${getStatusColor()}`,
            color: '#ffffff'
          }}
          data-testid="channel-warning"
        >
          <div className="text-xs font-medium">
            {channelStatus === 'compromised' && 'Channel Compromised'}
            {channelStatus === 'breached' && 'Security Breach Detected'}
          </div>
          <div className="text-xs opacity-75 mt-1">
            {channelStatus === 'compromised' && 'Connection security degraded. Enhanced monitoring active.'}
            {channelStatus === 'breached' && 'Potential security breach. Immediate attention required.'}
          </div>
        </div>
      )}

      {/* Encryption Details */}
      <div className="encryption-details mt-2 text-xs" style={{ color: '#ffffff' }}>
        <div className="flex items-center justify-between">
          <span>Encryption Level:</span>
          <span style={{ color: encryptionDetails.color }}>{encryptionDetails.strength}</span>
        </div>
        <div className="text-xs opacity-75">{encryptionDetails.description}</div>
      </div>

      {/* Controls */}
      <div className="channel-controls mt-2 flex space-x-2">
        <button
          onClick={() => setEncryptionActive(!encryptionActive)}
          className="px-2 py-1 text-xs rounded"
          style={{
            backgroundColor: encryptionActive ? '#ef4444' : '#22c55e',
            color: '#ffffff',
            border: 'none'
          }}
          data-testid="encryption-toggle"
        >
          {encryptionActive ? 'Disable Encryption' : 'Enable Encryption'}
        </button>
        <button
          onClick={() => {
            setConnectionHealth(100);
            setChannelStatus('secure');
            setSecurityMetrics(prev => ({
              ...prev,
              breachAttempts: 0
            }));
          }}
          className="px-2 py-1 text-xs rounded"
          style={{
            backgroundColor: '#6b7280',
            color: '#ffffff',
            border: 'none'
          }}
          data-testid="reset-security"
        >
          Reset Security
        </button>
      </div>

      {/* Last Security Check */}
      <div className="last-check mt-2 text-xs opacity-75" style={{ color: '#ffffff' }}>
        Last security check: {new Date(securityMetrics.lastSecurityCheck).toLocaleTimeString()}
      </div>

      {/* Secured Content */}
      <div className="secured-content mt-2">
        {children}
      </div>
    </div>
  );
};

export default SecureChannel;
