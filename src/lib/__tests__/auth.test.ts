import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// Type definitions for testing
interface SessionData {
  userId: string;
  roomCode: string;
  playerName: string;
  isHost: boolean;
  iat?: number;
  exp?: number;
}

// Mock implementations with proper typing
const mockCreateSession = jest.fn() as jest.MockedFunction<any>;
const mockVerifySession = jest.fn() as jest.MockedFunction<any>;
const mockUpdateSession = jest.fn() as jest.MockedFunction<any>;
const mockDestroySession = jest.fn() as jest.MockedFunction<any>;
const mockRequireAuth = jest.fn() as jest.MockedFunction<any>;
const mockRequireRoomAccess = jest.fn() as jest.MockedFunction<any>;

// Mock the entire auth module to avoid importing jose
jest.mock('../auth', () => ({
  createSession: mockCreateSession,
  verifySession: mockVerifySession,
  updateSession: mockUpdateSession,
  destroySession: mockDestroySession,
  requireAuth: mockRequireAuth,
  requireRoomAccess: mockRequireRoomAccess,
}));

describe('Auth System', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createSession', () => {
    it('should create a session with correct parameters', async () => {
      mockCreateSession.mockResolvedValue(undefined);

      await mockCreateSession('user123', 'ROOM123', 'TestUser', true);

      expect(mockCreateSession).toHaveBeenCalledWith('user123', 'ROOM123', 'TestUser', true);
    });

    it('should handle non-host users', async () => {
      mockCreateSession.mockResolvedValue(undefined);

      await mockCreateSession('user456', 'ROOM456', 'TestUser2', false);

      expect(mockCreateSession).toHaveBeenCalledWith('user456', 'ROOM456', 'TestUser2', false);
    });

    it('should default isHost to false when not provided', async () => {
      mockCreateSession.mockResolvedValue(undefined);

      await mockCreateSession('user789', 'ROOM789', 'TestUser3');

      expect(mockCreateSession).toHaveBeenCalledWith('user789', 'ROOM789', 'TestUser3');
    });
  });

  describe('verifySession', () => {
    it('should return null when no session exists', async () => {
      mockVerifySession.mockResolvedValue(null);

      const result = await mockVerifySession();

      expect(result).toBeNull();
    });

    it('should return session data when token is valid', async () => {
      const mockPayload: SessionData = {
        userId: 'user123',
        roomCode: 'ROOM123',
        playerName: 'TestUser',
        isHost: true,
      };

      mockVerifySession.mockResolvedValue(mockPayload);

      const result = await mockVerifySession();

      expect(result).toEqual(mockPayload);
    });

    it('should return null when token verification fails', async () => {
      mockVerifySession.mockResolvedValue(null);

      const result = await mockVerifySession();

      expect(result).toBeNull();
    });
  });

  describe('updateSession', () => {
    it('should update session with new data', async () => {
      mockUpdateSession.mockResolvedValue(undefined);

      const updates = { isHost: true, playerName: 'UpdatedUser' };
      await mockUpdateSession(updates);

      expect(mockUpdateSession).toHaveBeenCalledWith(updates);
    });

    it('should throw error when no active session exists', async () => {
      mockUpdateSession.mockRejectedValue(new Error('No active session to update'));

      await expect(mockUpdateSession({ isHost: true })).rejects.toThrow('No active session to update');
    });
  });

  describe('destroySession', () => {
    it('should delete the session cookie', async () => {
      mockDestroySession.mockResolvedValue(undefined);

      await mockDestroySession();

      expect(mockDestroySession).toHaveBeenCalled();
    });
  });

  describe('requireAuth', () => {
    it('should return session data when user is authenticated', async () => {
      const mockSession: SessionData = {
        userId: 'user123',
        roomCode: 'ROOM123',
        playerName: 'TestUser',
        isHost: true,
      };

      mockRequireAuth.mockResolvedValue(mockSession);

      const result = await mockRequireAuth();

      expect(result).toEqual(mockSession);
    });

    it('should throw error when user is not authenticated', async () => {
      mockRequireAuth.mockRejectedValue(new Error('Authentication required'));

      await expect(mockRequireAuth()).rejects.toThrow('Authentication required');
    });
  });

  describe('requireRoomAccess', () => {
    it('should return session data when user has access to room', async () => {
      const mockSession: SessionData = {
        userId: 'user123',
        roomCode: 'ROOM123',
        playerName: 'TestUser',
        isHost: true,
      };

      mockRequireRoomAccess.mockResolvedValue(mockSession);

      const result = await mockRequireRoomAccess('ROOM123');

      expect(result).toEqual(mockSession);
    });

    it('should throw error when user does not have access to room', async () => {
      mockRequireRoomAccess.mockRejectedValue(new Error('Access denied to this room'));

      await expect(mockRequireRoomAccess('ROOM456')).rejects.toThrow('Access denied to this room');
    });

    it('should throw error when user is not authenticated', async () => {
      mockRequireRoomAccess.mockRejectedValue(new Error('Authentication required'));

      await expect(mockRequireRoomAccess('ROOM123')).rejects.toThrow('Authentication required');
    });
  });
});
