'use client';

/**
 * Keyboard Navigation Component
 * 
 * Enhanced keyboard navigation support with focus management
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { useAccessibility } from '~/hooks/useAccessibility';

interface KeyboardNavigationProps {
  children: React.ReactNode;
  enableFocusTrap?: boolean;
  enableSkipLinks?: boolean;
  enableArrowNavigation?: boolean;
  enableCustomShortcuts?: boolean;
  focusableSelector?: string;
  className?: string;
}

export function KeyboardNavigation({
  children,
  enableFocusTrap = false,
  enableSkipLinks = true,
  enableArrowNavigation = true,
  enableCustomShortcuts = true,
  focusableSelector = 'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
  className = '',
}: KeyboardNavigationProps) {
  const { settings, announce, recordUserInteraction } = useAccessibility();
  const [currentFocusIndex, setCurrentFocusIndex] = useState(0);
  const [focusableElements, setFocusableElements] = useState<HTMLElement[]>([]);
  const [isArrowNavigationActive, setIsArrowNavigationActive] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const skipLinksRef = useRef<HTMLDivElement>(null);

  // Find all focusable elements
  const updateFocusableElements = useCallback(() => {
    if (!containerRef.current) return;

    const elements = Array.from(
      containerRef.current.querySelectorAll(focusableSelector)
    ) as HTMLElement[];

    // Filter out disabled and hidden elements
    const focusable = elements.filter(el => {
      return !el.hasAttribute('disabled') &&
             !el.hasAttribute('aria-hidden') &&
             el.offsetWidth > 0 &&
             el.offsetHeight > 0 &&
             getComputedStyle(el).visibility !== 'hidden';
    });

    setFocusableElements(focusable);
  }, [focusableSelector]);

  // Update focusable elements when DOM changes
  useEffect(() => {
    updateFocusableElements();

    const observer = new MutationObserver(updateFocusableElements);
    if (containerRef.current) {
      observer.observe(containerRef.current, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['disabled', 'aria-hidden', 'tabindex'],
      });
    }

    return () => observer.disconnect();
  }, [updateFocusableElements]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!settings.keyboardNavigation) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if user is typing in input field
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Arrow navigation
      if (enableArrowNavigation && (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
        e.preventDefault();
        setIsArrowNavigationActive(true);

        let newIndex = currentFocusIndex;
        
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
          newIndex = (currentFocusIndex + 1) % focusableElements.length;
        } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
          newIndex = (currentFocusIndex - 1 + focusableElements.length) % focusableElements.length;
        }

        setCurrentFocusIndex(newIndex);
        const elementToFocus = focusableElements[newIndex];
        if (elementToFocus) {
          elementToFocus.focus();
          recordUserInteraction('keyboard-navigation', 'arrow-navigation', true);
        }
      }

      // Home/End navigation
      if (e.key === 'Home' || e.key === 'End') {
        e.preventDefault();
        const newIndex = e.key === 'Home' ? 0 : focusableElements.length - 1;
        setCurrentFocusIndex(newIndex);
        const elementToFocus = focusableElements[newIndex];
        if (elementToFocus) {
          elementToFocus.focus();
          recordUserInteraction('keyboard-navigation', 'home-end-navigation', true);
        }
      }

      // Tab navigation (enhanced)
      if (e.key === 'Tab') {
        if (enableFocusTrap && focusableElements.length > 0) {
          e.preventDefault();
          const newIndex = e.shiftKey 
            ? (currentFocusIndex - 1 + focusableElements.length) % focusableElements.length
            : (currentFocusIndex + 1) % focusableElements.length;
          
          setCurrentFocusIndex(newIndex);
          const elementToFocus = focusableElements[newIndex];
          if (elementToFocus) {
            elementToFocus.focus();
            recordUserInteraction('keyboard-navigation', 'tab-navigation', true);
          }
        }
      }

      // Custom shortcuts
      if (enableCustomShortcuts) {
        // Alt + 1-9: Jump to specific elements
        if (e.altKey && e.key >= '1' && e.key <= '9') {
          e.preventDefault();
          const index = parseInt(e.key) - 1;
          if (index < focusableElements.length) {
            setCurrentFocusIndex(index);
            focusableElements[index]?.focus();
            recordUserInteraction('keyboard-navigation', 'number-shortcut', true);
          }
        }

        // Alt + F: Focus first element
        if (e.altKey && e.key === 'f') {
          e.preventDefault();
          if (focusableElements.length > 0) {
            setCurrentFocusIndex(0);
            focusableElements[0]?.focus();
            recordUserInteraction('keyboard-navigation', 'focus-first', true);
          }
        }

        // Alt + L: Focus last element
        if (e.altKey && e.key === 'l') {
          e.preventDefault();
          if (focusableElements.length > 0) {
            const lastIndex = focusableElements.length - 1;
            setCurrentFocusIndex(lastIndex);
            focusableElements[lastIndex]?.focus();
            recordUserInteraction('keyboard-navigation', 'focus-last', true);
          }
        }
      }

      // Escape: Clear focus or exit focus trap
      if (e.key === 'Escape') {
        if (enableFocusTrap) {
          e.preventDefault();
          setIsArrowNavigationActive(false);
          if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [
    settings.keyboardNavigation,
    currentFocusIndex,
    focusableElements,
    enableArrowNavigation,
    enableFocusTrap,
    enableCustomShortcuts,
    recordUserInteraction,
  ]);

  // Track focus changes
  useEffect(() => {
    if (!settings.keyboardNavigation) return;

    const handleFocus = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      const index = focusableElements.indexOf(target);
      if (index !== -1) {
        setCurrentFocusIndex(index);
      }
    };

    document.addEventListener('focusin', handleFocus);
    return () => document.removeEventListener('focusin', handleFocus);
  }, [focusableElements, settings.keyboardNavigation]);

  // Announce navigation state
  useEffect(() => {
    if (settings.keyboardNavigation && isArrowNavigationActive) {
      announce(
        `Arrow navigation active. ${focusableElements.length} focusable elements. Current: ${currentFocusIndex + 1} of ${focusableElements.length}`,
        'polite'
      );
    }
  }, [isArrowNavigationActive, currentFocusIndex, focusableElements.length, settings.keyboardNavigation, announce]);

  // Skip links data
  const skipLinks = [
    { href: '#main-content', label: 'Skip to main content' },
    { href: '#navigation', label: 'Skip to navigation' },
    { href: '#game-area', label: 'Skip to game area' },
    { href: '#player-actions', label: 'Skip to player actions' },
    { href: '#game-status', label: 'Skip to game status' },
  ];

  if (!settings.keyboardNavigation) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={`keyboard-navigation ${className}`} ref={containerRef}>
      {/* Skip links */}
      {enableSkipLinks && (
        <div className="skip-links" ref={skipLinksRef}>
          {skipLinks.map((link, index) => (
            <a
              key={index}
              href={link.href}
              className="skip-link"
              onFocus={() => recordUserInteraction('keyboard-navigation', 'skip-link', true)}
            >
              {link.label}
            </a>
          ))}
        </div>
      )}

      {/* Navigation instructions */}
      <div className="sr-only">
        <p>
          Keyboard navigation is active. Use Tab to navigate, Arrow keys for enhanced navigation, 
          Alt+1-9 for quick access, Alt+F for first element, Alt+L for last element, 
          Home/End for first/last element, Escape to exit navigation mode.
        </p>
      </div>

      {/* Current focus indicator */}
      <div className="sr-only" aria-live="polite">
        {isArrowNavigationActive && (
          <span>
            Element {currentFocusIndex + 1} of {focusableElements.length} focused
          </span>
        )}
      </div>

      {/* Main content */}
      <div className="keyboard-navigation-content">
        {children}
      </div>

      {/* Keyboard shortcuts help */}
      <div className="keyboard-shortcuts-help sr-only">
        <h3>Keyboard Shortcuts</h3>
        <ul>
          <li>Tab / Shift+Tab: Navigate forward/backward</li>
          <li>Arrow keys: Enhanced navigation</li>
          <li>Home/End: First/last element</li>
          <li>Alt+1-9: Jump to specific elements</li>
          <li>Alt+F: Focus first element</li>
          <li>Alt+L: Focus last element</li>
          <li>Escape: Exit navigation mode</li>
          <li>Enter/Space: Activate element</li>
        </ul>
      </div>

      {/* Keyboard navigation styles */}
      <style jsx>{`
        .keyboard-navigation {
          position: relative;
        }

        .skip-links {
          position: absolute;
          top: -100px;
          left: 0;
          z-index: 1000;
        }

        .skip-link {
          position: absolute;
          top: 0;
          left: 0;
          background: #000;
          color: #fff;
          padding: 8px 16px;
          text-decoration: none;
          border-radius: 4px;
          font-size: 14px;
          font-weight: bold;
          z-index: 1001;
          transform: translateY(-100%);
          transition: transform 0.3s ease;
        }

        .skip-link:focus {
          transform: translateY(0);
        }

        .sr-only {
          position: absolute;
          left: -10000px;
          width: 1px;
          height: 1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }

        /* Enhanced focus indicators */
        :global(.keyboard-navigation) *:focus {
          outline: 3px solid #005fcc;
          outline-offset: 2px;
          box-shadow: 0 0 0 1px #fff, 0 0 0 4px #005fcc;
        }

        /* Focus trap styling */
        :global(.keyboard-navigation.focus-trapped) {
          outline: 2px dashed #005fcc;
          outline-offset: 4px;
        }

        /* Arrow navigation active styling */
        :global(.keyboard-navigation.arrow-navigation-active) *:focus {
          outline: 3px solid #ff6b35;
          outline-offset: 2px;
          box-shadow: 0 0 0 1px #fff, 0 0 0 4px #ff6b35;
        }

        /* Visual focus indicators for different element types */
        :global(.keyboard-navigation) button:focus {
          background-color: #005fcc;
          color: #fff;
        }

        :global(.keyboard-navigation) a:focus {
          background-color: #005fcc;
          color: #fff;
        }

        :global(.keyboard-navigation) input:focus,
        :global(.keyboard-navigation) select:focus,
        :global(.keyboard-navigation) textarea:focus {
          border-color: #005fcc;
          box-shadow: 0 0 0 2px #005fcc;
        }

        /* Enhanced button styling for keyboard users */
        :global(.keyboard-navigation) button {
          position: relative;
          min-height: 44px;
          min-width: 44px;
          padding: 12px 16px;
          border: 2px solid transparent;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        :global(.keyboard-navigation) button:hover {
          border-color: #005fcc;
        }

        /* Enhanced link styling for keyboard users */
        :global(.keyboard-navigation) a {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 4px;
          text-decoration: underline;
          transition: all 0.2s ease;
        }

        :global(.keyboard-navigation) a:hover {
          background-color: rgba(0, 95, 204, 0.1);
        }

        /* Form element enhancements */
        :global(.keyboard-navigation) input,
        :global(.keyboard-navigation) select,
        :global(.keyboard-navigation) textarea {
          min-height: 44px;
          padding: 8px 12px;
          border: 2px solid #ccc;
          border-radius: 4px;
          transition: border-color 0.2s ease;
        }

        :global(.keyboard-navigation) label {
          display: block;
          margin-bottom: 4px;
          font-weight: bold;
        }

        /* Interactive element grouping */
        :global(.keyboard-navigation) .button-group button {
          margin-right: 8px;
        }

        :global(.keyboard-navigation) .button-group button:last-child {
          margin-right: 0;
        }

        /* Navigation landmarks */
        :global(.keyboard-navigation) [role="main"],
        :global(.keyboard-navigation) [role="navigation"],
        :global(.keyboard-navigation) [role="complementary"] {
          position: relative;
        }

        :global(.keyboard-navigation) [role="main"]:focus-within::before,
        :global(.keyboard-navigation) [role="navigation"]:focus-within::before,
        :global(.keyboard-navigation) [role="complementary"]:focus-within::before {
          content: '';
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          border: 2px solid #005fcc;
          border-radius: 4px;
          pointer-events: none;
        }

        /* High contrast mode adjustments */
        :global(.high-contrast .keyboard-navigation) *:focus {
          outline: 3px solid #fff;
          background: #000;
          color: #fff;
        }

        /* Reduced motion adjustments */
        :global(.reduced-motion .keyboard-navigation) * {
          transition: none !important;
        }

        :global(.reduced-motion .keyboard-navigation) .skip-link {
          transition: none !important;
        }
      `}</style>
    </div>
  );
}

export default KeyboardNavigation;
