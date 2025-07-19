'use client';

import { GameRulesDemo } from '~/components/features/game-rules/GameRulesDemo';
import { DemoBanner, DemoIndicator } from '~/components/features/demo/DemoIndicator';
import styles from '~/styles/demo-dashboard.module.css';

/**
 * Mission Voting Demo Page
 * Demonstrates the mission voting phase of the game
 */
export default function MissionVotingDemoPage() {
  return (
    <div className={styles.demoPage}>
      <DemoIndicator />
      <DemoBanner />
      
      <div className={styles.demoContainer}>
        <header className={styles.demoHeader}>
          <h1 className={styles.demoTitle}>Mission Voting Demo</h1>
          <p className={styles.demoDescription}>
            Experience the mission voting phase where selected team members 
            secretly vote for mission success or failure. This interactive 
            demo shows the tension of hidden votes, role constraints, and 
            the dramatic reveal of mission results.
          </p>
        </header>

        <main className={styles.demoMain}>
          <section className={styles.demoSection}>
            <h2 className={styles.sectionTitle}>Interactive Demo</h2>
            <div className={styles.componentContainer}>
              <GameRulesDemo 
                scenarioId="demo-scenario-mission-voting"
                interactive={true}
                className={styles.demoComponent}
              />
            </div>
          </section>

          <section className={styles.demoSection}>
            <h2 className={styles.sectionTitle}>Voting Mechanics</h2>
            <div className={styles.featureGrid}>
              <div className={styles.featureCard}>
                <h3 className={styles.featureTitle}>Secret Voting</h3>
                <p className={styles.featureDescription}>
                  Only selected team members vote. Votes are submitted 
                  secretly and revealed simultaneously for dramatic effect.
                </p>
              </div>
              <div className={styles.featureCard}>
                <h3 className={styles.featureTitle}>Role Constraints</h3>
                <p className={styles.featureDescription}>
                  Good players can only vote for mission success, while 
                  evil players can choose to vote for success or failure.
                </p>
              </div>
              <div className={styles.featureCard}>
                <h3 className={styles.featureTitle}>Mission Requirements</h3>
                <p className={styles.featureDescription}>
                  Different missions have different failure requirements. 
                  Mission 4 in games of 7+ players requires 2 fail votes.
                </p>
              </div>
            </div>
          </section>

          <section className={styles.demoSection}>
            <h2 className={styles.sectionTitle}>Strategic Elements</h2>
            <div className={styles.scenarioGrid}>
              <div className={styles.scenarioCard}>
                <h4 className={styles.scenarioTitle}>Evil Bluffing</h4>
                <p className={styles.scenarioDescription}>
                  Evil players may vote for success to maintain cover
                </p>
              </div>
              <div className={styles.scenarioCard}>
                <h4 className={styles.scenarioTitle}>Critical Missions</h4>
                <p className={styles.scenarioDescription}>
                  Late-game missions where failure means evil team victory
                </p>
              </div>
              <div className={styles.scenarioCard}>
                <h4 className={styles.scenarioTitle}>Information Gathering</h4>
                <p className={styles.scenarioDescription}>
                  Mission results provide crucial information about team members
                </p>
              </div>
            </div>
          </section>

          <section className={styles.demoSection}>
            <h2 className={styles.sectionTitle}>Game Impact</h2>
            <div className={styles.impactGrid}>
              <div className={styles.impactCard}>
                <h4 className={styles.impactTitle}>Score Tracking</h4>
                <p className={styles.impactDescription}>
                  Successful missions advance the good team toward victory, 
                  while failed missions help evil team win.
                </p>
              </div>
              <div className={styles.impactCard}>
                <h4 className={styles.impactTitle}>Player Suspicion</h4>
                <p className={styles.impactDescription}>
                  Failed missions cast suspicion on team members, affecting 
                  future team selections and voting.
                </p>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
