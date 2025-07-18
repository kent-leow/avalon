/**
 * Host Management Utilities
 * Utility functions for host room management functionality
 */

import type { 
  HostManagement, 
  HostAction, 
  HostActionType, 
  HostActionDetails,
  PlayerManagement,
  PlayerBehavior,
  BehaviorReport,
  ActivityLog,
  ActivityLogType,
  EmergencyProtocol,
  GameAnalytics,
  HostTransfer,
  HostTransferStatus,
  RoomSettings,
  TimeLimitSettings,
  AutoCleanupSettings,
  HostNotification,
  HostNotificationType,
  EmergencyState,
  EmergencyType
} from '~/types/host-management';

/**
 * Creates a new host management instance
 */
export function createHostManagement(
  roomId: string,
  hostId: string,
  hostName: string,
  hostAvatar?: string
): HostManagement {
  const now = new Date();
  const autoCleanupTime = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now

  return {
    roomId,
    hostId,
    hostName,
    hostAvatar,
    sessionStartTime: now,
    sessionDuration: 0,
    authorityLevel: 'owner',
    privileges: getDefaultHostPrivileges(),
    autoCleanupTime,
    isPaused: false,
    canTransferHost: true
  };
}

/**
 * Gets default host privileges
 */
export function getDefaultHostPrivileges() {
  return [
    {
      id: 'kick_player',
      name: 'Kick Player',
      description: 'Remove disruptive players from the room',
      category: 'player_management' as const,
      enabled: true,
      usageCount: 0
    },
    {
      id: 'mute_player',
      name: 'Mute Player',
      description: 'Temporarily silence a player',
      category: 'player_management' as const,
      enabled: true,
      usageCount: 0
    },
    {
      id: 'pause_game',
      name: 'Pause Game',
      description: 'Pause the game temporarily',
      category: 'game_control' as const,
      enabled: true,
      usageCount: 0
    },
    {
      id: 'reset_room',
      name: 'Reset Room',
      description: 'Reset the room to start over',
      category: 'game_control' as const,
      enabled: true,
      usageCount: 0
    },
    {
      id: 'end_game',
      name: 'End Game',
      description: 'End the game early',
      category: 'emergency_powers' as const,
      enabled: true,
      usageCount: 0
    },
    {
      id: 'share_room',
      name: 'Share Room',
      description: 'Share room code and QR code',
      category: 'room_settings' as const,
      enabled: true,
      usageCount: 0
    },
    {
      id: 'transfer_host',
      name: 'Transfer Host',
      description: 'Transfer host privileges to another player',
      category: 'player_management' as const,
      enabled: true,
      usageCount: 0
    },
    {
      id: 'view_analytics',
      name: 'View Analytics',
      description: 'View game analytics and player statistics',
      category: 'transparency_tools' as const,
      enabled: true,
      usageCount: 0
    }
  ];
}

/**
 * Creates a host action with proper validation
 */
export function createHostAction(
  type: HostActionType,
  hostId: string,
  targetId?: string,
  details?: Partial<HostActionDetails>
): HostAction {
  const actionConfig = getActionConfig(type);
  
  return {
    id: generateActionId(),
    type,
    hostId,
    targetId,
    timestamp: new Date(),
    details: {
      ...actionConfig.defaultDetails,
      ...details
    },
    isVisible: actionConfig.isVisible,
    requiresConfirmation: actionConfig.requiresConfirmation,
    isReversible: actionConfig.isReversible
  };
}

/**
 * Gets configuration for different host actions
 */
