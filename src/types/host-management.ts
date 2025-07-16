/**
 * Host Management Types
 * Comprehensive types for host room management functionality
 */

export interface HostManagement {
  roomId: string;
  hostId: string;
  hostName: string;
  hostAvatar?: string;
  sessionStartTime: Date;
  sessionDuration: number; // in minutes
  authorityLevel: HostAuthorityLevel;
  privileges: HostPrivilege[];
  autoCleanupTime: Date;
  isPaused: boolean;
  canTransferHost: boolean;
}

export type HostAuthorityLevel = 'owner' | 'moderator' | 'temporary';

export interface HostPrivilege {
  id: string;
  name: string;
  description: string;
  category: HostPrivilegeCategory;
  enabled: boolean;
  usageCount: number;
  lastUsed?: Date;
}

export type HostPrivilegeCategory = 
  | 'player_management'
  | 'game_control'
  | 'room_settings'
  | 'emergency_powers'
  | 'transparency_tools';

export interface HostAction {
  id: string;
  type: HostActionType;
  hostId: string;
  targetId?: string; // player ID for player-specific actions
  timestamp: Date;
  details: HostActionDetails;
  isVisible: boolean; // whether action is visible to players
  requiresConfirmation: boolean;
  isReversible: boolean;
}

export type HostActionType = 
  | 'kick_player'
  | 'mute_player'
  | 'warn_player'
  | 'make_host'
  | 'pause_game'
  | 'resume_game'
  | 'reset_room'
  | 'end_game'
  | 'share_room'
  | 'adjust_timer'
  | 'enable_spectator'
  | 'disable_spectator';

export interface HostActionDetails {
  reason?: string;
  duration?: number; // for temporary actions (mute, etc.)
  previousState?: any; // for reversible actions
  confirmationText?: string;
  warningMessage?: string;
}

export interface PlayerManagement {
  playerId: string;
  playerName: string;
  playerAvatar?: string;
  connectionStatus: PlayerConnectionStatus;
  behavior: PlayerBehavior;
  actions: HostAction[];
  canKick: boolean;
  canMute: boolean;
  canMakeHost: boolean;
  isMuted: boolean;
  muteExpiry?: Date;
  warningCount: number;
  joinTime: Date;
  lastActivity: Date;
}

export type PlayerConnectionStatus = 
  | 'connected'
  | 'disconnected'
  | 'reconnecting'
  | 'idle'
  | 'away';

export interface PlayerBehavior {
  score: number; // 0-100, higher is better
  reports: BehaviorReport[];
  infractions: BehaviorInfraction[];
  commendations: BehaviorCommendation[];
  riskLevel: 'low' | 'medium' | 'high';
}

export interface BehaviorReport {
  id: string;
  reporterId: string;
  type: BehaviorReportType;
  description: string;
  timestamp: Date;
  status: 'pending' | 'reviewed' | 'resolved';
}

export type BehaviorReportType = 
  | 'disruptive_behavior'
  | 'cheating'
  | 'inappropriate_language'
  | 'spam'
  | 'other';

export interface BehaviorInfraction {
  id: string;
  type: BehaviorReportType;
  severity: 'minor' | 'major' | 'severe';
  timestamp: Date;
  action: HostActionType;
  resolved: boolean;
}

export interface BehaviorCommendation {
  id: string;
  type: 'good_sportsmanship' | 'helpful' | 'positive_attitude';
  timestamp: Date;
  fromHostId: string;
}

export interface RoomSettings {
  roomCode: string;
  roomName?: string;
  maxPlayers: number;
  currentPlayers: number;
  isPublic: boolean;
  allowSpectators: boolean;
  spectatorCount: number;
  maxSpectators: number;
  timeLimit: TimeLimitSettings;
  autoCleanup: AutoCleanupSettings;
  moderationLevel: ModerationLevel;
  roomExpiry: Date;
  qrCodeUrl?: string;
}

export interface TimeLimitSettings {
  enabled: boolean;
  phaseLimits: Record<string, number>; // phase name -> minutes
  globalLimit: number; // total game time limit
  warningThreshold: number; // warn when X minutes left
  autoExtend: boolean;
}

