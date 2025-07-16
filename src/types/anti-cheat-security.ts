/**
 * Anti-Cheat and Security Measures Types
 * 
 * Comprehensive type definitions for security enforcement, session management,
 * behavioral monitoring, and data integrity protection.
 */

export type SecurityLevel = 'low' | 'medium' | 'high' | 'critical';

export type SessionStatus = 
  | 'active'
  | 'expired'
  | 'revoked'
  | 'suspicious'
  | 'blocked'
  | 'terminated';

export type SecurityThreatType = 
  | 'multiple-sessions'
  | 'bot-behavior'
  | 'information-sharing'
  | 'client-manipulation'
  | 'timing-attack'
  | 'coordination-pattern'
  | 'anomalous-behavior'
  | 'session-hijacking'
  | 'rate-limit-violation';

export type AuditActionType = 
  | 'join-room'
  | 'leave-room'
  | 'submit-vote'
  | 'propose-team'
  | 'view-role'
  | 'send-message'
  | 'heartbeat'
  | 'reconnect'
  | 'settings-change'
  | 'security-violation';

export type MonitoringEventType = 
  | 'action-timing'
  | 'pattern-detection'
  | 'anomaly-detection'
  | 'session-validation'
  | 'data-integrity'
  | 'threat-detection';

export type ValidationResult = 
  | 'valid'
  | 'invalid'
  | 'suspicious'
  | 'blocked'
  | 'requires-verification';

// Session Management Types
export interface SecureSession {
  id: string;
  playerId: string;
  roomCode: string;
  token: string;
  refreshToken: string;
  deviceFingerprint: string;
  ipAddress: string;
  userAgent: string;
  status: SessionStatus;
  createdAt: string;
  lastActivity: string;
  expiresAt: string;
  securityLevel: SecurityLevel;
  violations: SecurityViolation[];
  metadata: SessionMetadata;
}

export interface SessionMetadata {
  browserInfo: BrowserInfo;
  deviceInfo: DeviceInfo;
  locationInfo: LocationInfo;
  securityFlags: SecurityFlags;
  performanceMetrics: PerformanceMetrics;
}

export interface BrowserInfo {
  name: string;
  version: string;
  platform: string;
  language: string;
  timezone: string;
  screenResolution: string;
  colorDepth: number;
  cookiesEnabled: boolean;
  javaEnabled: boolean;
}

export interface DeviceInfo {
  type: 'desktop' | 'mobile' | 'tablet';
  os: string;
  hardware: string;
  memory: number;
  cores: number;
  touchSupport: boolean;
  orientation: string;
}

export interface LocationInfo {
  country: string;
  region: string;
  timezone: string;
  ip: string;
  vpnDetected: boolean;
  proxyDetected: boolean;
}

export interface SecurityFlags {
  isNewDevice: boolean;
  hasMultipleSessions: boolean;
  suspiciousActivity: boolean;
  rateLimit: boolean;
  dataIntegrityIssues: boolean;
  botLikeActivity: boolean;
}

export interface PerformanceMetrics {
  avgResponseTime: number;
  actionFrequency: number;
  sessionDuration: number;
  heartbeatLatency: number;
  reconnectionCount: number;
  errorCount: number;
}

// Security Violation Types
export interface SecurityViolation {
  id: string;
  type: SecurityThreatType;
  severity: SecurityLevel;
  description: string;
  timestamp: string;
  evidence: Record<string, any>;
  automated: boolean;
  resolved: boolean;
  actions: SecurityAction[];
  metadata: ViolationMetadata;
}

export interface ViolationMetadata {
  detectionMethod: string;
  confidence: number;
  relatedViolations: string[];
  riskScore: number;
  impactLevel: SecurityLevel;
  recommendedAction: string;
}

export interface SecurityAction {
  id: string;
  type: 'warning' | 'block' | 'terminate' | 'monitor' | 'verify';
  description: string;
  timestamp: string;
  automated: boolean;
  successful: boolean;
  duration?: number;
  metadata: Record<string, any>;
}

// Role Information Protection
export interface EncryptedRoleData {
  playerId: string;
  encryptedRole: string;
  encryptedKnowledge: string;
  signature: string;
  timestamp: string;
  sessionId: string;
  checksum: string;
}

export interface RoleRevealToken {
  token: string;
  playerId: string;
  roleData: EncryptedRoleData;
  expiresAt: string;
  singleUse: boolean;
  used: boolean;
  metadata: RoleTokenMetadata;
}

export interface RoleTokenMetadata {
  gamePhase: string;
  revealReason: string;
  securityLevel: SecurityLevel;
  validationRequired: boolean;
  restrictions: RoleRestrictions;
}

export interface RoleRestrictions {
  timeWindow: number;
  ipRestriction: boolean;
  sessionRestriction: boolean;
  deviceRestriction: boolean;
  locationRestriction: boolean;
}

// Behavioral Monitoring
export interface BehavioralProfile {
  playerId: string;
  sessionId: string;
  actions: ActionPattern[];
  timingPatterns: TimingPattern[];
  anomalies: AnomalyDetection[];
  riskScore: number;
  confidence: number;
  lastUpdated: string;
}

