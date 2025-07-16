import { 
  calculateVotingProgress,
  calculateVotingResults,
  validateVotingSession,
  areAllPlayersVoted,
  calculateTimeRemaining,
  getNextLeaderIndex,
  createMockVotingSession
} from '../voting-utils';
import type { VotingSession, Vote, VoteChoice } from '~/types/voting';

describe('Voting Utils', () => {
  const mockPlayers = [
    { id: 'p1', name: 'Alice', isOnline: true },
    { id: 'p2', name: 'Bob', isOnline: true },
    { id: 'p3', name: 'Charlie', isOnline: true },
    { id: 'p4', name: 'Diana', isOnline: true },
    { id: 'p5', name: 'Eve', isOnline: true },
  ];

  const mockVotes: Vote[] = [
    { id: 'v1', playerId: 'p1', playerName: 'Alice', choice: 'approve', submittedAt: new Date(), roundId: 'r1', missionId: 'm1' },
    { id: 'v2', playerId: 'p2', playerName: 'Bob', choice: 'approve', submittedAt: new Date(), roundId: 'r1', missionId: 'm1' },
    { id: 'v3', playerId: 'p3', playerName: 'Charlie', choice: 'reject', submittedAt: new Date(), roundId: 'r1', missionId: 'm1' },
  ];

  test('should calculate voting progress correctly', () => {
    const progress = calculateVotingProgress(mockVotes, mockPlayers);
    
    expect(progress.votedPlayers).toHaveLength(3);
    expect(progress.remainingPlayers).toHaveLength(2);
    expect(progress.totalPlayers).toBe(5);
    expect(progress.votesReceived).toBe(3);
    expect(progress.percentage).toBe(60);
  });

  test('should calculate voting results correctly', () => {
    const allVotes: Vote[] = [
      { id: 'v1', playerId: 'p1', playerName: 'Alice', choice: 'approve', submittedAt: new Date(), roundId: 'r1', missionId: 'm1' },
      { id: 'v2', playerId: 'p2', playerName: 'Bob', choice: 'approve', submittedAt: new Date(), roundId: 'r1', missionId: 'm1' },
      { id: 'v3', playerId: 'p3', playerName: 'Charlie', choice: 'approve', submittedAt: new Date(), roundId: 'r1', missionId: 'm1' },
      { id: 'v4', playerId: 'p4', playerName: 'Diana', choice: 'reject', submittedAt: new Date(), roundId: 'r1', missionId: 'm1' },
      { id: 'v5', playerId: 'p5', playerName: 'Eve', choice: 'reject', submittedAt: new Date(), roundId: 'r1', missionId: 'm1' },
    ];
    
    const result = calculateVotingResults(allVotes, 5, 0, 0, 5);
    
    expect(result.approved).toBe(true);
    expect(result.approveCount).toBe(3);
    expect(result.rejectCount).toBe(2);
    expect(result.totalVotes).toBe(5);
    expect(result.nextPhase).toBe('mission');
  });

  test('should calculate rejection results correctly', () => {
    const rejectVotes: Vote[] = [
      { id: 'v1', playerId: 'p1', playerName: 'Alice', choice: 'reject', submittedAt: new Date(), roundId: 'r1', missionId: 'm1' },
      { id: 'v2', playerId: 'p2', playerName: 'Bob', choice: 'reject', submittedAt: new Date(), roundId: 'r1', missionId: 'm1' },
      { id: 'v3', playerId: 'p3', playerName: 'Charlie', choice: 'reject', submittedAt: new Date(), roundId: 'r1', missionId: 'm1' },
      { id: 'v4', playerId: 'p4', playerName: 'Diana', choice: 'approve', submittedAt: new Date(), roundId: 'r1', missionId: 'm1' },
      { id: 'v5', playerId: 'p5', playerName: 'Eve', choice: 'approve', submittedAt: new Date(), roundId: 'r1', missionId: 'm1' },
    ];
    
    const result = calculateVotingResults(rejectVotes, 5, 0, 0, 5);
    
    expect(result.approved).toBe(false);
    expect(result.approveCount).toBe(2);
    expect(result.rejectCount).toBe(3);
    expect(result.nextPhase).toBe('teamSelection');
    expect(result.nextLeaderIndex).toBe(1);
  });

  test('should detect evil victory on max rejections', () => {
    const rejectVotes: Vote[] = [
      { id: 'v1', playerId: 'p1', playerName: 'Alice', choice: 'reject', submittedAt: new Date(), roundId: 'r1', missionId: 'm1' },
      { id: 'v2', playerId: 'p2', playerName: 'Bob', choice: 'reject', submittedAt: new Date(), roundId: 'r1', missionId: 'm1' },
      { id: 'v3', playerId: 'p3', playerName: 'Charlie', choice: 'reject', submittedAt: new Date(), roundId: 'r1', missionId: 'm1' },
      { id: 'v4', playerId: 'p4', playerName: 'Diana', choice: 'approve', submittedAt: new Date(), roundId: 'r1', missionId: 'm1' },
      { id: 'v5', playerId: 'p5', playerName: 'Eve', choice: 'approve', submittedAt: new Date(), roundId: 'r1', missionId: 'm1' },
    ];
    
    const result = calculateVotingResults(rejectVotes, 5, 4, 0, 5); // 4 rejections already
    
    expect(result.approved).toBe(false);
    expect(result.nextPhase).toBe('evilVictory');
  });

  test('should validate voting session correctly', () => {
    const session = createMockVotingSession('mission-1', ['p1', 'p2']);
    const validation = validateVotingSession(session, 'p1', 'approve');
    
    expect(validation.isValid).toBe(true);
    expect(validation.errors).toHaveLength(0);
  });

  test('should detect all players have voted', () => {
    const allVotes: Vote[] = [
      { id: 'v1', playerId: 'p1', playerName: 'Alice', choice: 'approve', submittedAt: new Date(), roundId: 'r1', missionId: 'm1' },
      { id: 'v2', playerId: 'p2', playerName: 'Bob', choice: 'approve', submittedAt: new Date(), roundId: 'r1', missionId: 'm1' },
      { id: 'v3', playerId: 'p3', playerName: 'Charlie', choice: 'reject', submittedAt: new Date(), roundId: 'r1', missionId: 'm1' },
      { id: 'v4', playerId: 'p4', playerName: 'Diana', choice: 'reject', submittedAt: new Date(), roundId: 'r1', missionId: 'm1' },
      { id: 'v5', playerId: 'p5', playerName: 'Eve', choice: 'approve', submittedAt: new Date(), roundId: 'r1', missionId: 'm1' },
    ];
    
    expect(areAllPlayersVoted(allVotes, 5)).toBe(true);
    expect(areAllPlayersVoted(allVotes, 6)).toBe(false);
  });

  test('should calculate time remaining correctly', () => {
    const futureDeadline = new Date(Date.now() + 10000); // 10 seconds from now
    const timeRemaining = calculateTimeRemaining(futureDeadline);
    
    expect(timeRemaining).toBeGreaterThan(9);
    expect(timeRemaining).toBeLessThanOrEqual(10);
  });

  test('should calculate next leader index correctly', () => {
    expect(getNextLeaderIndex(0, 5)).toBe(1);
    expect(getNextLeaderIndex(4, 5)).toBe(0); // Wrap around
    expect(getNextLeaderIndex(2, 7)).toBe(3);
  });

  test('should create mock voting session', () => {
    const session = createMockVotingSession('mission-1', ['p1', 'p2']);
    
    expect(session.missionId).toBe('mission-1');
    expect(session.proposedTeam).toEqual(['p1', 'p2']);
    expect(session.status).toBe('active');
    expect(session.votes).toEqual([]);
  });
});
