/**
 * Game Results Types
 * 
 * Types for displaying final game results, player roles, and game statistics.
 */

export interface GameResults {
  /** Final game outcome */
  outcome: GameOutcome;
  
  /** All player roles revealed */
  playerRoles: PlayerRole[];
  
  /** Game timeline and summary */
  gameSummary: GameSummary;
  
  /** Detailed voting history */
  voteHistory: DetailedVoteHistory[];
  
  /** Mission team compositions */
  teamCompositions: TeamComposition[];
  
  /** Game statistics and analytics */
  statistics: GameStatistics;
  
  /** Player performance metrics */
  playerPerformance: PlayerPerformance[];
  
  /** Achievement badges earned */
  achievements: Achievement[];
  
  /** Game metadata */
  gameMetadata: GameMetadata;
}

export interface GameOutcome {
  /** Winning team */
  winner: 'good' | 'evil';
  
  /** How the game was won */
  winCondition: WinCondition;
  
  /** Victory description */
  description: string;
  
  /** Key decisive moments */
  keyMoments: KeyMoment[];
  
  /** Victory margin or closeness */
  margin: 'decisive' | 'close' | 'narrow';
  
  /** Final score breakdown */
  finalScore: FinalScore;
}

export interface PlayerRole {
  /** Player ID */
  playerId: string;
  
  /** Player name */
  playerName: string;
  
  /** Player avatar */
  avatar: string;
  
  /** Actual role */
  role: RoleType;
  
  /** Team affiliation */
  team: 'good' | 'evil';
  
  /** Role description */
  description: string;
  
  /** Role-specific data */
  roleData: RoleData;
  
  /** Performance in role */
  rolePerformance: RolePerformance;
  
  /** Player survival status */
  survivalStatus: 'alive' | 'eliminated';
  
  /** Performance rating */
  performance: PerformanceRating;
}

export interface GameSummary {
  /** Game duration */
  duration: number;
  
  /** Total rounds played */
  totalRounds: number;
  
  /** Mission results */
  missionResults: MissionResult[];
  
  /** Vote rounds */
  voteRounds: VoteRound[];
  
  /** Assassin attempt result */
  assassinAttempt?: AssassinAttemptResult;
  
  /** Critical game events */
  criticalEvents: CriticalEvent[];
  
  /** Game phases timeline */
  phaseTimeline: PhaseEntry[];
}

export interface DetailedVoteHistory {
  /** Round number */
  round: number;
  
  /** Mission number */
  missionNumber: number;
  
  /** Proposed team */
  proposedTeam: string[];
  
  /** Team leader */
  leader: string;
  
  /** Vote result */
  result: 'approved' | 'rejected';
  
  /** Individual votes */
  votes: VoteDetail[];
  
  /** Vote analysis */
  analysis: VoteAnalysis;
  
  /** Consequences */
  consequences: string[];
}

export interface TeamComposition {
  /** Mission number */
  missionNumber: number;
  
  /** Team members */
  members: TeamMember[];
  
  /** Mission outcome */
  outcome: 'success' | 'failure';
  
  /** Team analysis */
  teamAnalysis: TeamAnalysis;
  
  /** Mission votes */
  missionVotes: MissionVote[];
  
  /** Key decisions */
  keyDecisions: string[];
}

export interface GameStatistics {
  /** Overall game stats */
  overall: OverallStats;
  
  /** Team performance */
  teamPerformance: TeamPerformanceStats;
  
  /** Voting statistics */
  votingStats: VotingStats;
  
  /** Mission statistics */
  missionStats: MissionStats;
  
  /** Deception metrics */
  deceptionMetrics: DeceptionMetrics;
  
  /** Strategic insights */
  strategicInsights: StrategyInsight[];
}

export interface PlayerPerformance {
  /** Player ID */
  playerId: string;
  
  /** Player name */
  playerName: string;
  
  /** Overall performance score */
  overallScore: number;
  
  /** Role effectiveness */
  roleEffectiveness: number;
  
  /** Voting accuracy */
  votingAccuracy: number;
  
  /** Mission success rate */
  missionSuccessRate: number;
  
  /** Deception success */
  deceptionSuccess: number;
  
  /** Key contributions */
  keyContributions: string[];
  
  /** Areas for improvement */
  improvementAreas: string[];
  
  /** Performance breakdown */
  breakdown: PerformanceBreakdown;
}

export interface Achievement {
  /** Achievement ID */
  id: string;
  
  /** Achievement name */
  name: string;
  
  /** Achievement description */
  description: string;
  
  /** Achievement icon */
  icon: string;
  
  /** Achievement rarity */
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  
  /** Players who earned it */
  earnedBy: string[];
  
  /** When it was earned */
  earnedAt: Date;
  
  /** Achievement criteria */
  criteria: string;
}

export interface GameMetadata {
  /** Game ID */
  gameId: string;
  