export function getActionConfig(type: HostActionType) {
  const configs = {
    kick_player: {
      defaultDetails: { confirmationText: 'Are you sure you want to kick this player?' },
      isVisible: true,
      requiresConfirmation: true,
      isReversible: false
    },
    mute_player: {
      defaultDetails: { duration: 300, confirmationText: 'Mute player for 5 minutes?' },
      isVisible: true,
      requiresConfirmation: true,
      isReversible: true
    },
    warn_player: {
      defaultDetails: { confirmationText: 'Send warning to player?' },
      isVisible: true,
      requiresConfirmation: true,
      isReversible: false
    },
    make_host: {
      defaultDetails: { confirmationText: 'Transfer host privileges to this player?' },
      isVisible: true,
      requiresConfirmation: true,
      isReversible: false
    },
    pause_game: {
      defaultDetails: { confirmationText: 'Pause the game?' },
      isVisible: true,
      requiresConfirmation: false,
      isReversible: true
    },
    resume_game: {
      defaultDetails: {},
      isVisible: true,
      requiresConfirmation: false,
      isReversible: false
    },
    reset_room: {
      defaultDetails: { 
        confirmationText: 'Reset the room? This will end the current game and start over.',
        warningMessage: 'This action cannot be undone!'
      },
      isVisible: true,
      requiresConfirmation: true,
      isReversible: false
    },
    end_game: {
      defaultDetails: { 
        confirmationText: 'End the game early? This will finish the current game.',
        warningMessage: 'This action cannot be undone!'
      },
      isVisible: true,
      requiresConfirmation: true,
      isReversible: false
    },
    share_room: {
      defaultDetails: {},
      isVisible: false,
      requiresConfirmation: false,
      isReversible: false
    },
    adjust_timer: {
      defaultDetails: {},
      isVisible: true,
      requiresConfirmation: false,
      isReversible: true
    },
    enable_spectator: {
      defaultDetails: {},
      isVisible: true,
      requiresConfirmation: false,
      isReversible: true
    },
    disable_spectator: {
      defaultDetails: {},
      isVisible: true,
      requiresConfirmation: false,
      isReversible: true
    }
  };

  return configs[type] || {
    defaultDetails: {},
    isVisible: true,
    requiresConfirmation: false,
    isReversible: false
  };
}

/**
 * Validates if a host action is allowed
 */
export function validateHostAction(
  action: HostAction,
  hostManagement: HostManagement,
  playerManagement: PlayerManagement[]
): { valid: boolean; reason?: string } {
  // Check if host has the required privilege
  const requiredPrivilege = hostManagement.privileges.find(p => p.id === action.type);
  if (!requiredPrivilege?.enabled) {
    return { valid: false, reason: 'Host does not have required privilege' };
  }

  // Check target-specific validations
  if (action.targetId) {
    const targetPlayer = playerManagement.find(p => p.playerId === action.targetId);
    if (!targetPlayer) {
      return { valid: false, reason: 'Target player not found' };
    }

    // Validate specific actions
    switch (action.type) {
      case 'kick_player':
        if (!targetPlayer.canKick) {
          return { valid: false, reason: 'Cannot kick this player' };
        }
        break;
      case 'mute_player':
        if (!targetPlayer.canMute) {
          return { valid: false, reason: 'Cannot mute this player' };
        }
        if (targetPlayer.isMuted) {
          return { valid: false, reason: 'Player is already muted' };
        }
        break;
      case 'make_host':
        if (!targetPlayer.canMakeHost) {
          return { valid: false, reason: 'Cannot make this player host' };
        }
        break;
    }
  }

  return { valid: true };
}

/**
 * Calculates player behavior score
 */
export function calculateBehaviorScore(behavior: PlayerBehavior): number {
  let score = 100; // Start with perfect score

  // Deduct for infractions
  behavior.infractions.forEach(infraction => {
    switch (infraction.severity) {
      case 'minor':
        score -= 5;
        break;
      case 'major':
        score -= 15;
        break;
      case 'severe':
        score -= 30;
        break;
    }
  });

  // Add for commendations
  behavior.commendations.forEach(() => {
    score += 10;
  });

  // Ensure score stays within bounds
  return Math.max(0, Math.min(100, score));
}

/**
 * Determines player risk level based on behavior
 */
export function determineRiskLevel(behavior: PlayerBehavior): 'low' | 'medium' | 'high' {
  const score = calculateBehaviorScore(behavior);
  const recentInfractions = behavior.infractions.filter(
    inf => new Date().getTime() - inf.timestamp.getTime() < 24 * 60 * 60 * 1000 // 24 hours
  );

  if (score < 50 || recentInfractions.length >= 3) {
    return 'high';
  } else if (score < 75 || recentInfractions.length >= 2) {
    return 'medium';
  } else {
    return 'low';
  }
}

