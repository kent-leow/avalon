import { 
  createMissionVoteOptions,
  createMissionContext,
  validateMissionVote,
  calculateMissionResult,
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
});
