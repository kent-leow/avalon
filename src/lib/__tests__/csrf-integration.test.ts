// Test file to verify CSRF token integration
import { describe, it, expect, beforeEach } from '@jest/globals';
import { getCSRFTokenFromMeta, addCSRFTokenToHeaders } from '~/hooks/useCSRFToken';

// Mock DOM
const mockDocument = {
  querySelector: jest.fn(),
};

// Mock window object
Object.defineProperty(global, 'window', {
  value: {},
  writable: true,
});

// Mock document
Object.defineProperty(global, 'document', {
  value: mockDocument,
  writable: true,
});

describe('CSRF Token Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCSRFTokenFromMeta', () => {
    it('should return null when no meta tag exists', () => {
      mockDocument.querySelector.mockReturnValue(null);
      const token = getCSRFTokenFromMeta();
      expect(token).toBe(null);
    });

    it('should return token when meta tag exists', () => {
      const mockMetaTag = {
        getAttribute: jest.fn().mockReturnValue('test-csrf-token'),
      };
      mockDocument.querySelector.mockReturnValue(mockMetaTag);
      
      const token = getCSRFTokenFromMeta();
      expect(token).toBe('test-csrf-token');
      expect(mockDocument.querySelector).toHaveBeenCalledWith('meta[name="csrf-token"]');
    });

    it('should return null when meta tag has no content', () => {
      const mockMetaTag = {
        getAttribute: jest.fn().mockReturnValue(null),
      };
      mockDocument.querySelector.mockReturnValue(mockMetaTag);
      
      const token = getCSRFTokenFromMeta();
      expect(token).toBe(null);
    });
  });

  describe('addCSRFTokenToHeaders', () => {
    it('should add CSRF token to headers when available', () => {
      const mockMetaTag = {
        getAttribute: jest.fn().mockReturnValue('test-csrf-token'),
      };
      mockDocument.querySelector.mockReturnValue(mockMetaTag);
      
      const headers = new Headers();
      const updatedHeaders = addCSRFTokenToHeaders(headers);
      
      expect(updatedHeaders.get('x-csrf-token')).toBe('test-csrf-token');
    });

    it('should not add CSRF token when not available', () => {
      mockDocument.querySelector.mockReturnValue(null);
      
      const headers = new Headers();
      const updatedHeaders = addCSRFTokenToHeaders(headers);
      
      expect(updatedHeaders.get('x-csrf-token')).toBe(null);
    });
  });
});
