"use client";

import { useEffect, useState } from "react";
import { api } from "~/trpc/react";
import RoleRevealScreen from "./RoleRevealScreen";
import { type Role } from "~/types/roles";
import { type RoleKnowledge } from "~/types/role-knowledge";

interface RoleRevealIntegrationProps {
  roomId: string;
  playerId: string;
  playerName: string;
  onContinue: () => void;
  className?: string;
}

export default function RoleRevealIntegration({
  roomId,
  playerId,
  playerName,
  onContinue,
  className = "",
}: RoleRevealIntegrationProps) {
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [hasConfirmed, setHasConfirmed] = useState(false);

  // Fetch role knowledge
  const roleKnowledgeQuery = api.room.getRoleKnowledge.useQuery({
    roomId,
    playerId,
  });

  // Confirm role revealed mutation
  const confirmRoleRevealedMutation = api.room.confirmRoleRevealed.useMutation({
    onSuccess: (data) => {
      if (data.allPlayersReady) {
        // All players have seen their roles, advance to next phase
        onContinue();
      }
    },
    onError: (error) => {
      console.error("Failed to confirm role revealed:", error);
    },
  });

  // Timer countdown
  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [timeRemaining]);

  // Handle continue button
  const handleContinue = async () => {
    if (hasConfirmed) return;
    
    setHasConfirmed(true);
    
    try {
      await confirmRoleRevealedMutation.mutateAsync({
        roomId,
        playerId,
      });
    } catch (error) {
      // Error handling is done in mutation
      setHasConfirmed(false);
    }
  };

  // Loading state
  if (roleKnowledgeQuery.isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] to-[#252547] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Revealing your destiny...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (roleKnowledgeQuery.error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] to-[#252547] flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-white text-2xl font-bold mb-4">Role Revelation Failed</h2>
          <p className="text-slate-300 mb-6">
            {roleKnowledgeQuery.error.message}
          </p>
          <button
            onClick={() => roleKnowledgeQuery.refetch()}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Role data not available
  if (!roleKnowledgeQuery.data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] to-[#252547] flex items-center justify-center">
        <div className="text-center">
          <div className="text-amber-500 text-6xl mb-4">🔮</div>
          <h2 className="text-white text-2xl font-bold mb-4">Awaiting Role Assignment</h2>
          <p className="text-slate-300">
            The game master is preparing your role...
          </p>
        </div>
      </div>
    );
  }

  const roleData = roleKnowledgeQuery.data;

  return (
    <div className={className}>
      <RoleRevealScreen
        playerId={playerId}
        roomId={roomId}
        playerName={playerName}
        playerRole={roleData.playerRole}
        knownPlayers={roleData.knownPlayers}
        timeRemaining={timeRemaining}
        onContinue={handleContinue}
        isLoading={confirmRoleRevealedMutation.isPending}
        hasConfirmed={hasConfirmed}
      />
    </div>
  );
}