  /** Room code */
  roomCode: string;
  
  /** Game start time */
  startTime: Date;
  
  /** Game end time */
  endTime: Date;
  
  /** Player count */
  playerCount: number;
  
  /** Game settings used */
  settings: GameSettings;
  
  /** Game version */
  version: string;
  
  /** Share token for sharing results */
  shareToken: string;
}

// Supporting Types
export type WinCondition = 
  | 'three-missions-good'
  | 'three-missions-evil'
  | 'assassin-success'
  | 'assassin-failure'
  | 'five-rejections';

export type RoleType = 
  | 'merlin'
  | 'percival'
  | 'loyal-servant'
  | 'morgana'
  | 'mordred'
  | 'oberon'
  | 'assassin';

export interface KeyMoment {
  /** Moment type */
  type: 'mission-success' | 'mission-failure' | 'vote-rejection' | 'assassin-attempt' | 'role-reveal';
  
  /** When it happened */
  timestamp: Date;
  
  /** Description */
  description: string;
  
  /** Impact level */
  impact: 'low' | 'medium' | 'high' | 'critical';
  
  /** Players involved */
  playersInvolved: string[];
}

export interface FinalScore {
  /** Good team points */
  goodPoints: number;
  
  /** Evil team points */
  evilPoints: number;
  
  /** Bonus points */
  bonusPoints: { [playerId: string]: number };
  
  /** Score breakdown */
  breakdown: ScoreBreakdown;
}

export interface RoleData {
  /** Role-specific information */
  [key: string]: any;
  
  /** Special abilities used */
  abilitiesUsed?: string[];
  
  /** Knowledge gained */
  knowledgeGained?: string[];
  
  /** Influence exercised */
  influenceExercised?: string[];
}

export interface RolePerformance {
  /** How well the role was played */
  effectiveness: number;
  
  /** Role-specific metrics */
  metrics: { [key: string]: number };
  
  /** Key achievements */
  achievements: string[];
  
  /** Mistakes made */
  mistakes: string[];
}

export interface MissionResult {
  /** Mission number */
  missionNumber: number;
  
  /** Mission outcome */
  outcome: 'success' | 'failure';
  
  /** Team members */
  teamMembers: string[];
  
  /** Individual mission votes */
  votes: MissionVote[];
  
  /** Mission analysis */
  analysis: MissionAnalysis;
}

export interface VoteRound {
  /** Round number */
  round: number;
  
  /** Mission number */
  missionNumber: number;
  
  /** Vote result */
  result: 'approved' | 'rejected';
  
  /** Rejection count */
  rejectionCount: number;
  
  /** Vote details */
  voteDetails: VoteDetail[];
}

export interface AssassinAttemptResult {
  /** Assassin player */
  assassin: string;
  
  /** Target selected */
  target: string;
  
  /** Whether target was Merlin */
  wasCorrect: boolean;
  
  /** Decision time */
  decisionTime: number;
  
  /** Final outcome */
  finalOutcome: 'evil-wins' | 'good-wins';
}

export interface CriticalEvent {
  /** Event type */
  type: string;
  
  /** When it happened */
  timestamp: Date;
  
  /** Event description */
  description: string;
  
  /** Impact on game */
  impact: string;
  
  /** Players affected */
  playersAffected: string[];
}

export interface PhaseEntry {
  /** Game phase */
  phase: string;
  
  /** Phase start time */
  startTime: Date;
  
  /** Phase duration */
  duration: number;
  
  /** Phase description */
  description: string;
  
  /** Key events in phase */
  keyEvents: string[];
}

export interface VoteDetail {
  /** Player ID */
  playerId: string;
  
  /** Player name */
  playerName: string;
  
  /** Vote choice */
  vote: 'approve' | 'reject';
  
  /** Vote reasoning */
  reasoning?: string;
  
  /** Vote timing */
  timing: number;
}

export interface VoteAnalysis {
  /** Vote distribution */
  distribution: { approve: number; reject: number };
  
  /** Key influencers */
  keyInfluencers: string[];
  
  /** Surprising votes */
  surprisingVotes: string[];
  
  /** Vote patterns */
  patterns: string[];
}

export interface TeamMember {
  /** Player ID */
  playerId: string;
  
  /** Player name */
  playerName: string;
  
  /** Actual role */
  role: RoleType;
  
  /** Team affiliation */
  team: 'good' | 'evil';
  
  /** Mission vote */
  missionVote: 'success' | 'failure';
}

export interface TeamAnalysis {
  /** Team composition quality */
  compositionQuality: number;
  
  /** Good players count */
  goodPlayers: number;
  
  /** Evil players count */
  evilPlayers: number;
  
  /** Risk assessment */
  riskAssessment: string;
  
  /** Strategic value */
  strategicValue: number;
}

export interface MissionVote {
  /** Player ID */
  playerId: string;
  
