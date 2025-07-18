/**
 * Accessibility Utilities
 * 
 * Utility functions for accessibility features and WCAG 2.1 AA compliance
 */

import { type AccessibilitySettings, type AccessibilityAnnouncement, type AccessibilityInteraction, type AccessibilityRecommendation, type AccessibilityTestResult, WCAG_COMPLIANCE, HIGH_CONTRAST_COLORS, DEFAULT_ACCESSIBILITY_SETTINGS } from '~/types/accessibility';

/**
 * Detect system accessibility preferences
 */
export function detectSystemPreferences() {
  if (typeof window === 'undefined') {
    return {
      prefersReducedMotion: false,
      prefersHighContrast: false,
      prefersLargeText: false,
      screenReaderDetected: false,
    };
  }

  return {
    prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    prefersHighContrast: window.matchMedia('(prefers-contrast: high)').matches,
    prefersLargeText: window.matchMedia('(prefers-reduced-data: reduce)').matches,
    screenReaderDetected: navigator.userAgent.includes('JAWS') || 
                           navigator.userAgent.includes('NVDA') || 
                           navigator.userAgent.includes('VoiceOver') ||
                           !!document.querySelector('[aria-hidden]'),
  };
}

/**
 * Apply accessibility settings to document
 */
export function applyAccessibilitySettings(settings: AccessibilitySettings): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;

  // Text scaling
  root.style.fontSize = `${settings.textScale}%`;

  // High contrast mode
  if (settings.highContrastMode) {
    root.classList.add('high-contrast');
    root.style.setProperty('--bg-color', HIGH_CONTRAST_COLORS.background);
    root.style.setProperty('--text-color', HIGH_CONTRAST_COLORS.text);
    root.style.setProperty('--link-color', HIGH_CONTRAST_COLORS.link);
    root.style.setProperty('--focus-color', HIGH_CONTRAST_COLORS.focus);
  } else {
    root.classList.remove('high-contrast');
  }

  // Reduced motion
  if (settings.reducedMotion) {
    root.classList.add('reduced-motion');
  } else {
    root.classList.remove('reduced-motion');
  }

  // Focus indicator style
  root.setAttribute('data-focus-style', settings.focusIndicatorStyle);
}

/**
 * Create accessibility announcement
 */
export function createAccessibilityAnnouncement(
  message: string,
  priority: 'polite' | 'assertive' = 'polite',
  category: 'game-state' | 'user-action' | 'system' | 'error' = 'system'
): AccessibilityAnnouncement {
  return {
    id: `announcement-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    message,
    priority,
    timestamp: Date.now(),
    category,
  };
}

/**
 * Announce message to screen readers
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
  if (typeof document === 'undefined') return;

  const liveRegion = document.getElementById(`live-region-${priority}`);
  if (liveRegion) {
    liveRegion.textContent = message;
    // Clear after announcement
    setTimeout(() => {
      liveRegion.textContent = '';
    }, 1000);
  }
}

/**
 * Create screen reader live regions
 */
export function createLiveRegions(): void {
  if (typeof document === 'undefined') return;

  const regions = ['polite', 'assertive'];
  
  regions.forEach(region => {
    const existingRegion = document.getElementById(`live-region-${region}`);
    if (!existingRegion) {
      const liveRegion = document.createElement('div');
      liveRegion.id = `live-region-${region}`;
      liveRegion.setAttribute('aria-live', region);
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.className = 'sr-only';
      liveRegion.style.cssText = `
        position: absolute;
        left: -10000px;
        width: 1px;
        height: 1px;
        overflow: hidden;
      `;
      document.body.appendChild(liveRegion);
    }
  });
}

/**
 * Track accessibility interaction
 */
export function trackAccessibilityInteraction(
  type: 'keyboard' | 'screen-reader' | 'voice' | 'switch' | 'eye-tracking',
  element: string,
  action: string,
  success: boolean = true
): AccessibilityInteraction {
  return {
    id: `interaction-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    element,
    action,
    timestamp: Date.now(),
    success,
  };
}

/**
 * Check color contrast ratio
 */
