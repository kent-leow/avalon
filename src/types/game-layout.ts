import type { GamePhase } from './game-state';

/**
 * Game Layout System Types
 * 
 * Defines the structure and behavior of the game layout system
 * providing consistent UI across all game phases.
 */

// Core layout state interface
export interface LayoutState {
  sidebarOpen: boolean;
  isMobile: boolean;
  screenSize: ScreenSize;
  orientation: 'portrait' | 'landscape';
  layoutMode: LayoutMode;
  currentPhase: GamePhase;
  isFullscreen: boolean;
  preferences: LayoutPreferences;
}

// Game progress tracking interface
export interface GameProgress {
  currentRound: number;
  totalRounds: number;
  currentPhase: GamePhase;
  timeRemaining?: number;
  playerStatus: PlayerStatus[];
  phaseProgress: number; // 0-100
  estimatedTimeRemaining?: number;
}

// Player status for layout display
export interface PlayerStatus {
  id: string;
  name: string;
  isOnline: boolean;
  isHost: boolean;
  isReady: boolean;
  lastSeen: number;
  status: 'active' | 'waiting' | 'disconnected';
}

// Phase-specific action interface
export interface PhaseAction {
  id: string;
  label: string;
  type: 'primary' | 'secondary' | 'danger' | 'success';
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  shortcut?: string;
  onClick: () => void;
  confirmation?: {
    title: string;
    message: string;
    confirmText: string;
    cancelText: string;
  };
}

// Layout mode types
export type LayoutMode = 'desktop' | 'tablet' | 'mobile';
export type ScreenSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

// Layout preferences interface
export interface LayoutPreferences {
  sidebarDefaultOpen: boolean;
  animationsEnabled: boolean;
  compactMode: boolean;
  autoHideNavigation: boolean;
  preferredTheme: 'dark' | 'light' | 'auto';
  reducedMotion: boolean;
}

// Navigation item interface
export interface NavigationItem {
  id: string;
  label: string;
  icon?: string;
  active: boolean;
  phase: GamePhase;
  disabled?: boolean;
  progress?: number;
  onClick: () => void;
}

// Sidebar section interface
export interface SidebarSection {
  id: string;
  title: string;
  content: React.ReactNode;
  collapsible: boolean;
  defaultOpen: boolean;
  icon?: string;
}

// Layout breakpoints
export const LAYOUT_BREAKPOINTS = {
  sm: 320,
  md: 768,
  lg: 1024,
  xl: 1440,
  '2xl': 1920
} as const;

// Layout dimensions
export const LAYOUT_DIMENSIONS = {
  navigationHeight: 64,
  sidebarWidth: 320,
  sidebarMobileWidth: '100%',
  footerHeight: 72,
  contentPadding: {
    mobile: 16,
    desktop: 24
  }
} as const;

// Component prop interfaces
export interface GameLayoutContainerProps {
  children: React.ReactNode;
  roomCode: string;
  gamePhase: GamePhase;
  isMobile: boolean;
  sidebarOpen?: boolean;
  onLayoutChange?: (layout: LayoutState) => void;
  className?: string;
}

export interface GameNavigationBarProps {
  currentPhase: GamePhase;
  gameProgress?: GameProgress;
  roomCode: string;
  playerCount: number;
  onSidebarToggle: () => void;
  onSettingsOpen: () => void;
  navigationItems?: NavigationItem[];
  className?: string;
}

export interface GameSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  currentPhase?: GamePhase;
  sections?: SidebarSection[];
  onRulesOpen?: () => void;
  onSettingsOpen?: () => void;
  className?: string;
}

export interface PhaseContentAreaProps {
  children: React.ReactNode;
  currentPhase?: GamePhase;
  layoutMode?: LayoutMode;
  isMobile?: boolean;
  className?: string;
}

export interface GameFooterProps {
  currentPhase?: GamePhase;
  actions?: PhaseAction[];
  onAction?: (action: PhaseAction) => void;
  isLoading?: boolean;
  className?: string;
}

export interface LayoutControllerProps {
  children: React.ReactNode;
  onLayoutChange: (layout: LayoutState) => void;
  initialLayout?: Partial<LayoutState>;
  className?: string;
}

// Layout context interface
export interface GameLayoutContextValue {
  layout: LayoutState;
  updateLayout: (updates: Partial<LayoutState>) => void;
  toggleSidebar: () => void;
  setLayoutMode: (mode: LayoutMode) => void;
  updatePreferences: (preferences: Partial<LayoutPreferences>) => void;
  resetLayout: () => void;
}

// Layout utilities types
export interface LayoutUtils {
  getLayoutMode: (screenWidth: number) => LayoutMode;
  getScreenSize: (screenWidth: number) => ScreenSize;
  isBreakpoint: (screenWidth: number, breakpoint: keyof typeof LAYOUT_BREAKPOINTS) => boolean;
  calculateContentHeight: (layoutState: LayoutState) => number;
  shouldAutoHideNavigation: (phase: GamePhase, preferences: LayoutPreferences) => boolean;
}

// Mock data interfaces
export interface MockLayoutData {
  gameProgress: GameProgress;
  playerStatus: PlayerStatus[];
  navigationItems: NavigationItem[];
  sidebarSections: SidebarSection[];
  phaseActions: PhaseAction[];
}

// Layout event types
export interface LayoutEvent {
  type: 'sidebar_toggle' | 'phase_change' | 'screen_resize' | 'orientation_change';
  payload: any;
  timestamp: number;
}

// Export utility type for component registry
export type GameLayoutComponent = 
  | 'GameLayoutContainer'
  | 'GameNavigationBar'
  | 'GameSidebar'
  | 'PhaseContentArea'
  | 'GameFooter'
  | 'LayoutController';
