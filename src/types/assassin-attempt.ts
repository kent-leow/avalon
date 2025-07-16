/**
 * Assassin Attempt Types
 * 
 * Types for the final assassin phase where evil tries to identify Merlin
 * after good wins 3 missions.
 */

export interface AssassinAttempt {
  /** The assassin player making the attempt */
  assassin: AssassinPlayer;
  
  /** Available targets for assassination */
  targets: AssassinTarget[];
  
  /** Strategic information to help identify Merlin */
  strategicInfo: StrategyInfo;
  
  /** Game context and history */
  gameContext: GameContext;
  
  /** Current phase state */
  phase: AssassinPhase;
  
  /** Countdown timer for decision */
  timer: AssassinTimer;
  
  /** The selected target (if any) */
  selectedTarget?: string;
  
  /** Final attempt result */
  result?: AssassinResult;
}

export interface AssassinPlayer {
  /** Player ID */
  id: string;
  
  /** Player name */
  name: string;
  
  /** Player avatar */
  avatar: string;
  
  /** Assassin role confirmation */
  role: 'assassin';
  
  /** Whether player has made their decision */
  hasDecided: boolean;
  
  /** Decision timestamp */
  decisionTime?: Date;
}

export interface AssassinTarget {
  /** Target player ID */
  id: string;
  
  /** Target player name */
  name: string;
  
  /** Target player avatar */
  avatar: string;
  
  /** Actual role (hidden from assassin) */
  actualRole: string;
  
  /** Whether this target is Merlin */
  isMerlin: boolean;
  
  /** Strategic hints about this player */
  hints: TargetHint[];
  
  /** Behavioral analysis */
  behavior: BehaviorAnalysis;
}

export interface TargetHint {
  /** Hint type */
  type: 'voting' | 'team-selection' | 'behavior' | 'mission-outcome';
  
  /** Hint description */
  description: string;
  
  /** Hint strength (1-5) */
  strength: number;
  
  /** Whether hint points toward Merlin */
  pointsToMerlin: boolean;
}

export interface BehaviorAnalysis {
  /** Voting pattern analysis */
  votingPattern: VotingBehavior;
  
  /** Team selection behavior */
  teamBehavior: TeamBehavior;
  
  /** Mission participation */
  missionParticipation: MissionParticipation;
  
  /** Overall suspicion level */
  suspicionLevel: 1 | 2 | 3 | 4 | 5;
}

export interface VotingBehavior {
  /** Approve rate on successful missions */
  approveRateSuccess: number;
  
  /** Approve rate on failed missions */
  approveRateFailed: number;
  
  /** Consistency in voting */
  consistency: number;
  
  /** Tendency to vote with majority */
  followsMajority: boolean;
}

export interface TeamBehavior {
  /** Times selected for missions */
  timesSelected: number;
  
  /** Times avoided selection */
  timesAvoided: number;
  
  /** Preference for certain players */
  playerPreferences: string[];
  
  /** Avoidance patterns */
  avoidancePatterns: string[];
}

export interface MissionParticipation {
  /** Total missions participated */
  totalMissions: number;
  
  /** Missions that succeeded */
  successfulMissions: number;
  
  /** Missions that failed */
  failedMissions: number;
  
  /** Average mission success rate */
  successRate: number;
}

export interface StrategyInfo {
  /** Mission timeline with results */
  missionTimeline: MissionSummary[];
  
  /** Key voting patterns */
  votingPatterns: VotingPattern[];
  
  /** Team composition analysis */
  teamCompositions: TeamComposition[];
  
  /** Behavioral insights */
  behavioralInsights: BehavioralInsight[];
  
  /** Merlin identification clues */
  merlinClues: MerlinClue[];
}

export interface MissionSummary {
  /** Mission number */
  missionNumber: number;
  
  /** Team members */
  teamMembers: string[];
  
  /** Mission result */
  result: 'success' | 'failure';
  
  /** Vote results */
  voteResults: { playerId: string; vote: 'approve' | 'reject' }[];
  
  /** Key events */
  keyEvents: string[];
}

export interface VotingPattern {
  /** Player ID */
  playerId: string;
  
  /** Voting consistency */
  consistency: number;
  
  /** Tendency to approve */
  approvalTendency: number;
  
  /** Alignment with good team */
  goodAlignment: number;
}

export interface TeamComposition {
  /** Mission number */
  missionNumber: number;
  
  /** Team members */
  members: string[];
  