export function checkColorContrast(foreground: string, background: string): number {
  const getLuminance = (color: string): number => {
    const rgb = hexToRgb(color);
    if (!rgb) return 0;
    
    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * (r ?? 0) + 0.7152 * (g ?? 0) + 0.0722 * (b ?? 0);
  };

  const l1 = getLuminance(foreground);
  const l2 = getLuminance(background);
  
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

/**
 * Convert hex color to RGB
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1] ?? '0', 16),
    g: parseInt(result[2] ?? '0', 16),
    b: parseInt(result[3] ?? '0', 16),
  } : null;
}

/**
 * Check if contrast ratio meets WCAG standards
 */
export function meetsWCAGContrast(
  foreground: string,
  background: string,
  level: 'AA' | 'AAA' = 'AA',
  isLargeText: boolean = false
): boolean {
  const ratio = checkColorContrast(foreground, background);
  const requiredRatio = isLargeText ? WCAG_COMPLIANCE[level].largeTextRatio : WCAG_COMPLIANCE[level].contrastRatio;
  return ratio >= requiredRatio;
}

/**
 * Generate focus trap for modal dialogs
 */
export function createFocusTrap(element: HTMLElement): () => void {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  const firstFocusable = focusableElements[0] as HTMLElement;
  const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement;
  
  const handleTabKey = (e: KeyboardEvent) => {
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          lastFocusable.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          firstFocusable.focus();
          e.preventDefault();
        }
      }
    }
  };

  element.addEventListener('keydown', handleTabKey);
  firstFocusable?.focus();

  return () => {
    element.removeEventListener('keydown', handleTabKey);
  };
}

/**
 * Generate accessibility recommendations
 */
export function generateAccessibilityRecommendations(
  settings: AccessibilitySettings,
  interactions: AccessibilityInteraction[]
): AccessibilityRecommendation[] {
  const recommendations: AccessibilityRecommendation[] = [];

  // Screen reader recommendation
  if (!settings.screenReaderEnabled && interactions.some(i => i.type === 'keyboard')) {
    recommendations.push({
      id: 'screen-reader-suggestion',
      type: 'settings',
      title: 'Enable Screen Reader Support',
      description: 'Based on your keyboard usage, you might benefit from screen reader support.',
      impact: 'high',
      settings: { screenReaderEnabled: true },
    });
  }

  // High contrast recommendation
  if (!settings.highContrastMode && settings.textScale > 125) {
    recommendations.push({
      id: 'high-contrast-suggestion',
      type: 'settings',
      title: 'Enable High Contrast Mode',
      description: 'Since you use larger text, high contrast mode may improve readability.',
      impact: 'medium',
      settings: { highContrastMode: true },
    });
  }

  // Reduced motion recommendation
  if (!settings.reducedMotion && interactions.some(i => !i.success)) {
    recommendations.push({
      id: 'reduced-motion-suggestion',
      type: 'settings',
      title: 'Enable Reduced Motion',
      description: 'Reducing motion may improve interaction success rates.',
      impact: 'medium',
      settings: { reducedMotion: true },
    });
  }

  return recommendations;
}

/**
 * Create skip links for keyboard navigation
 */
export function createSkipLinks(): void {
  if (typeof document === 'undefined') return;

  const skipLinks = [
    { href: '#main-content', text: 'Skip to main content' },
    { href: '#navigation', text: 'Skip to navigation' },
    { href: '#game-area', text: 'Skip to game area' },
    { href: '#settings', text: 'Skip to settings' },
  ];

  const skipNav = document.createElement('nav');
  skipNav.className = 'skip-links';
  skipNav.setAttribute('aria-label', 'Skip links');

  skipLinks.forEach(link => {
    const skipLink = document.createElement('a');
    skipLink.href = link.href;
    skipLink.textContent = link.text;
    skipLink.className = 'skip-link';
    skipNav.appendChild(skipLink);
  });

  document.body.insertBefore(skipNav, document.body.firstChild);
}

/**
 * Validate accessibility settings
 */
export function validateAccessibilitySettings(settings: AccessibilitySettings): string[] {
  const errors: string[] = [];

  if (settings.textScale < 100 || settings.textScale > 200) {
    errors.push('Text scale must be between 100% and 200%');
  }

  if (!['default', 'high-contrast', 'large'].includes(settings.focusIndicatorStyle)) {
    errors.push('Invalid focus indicator style');
  }

  if (settings.alternativeInputs.some(input => 
    !['keyboard', 'voice', 'switch', 'eye-tracking', 'head-tracking', 'breath-control'].includes(input)
  )) {
    errors.push('Invalid alternative input method');
  }

  return errors;
}

/**
 * Get accessibility compliance level
 */
export function getAccessibilityCompliance(settings: AccessibilitySettings): 'AA' | 'AAA' | 'none' {
  if (settings.screenReaderEnabled && 
      settings.keyboardNavigation && 
      settings.focusIndicatorStyle !== 'default') {
    return 'AAA';
  }
  
  if (settings.keyboardNavigation && settings.announcements) {
    return 'AA';
  }
  
  return 'none';
}

