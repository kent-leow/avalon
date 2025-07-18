import type { GamePhase } from '~/types/game-state';
import type { 
  LayoutState, 
  LayoutMode, 
  ScreenSize, 
  LayoutPreferences,
  GameProgress,
  PlayerStatus,
  NavigationItem,
  SidebarSection,
  PhaseAction,
  MockLayoutData
} from '~/types/game-layout';
import { LAYOUT_BREAKPOINTS, LAYOUT_DIMENSIONS } from '~/types/game-layout';

/**
 * Game Layout Utilities
 * 
 * Utility functions for managing game layout state, responsive behavior,
 * and layout calculations.
 */

/**
 * Determine layout mode based on screen width
 */
export function getLayoutMode(screenWidth: number): LayoutMode {
  if (screenWidth < LAYOUT_BREAKPOINTS.md) {
    return 'mobile';
  } else if (screenWidth < LAYOUT_BREAKPOINTS.lg) {
    return 'tablet';
  } else {
    return 'desktop';
  }
}

/**
 * Get screen size breakpoint
 */
export function getScreenSize(screenWidth: number): ScreenSize {
  if (screenWidth < LAYOUT_BREAKPOINTS.md) {
    return 'sm';
  } else if (screenWidth < LAYOUT_BREAKPOINTS.lg) {
    return 'md';
  } else if (screenWidth < LAYOUT_BREAKPOINTS.xl) {
    return 'lg';
  } else if (screenWidth < LAYOUT_BREAKPOINTS['2xl']) {
    return 'xl';
  } else {
    return '2xl';
  }
}

/**
 * Check if screen width meets breakpoint
 */
export function isBreakpoint(screenWidth: number, breakpoint: keyof typeof LAYOUT_BREAKPOINTS): boolean {
  return screenWidth >= LAYOUT_BREAKPOINTS[breakpoint];
}

/**
 * Calculate available content height
 */
export function calculateContentHeight(layoutState: LayoutState): number {
  const { navigationHeight, footerHeight } = LAYOUT_DIMENSIONS;
  const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 768;
  
  return viewportHeight - navigationHeight - footerHeight;
}

/**
 * Determine if navigation should auto-hide for phase
 */
export function shouldAutoHideNavigation(phase: GamePhase, preferences: LayoutPreferences): boolean {
  if (!preferences.autoHideNavigation) return false;
  
  // Auto-hide during immersive phases
  const immersivePhases: GamePhase[] = ['roleReveal', 'missionVote', 'assassinAttempt'];
  return immersivePhases.includes(phase);
}

/**
 * Get default layout preferences
 */
export function getDefaultLayoutPreferences(): LayoutPreferences {
  return {
    sidebarDefaultOpen: false,
    animationsEnabled: true,
    compactMode: false,
    autoHideNavigation: false,
    preferredTheme: 'dark',
    reducedMotion: false
  };
}

/**
 * Create initial layout state
 */
export function createInitialLayoutState(
  phase: GamePhase = 'lobby',
  overrides: Partial<LayoutState> = {}
): LayoutState {
  const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1024;
  const isMobile = screenWidth < LAYOUT_BREAKPOINTS.md;
  
  return {
    sidebarOpen: false,
    isMobile,
    screenSize: getScreenSize(screenWidth),
    orientation: typeof window !== 'undefined' && window.innerHeight > window.innerWidth ? 'portrait' : 'landscape',
    layoutMode: getLayoutMode(screenWidth),
    currentPhase: phase,
    isFullscreen: false,
    preferences: getDefaultLayoutPreferences(),
    ...overrides
  };
}

/**
 * Update layout state based on screen size change
 */
export function updateLayoutForScreenSize(
  currentLayout: LayoutState,
  screenWidth: number,
  screenHeight: number
): LayoutState {
  const isMobile = screenWidth < LAYOUT_BREAKPOINTS.md;
  const orientation = screenHeight > screenWidth ? 'portrait' : 'landscape';
  
  return {
    ...currentLayout,
    isMobile,
    screenSize: getScreenSize(screenWidth),
    layoutMode: getLayoutMode(screenWidth),
    orientation,
    // Auto-close sidebar on mobile
    sidebarOpen: isMobile ? false : currentLayout.sidebarOpen
  };
}

/**
 * Get phase-specific layout configuration
 */
export function getPhaseLayoutConfig(phase: GamePhase): Partial<LayoutState> {
  switch (phase) {
    case 'roleReveal':
      return {
        isFullscreen: true,
        sidebarOpen: false
      };
    case 'missionVote':
      return {
        isFullscreen: true,
        sidebarOpen: false
      };
    case 'assassinAttempt':
      return {
        isFullscreen: true,
        sidebarOpen: false
      };
    default:
      return {
        isFullscreen: false
      };
  }
}

