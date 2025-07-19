'use client';

import { useState } from 'react';
import Link from 'next/link';
import { isDemoEnvironment } from '~/data/demo';
import styles from '~/styles/demo-indicator.module.css';

/**
 * Demo Indicator - Shows when the app is running in demo mode
 * Provides quick access to demo dashboard and settings
 */
export function DemoIndicator() {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Only show in demo environment
  if (!isDemoEnvironment()) {
    return null;
  }

  return (
    <div className={`${styles.indicator} ${isExpanded ? styles.expanded : ''}`}>
      <button
        className={styles.toggle}
        onClick={() => setIsExpanded(!isExpanded)}
        aria-label={isExpanded ? 'Collapse demo panel' : 'Expand demo panel'}
        aria-expanded={isExpanded}
      >
        <span className={styles.icon}>⚡</span>
        <span className={styles.label}>DEMO</span>
      </button>
      
      {isExpanded && (
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h3 className={styles.panelTitle}>Demo Mode</h3>
            <p className={styles.panelSubtitle}>
              You're in demo mode. All data is simulated.
            </p>
          </div>
          
          <div className={styles.panelContent}>
            <Link href="/demo" className={styles.panelLink}>
              🎮 Demo Dashboard
            </Link>
            <Link href="/demo/game?scenario=demo-scenario-lobby" className={styles.panelLink}>
              🚀 Quick Start
            </Link>
            <Link href="/demo/accessibility" className={styles.panelLink}>
              ♿ Accessibility
            </Link>
            <Link href="/demo/mobile" className={styles.panelLink}>
              📱 Mobile Testing
            </Link>
          </div>
          
          <div className={styles.panelFooter}>
            <button
              className={styles.closeButton}
              onClick={() => setIsExpanded(false)}
              aria-label="Close demo panel"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Demo Banner - Shows a prominent banner when in demo mode
 * Can be placed at the top of pages to indicate demo status
 */
export function DemoBanner({ onDismiss }: { onDismiss?: () => void }) {
  if (!isDemoEnvironment()) {
    return null;
  }

  return (
    <div className={styles.banner} role="banner" aria-live="polite">
      <div className={styles.bannerContent}>
        <span className={styles.bannerIcon}>⚡</span>
        <div className={styles.bannerText}>
          <strong>Demo Mode Active</strong>
          <span className={styles.bannerDescription}>
            All game data is simulated for testing purposes
          </span>
        </div>
        <div className={styles.bannerActions}>
          <Link href="/demo" className={styles.bannerLink}>
            View Dashboard
          </Link>
          {onDismiss && (
            <button
              className={styles.bannerClose}
              onClick={onDismiss}
              aria-label="Dismiss demo banner"
            >
              ×
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Demo Status Badge - Small badge showing demo status
 * Can be used in headers or navigation
 */
export function DemoStatusBadge() {
  if (!isDemoEnvironment()) {
    return null;
  }

  return (
    <span className={styles.statusBadge} title="Demo mode active">
      <span className={styles.statusIcon}>⚡</span>
      DEMO
    </span>
  );
}

/**
 * Demo Warning - Shows warning about demo data
 * Used in forms or when users might expect real data
 */
export function DemoWarning({ message }: { message?: string }) {
  if (!isDemoEnvironment()) {
    return null;
  }

  return (
    <div className={styles.warning} role="alert">
      <span className={styles.warningIcon}>⚠️</span>
      <span className={styles.warningText}>
        {message || 'Demo mode: Changes will not be saved'}
      </span>
    </div>
  );
}