/**
 * Creates an activity log entry
 */
export function createActivityLog(
  type: ActivityLogType,
  actorId: string,
  actorName: string,
  action: string,
  details: Record<string, any> = {},
  targetId?: string,
  targetName?: string
): ActivityLog {
  return {
    id: generateActionId(),
    timestamp: new Date(),
    type,
    actorId,
    actorName,
    targetId,
    targetName,
    action,
    details,
    isVisible: shouldLogBeVisible(type),
    category: getLogCategory(type)
  };
}

/**
 * Determines if a log entry should be visible to players
 */
function shouldLogBeVisible(type: ActivityLogType): boolean {
  const publicTypes: ActivityLogType[] = [
    'host_action',
    'player_event',
    'game_event'
  ];
  return publicTypes.includes(type);
}

/**
 * Gets the category for a log entry
 */
function getLogCategory(type: ActivityLogType): import('~/types/host-management').ActivityLogCategory {
  const categoryMap: Record<ActivityLogType, import('~/types/host-management').ActivityLogCategory> = {
    host_action: 'player_management',
    player_event: 'player_management',
    game_event: 'game_control',
    system_event: 'system_maintenance',
    security_event: 'security'
  };
  return categoryMap[type] || 'system_maintenance';
}

/**
 * Processes a host transfer request
 */
export function processHostTransfer(
  fromHostId: string,
  toPlayerId: string,
  reason?: string
): HostTransfer {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes to accept

  return {
    fromHostId,
    toPlayerId,
    initiated: now,
    status: 'pending',
    reason,
    expiresAt,
    requiresMutualAgreement: true
  };
}

/**
 * Checks if auto-cleanup should be triggered
 */
export function shouldTriggerAutoCleanup(
  settings: AutoCleanupSettings,
  lastActivity: Date
): boolean {
  if (!settings.enabled) return false;

  const now = new Date();
  const timeSinceActivity = now.getTime() - lastActivity.getTime();
  const timeoutMs = settings.idleTimeout * 60 * 1000;

  return timeSinceActivity > timeoutMs;
}

/**
 * Calculates time until auto-cleanup
 */
export function getTimeUntilCleanup(
  settings: AutoCleanupSettings,
  lastActivity: Date
): number {
  if (!settings.enabled) return -1;

  const now = new Date();
  const timeSinceActivity = now.getTime() - lastActivity.getTime();
  const timeoutMs = settings.idleTimeout * 60 * 1000;

  return Math.max(0, timeoutMs - timeSinceActivity);
}

/**
 * Creates a host notification
 */
export function createHostNotification(
  type: HostNotificationType,
  title: string,
  message: string,
  priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium',
  actionRequired = false
): HostNotification {
  return {
    id: generateActionId(),
    type,
    title,
    message,
    timestamp: new Date(),
    priority,
    actionRequired,
    dismissed: false
  };
}

/**
 * Determines if an emergency protocol should be triggered
 */
export function shouldTriggerEmergency(
  protocol: EmergencyProtocol,
  gameState: any,
  playerManagement: PlayerManagement[]
): boolean {
  // Check each trigger condition
  return protocol.triggerConditions.some(condition => {
    switch (condition) {
      case 'mass_disconnect':
        const disconnectedCount = playerManagement.filter(
          p => p.connectionStatus === 'disconnected'
        ).length;
        return disconnectedCount >= Math.floor(playerManagement.length / 2);
      
      case 'host_abandonment':
        const host = playerManagement.find(p => p.playerId === gameState.hostId);
        return host?.connectionStatus === 'disconnected';
      
      case 'multiple_reports':
        const recentReports = playerManagement.flatMap(p => 
          p.behavior.reports.filter(r => 
            new Date().getTime() - r.timestamp.getTime() < 5 * 60 * 1000 // 5 minutes
          )
        );
        return recentReports.length >= 3;
      
      default:
        return false;
    }
  });
}

/**
 * Calculates game analytics
 */