export interface AutoCleanupSettings {
  enabled: boolean;
  idleTimeout: number; // minutes of inactivity before cleanup
  warningInterval: number; // minutes before cleanup to warn
  lastActivity: Date;
  cleanupScheduled: boolean;
  cleanupTime: Date;
}

export type ModerationLevel = 'permissive' | 'standard' | 'strict';

export interface HostTransfer {
  fromHostId: string;
  toPlayerId: string;
  initiated: Date;
  status: HostTransferStatus;
  reason?: string;
  expiresAt: Date;
  requiresMutualAgreement: boolean;
}

export type HostTransferStatus = 
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'expired'
  | 'cancelled';

export interface ActivityLog {
  id: string;
  timestamp: Date;
  type: ActivityLogType;
  actorId: string;
  actorName: string;
  targetId?: string;
  targetName?: string;
  action: string;
  details: Record<string, any>;
  isVisible: boolean;
  category: ActivityLogCategory;
}

export type ActivityLogType = 
  | 'host_action'
  | 'player_event'
  | 'game_event'
  | 'system_event'
  | 'security_event';

export type ActivityLogCategory = 
  | 'player_management'
  | 'game_control'
  | 'room_settings'
  | 'system_maintenance'
  | 'security';

export interface EmergencyProtocol {
  id: string;
  name: string;
  description: string;
  triggerConditions: string[];
  autoActions: HostActionType[];
  manualActions: HostActionType[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
}

export interface GameAnalytics {
  gameId: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // in minutes
  playerCount: number;
  hostActions: number;
  playerTurnover: number; // number of players who left/joined
  completionRate: number; // percentage of game completed
  satisfactionScore?: number; // 1-5 rating
  issues: AnalyticsIssue[];
  highlights: AnalyticsHighlight[];
}

export interface AnalyticsIssue {
  type: 'connection' | 'performance' | 'behavior' | 'technical';
  severity: 'low' | 'medium' | 'high';
  description: string;
  timestamp: Date;
  resolved: boolean;
  resolution?: string;
}

export interface AnalyticsHighlight {
  type: 'achievement' | 'milestone' | 'positive_feedback';
  description: string;
  timestamp: Date;
  value?: number;
}

export interface HostPanelState {
  isVisible: boolean;
  currentTab: HostPanelTab;
  position: 'left' | 'right' | 'floating';
  size: 'compact' | 'normal' | 'expanded';
  notifications: HostNotification[];
}

export type HostPanelTab = 
  | 'quick_actions'
  | 'player_management'
  | 'room_settings'
  | 'activity_log'
  | 'analytics';

export interface HostNotification {
  id: string;
  type: HostNotificationType;
  title: string;
  message: string;
  timestamp: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  actionRequired: boolean;
  actions?: HostNotificationAction[];
  dismissed: boolean;
}

export type HostNotificationType = 
  | 'player_joined'
  | 'player_left'
  | 'behavior_report'
  | 'connection_issue'
  | 'game_event'
  | 'system_alert'
  | 'cleanup_warning';

export interface HostNotificationAction {
  id: string;
  label: string;
  type: 'primary' | 'secondary' | 'destructive';
  action: () => void;
}

// Host panel configuration
export interface HostPanelConfig {
  theme: 'dark' | 'light';
  compactMode: boolean;
  autoHide: boolean;
  position: 'left' | 'right' | 'floating';
  notifications: {
    enabled: boolean;
    sound: boolean;
    vibration: boolean;
    desktop: boolean;
  };
  quickActions: HostActionType[];
  defaultTab: HostPanelTab;
}

// Emergency situations
export interface EmergencyState {
  active: boolean;
  type: EmergencyType;
  triggered: Date;
  description: string;
  autoActions: HostActionType[];
  manualActions: HostActionType[];
  resolved: boolean;
  resolution?: string;
}

export type EmergencyType = 
  | 'game_breaking_bug'
  | 'player_dispute'
  | 'technical_failure'
  | 'security_breach'
  | 'host_abandonment'
  | 'mass_disconnect';
