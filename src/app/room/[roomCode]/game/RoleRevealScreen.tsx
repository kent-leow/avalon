"use client";

import { useState, useEffect } from "react";
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
  isLoading?: boolean;
  hasConfirmed?: boolean;
  className?: string;
  hints?: string[];
  restrictions?: string[];
}

export default function RoleRevealScreen({
  playerId,
  roomId,
  playerName,
  playerRole,
  knownPlayers,
  timeRemaining = 30,
  onContinue,
  isLoading = false,
  hasConfirmed = false,
  className = "",
  hints = [],
  restrictions = [],
}: RoleRevealScreenProps) {
  const [showKnowledge, setShowKnowledge] = useState(false);
  const [canContinue, setCanContinue] = useState(false);
  const [showHints, setShowHints] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowKnowledge(true);
      setShowHints(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (showKnowledge) {
      const timer = setTimeout(() => {
        setCanContinue(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [showKnowledge]);

  const handleTimeUp = () => {
    setCanContinue(true);
    setTimeout(() => {
      onContinue();
    }, 1000);
  };

  return (
    <div 
      className={`min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] to-[#252547] relative overflow-hidden ${className}`}
      data-testid="role-reveal-screen"
    >
      {/* ...existing starfield and particles code... */}
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

        {/* Hints and restrictions */}
        {showHints && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-[#252547]/80 rounded-xl p-4 mb-4">
              <h3 className="text-lg font-bold text-blue-400 mb-2">Hints</h3>
              <ul className="list-disc pl-6 text-slate-200">
                {hints.map((hint: string, idx: number) => (
                  <li key={idx}>{hint}</li>
                ))}
              </ul>
            </div>
            <div className="bg-[#252547]/80 rounded-xl p-4">
              <h3 className="text-lg font-bold text-red-400 mb-2">Restrictions</h3>
              <ul className="list-disc pl-6 text-slate-200">
                {restrictions.map((r: string, idx: number) => (
                  <li key={idx}>{r}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

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
      {/* ...existing custom CSS for animations... */}
    </div>
  );
}
