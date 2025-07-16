import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// Mock the jose library
jest.mock('jose');

// Mock next/headers
jest.mock('next/headers');

// Mock environment
process.env.JWT_SECRET = 'test-secret';

import { 
  createSession, 
  verifySession, 
  updateSession, 
  destroySession,
  requireAuth,
  requireRoomAccess,
  type SessionData 
} from '../auth';

const mockCookies = {
  set: jest.fn(),
  get: jest.fn(),
  delete: jest.fn(),
};

describe('Auth System', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock jose functions
    const { SignJWT, jwtVerify } = require('jose');
    (SignJWT as jest.Mock).mockImplementation(() => ({
      setProtectedHeader: jest.fn().mockReturnThis(),
      setIssuedAt: jest.fn().mockReturnThis(),
      setExpirationTime: jest.fn().mockReturnThis(),
      sign: jest.fn().mockResolvedValue('mocked-jwt-token'),
    }));
    
    // Mock next/headers
    const { cookies } = require('next/headers');
    (cookies as jest.Mock).mockResolvedValue(mockCookies);
  });

  describe('createSession', () => {
    it('should create a session with correct parameters', async () => {
      await createSession('user123', 'ROOM123', 'TestUser', true);

      expect(mockCookies.set).toHaveBeenCalledWith('session', 'mocked-jwt-token', {
        httpOnly: true,
        secure: false, // NODE_ENV is not production in tests
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000,
        path: '/',
      });
    });

    it('should handle non-host users', async () => {
      await createSession('user456', 'ROOM456', 'TestUser2', false);

      expect(mockCookies.set).toHaveBeenCalledWith('session', 'mocked-jwt-token', expect.objectContaining({
        httpOnly: true,
        secure: false,
        sameSite: 'strict',
      }));
    });

    it('should default isHost to false when not provided', async () => {
      await createSession('user789', 'ROOM789', 'TestUser3');

      expect(mockCookies.set).toHaveBeenCalledWith('session', 'mocked-jwt-token', expect.objectContaining({
        httpOnly: true,
      }));
    });
  });

  describe('verifySession', () => {
    it('should return null when no session cookie exists', async () => {
      mockCookies.get.mockReturnValue(undefined);

      const result = await verifySession();

      expect(result).toBeNull();
    });

    it('should return null when session cookie has no value', async () => {
      mockCookies.get.mockReturnValue({ value: undefined });

      const result = await verifySession();

      expect(result).toBeNull();
    });

    it('should return session data when token is valid', async () => {
      const mockPayload: SessionData = {
        userId: 'user123',
        roomCode: 'ROOM123',
        playerName: 'TestUser',
        isHost: true,
      };

      mockCookies.get.mockReturnValue({ value: 'valid-token' });
      
      const { jwtVerify } = require('jose');
      (jwtVerify as any).mockResolvedValue({ payload: mockPayload });

      const result = await verifySession();

      expect(result).toEqual(mockPayload);
    });

    it('should return null when token verification fails', async () => {
      mockCookies.get.mockReturnValue({ value: 'invalid-token' });
      
      const { jwtVerify } = require('jose');
      (jwtVerify as any).mockRejectedValue(new Error('Invalid token'));

      const result = await verifySession();

      expect(result).toBeNull();
    });
  });

  describe('updateSession', () => {
    it('should update session with new data', async () => {
      const mockCurrentSession: SessionData = {
        userId: 'user123',
        roomCode: 'ROOM123',
        playerName: 'TestUser',
        isHost: false,
      };

      mockCookies.get.mockReturnValue({ value: 'valid-token' });
      
      const { jwtVerify } = require('jose');
      (jwtVerify as any).mockResolvedValue({ payload: mockCurrentSession });

      const updates = { isHost: true, playerName: 'UpdatedUser' };
      await updateSession(updates);

      expect(mockCookies.set).toHaveBeenCalledWith('session', 'mocked-jwt-token', expect.any(Object));
    });

    it('should throw error when no active session exists', async () => {
      mockCookies.get.mockReturnValue(undefined);

      await expect(updateSession({ isHost: true })).rejects.toThrow('No active session to update');
    });
  });

  describe('destroySession', () => {
    it('should delete the session cookie', async () => {
      await destroySession();

      expect(mockCookies.delete).toHaveBeenCalledWith('session');
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

      mockCookies.get.mockReturnValue({ value: 'valid-token' });
      
      const { jwtVerify } = require('jose');
      (jwtVerify as any).mockResolvedValue({ payload: mockSession });

      const result = await requireAuth();

      expect(result).toEqual(mockSession);
    });

    it('should throw error when user is not authenticated', async () => {
      mockCookies.get.mockReturnValue(undefined);

      await expect(requireAuth()).rejects.toThrow('Authentication required');
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

      mockCookies.get.mockReturnValue({ value: 'valid-token' });
      
      const { jwtVerify } = require('jose');
      (jwtVerify as any).mockResolvedValue({ payload: mockSession });

      const result = await requireRoomAccess('ROOM123');

      expect(result).toEqual(mockSession);
    });

    it('should throw error when user does not have access to room', async () => {
      const mockSession: SessionData = {
        userId: 'user123',
        roomCode: 'ROOM123',
        playerName: 'TestUser',
        isHost: true,
      };

      mockCookies.get.mockReturnValue({ value: 'valid-token' });
      
      const { jwtVerify } = require('jose');
      (jwtVerify as any).mockResolvedValue({ payload: mockSession });

      await expect(requireRoomAccess('ROOM456')).rejects.toThrow('Access denied to this room');
    });

    it('should throw error when user is not authenticated', async () => {
      mockCookies.get.mockReturnValue(undefined);

      await expect(requireRoomAccess('ROOM123')).rejects.toThrow('Authentication required');
    });
  });
});
