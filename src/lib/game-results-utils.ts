/**
 * Game Results Utility Functions
 * 
 * Utility functions for processing game results, calculating statistics,
 * and generating insights.
 */

import type {
  GameResults,
  GameOutcome,
  PlayerRole,
  GameSummary,
  GameStatistics,
  PlayerPerformance,
  Achievement,
  FinalScore,
  KeyMoment,
  WinCondition,
  RoleType,
  PerformanceRating,
  ShareFormat,
  ResultsTab,
  RESULTS_CONFIG,
} from '~/types/game-results';

import { ACHIEVEMENT_COLORS } from '~/types/game-results';

/**
 * Create game results from game data
 */
export function createGameResults(
  gameData: any, // Would be actual game data from database
  players: any[], // Player data
  gameSettings: any // Game settings
): GameResults {
  const outcome = determineGameOutcome(gameData);
  const playerRoles = extractPlayerRoles(players);
  const gameSummary = generateGameSummary(gameData);
  const statistics = calculateGameStatistics(gameData, players);
  const playerPerformance = calculatePlayerPerformance(players, gameData);
  const achievements = generateAchievements(players, gameData);
  
  return {
    outcome,
    playerRoles,
    gameSummary,
    voteHistory: extractVoteHistory(gameData),
    teamCompositions: extractTeamCompositions(gameData),
    statistics,
    playerPerformance,
    achievements,
    gameMetadata: {
      gameId: gameData.id || 'demo-game',
      roomCode: gameData.roomCode || 'DEMO1234',
      startTime: gameData.startTime || new Date(Date.now() - 1800000), // 30 min ago
      endTime: gameData.endTime || new Date(),
      playerCount: players.length,
      settings: gameSettings,
      version: '1.0.0',
      shareToken: generateShareToken(),
    },
  };
}

/**
 * Determine game outcome from game data
 */
export function determineGameOutcome(gameData: any): GameOutcome {
  const missionResults = gameData.missions || [];
  const goodWins = missionResults.filter((m: any) => m.result === 'success').length;
  const evilWins = missionResults.filter((m: any) => m.result === 'failure').length;
  
  let winner: 'good' | 'evil' = 'good';
  let winCondition: WinCondition = 'three-missions-good';
  let description = '';
  let margin: 'decisive' | 'close' | 'narrow' = 'close';
  
  if (gameData.assassinAttempt) {
    winner = gameData.assassinAttempt.wasCorrect ? 'evil' : 'good';
    winCondition = gameData.assassinAttempt.wasCorrect ? 'assassin-success' : 'assassin-failure';
    description = gameData.assassinAttempt.wasCorrect
      ? 'The assassin successfully identified and eliminated Merlin, securing victory for the forces of evil.'
      : 'The assassin failed to identify Merlin, allowing good to triumph despite losing the missions.';
    margin = 'narrow';
  } else if (goodWins >= 3) {
    winner = 'good';
    winCondition = 'three-missions-good';
    description = 'The forces of good successfully completed three missions, bringing peace to the realm.';
    margin = goodWins === 3 && evilWins === 2 ? 'narrow' : 'decisive';
  } else if (evilWins >= 3) {
    winner = 'evil';
    winCondition = 'three-missions-evil';
    description = 'The forces of evil sabotaged three missions, plunging the realm into darkness.';
    margin = evilWins === 3 && goodWins === 2 ? 'narrow' : 'decisive';
  } else if (gameData.rejectionCount >= 5) {
    winner = 'evil';
    winCondition = 'five-rejections';
    description = 'Five mission proposals were rejected, creating chaos that allowed evil to triumph.';
    margin = 'decisive';
  }
  
  return {
    winner,
    winCondition,
    description,
    keyMoments: generateKeyMoments(gameData),
    margin,
    finalScore: calculateFinalScore(gameData),
  };
}

/**
 * Extract player roles from player data
 */
export function extractPlayerRoles(players: any[]): PlayerRole[] {
  return players.map((player, index) => ({
    playerId: player.id,
    playerName: player.name,
    avatar: player.avatar || ['👑', '🛡️', '⚔️', '🧙‍♂️', '🗡️'][index] || '👤',
    role: player.role || 'loyal-servant',
    team: getTeamFromRole(player.role || 'loyal-servant'),
    description: getRoleDescription(player.role || 'loyal-servant'),
    roleData: player.roleData || {},
    rolePerformance: calculateRolePerformance(player, player.role || 'loyal-servant'),
    survivalStatus: 'alive' as const,
    performance: getPerformanceRating(Math.random() * 0.4 + 0.6),
  }));
}