export interface ActionPattern {
  actionType: AuditActionType;
  frequency: number;
  avgDuration: number;
  variance: number;
  sequence: string[];
  timestamps: string[];
  metadata: Record<string, any>;
}

export interface TimingPattern {
  pattern: string;
  description: string;
  frequency: number;
  avgInterval: number;
  deviation: number;
  confidence: number;
  suspicious: boolean;
}

export interface AnomalyDetection {
  id: string;
  type: 'timing' | 'frequency' | 'sequence' | 'pattern';
  description: string;
  severity: SecurityLevel;
  confidence: number;
  timestamp: string;
  evidence: Record<string, any>;
  falsePositive: boolean;
}

// Data Integrity
export interface DataIntegrityCheck {
  id: string;
  dataType: string;
  checksum: string;
  signature: string;
  timestamp: string;
  valid: boolean;
  violations: IntegrityViolation[];
}

export interface IntegrityViolation {
  id: string;
  type: 'checksum-mismatch' | 'signature-invalid' | 'data-corruption' | 'unauthorized-modification';
  description: string;
  severity: SecurityLevel;
  timestamp: string;
  evidence: Record<string, any>;
  remediation: string;
}

// Audit Logging
export interface AuditLog {
  id: string;
  timestamp: string;
  sessionId: string;
  playerId: string;
  roomCode: string;
  action: AuditActionType;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  duration: number;
  metadata: AuditMetadata;
}

export interface AuditMetadata {
  securityLevel: SecurityLevel;
  validated: boolean;
  encrypted: boolean;
  riskScore: number;
  relatedActions: string[];
  deviceFingerprint: string;
  geolocation?: LocationInfo;
}

// Monitoring and Alerting
export interface SecurityMonitor {
  id: string;
  name: string;
  type: MonitoringEventType;
  enabled: boolean;
  threshold: MonitoringThreshold;
  actions: MonitoringAction[];
  metadata: MonitoringMetadata;
}

export interface MonitoringThreshold {
  value: number;
  period: number;
  unit: 'seconds' | 'minutes' | 'hours' | 'actions' | 'events';
  operator: 'gt' | 'lt' | 'eq' | 'ne' | 'gte' | 'lte';
}

export interface MonitoringAction {
  type: 'alert' | 'block' | 'log' | 'escalate' | 'notify';
  severity: SecurityLevel;
  automated: boolean;
  delay: number;
  metadata: Record<string, any>;
}

export interface MonitoringMetadata {
  description: string;
  category: string;
  tags: string[];
  alertChannels: string[];
  escalationPolicy: string;
  documentation: string;
}

export interface SecurityAlert {
  id: string;
  type: SecurityThreatType;
  severity: SecurityLevel;
  title: string;
  description: string;
  timestamp: string;
  playerId?: string;
  sessionId?: string;
  roomCode?: string;
  evidence: Record<string, any>;
  status: 'new' | 'acknowledged' | 'investigating' | 'resolved' | 'false-positive';
  assignedTo?: string;
  resolvedAt?: string;
  metadata: AlertMetadata;
}

export interface AlertMetadata {
  source: string;
  confidence: number;
  impact: SecurityLevel;
  urgency: SecurityLevel;
  category: string;
  tags: string[];
  relatedAlerts: string[];
  escalationLevel: number;
}

// Rate Limiting
export interface RateLimit {
  id: string;
  key: string;
  limit: number;
  window: number;
  current: number;
  resetTime: string;
  blocked: boolean;
  violations: RateLimitViolation[];
}

export interface RateLimitViolation {
  id: string;
  timestamp: string;
  exceededBy: number;
  duration: number;
  action: string;
  metadata: Record<string, any>;
}

// Configuration
export interface SecurityConfiguration {
  sessionConfig: SessionConfiguration;
  encryptionConfig: EncryptionConfiguration;
  monitoringConfig: MonitoringConfiguration;
  rateLimitConfig: RateLimitConfiguration;
  auditConfig: AuditConfiguration;
}

export interface SessionConfiguration {
  tokenExpiry: number;
  refreshTokenExpiry: number;
  maxSessions: number;
  sessionCleanupInterval: number;
  deviceFingerprintRequired: boolean;
  ipValidationRequired: boolean;
  geoLocationTracking: boolean;
}

export interface EncryptionConfiguration {
  algorithm: string;
  keyLength: number;
  keyRotationInterval: number;
  saltLength: number;
  hashRounds: number;
  signatureAlgorithm: string;
}

export interface MonitoringConfiguration {
  enabledMonitors: string[];
  alertThresholds: Record<string, MonitoringThreshold>;
  retentionPeriod: number;
  aggregationInterval: number;
  alertChannels: string[];
}

export interface RateLimitConfiguration {
  globalLimits: Record<string, RateLimit>;
  perUserLimits: Record<string, RateLimit>;
  perIpLimits: Record<string, RateLimit>;
  windowSize: number;
  blockDuration: number;
}

