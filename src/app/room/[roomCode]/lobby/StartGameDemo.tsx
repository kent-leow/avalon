"use client";

import { useState } from "react";
import PreStartChecklist from "./PreStartChecklist";
import PlayerReadyList from "./PlayerReadyList";
import StartGameButton from "./StartGameButton";
import GameStartStatus from "./GameStartStatus";
import { type StartRequirement, type PlayerReadyStatus, type GameStartStatus as GameStartStatusType } from "~/types/game-state";

// Mock data for demonstration
const mockPlayers: PlayerReadyStatus[] = [
  { playerId: '1', name: 'Alice', isHost: true, isReady: true },
  { playerId: '2', name: 'Bob', isHost: false, isReady: true },
  { playerId: '3', name: 'Charlie', isHost: false, isReady: false },
  { playerId: '4', name: 'Diana', isHost: false, isReady: true },
  { playerId: '5', name: 'Eve', isHost: false, isReady: true },
];

const mockRequirements: StartRequirement[] = [
  {
    id: 'min-players',
    name: 'Minimum Players',
    description: 'At least 5 players required',
    status: 'satisfied',
    required: true,
  },
  {
    id: 'valid-settings',
    name: 'Valid Game Settings',
    description: 'Character configuration is valid',
    status: 'satisfied',
    required: true,
  },
  {
    id: 'all-ready',
    name: 'All Players Ready',
    description: 'All players have confirmed they are ready',
    status: 'pending',
    required: false,
  },
];

export default function StartGameDemo() {
  const [gameStartStatus, setGameStartStatus] = useState<GameStartStatusType>({
    status: 'idle',
    progress: 0,
    message: '',
  });

  const [isStarting, setIsStarting] = useState(false);

  const handleStartGame = () => {
    setIsStarting(true);
    setGameStartStatus({
      status: 'starting',
      progress: 0,
      message: 'Preparing to start the game...',
    });

    // Simulate game start process
    setTimeout(() => {
      setGameStartStatus({
        status: 'starting',
        progress: 30,
        message: 'Validating game settings...',
      });
    }, 500);

    setTimeout(() => {
      setGameStartStatus({
        status: 'assigning-roles',
        progress: 60,
        message: 'Assigning roles to players...',
      });
    }, 1500);

    setTimeout(() => {
      setGameStartStatus({
        status: 'assigning-roles',
        progress: 90,
        message: 'Finalizing role assignments...',
      });
    }, 2500);

    setTimeout(() => {
      setGameStartStatus({
        status: 'complete',
        progress: 100,
        message: 'Game started successfully!',
      });
    }, 3500);

    setTimeout(() => {
      setGameStartStatus({
        status: 'idle',
        progress: 0,
        message: '',
      });
      setIsStarting(false);
    }, 5000);
  };

  const canStart = mockRequirements.filter(r => r.required).every(r => r.status === 'satisfied');

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#252547] p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent mb-2">
            Start Game Demo
          </h1>
          <p className="text-slate-300">
            Demonstration of the Start Game feature components
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <PreStartChecklist
            playerCount={mockPlayers.length}
            minPlayers={5}
            settingsValid={true}
            allPlayersReady={mockPlayers.every(p => p.isReady)}
            requirements={mockRequirements}
          />
          
          <PlayerReadyList
            players={mockPlayers}
            hostId="1"
          />
        </div>

        <StartGameButton
          roomId="DEMO"
          isHost={true}
          canStart={canStart}
          onStartGame={handleStartGame}
          isStarting={isStarting}
          className="mb-8"
        />

        <GameStartStatus status={gameStartStatus} />
      </div>
    </div>
  );
}
