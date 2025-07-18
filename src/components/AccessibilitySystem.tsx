'use client';

/**
 * Accessibility System Component
 * 
 * Main coordinator for accessibility compliance and WCAG 2.1 AA support
 */

import { useEffect, useState, useCallback } from 'react';
import { useAccessibility } from '~/hooks/useAccessibility';
import { type AccessibilitySettings, type AccessibilityRecommendation } from '~/types/accessibility';

interface AccessibilitySystemProps {
  children: React.ReactNode;
  enableFloatingControls?: boolean;
  enableSystemIntegration?: boolean;
  enableComplianceMonitoring?: boolean;
  enableUserGuidance?: boolean;
  className?: string;
}

export function AccessibilitySystem({
  children,
  enableFloatingControls = true,
  enableSystemIntegration = true,
  enableComplianceMonitoring = true,
  enableUserGuidance = true,
  className = '',
}: AccessibilitySystemProps) {
  const [isControlsVisible, setIsControlsVisible] = useState(false);
  const [recommendations, setRecommendations] = useState<AccessibilityRecommendation[]>([]);
  const [complianceStatus, setComplianceStatus] = useState<{
    level: 'AA' | 'AAA' | 'none';
    score: number;
    issues: string[];
  }>({ level: 'none', score: 0, issues: [] });

  const {
    state,
    settings,
    config,
    elementRef,
    updateSettings,
    toggleFeature,
    applyPreset,
    resetToDefaults,
    announce,
    announceError,
    announceSuccess,
    validateAccessibility,
    getAccessibilityStatus,
    getRecommendations,
    getKeyboardShortcuts,
  } = useAccessibility({
    autoFocus: false,
    trapFocus: false,
    announceChanges: true,
    trackInteractions: true,
    enableKeyboardShortcuts: true,
  });

  // Monitor compliance status
  useEffect(() => {
    if (enableComplianceMonitoring) {
      const checkCompliance = () => {
        const validation = validateAccessibility();
        const status = getAccessibilityStatus();
        
        let level: 'AA' | 'AAA' | 'none' = 'none';
        let score = 0;

        // Calculate compliance score
        if (settings.keyboardNavigation) score += 20;
        if (settings.screenReaderEnabled) score += 20;
        if (settings.announcements) score += 15;
        if (settings.focusIndicatorStyle !== 'default') score += 15;
        if (settings.highContrastMode) score += 10;
        if (settings.reducedMotion) score += 10;
        if (settings.textScale >= 125) score += 10;

        // Determine compliance level
        if (score >= 80) {
          level = 'AAA';
        } else if (score >= 60) {
          level = 'AA';
        }

        setComplianceStatus({
          level,
          score,
          issues: validation.errors,
        });
      };

      checkCompliance();
      const interval = setInterval(checkCompliance, 30000); // Check every 30 seconds

      return () => clearInterval(interval);
    }
  }, [enableComplianceMonitoring, settings, validateAccessibility, getAccessibilityStatus]);

  // Update recommendations
  useEffect(() => {
    if (enableUserGuidance) {
      const newRecommendations = getRecommendations();
      setRecommendations(newRecommendations);
    }
  }, [enableUserGuidance, getRecommendations, settings]);

  // Handle keyboard shortcuts for accessibility panel
  useEffect(() => {
    const handleKeyboardShortcut = (e: KeyboardEvent) => {
      // Alt + A: Toggle accessibility controls
      if (e.altKey && e.key === 'a') {
        e.preventDefault();
        setIsControlsVisible(prev => !prev);
        announce(isControlsVisible ? 'Accessibility controls hidden' : 'Accessibility controls shown', 'polite');
      }

      // Escape: Close accessibility controls
      if (e.key === 'Escape' && isControlsVisible) {
        setIsControlsVisible(false);
        announce('Accessibility controls closed', 'polite');
      }
    };

    document.addEventListener('keydown', handleKeyboardShortcut);
    return () => document.removeEventListener('keydown', handleKeyboardShortcut);
  }, [isControlsVisible, announce]);

  // Handle preset application
  const handleApplyPreset = useCallback((preset: 'default' | 'high-contrast' | 'large-text' | 'reduced-motion' | 'screen-reader') => {
    applyPreset(preset);
    announceSuccess(`Applied ${preset} preset`);
  }, [applyPreset, announceSuccess]);

  // Handle settings toggle
  const handleToggleFeature = useCallback((feature: keyof AccessibilitySettings) => {
    toggleFeature(feature);
    announce(`${feature} ${settings[feature] ? 'disabled' : 'enabled'}`, 'polite');
  }, [toggleFeature, settings, announce]);

  // Handle reset to defaults
  const handleResetToDefaults = useCallback(() => {
    resetToDefaults();
    announceSuccess('Accessibility settings reset to defaults');
  }, [resetToDefaults, announceSuccess]);

  // System integration effects
  useEffect(() => {
    if (enableSystemIntegration) {
      // Add accessibility classes to body
      document.body.classList.toggle('accessibility-enabled', true);
      document.body.classList.toggle('high-contrast', settings.highContrastMode);
      document.body.classList.toggle('reduced-motion', settings.reducedMotion);
      document.body.classList.toggle('screen-reader-enabled', settings.screenReaderEnabled);
      
      // Update CSS custom properties
      document.documentElement.style.setProperty('--accessibility-text-scale', `${settings.textScale}%`);
      document.documentElement.style.setProperty('--accessibility-focus-style', settings.focusIndicatorStyle);

      return () => {
        document.body.classList.remove('accessibility-enabled', 'high-contrast', 'reduced-motion', 'screen-reader-enabled');
      };
    }
  }, [enableSystemIntegration, settings]);

  return (
    <div className={`accessibility-system ${className}`} ref={elementRef as React.RefObject<HTMLDivElement>}>
      {/* Live regions for screen reader announcements */}
      <div id="live-region-polite" aria-live="polite" aria-atomic="true" className="sr-only" />
      <div id="live-region-assertive" aria-live="assertive" aria-atomic="true" className="sr-only" />
      
      {/* Skip links */}
      <div className="skip-links">
        <a href="#main-content" className="skip-link">Skip to main content</a>
        <a href="#navigation" className="skip-link">Skip to navigation</a>
        <a href="#accessibility-controls" className="skip-link">Skip to accessibility controls</a>
      </div>

      {/* Main content */}
      <main id="main-content" className="accessibility-main">
        {children}
      </main>

      {/* Floating accessibility controls */}
      {enableFloatingControls && (
        <div className="accessibility-floating-controls">
          <button
            className="accessibility-toggle-btn"
            onClick={() => setIsControlsVisible(!isControlsVisible)}
            aria-label="Toggle accessibility controls"
            aria-expanded={isControlsVisible}
            aria-controls="accessibility-controls"
          >
            <span className="accessibility-icon" aria-hidden="true">♿</span>
          </button>

          {isControlsVisible && (
            <div id="accessibility-controls" className="accessibility-controls-panel">
              <div className="accessibility-controls-header">
                <h2>Accessibility Controls</h2>
                <button
                  className="accessibility-close-btn"
                  onClick={() => setIsControlsVisible(false)}
                  aria-label="Close accessibility controls"
                >
                  ×
                </button>
              </div>

              <div className="accessibility-controls-content">
                {/* Quick presets */}
                <div className="accessibility-section">
                  <h3>Quick Presets</h3>
                  <div className="accessibility-preset-buttons">
                    <button onClick={() => handleApplyPreset('default')}>
                      Default
                    </button>
                    <button onClick={() => handleApplyPreset('high-contrast')}>
                      High Contrast
                    </button>
                    <button onClick={() => handleApplyPreset('large-text')}>
                      Large Text
                    </button>
                    <button onClick={() => handleApplyPreset('reduced-motion')}>
                      Reduced Motion
                    </button>
                    <button onClick={() => handleApplyPreset('screen-reader')}>
                      Screen Reader
                    </button>
                  </div>
                </div>

                {/* Individual settings */}
                <div className="accessibility-section">
                  <h3>Individual Settings</h3>
                  <div className="accessibility-settings">
                    <label className="accessibility-checkbox">
                      <input
                        type="checkbox"
                        checked={settings.highContrastMode}
                        onChange={() => handleToggleFeature('highContrastMode')}
                      />
                      High Contrast Mode
                    </label>
                    
                    <label className="accessibility-checkbox">
                      <input
                        type="checkbox"
                        checked={settings.reducedMotion}
                        onChange={() => handleToggleFeature('reducedMotion')}
                      />
                      Reduced Motion
                    </label>
                    
                    <label className="accessibility-checkbox">
                      <input
                        type="checkbox"
                        checked={settings.screenReaderEnabled}
                        onChange={() => handleToggleFeature('screenReaderEnabled')}
                      />
                      Screen Reader Support
                    </label>
                    
                    <label className="accessibility-checkbox">
                      <input
                        type="checkbox"
                        checked={settings.keyboardNavigation}
                        onChange={() => handleToggleFeature('keyboardNavigation')}
                      />
                      Keyboard Navigation
                    </label>
                    
                    <label className="accessibility-checkbox">
                      <input
                        type="checkbox"
                        checked={settings.announcements}
                        onChange={() => handleToggleFeature('announcements')}
                      />
                      Screen Reader Announcements
                    </label>
                  </div>

                  <div className="accessibility-text-scale">
                    <label htmlFor="text-scale">Text Scale: {settings.textScale}%</label>
                    <input
                      id="text-scale"
                      type="range"
                      min="100"
                      max="200"
                      step="25"
                      value={settings.textScale}
                      onChange={(e) => updateSettings({ textScale: parseInt(e.target.value) as 100 | 125 | 150 | 200 })}
                    />
                  </div>
                </div>

                {/* Compliance status */}
                {enableComplianceMonitoring && (
                  <div className="accessibility-section">
                    <h3>Compliance Status</h3>
                    <div className="accessibility-compliance">
                      <div className="compliance-level">
                        Level: <span className={`level-${complianceStatus.level}`}>{complianceStatus.level}</span>
                      </div>
                      <div className="compliance-score">
                        Score: {complianceStatus.score}/100
                      </div>
                      {complianceStatus.issues.length > 0 && (
                        <div className="compliance-issues">
                          <h4>Issues to Address:</h4>
                          <ul>
                            {complianceStatus.issues.map((issue, index) => (
                              <li key={index}>{issue}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {enableUserGuidance && recommendations.length > 0 && (
                  <div className="accessibility-section">
                    <h3>Recommendations</h3>
                    <div className="accessibility-recommendations">
                      {recommendations.map((rec) => (
                        <div key={rec.id} className="accessibility-recommendation">
                          <h4>{rec.title}</h4>
                          <p>{rec.description}</p>
                          {rec.type === 'settings' && rec.settings && (
                            <button
                              className="apply-recommendation-btn"
                              onClick={() => updateSettings(rec.settings!)}
                            >
                              Apply
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Keyboard shortcuts */}
                <div className="accessibility-section">
                  <h3>Keyboard Shortcuts</h3>
                  <div className="accessibility-shortcuts">
                    {getKeyboardShortcuts().slice(0, 5).map((shortcut, index) => (
                      <div key={index} className="accessibility-shortcut">
                        <kbd>{shortcut.key}</kbd>
                        <span>{shortcut.description}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Reset button */}
                <div className="accessibility-section">
                  <button
                    className="accessibility-reset-btn"
                    onClick={handleResetToDefaults}
                  >
                    Reset to Defaults
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Accessibility styles */}
      <style jsx>{`
        .accessibility-system {
          position: relative;
          min-height: 100vh;
        }

        .sr-only {
          position: absolute;
          left: -10000px;
          width: 1px;
          height: 1px;
          overflow: hidden;
        }

        .skip-links {
          position: absolute;
          top: -40px;
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
          z-index: 1001;
          transform: translateY(-100%);
          transition: transform 0.2s;
        }

        .skip-link:focus {
          transform: translateY(0);
        }

        .accessibility-floating-controls {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 1000;
        }

        .accessibility-toggle-btn {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: #007cba;
          color: white;
          border: none;
          font-size: 24px;
          cursor: pointer;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
          transition: all 0.3s ease;
        }

        .accessibility-toggle-btn:hover {
          background: #005a87;
          transform: scale(1.1);
        }

        .accessibility-toggle-btn:focus {
          outline: 3px solid #ffd700;
          outline-offset: 2px;
        }

        .accessibility-controls-panel {
          position: absolute;
          bottom: 70px;
          right: 0;
          width: 400px;
          max-width: 90vw;
          background: white;
          border: 1px solid #ddd;
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
          max-height: 80vh;
          overflow-y: auto;
        }

        .accessibility-controls-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          border-bottom: 1px solid #eee;
        }

        .accessibility-controls-header h2 {
          margin: 0;
          font-size: 18px;
        }

        .accessibility-close-btn {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          padding: 4px;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .accessibility-controls-content {
          padding: 16px;
        }

        .accessibility-section {
          margin-bottom: 24px;
        }

        .accessibility-section h3 {
          margin: 0 0 12px 0;
          font-size: 16px;
        }

        .accessibility-preset-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .accessibility-preset-buttons button {
          padding: 8px 12px;
          border: 1px solid #ddd;
          background: white;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .accessibility-preset-buttons button:hover {
          background: #f0f0f0;
        }

        .accessibility-settings {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .accessibility-checkbox {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }

        .accessibility-text-scale {
          margin-top: 16px;
        }

        .accessibility-text-scale label {
          display: block;
          margin-bottom: 8px;
        }

        .accessibility-text-scale input {
          width: 100%;
        }

        .accessibility-compliance {
          font-size: 14px;
        }

        .compliance-level .level-AAA {
          color: #28a745;
          font-weight: bold;
        }

        .compliance-level .level-AA {
          color: #ffc107;
          font-weight: bold;
        }

        .compliance-level .level-none {
          color: #dc3545;
          font-weight: bold;
        }

        .compliance-issues ul {
          margin: 8px 0;
          padding-left: 16px;
        }

        .accessibility-recommendations {
          font-size: 14px;
        }

        .accessibility-recommendation {
          border: 1px solid #ddd;
          border-radius: 4px;
          padding: 12px;
          margin-bottom: 12px;
        }

        .accessibility-recommendation h4 {
          margin: 0 0 8px 0;
          font-size: 14px;
        }

        .apply-recommendation-btn {
          background: #007cba;
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          margin-top: 8px;
        }

        .accessibility-shortcuts {
          font-size: 12px;
        }

        .accessibility-shortcut {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }

        .accessibility-shortcut kbd {
          background: #f0f0f0;
          border: 1px solid #ddd;
          border-radius: 3px;
          padding: 2px 6px;
          font-size: 11px;
          min-width: 60px;
          text-align: center;
        }

        .accessibility-reset-btn {
          background: #dc3545;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 4px;
          cursor: pointer;
          width: 100%;
        }

        .accessibility-reset-btn:hover {
          background: #c82333;
        }

        /* High contrast mode styles */
        :global(.high-contrast) .accessibility-controls-panel {
          background: #000;
          color: #fff;
          border-color: #fff;
        }

        :global(.high-contrast) .accessibility-preset-buttons button {
          background: #000;
          color: #fff;
          border-color: #fff;
        }

        :global(.reduced-motion) * {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      `}</style>
    </div>
  );
}

export default AccessibilitySystem;
