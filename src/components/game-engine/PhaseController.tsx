/**
 * Phase Controller Component
 * 
 * Handles automatic phase transitions and renders appropriate phase components
 * based on the current game state.
 */

'use client';

import { useEffect, useCallback } from 'react';
import type { PhaseControllerProps } from '~/types/game-engine';
import type { GamePhase } from '~/types/game-state';
import { 
  calculateNextPhase, 
  arePlayersReadyForTransition,
  formatPhaseName,
  getPhaseDescription
} from '~/lib/game-engine-utils';

/**
 * Phase Controller Component
 * 
 * Manages phase transitions and renders the appropriate UI for each phase.
 */
export function PhaseController({
  currentPhase,
  gameState,
  players,
  onPhaseTransition,
  roomCode,
  playerId,
}: PhaseControllerProps) {
  
  /**
   * Check if phase transition should occur
   */
  const checkPhaseTransition = useCallback(() => {
    if (!arePlayersReadyForTransition(currentPhase, gameState, players)) {
      return;
    }
    
    const nextPhase = calculateNextPhase(currentPhase, gameState, players);
    
    if (nextPhase && nextPhase !== currentPhase) {
      console.log(`Phase transition triggered: ${currentPhase} -> ${nextPhase}`);
      onPhaseTransition(nextPhase);
    }
  }, [currentPhase, gameState, players, onPhaseTransition]);

  /**
   * Monitor for phase transition conditions
   */
  useEffect(() => {
    const interval = setInterval(checkPhaseTransition, 1000);
    return () => clearInterval(interval);
  }, [checkPhaseTransition]);

  /**
   * Render phase-specific content
   */
  const renderPhaseContent = () => {
    switch (currentPhase) {
      case 'lobby':
        return (
          <div className="text-center" data-testid="lobby-phase">
            <h2 className="text-2xl font-bold mb-4" style={{ color: '#f8f9fa' }}>
              Lobby
            </h2>
            <p className="text-lg mb-6" style={{ color: '#9ca3af' }}>
              Waiting for players to join and ready up
            </p>
            <div className="space-y-2">
              {players.map((player) => (
                <div 
                  key={player.id}
                  className="flex items-center justify-between p-3 rounded-lg"
                  style={{ backgroundColor: '#252547' }}
                >
                  <span style={{ color: '#f8f9fa' }}>
                    {player.name} {player.isHost && '(Host)'}
                  </span>
                  <span 
                    className="text-sm font-medium"
                    style={{ color: player.isReady ? '#22c55e' : '#ef4444' }}
                  >
                    {player.isReady ? 'Ready' : 'Not Ready'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'roleReveal':
        return (
          <div className="text-center" data-testid="role-reveal-phase">
            <h2 className="text-2xl font-bold mb-4" style={{ color: '#f8f9fa' }}>
              Role Reveal
            </h2>
            <p className="text-lg mb-6" style={{ color: '#9ca3af' }}>
              Players are learning their roles
            </p>
            <div 
              className="max-w-md mx-auto p-6 rounded-lg"
              style={{ backgroundColor: '#252547' }}
            >
              <div className="text-6xl mb-4">🎭</div>
              <p className="text-xl font-semibold mb-2" style={{ color: '#f8f9fa' }}>
                Your Role
              </p>
              <p className="text-sm" style={{ color: '#9ca3af' }}>
                Role assignment in progress...
              </p>
            </div>
          </div>
        );
      
      case 'voting':
        return (
          <div className="text-center" data-testid="voting-phase">
            <h2 className="text-2xl font-bold mb-4" style={{ color: '#f8f9fa' }}>
              Team Voting
            </h2>
            <p className="text-lg mb-6" style={{ color: '#9ca3af' }}>
              Players are voting on the proposed team
            </p>
            <div 
              className="max-w-md mx-auto p-6 rounded-lg"
              style={{ backgroundColor: '#252547' }}
            >
              <div className="text-6xl mb-4">🗳️</div>
              <p className="text-xl font-semibold mb-2" style={{ color: '#f8f9fa' }}>
                Vote on Team
              </p>
              <p className="text-sm mb-4" style={{ color: '#9ca3af' }}>
                Round {gameState.round} - Leader: Player {gameState.leaderIndex + 1}
              </p>
              <div className="flex gap-4 justify-center">
                <button 
                  className="px-6 py-3 rounded-lg font-medium transition-colors"
                  style={{ backgroundColor: '#22c55e', color: '#ffffff' }}
                  data-testid="approve-vote-button"
                >
                  Approve
                </button>
                <button 
                  className="px-6 py-3 rounded-lg font-medium transition-colors"
                  style={{ backgroundColor: '#ef4444', color: '#ffffff' }}
                  data-testid="reject-vote-button"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        );
      
      case 'missionSelect':
        return (
          <div className="text-center" data-testid="mission-select-phase">
            <h2 className="text-2xl font-bold mb-4" style={{ color: '#f8f9fa' }}>
              Mission Selection
            </h2>
            <p className="text-lg mb-6" style={{ color: '#9ca3af' }}>
              The leader is selecting team members
            </p>
            <div 
              className="max-w-md mx-auto p-6 rounded-lg"
              style={{ backgroundColor: '#252547' }}
            >
              <div className="text-6xl mb-4">⚔️</div>
              <p className="text-xl font-semibold mb-2" style={{ color: '#f8f9fa' }}>
                Select Team
              </p>
              <p className="text-sm mb-4" style={{ color: '#9ca3af' }}>
                Choose team members for the mission
              </p>
              <div className="space-y-2">
                {players.map((player) => (
                  <div 
                    key={player.id}
                    className="flex items-center justify-between p-2 rounded"
                    style={{ backgroundColor: '#1a1a2e' }}
                  >
                    <span style={{ color: '#f8f9fa' }}>{player.name}</span>
                    <input 
                      type="checkbox" 
                      className="h-4 w-4"
                      data-testid={`select-player-${player.id}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      
      case 'missionVote':
        return (
          <div className="text-center" data-testid="mission-vote-phase">
            <h2 className="text-2xl font-bold mb-4" style={{ color: '#f8f9fa' }}>
              Mission Vote
            </h2>
            <p className="text-lg mb-6" style={{ color: '#9ca3af' }}>
              Team members are voting on the mission
            </p>
            <div 
              className="max-w-md mx-auto p-6 rounded-lg"
              style={{ backgroundColor: '#252547' }}
            >
              <div className="text-6xl mb-4">🎯</div>
              <p className="text-xl font-semibold mb-2" style={{ color: '#f8f9fa' }}>
                Mission Vote
              </p>
              <p className="text-sm mb-4" style={{ color: '#9ca3af' }}>
                Vote on the mission outcome
              </p>
              <div className="flex gap-4 justify-center">
                <button 
                  className="px-6 py-3 rounded-lg font-medium transition-colors"
                  style={{ backgroundColor: '#22c55e', color: '#ffffff' }}
                  data-testid="success-vote-button"
                >
                  Success
                </button>
                <button 
                  className="px-6 py-3 rounded-lg font-medium transition-colors"
                  style={{ backgroundColor: '#ef4444', color: '#ffffff' }}
                  data-testid="failure-vote-button"
                >
                  Failure
                </button>
              </div>
            </div>
          </div>
        );
      
      case 'missionResult':
        return (
          <div className="text-center" data-testid="mission-result-phase">
            <h2 className="text-2xl font-bold mb-4" style={{ color: '#f8f9fa' }}>
              Mission Result
            </h2>
            <p className="text-lg mb-6" style={{ color: '#9ca3af' }}>
              Mission results are being revealed
            </p>
            <div 
              className="max-w-md mx-auto p-6 rounded-lg"
              style={{ backgroundColor: '#252547' }}
            >
              <div className="text-6xl mb-4">📊</div>
              <p className="text-xl font-semibold mb-2" style={{ color: '#f8f9fa' }}>
                Mission Complete
              </p>
              <p className="text-sm mb-4" style={{ color: '#9ca3af' }}>
                Results from Round {gameState.round}
              </p>
              <div className="space-y-2">
                <div className="text-sm" style={{ color: '#9ca3af' }}>
                  Completed Missions: {gameState.missions.filter(m => m.result).length}
                </div>
                <div className="text-sm" style={{ color: '#22c55e' }}>
                  Successful: {gameState.missions.filter(m => m.result === 'success').length}
                </div>
                <div className="text-sm" style={{ color: '#ef4444' }}>
                  Failed: {gameState.missions.filter(m => m.result === 'failure').length}
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'assassinAttempt':
        return (
          <div className="text-center" data-testid="assassin-attempt-phase">
            <h2 className="text-2xl font-bold mb-4" style={{ color: '#f8f9fa' }}>
              Assassin Attempt
            </h2>
            <p className="text-lg mb-6" style={{ color: '#9ca3af' }}>
              The assassin is making their attempt
            </p>
            <div 
              className="max-w-md mx-auto p-6 rounded-lg"
              style={{ backgroundColor: '#252547' }}
            >
              <div className="text-6xl mb-4">🗡️</div>
              <p className="text-xl font-semibold mb-2" style={{ color: '#f8f9fa' }}>
                Final Attempt
              </p>
              <p className="text-sm mb-4" style={{ color: '#9ca3af' }}>
                The assassin must identify Merlin
              </p>
              <div className="space-y-2">
                {players.map((player) => (
                  <button 
                    key={player.id}
                    className="w-full p-3 rounded-lg font-medium transition-colors"
                    style={{ backgroundColor: '#3d3d7a', color: '#ffffff' }}
                    data-testid={`assassin-target-${player.id}`}
                  >
                    {player.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
      
      case 'gameOver':
        return (
          <div className="text-center" data-testid="game-over-phase">
            <h2 className="text-2xl font-bold mb-4" style={{ color: '#f8f9fa' }}>
              Game Over
            </h2>
            <p className="text-lg mb-6" style={{ color: '#9ca3af' }}>
              The game has ended
            </p>
            <div 
              className="max-w-md mx-auto p-6 rounded-lg"
              style={{ backgroundColor: '#252547' }}
            >
              <div className="text-6xl mb-4">🏆</div>
              <p className="text-xl font-semibold mb-2" style={{ color: '#f8f9fa' }}>
                Game Complete
              </p>
              <p className="text-sm mb-4" style={{ color: '#9ca3af' }}>
                Final results and statistics
              </p>
              <button 
                className="px-6 py-3 rounded-lg font-medium transition-colors"
                style={{ backgroundColor: '#3d3d7a', color: '#ffffff' }}
                data-testid="new-game-button"
              >
                New Game
              </button>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="text-center" data-testid="unknown-phase">
            <h2 className="text-2xl font-bold mb-4" style={{ color: '#ef4444' }}>
              Unknown Phase
            </h2>
            <p className="text-lg" style={{ color: '#9ca3af' }}>
              Phase: {currentPhase}
            </p>
          </div>
        );
    }
  };

  return (
    <div className="container mx-auto p-8" data-testid="phase-controller">
      {/* Phase Header */}
      <div className="mb-8 text-center">
        <div className="mb-4">
          <h1 
            className="text-3xl font-bold mb-2"
            style={{ color: '#f8f9fa' }}
          >
            {formatPhaseName(currentPhase)}
          </h1>
          <p 
            className="text-lg"
            style={{ color: '#9ca3af' }}
          >
            {getPhaseDescription(currentPhase)}
          </p>
        </div>
        
        {/* Phase Progress */}
        <div className="flex justify-center items-center space-x-4 text-sm" style={{ color: '#9ca3af' }}>
          <span>Room: {roomCode}</span>
          <span>•</span>
          <span>Round: {gameState.round}</span>
          <span>•</span>
          <span>Players: {players.length}</span>
        </div>
      </div>

      {/* Phase Content */}
      <div className="max-w-4xl mx-auto">
        {renderPhaseContent()}
      </div>
    </div>
  );
}

export default PhaseController;