/**
 * Generate game summary
 */
export function generateGameSummary(gameData: any): GameSummary {
  const startTime = gameData.startTime || new Date(Date.now() - 1800000);
  const endTime = gameData.endTime || new Date();
  
  return {
    duration: endTime.getTime() - startTime.getTime(),
    totalRounds: gameData.totalRounds || 5,
    missionResults: gameData.missions || [],
    voteRounds: gameData.voteRounds || [],
    assassinAttempt: gameData.assassinAttempt,
    criticalEvents: generateCriticalEvents(gameData),
    phaseTimeline: generatePhaseTimeline(gameData),
  };
}

/**
 * Calculate game statistics
 */
export function calculateGameStatistics(gameData: any, players: any[]): GameStatistics {
  return {
    overall: {
      totalVotes: gameData.totalVotes || 15,
      totalMissions: gameData.missions?.length || 5,
      averageMissionDuration: 300000, // 5 minutes
      approvalRate: 0.6,
      missionSuccessRate: 0.6,
    },
    teamPerformance: {
      goodTeam: {
        size: players.filter(p => getTeamFromRole(p.role) === 'good').length,
        winRate: 0.6,
        averagePerformance: 0.7,
        strengths: ['Strategic voting', 'Mission success'],
        weaknesses: ['Merlin protection'],
      },
      evilTeam: {
        size: players.filter(p => getTeamFromRole(p.role) === 'evil').length,
        winRate: 0.4,
        averagePerformance: 0.6,
        strengths: ['Deception', 'Coordination'],
        weaknesses: ['Mission sabotage'],
      },
      comparison: {
        performanceDifference: 0.1,
        strategyComparison: 'Good team had better coordination',
        keyDifferentiators: ['Merlin guidance', 'Evil coordination'],
      },
    },
    votingStats: {
      totalRounds: gameData.voteRounds?.length || 8,
      averageVotesPerRound: players.length,
      rejectionRate: 0.3,
      patterns: [],
    },
    missionStats: {
      successRate: 0.6,
      averageTeamSize: 3.2,
      mostSuccessfulPlayers: players.slice(0, 2).map(p => p.id),
      difficultyRatings: [2, 3, 4, 5, 3],
    },
    deceptionMetrics: {
      successfulDeceptions: 3,
      failedDeceptions: 2,
      deceptionSuccessRate: 0.6,
      topDeceivers: players.filter(p => getTeamFromRole(p.role) === 'evil').slice(0, 2).map(p => p.id),
    },
    strategicInsights: generateStrategicInsights(gameData, players),
  };
}

/**
 * Calculate player performance
 */
export function calculatePlayerPerformance(players: any[], gameData: any): PlayerPerformance[] {
  return players.map((player) => {
    const role = player.role || 'loyal-servant';
    const team = getTeamFromRole(role);
    const baseScore = Math.random() * 0.4 + 0.6; // 60-100% range
    
    return {
      playerId: player.id,
      playerName: player.name,
      overallScore: baseScore,
      roleEffectiveness: baseScore * 0.9,
      votingAccuracy: baseScore * 1.1,
      missionSuccessRate: team === 'good' ? 0.8 : 0.3,
      deceptionSuccess: team === 'evil' ? 0.7 : 0.1,
      keyContributions: generateKeyContributions(player, role),
      improvementAreas: generateImprovementAreas(player, role),
      breakdown: {
        leadership: baseScore * 0.8,
        teamwork: baseScore * 1.2,
        strategy: baseScore * 0.9,
        deception: team === 'evil' ? baseScore * 1.1 : baseScore * 0.3,
        analysis: baseScore * 1.0,
      },
    };
  });
}

/**
 * Generate achievements
 */
