/**
 * Security Status Component
 * 
 * Displays security status, alerts, and monitoring information for players.
 * Part of the anti-cheat security system.
 */

import React, { useState, useEffect } from 'react';

interface SecurityStatusProps {
  playerId: string;
  roomCode: string;
  sessionId?: string;
  onSecurityEvent?: (event: any) => void;
}

interface SecurityAlert {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  timestamp: string;
  status: 'new' | 'investigating' | 'resolved' | 'dismissed';
}

interface SecuritySession {
  id: string;
  status: 'active' | 'suspicious' | 'blocked' | 'revoked';
  securityLevel: 'low' | 'medium' | 'high' | 'critical';
  lastActivity: string;
  expiresAt: string;
}

const SecurityStatusComponent: React.FC<SecurityStatusProps> = ({
  playerId,
  roomCode,
  sessionId,
  onSecurityEvent
}) => {
  const [securityStatus, setSecurityStatus] = useState<'secure' | 'warning' | 'danger'>('secure');
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [session, setSession] = useState<SecuritySession | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);

  // Initialize security monitoring
  useEffect(() => {
    if (sessionId) {
      initializeSecurityMonitoring();
    }
  }, [sessionId]);

  const initializeSecurityMonitoring = () => {
    setIsMonitoring(true);
    
    // Simulate session validation
    setSession({
      id: sessionId || 'unknown',
      status: 'active',
      securityLevel: 'medium',
      lastActivity: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutes
    });

    // Start monitoring behavioral patterns
    startBehavioralMonitoring();
  };

  const startBehavioralMonitoring = () => {
    // Monitor user actions and detect anomalies
    const monitoringInterval = setInterval(() => {
      checkForAnomalies();
    }, 5000); // Check every 5 seconds

    // Cleanup on unmount
    return () => clearInterval(monitoringInterval);
  };

  const checkForAnomalies = () => {
    // Simulate anomaly detection
    const randomCheck = Math.random();
    
    if (randomCheck < 0.1) { // 10% chance of generating an alert
      const alertTypes = [
        { type: 'rapid-actions', severity: 'medium' as const, title: 'Rapid Actions Detected' },
        { type: 'timing-anomaly', severity: 'low' as const, title: 'Unusual Timing Pattern' },
        { type: 'multiple-sessions', severity: 'high' as const, title: 'Multiple Sessions' },
        { type: 'suspicious-behavior', severity: 'medium' as const, title: 'Suspicious Behavior' },
        { type: 'data-integrity', severity: 'critical' as const, title: 'Data Integrity Issue' }
      ];
      
      const alertType = alertTypes[Math.floor(Math.random() * alertTypes.length)];
      
      if (alertType) {
        const newAlert: SecurityAlert = {
          id: `alert-${Date.now()}`,
          type: alertType.type,
          severity: alertType.severity,
          title: alertType.title,
          description: `Security monitoring detected ${alertType.title.toLowerCase()} for player ${playerId}`,
          timestamp: new Date().toISOString(),
          status: 'new'
        };
        
        setAlerts(prev => [newAlert, ...prev.slice(0, 4)]); // Keep last 5 alerts
        
        // Update security status based on alert severity
        if (alertType.severity === 'high' || alertType.severity === 'critical') {
          setSecurityStatus('danger');
        } else if (alertType.severity === 'medium') {
          setSecurityStatus('warning');
        }
        
        // Notify parent component
        onSecurityEvent?.(newAlert);
      }
    }
  };

  const getSecurityStatusColor = () => {
    switch (securityStatus) {
      case 'secure':
        return 'text-green-600 bg-green-50';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50';
      case 'danger':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600 bg-red-50';
      case 'high':
        return 'text-orange-600 bg-orange-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'low':
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString();
  };

  const dismissAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  return (
    <div className="space-y-4 p-4">
      {/* Security Status Card */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            🛡️ Security Status
          </h3>
          <span className={`px-2 py-1 rounded text-sm font-medium ${getSecurityStatusColor()}`}>
            {securityStatus.toUpperCase()}
          </span>
        </div>
        
        {session && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-500">⏰</span>
              <span>Last Activity: {formatTime(session.lastActivity)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">🔒</span>
              <span>Security Level: {session.securityLevel}</span>
            </div>
          </div>
        )}
        
        {isMonitoring && (
          <div className="mt-3 flex items-center gap-2 text-sm text-green-600">
            <span>👁️</span>
            <span>Real-time monitoring active</span>
          </div>
        )}
      </div>

      {/* Security Alerts */}
      {alerts.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            ⚠️ Security Alerts ({alerts.length})
          </h3>
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div key={alert.id} className="bg-gray-50 rounded-lg p-3 relative">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{alert.title}</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                      {alert.severity}
                    </span>
                  </div>
                  <button
                    onClick={() => dismissAlert(alert.id)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
                <div className="text-xs text-gray-500 mt-2">
                  {formatTime(alert.timestamp)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Session Information */}
      {session && (
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            🔐 Session Information
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Session ID:</span>
              <div className="text-gray-600 font-mono text-xs">
                {session.id.substring(0, 8)}...
              </div>
            </div>
            <div>
              <span className="font-medium">Status:</span>
              <div className="text-gray-600 capitalize">{session.status}</div>
            </div>
            <div>
              <span className="font-medium">Security Level:</span>
              <div className="text-gray-600 capitalize">{session.securityLevel}</div>
            </div>
            <div>
              <span className="font-medium">Expires:</span>
              <div className="text-gray-600">{formatTime(session.expiresAt)}</div>
            </div>
          </div>
        </div>
      )}

      {/* Debug Information (Development Only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-gray-100 rounded-lg border p-4">
          <h3 className="text-sm font-semibold mb-2">Debug Information</h3>
          <div className="text-xs text-gray-600 space-y-1">
            <div>Player ID: {playerId}</div>
            <div>Room Code: {roomCode}</div>
            <div>Session ID: {sessionId || 'Not set'}</div>
            <div>Monitoring: {isMonitoring ? 'Active' : 'Inactive'}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecurityStatusComponent;