  /** Vote choice */
  vote: 'success' | 'failure';
  
  /** Vote reasoning */
  reasoning?: string;
}

export interface OverallStats {
  /** Total votes cast */
  totalVotes: number;
  
  /** Total missions */
  totalMissions: number;
  
  /** Average mission duration */
  averageMissionDuration: number;
  
  /** Vote approval rate */
  approvalRate: number;
  
  /** Mission success rate */
  missionSuccessRate: number;
}

export interface TeamPerformanceStats {
  /** Good team performance */
  goodTeam: TeamStats;
  
  /** Evil team performance */
  evilTeam: TeamStats;
  
  /** Team comparison */
  comparison: TeamComparison;
}

export interface VotingStats {
  /** Total voting rounds */
  totalRounds: number;
  
  /** Average votes per round */
  averageVotesPerRound: number;
  
  /** Rejection rate */
  rejectionRate: number;
  
  /** Voting patterns */
  patterns: VotingPattern[];
}

export interface MissionStats {
  /** Mission success rate */
  successRate: number;
  
  /** Average team size */
  averageTeamSize: number;
  
  /** Most successful players */
  mostSuccessfulPlayers: string[];
  
  /** Mission difficulty ratings */
  difficultyRatings: number[];
}

export interface DeceptionMetrics {
  /** Successful deceptions */
  successfulDeceptions: number;
  
  /** Failed deceptions */
  failedDeceptions: number;
  
  /** Deception success rate */
  deceptionSuccessRate: number;
  
  /** Top deceivers */
  topDeceivers: string[];
}

export interface StrategyInsight {
  /** Insight type */
  type: string;
  
  /** Insight description */
  description: string;
  
  /** Supporting evidence */
  evidence: string[];
  
  /** Insight importance */
  importance: number;
}

export interface PerformanceBreakdown {
  /** Leadership score */
  leadership: number;
  
  /** Teamwork score */
  teamwork: number;
  
  /** Strategy score */
  strategy: number;
  
  /** Deception score */
  deception: number;
  
  /** Analysis score */
  analysis: number;
}

export interface GameSettings {
  /** Character configuration */
  characters: string[];
  
  /** Player count */
  playerCount: number;
  
  /** Time limits */
  timeLimit?: number;
  
  /** Other settings */
  [key: string]: any;
}

export interface ScoreBreakdown {
  /** Mission points */
  missionPoints: number;
  
  /** Role performance points */
  rolePoints: number;
  
  /** Voting accuracy points */
  votingPoints: number;
  
  /** Bonus points */
  bonusPoints: number;
}

export interface TeamStats {
  /** Team size */
  size: number;
  
  /** Win rate */
  winRate: number;
  
  /** Average performance */
  averagePerformance: number;
  
  /** Key strengths */
  strengths: string[];
  
  /** Areas for improvement */
  weaknesses: string[];
}

export interface TeamComparison {
  /** Performance difference */
  performanceDifference: number;
  
  /** Strategy comparison */
  strategyComparison: string;
  
  /** Key differentiators */
  keyDifferentiators: string[];
}

export interface VotingPattern {
  /** Pattern type */
  type: string;
  
  /** Pattern description */
  description: string;
  
  /** Pattern frequency */
  frequency: number;
  
  /** Players involved */
  playersInvolved: string[];
}

export interface MissionAnalysis {
  /** Mission difficulty */
  difficulty: number;
  
  /** Strategic importance */
  strategicImportance: number;
  
  /** Key decisions */
  keyDecisions: string[];
  
  /** Alternative outcomes */
  alternativeOutcomes: string[];
}

// Animation and UI Configuration
export const RESULTS_CONFIG = {
  ROLE_REVEAL_DURATION: 800, // Per role reveal animation
  CELEBRATION_DURATION: 3000, // Victory celebration
  STATISTICS_ANIMATION_DELAY: 100, // Delay between stat reveals
  ACHIEVEMENT_POPUP_DURATION: 2000, // Achievement notification duration
  SHARE_MODAL_DURATION: 500, // Share modal animation
  TIMELINE_SCROLL_DURATION: 1000, // Timeline scroll animation
  PARTICLE_COUNT: 30, // Celebration particles
  CHART_ANIMATION_DURATION: 1500, // Chart animation duration
} as const;

// Results Display States
export type ResultsTab = 'overview' | 'roles' | 'timeline' | 'statistics' | 'achievements';

// Share Format Types
export type ShareFormat = 'text' | 'image' | 'link' | 'json';

// Performance Ratings
export type PerformanceRating = 'excellent' | 'good' | 'average' | 'poor';

// Achievement Rarity Colors
export const ACHIEVEMENT_COLORS = {
  common: '#9CA3AF',
  uncommon: '#10B981',
  rare: '#3B82F6',
  legendary: '#F59E0B',
} as const;
