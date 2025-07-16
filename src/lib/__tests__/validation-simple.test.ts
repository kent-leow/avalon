import { describe, it, expect } from '@jest/globals';
import { secureRoomCodeSchema, securePlayerNameSchema } from '../validation';

describe('Validation System - Basic Tests', () => {
  describe('secureRoomCodeSchema', () => {
    it('should accept valid room codes', () => {
      const result = secureRoomCodeSchema.parse('ABCD');
      expect(result).toBe('ABCD');
    });

    it('should reject invalid room codes', () => {
      expect(() => secureRoomCodeSchema.parse('abc')).toThrow();
    });
  });

  describe('securePlayerNameSchema', () => {
    it('should accept valid player names', () => {
      const result = securePlayerNameSchema.parse('TestPlayer');
      expect(result).toBe('TestPlayer');
    });

    it('should reject invalid player names', () => {
      expect(() => securePlayerNameSchema.parse('a')).toThrow();
    });
  });
});
