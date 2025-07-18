'use client';

/**
 * Enhanced Accessibility Hook
 * 
 * Provides comprehensive accessibility features and utilities
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useAccessibilityContext } from '~/context/AccessibilityContext';
import { type AccessibilitySettings, type AccessibilityAnnouncement, type AccessibilityInteraction } from '~/types/accessibility';
import { announceToScreenReader, createFocusTrap, isFocusable, getNextFocusableElement, createAccessibleTooltip, updatePageTitle } from '~/lib/accessibility-utils';

interface UseAccessibilityOptions {
  autoFocus?: boolean;
  trapFocus?: boolean;
  announceChanges?: boolean;
  trackInteractions?: boolean;
  enableKeyboardShortcuts?: boolean;
}

export function useAccessibility(options: UseAccessibilityOptions = {}) {
  const {
    autoFocus = false,
    trapFocus = false,
    announceChanges = true,
    trackInteractions = true,
    enableKeyboardShortcuts = true,
  } = options;

  const {
    state,
    settings,
    config,
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
  } = useAccessibilityContext();

  const [focusedElement, setFocusedElement] = useState<HTMLElement | null>(null);
  const [isKeyboardUser, setIsKeyboardUser] = useState(false);
  const focusTrapRef = useRef<(() => void) | null>(null);
  const elementRef = useRef<HTMLElement>(null);

  // Keyboard user detection
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        setIsKeyboardUser(true);
      }
    };

    const handleMouseDown = () => {
      setIsKeyboardUser(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  // Auto focus management
  useEffect(() => {
    if (autoFocus && elementRef.current) {
      elementRef.current.focus();
      
      if (trackInteractions) {
        recordInteraction('keyboard', 'element', 'auto-focus', true);
      }
    }
  }, [autoFocus, trackInteractions, recordInteraction]);

  // Focus trap management
  useEffect(() => {
    if (trapFocus && elementRef.current) {
      focusTrapRef.current = createFocusTrap(elementRef.current);
      
      return () => {
        if (focusTrapRef.current) {
          focusTrapRef.current();
        }
      };
    }
  }, [trapFocus]);

  // Focus change tracking
  useEffect(() => {
    const handleFocusChange = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      setFocusedElement(target);
      
      if (trackInteractions && target) {
        recordInteraction('keyboard', target.tagName.toLowerCase(), 'focus', true);
      }
    };

    document.addEventListener('focusin', handleFocusChange);
    
    return () => {
      document.removeEventListener('focusin', handleFocusChange);
    };
  }, [trackInteractions, recordInteraction]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!enableKeyboardShortcuts) return;

    const handleKeyboardShortcut = (e: KeyboardEvent) => {
      // Skip if typing in input field
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Alt + H: Toggle high contrast
      if (e.altKey && e.key === 'h') {
        e.preventDefault();
        toggleFeature('highContrastMode');
        announceMessage('High contrast mode toggled', 'assertive', 'system');
      }

      // Alt + M: Toggle reduced motion
      if (e.altKey && e.key === 'm') {
        e.preventDefault();
        toggleFeature('reducedMotion');
        announceMessage('Reduced motion toggled', 'assertive', 'system');
      }

      // Alt + T: Increase text scale
      if (e.altKey && e.key === 't') {
        e.preventDefault();
        const currentScale = settings.textScale;
        const newScale = Math.min(200, currentScale + 25) as 100 | 125 | 150 | 200;
        updateSettings({ textScale: newScale });
        announceMessage(`Text scale set to ${newScale}%`, 'assertive', 'system');
      }

      // Alt + R: Reset to defaults
      if (e.altKey && e.key === 'r') {
        e.preventDefault();
        resetToDefaults();
        announceMessage('Accessibility settings reset to defaults', 'assertive', 'system');
      }

      // Alt + S: Toggle screen reader mode
      if (e.altKey && e.key === 's') {
        e.preventDefault();
        toggleFeature('screenReaderEnabled');
        announceMessage('Screen reader mode toggled', 'assertive', 'system');
      }

      if (trackInteractions) {
        recordInteraction('keyboard', 'shortcut', `alt+${e.key}`, true);
      }
    };

    document.addEventListener('keydown', handleKeyboardShortcut);
    
    return () => {
      document.removeEventListener('keydown', handleKeyboardShortcut);
    };
  }, [enableKeyboardShortcuts, settings.textScale, toggleFeature, updateSettings, resetToDefaults, announceMessage, trackInteractions, recordInteraction]);

  // Announce settings changes
  useEffect(() => {
    if (announceChanges && state.isInitialized) {
      // Announce when settings change
      if (settings.screenReaderEnabled) {
        announceMessage('Accessibility settings updated', 'polite', 'system');
      }
    }
  }, [settings, announceChanges, announceMessage, state.isInitialized]);

  // Utility functions
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    announceMessage(message, priority, 'user-action');
  }, [announceMessage]);

  const announceError = useCallback((message: string) => {
    announceMessage(`Error: ${message}`, 'assertive', 'error');
  }, [announceMessage]);

  const announceSuccess = useCallback((message: string) => {
    announceMessage(`Success: ${message}`, 'polite', 'system');
  }, [announceMessage]);

  const announceGameState = useCallback((message: string) => {
    announceMessage(message, 'polite', 'game-state');
  }, [announceMessage]);

  const focusElement = useCallback((element: HTMLElement | null) => {
    if (element && isFocusable(element)) {
      element.focus();
      setFocusedElement(element);
      
      if (trackInteractions) {
        recordInteraction('keyboard', element.tagName.toLowerCase(), 'programmatic-focus', true);
      }
    }
  }, [trackInteractions, recordInteraction]);

  const focusNext = useCallback(() => {
    if (focusedElement) {
      const nextElement = getNextFocusableElement(focusedElement, 'forward');
      if (nextElement) {
        focusElement(nextElement);
      }
    }
  }, [focusedElement, focusElement]);

  const focusPrevious = useCallback(() => {
    if (focusedElement) {
      const prevElement = getNextFocusableElement(focusedElement, 'backward');
      if (prevElement) {
        focusElement(prevElement);
      }
    }
  }, [focusedElement, focusElement]);

  const addTooltip = useCallback((element: HTMLElement, text: string) => {
    createAccessibleTooltip(element, text);
  }, []);

  const setPageTitle = useCallback((title: string) => {
    updatePageTitle(title);
  }, []);

  const recordUserInteraction = useCallback((
    element: string,
    action: string,
    success: boolean = true
  ) => {
    if (trackInteractions) {
      const inputMethod = isKeyboardUser ? 'keyboard' : 'screen-reader';
      recordInteraction(inputMethod, element, action, success);
    }
  }, [trackInteractions, isKeyboardUser, recordInteraction]);

  const applyAccessibilityPreset = useCallback((preset: 'default' | 'high-contrast' | 'large-text' | 'reduced-motion' | 'screen-reader') => {
    applyPreset(preset);
    announceMessage(`Applied ${preset} accessibility preset`, 'polite', 'system');
  }, [applyPreset, announceMessage]);

  const getAccessibilityStatus = useCallback(() => {
    const activeFeatures = Object.entries(settings)
      .filter(([key, value]) => value === true && key !== 'isInitialized')
      .map(([key]) => key);

    return {
      isAccessible: activeFeatures.length > 0,
      activeFeatures,
      textScale: settings.textScale,
      isKeyboardUser,
      currentFocus: focusedElement?.tagName.toLowerCase(),
      recommendations: getRecommendations(),
    };
  }, [settings, isKeyboardUser, focusedElement, getRecommendations]);

  const validateAccessibility = useCallback(() => {
    const errors: string[] = [];
    
    // Check for missing alt text on images
    const images = document.querySelectorAll('img:not([alt])');
    if (images.length > 0) {
      errors.push(`${images.length} images missing alt text`);
    }

    // Check for empty buttons
    const emptyButtons = document.querySelectorAll('button:empty:not([aria-label])');
    if (emptyButtons.length > 0) {
      errors.push(`${emptyButtons.length} buttons missing accessible text`);
    }

    // Check for missing form labels
    const unlabeledInputs = document.querySelectorAll('input:not([aria-label]):not([aria-labelledby])');
    if (unlabeledInputs.length > 0) {
      errors.push(`${unlabeledInputs.length} form inputs missing labels`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings: [],
    };
  }, []);

  const getKeyboardShortcuts = useCallback(() => {
    return [
      { key: 'Alt + H', description: 'Toggle high contrast mode' },
      { key: 'Alt + M', description: 'Toggle reduced motion' },
      { key: 'Alt + T', description: 'Increase text scale' },
      { key: 'Alt + R', description: 'Reset accessibility settings' },
      { key: 'Alt + S', description: 'Toggle screen reader mode' },
      { key: 'Tab', description: 'Navigate to next element' },
      { key: 'Shift + Tab', description: 'Navigate to previous element' },
      { key: 'Enter', description: 'Activate button or link' },
      { key: 'Space', description: 'Activate button or checkbox' },
      { key: 'Arrow keys', description: 'Navigate within components' },
    ];
  }, []);

  return {
    // State
    state,
    settings,
    config,
    focusedElement,
    isKeyboardUser,
    elementRef,

    // Core functions
    updateSettings,
    updateConfig,
    toggleFeature,
    applyPreset: applyAccessibilityPreset,
    resetToDefaults,
    exportSettings,
    importSettings,

    // Announcements
    announce,
    announceError,
    announceSuccess,
    announceGameState,

    // Focus management
    focusElement,
    focusNext,
    focusPrevious,
    addTooltip,
    setPageTitle,

    // Interaction tracking
    recordUserInteraction,

    // Utilities
    getAccessibilityStatus,
    validateAccessibility,
    getKeyboardShortcuts,
    getRecommendations,
  };
}

export default useAccessibility;
