/**
 * Accessibility Settings Component
 * 
 * Provides a comprehensive interface for users to manage their accessibility
 * preferences, including presets, custom settings, and real-time previews.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useAccessibility } from '~/hooks/useAccessibility';
import type { 
  AccessibilitySettings, 
  AccessibilityPreset, 
  AccessibilityFeature,
  InputMethod,
} from '~/types/accessibility';

interface AccessibilitySettingsProps {
  settings: AccessibilitySettings;
  onSettingsChange: (settings: AccessibilitySettings) => void;
  presets: AccessibilityPreset[];
  onPresetSelect?: (preset: AccessibilityPreset) => void;
  onReset?: () => void;
}

const AccessibilitySettings: React.FC<AccessibilitySettingsProps> = ({
  settings,
  onSettingsChange,
  presets,
  onPresetSelect,
  onReset,
}) => {
  const { announce } = useAccessibility();
  const [activeTab, setActiveTab] = useState<'general' | 'visual' | 'motor' | 'cognitive'>('general');
  const [isOpen, setIsOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [previewSettings, setPreviewSettings] = useState<AccessibilitySettings>(settings);

  // Handle settings change with preview
  const handleSettingChange = (key: keyof AccessibilitySettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    
    if (previewMode) {
      setPreviewSettings(newSettings);
    } else {
      onSettingsChange(newSettings);
    }
    
    announce(`Setting ${key} changed to ${value}`);
  };

  // Handle preset selection
  const handlePresetSelect = (preset: AccessibilityPreset) => {
    onSettingsChange(preset.settings);
    onPresetSelect?.(preset);
    announce(`Preset ${preset.name} applied`);
  };

  // Apply preview settings
  const applyPreviewSettings = () => {
    onSettingsChange(previewSettings);
    setPreviewMode(false);
    announce('Preview settings applied');
  };

  // Cancel preview
  const cancelPreview = () => {
    setPreviewSettings(settings);
    setPreviewMode(false);
    announce('Preview cancelled');
  };

  // Reset to defaults
  const handleReset = () => {
    onReset?.();
    announce('Settings reset to defaults');
  };

  const currentSettings = previewMode ? previewSettings : settings;

  return (
    <>
      {/* Settings Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="accessibility-settings-toggle"
        aria-expanded={isOpen}
        aria-controls="accessibility-settings-panel"
        data-testid="accessibility-settings-toggle"
      >
        <span className="sr-only">Accessibility Settings</span>
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M12 1v6m0 6v6"></path>
          <path d="M12 1l2.09 2.09M12 1L9.91 3.09"></path>
          <path d="M12 23l2.09-2.09M12 23l-2.09-2.09"></path>
          <path d="M1 12h6m6 0h6"></path>
          <path d="M1 12l2.09-2.09M1 12l2.09 2.09"></path>
          <path d="M23 12l-2.09-2.09M23 12l-2.09 2.09"></path>
        </svg>
      </button>

      {/* Settings Panel */}
      {isOpen && (
        <div
          id="accessibility-settings-panel"
          className="accessibility-settings-panel"
          role="dialog"
          aria-labelledby="accessibility-settings-title"
          aria-modal="true"
          data-testid="accessibility-settings-panel"
        >
          <div className="settings-header">
            <h2 id="accessibility-settings-title">Accessibility Settings</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="close-button"
              aria-label="Close accessibility settings"
              data-testid="close-accessibility-settings"
            >
              ×
            </button>
          </div>

          <div className="settings-content">
            {/* Presets Section */}
            <div className="settings-section">
              <h3>Quick Presets</h3>
              <div className="presets-grid">
                {presets.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handlePresetSelect(preset)}
                    className="preset-button"
                    data-testid={`preset-${preset.id}`}
                  >
                    <strong>{preset.name}</strong>
                    <span className="preset-description">{preset.description}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="settings-tabs">
              <div className="tab-list" role="tablist">
                {[
                  { id: 'general', label: 'General' },
                  { id: 'visual', label: 'Visual' },
                  { id: 'motor', label: 'Motor' },
                  { id: 'cognitive', label: 'Cognitive' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    role="tab"
                    aria-selected={activeTab === tab.id}
                    aria-controls={`${tab.id}-panel`}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                    data-testid={`tab-${tab.id}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* General Settings */}
              <div
                id="general-panel"
                role="tabpanel"
                aria-labelledby="general-tab"
                className={`tab-panel ${activeTab === 'general' ? 'active' : ''}`}
              >
                <div className="setting-group">
                  <label className="setting-label">
                    <input
                      type="checkbox"
                      checked={currentSettings.screenReaderEnabled}
                      onChange={(e) => handleSettingChange('screenReaderEnabled', e.target.checked)}
                      data-testid="screen-reader-enabled"
                    />
                    Screen Reader Enabled
                  </label>
                  <p className="setting-description">
                    Optimize the interface for screen readers with enhanced ARIA labels and descriptions.
                  </p>
                </div>

                <div className="setting-group">
                  <label className="setting-label">
                    <input
                      type="checkbox"
                      checked={currentSettings.keyboardNavigation}
                      onChange={(e) => handleSettingChange('keyboardNavigation', e.target.checked)}
                      data-testid="keyboard-navigation"
                    />
                    Enhanced Keyboard Navigation
                  </label>
                  <p className="setting-description">
                    Enable enhanced keyboard navigation with visual focus indicators and skip links.
                  </p>
                </div>

                <div className="setting-group">
                  <label className="setting-label">
                    <input
                      type="checkbox"
                      checked={currentSettings.reducedMotion}
                      onChange={(e) => handleSettingChange('reducedMotion', e.target.checked)}
                      data-testid="reduced-motion"
                    />
                    Reduced Motion
                  </label>
                  <p className="setting-description">
                    Reduce or eliminate animations and transitions that may cause discomfort.
                  </p>
                </div>
              </div>

              {/* Visual Settings */}
              <div
                id="visual-panel"
                role="tabpanel"
                aria-labelledby="visual-tab"
                className={`tab-panel ${activeTab === 'visual' ? 'active' : ''}`}
              >
                <div className="setting-group">
                  <label className="setting-label">
                    <input
                      type="checkbox"
                      checked={currentSettings.highContrastMode}
                      onChange={(e) => handleSettingChange('highContrastMode', e.target.checked)}
                      data-testid="high-contrast-mode"
                    />
                    High Contrast Mode
                  </label>
                  <p className="setting-description">
                    Use high contrast colors for better visibility.
                  </p>
                </div>

                <div className="setting-group">
                  <label className="setting-label">
                    Text Scale
                    <select
                      value={currentSettings.textScale}
                      onChange={(e) => handleSettingChange('textScale', parseInt(e.target.value) as 100 | 125 | 150 | 200)}
                      data-testid="text-scale"
                    >
                      <option value="100">100%</option>
                      <option value="125">125%</option>
                      <option value="150">150%</option>
                      <option value="200">200%</option>
                    </select>
                  </label>
                  <p className="setting-description">
                    Adjust text size for better readability.
                  </p>
                </div>

                <div className="setting-group">
                  <label className="setting-label">
                    Focus Indicator Style
                    <select
                      value={currentSettings.focusIndicatorStyle}
                      onChange={(e) => handleSettingChange('focusIndicatorStyle', e.target.value as 'default' | 'high-contrast' | 'large')}
                      data-testid="focus-indicator-style"
                    >
                      <option value="default">Default</option>
                      <option value="high-contrast">High Contrast</option>
                      <option value="large">Large</option>
                    </select>
                  </label>
                  <p className="setting-description">
                    Choose the style of focus indicators.
                  </p>
                </div>
              </div>

              {/* Motor Settings */}
              <div
                id="motor-panel"
                role="tabpanel"
                aria-labelledby="motor-tab"
                className={`tab-panel ${activeTab === 'motor' ? 'active' : ''}`}
              >
                <div className="setting-group">
                  <label className="setting-label">
                    Alternative Input Methods
                    <select
                      value={currentSettings.alternativeInputs[0] || 'keyboard'}
                      onChange={(e) => handleSettingChange('alternativeInputs', [e.target.value as InputMethod])}
                      data-testid="alternative-inputs"
                    >
                      <option value="keyboard">Keyboard</option>
                      <option value="voice">Voice</option>
                      <option value="switch">Switch</option>
                      <option value="eye-tracking">Eye Tracking</option>
                      <option value="head-tracking">Head Tracking</option>
                    </select>
                  </label>
                  <p className="setting-description">
                    Choose your preferred input method for game interactions.
                  </p>
                </div>

                <div className="setting-group">
                  <label className="setting-label">
                    <input
                      type="checkbox"
                      checked={currentSettings.announcements}
                      onChange={(e) => handleSettingChange('announcements', e.target.checked)}
                      data-testid="announcements"
                    />
                    Audio Announcements
                  </label>
                  <p className="setting-description">
                    Enable audio announcements for game state changes and actions.
                  </p>
                </div>
              </div>

              {/* Cognitive Settings */}
              <div
                id="cognitive-panel"
                role="tabpanel"
                aria-labelledby="cognitive-tab"
                className={`tab-panel ${activeTab === 'cognitive' ? 'active' : ''}`}
              >
                <div className="setting-group">
                  <label className="setting-label">
                    <input
                      type="checkbox"
                      checked={currentSettings.audioDescriptions}
                      onChange={(e) => handleSettingChange('audioDescriptions', e.target.checked)}
                      data-testid="audio-descriptions"
                    />
                    Audio Descriptions
                  </label>
                  <p className="setting-description">
                    Enable audio descriptions for visual elements and actions.
                  </p>
                </div>

                <div className="setting-group">
                  <label className="setting-label">
                    <input
                      type="checkbox"
                      checked={currentSettings.autoPlay}
                      onChange={(e) => handleSettingChange('autoPlay', e.target.checked)}
                      data-testid="auto-play"
                    />
                    Auto-Play Media
                  </label>
                  <p className="setting-description">
                    Automatically play media content when available.
                  </p>
                </div>
              </div>
            </div>

            {/* Preview Controls */}
            <div className="preview-controls">
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className={`preview-button ${previewMode ? 'active' : ''}`}
                data-testid="preview-mode"
              >
                {previewMode ? 'Exit Preview' : 'Preview Changes'}
              </button>
              
              {previewMode && (
                <div className="preview-actions">
                  <button
                    onClick={applyPreviewSettings}
                    className="apply-button"
                    data-testid="apply-preview"
                  >
                    Apply Changes
                  </button>
                  <button
                    onClick={cancelPreview}
                    className="cancel-button"
                    data-testid="cancel-preview"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="settings-actions">
              <button
                onClick={handleReset}
                className="reset-button"
                data-testid="reset-settings"
              >
                Reset to Defaults
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Styles */}
      <style jsx>{`
        .accessibility-settings-toggle {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 1000;
          padding: 12px;
          background: #ffffff;
          border: 2px solid #0066cc;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          transition: all 0.2s ease;
        }

        .accessibility-settings-toggle:hover {
          background: #f0f8ff;
          transform: scale(1.05);
        }

        .accessibility-settings-toggle:focus {
          outline: 2px solid #ffff00;
          outline-offset: 2px;
        }

        .accessibility-settings-panel {
          position: fixed;
          top: 0;
          right: 0;
          bottom: 0;
          width: 400px;
          background: #ffffff;
          border-left: 1px solid #cccccc;
          box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
          z-index: 1001;
          overflow-y: auto;
        }

        .settings-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid #e0e0e0;
          background: #f8f9fa;
        }

        .settings-header h2 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: #333333;
        }

        .close-button {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          padding: 4px;
          color: #666666;
        }

        .close-button:hover {
          color: #333333;
        }

        .settings-content {
          padding: 20px;
        }

        .settings-section {
          margin-bottom: 24px;
        }

        .settings-section h3 {
          margin: 0 0 12px 0;
          font-size: 16px;
          font-weight: 600;
          color: #333333;
        }

        .presets-grid {
          display: grid;
          gap: 8px;
          margin-bottom: 24px;
        }

        .preset-button {
          padding: 12px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          background: #ffffff;
          cursor: pointer;
          text-align: left;
          transition: all 0.2s ease;
        }

        .preset-button:hover {
          border-color: #0066cc;
          background: #f0f8ff;
        }

        .preset-button:focus {
          outline: 2px solid #ffff00;
          outline-offset: 2px;
        }

        .preset-button strong {
          display: block;
          margin-bottom: 4px;
          color: #333333;
        }

        .preset-description {
          font-size: 14px;
          color: #666666;
        }

        .tab-list {
          display: flex;
          border-bottom: 1px solid #e0e0e0;
          margin-bottom: 16px;
        }

        .tab-button {
          flex: 1;
          padding: 12px 16px;
          border: none;
          background: none;
          cursor: pointer;
          font-size: 14px;
          color: #666666;
          border-bottom: 2px solid transparent;
          transition: all 0.2s ease;
        }

        .tab-button:hover {
          color: #333333;
          background: #f8f9fa;
        }

        .tab-button.active {
          color: #0066cc;
          border-bottom-color: #0066cc;
        }

        .tab-button:focus {
          outline: 2px solid #ffff00;
          outline-offset: 2px;
        }

        .tab-panel {
          display: none;
        }

        .tab-panel.active {
          display: block;
        }

        .setting-group {
          margin-bottom: 20px;
        }

        .setting-label {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          font-weight: 500;
          color: #333333;
          cursor: pointer;
        }

        .setting-label input,
        .setting-label select {
          margin-top: 2px;
        }

        .setting-description {
          margin: 4px 0 0 24px;
          font-size: 14px;
          color: #666666;
        }

        .preview-controls {
          margin: 24px 0;
          padding-top: 24px;
          border-top: 1px solid #e0e0e0;
        }

        .preview-button {
          padding: 8px 16px;
          border: 2px solid #0066cc;
          border-radius: 4px;
          background: #ffffff;
          color: #0066cc;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .preview-button:hover {
          background: #f0f8ff;
        }

        .preview-button.active {
          background: #0066cc;
          color: #ffffff;
        }

        .preview-actions {
          display: flex;
          gap: 8px;
          margin-top: 12px;
        }

        .apply-button {
          padding: 8px 16px;
          border: 2px solid #00aa00;
          border-radius: 4px;
          background: #00aa00;
          color: #ffffff;
          cursor: pointer;
          font-weight: 500;
        }

        .cancel-button {
          padding: 8px 16px;
          border: 2px solid #cc0000;
          border-radius: 4px;
          background: #cc0000;
          color: #ffffff;
          cursor: pointer;
          font-weight: 500;
        }

        .settings-actions {
          margin-top: 24px;
          padding-top: 24px;
          border-top: 1px solid #e0e0e0;
        }

        .reset-button {
          padding: 8px 16px;
          border: 2px solid #cc6600;
          border-radius: 4px;
          background: #ffffff;
          color: #cc6600;
          cursor: pointer;
          font-weight: 500;
        }

        .reset-button:hover {
          background: #fff8f0;
        }

        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }
      `}</style>
    </>
  );
};

export default AccessibilitySettings;
