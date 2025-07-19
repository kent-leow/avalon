'use client';

import { useState } from 'react';
import type { DemoScenario, DemoPlayer } from '~/data/demo';
import { DEMO_SCENARIOS, getDemoScenarioById } from '~/data/demo';
import styles from '~/styles/game-rules-demo.module.css';

interface GameRulesDemoProps {
  /** Optional scenario ID to display specific game state */
  scenarioId?: string;
  /** Whether to show interactive controls */
  interactive?: boolean;
  /** Custom CSS class */
  className?: string;
}

/**
 * Game Rules Demo Component
 * Demonstrates game rules using demo data scenarios
 * Shows role assignments, mission requirements, and game flow
 */
export function GameRulesDemo({ 
  scenarioId = 'demo-scenario-lobby',
  interactive = true,
  className 
}: GameRulesDemoProps) {
  const [currentScenarioId, setCurrentScenarioId] = useState(scenarioId);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  
  const scenario = getDemoScenarioById(currentScenarioId);
  
  if (!scenario) {
    return (
      <div className={`${styles.error} ${className || ''}`}>
        <p>Demo scenario not found: {currentScenarioId}</p>
      </div>
    );
  }

  const { gameState } = scenario;
  const selectedPlayer = selectedPlayerId 
    ? gameState.players.find(p => p.id === selectedPlayerId) 
    : null;

  return (
    <div className={`${styles.demo} ${className || ''}`}>
      <header className={styles.header}>
        <h2 className={styles.title}>Game Rules Demo</h2>
        <p className={styles.subtitle}>
          Interactive demonstration using: <strong>{scenario.name}</strong>
        </p>
        
        {interactive && (
          <div className={styles.controls}>
            <label htmlFor="scenario-select" className={styles.controlLabel}>
              Scenario:
            </label>
            <select
              id="scenario-select"
              value={currentScenarioId}
              onChange={(e) => setCurrentScenarioId(e.target.value)}
              className={styles.select}
            >
              {DEMO_SCENARIOS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </header>

      <div className={styles.content}>
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Game Setup</h3>
          <div className={styles.gameInfo}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Players:</span>
              <span className={styles.infoValue}>{gameState.players.length}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Phase:</span>
              <span className={`${styles.infoValue} ${styles[`phase${gameState.phase.replace('-', '')}`]}`}>
                {gameState.phase.replace('-', ' ').toUpperCase()}
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Room Code:</span>
              <span className={styles.infoValue}>{gameState.roomCode}</span>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Players & Roles</h3>
          <div className={styles.playerGrid}>
            {gameState.players.map((player) => (
              <button
                key={player.id}
                className={`${styles.playerCard} ${
                  selectedPlayerId === player.id ? styles.selected : ''
                } ${styles[`role${player.role}`]}`}
                onClick={() => setSelectedPlayerId(
                  selectedPlayerId === player.id ? null : player.id
                )}
                aria-pressed={selectedPlayerId === player.id}
              >
                <div className={styles.playerHeader}>
                  <span className={styles.playerName}>{player.name}</span>
                  {player.isHost && (
                    <span className={styles.hostBadge}>HOST</span>
                  )}
                </div>
                <div className={styles.playerRole}>
                  {player.role.toUpperCase()}
                </div>
                <div className={styles.playerStatus}>
                  <span className={`${styles.statusIndicator} ${styles[player.connectionStatus]}`} />
                  {player.isReady ? 'Ready' : 'Not Ready'}
                </div>
              </button>
            ))}
          </div>
          
          {selectedPlayer && (
            <div className={styles.playerDetails}>
              <h4 className={styles.detailsTitle}>Role Information: {selectedPlayer.name}</h4>
              <div className={styles.roleInfo}>
                <RoleDescription role={selectedPlayer.role} />
              </div>
            </div>
          )}
        </section>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Mission Progress</h3>
          <div className={styles.missionGrid}>
            {gameState.missions.map((mission) => (
              <div
                key={mission.id}
                className={`${styles.missionCard} ${styles[mission.status]}`}
              >
                <div className={styles.missionHeader}>
                  <span className={styles.missionNumber}>Mission {mission.number}</span>
                  <span className={`${styles.missionStatus} ${styles[mission.status]}`}>
                    {mission.status.toUpperCase()}
                  </span>
                </div>
                <div className={styles.missionInfo}>
                  <p className={styles.missionDetail}>
                    Players required: {mission.requiredPlayers}
                  </p>
                  <p className={styles.missionDetail}>
                    Fail votes needed: {mission.failVotesRequired}
                  </p>
                  {mission.selectedPlayers.length > 0 && (
                    <div className={styles.selectedPlayers}>
                      <p className={styles.missionDetail}>Selected players:</p>
                      <ul className={styles.playerList}>
                        {mission.selectedPlayers.map((playerId) => {
                          const player = gameState.players.find(p => p.id === playerId);
                          return (
                            <li key={playerId} className={styles.playerListItem}>
                              {player?.name || playerId}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

/**
 * Role Description Component
 * Shows detailed information about each role
 */
function RoleDescription({ role }: { role: DemoPlayer['role'] }) {
  const roleDescriptions = {
    good: {
      title: 'Good Knight',
      description: 'You are a loyal servant of Arthur. Work with other good players to complete missions successfully.',
      goal: 'Complete 3 missions successfully',
      abilities: ['Vote for mission success', 'Identify suspicious behavior'],
    },
    evil: {
      title: 'Evil Minion',
      description: 'You serve Mordred and work in secret to undermine Arthur\'s kingdom.',
      goal: 'Fail 3 missions or assassinate Merlin',
      abilities: ['Vote for mission failure', 'Know other evil players', 'Deceive good players'],
    },
    merlin: {
      title: 'Merlin',
      description: 'You have magical sight and can see the forces of evil, but must remain hidden.',
      goal: 'Guide good players without revealing yourself',
      abilities: ['See all evil players (except Mordred)', 'Cannot be too obvious'],
    },
    assassin: {
      title: 'The Assassin',
      description: 'You are Mordred\'s deadliest agent, capable of striking down even Merlin.',
      goal: 'Fail missions or assassinate Merlin at game end',
      abilities: ['Vote for mission failure', 'Assassinate Merlin if good wins', 'Know other evil players'],
    },
    percival: {
      title: 'Percival',
      description: 'You can see Merlin, but must be careful as Morgana appears the same.',
      goal: 'Protect Merlin and help complete missions',
      abilities: ['See Merlin and Morgana (but not which is which)'],
    },
    morgana: {
      title: 'Morgana',
      description: 'You are a powerful sorceress who appears as Merlin to Percival.',
      goal: 'Fail missions and confuse Percival',
      abilities: ['Appear as Merlin to Percival', 'Vote for mission failure', 'Know other evil players'],
    },
    mordred: {
      title: 'Mordred',
      description: 'You are the leader of evil forces, hidden even from Merlin\'s sight.',
      goal: 'Fail missions while remaining undetected',
      abilities: ['Invisible to Merlin', 'Vote for mission failure', 'Know other evil players'],
    },
    oberon: {
      title: 'Oberon',
      description: 'You work alone for evil, unknown to other evil players.',
      goal: 'Fail missions through deception',
      abilities: ['Unknown to other evil players', 'Vote for mission failure'],
    },
  };

  const info = roleDescriptions[role];

  return (
    <div className={styles.roleDescription}>
      <h5 className={styles.roleTitle}>{info.title}</h5>
      <p className={styles.roleText}>{info.description}</p>
      <div className={styles.roleGoal}>
        <strong>Goal:</strong> {info.goal}
      </div>
      <div className={styles.roleAbilities}>
        <strong>Abilities:</strong>
        <ul className={styles.abilityList}>
          {info.abilities.map((ability, index) => (
            <li key={index} className={styles.abilityItem}>
              {ability}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