/**
 * Validate layout state
 */
export function validateLayoutState(layout: LayoutState): boolean {
  if (!layout) return false;
  
  const requiredFields = ['sidebarOpen', 'isMobile', 'screenSize', 'orientation', 'layoutMode', 'currentPhase'];
  const hasRequiredFields = requiredFields.every(field => layout.hasOwnProperty(field));
  
  if (!hasRequiredFields) return false;
  
  const validScreenSizes: ScreenSize[] = ['sm', 'md', 'lg', 'xl', '2xl'];
  const validLayoutModes: LayoutMode[] = ['desktop', 'tablet', 'mobile'];
  const validOrientations = ['portrait', 'landscape'];
  
  return (
    validScreenSizes.includes(layout.screenSize) &&
    validLayoutModes.includes(layout.layoutMode) &&
    validOrientations.includes(layout.orientation)
  );
}

/**
 * Get CSS classes for layout container
 */
export function getLayoutContainerClasses(layout: LayoutState): string {
  const baseClasses = 'min-h-screen bg-[#0a0a0f] text-[#e5e7eb] flex flex-col';
  const mobileClasses = layout.isMobile ? 'mobile-layout' : 'desktop-layout';
  const fullscreenClasses = layout.isFullscreen ? 'fullscreen-layout' : '';
  const animationClasses = layout.preferences.animationsEnabled ? 'transition-all duration-300' : '';
  const compactClasses = layout.preferences.compactMode ? 'compact-layout' : '';
  
  return `${baseClasses} ${mobileClasses} ${fullscreenClasses} ${animationClasses} ${compactClasses}`.trim();
}

/**
 * Get CSS classes for navigation bar
 */
export function getNavigationBarClasses(layout: LayoutState): string {
  const baseClasses = 'bg-[#1a1a2e] border-b border-[#252547] px-4 py-4';
  const heightClasses = `h-[${LAYOUT_DIMENSIONS.navigationHeight}px]`;
  const responsiveClasses = layout.isMobile ? 'mobile-nav' : 'desktop-nav';
  
  return `${baseClasses} ${heightClasses} ${responsiveClasses}`.trim();
}

/**
 * Get CSS classes for sidebar
 */
export function getSidebarClasses(layout: LayoutState): string {
  const baseClasses = 'bg-[#252547] border-r border-[#3d3d7a] overflow-y-auto';
  const widthClasses = layout.isMobile ? 'w-full' : `w-[${LAYOUT_DIMENSIONS.sidebarWidth}px]`;
  const positionClasses = layout.isMobile ? 'fixed inset-y-0 left-0 z-50' : 'relative';
  const openClasses = layout.sidebarOpen ? 'translate-x-0' : '-translate-x-full';
  const animationClasses = layout.preferences.animationsEnabled ? 'transition-transform duration-250' : '';
  
  return `${baseClasses} ${widthClasses} ${positionClasses} ${openClasses} ${animationClasses}`.trim();
}

/**
 * Get CSS classes for content area
 */
export function getContentAreaClasses(layout: LayoutState): string {
  const baseClasses = 'flex-1 overflow-y-auto';
  const paddingClasses = layout.isMobile ? 'p-4' : 'p-6';
  const marginClasses = layout.sidebarOpen && !layout.isMobile ? 'ml-80' : '';
  
  return `${baseClasses} ${paddingClasses} ${marginClasses}`.trim();
}

/**
 * Get CSS classes for footer
 */
export function getFooterClasses(layout: LayoutState): string {
  const baseClasses = 'bg-[#1a1a2e] border-t border-[#252547] px-4 py-4';
  const heightClasses = `h-[${LAYOUT_DIMENSIONS.footerHeight}px]`;
  const responsiveClasses = layout.isMobile ? 'mobile-footer' : 'desktop-footer';
  
  return `${baseClasses} ${heightClasses} ${responsiveClasses}`.trim();
}

/**
 * Mock data generators
 */
export function createMockGameProgress(phase: GamePhase = 'lobby'): GameProgress {
  return {
    currentRound: 1,
    totalRounds: 5,
    currentPhase: phase,
    timeRemaining: 120000, // 2 minutes
    playerStatus: createMockPlayerStatus(),
    phaseProgress: 45,
    estimatedTimeRemaining: 300000 // 5 minutes
  };
}

