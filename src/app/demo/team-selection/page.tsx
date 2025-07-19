'use client';

import { GameRulesDemo } from '~/components/features/game-rules/GameRulesDemo';
import { DemoBanner, DemoIndicator } from '~/components/features/demo/DemoIndicator';
import styles from '~/styles/demo-dashboard.module.css';

/**
 * Team Selection Demo Page
 * Demonstrates the team selection phase of the game
 */
export default function TeamSelectionDemoPage() {
  return (
    <div className={styles.demoPage}>
      <DemoIndicator />
      <DemoBanner />
      
      <div className={styles.demoContainer}>
        <header className={styles.demoHeader}>
          <h1 className={styles.demoTitle}>Team Selection Demo</h1>
          <p className={styles.demoDescription}>
            Experience the team selection phase where the mission leader chooses 
            which players will participate in the current mission. This interactive 
            demo shows role dynamics, player selection strategies, and the tension 
            of choosing the right team.
          </p>
        </header>

        <main className={styles.demoMain}>
          <section className={styles.demoSection}>
            <h2 className={styles.sectionTitle}>Interactive Demo</h2>
            <div className={styles.componentContainer}>
              <GameRulesDemo 
                scenarioId="demo-scenario-team-selection"
                interactive={true}
                className={styles.demoComponent}
              />
            </div>
          </section>

          <section className={styles.demoSection}>
            <h2 className={styles.sectionTitle}>Phase Features</h2>
            <div className={styles.featureGrid}>
              <div className={styles.featureCard}>
                <h3 className={styles.featureTitle}>Leader Selection</h3>
                <p className={styles.featureDescription}>
                  The mission leader must choose exactly the right number of 
                  players for the mission based on player count and mission number.
                </p>
              </div>
              <div className={styles.featureCard}>
                <h3 className={styles.featureTitle}>Strategic Thinking</h3>
                <p className={styles.featureDescription}>
                  Good players must balance trust and suspicion while evil 
                  players work to get onto teams to sabotage missions.
                </p>
              </div>
              <div className={styles.featureCard}>
                <h3 className={styles.featureTitle}>Role Dynamics</h3>
                <p className={styles.featureDescription}>
                  Special roles like Merlin must guide team selection subtly 
                  without revealing themselves to evil players.
                </p>
              </div>
            </div>
          </section>

          <section className={styles.demoSection}>
            <h2 className={styles.sectionTitle}>Testing Scenarios</h2>
            <div className={styles.scenarioGrid}>
              <div className={styles.scenarioCard}>
                <h4 className={styles.scenarioTitle}>Standard Selection</h4>
                <p className={styles.scenarioDescription}>
                  Normal team selection with balanced player distribution
                </p>
              </div>
              <div className={styles.scenarioCard}>
                <h4 className={styles.scenarioTitle}>Suspicious Choices</h4>
                <p className={styles.scenarioDescription}>
                  Leader makes questionable selections that raise suspicion
                </p>
              </div>
              <div className={styles.scenarioCard}>
                <h4 className={styles.scenarioTitle}>Trust Building</h4>
                <p className={styles.scenarioDescription}>
                  Proven good players working together on missions
                </p>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
