import { 
  createMissionVoteOptions,
  createMissionContext,
  calculateVotingProgress,
  validateMissionVote,
  calculateMissionResult,
  createMissionTeamMembers,
  shouldAutoCompleteVoting
} from '../mission-execution-utils';
import type { MissionVotingSession } from '~/types/mission-execution';

describe('Mission Execution Utils - Core Tests', () => {
  describe('createMissionVoteOptions', () => {
    it('should create correct options for good players', () => {
      const options = createMissionVoteOptions('good');
      
      expect(options).toHaveLength(2);
      expect(options[0]?.value).toBe('success');
      expect(options[0]?.available).toBe(true);
      expect(options[1]?.value).toBe('failure');
      expect(options[1]?.available).toBe(false);
    });

    it('should create correct options for evil players', () => {
      const options = createMissionVoteOptions('evil');
      
      expect(options).toHaveLength(2);
      expect(options[0]?.value).toBe('success');
      expect(options[0]?.available).toBe(true);
      expect(options[1]?.value).toBe('failure');
      expect(options[1]?.available).toBe(true);
    });
  });

  describe('createMissionContext', () => {
    it('should create correct context for normal mission', () => {
      const context = createMissionContext(1, 5, { good: 0, evil: 0 });
      
      expect(context.missionNumber).toBe(1);
      expect(context.totalMissions).toBe(5);
      expect(context.requiresTwoFails).toBe(false);
      expect(context.failVotesRequired).toBe(1);
      expect(context.stakes).toBe('medium');
    });

    it('should create correct context for 4th mission with 7+ players', () => {
      const context = createMissionContext(4, 7, { good: 0, evil: 0 });
      
      expect(context.missionNumber).toBe(4);
      expect(context.requiresTwoFails).toBe(true);
      expect(context.failVotesRequired).toBe(2);
      expect(context.stakes).toBe('critical');
    });
  });

  describe('calculateVotingProgress', () => {
    it('should calculate progress correctly', () => {
      const progress = calculateVotingProgress(3, 5, 30);
      
      expect(progress.votesSubmitted).toBe(3);
      expect(progress.totalVotes).toBe(5);
      expect(progress.percentageComplete).toBe(60);
      expect(progress.timeRemaining).toBe(30);
      expect(progress.isComplete).toBe(false);
    });

    it('should mark as complete when all votes are in', () => {
      const progress = calculateVotingProgress(5, 5, 0);
      
      expect(progress.percentageComplete).toBe(100);
      expect(progress.isComplete).toBe(true);
    });

    it('should handle zero votes', () => {
      const progress = calculateVotingProgress(0, 3);
      
      expect(progress.percentageComplete).toBe(0);
      expect(progress.isComplete).toBe(false);
      expect(progress.timeRemaining).toBeUndefined();
    });
  });

  describe('createMissionTeamMembers', () => {
    it('should create team members with correct data', () => {
      const teamMemberIds = ['player1', 'player2', 'player3'];
      const playerNames = {
        player1: 'Alice',
        player2: 'Bob',
        player3: 'Charlie'
      };
      const votedPlayers = ['player1', 'player3'];
      const currentPlayerId = 'player2';

      const members = createMissionTeamMembers(teamMemberIds, playerNames, votedPlayers, currentPlayerId);
      
      expect(members).toHaveLength(3);
      expect(members[0]?.playerId).toBe('player1');
      expect(members[0]?.playerName).toBe('Alice');
      expect(members[0]?.hasVoted).toBe(true);
      expect(members[0]?.isCurrentPlayer).toBe(false);
      expect(members[1]?.playerId).toBe('player2');
      expect(members[1]?.playerName).toBe('Bob');
      expect(members[1]?.hasVoted).toBe(false);
      expect(members[1]?.isCurrentPlayer).toBe(true);
    });

    it('should handle unknown player names', () => {
      const teamMemberIds = ['player1', 'player2'];
      const playerNames = { player1: 'Alice' };
      const votedPlayers: string[] = [];
      const currentPlayerId = 'player1';

      const members = createMissionTeamMembers(teamMemberIds, playerNames, votedPlayers, currentPlayerId);
      
      expect(members[0]?.playerName).toBe('Alice');
      expect(members[1]?.playerName).toBe('Unknown Player');
    });
  });

  describe('validateMissionVote', () => {
    it('should validate correct vote', () => {
      const session: MissionVotingSession = {
        missionNumber: 1,
        teamMembers: ['player1', 'player2'],
        votes: [],
        failVotesRequired: 1,
        failVotesReceived: 0,
        successVotesReceived: 0,
        isComplete: false,
        startTime: new Date(),
      };

      const result = validateMissionVote('player1', 'success', session, 'good');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject failure votes from good players', () => {
      const session: MissionVotingSession = {
        missionNumber: 1,
        teamMembers: ['player1', 'player2'],
        votes: [],
        failVotesRequired: 1,
        failVotesReceived: 0,
        successVotesReceived: 0,
        isComplete: false,
        startTime: new Date(),
      };

      const result = validateMissionVote('player1', 'failure', session, 'good');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Good players cannot vote for mission failure');
    });

    it('should allow failure votes from evil players', () => {
      const session: MissionVotingSession = {
        missionNumber: 1,
        teamMembers: ['player1', 'player2'],
        votes: [],
        failVotesRequired: 1,
        failVotesReceived: 0,
        successVotesReceived: 0,
        isComplete: false,
        startTime: new Date(),
      };

      const result = validateMissionVote('player1', 'failure', session, 'evil');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject vote from non-team member', () => {
      const session: MissionVotingSession = {
        missionNumber: 1,
        teamMembers: ['player1', 'player2'],
        votes: [],
        failVotesRequired: 1,
        failVotesReceived: 0,
        successVotesReceived: 0,
        isComplete: false,
        startTime: new Date(),
      };

      const result = validateMissionVote('player3', 'success', session, 'good');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('You are not on this mission team');
    });

    it('should reject vote when mission is complete', () => {
      const session: MissionVotingSession = {
        missionNumber: 1,
        teamMembers: ['player1', 'player2'],
        votes: [],
        failVotesRequired: 1,
        failVotesReceived: 0,
        successVotesReceived: 0,
        isComplete: true,
        startTime: new Date(),
      };

      const result = validateMissionVote('player1', 'success', session, 'good');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Mission voting has ended');
    });

    it('should reject duplicate votes', () => {
      const session: MissionVotingSession = {
        missionNumber: 1,
        teamMembers: ['player1', 'player2'],
        votes: [
          { playerId: 'player1', vote: 'success', timestamp: new Date() }
        ],
        failVotesRequired: 1,
        failVotesReceived: 0,
        successVotesReceived: 1,
        isComplete: false,
        startTime: new Date(),
      };

      const result = validateMissionVote('player1', 'success', session, 'good');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('You have already voted on this mission');
    });
  });

  describe('calculateMissionResult', () => {
    it('should calculate success result', () => {
      const session: MissionVotingSession = {
        missionNumber: 1,
        teamMembers: ['player1', 'player2'],
        votes: [
          { playerId: 'player1', vote: 'success', timestamp: new Date() },
          { playerId: 'player2', vote: 'success', timestamp: new Date() }
        ],
        failVotesRequired: 1,
        failVotesReceived: 0,
        successVotesReceived: 2,
        isComplete: true,
        startTime: new Date(),
      };

      const result = calculateMissionResult(session, { goodWins: 0, evilWins: 0 });
      
      expect(result.outcome).toBe('success');
      expect(result.votes.success).toBe(2);
      expect(result.votes.failure).toBe(0);
      expect(result.gameImpact.goodTeamWins).toBe(1);
      expect(result.gameImpact.evilTeamWins).toBe(0);
      expect(result.gameImpact.isGameOver).toBe(false);
    });

    it('should calculate failure result', () => {
      const session: MissionVotingSession = {
        missionNumber: 1,
        teamMembers: ['player1', 'player2'],
        votes: [
          { playerId: 'player1', vote: 'success', timestamp: new Date() },
          { playerId: 'player2', vote: 'failure', timestamp: new Date() }
        ],
        failVotesRequired: 1,
        failVotesReceived: 1,
        successVotesReceived: 1,
        isComplete: true,
        startTime: new Date(),
      };

      const result = calculateMissionResult(session, { goodWins: 0, evilWins: 0 });
      
      expect(result.outcome).toBe('failure');
      expect(result.votes.success).toBe(1);
      expect(result.votes.failure).toBe(1);
      expect(result.gameImpact.goodTeamWins).toBe(0);
      expect(result.gameImpact.evilTeamWins).toBe(1);
      expect(result.gameImpact.isGameOver).toBe(false);
    });

    it('should handle mission requiring 2 failures', () => {
      const session: MissionVotingSession = {
        missionNumber: 4,
        teamMembers: ['player1', 'player2', 'player3'],
        votes: [
          { playerId: 'player1', vote: 'success', timestamp: new Date() },
          { playerId: 'player2', vote: 'failure', timestamp: new Date() },
          { playerId: 'player3', vote: 'success', timestamp: new Date() }
        ],
        failVotesRequired: 2,
        failVotesReceived: 1,
        successVotesReceived: 2,
        isComplete: true,
        startTime: new Date(),
      };

      const result = calculateMissionResult(session, { goodWins: 2, evilWins: 1 });
      
      expect(result.outcome).toBe('success');
      expect(result.gameImpact.goodTeamWins).toBe(3);
      expect(result.gameImpact.isGameOver).toBe(true);
      expect(result.gameImpact.winner).toBe('good');
      expect(result.gameImpact.nextPhase).toBe('assassin-attempt');
    });

    it('should detect evil victory', () => {
      const session: MissionVotingSession = {
        missionNumber: 1,
        teamMembers: ['player1', 'player2'],
        votes: [
          { playerId: 'player1', vote: 'success', timestamp: new Date() },
          { playerId: 'player2', vote: 'failure', timestamp: new Date() }
        ],
        failVotesRequired: 1,
        failVotesReceived: 1,
        successVotesReceived: 1,
        isComplete: true,
        startTime: new Date(),
      };

      const result = calculateMissionResult(session, { goodWins: 0, evilWins: 2 });
      
      expect(result.outcome).toBe('failure');
      expect(result.gameImpact.evilTeamWins).toBe(3);
      expect(result.gameImpact.isGameOver).toBe(true);
      expect(result.gameImpact.winner).toBe('evil');
      expect(result.gameImpact.nextPhase).toBe('game-over');
    });

    it('should include result animations', () => {
      const session: MissionVotingSession = {
        missionNumber: 1,
        teamMembers: ['player1', 'player2'],
        votes: [
          { playerId: 'player1', vote: 'success', timestamp: new Date() },
          { playerId: 'player2', vote: 'success', timestamp: new Date() }
        ],
        failVotesRequired: 1,
        failVotesReceived: 0,
        successVotesReceived: 2,
        isComplete: true,
        startTime: new Date(),
      };

      const result = calculateMissionResult(session, { goodWins: 0, evilWins: 0 });
      
      expect(result.animations).toBeDefined();
      expect(result.animations.length).toBeGreaterThan(0);
      expect(result.animations[0]?.type).toBe('vote-reveal');
    });
  });

  describe('shouldAutoCompleteVoting', () => {
    it('should return true when all team members have voted', () => {
      const session: MissionVotingSession = {
        missionNumber: 1,
        teamMembers: ['player1', 'player2'],
        votes: [
          { playerId: 'player1', vote: 'success', timestamp: new Date() },
          { playerId: 'player2', vote: 'failure', timestamp: new Date() }
        ],
        failVotesRequired: 1,
        failVotesReceived: 1,
        successVotesReceived: 1,
        isComplete: false,
        startTime: new Date(),
      };

      expect(shouldAutoCompleteVoting(session)).toBe(true);
    });

    it('should return false when not all team members have voted', () => {
      const session: MissionVotingSession = {
        missionNumber: 1,
        teamMembers: ['player1', 'player2', 'player3'],
        votes: [
          { playerId: 'player1', vote: 'success', timestamp: new Date() }
        ],
        failVotesRequired: 1,
        failVotesReceived: 0,
        successVotesReceived: 1,
        isComplete: false,
        startTime: new Date(),
      };

      expect(shouldAutoCompleteVoting(session)).toBe(false);
    });
  });

  describe('edge cases and integration', () => {
    it('should handle empty team members array', () => {
      const members = createMissionTeamMembers([], {}, [], '');
      expect(members).toHaveLength(0);
    });

    it('should handle context for high-stakes missions', () => {
      const context = createMissionContext(3, 8, { good: 2, evil: 1 });
      expect(context.stakes).toBe('critical');
      expect(context.consequenceDescription).toContain('SUCCESS: Victory will trigger the Assassin\'s final gambit!');
    });

    it('should handle voting progress edge cases', () => {
      // Test division by zero case
      const progress = calculateVotingProgress(0, 0);
      expect(progress.percentageComplete).toBe(0); // Should handle NaN gracefully
      expect(progress.isComplete).toBe(true);
      
      // Test normal case
      const normalProgress = calculateVotingProgress(2, 5);
      expect(normalProgress.percentageComplete).toBe(40);
      expect(normalProgress.isComplete).toBe(false);
    });
  });
});
