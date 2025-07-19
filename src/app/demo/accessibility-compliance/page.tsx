/**
 * Accessibility Demo Page
 * 
 * Comprehensive demonstration of all accessibility features and components
 */

"use client";

import React from 'react';
import { AccessibilityProvider } from '~/context/AccessibilityContext';
import { 
  AccessibilitySystem,
  ScreenReaderSupport,
  KeyboardNavigation,
  HighContrastMode,
  AlternativeInputs,
} from '~/components/accessibility';
import { createMockAccessibilityData } from '~/lib/accessibility-utils';
import { 
  DEFAULT_ACCESSIBILITY_SETTINGS, 
  ACCESSIBILITY_PRESETS,
  type AccessibilitySettings as AccessibilitySettingsType,
} from '~/types/accessibility';

export default function AccessibilityDemoPage() {
  const mockData = createMockAccessibilityData();

  return (
    <AccessibilityProvider>
      <div className="accessibility-demo-page">
        {/* Page Header */}
        <header className="demo-header">
          <h1>Accessibility Compliance Demo</h1>
          <p className="demo-description">
            Comprehensive demonstration of WCAG 2.1 AA compliance features including
            screen reader support, keyboard navigation, high contrast mode, and
            alternative input methods.
          </p>
        </header>

        {/* Main Content */}
        <main className="demo-main">
          {/* Accessibility System */}
          <section className="demo-section">
            <h2>Complete Accessibility System</h2>
            <p>
              The main accessibility system coordinator that manages all accessibility
              features and provides comprehensive WCAG 2.1 AA compliance.
            </p>
            
            <AccessibilitySystem
              enableFloatingControls={true}
              enableSystemIntegration={true}
              enableComplianceMonitoring={true}
              enableUserGuidance={true}
            >
              <div className="demo-content">
                <h3>Interactive Content</h3>
                <p>
                  This content is wrapped by the AccessibilitySystem component and
                  benefits from all accessibility enhancements.
                </p>
                
                <div className="demo-controls">
                  <button className="demo-button">Primary Action</button>
                  <button className="demo-button secondary">Secondary Action</button>
                  <input
                    type="text"
                    placeholder="Sample input field"
                    className="demo-input"
                  />
                  <select className="demo-select">
                    <option value="">Select an option</option>
                    <option value="option1">Option 1</option>
                    <option value="option2">Option 2</option>
                    <option value="option3">Option 3</option>
                  </select>
                </div>
              </div>
            </AccessibilitySystem>
          </section>

          {/* Screen Reader Support */}
          <section className="demo-section">
            <h2>Screen Reader Support</h2>
            <p>
              Enhanced screen reader compatibility with proper ARIA labels,
              live regions, and announcements.
            </p>
            
            <ScreenReaderSupport>
              <div className="demo-content">
                <h3>Screen Reader Enhanced Content</h3>
                <p>
                  This content includes proper ARIA labels, roles, and live regions
                  for optimal screen reader experience.
                </p>
                
                <div className="demo-interactive">
                  <button
                    aria-label="Add item to cart"
                    aria-describedby="add-to-cart-description"
                  >
                    Add to Cart
                  </button>
                  <div id="add-to-cart-description" className="sr-only">
                    This will add the current item to your shopping cart
                  </div>
                  
                  <div role="status" aria-live="polite" aria-atomic="true">
                    Status updates will be announced here
                  </div>
                </div>
              </div>
            </ScreenReaderSupport>
          </section>

          {/* Keyboard Navigation */}
          <section className="demo-section">
            <h2>Keyboard Navigation</h2>
            <p>
              Comprehensive keyboard navigation with focus management,
              skip links, and keyboard shortcuts.
            </p>
            
            <KeyboardNavigation>
              <div className="demo-content">
                <h3>Keyboard Navigation Enhanced</h3>
                <p>
                  Use Tab to navigate through interactive elements.
                  Skip links are available for screen reader users.
                </p>
                
                <div className="demo-navigation">
                  <nav aria-label="Demo navigation">
                    <ul className="demo-nav-list">
                      <li><a href="#section1">Section 1</a></li>
                      <li><a href="#section2">Section 2</a></li>
                      <li><a href="#section3">Section 3</a></li>
                    </ul>
                  </nav>
                  
                  <div className="demo-form">
                    <label htmlFor="demo-name">Name:</label>
                    <input id="demo-name" type="text" />
                    
                    <label htmlFor="demo-email">Email:</label>
                    <input id="demo-email" type="email" />
                    
                    <button type="submit">Submit</button>
                  </div>
                </div>
              </div>
            </KeyboardNavigation>
          </section>

          {/* High Contrast Mode */}
          <section className="demo-section">
            <h2>High Contrast Mode</h2>
            <p>
              High contrast mode for users with visual impairments,
              meeting WCAG 2.1 AA contrast requirements.
            </p>
            
            <HighContrastMode>
              <div className="demo-content">
                <h3>High Contrast Enhanced</h3>
                <p>
                  This content will adapt to high contrast mode when enabled,
                  providing enhanced visibility for users with visual impairments.
                </p>
                
                <div className="demo-contrast">
                  <div className="demo-card">
                    <h4>Sample Card</h4>
                    <p>Card content with proper contrast ratios</p>
                    <button className="demo-card-button">Card Action</button>
                  </div>
                  
                  <div className="demo-status">
                    <span className="status-success">Success</span>
                    <span className="status-warning">Warning</span>
                    <span className="status-error">Error</span>
                  </div>
                </div>
              </div>
            </HighContrastMode>
          </section>

          {/* Alternative Inputs */}
          <section className="demo-section">
            <h2>Alternative Input Methods</h2>
            <p>
              Support for alternative input methods including voice control,
              switch control, and eye tracking for users with motor impairments.
            </p>
            
            <AlternativeInputs
              enabledInputs={['keyboard', 'voice', 'switch']}
              onInputMethodChange={(method) => console.log('Input method:', method)}
              settings={DEFAULT_ACCESSIBILITY_SETTINGS}
            >
              <div className="demo-content">
                <h3>Alternative Input Enhanced</h3>
                <p>
                  This content supports multiple input methods for users with
                  different motor abilities and preferences.
                </p>
                
                <div className="demo-inputs">
                  <button className="demo-large-button">Large Button</button>
                  <button className="demo-voice-button">Voice Enabled</button>
                  <button className="demo-switch-button">Switch Compatible</button>
                </div>
              </div>
            </AlternativeInputs>
          </section>

          {/* Settings Panel */}
          <section className="demo-section">
            <h2>Accessibility Settings</h2>
            <p>
              Accessibility settings would be rendered here.
              This demonstrates the comprehensive accessibility system.
            </p>
            
            <div className="demo-content">
              <h3>Available Features</h3>
              <ul>
                <li>✓ High Contrast Mode</li>
                <li>✓ Text Scaling</li>
                <li>✓ Motion Reduction</li>
                <li>✓ Keyboard Navigation</li>
                <li>✓ Screen Reader Support</li>
                <li>✓ Alternative Input Methods</li>
                <li>✓ Focus Management</li>
                <li>✓ WCAG 2.1 Compliance</li>
              </ul>
            </div>
          </section>

          {/* Demo Instructions */}
          <section className="demo-section">
            <h2>Demo Instructions</h2>
            <div className="demo-instructions">
              <h3>How to Test Accessibility Features</h3>
              <ul>
                <li>
                  <strong>Screen Reader:</strong> Use NVDA, JAWS, or VoiceOver to test
                  screen reader compatibility and announcements.
                </li>
                <li>
                  <strong>Keyboard Navigation:</strong> Use Tab, Shift+Tab, Enter, and
                  arrow keys to navigate without a mouse.
                </li>
                <li>
                  <strong>High Contrast:</strong> Enable high contrast mode in your
                  system settings or use the toggle button.
                </li>
                <li>
                  <strong>Voice Control:</strong> Enable voice control in supported
                  browsers and try commands like "click", "next", "back".
                </li>
                <li>
                  <strong>Text Scaling:</strong> Use browser zoom or system text
                  scaling to test up to 200% magnification.
                </li>
              </ul>
              
              <h3>Accessibility Features Demonstrated</h3>
              <ul>
                <li>WCAG 2.1 AA compliance</li>
                <li>Screen reader optimization</li>
                <li>Keyboard navigation</li>
                <li>High contrast mode</li>
                <li>Alternative input methods</li>
                <li>Focus management</li>
                <li>ARIA labels and roles</li>
                <li>Live regions</li>
                <li>Skip links</li>
                <li>Color contrast ratios</li>
                <li>Text scaling support</li>
                <li>Reduced motion preferences</li>
              </ul>
            </div>
          </section>
        </main>

        {/* Styles */}
        <style jsx>{`
          .accessibility-demo-page {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            line-height: 1.6;
          }

          .demo-header {
            text-align: center;
            margin-bottom: 40px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 8px;
          }

          .demo-header h1 {
            color: #333333;
            margin-bottom: 16px;
            font-size: 2.5rem;
          }

          .demo-description {
            color: #666666;
            font-size: 1.1rem;
            max-width: 600px;
            margin: 0 auto;
          }

          .demo-main {
            display: grid;
            gap: 40px;
          }

          .demo-section {
            padding: 24px;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            background: #ffffff;
          }

          .demo-section h2 {
            color: #333333;
            margin-bottom: 16px;
            font-size: 1.5rem;
          }

          .demo-section > p {
            color: #666666;
            margin-bottom: 24px;
          }

          .demo-content {
            padding: 20px;
            background: #f8f9fa;
            border-radius: 6px;
            border: 1px solid #e0e0e0;
          }

          .demo-content h3 {
            color: #333333;
            margin-bottom: 12px;
          }

          .demo-controls {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
            margin-top: 16px;
          }

          .demo-button {
            padding: 12px 24px;
            border: 2px solid #0066cc;
            background: #0066cc;
            color: #ffffff;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            transition: all 0.2s ease;
          }

          .demo-button:hover {
            background: #0052a3;
            border-color: #0052a3;
          }

          .demo-button:focus {
            outline: 2px solid #ffff00;
            outline-offset: 2px;
          }

          .demo-button.secondary {
            background: #ffffff;
            color: #0066cc;
          }

          .demo-button.secondary:hover {
            background: #f0f8ff;
          }

          .demo-input,
          .demo-select {
            padding: 12px;
            border: 2px solid #cccccc;
            border-radius: 4px;
            font-size: 14px;
            min-width: 200px;
          }

          .demo-input:focus,
          .demo-select:focus {
            outline: 2px solid #0066cc;
            outline-offset: 2px;
            border-color: #0066cc;
          }

          .demo-navigation {
            display: grid;
            gap: 20px;
            margin-top: 16px;
          }

          .demo-nav-list {
            display: flex;
            gap: 16px;
            list-style: none;
            margin: 0;
            padding: 0;
          }

          .demo-nav-list a {
            color: #0066cc;
            text-decoration: none;
            padding: 8px 16px;
            border-radius: 4px;
          }

          .demo-nav-list a:hover {
            background: #f0f8ff;
          }

          .demo-nav-list a:focus {
            outline: 2px solid #ffff00;
            outline-offset: 2px;
          }

          .demo-form {
            display: grid;
            gap: 16px;
            max-width: 400px;
          }

          .demo-form label {
            font-weight: 500;
            color: #333333;
          }

          .demo-form input {
            padding: 12px;
            border: 2px solid #cccccc;
            border-radius: 4px;
            font-size: 14px;
          }

          .demo-form input:focus {
            outline: 2px solid #0066cc;
            outline-offset: 2px;
            border-color: #0066cc;
          }

          .demo-contrast {
            display: grid;
            gap: 20px;
            margin-top: 16px;
          }

          .demo-card {
            padding: 20px;
            background: #ffffff;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
          }

          .demo-card h4 {
            color: #333333;
            margin-bottom: 8px;
          }

          .demo-card p {
            color: #666666;
            margin-bottom: 16px;
          }

          .demo-card-button {
            padding: 8px 16px;
            border: 2px solid #0066cc;
            background: #0066cc;
            color: #ffffff;
            border-radius: 4px;
            cursor: pointer;
          }

          .demo-status {
            display: flex;
            gap: 16px;
          }

          .status-success {
            color: #00aa00;
            font-weight: 500;
          }

          .status-warning {
            color: #cc6600;
            font-weight: 500;
          }

          .status-error {
            color: #cc0000;
            font-weight: 500;
          }

          .demo-inputs {
            display: flex;
            gap: 16px;
            margin-top: 16px;
          }

          .demo-large-button {
            padding: 20px 40px;
            border: 2px solid #0066cc;
            background: #0066cc;
            color: #ffffff;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            font-weight: 500;
          }

          .demo-voice-button {
            padding: 16px 32px;
            border: 2px solid #00aa00;
            background: #00aa00;
            color: #ffffff;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
          }

          .demo-switch-button {
            padding: 16px 32px;
            border: 2px solid #cc6600;
            background: #cc6600;
            color: #ffffff;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
          }

          .demo-instructions {
            background: #f0f8ff;
            padding: 20px;
            border-radius: 6px;
            border: 1px solid #d0e4ff;
          }

          .demo-instructions h3 {
            color: #333333;
            margin-bottom: 16px;
          }

          .demo-instructions ul {
            margin: 0;
            padding-left: 20px;
          }

          .demo-instructions li {
            margin-bottom: 8px;
            color: #333333;
          }

          .demo-instructions strong {
            color: #0066cc;
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
      </div>
    </AccessibilityProvider>
  );
}
