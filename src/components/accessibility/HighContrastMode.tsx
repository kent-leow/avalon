'use client';

/**
 * High Contrast Mode Component
 * 
 * Provides high contrast mode support for visually impaired users
 */

import { useEffect, useState } from 'react';
import { useAccessibility } from '~/hooks/useAccessibility';
import { checkColorContrast, meetsWCAGContrast } from '~/lib/accessibility-utils';

interface HighContrastModeProps {
  children: React.ReactNode;
  enableColorContrastChecking?: boolean;
  enableCustomColors?: boolean;
  className?: string;
}

const HIGH_CONTRAST_COLORS = {
  background: '#000000',
  text: '#ffffff',
  primary: '#ffffff',
  secondary: '#ffff00',
  accent: '#00ff00',
  warning: '#ff0000',
  success: '#00ff00',
  error: '#ff0000',
  border: '#ffffff',
  focus: '#ffff00',
  hover: '#808080',
  disabled: '#666666',
  link: '#00ffff',
  visited: '#ff00ff',
};

export function HighContrastMode({
  children,
  enableColorContrastChecking = true,
  enableCustomColors = true,
  className = '',
}: HighContrastModeProps) {
  const { settings, announce } = useAccessibility();
  const [contrastIssues, setContrastIssues] = useState<{
    element: HTMLElement;
    ratio: number;
    required: number;
  }[]>([]);

  // Apply high contrast styles
  useEffect(() => {
    if (!settings.highContrastMode) return;

    const root = document.documentElement;
    
    // Set CSS custom properties for high contrast
    Object.entries(HIGH_CONTRAST_COLORS).forEach(([key, value]) => {
      root.style.setProperty(`--hc-${key}`, value);
    });

    // Apply high contrast class
    document.body.classList.add('high-contrast-mode');

    // Announce mode activation
    announce('High contrast mode activated', 'polite');

    return () => {
      document.body.classList.remove('high-contrast-mode');
      
      // Remove custom properties
      Object.keys(HIGH_CONTRAST_COLORS).forEach(key => {
        root.style.removeProperty(`--hc-${key}`);
      });
    };
  }, [settings.highContrastMode, announce]);

  // Check color contrast ratios
  useEffect(() => {
    if (!enableColorContrastChecking || !settings.highContrastMode) return;

    const checkContrast = () => {
      const issues: typeof contrastIssues = [];
      
      // Check text elements
      const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div, a, button, label, input, textarea, select');
      
      textElements.forEach(element => {
        const htmlElement = element as HTMLElement;
        const styles = getComputedStyle(htmlElement);
        const color = styles.color;
        const backgroundColor = styles.backgroundColor;
        
        if (color && backgroundColor && backgroundColor !== 'rgba(0, 0, 0, 0)') {
          const ratio = checkColorContrast(color, backgroundColor);
          const isLargeText = parseFloat(styles.fontSize) >= 18 || 
                            (parseFloat(styles.fontSize) >= 14 && parseInt(styles.fontWeight) >= 700);
          
          if (!meetsWCAGContrast(color, backgroundColor, 'AA', isLargeText)) {
            issues.push({
              element: htmlElement,
              ratio,
              required: isLargeText ? 3.0 : 4.5,
            });
          }
        }
      });
      
      setContrastIssues(issues);
    };

    checkContrast();
    
    // Re-check when styles change
    const observer = new MutationObserver(checkContrast);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['style', 'class'],
      subtree: true,
    });

    return () => observer.disconnect();
  }, [enableColorContrastChecking, settings.highContrastMode]);

  // Warn about contrast issues
  useEffect(() => {
    if (contrastIssues.length > 0) {
      console.warn(`High contrast mode detected ${contrastIssues.length} contrast issues:`, contrastIssues);
    }
  }, [contrastIssues]);

  if (!settings.highContrastMode) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={`high-contrast-mode ${className}`}>
      {children}
      
      {/* High contrast mode styles */}
      <style jsx global>{`
        /* High contrast mode base styles */
        .high-contrast-mode {
          background: ${HIGH_CONTRAST_COLORS.background} !important;
          color: ${HIGH_CONTRAST_COLORS.text} !important;
        }

        /* Text elements */
        .high-contrast-mode p,
        .high-contrast-mode h1,
        .high-contrast-mode h2,
        .high-contrast-mode h3,
        .high-contrast-mode h4,
        .high-contrast-mode h5,
        .high-contrast-mode h6,
        .high-contrast-mode span,
        .high-contrast-mode div,
        .high-contrast-mode label {
          color: ${HIGH_CONTRAST_COLORS.text} !important;
          background: transparent !important;
        }

        /* Buttons */
        .high-contrast-mode button {
          background: ${HIGH_CONTRAST_COLORS.background} !important;
          color: ${HIGH_CONTRAST_COLORS.text} !important;
          border: 2px solid ${HIGH_CONTRAST_COLORS.border} !important;
        }

        .high-contrast-mode button:hover {
          background: ${HIGH_CONTRAST_COLORS.hover} !important;
        }

        .high-contrast-mode button:focus {
          outline: 3px solid ${HIGH_CONTRAST_COLORS.focus} !important;
          outline-offset: 2px;
        }

        .high-contrast-mode button:disabled {
          background: ${HIGH_CONTRAST_COLORS.disabled} !important;
          color: ${HIGH_CONTRAST_COLORS.text} !important;
          border-color: ${HIGH_CONTRAST_COLORS.disabled} !important;
        }

        /* Links */
        .high-contrast-mode a {
          color: ${HIGH_CONTRAST_COLORS.link} !important;
          text-decoration: underline !important;
        }

        .high-contrast-mode a:visited {
          color: ${HIGH_CONTRAST_COLORS.visited} !important;
        }

        .high-contrast-mode a:hover {
          background: ${HIGH_CONTRAST_COLORS.hover} !important;
        }

        .high-contrast-mode a:focus {
          outline: 3px solid ${HIGH_CONTRAST_COLORS.focus} !important;
          outline-offset: 2px;
        }

        /* Form elements */
        .high-contrast-mode input,
        .high-contrast-mode select,
        .high-contrast-mode textarea {
          background: ${HIGH_CONTRAST_COLORS.background} !important;
          color: ${HIGH_CONTRAST_COLORS.text} !important;
          border: 2px solid ${HIGH_CONTRAST_COLORS.border} !important;
        }

        .high-contrast-mode input:focus,
        .high-contrast-mode select:focus,
        .high-contrast-mode textarea:focus {
          outline: 3px solid ${HIGH_CONTRAST_COLORS.focus} !important;
          outline-offset: 2px;
        }

        .high-contrast-mode input:disabled,
        .high-contrast-mode select:disabled,
        .high-contrast-mode textarea:disabled {
          background: ${HIGH_CONTRAST_COLORS.disabled} !important;
          border-color: ${HIGH_CONTRAST_COLORS.disabled} !important;
        }

        /* Checkboxes and radio buttons */
        .high-contrast-mode input[type="checkbox"],
        .high-contrast-mode input[type="radio"] {
          accent-color: ${HIGH_CONTRAST_COLORS.accent} !important;
        }

        /* Cards and containers */
        .high-contrast-mode .card,
        .high-contrast-mode .panel,
        .high-contrast-mode .container {
          background: ${HIGH_CONTRAST_COLORS.background} !important;
          border: 2px solid ${HIGH_CONTRAST_COLORS.border} !important;
        }

        /* Status indicators */
        .high-contrast-mode .success {
          color: ${HIGH_CONTRAST_COLORS.success} !important;
        }

        .high-contrast-mode .warning {
          color: ${HIGH_CONTRAST_COLORS.warning} !important;
        }

        .high-contrast-mode .error {
          color: ${HIGH_CONTRAST_COLORS.error} !important;
        }

        /* Game-specific elements */
        .high-contrast-mode .player-card {
          background: ${HIGH_CONTRAST_COLORS.background} !important;
          border: 3px solid ${HIGH_CONTRAST_COLORS.border} !important;
          color: ${HIGH_CONTRAST_COLORS.text} !important;
        }

        .high-contrast-mode .player-card.selected {
          border-color: ${HIGH_CONTRAST_COLORS.accent} !important;
        }

        .high-contrast-mode .mission-card {
          background: ${HIGH_CONTRAST_COLORS.background} !important;
          border: 3px solid ${HIGH_CONTRAST_COLORS.border} !important;
          color: ${HIGH_CONTRAST_COLORS.text} !important;
        }

        .high-contrast-mode .role-card {
          background: ${HIGH_CONTRAST_COLORS.background} !important;
          border: 3px solid ${HIGH_CONTRAST_COLORS.border} !important;
          color: ${HIGH_CONTRAST_COLORS.text} !important;
        }

        .high-contrast-mode .vote-button {
          background: ${HIGH_CONTRAST_COLORS.background} !important;
          border: 3px solid ${HIGH_CONTRAST_COLORS.border} !important;
          color: ${HIGH_CONTRAST_COLORS.text} !important;
        }

        .high-contrast-mode .vote-button.approve {
          border-color: ${HIGH_CONTRAST_COLORS.success} !important;
        }

        .high-contrast-mode .vote-button.reject {
          border-color: ${HIGH_CONTRAST_COLORS.error} !important;
        }

        /* Remove images and background images */
        .high-contrast-mode img {
          filter: contrast(1000%) brightness(0) invert(1);
        }

        .high-contrast-mode [style*="background-image"] {
          background-image: none !important;
        }

        /* Remove shadows and gradients */
        .high-contrast-mode * {
          box-shadow: none !important;
          text-shadow: none !important;
          background-image: none !important;
        }

        /* Ensure text readability */
        .high-contrast-mode * {
          font-weight: bold !important;
        }

        /* Remove transparency */
        .high-contrast-mode * {
          opacity: 1 !important;
        }

        /* Focus indicators */
        .high-contrast-mode *:focus {
          outline: 3px solid ${HIGH_CONTRAST_COLORS.focus} !important;
          outline-offset: 2px;
        }

        /* Selection colors */
        .high-contrast-mode ::selection {
          background: ${HIGH_CONTRAST_COLORS.focus} !important;
          color: ${HIGH_CONTRAST_COLORS.background} !important;
        }

        /* Scrollbars */
        .high-contrast-mode ::-webkit-scrollbar {
          background: ${HIGH_CONTRAST_COLORS.background} !important;
        }

        .high-contrast-mode ::-webkit-scrollbar-thumb {
          background: ${HIGH_CONTRAST_COLORS.border} !important;
        }

        .high-contrast-mode ::-webkit-scrollbar-track {
          background: ${HIGH_CONTRAST_COLORS.background} !important;
        }

        /* Modal and dialog styling */
        .high-contrast-mode .modal,
        .high-contrast-mode .dialog {
          background: ${HIGH_CONTRAST_COLORS.background} !important;
          border: 3px solid ${HIGH_CONTRAST_COLORS.border} !important;
        }

        .high-contrast-mode .modal-overlay {
          background: rgba(0, 0, 0, 0.9) !important;
        }

        /* Tooltip styling */
        .high-contrast-mode .tooltip {
          background: ${HIGH_CONTRAST_COLORS.background} !important;
          color: ${HIGH_CONTRAST_COLORS.text} !important;
          border: 2px solid ${HIGH_CONTRAST_COLORS.border} !important;
        }

        /* Table styling */
        .high-contrast-mode table {
          border-collapse: collapse !important;
        }

        .high-contrast-mode th,
        .high-contrast-mode td {
          border: 2px solid ${HIGH_CONTRAST_COLORS.border} !important;
          background: ${HIGH_CONTRAST_COLORS.background} !important;
          color: ${HIGH_CONTRAST_COLORS.text} !important;
        }

        .high-contrast-mode th {
          font-weight: bold !important;
        }

        /* Navigation styling */
        .high-contrast-mode nav {
          background: ${HIGH_CONTRAST_COLORS.background} !important;
          border: 2px solid ${HIGH_CONTRAST_COLORS.border} !important;
        }

        .high-contrast-mode nav a {
          color: ${HIGH_CONTRAST_COLORS.link} !important;
        }

        .high-contrast-mode nav a:hover {
          background: ${HIGH_CONTRAST_COLORS.hover} !important;
        }

        /* Progress bars */
        .high-contrast-mode .progress-bar {
          background: ${HIGH_CONTRAST_COLORS.background} !important;
          border: 2px solid ${HIGH_CONTRAST_COLORS.border} !important;
        }

        .high-contrast-mode .progress-bar-fill {
          background: ${HIGH_CONTRAST_COLORS.accent} !important;
        }

        /* Badges and labels */
        .high-contrast-mode .badge,
        .high-contrast-mode .label {
          background: ${HIGH_CONTRAST_COLORS.background} !important;
          color: ${HIGH_CONTRAST_COLORS.text} !important;
          border: 2px solid ${HIGH_CONTRAST_COLORS.border} !important;
        }
      `}</style>
    </div>
  );
}

export default HighContrastMode;