export function generateAchievements(players: any[], gameData: any): Achievement[] {
  const achievements: Achievement[] = [];
  
  // Example achievements
  const winnerTeam = determineGameOutcome(gameData).winner;
  const winners = players.filter(p => getTeamFromRole(p.role) === winnerTeam);
  
  achievements.push({
    id: 'victory',
    name: `${winnerTeam === 'good' ? 'Light' : 'Shadow'} Triumphant`,
    description: `Won the game as the ${winnerTeam} team`,
    icon: winnerTeam === 'good' ? '👑' : '🗡️',
    rarity: 'common',
    earnedBy: winners.map(p => p.id),
    earnedAt: new Date(),
    criteria: `Be on the winning team`,
  });
  
  // Perfect voting achievement
  const perfectVoters = players.filter(() => Math.random() > 0.7);
  if (perfectVoters.length > 0) {
    achievements.push({
      id: 'perfect-voter',
      name: 'Oracle of Truth',
      description: 'Made the correct vote on every mission proposal',
      icon: '🔮',
      rarity: 'rare',
      earnedBy: perfectVoters.map(p => p.id),
      earnedAt: new Date(),
      criteria: 'Vote correctly on all mission proposals',
    });
  }
  
  // Merlin survival achievement
  const merlin = players.find(p => p.role === 'merlin');
  if (merlin && gameData.assassinAttempt && !gameData.assassinAttempt.wasCorrect) {
    achievements.push({
      id: 'merlin-survival',
      name: 'The Hidden Sage',
      description: 'Survived the assassination attempt as Merlin',
      icon: '🧙‍♂️',
      rarity: 'legendary',
      earnedBy: [merlin.id],
      earnedAt: new Date(),
      criteria: 'Survive assassination attempt as Merlin',
    });
  }
  
  return achievements;
}

/**
 * Helper functions
 */
export function getTeamFromRole(role: RoleType): 'good' | 'evil' {
  const evilRoles: RoleType[] = ['morgana', 'mordred', 'oberon', 'assassin'];
  return evilRoles.includes(role) ? 'evil' : 'good';
}

export function getRoleDescription(role: RoleType): string {
  const descriptions = {
    merlin: 'The wise wizard who knows the evil players but must remain hidden',
    percival: 'The loyal knight who knows Merlin and Morgana but not which is which',
    'loyal-servant': 'A faithful servant of Arthur who seeks to complete the missions',
    morgana: 'The fallen sorceress who appears as Merlin to Percival',
    mordred: 'The hidden traitor who is unknown to Merlin',
    oberon: 'The lone wolf who is unknown to other evil players',
    assassin: 'The deadly killer who can eliminate Merlin to secure evil\'s victory',
  };
  return descriptions[role] || 'A player in the game of Avalon';
}

export function calculateRolePerformance(player: any, role: RoleType): any {
  const baseEffectiveness = Math.random() * 0.4 + 0.6;
  
  return {
    effectiveness: baseEffectiveness,
    metrics: {
      influence: baseEffectiveness * 0.9,
      stealth: role === 'merlin' ? baseEffectiveness * 1.2 : baseEffectiveness * 0.8,
      deception: getTeamFromRole(role) === 'evil' ? baseEffectiveness * 1.1 : baseEffectiveness * 0.3,
    },
    achievements: generateRoleAchievements(role),
    mistakes: generateRoleMistakes(role),
  };
}

export function generateKeyMoments(gameData: any): KeyMoment[] {
  const moments: KeyMoment[] = [];
  
  // Add mission outcomes as key moments
  if (gameData.missions) {
    gameData.missions.forEach((mission: any, index: number) => {
      if (mission.result) {
        moments.push({
          type: mission.result === 'success' ? 'mission-success' : 'mission-failure',
          timestamp: new Date(Date.now() - (5 - index) * 300000), // 5 minutes apart
          description: `Mission ${index + 1} ${mission.result === 'success' ? 'succeeded' : 'failed'}`,
          impact: index >= 2 ? 'critical' : 'high',
          playersInvolved: mission.teamMembers || [],
        });
      }
    });
  }
  
  // Add assassination attempt
  if (gameData.assassinAttempt) {
    moments.push({
      type: 'assassin-attempt',
      timestamp: new Date(),
      description: `Assassin ${gameData.assassinAttempt.wasCorrect ? 'successfully identified' : 'failed to identify'} Merlin`,
      impact: 'critical',
      playersInvolved: [gameData.assassinAttempt.assassinId, gameData.assassinAttempt.targetId],
    });
  }
  
  return moments;
}

export function calculateFinalScore(gameData: any): FinalScore {
  const goodWins = gameData.missions?.filter((m: any) => m.result === 'success').length || 0;
  const evilWins = gameData.missions?.filter((m: any) => m.result === 'failure').length || 0;
  
  return {
    goodPoints: goodWins * 10,
    evilPoints: evilWins * 10,
    bonusPoints: {},
    breakdown: {
      missionPoints: (goodWins + evilWins) * 10,
      rolePoints: 0,
      votingPoints: 0,
      bonusPoints: 0,
    },
  };
}

