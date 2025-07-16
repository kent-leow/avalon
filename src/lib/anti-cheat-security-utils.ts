/**
 * Anti-Cheat Security Utility Functions
 * 
 * Comprehensive utility functions for security enforcement, session management,
 * behavioral monitoring, and data integrity protection.
 */

import { createHash, createHmac, randomBytes, createCipheriv, createDecipheriv } from 'crypto';
import type {
  SecureSession,
  SecurityViolation,
  BehavioralProfile,
  AuditLog,
  SecurityAlert,
  RateLimit,
  SecurityContext,
  SessionMetadata,
  BrowserInfo,
  DeviceInfo,
  LocationInfo,
  SecurityConfiguration,
  EncryptedRoleData,
  RoleRevealToken,
  DataIntegrityCheck,
  SecurityEvent,
  AnomalyDetection,
  SecurityLevel,
  SecurityThreatType,
  ValidationResult
} from '~/types/anti-cheat-security';

import {
  DEFAULT_SESSION_CONFIG,
  DEFAULT_ENCRYPTION_CONFIG,
  DEFAULT_MONITORING_CONFIG,
  DEFAULT_RATE_LIMIT_CONFIG,
  DEFAULT_AUDIT_CONFIG
} from '~/types/anti-cheat-security';

// Session Management Functions
export function generateDeviceFingerprint(browserInfo: BrowserInfo, deviceInfo: DeviceInfo): string {
  const fingerprintData = [
    browserInfo.name,
    browserInfo.version,
    browserInfo.platform,
    browserInfo.language,
    browserInfo.timezone,
    browserInfo.screenResolution,
    browserInfo.colorDepth.toString(),
    browserInfo.cookiesEnabled.toString(),
    browserInfo.javaEnabled.toString(),
    deviceInfo.type,
    deviceInfo.os,
    deviceInfo.hardware,
    deviceInfo.memory.toString(),
    deviceInfo.cores.toString(),
    deviceInfo.touchSupport.toString(),
    deviceInfo.orientation
  ].join('|');
  
  return createHash('sha256').update(fingerprintData).digest('hex');
}

export function generateSessionToken(playerId: string, roomCode: string): string {
  const timestamp = Date.now().toString();
  const randomData = randomBytes(32).toString('hex');
  const data = `${playerId}:${roomCode}:${timestamp}:${randomData}`;
  
  return createHash('sha256').update(data).digest('hex');
}

export function generateRefreshToken(sessionId: string): string {
  const timestamp = Date.now().toString();
  const randomData = randomBytes(32).toString('hex');
  const data = `${sessionId}:${timestamp}:${randomData}`;
  
  return createHash('sha256').update(data).digest('hex');
}

export function validateSessionToken(token: string, session: SecureSession): ValidationResult {
  if (!token || !session) {
    return 'invalid';
  }
  
  if (session.token !== token) {
    return 'invalid';
  }
  
  const now = Date.now();
  const expiresAt = new Date(session.expiresAt).getTime();
  
  if (now > expiresAt) {
    return 'invalid';
  }
  
  if (session.status === 'blocked' || session.status === 'revoked') {
    return 'blocked';
  }
  
  if (session.status === 'suspicious') {
    return 'suspicious';
  }
  
  return 'valid';
}

export function createSecureSession(
  playerId: string,
  roomCode: string,
  metadata: SessionMetadata
): SecureSession {
  const sessionId = generateSessionToken(playerId, roomCode);
  const token = generateSessionToken(playerId, roomCode);
  const refreshToken = generateRefreshToken(sessionId);
  const deviceFingerprint = generateDeviceFingerprint(metadata.browserInfo, metadata.deviceInfo);
  
  const now = new Date();
  const expiresAt = new Date(now.getTime() + DEFAULT_SESSION_CONFIG.tokenExpiry);
  
  return {
    id: sessionId,
    playerId,
    roomCode,
    token,
    refreshToken,
    deviceFingerprint,
    ipAddress: metadata.locationInfo?.country || 'unknown',
    userAgent: `${metadata.browserInfo.name}/${metadata.browserInfo.version}`,
    status: 'active',
    createdAt: now.toISOString(),
    lastActivity: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    securityLevel: 'medium',
    violations: [],
    metadata
  };
}