export function calculateGameAnalytics(
  gameId: string,
  startTime: Date,
  endTime: Date | undefined,
  playerManagement: PlayerManagement[],
  hostActions: HostAction[]
): GameAnalytics {
  const duration = endTime 
    ? Math.floor((endTime.getTime() - startTime.getTime()) / (1000 * 60))
    : Math.floor((new Date().getTime() - startTime.getTime()) / (1000 * 60));

  const playerTurnover = calculatePlayerTurnover(playerManagement);
  const completionRate = endTime ? 100 : calculateCompletionRate(startTime);

  return {
    gameId,
    startTime,
    endTime,
    duration,
    playerCount: playerManagement.length,
    hostActions: hostActions.length,
    playerTurnover,
    completionRate,
    issues: [],
    highlights: []
  };
}

/**
 * Calculates player turnover rate
 */
function calculatePlayerTurnover(playerManagement: PlayerManagement[]): number {
  // This would be more complex with real data tracking joins/leaves
  return 0;
}

/**
 * Calculates completion rate for ongoing games
 */
function calculateCompletionRate(startTime: Date): number {
  const duration = new Date().getTime() - startTime.getTime();
  const avgGameDuration = 45 * 60 * 1000; // 45 minutes average
  return Math.min(100, Math.floor((duration / avgGameDuration) * 100));
}

/**
 * Generates a unique action ID
 */
function generateActionId(): string {
  return `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Formats duration for display
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  } else {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  }
}

/**
 * Formats time until cleanup
 */
export function formatTimeUntilCleanup(milliseconds: number): string {
  const minutes = Math.floor(milliseconds / (1000 * 60));
  const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
  
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
}

/**
 * Gets emergency protocol by type
 */
export function getEmergencyProtocol(type: EmergencyType): EmergencyProtocol {
  const protocols: Record<EmergencyType, EmergencyProtocol> = {
    mass_disconnect: {
      id: 'mass_disconnect',
      name: 'Mass Disconnect',
      description: 'Multiple players have disconnected simultaneously',
      triggerConditions: ['mass_disconnect'],
      autoActions: ['pause_game' as HostActionType],
      manualActions: ['reset_room' as HostActionType, 'end_game' as HostActionType],
      severity: 'high' as const,
      enabled: true
    },
    host_abandonment: {
      id: 'host_abandonment',
      name: 'Host Abandonment',
      description: 'The host has disconnected or abandoned the game',
      triggerConditions: ['host_abandonment'],
      autoActions: ['pause_game' as HostActionType],
      manualActions: ['make_host' as HostActionType],
      severity: 'critical' as const,
      enabled: true
    },
    player_dispute: {
      id: 'player_dispute',
      name: 'Player Dispute',
      description: 'Multiple behavior reports indicate a dispute',
      triggerConditions: ['multiple_reports'],
      autoActions: [],
      manualActions: ['mute_player' as HostActionType, 'kick_player' as HostActionType],
      severity: 'medium' as const,
      enabled: true
    },
    game_breaking_bug: {
      id: 'game_breaking_bug',
      name: 'Game Breaking Bug',
      description: 'A technical issue is preventing normal gameplay',
      triggerConditions: ['technical_error'],
      autoActions: ['pause_game' as HostActionType],
      manualActions: ['reset_room' as HostActionType, 'end_game' as HostActionType],
      severity: 'high' as const,
      enabled: true
    },
    technical_failure: {
      id: 'technical_failure',
      name: 'Technical Failure',
      description: 'System failure affecting game functionality',
      triggerConditions: ['system_error'],
      autoActions: ['pause_game' as HostActionType],
      manualActions: ['reset_room' as HostActionType],
      severity: 'high' as const,
      enabled: true
    },
    security_breach: {
      id: 'security_breach',
      name: 'Security Breach',
      description: 'Potential security breach detected',
      triggerConditions: ['security_alert'],
      autoActions: ['pause_game' as HostActionType],
      manualActions: ['end_game' as HostActionType],
      severity: 'critical' as const,
      enabled: true
    }
  };

  return protocols[type] || protocols.mass_disconnect;
}
