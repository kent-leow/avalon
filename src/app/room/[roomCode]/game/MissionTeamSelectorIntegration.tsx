"use client";

import { useState, useEffect } from "react";
import { api } from "~/trpc/react";
import MissionTeamSelector from "./MissionTeamSelector";
import { type MissionPlayer } from "~/types/mission";

interface MissionTeamSelectorIntegrationProps {
  roomCode: string;
  playerId: string;
}

export default function MissionTeamSelectorIntegration({
  roomCode,
  playerId,
}: MissionTeamSelectorIntegrationProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get room ID from room code
  const { data: roomData } = api.room.getRoomInfo.useQuery({
    roomCode,
  });

  // Get mission data
  const { data: missionData, refetch: refetchMissionData } = api.room.getMissionData.useQuery(
    {
      roomId: roomData?.id || "",
      playerId,
    },
    {
      enabled: !!roomData?.id,
    }
  );

  // Submit team mutation
  const submitTeamMutation = api.room.submitMissionTeam.useMutation({
    onSuccess: () => {
      // Refetch mission data to get updated state
      void refetchMissionData();
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  const handleTeamSubmit = async (teamIds: string[]) => {
    if (!roomData?.id) return;

    setError(null);
    
    try {
      await submitTeamMutation.mutateAsync({
        roomId: roomData.id,
        playerId,
        teamIds,
      });
    } catch (error) {
      // Error is handled by onError callback
      console.error("Team submission error:", error);
    }
  };

  useEffect(() => {
    if (roomData && missionData) {
      setIsLoading(false);
    }
  }, [roomData, missionData]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] to-[#252547] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#3b82f6] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading mission data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] to-[#252547] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <p className="text-red-400 text-lg mb-2">Error Loading Mission</p>
          <p className="text-slate-300 text-sm">{error}</p>
          <button
            onClick={() => {
              setError(null);
              void refetchMissionData();
            }}
            className="mt-4 px-6 py-2 bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!missionData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] to-[#252547] flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-lg">No mission data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Loading overlay */}
      {submitTeamMutation.isPending && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#3b82f6] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white text-lg">Submitting team...</p>
          </div>
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-40">
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 backdrop-blur-xl">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <p className="text-red-400 text-sm">{error}</p>
              <button
                onClick={() => setError(null)}
                className="ml-2 text-red-400 hover:text-red-300 transition-colors"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      <MissionTeamSelector
        roomId={roomData?.id || ""}
        playerId={playerId}
        isLeader={missionData.isLeader}
        mission={missionData.mission}
        players={missionData.players}
        onTeamSubmit={handleTeamSubmit}
      />
    </div>
  );
}
