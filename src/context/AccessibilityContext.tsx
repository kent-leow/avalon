'use client';

/**
 * Accessibility Context
 * 
 * Provides accessibility state management and configuration
 */

import { createContext, useContext, useReducer, useCallback, useEffect, type ReactNode } from 'react';
import { type AccessibilitySettings, type AccessibilityState, type AccessibilityConfig, type AccessibilityAnnouncement, type AccessibilityInteraction, type AccessibilityRecommendation, DEFAULT_ACCESSIBILITY_SETTINGS, DEFAULT_ACCESSIBILITY_CONFIG } from '~/types/accessibility';
import { detectSystemPreferences, applyAccessibilitySettings, createLiveRegions, announceToScreenReader, trackAccessibilityInteraction, generateAccessibilityRecommendations, createSkipLinks } from '~/lib/accessibility-utils';

interface AccessibilityContextType {
  state: AccessibilityState;
  settings: AccessibilitySettings;
  config: AccessibilityConfig;
  updateSettings: (settings: Partial<AccessibilitySettings>) => void;
  updateConfig: (config: Partial<AccessibilityConfig>) => void;
  announceMessage: (message: string, priority?: 'polite' | 'assertive', category?: 'game-state' | 'user-action' | 'system' | 'error') => void;
  recordInteraction: (type: 'keyboard' | 'screen-reader' | 'voice' | 'switch' | 'eye-tracking', element: string, action: string, success?: boolean) => void;
  getRecommendations: () => AccessibilityRecommendation[];
  applyPreset: (preset: 'default' | 'high-contrast' | 'large-text' | 'reduced-motion' | 'screen-reader') => void;
  resetToDefaults: () => void;
  toggleFeature: (feature: keyof AccessibilitySettings) => void;
  exportSettings: () => string;
  importSettings: (settingsJson: string) => boolean;
}

const AccessibilityContext = createContext<AccessibilityContextType | null>(null);

interface AccessibilityAction {
  type: 'UPDATE_SETTINGS' | 'UPDATE_CONFIG' | 'UPDATE_STATE' | 'ADD_ANNOUNCEMENT' | 'ADD_INTERACTION' | 'CLEAR_ANNOUNCEMENTS' | 'APPLY_PRESET' | 'RESET_TO_DEFAULTS' | 'TOGGLE_FEATURE' | 'IMPORT_SETTINGS';
  payload?: any;
}

function accessibilityReducer(state: AccessibilityState, action: AccessibilityAction): AccessibilityState {
  switch (action.type) {
    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.payload },
      };
    
    case 'UPDATE_CONFIG':
      return {
        ...state,
        config: { ...state.config, ...action.payload },
      };
    
    case 'UPDATE_STATE':
      return {
        ...state,
        ...action.payload,
      };
    
    case 'ADD_ANNOUNCEMENT':
      return {
        ...state,
        announcements: [...state.announcements, action.payload],
      };
    
    case 'ADD_INTERACTION':
      return {
        ...state,
        interactions: [...state.interactions, action.payload],
      };
    
    case 'CLEAR_ANNOUNCEMENTS':
      return {
        ...state,
        announcements: [],
      };
    
    case 'APPLY_PRESET':
      const presetSettings = getPresetSettings(action.payload);
      return {
        ...state,
        settings: { ...state.settings, ...presetSettings },
      };
    
    case 'RESET_TO_DEFAULTS':
      return {
        ...state,
        settings: DEFAULT_ACCESSIBILITY_SETTINGS,
        config: DEFAULT_ACCESSIBILITY_CONFIG,
      };
    
    case 'TOGGLE_FEATURE':
      const feature = action.payload as keyof AccessibilitySettings;
      const currentValue = state.settings[feature];
      return {
        ...state,
        settings: {
          ...state.settings,
          [feature]: typeof currentValue === 'boolean' ? !currentValue : currentValue,
        },
      };
    
    case 'IMPORT_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.payload },
      };
    
    default:
      return state;
  }
}

function getPresetSettings(preset: string): Partial<AccessibilitySettings> {
  switch (preset) {
    case 'high-contrast':
      return {
        highContrastMode: true,
        focusIndicatorStyle: 'high-contrast',
        textScale: 125,
      };
    
    case 'large-text':
      return {
        textScale: 150,
        focusIndicatorStyle: 'large',
      };
    
    case 'reduced-motion':
      return {
        reducedMotion: true,
        focusIndicatorStyle: 'default',
      };
    
    case 'screen-reader':
      return {
        screenReaderEnabled: true,
        keyboardNavigation: true,
        announcements: true,
        focusIndicatorStyle: 'high-contrast',
      };
    
    default:
      return DEFAULT_ACCESSIBILITY_SETTINGS;
  }
}

interface AccessibilityProviderProps {
  children: ReactNode;
  initialSettings?: Partial<AccessibilitySettings>;
  initialConfig?: Partial<AccessibilityConfig>;
}

