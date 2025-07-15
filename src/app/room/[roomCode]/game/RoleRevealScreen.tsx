"use client";

import { useState } from "react";
import PlayerRoleCard from "./PlayerRoleCard";
import KnownPlayersGrid from "./KnownPlayersGrid";
import RoleRevealTimer from "./RoleRevealTimer";
import ContinueButton from "./ContinueButton";
import { type Role } from "~/types/roles";
import { type KnownPlayer } from "~/types/role-knowledge";

interface RoleRevealScreenProps {
  playerId: string;
  roomId: string;
  playerName: string;
  playerRole: Role;
  knownPlayers: KnownPlayer[];
  timeRemaining?: number;
  onContinue: () => void;
  className?: string;
}

export default function RoleRevealScreen({
  playerId,
  roomId,
  playerName,
  playerRole,
  knownPlayers,
  timeRemaining = 60,
  onContinue,
  className = "",
}: RoleRevealScreenProps) {
  const [showKnowledge, setShowKnowledge] = useState(false);
  const [canContinue, setCanContinue] = useState(false);

  // Auto-reveal knowledge after role card animation
  useState(() => {
    const timer = setTimeout(() => {
      setShowKnowledge(true);
    }, 1500);
    return () => clearTimeout(timer);
  });

  // Enable continue button after knowledge is shown
  useState(() => {
    const timer = setTimeout(() => {
      setCanContinue(true);
    }, 3000);
    return () => clearTimeout(timer);
  });

  const handleTimeUp = () => {
    setCanContinue(true);
    // Auto-continue after short delay
    setTimeout(() => {
      onContinue();
    }, 1000);
  };

  return (
    <div 
      className={`min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] to-[#252547] relative overflow-hidden ${className}`}
      data-testid="role-reveal-screen"
    >
      {/* Starfield background */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-white rounded-full animate-pulse opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${Math.random() * 3 + 2}s`,
            }}
          />
        ))}
      </div>

      {/* Floating magical particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-purple-400 rounded-full animate-bounce opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 6 + 2}px`,
              height: `${Math.random() * 6 + 2}px`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${Math.random() * 2 + 3}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent mb-2">
            Your Destiny
          </h1>
          <p className="text-lg text-slate-300">
            The realm of Camelot has chosen your path, {playerName}
          </p>
        </div>

        {/* Timer */}
        {timeRemaining > 0 && (
          <div className="flex justify-center mb-8">
            <RoleRevealTimer
              timeRemaining={timeRemaining}
              onTimeUp={handleTimeUp}
            />
          </div>
        )}

        {/* Role card */}
        <div className="flex justify-center mb-8">
          <div className="w-full max-w-md">
            <PlayerRoleCard
              role={playerRole}
              playerName={playerName}
              team={playerRole.team}
            />
          </div>
        </div>

        {/* Known players grid */}
        {showKnowledge && (
          <div 
            className="max-w-4xl mx-auto mb-8 animate-fadeIn"
            style={{
              animation: 'slideUp 0.8s ease-out forwards'
            }}
          >
            <KnownPlayersGrid
              knownPlayers={knownPlayers}
              playerRole={playerRole}
            />
          </div>
        )}

        {/* Continue button */}
        {canContinue && (
          <div 
            className="animate-fadeIn"
            style={{
              animation: 'fadeIn 0.5s ease-out forwards'
            }}
          >
            <ContinueButton
              onContinue={onContinue}
              disabled={!canContinue}
            />
          </div>
        )}
      </div>

      {/* Add custom CSS for animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
