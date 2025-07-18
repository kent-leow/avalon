'use client';

/**
 * Screen Reader Support Component
 * 
 * Provides enhanced screen reader support and announcements
 */

import { useEffect, useRef, useState } from 'react';
import { useAccessibility } from '~/hooks/useAccessibility';

interface ScreenReaderSupportProps {
  children: React.ReactNode;
  enableLiveRegions?: boolean;
  enableRoleDescriptions?: boolean;
  enableLandmarks?: boolean;
  className?: string;
}

export function ScreenReaderSupport({
  children,
  enableLiveRegions = true,
  enableRoleDescriptions = true,
  enableLandmarks = true,
  className = '',
}: ScreenReaderSupportProps) {
  const { settings, state, announce } = useAccessibility();
  const [pageStructure, setPageStructure] = useState<{
    headings: HTMLElement[];
    landmarks: HTMLElement[];
    buttons: HTMLElement[];
    links: HTMLElement[];
  }>({
    headings: [],
    landmarks: [],
    buttons: [],
    links: [],
  });

  const announcementRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Analyze page structure for screen readers
  useEffect(() => {
    if (!settings.screenReaderEnabled) return;

    const analyzePageStructure = () => {
      const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')) as HTMLElement[];
      const landmarks = Array.from(document.querySelectorAll('[role="main"], [role="navigation"], [role="complementary"], [role="contentinfo"], [role="banner"], main, nav, aside, footer, header')) as HTMLElement[];
      const buttons = Array.from(document.querySelectorAll('button, [role="button"]')) as HTMLElement[];
      const links = Array.from(document.querySelectorAll('a[href], [role="link"]')) as HTMLElement[];

      setPageStructure({ headings, landmarks, buttons, links });
    };

    analyzePageStructure();
    
    // Re-analyze when DOM changes
    const observer = new MutationObserver(analyzePageStructure);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [settings.screenReaderEnabled]);

  // Enhance headings with proper structure
  useEffect(() => {
    if (!settings.screenReaderEnabled || !enableRoleDescriptions) return;

    pageStructure.headings.forEach((heading, index) => {
      const level = parseInt(heading.tagName.charAt(1));
      const nextHeading = pageStructure.headings[index + 1];
      const nextLevel = nextHeading ? parseInt(nextHeading.tagName.charAt(1)) : null;

      // Add aria-describedby for heading structure
      if (!heading.getAttribute('aria-describedby')) {
        const descriptionId = `heading-desc-${index}`;
        heading.setAttribute('aria-describedby', descriptionId);

        const description = document.createElement('span');
        description.id = descriptionId;
        description.className = 'sr-only';
        description.textContent = `Heading level ${level}${
          nextLevel ? `, next heading level ${nextLevel}` : ', last heading'
        }`;
        
        heading.appendChild(description);
      }
    });
  }, [pageStructure.headings, settings.screenReaderEnabled, enableRoleDescriptions]);

  // Enhance landmarks with descriptions
  useEffect(() => {
    if (!settings.screenReaderEnabled || !enableLandmarks) return;

    pageStructure.landmarks.forEach((landmark, index) => {
      const role = landmark.getAttribute('role') || landmark.tagName.toLowerCase();
      
      if (!landmark.getAttribute('aria-label') && !landmark.getAttribute('aria-labelledby')) {
        const landmarkNames = {
          main: 'Main content',
          nav: 'Navigation',
          navigation: 'Navigation',
          aside: 'Sidebar',
          complementary: 'Sidebar',
          footer: 'Footer',
          contentinfo: 'Footer',
          header: 'Header',
          banner: 'Header',
        };

        const landmarkName = landmarkNames[role as keyof typeof landmarkNames];
        if (landmarkName) {
          landmark.setAttribute('aria-label', landmarkName);
        }
      }
    });
  }, [pageStructure.landmarks, settings.screenReaderEnabled, enableLandmarks]);

  // Enhance buttons with better descriptions
  useEffect(() => {
    if (!settings.screenReaderEnabled || !enableRoleDescriptions) return;

    pageStructure.buttons.forEach((button) => {
      if (!button.getAttribute('aria-label') && !button.getAttribute('aria-labelledby')) {
        const buttonText = button.textContent?.trim();
        const buttonIcon = button.querySelector('[aria-hidden="true"]')?.textContent;
        
        if (!buttonText && buttonIcon) {
          // Button only has icon, need better description
          const iconDescriptions = {
            '×': 'Close',
            '☰': 'Menu',
            '❯': 'Next',
            '❮': 'Previous',
            '▲': 'Up',
            '▼': 'Down',
            '♿': 'Accessibility',
            '⚙': 'Settings',
            '🔍': 'Search',
            '📋': 'Copy',
            '✓': 'Confirm',
            '✗': 'Cancel',
          };

          const description = iconDescriptions[buttonIcon as keyof typeof iconDescriptions];
          if (description) {
            button.setAttribute('aria-label', description);
          }
        }
        
        // Add button type information
        const buttonType = button.getAttribute('type') || 'button';
        if (buttonType === 'submit') {
          const existingLabel = button.getAttribute('aria-label') || buttonText;
          button.setAttribute('aria-label', `${existingLabel} (submit)`);
        }
      }
    });
  }, [pageStructure.buttons, settings.screenReaderEnabled, enableRoleDescriptions]);

  // Enhance links with better context
  useEffect(() => {
    if (!settings.screenReaderEnabled || !enableRoleDescriptions) return;

    pageStructure.links.forEach((link) => {
      const href = link.getAttribute('href');
      const linkText = link.textContent?.trim();
      
      if (href && linkText) {
        // Add context for external links
        if (href.startsWith('http') && !href.includes(window.location.hostname)) {
          if (!link.getAttribute('aria-label')) {
            link.setAttribute('aria-label', `${linkText} (external link)`);
          }
        }
        
        // Add context for download links
        if (href.includes('download') || href.match(/\.(pdf|doc|docx|xls|xlsx|ppt|pptx|zip|rar)$/i)) {
          if (!link.getAttribute('aria-label')) {
            const extension = href.split('.').pop()?.toUpperCase();
            link.setAttribute('aria-label', `${linkText} (download ${extension || 'file'})`);
          }
        }
        
        // Add context for mail links
        if (href.startsWith('mailto:')) {
          if (!link.getAttribute('aria-label')) {
            link.setAttribute('aria-label', `${linkText} (email)`);
          }
        }
      }
    });
  }, [pageStructure.links, settings.screenReaderEnabled, enableRoleDescriptions]);

  // Announce page changes
  useEffect(() => {
    if (settings.screenReaderEnabled && state.isInitialized) {
      const pageTitle = document.title;
      announce(`Page loaded: ${pageTitle}`, 'polite');
    }
  }, [settings.screenReaderEnabled, state.isInitialized, announce]);

  // Handle focus announcements
  useEffect(() => {
    if (!settings.screenReaderEnabled) return;

    const handleFocus = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target && target.tagName) {
        const tagName = target.tagName.toLowerCase();
        const role = target.getAttribute('role');
        const ariaLabel = target.getAttribute('aria-label');
        const textContent = target.textContent?.trim();
        
        let announcement = '';
        
        if (ariaLabel) {
          announcement = ariaLabel;
        } else if (textContent) {
          announcement = textContent;
        }
        
        if (role) {
          announcement += ` ${role}`;
        } else if (tagName === 'button') {
          announcement += ' button';
        } else if (tagName === 'a') {
          announcement += ' link';
        } else if (tagName === 'input') {
          const inputType = target.getAttribute('type') || 'text';
          announcement += ` ${inputType} input`;
        }
        
        if (announcement) {
          announce(announcement, 'polite');
        }
      }
    };

    document.addEventListener('focusin', handleFocus);
    return () => document.removeEventListener('focusin', handleFocus);
  }, [settings.screenReaderEnabled, announce]);

  if (!settings.screenReaderEnabled) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={`screen-reader-support ${className}`} ref={containerRef}>
      {/* Live regions for announcements */}
      {enableLiveRegions && (
        <>
          <div
            id="sr-live-polite"
            aria-live="polite"
            aria-atomic="true"
            className="sr-only"
            ref={announcementRef}
          />
          <div
            id="sr-live-assertive"
            aria-live="assertive"
            aria-atomic="true"
            className="sr-only"
          />
        </>
      )}

      {/* Page structure announcements */}
      <div className="sr-only">
        <p>
          Page structure: {pageStructure.headings.length} headings, {pageStructure.landmarks.length} landmarks, {pageStructure.buttons.length} buttons, {pageStructure.links.length} links
        </p>
      </div>

      {/* Main content */}
      <div role="main" aria-label="Game content">
        {children}
      </div>

      {/* Screen reader styles */}
      <style jsx>{`
        .screen-reader-support {
          position: relative;
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

        /* Enhanced focus indicators for screen readers */
        :global(.screen-reader-enabled) *:focus {
          outline: 3px solid #005fcc;
          outline-offset: 2px;
        }

        /* Better contrast for screen reader users */
        :global(.screen-reader-enabled) {
          background: #fff;
          color: #000;
        }

        /* Hide decorative elements from screen readers */
        :global(.screen-reader-enabled) [aria-hidden="true"] {
          display: none;
        }

        /* Enhanced button styling for screen readers */
        :global(.screen-reader-enabled) button {
          border: 2px solid #000;
          background: #fff;
          color: #000;
          padding: 12px 16px;
          margin: 4px;
        }

        :global(.screen-reader-enabled) button:focus {
          background: #005fcc;
          color: #fff;
        }

        /* Enhanced link styling for screen readers */
        :global(.screen-reader-enabled) a {
          color: #005fcc;
          text-decoration: underline;
        }

        :global(.screen-reader-enabled) a:focus {
          background: #005fcc;
          color: #fff;
        }

        /* Enhanced form styling for screen readers */
        :global(.screen-reader-enabled) input,
        :global(.screen-reader-enabled) select,
        :global(.screen-reader-enabled) textarea {
          border: 2px solid #000;
          padding: 8px;
          margin: 4px;
        }

        :global(.screen-reader-enabled) input:focus,
        :global(.screen-reader-enabled) select:focus,
        :global(.screen-reader-enabled) textarea:focus {
          border-color: #005fcc;
          outline: none;
        }
      `}</style>
    </div>
  );
}

export default ScreenReaderSupport;