export function createMockPlayerStatus(): PlayerStatus[] {
  return [
    {
      id: 'player-1',
      name: 'Alice',
      isOnline: true,
      isHost: true,
      isReady: true,
      lastSeen: Date.now(),
      status: 'active'
    },
    {
      id: 'player-2',
      name: 'Bob',
      isOnline: true,
      isHost: false,
      isReady: true,
      lastSeen: Date.now() - 5000,
      status: 'active'
    },
    {
      id: 'player-3',
      name: 'Charlie',
      isOnline: false,
      isHost: false,
      isReady: false,
      lastSeen: Date.now() - 30000,
      status: 'disconnected'
    },
    {
      id: 'player-4',
      name: 'Diana',
      isOnline: true,
      isHost: false,
      isReady: false,
      lastSeen: Date.now() - 2000,
      status: 'waiting'
    },
    {
      id: 'player-5',
      name: 'Eve',
      isOnline: true,
      isHost: false,
      isReady: true,
      lastSeen: Date.now() - 1000,
      status: 'active'
    }
  ];
}

export function createMockNavigationItems(currentPhase: GamePhase): NavigationItem[] {
  const phases: GamePhase[] = ['lobby', 'roleReveal', 'missionSelect', 'voting', 'missionVote', 'gameOver'];
  
  return phases.map((phase, index) => ({
    id: `nav-${phase}`,
    label: phase.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
    active: phase === currentPhase,
    phase,
    disabled: false,
    progress: phase === currentPhase ? 45 : (index < phases.indexOf(currentPhase) ? 100 : 0),
    onClick: () => console.log(`Navigate to ${phase}`)
  }));
}

export function createMockSidebarSections(phase: GamePhase): SidebarSection[] {
  return [
    {
      id: 'game-info',
      title: 'Game Information',
      content: 'Game details and current status',
      collapsible: true,
      defaultOpen: true,
      icon: '📋'
    },
    {
      id: 'players',
      title: 'Players',
      content: 'Player list and status',
      collapsible: true,
      defaultOpen: true,
      icon: '👥'
    },
    {
      id: 'rules',
      title: 'Game Rules',
      content: 'Rules and help section',
      collapsible: true,
      defaultOpen: false,
      icon: '📖'
    },
    {
      id: 'settings',
      title: 'Settings',
      content: 'Layout and game settings',
      collapsible: true,
      defaultOpen: false,
      icon: '⚙️'
    }
  ];
}

export function createMockPhaseActions(phase: GamePhase): PhaseAction[] {
  switch (phase) {
    case 'lobby':
      return [
        {
          id: 'start-game',
          label: 'Start Game',
          type: 'primary',
          onClick: () => console.log('Start game'),
          disabled: false
        },
        {
          id: 'leave-room',
          label: 'Leave Room',
          type: 'secondary',
          onClick: () => console.log('Leave room')
        }
      ];
    case 'missionSelect':
      return [
        {
          id: 'submit-team',
          label: 'Submit Team',
          type: 'primary',
          onClick: () => console.log('Submit team'),
          disabled: true
        },
        {
          id: 'reset-selection',
          label: 'Reset',
          type: 'secondary',
          onClick: () => console.log('Reset selection')
        }
      ];
    case 'voting':
      return [
        {
          id: 'approve-team',
          label: 'Approve',
          type: 'success',
          onClick: () => console.log('Approve team')
        },
        {
          id: 'reject-team',
          label: 'Reject',
          type: 'danger',
          onClick: () => console.log('Reject team')
        }
      ];
    default:
      return [
        {
          id: 'continue',
          label: 'Continue',
          type: 'primary',
          onClick: () => console.log('Continue')
        }
      ];
  }
}

export function createMockLayoutData(phase: GamePhase = 'lobby'): MockLayoutData {
  return {
    gameProgress: createMockGameProgress(phase),
    playerStatus: createMockPlayerStatus(),
    navigationItems: createMockNavigationItems(phase),
    sidebarSections: createMockSidebarSections(phase),
    phaseActions: createMockPhaseActions(phase)
  };
}

/**
 * Local storage utilities
 */
export function saveLayoutPreferences(preferences: LayoutPreferences): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('avalon-layout-preferences', JSON.stringify(preferences));
    } catch (error) {
      console.warn('Failed to save layout preferences:', error);
    }
  }
}

export function loadLayoutPreferences(): LayoutPreferences {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('avalon-layout-preferences');
      if (saved) {
        return { ...getDefaultLayoutPreferences(), ...JSON.parse(saved) };
      }
    } catch (error) {
      console.warn('Failed to load layout preferences:', error);
    }
  }
  return getDefaultLayoutPreferences();
}

/**
 * Debounce utility for resize events
 */
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
