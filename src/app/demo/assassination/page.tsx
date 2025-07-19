'use client';

import { GameRulesDemo } from '~/components/features/game-rules/GameRulesDemo';
import { DemoBanner, DemoIndicator } from '~/components/features/demo/DemoIndicator';
import styles from '~/styles/demo-dashboard.module.css';

/**
 * Assassination Demo Page
 * Demonstrates the endgame assassination phase
 */
export default function AssassinationDemoPage() {
  return (
    <div className={styles.demoPage}>
      <DemoIndicator />
      <DemoBanner />
      
      <div className={styles.demoContainer}>
        <header className={styles.demoHeader}>
          <h1 className={styles.demoTitle}>Assassination Demo</h1>
          <p className={styles.demoDescription}>
            Experience the climactic assassination phase where evil's last 
            hope lies in correctly identifying and assassinating Merlin. 
            This high-stakes endgame scenario demonstrates the ultimate 
            test of deduction and deception in Avalon.
          </p>
        </header>

        <main className={styles.demoMain}>
          <section className={styles.demoSection}>
            <h2 className={styles.sectionTitle}>Interactive Demo</h2>
            <div className={styles.componentContainer}>
              <GameRulesDemo 
                scenarioId="demo-scenario-assassination"
                interactive={true}
                className={styles.demoComponent}
              />
            </div>
          </section>

          <section className={styles.demoSection}>
            <h2 className={styles.sectionTitle}>Assassination Rules</h2>
            <div className={styles.featureGrid}>
              <div className={styles.featureCard}>
                <h3 className={styles.featureTitle}>Triggered Condition</h3>
                <p className={styles.featureDescription}>
                  Assassination phase only occurs when the good team 
                  successfully completes 3 missions, giving evil one final chance.
                </p>
              </div>
              <div className={styles.featureCard}>
                <h3 className={styles.featureTitle}>Assassin's Choice</h3>
                <p className={styles.featureDescription}>
                  The Assassin must identify and target Merlin among all 
                  good players. Success means evil victory despite mission failures.
                </p>
              </div>
              <div className={styles.featureCard}>
                <h3 className={styles.featureTitle}>Time Pressure</h3>
                <p className={styles.featureDescription}>
                  Limited time forces quick decisions while evil team 
                  discusses observations and suspicions about Merlin's identity.
                </p>
              </div>
            </div>
          </section>

          <section className={styles.demoSection}>
            <h2 className={styles.sectionTitle}>Strategic Considerations</h2>
            <div className={styles.scenarioGrid}>
              <div className={styles.scenarioCard}>
                <h4 className={styles.scenarioTitle}>Merlin's Behavior</h4>
                <p className={styles.scenarioDescription}>
                  Analysis of guidance patterns and knowledge demonstrations
                </p>
              </div>
              <div className={styles.scenarioCard}>
                <h4 className={styles.scenarioTitle}>Percival's Role</h4>
                <p className={styles.scenarioDescription}>
                  How Percival's actions might reveal Merlin's identity
                </p>
              </div>
              <div className={styles.scenarioCard}>
                <h4 className={styles.scenarioTitle}>Mission History</h4>
                <p className={styles.scenarioDescription}>
                  Review of voting patterns and team selections for clues
                </p>
              </div>
              <div className={styles.scenarioCard}>
                <h4 className={styles.scenarioTitle}>Deception Tactics</h4>
                <p className={styles.scenarioDescription}>
                  How good players might mislead the assassination attempt
                </p>
              </div>
            </div>
          </section>

          <section className={styles.demoSection}>
            <h2 className={styles.sectionTitle}>Game Outcomes</h2>
            <div className={styles.outcomeGrid}>
              <div className={styles.outcomeCard}>
                <h4 className={styles.outcomeTitle}>Successful Assassination</h4>
                <p className={styles.outcomeDescription}>
                  Evil team achieves victory by correctly identifying Merlin, 
                  overturning the mission results.
                </p>
                <div className={styles.outcomeResult}>
                  <span className={styles.resultLabel}>Result:</span>
                  <span className={styles.resultEvil}>Evil Victory</span>
                </div>
              </div>
              <div className={styles.outcomeCard}>
                <h4 className={styles.outcomeTitle}>Failed Assassination</h4>
                <p className={styles.outcomeDescription}>
                  Wrong target means good team maintains their mission 
                  victory and Merlin remains safe.
                </p>
                <div className={styles.outcomeResult}>
                  <span className={styles.resultLabel}>Result:</span>
                  <span className={styles.resultGood}>Good Victory</span>
                </div>
              </div>
            </div>
          </section>

          <section className={styles.demoSection}>
            <h2 className={styles.sectionTitle}>Role Importance</h2>
            <div className={styles.roleGrid}>
              <div className={styles.roleCard}>
                <h4 className={styles.roleTitle}>🗡️ The Assassin</h4>
                <p className={styles.roleDescription}>
                  Must use all gathered intelligence to make the critical 
                  choice that determines the game's final outcome.
                </p>
              </div>
              <div className={styles.roleCard}>
                <h4 className={styles.roleTitle}>🧙‍♂️ Merlin</h4>
                <p className={styles.roleDescription}>
                  Must have guided subtly enough throughout the game 
                  to avoid detection while ensuring mission success.
                </p>
              </div>
              <div className={styles.roleCard}>
                <h4 className={styles.roleTitle}>🛡️ Percival</h4>
                <p className={styles.roleDescription}>
                  Can help protect Merlin by mimicking behavior or 
                  drawing suspicion away from the true wizard.
                </p>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