export function generateCriticalEvents(gameData: any): any[] {
  return [
    {
      type: 'game-start',
      timestamp: gameData.startTime || new Date(Date.now() - 1800000),
      description: 'Game began with role assignments',
      impact: 'Game initialization',
      playersAffected: [],
    },
  ];
}

export function generatePhaseTimeline(gameData: any): any[] {
  return [
    {
      phase: 'Role Reveal',
      startTime: gameData.startTime || new Date(Date.now() - 1800000),
      duration: 60000, // 1 minute
      description: 'Players learned their roles',
      keyEvents: ['Roles distributed', 'Role knowledge shared'],
    },
  ];
}

export function generateStrategicInsights(gameData: any, players: any[]): any[] {
  return [
    {
      type: 'team-coordination',
      description: 'Good team showed strong coordination in mission selection',
      evidence: ['Consistent voting patterns', 'Effective communication'],
      importance: 8,
    },
    {
      type: 'deception-analysis',
      description: 'Evil team struggled with maintaining cover',
      evidence: ['Voting inconsistencies', 'Suspicious behavior'],
      importance: 7,
    },
  ];
}

export function generateKeyContributions(player: any, role: RoleType): string[] {
  const contributions = [
    'Strategic voting decisions',
    'Effective team coordination',
    'Successful mission completion',
  ];
  
  if (getTeamFromRole(role) === 'evil') {
    contributions.push('Successful deception');
  }
  
  return contributions;
}

export function generateImprovementAreas(player: any, role: RoleType): string[] {
  return [
    'Vote timing optimization',
    'Better strategic communication',
    'Enhanced role concealment',
  ];
}

export function generateRoleAchievements(role: RoleType): string[] {
  const achievements = ['Participated in missions'];
  
  if (role === 'merlin') {
    achievements.push('Guided team effectively');
  } else if (role === 'assassin') {
    achievements.push('Identified potential targets');
  }
  
  return achievements;
}

export function generateRoleMistakes(role: RoleType): string[] {
  return [
    'Revealed too much information',
    'Voted against team interest',
  ];
}

export function generateShareToken(): string {
  return Math.random().toString(36).substring(2, 15);
}

export function extractVoteHistory(gameData: any): any[] {
  return gameData.voteHistory || [];
}

export function extractTeamCompositions(gameData: any): any[] {
  return gameData.teamCompositions || [];
}

export function getPerformanceRating(score: number): PerformanceRating {
  if (score >= 0.9) return 'excellent';
  if (score >= 0.7) return 'good';
  if (score >= 0.5) return 'average';
  return 'poor';
}

export function getPerformanceColor(rating: PerformanceRating): string {
  switch (rating) {
    case 'excellent': return 'text-green-400';
    case 'good': return 'text-blue-400';
    case 'average': return 'text-yellow-400';
    case 'poor': return 'text-red-400';
    default: return 'text-gray-400';
  }
}

export function getAchievementColor(rarity: keyof typeof ACHIEVEMENT_COLORS): string {
  return ACHIEVEMENT_COLORS[rarity];
}

export function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function formatScore(score: number): string {
  return Math.round(score * 100).toString();
}

export function createMockGameResults(): GameResults {
  const mockPlayers = [
    { id: 'player1', name: 'Alice', role: 'merlin' },
    { id: 'player2', name: 'Bob', role: 'percival' },
    { id: 'player3', name: 'Charlie', role: 'loyal-servant' },
    { id: 'player4', name: 'Diana', role: 'morgana' },
    { id: 'player5', name: 'Eve', role: 'assassin' },
  ];
  
  const mockGameData = {
    id: 'demo-game',
    roomCode: 'DEMO1234',
    startTime: new Date(Date.now() - 1800000),
    endTime: new Date(),
    missions: [
      { result: 'success', teamMembers: ['player1', 'player2', 'player3'] },
      { result: 'failure', teamMembers: ['player2', 'player3', 'player4'] },
      { result: 'success', teamMembers: ['player1', 'player3', 'player5'] },
      { result: 'success', teamMembers: ['player1', 'player2', 'player4'] },
    ],
    assassinAttempt: {
      assassinId: 'player5',
      targetId: 'player2',
      wasCorrect: false,
    },
    totalVotes: 20,
    totalRounds: 7,
  };
  
  return createGameResults(mockGameData, mockPlayers, {
    characters: ['merlin', 'percival', 'loyal-servant', 'morgana', 'assassin'],
    playerCount: 5,
    timeLimit: 300,
  });
}