export interface AuditConfiguration {
  enabledActions: AuditActionType[];
  retentionPeriod: number;
  compressionEnabled: boolean;
  encryptionEnabled: boolean;
  detailLevel: 'basic' | 'detailed' | 'comprehensive';
}

// Security Context
export interface SecurityContext {
  session: SecureSession;
  behavioralProfile: BehavioralProfile;
  rateLimit: RateLimit;
  violations: SecurityViolation[];
  alerts: SecurityAlert[];
  auditTrail: AuditLog[];
  integrityChecks: DataIntegrityCheck[];
  configuration: SecurityConfiguration;
}

// Security Events
export interface SecurityEvent {
  id: string;
  type: MonitoringEventType;
  timestamp: string;
  sessionId: string;
  playerId: string;
  roomCode: string;
  data: Record<string, any>;
  severity: SecurityLevel;
  processed: boolean;
  metadata: Record<string, any>;
}

// Default Configuration Constants
export const DEFAULT_SESSION_CONFIG: SessionConfiguration = {
  tokenExpiry: 3600000, // 1 hour
  refreshTokenExpiry: 86400000, // 24 hours
  maxSessions: 1,
  sessionCleanupInterval: 300000, // 5 minutes
  deviceFingerprintRequired: true,
  ipValidationRequired: true,
  geoLocationTracking: false
};

export const DEFAULT_ENCRYPTION_CONFIG: EncryptionConfiguration = {
  algorithm: 'AES-256-GCM',
  keyLength: 256,
  keyRotationInterval: 86400000, // 24 hours
  saltLength: 32,
  hashRounds: 10000,
  signatureAlgorithm: 'ECDSA-SHA256'
};

export const DEFAULT_MONITORING_CONFIG: MonitoringConfiguration = {
  enabledMonitors: ['action-timing', 'pattern-detection', 'anomaly-detection', 'session-validation'],
  alertThresholds: {
    'multiple-sessions': { value: 2, period: 300, unit: 'seconds', operator: 'gte' },
    'bot-behavior': { value: 0.8, period: 600, unit: 'seconds', operator: 'gte' },
    'rate-limit': { value: 100, period: 60, unit: 'seconds', operator: 'gte' }
  },
  retentionPeriod: 2592000000, // 30 days
  aggregationInterval: 60000, // 1 minute
  alertChannels: ['console', 'database']
};

export const DEFAULT_RATE_LIMIT_CONFIG: RateLimitConfiguration = {
  globalLimits: {
    'actions': { id: 'global-actions', key: 'global', limit: 1000, window: 60000, current: 0, resetTime: '', blocked: false, violations: [] }
  },
  perUserLimits: {
    'actions': { id: 'user-actions', key: 'user', limit: 100, window: 60000, current: 0, resetTime: '', blocked: false, violations: [] }
  },
  perIpLimits: {
    'requests': { id: 'ip-requests', key: 'ip', limit: 500, window: 60000, current: 0, resetTime: '', blocked: false, violations: [] }
  },
  windowSize: 60000, // 1 minute
  blockDuration: 300000 // 5 minutes
};

export const DEFAULT_AUDIT_CONFIG: AuditConfiguration = {
  enabledActions: ['join-room', 'leave-room', 'submit-vote', 'propose-team', 'view-role', 'security-violation'],
  retentionPeriod: 2592000000, // 30 days
  compressionEnabled: true,
  encryptionEnabled: true,
  detailLevel: 'detailed'
};

// Security Constants
export const SECURITY_CONSTANTS = {
  MAX_VIOLATION_SCORE: 100,
  CRITICAL_THREAT_THRESHOLD: 80,
  HIGH_THREAT_THRESHOLD: 60,
  MEDIUM_THREAT_THRESHOLD: 40,
  SESSION_HEARTBEAT_INTERVAL: 30000, // 30 seconds
  DEVICE_FINGERPRINT_ENTROPY: 32,
  ROLE_TOKEN_VALIDITY: 300000, // 5 minutes
  AUDIT_BATCH_SIZE: 100,
  MONITORING_BUFFER_SIZE: 1000
} as const;

// Security Error Messages
export const SECURITY_ERROR_MESSAGES = {
  MULTIPLE_SESSIONS: 'Multiple active sessions detected. Please close other browser tabs.',
  INVALID_SESSION: 'Invalid or expired session. Please log in again.',
  SUSPICIOUS_BEHAVIOR: 'Suspicious activity detected. Your account is under review.',
  RATE_LIMIT_EXCEEDED: 'Too many requests. Please slow down and try again later.',
  DATA_INTEGRITY_VIOLATION: 'Data integrity check failed. Please refresh and try again.',
  UNAUTHORIZED_ACCESS: 'Unauthorized access attempt detected.',
  DEVICE_NOT_RECOGNIZED: 'Device not recognized. Additional verification required.',
  LOCATION_MISMATCH: 'Location mismatch detected. Please verify your identity.',
  BOT_DETECTION: 'Automated behavior detected. Please complete verification.',
  COORDINATION_DETECTED: 'Coordinated activity detected between players.'
} as const;