export function refreshSession(session: SecureSession): SecureSession {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + DEFAULT_SESSION_CONFIG.tokenExpiry);
  
  return {
    ...session,
    refreshToken: generateRefreshToken(session.id),
    lastActivity: now.toISOString(),
    expiresAt: expiresAt.toISOString()
  };
}

export function detectMultipleSessions(sessions: SecureSession[], playerId: string): boolean {
  const activeSessions = sessions.filter(
    s => s.playerId === playerId && s.status === 'active'
  );
  
  return activeSessions.length > DEFAULT_SESSION_CONFIG.maxSessions;
}

// Encryption and Data Protection Functions
export function encryptRoleData(roleData: any, sessionId: string): EncryptedRoleData {
  const algorithm = 'aes-256-gcm';
  const key = createHash('sha256').update(process.env.ENCRYPTION_KEY || 'default-key').digest();
  const iv = randomBytes(16);
  const cipher = createCipheriv(algorithm, key, iv);
  
  const jsonData = JSON.stringify(roleData);
  let encrypted = cipher.update(jsonData, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  const encryptedData = `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  
  const signature = createSignature(encryptedData, sessionId);
  const checksum = createHash('sha256').update(encryptedData).digest('hex');
  
  return {
    playerId: roleData.playerId || 'unknown',
    encryptedRole: encryptedData,
    encryptedKnowledge: encryptedData, // Same encryption for knowledge
    signature,
    timestamp: new Date().toISOString(),
    sessionId,
    checksum
  };
}

export function decryptRoleData(encryptedData: EncryptedRoleData): any {
  const algorithm = 'aes-256-gcm';
  const key = createHash('sha256').update(process.env.ENCRYPTION_KEY || 'default-key').digest();
  
  const parts = encryptedData.encryptedRole.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted data format');
  }
  
  const [ivHex, authTagHex, encrypted] = parts;
  
  if (!ivHex || !authTagHex || !encrypted) {
    throw new Error('Missing encryption components');
  }
  
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  
  const decipher = createDecipheriv(algorithm, key, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return JSON.parse(decrypted);
}

export function createSignature(data: string, sessionId: string): string {
  const key = createHash('sha256').update(process.env.SIGNING_KEY || 'default-signing-key').digest();
  const message = `${data}:${sessionId}`;
  
  return createHmac('sha256', key).update(message).digest('hex');
}

export function verifySignature(data: string, signature: string, sessionId: string): boolean {
  const expectedSignature = createSignature(data, sessionId);
  return expectedSignature === signature;
}

export function createDataIntegrityCheck(data: any, dataType: string): DataIntegrityCheck {
  const jsonData = JSON.stringify(data);
  const checksum = createHash('sha256').update(jsonData).digest('hex');
  const signature = createSignature(jsonData, 'integrity-check');
  
  return {
    id: randomBytes(16).toString('hex'),
    dataType,
    checksum,
    signature,
    timestamp: new Date().toISOString(),
    valid: true,
    violations: []
  };
}

export function verifyDataIntegrity(data: any, integrityCheck: DataIntegrityCheck): boolean {
  const jsonData = JSON.stringify(data);
  const checksum = createHash('sha256').update(jsonData).digest('hex');
  
  return checksum === integrityCheck.checksum;
}

// Rate Limiting Functions
export function createRateLimit(key: string, limit: number, windowMs: number): RateLimit {
  const resetTime = new Date(Date.now() + windowMs).toISOString();
  
  return {
    id: randomBytes(16).toString('hex'),
    key,
    limit,
    window: windowMs,
    current: 0,
    resetTime,
    blocked: false,
    violations: []
  };
}

export function checkRateLimit(rateLimit: RateLimit): ValidationResult {
  const now = Date.now();
  const resetTime = new Date(rateLimit.resetTime).getTime();
  
  // Reset if window has passed
  if (now > resetTime) {
    rateLimit.current = 0;
    rateLimit.resetTime = new Date(now + rateLimit.window).toISOString();
    rateLimit.blocked = false;
  }
  
  // Check if blocked
  if (rateLimit.blocked) {
    return 'blocked';
  }
  
  // Check if limit exceeded
  if (rateLimit.current >= rateLimit.limit) {
    rateLimit.blocked = true;
    return 'blocked';
  }
  
  // Increment counter
  rateLimit.current++;
  
  return 'valid';
}

export function resetRateLimit(rateLimit: RateLimit): RateLimit {
  return {
    ...rateLimit,
    current: 0,
    blocked: false,
    resetTime: new Date(Date.now() + rateLimit.window).toISOString()
  };
}

// Behavioral Analysis Functions
export function analyzeBehavioralPattern(actions: AuditLog[]): BehavioralProfile {
  const playerId = actions[0]?.playerId || 'unknown';
  const sessionId = actions[0]?.sessionId || 'unknown';
  
  const actionPatterns = analyzeActionPatterns(actions);
  const timingPatterns = analyzeTimingPatterns(actions);
  const anomalies = detectAnomalies(actions);
  
  const riskScore = calculateRiskScore(actionPatterns, timingPatterns, anomalies);
  const confidence = calculateConfidence(actions.length, timingPatterns);
  
  return {
    playerId,
    sessionId,
    actions: actionPatterns,
    timingPatterns,
    anomalies,
    riskScore,
    confidence,
    lastUpdated: new Date().toISOString()
  };
}

function analyzeActionPatterns(actions: AuditLog[]) {
  const patterns: Record<string, any> = {};
  
  actions.forEach(action => {
    if (!patterns[action.action]) {
      patterns[action.action] = {
        actionType: action.action,
        frequency: 0,
        durations: [],
        timestamps: [],
        sequence: [],
        metadata: {}
      };
    }
    
    patterns[action.action].frequency++;
    patterns[action.action].durations.push(action.duration);
    patterns[action.action].timestamps.push(action.timestamp);
    patterns[action.action].sequence.push(action.action);
  });
  
  return Object.values(patterns).map(pattern => ({
    actionType: pattern.actionType,
    frequency: pattern.frequency,
    avgDuration: pattern.durations.reduce((a: number, b: number) => a + b, 0) / pattern.durations.length,
    variance: calculateVariance(pattern.durations),
    sequence: pattern.sequence,
    timestamps: pattern.timestamps,
    metadata: pattern.metadata
  }));
}

function analyzeTimingPatterns(actions: AuditLog[]) {
  const intervals: number[] = [];
  
  for (let i = 1; i < actions.length; i++) {
    const prevAction = actions[i - 1];
    const currAction = actions[i];
    
    if (prevAction && currAction) {
      const prev = new Date(prevAction.timestamp).getTime();
      const curr = new Date(currAction.timestamp).getTime();
      intervals.push(curr - prev);
    }
  }
  
  if (intervals.length === 0) {
    return [{
      pattern: 'action-intervals',
      description: 'No timing patterns available',
      frequency: 0,
      avgInterval: 0,
      deviation: 0,
      confidence: 0,
      suspicious: false
    }];
  }
  
  const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  const deviation = Math.sqrt(calculateVariance(intervals));
  
  return [{
    pattern: 'action-intervals',
    description: 'Time intervals between actions',
    frequency: intervals.length,
    avgInterval,
    deviation,
    confidence: intervals.length > 10 ? 0.8 : 0.5,
    suspicious: deviation < 100 && avgInterval < 1000 // Very consistent timing
  }];
}

function detectAnomalies(actions: AuditLog[]): AnomalyDetection[] {
  const anomalies: AnomalyDetection[] = [];
  
  // Check for rapid-fire actions
  const rapidActions = actions.filter((action, index) => {
    if (index === 0) return false;
    
    const prevAction = actions[index - 1];
    if (!prevAction) return false;
    
    const prevTime = new Date(prevAction.timestamp).getTime();
    const currTime = new Date(action.timestamp).getTime();
    return currTime - prevTime < 100; // Less than 100ms
  });
  
  if (rapidActions.length > 3) {
    anomalies.push({
      id: randomBytes(16).toString('hex'),
      type: 'timing',
      description: 'Rapid-fire actions detected',
      severity: 'high',
      confidence: 0.9,
      timestamp: new Date().toISOString(),
      evidence: { rapidActions: rapidActions.length },
      falsePositive: false
    });
  }
  
  // Check for identical timing patterns
  const intervals = actions.slice(1).map((action, index) => {
    const prevAction = actions[index];
    if (!prevAction) return 0;
    
    const prevTime = new Date(prevAction.timestamp).getTime();
    const currTime = new Date(action.timestamp).getTime();
    return currTime - prevTime;
  }).filter(interval => interval > 0);
  
  const uniqueIntervals = new Set(intervals);
  if (intervals.length > 5 && uniqueIntervals.size < 3) {
    anomalies.push({
      id: randomBytes(16).toString('hex'),
      type: 'pattern',
      description: 'Identical timing patterns detected',
      severity: 'medium',
      confidence: 0.7,
      timestamp: new Date().toISOString(),
      evidence: { intervals, uniqueIntervals: uniqueIntervals.size },
      falsePositive: false
    });
  }
  
  return anomalies;
}

function calculateRiskScore(actionPatterns: any[], timingPatterns: any[], anomalies: AnomalyDetection[]): number {
  let score = 0;
  
  // Analyze action patterns
  actionPatterns.forEach(pattern => {
    if (pattern.variance < 50) score += 20; // Very consistent timing
    if (pattern.frequency > 100) score += 10; // High frequency
  });
  
  // Analyze timing patterns
  timingPatterns.forEach(pattern => {
    if (pattern.suspicious) score += 30;
  });
  
  // Analyze anomalies
  anomalies.forEach(anomaly => {
    switch (anomaly.severity) {
      case 'critical': score += 40; break;
      case 'high': score += 30; break;
      case 'medium': score += 20; break;
      case 'low': score += 10; break;
    }
  });
  
  return Math.min(score, 100);
}

function calculateConfidence(actionCount: number, timingPatterns: any[]): number {
  let confidence = Math.min(actionCount / 20, 1); // More actions = higher confidence
  
  timingPatterns.forEach(pattern => {
    confidence = Math.max(confidence, pattern.confidence);
  });
  
  return confidence;
}

function calculateVariance(numbers: number[]): number {
  const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
  const variance = numbers.reduce((sum, num) => sum + Math.pow(num - mean, 2), 0) / numbers.length;
  return variance;
}

// Audit Logging Functions
export function createAuditLog(
  sessionId: string,
  playerId: string,
  roomCode: string,
  action: string,
  details: Record<string, any>,
  ipAddress: string,
  userAgent: string,
  success: boolean,
  duration: number
): AuditLog {
  return {
    id: randomBytes(16).toString('hex'),
    timestamp: new Date().toISOString(),
    sessionId,
    playerId,
    roomCode,
    action: action as any,
    details,
    ipAddress,
    userAgent,
    success,
    duration,
    metadata: {
      securityLevel: 'medium',
      validated: true,
      encrypted: false,
      riskScore: 0,
      relatedActions: [],
      deviceFingerprint: '',
      geolocation: undefined
    }
  };
}

export function createSecurityAlert(
  type: SecurityThreatType,
  severity: SecurityLevel,
  title: string,
  description: string,
  evidence: Record<string, any>,
  playerId?: string,
  sessionId?: string,
  roomCode?: string
): SecurityAlert {
  return {
    id: randomBytes(16).toString('hex'),
    type,
    severity,
    title,
    description,
    timestamp: new Date().toISOString(),
    playerId,
    sessionId,
    roomCode,
    evidence,
    status: 'new',
    metadata: {
      source: 'automated',
      confidence: 0.8,
      impact: severity,
      urgency: severity,
      category: 'security',
      tags: [type],
      relatedAlerts: [],
      escalationLevel: 0
    }
  };
}

// Security Validation Functions
export function validateSecurityContext(context: SecurityContext): ValidationResult {
  // Check session validity
  const sessionValid = validateSessionToken(context.session.token, context.session);
  if (sessionValid !== 'valid') {
    return sessionValid;
  }
  
  // Check for critical violations
  const criticalViolations = context.violations.filter(v => v.severity === 'critical');
  if (criticalViolations.length > 0) {
    return 'blocked';
  }
  
  // Check behavioral risk score
  if (context.behavioralProfile.riskScore > 80) {
    return 'suspicious';
  }
  
  // Check rate limits
  const rateLimitResult = checkRateLimit(context.rateLimit);
  if (rateLimitResult !== 'valid') {
    return rateLimitResult;
  }
  
  return 'valid';
}

export function createSecurityViolation(
  type: SecurityThreatType,
  severity: SecurityLevel,
  description: string,
  evidence: Record<string, any>
): SecurityViolation {
  return {
    id: randomBytes(16).toString('hex'),
    type,
    severity,
    description,
    timestamp: new Date().toISOString(),
    evidence,
    automated: true,
    resolved: false,
    actions: [],
    metadata: {
      detectionMethod: 'automated',
      confidence: 0.8,
      relatedViolations: [],
      riskScore: severity === 'critical' ? 100 : severity === 'high' ? 75 : 50,
      impactLevel: severity,
      recommendedAction: 'monitor'
    }
  };
}

export function processSecurityEvent(event: SecurityEvent): SecurityAlert[] {
  const alerts: SecurityAlert[] = [];
  
  // Process different event types
  switch (event.type) {
    case 'session-validation':
      if (event.data.multiple_sessions) {
        alerts.push(createSecurityAlert(
          'multiple-sessions',
          'high',
          'Multiple Sessions Detected',
          'Player has multiple active sessions',
          event.data,
          event.playerId,
          event.sessionId,
          event.roomCode
        ));
      }
      break;
      
    case 'anomaly-detection':
      if (event.data.anomalies?.length > 0) {
        alerts.push(createSecurityAlert(
          'anomalous-behavior',
          event.severity,
          'Anomalous Behavior Detected',
          'Unusual behavioral patterns detected',
          event.data,
          event.playerId,
          event.sessionId,
          event.roomCode
        ));
      }
      break;
      
    case 'data-integrity':
      if (!event.data.valid) {
        alerts.push(createSecurityAlert(
          'client-manipulation',
          'critical',
          'Data Integrity Violation',
          'Data integrity check failed',
          event.data,
          event.playerId,
          event.sessionId,
          event.roomCode
        ));
      }
      break;
  }
  
  return alerts;
}

// Configuration and Initialization
export function createDefaultSecurityConfiguration(): SecurityConfiguration {
  return {
    sessionConfig: DEFAULT_SESSION_CONFIG,
    encryptionConfig: DEFAULT_ENCRYPTION_CONFIG,
    monitoringConfig: DEFAULT_MONITORING_CONFIG,
    rateLimitConfig: DEFAULT_RATE_LIMIT_CONFIG,
    auditConfig: DEFAULT_AUDIT_CONFIG
  };
}

export function initializeSecurityContext(
  session: SecureSession,
  configuration: SecurityConfiguration
): SecurityContext {
  return {
    session,
    behavioralProfile: {
      playerId: session.playerId,
      sessionId: session.id,
      actions: [],
      timingPatterns: [],
      anomalies: [],
      riskScore: 0,
      confidence: 0,
      lastUpdated: new Date().toISOString()
    },
    rateLimit: createRateLimit(session.playerId, 100, 60000),
    violations: [],
    alerts: [],
    auditTrail: [],
    integrityChecks: [],
    configuration
  };
}

// Utility Functions
export function isSecurityThreatCritical(threat: SecurityThreatType): boolean {
  const criticalThreats: SecurityThreatType[] = [
    'client-manipulation',
    'session-hijacking',
    'information-sharing'
  ];
  
  return criticalThreats.includes(threat);
}

export function calculateSecurityScore(context: SecurityContext): number {
  let score = 100;
  
  // Deduct for violations
  context.violations.forEach(violation => {
    switch (violation.severity) {
      case 'critical': score -= 50; break;
      case 'high': score -= 30; break;
      case 'medium': score -= 20; break;
      case 'low': score -= 10; break;
    }
  });
  
  // Deduct for behavioral risk
  score -= context.behavioralProfile.riskScore * 0.5;
  
  // Deduct for rate limit violations
  score -= context.rateLimit.violations.length * 5;
  
  return Math.max(score, 0);
}

export function shouldBlockUser(context: SecurityContext): boolean {
  const securityScore = calculateSecurityScore(context);
  const criticalViolations = context.violations.filter(v => v.severity === 'critical');
  
  return securityScore < 30 || criticalViolations.length > 0;
}

export function generateSecurityReport(context: SecurityContext): string {
  const securityScore = calculateSecurityScore(context);
  const violations = context.violations.length;
  const alerts = context.alerts.length;
  const riskScore = context.behavioralProfile.riskScore;
  
  return `Security Report for ${context.session.playerId}:
Security Score: ${securityScore}/100
Violations: ${violations}
Active Alerts: ${alerts}
Behavioral Risk: ${riskScore}/100
Session Status: ${context.session.status}
Last Activity: ${context.session.lastActivity}`;
}