export function AccessibilityProvider({ children, initialSettings, initialConfig }: AccessibilityProviderProps) {
  const [state, dispatch] = useReducer(accessibilityReducer, {
    isInitialized: false,
    settings: { ...DEFAULT_ACCESSIBILITY_SETTINGS, ...initialSettings },
    config: { ...DEFAULT_ACCESSIBILITY_CONFIG, ...initialConfig },
    systemPreferences: {
      prefersReducedMotion: false,
      prefersHighContrast: false,
      prefersLargeText: false,
      screenReaderDetected: false,
    },
    currentFocus: null,
    announcements: [],
    interactions: [],
    compliance: {
      wcagLevel: 'AA',
      testResults: [],
      lastAudit: new Date(),
    },
  });

  // Initialize accessibility features
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Detect system preferences
    const systemPrefs = detectSystemPreferences();
    
    // Apply system preferences if no user preferences exist
    if (!localStorage.getItem('accessibility-settings')) {
      const systemSettings: Partial<AccessibilitySettings> = {
        reducedMotion: systemPrefs.prefersReducedMotion,
        highContrastMode: systemPrefs.prefersHighContrast,
        textScale: systemPrefs.prefersLargeText ? 125 : 100,
        screenReaderEnabled: systemPrefs.screenReaderDetected,
      };
      
      dispatch({ type: 'UPDATE_SETTINGS', payload: systemSettings });
    }

    // Create live regions for screen readers
    createLiveRegions();
    
    // Create skip links for keyboard navigation
    createSkipLinks();

    // Apply initial settings
    applyAccessibilitySettings(state.settings);
    
    // Mark as initialized
    dispatch({ type: 'UPDATE_STATE', payload: { isInitialized: true } });
  }, []);

  // Apply settings changes
  useEffect(() => {
    if (state.isInitialized) {
      applyAccessibilitySettings(state.settings);
      
      // Save to localStorage
      localStorage.setItem('accessibility-settings', JSON.stringify(state.settings));
    }
  }, [state.settings, state.isInitialized]);

  // Load saved settings
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedSettings = localStorage.getItem('accessibility-settings');
      if (savedSettings) {
        try {
          const parsedSettings = JSON.parse(savedSettings);
          dispatch({ type: 'IMPORT_SETTINGS', payload: parsedSettings });
        } catch (error) {
          console.error('Failed to load accessibility settings:', error);
        }
      }
    }
  }, []);

  const updateSettings = useCallback((settings: Partial<AccessibilitySettings>) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
  }, []);

  const updateConfig = useCallback((config: Partial<AccessibilityConfig>) => {
    dispatch({ type: 'UPDATE_CONFIG', payload: config });
  }, []);

  const announceMessage = useCallback((
    message: string,
    priority: 'polite' | 'assertive' = 'polite',
    category: 'game-state' | 'user-action' | 'system' | 'error' = 'system'
  ) => {
    if (!state.settings.announcements) return;

    const announcement: AccessibilityAnnouncement = {
      id: `announcement-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      message,
      priority,
      timestamp: Date.now(),
      category,
    };

    dispatch({ type: 'ADD_ANNOUNCEMENT', payload: announcement });
    announceToScreenReader(message, priority);
  }, [state.settings.announcements]);

  const recordInteraction = useCallback((
    type: 'keyboard' | 'screen-reader' | 'voice' | 'switch' | 'eye-tracking',
    element: string,
    action: string,
    success: boolean = true
  ) => {
    const interaction = trackAccessibilityInteraction(type, element, action, success);
    dispatch({ type: 'ADD_INTERACTION', payload: interaction });
  }, []);

  const getRecommendations = useCallback(() => {
    return generateAccessibilityRecommendations(state.settings, state.interactions);
  }, [state.settings, state.interactions]);

  const applyPreset = useCallback((preset: 'default' | 'high-contrast' | 'large-text' | 'reduced-motion' | 'screen-reader') => {
    dispatch({ type: 'APPLY_PRESET', payload: preset });
  }, []);

  const resetToDefaults = useCallback(() => {
    dispatch({ type: 'RESET_TO_DEFAULTS' });
  }, []);

  const toggleFeature = useCallback((feature: keyof AccessibilitySettings) => {
    dispatch({ type: 'TOGGLE_FEATURE', payload: feature });
  }, []);

  const exportSettings = useCallback(() => {
    return JSON.stringify(state.settings, null, 2);
  }, [state.settings]);

  const importSettings = useCallback((settingsJson: string) => {
    try {
      const parsedSettings = JSON.parse(settingsJson);
      dispatch({ type: 'IMPORT_SETTINGS', payload: parsedSettings });
      return true;
    } catch (error) {
      console.error('Failed to import accessibility settings:', error);
      return false;
    }
  }, []);

  const value: AccessibilityContextType = {
    state,
    settings: state.settings,
    config: state.config,
    updateSettings,
    updateConfig,
    announceMessage,
    recordInteraction,
    getRecommendations,
    applyPreset,
    resetToDefaults,
    toggleFeature,
    exportSettings,
    importSettings,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibilityContext() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibilityContext must be used within an AccessibilityProvider');
  }
  return context;
}