  /** Mission outcome */
  outcome: 'success' | 'failure';
  
  /** Good players on team */
  goodPlayers: number;
  
  /** Evil players on team */
  evilPlayers: number;
}

export interface BehavioralInsight {
  /** Player ID */
  playerId: string;
  
  /** Insight type */
  type: 'leadership' | 'deception' | 'knowledge' | 'influence';
  
  /** Insight description */
  description: string;
  
  /** Insight strength */
  strength: number;
  
  /** Relevance to Merlin identification */
  merlinRelevance: number;
}

export interface MerlinClue {
  /** Clue type */
  type: 'voting-knowledge' | 'team-guidance' | 'subtle-influence' | 'strategic-positioning';
  
  /** Clue description */
  description: string;
  
  /** Suspected players */
  suspectedPlayers: string[];
  
  /** Confidence level */
  confidence: number;
  
  /** Supporting evidence */
  evidence: string[];
}

export interface GameContext {
  /** Current round number */
  round: number;
  
  /** Mission results */
  missionResults: ('success' | 'failure')[];
  
  /** Good team wins */
  goodWins: number;
  
  /** Evil team wins */
  evilWins: number;
  
  /** Total players */
  totalPlayers: number;
  
  /** Game duration */
  gameDuration: number;
  
  /** Current leader */
  currentLeader: string;
}

export interface AssassinPhase {
  /** Current phase */
  phase: 'reveal' | 'selection' | 'confirmation' | 'result';
  
  /** Phase start time */
  startTime: Date;
  
  /** Phase duration */
  duration: number;
  
  /** Whether phase is active */
  isActive: boolean;
  
  /** Phase progress percentage */
  progress: number;
}

export interface AssassinTimer {
  /** Time remaining in milliseconds */
  timeRemaining: number;
  
  /** Total time allocated */
  totalTime: number;
  
  /** Whether timer is running */
  isRunning: boolean;
  
  /** Whether timer is in warning state */
  isWarning: boolean;
  
  /** Whether timer is in critical state */
  isCritical: boolean;
}

export interface AssassinResult {
  /** Selected target ID */
  targetId: string;
  
  /** Whether target was Merlin */
  wasCorrect: boolean;
  
  /** Final game outcome */
  gameOutcome: 'good-wins' | 'evil-wins';
  
  /** Timestamp of decision */
  timestamp: Date;
  
  /** Decision duration */
  decisionDuration: number;
  
  /** Final reveal sequence */
  revealSequence: RevealSequence;
}

export interface RevealSequence {
  /** Reveal stages */
  stages: RevealStage[];
  
  /** Current stage */
  currentStage: number;
  
  /** Whether sequence is complete */
  isComplete: boolean;
  
  /** Sequence duration */
  duration: number;
}

export interface RevealStage {
  /** Stage type */
  type: 'pause' | 'target-reveal' | 'role-reveal' | 'outcome-reveal' | 'celebration';
  
  /** Stage duration */
  duration: number;
  
  /** Stage description */
  description: string;
  
  /** Visual effects */
  effects: string[];
  
  /** Whether stage is active */
  isActive: boolean;
}

// Animation and UI Configuration
export const ASSASSIN_CONFIG = {
  DECISION_TIME: 180000, // 3 minutes in milliseconds
  WARNING_THRESHOLD: 60000, // 1 minute warning
  CRITICAL_THRESHOLD: 30000, // 30 second critical
  REVEAL_PAUSE_DURATION: 3000, // 3 second dramatic pause
  STAGE_TRANSITION_DURATION: 1000, // 1 second between stages
  PARTICLE_COUNT: 50, // Atmospheric particles
  PULSE_INTERVAL: 1000, // Timer pulse interval
  CONFIRMATION_DELAY: 2000, // Delay before confirmation
  RESULT_REVEAL_DURATION: 8000, // Total reveal sequence duration
} as const;

// Assassin Phase States
export type AssassinPhaseState = AssassinPhase['phase'];

// Result Types
export type AssassinOutcome = AssassinResult['gameOutcome'];

// Timer States
export type TimerState = 'normal' | 'warning' | 'critical' | 'expired';

// Reveal Stage Types
export type RevealStageType = RevealStage['type'];

// Strategic Information Types
export type StrategyInfoType = TargetHint['type'];
export type InsightType = BehavioralInsight['type'];
export type ClueType = MerlinClue['type'];

// Behavior Analysis Types
export type SuspicionLevel = BehaviorAnalysis['suspicionLevel'];
