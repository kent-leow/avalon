import { describe, it, expect } from '@jest/globals';
import { RATE_LIMIT_CONFIGS, RateLimitError } from '../rate-limit';

describe('Rate Limiting System - Configuration Tests', () => {
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
});