/**
 * Format accessibility announcement
 */
export function formatAccessibilityAnnouncement(
  message: string,
  context?: { playerName?: string; action?: string; phase?: string }
): string {
  if (!context) return message;

  let formatted = message;
  
  if (context.playerName) {
    formatted = formatted.replace('{player}', context.playerName);
  }
  
  if (context.action) {
    formatted = formatted.replace('{action}', context.action);
  }
  
  if (context.phase) {
    formatted = formatted.replace('{phase}', context.phase);
  }

  return formatted;
}

/**
 * Create mock accessibility data for testing
 */
export function createMockAccessibilityData() {
  return {
    settings: DEFAULT_ACCESSIBILITY_SETTINGS,
    announcements: [
      createAccessibilityAnnouncement('Game started', 'polite', 'game-state'),
      createAccessibilityAnnouncement('Your turn to vote', 'assertive', 'user-action'),
      createAccessibilityAnnouncement('Mission succeeded', 'polite', 'game-state'),
    ],
    interactions: [
      trackAccessibilityInteraction('keyboard', 'vote-button', 'activate', true),
      trackAccessibilityInteraction('screen-reader', 'player-card', 'read', true),
      trackAccessibilityInteraction('keyboard', 'mission-card', 'navigate', true),
    ],
    recommendations: [
      {
        id: 'rec-1',
        type: 'settings' as const,
        title: 'Enable High Contrast',
        description: 'Improve visual accessibility with high contrast mode.',
        impact: 'high' as const,
        settings: { highContrastMode: true },
      },
    ],
    testResults: [
      {
        id: 'test-1',
        rule: 'color-contrast',
        impact: 'serious' as const,
        description: 'Elements must have sufficient color contrast',
        helpUrl: 'https://dequeuniversity.com/rules/axe/4.6/color-contrast',
        nodes: [
          {
            target: '.button-primary',
            html: '<button class="button-primary">Vote</button>',
            failureSummary: 'Color contrast ratio is 3.2:1, expected 4.5:1',
          },
        ],
      },
    ],
  };
}

/**
 * Apply text scaling CSS
 */
export function applyTextScaling(scale: number): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  root.style.setProperty('--text-scale', `${scale / 100}`);
}

/**
 * Check if element is focusable
 */
export function isFocusable(element: HTMLElement): boolean {
  const focusableElements = [
    'button',
    'a[href]',
    'input',
    'select',
    'textarea',
    '[tabindex]:not([tabindex="-1"])',
  ];
  
  return focusableElements.some(selector => element.matches(selector)) &&
         !element.hasAttribute('disabled') &&
         element.offsetWidth > 0 &&
         element.offsetHeight > 0;
}

/**
 * Get next focusable element
 */
export function getNextFocusableElement(current: HTMLElement, direction: 'forward' | 'backward' = 'forward'): HTMLElement | null {
  const focusableElements = Array.from(document.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )) as HTMLElement[];

  const currentIndex = focusableElements.indexOf(current);
  if (currentIndex === -1) return null;

  const nextIndex = direction === 'forward' ? currentIndex + 1 : currentIndex - 1;
  
  if (nextIndex >= 0 && nextIndex < focusableElements.length) {
    return focusableElements[nextIndex] ?? null;
  }
  
  return null;
}

/**
 * Create accessible tooltip
 */
export function createAccessibleTooltip(element: HTMLElement, text: string): void {
  const tooltipId = `tooltip-${Date.now()}`;
  
  element.setAttribute('aria-describedby', tooltipId);
  
  const tooltip = document.createElement('div');
  tooltip.id = tooltipId;
  tooltip.className = 'tooltip';
  tooltip.setAttribute('role', 'tooltip');
  tooltip.textContent = text;
  tooltip.style.cssText = `
    position: absolute;
    z-index: 1000;
    background: #000;
    color: #fff;
    padding: 8px;
    border-radius: 4px;
    font-size: 14px;
    visibility: hidden;
    opacity: 0;
    transition: opacity 0.3s;
  `;
  
  document.body.appendChild(tooltip);
  
  element.addEventListener('mouseenter', () => {
    tooltip.style.visibility = 'visible';
    tooltip.style.opacity = '1';
  });
  
  element.addEventListener('mouseleave', () => {
    tooltip.style.visibility = 'hidden';
    tooltip.style.opacity = '0';
  });
}

/**
 * Update page title for screen readers
 */
export function updatePageTitle(title: string): void {
  if (typeof document === 'undefined') return;
  
  document.title = title;
  
  // Also announce the title change
  announceToScreenReader(`Page title changed to: ${title}`, 'polite');
}
