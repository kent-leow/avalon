import Link from 'next/link';
import { DEMO_SCENARIOS, createDemoEnvironmentSummary } from '~/data/demo';
import styles from '~/styles/demo-dashboard.module.css';

/**
 * Demo Dashboard - Central hub for all demo scenarios and testing tools
 * Provides easy navigation to different game states, mobile configurations, and accessibility scenarios
 */
export default function DemoDashboard() {
  const summary = createDemoEnvironmentSummary();

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <h1 className={styles.title}>Avalon Demo Dashboard</h1>
        <p className={styles.subtitle}>
          Comprehensive testing environment for game scenarios, mobile devices, and accessibility features
        </p>
        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statNumber}>{summary.scenarios}</span>
            <span className={styles.statLabel}>Game Scenarios</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNumber}>{summary.mobileStates}</span>
            <span className={styles.statLabel}>Device Configurations</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNumber}>{summary.accessibilityStates}</span>
            <span className={styles.statLabel}>A11y Configurations</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNumber}>{summary.totalTestCombinations.toLocaleString()}</span>
            <span className={styles.statLabel}>Total Test Combinations</span>
          </div>
        </div>
      </header>

      <div className={styles.content}>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Game Scenarios</h2>
          <p className={styles.sectionDescription}>
            Test different game states and player configurations
          </p>
          <div className={styles.grid}>
            {DEMO_SCENARIOS.map((scenario) => (
              <Link
                key={scenario.id}
                href={`/demo/game?scenario=${scenario.id}`}
                className={styles.card}
              >
                <h3 className={styles.cardTitle}>{scenario.name}</h3>
                <p className={styles.cardDescription}>{scenario.description}</p>
                <div className={styles.cardMeta}>
                  <span className={`${styles.badge} ${styles[`badge${scenario.category.replace('-', '')}`]}`}>
                    {scenario.category}
                  </span>
                  <span className={styles.playerCount}>
                    {scenario.gameState.players.length} players
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Testing Tools</h2>
          <p className={styles.sectionDescription}>
            Specialized testing environments and configuration tools
          </p>
          <div className={styles.grid}>
            <Link href="/demo/mobile" className={styles.card}>
              <h3 className={styles.cardTitle}>Mobile Testing</h3>
              <p className={styles.cardDescription}>
                Test responsive design across different device sizes and orientations
              </p>
              <div className={styles.cardMeta}>
                <span className={styles.badge}>Responsive</span>
              </div>
            </Link>
            <Link href="/demo/accessibility" className={styles.card}>
              <h3 className={styles.cardTitle}>Accessibility Testing</h3>
              <p className={styles.cardDescription}>
                Test with screen readers, high contrast, keyboard navigation, and more
              </p>
              <div className={styles.cardMeta}>
                <span className={styles.badge}>A11y</span>
              </div>
            </Link>
            <Link href="/demo/visual" className={styles.card}>
              <h3 className={styles.cardTitle}>Visual Testing</h3>
              <p className={styles.cardDescription}>
                Compare visual states and catch UI regressions
              </p>
              <div className={styles.cardMeta}>
                <span className={styles.badge}>Visual</span>
              </div>
            </Link>
            <Link href="/demo/performance" className={styles.card}>
              <h3 className={styles.cardTitle}>Performance Testing</h3>
              <p className={styles.cardDescription}>
                Monitor rendering performance and memory usage
              </p>
              <div className={styles.cardMeta}>
                <span className={styles.badge}>Performance</span>
              </div>
            </Link>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Quick Actions</h2>
          <div className={styles.actions}>
            <Link href="/demo/game?scenario=demo-scenario-lobby" className={styles.actionButton}>
              Start Basic Demo
            </Link>
            <Link href="/demo/game?scenario=demo-scenario-large-game" className={styles.actionButton}>
              Test Large Game
            </Link>
            <Link href="/demo/accessibility?preset=screen-reader" className={styles.actionButton}>
              Test Screen Reader
            </Link>
            <Link href="/demo/mobile?device=iphone-se" className={styles.actionButton}>
              Test Mobile
            </Link>
          </div>
        </section>
      </div>

      <footer className={styles.footer}>
        <p className={styles.footerText}>
          Demo environment - Data is simulated and not saved
        </p>
        <div className={styles.footerLinks}>
          <Link href="/" className={styles.footerLink}>
            Back to Game
          </Link>
          <Link href="/docs" className={styles.footerLink}>
            Documentation
          </Link>
        </div>
      </footer>
    </div>
  );
}
