'use client';

import { GameRulesDemo } from '~/components/features/game-rules/GameRulesDemo';
import { DemoBanner, DemoIndicator } from '~/components/features/demo/DemoIndicator';
import styles from '~/styles/demo-dashboard.module.css';

/**
 * Large Game Demo Page
 * Demonstrates a 10-player game with all special roles
 */
export default function LargeGameDemoPage() {
  return (
    <div className={styles.demoPage}>
      <DemoIndicator />
      <DemoBanner />
      
      <div className={styles.demoContainer}>
        <header className={styles.demoHeader}>
          <h1 className={styles.demoTitle}>Large Game Demo (10 Players)</h1>
          <p className={styles.demoDescription}>
            Experience the complexity and intrigue of a full 10-player Avalon 
            game with all special roles active. This demo showcases the most 
            challenging and strategic version of the game with maximum role 
            diversity and complexity.
          </p>
        </header>

        <main className={styles.demoMain}>
          <section className={styles.demoSection}>
            <h2 className={styles.sectionTitle}>Interactive Demo</h2>
            <div className={styles.componentContainer}>
              <GameRulesDemo 
                scenarioId="demo-scenario-large-game"
                interactive={true}
                className={styles.demoComponent}
              />
            </div>
          </section>

          <section className={styles.demoSection}>
            <h2 className={styles.sectionTitle}>Role Composition</h2>
            <div className={styles.roleBreakdown}>
              <div className={styles.teamSection}>
                <h3 className={styles.teamTitle}>Good Team (6 Players)</h3>
                <div className={styles.roleGrid}>
                  <div className={styles.roleCard}>
                    <h4 className={styles.roleName}>🧙‍♂️ Merlin</h4>
                    <p className={styles.roleDesc}>Sees all evil players except Mordred</p>
                  </div>
                  <div className={styles.roleCard}>
                    <h4 className={styles.roleName}>🛡️ Percival</h4>
                    <p className={styles.roleDesc}>Sees Merlin and Morgana (but not which is which)</p>
                  </div>
                  <div className={styles.roleCard}>
                    <h4 className={styles.roleName}>⚔️ Good Knights (4)</h4>
                    <p className={styles.roleDesc}>Loyal servants with no special abilities</p>
                  </div>
                </div>
              </div>
              
              <div className={styles.teamSection}>
                <h3 className={styles.teamTitle}>Evil Team (4 Players)</h3>
                <div className={styles.roleGrid}>
                  <div className={styles.roleCard}>
                    <h4 className={styles.roleName}>🗡️ The Assassin</h4>
                    <p className={styles.roleDesc}>Can assassinate Merlin at game end</p>
                  </div>
                  <div className={styles.roleCard}>
                    <h4 className={styles.roleName}>🔮 Morgana</h4>
                    <p className={styles.roleDesc}>Appears as Merlin to Percival</p>
                  </div>
                  <div className={styles.roleCard}>
                    <h4 className={styles.roleName}>👑 Mordred</h4>
                    <p className={styles.roleDesc}>Hidden from Merlin's sight</p>
                  </div>
                  <div className={styles.roleCard}>
                    <h4 className={styles.roleName}>🌙 Oberon</h4>
                    <p className={styles.roleDesc}>Unknown to other evil players</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className={styles.demoSection}>
            <h2 className={styles.sectionTitle}>Mission Requirements</h2>
            <div className={styles.missionTable}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Mission</th>
                    <th>Team Size</th>
                    <th>Fails Needed</th>
                    <th>Complexity</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Mission 1</td>
                    <td>3 players</td>
                    <td>1 fail</td>
                    <td>Low</td>
                  </tr>
                  <tr>
                    <td>Mission 2</td>
                    <td>4 players</td>
                    <td>1 fail</td>
                    <td>Medium</td>
                  </tr>
                  <tr>
                    <td>Mission 3</td>
                    <td>4 players</td>
                    <td>1 fail</td>
                    <td>Medium</td>
                  </tr>
                  <tr className={styles.criticalMission}>
                    <td>Mission 4</td>
                    <td>5 players</td>
                    <td>2 fails</td>
                    <td>High</td>
                  </tr>
                  <tr>
                    <td>Mission 5</td>
                    <td>5 players</td>
                    <td>1 fail</td>
                    <td>Critical</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className={styles.demoSection}>
            <h2 className={styles.sectionTitle}>Strategic Complexities</h2>
            <div className={styles.complexityGrid}>
              <div className={styles.complexityCard}>
                <h4 className={styles.complexityTitle}>Information Overload</h4>
                <p className={styles.complexityDescription}>
                  With 10 players and multiple special roles, tracking all 
                  interactions and deductions becomes extremely challenging.
                </p>
              </div>
              <div className={styles.complexityCard}>
                <h4 className={styles.complexityTitle}>Role Interactions</h4>
                <p className={styles.complexityDescription}>
                  Complex web of who knows what: Merlin's limited sight, 
                  Percival's confusion, Oberon's isolation.
                </p>
              </div>
              <div className={styles.complexityCard}>
                <h4 className={styles.complexityTitle}>Mission 4 Requirement</h4>
                <p className={styles.complexityDescription}>
                  Requiring 2 fails in Mission 4 creates unique strategic 
                  considerations for both good and evil teams.
                </p>
              </div>
              <div className={styles.complexityCard}>
                <h4 className={styles.complexityTitle}>Multiple Threats</h4>
                <p className={styles.complexityDescription}>
                  Good team must identify multiple evil players while 
                  evil players work with limited knowledge of each other.
                </p>
              </div>
            </div>
          </section>

          <section className={styles.demoSection}>
            <h2 className={styles.sectionTitle}>Advanced Strategies</h2>
            <div className={styles.strategyGrid}>
              <div className={styles.strategyCard}>
                <h4 className={styles.strategyTitle}>Merlin's Dilemma</h4>
                <p className={styles.strategyDescription}>
                  Must guide the good team while remaining hidden from 4 
                  evil players, including the invisible Mordred.
                </p>
              </div>
              <div className={styles.strategyCard}>
                <h4 className={styles.strategyTitle}>Percival's Challenge</h4>
                <p className={styles.strategyDescription}>
                  Must distinguish between Merlin and Morgana while 
                  protecting the real Merlin from assassination.
                </p>
              </div>
              <div className={styles.strategyCard}>
                <h4 className={styles.strategyTitle}>Evil Coordination</h4>
                <p className={styles.strategyDescription}>
                  Assassin, Morgana, and Mordred must coordinate while 
                  Oberon operates independently in isolation.
                </p>
              </div>
              <div className={styles.strategyCard}>
                <h4 className={styles.strategyTitle}>Endgame Complexity</h4>
                <p className={styles.strategyDescription}>
                  Assassination phase becomes extremely difficult with 
                  6 potential targets and complex behavioral patterns.
                </p>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
