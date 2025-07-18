/**
 * Game Layout System Tests
 * 
 * Unit tests for the Game Layout System components and utilities.
 */

import { describe, it, expect } from '@jest/globals';
import { 
  getLayoutMode, 
  getScreenSize, 
  isBreakpoint, 
  validateLayoutState,
  createInitialLayoutState,
  createMockLayoutData
} from '~/lib/game-layout-utils';

describe('Game Layout Utils', () => {
  describe('getLayoutMode', () => {
    it('returns mobile for small screens', () => {
      expect(getLayoutMode(320)).toBe('mobile');
      expect(getLayoutMode(767)).toBe('mobile');
    });

    it('returns tablet for medium screens', () => {
      expect(getLayoutMode(768)).toBe('tablet');
      expect(getLayoutMode(1023)).toBe('tablet');
    });

    it('returns desktop for large screens', () => {
      expect(getLayoutMode(1024)).toBe('desktop');
      expect(getLayoutMode(1920)).toBe('desktop');
    });
  });

  describe('getScreenSize', () => {
    it('returns correct screen size breakpoints', () => {
      expect(getScreenSize(320)).toBe('sm');
      expect(getScreenSize(768)).toBe('md');
      expect(getScreenSize(1024)).toBe('lg');
      expect(getScreenSize(1440)).toBe('xl');
      expect(getScreenSize(1920)).toBe('2xl');
    });
  });

  describe('isBreakpoint', () => {
    it('correctly identifies breakpoints', () => {
      expect(isBreakpoint(1024, 'md')).toBe(true);
      expect(isBreakpoint(1024, 'lg')).toBe(true);
      expect(isBreakpoint(1024, 'xl')).toBe(false);
    });
  });

  describe('validateLayoutState', () => {
    it('validates correct layout state', () => {
      const validState = createInitialLayoutState();
      expect(validateLayoutState(validState)).toBe(true);
    });

    it('rejects invalid layout state', () => {
      expect(validateLayoutState(null as any)).toBe(false);
      expect(validateLayoutState({} as any)).toBe(false);
    });
  });

  describe('createMockLayoutData', () => {
    it('creates valid mock data', () => {
      const mockData = createMockLayoutData('lobby');
      
      expect(mockData.gameProgress).toBeDefined();
      expect(mockData.playerStatus).toHaveLength(5);
      expect(mockData.navigationItems).toHaveLength(6);
      expect(mockData.sidebarSections).toHaveLength(4);
      expect(mockData.phaseActions).toHaveLength(2);
    });
  });

  describe('createInitialLayoutState', () => {
    it('creates valid initial state', () => {
      const state = createInitialLayoutState();
      
      expect(state.sidebarOpen).toBe(false);
      expect(state.currentPhase).toBe('lobby');
      expect(state.isFullscreen).toBe(false);
      expect(state.preferences).toBeDefined();
    });

    it('accepts overrides', () => {
      const state = createInitialLayoutState('voting', {
        sidebarOpen: true,
        isFullscreen: true
      });
      
      expect(state.sidebarOpen).toBe(true);
      expect(state.currentPhase).toBe('voting');
      expect(state.isFullscreen).toBe(true);
    });
  });
});
