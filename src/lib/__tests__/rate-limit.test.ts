import { describe, it, expect, beforeEach } from '@jest/globals';
import { 
  rateLimit, 
  rateLimitByIP, 
  rateLimitByUser, 
  rateLimitByRoom,
  RATE_LIMIT_CONFIGS,
  RateLimitError,
  createRateLimitMiddleware,
  rateLimits 
} from '../rate-limit';

// Mock NextRequest
const mockRequest = {
  headers: {
    get: jest.fn(),
  },
} as any;

describe('Rate Limiting System', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear rate limit store
    rateLimits.clear();
  });

  describe('rateLimit', () => {
    it('should allow requests within limit', () => {
      const result = rateLimit('test-user', { limit: 5, window: 60000 });
      
      expect(result.success).toBe(true);
      expect(result.remaining).toBe(4);
      expect(result.limit).toBe(5);
      expect(result.reset).toBeGreaterThan(Date.now());
    });

    it('should track multiple requests', () => {
      const config = { limit: 3, window: 60000 };
      
      const result1 = rateLimit('test-user', config);
      expect(result1.success).toBe(true);
      expect(result1.remaining).toBe(2);
      
      const result2 = rateLimit('test-user', config);
      expect(result2.success).toBe(true);
      expect(result2.remaining).toBe(1);
      
      const result3 = rateLimit('test-user', config);
      expect(result3.success).toBe(true);
      expect(result3.remaining).toBe(0);
    });

    it('should block requests when limit exceeded', () => {
      const config = { limit: 2, window: 60000 };
      
      rateLimit('test-user', config);
      rateLimit('test-user', config);
      
      const result = rateLimit('test-user', config);
      expect(result.success).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('should reset after window expires', () => {
      const config = { limit: 2, window: 100 }; // 100ms window
      
      const result1 = rateLimit('test-user', config);
      expect(result1.success).toBe(true);
      
      // Wait for window to expire
      setTimeout(() => {
        const result2 = rateLimit('test-user', config);
        expect(result2.success).toBe(true);
        expect(result2.remaining).toBe(1);
      }, 150);
    });

    it('should handle different identifiers separately', () => {
      const config = { limit: 2, window: 60000 };
      
      const result1 = rateLimit('user1', config);
      const result2 = rateLimit('user2', config);
      
      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(result1.remaining).toBe(1);
      expect(result2.remaining).toBe(1);
    });
  });

  describe('rateLimitByIP', () => {
    it('should extract IP from x-forwarded-for header', () => {
      mockRequest.headers.get.mockImplementation((header: string) => {
        if (header === 'x-forwarded-for') return '192.168.1.1, 10.0.0.1';
        return null;
      });

      const result = rateLimitByIP(mockRequest);
      expect(result.success).toBe(true);
    });

    it('should extract IP from x-real-ip header', () => {
      mockRequest.headers.get.mockImplementation((header: string) => {
        if (header === 'x-real-ip') return '192.168.1.2';
        return null;
      });

      const result = rateLimitByIP(mockRequest);
      expect(result.success).toBe(true);
    });

    it('should fallback to default IP when no headers present', () => {
      mockRequest.headers.get.mockReturnValue(null);

      const result = rateLimitByIP(mockRequest);
      expect(result.success).toBe(true);
    });

    it('should apply rate limiting by IP', () => {
      mockRequest.headers.get.mockImplementation((header: string) => {
        if (header === 'x-forwarded-for') return '192.168.1.1';
        return null;
      });

      const config = { limit: 1, window: 60000 };
      
      const result1 = rateLimitByIP(mockRequest, config);
      const result2 = rateLimitByIP(mockRequest, config);
      
      expect(result1.success).toBe(true);
      expect(result2.success).toBe(false);
    });
  });

  describe('rateLimitByUser', () => {
    it('should prefix identifier with user:', () => {
      const result1 = rateLimitByUser('user123', { limit: 2, window: 60000 });
      const result2 = rateLimitByUser('user123', { limit: 2, window: 60000 });
      
      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(result1.remaining).toBe(1);
      expect(result2.remaining).toBe(0);
    });

    it('should handle different users separately', () => {
      const config = { limit: 1, window: 60000 };
      
      const result1 = rateLimitByUser('user1', config);
      const result2 = rateLimitByUser('user2', config);
      
      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
    });
  });

  describe('rateLimitByRoom', () => {
    it('should prefix identifier with room:', () => {
      const result1 = rateLimitByRoom('ROOM123', { limit: 2, window: 60000 });
      const result2 = rateLimitByRoom('ROOM123', { limit: 2, window: 60000 });
      
      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(result1.remaining).toBe(1);
      expect(result2.remaining).toBe(0);
    });

    it('should handle different rooms separately', () => {
      const config = { limit: 1, window: 60000 };
      
      const result1 = rateLimitByRoom('ROOM1', config);
      const result2 = rateLimitByRoom('ROOM2', config);
      
      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
    });
  });

  describe('RATE_LIMIT_CONFIGS', () => {
    it('should have predefined configurations', () => {
      expect(RATE_LIMIT_CONFIGS.API_GENERAL).toEqual({
        limit: 100,
        window: 60 * 1000,
      });
      
      expect(RATE_LIMIT_CONFIGS.ROOM_CREATE).toEqual({
        limit: 5,
        window: 60 * 1000,
      });
      
      expect(RATE_LIMIT_CONFIGS.AUTH_ATTEMPTS).toEqual({
        limit: 5,
        window: 15 * 60 * 1000,
      });
    });
  });

  describe('RateLimitError', () => {
    it('should create error with correct properties', () => {
      const error = new RateLimitError(0, 1640995200000, 100);
      
      expect(error.message).toBe('Rate limit exceeded');
      expect(error.name).toBe('RateLimitError');
      expect(error.remaining).toBe(0);
      expect(error.reset).toBe(1640995200000);
      expect(error.limit).toBe(100);
    });

    it('should be instance of Error', () => {
      const error = new RateLimitError(0, 1640995200000, 100);
      expect(error instanceof Error).toBe(true);
    });
  });

  describe('createRateLimitMiddleware', () => {
    it('should create middleware function', () => {
      const config = { limit: 10, window: 60000 };
      const middleware = createRateLimitMiddleware(config);
      
      expect(typeof middleware).toBe('function');
    });

    it('should return result when within limit', () => {
      mockRequest.headers.get.mockReturnValue('192.168.1.1');
      
      const config = { limit: 10, window: 60000 };
      const middleware = createRateLimitMiddleware(config);
      
      const result = middleware(mockRequest);
      expect(result.success).toBe(true);
    });

    it('should throw RateLimitError when limit exceeded', () => {
      mockRequest.headers.get.mockReturnValue('192.168.1.1');
      
      const config = { limit: 1, window: 60000 };
      const middleware = createRateLimitMiddleware(config);
      
      middleware(mockRequest); // First request
      
      expect(() => {
        middleware(mockRequest); // Second request should throw
      }).toThrow(RateLimitError);
    });
  });
});
