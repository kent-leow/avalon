/**
 * Assassin Screen Integration Component
 * 
 * Real API integration for the assassin phase using tRPC.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { AssassinScreen } from './AssassinScreen';
import { api } from '~/trpc/react';
import type { AssassinAttempt } from '~/types/assassin-attempt';
import { 
  createAssassinAttempt, 
  createAssassinTimer, 
  createAssassinPhase,
  generateTargetHints,
  calculateBehaviorAnalysis
} from '~/lib/assassin-attempt-utils';
import { ASSASSIN_CONFIG } from '~/types/assassin-attempt';

interface AssassinScreenIntegrationProps {
  roomCode: string;
  playerId: string;
  onComplete: (result: any) => void;
}

export function AssassinScreenIntegration({ 
  roomCode, 
  playerId, 
  onComplete 
}: AssassinScreenIntegrationProps) {
  const [attempt, setAttempt] = useState<AssassinAttempt | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch assassin attempt data
  const { data: assassinData, error: fetchError } = api.room.getAssassinAttemptData.useQuery({
    roomCode,
    playerId,
  });
  
  // Submit assassination attempt mutation
  const submitAttempt = api.room.submitAssassinAttempt.useMutation({
    onSuccess: (result) => {
      onComplete(result);
    },
    onError: (error) => {
      setError(error.message);
    },
  });
  
  // Transform API data to AssassinAttempt format
  useEffect(() => {
    if (assassinData) {
      try {
        // Convert API data to full AssassinAttempt format
        const enrichedTargets = assassinData.targets.map(target => {
          const behavior = calculateBehaviorAnalysis([], []); // Mock data for now
          return {
            ...target,
            hints: generateTargetHints({
              ...target,
              behavior,
              hints: [], // Initialize with empty hints
            }),
            behavior,
          };
        });
        
        const assassinAttempt: AssassinAttempt = {
          assassin: assassinData.assassin,
          targets: enrichedTargets,
          strategicInfo: {
            ...assassinData.strategicInfo,
            missionTimeline: assassinData.strategicInfo.missionTimeline.map(mission => ({
              ...mission,
              result: mission.result as 'success' | 'failure',
            })),
          },
          gameContext: {
            ...assassinData.gameContext,
            missionResults: assassinData.gameContext.missionResults.filter(
              (result): result is 'success' | 'failure' => result !== undefined
            ),
          },
          phase: createAssassinPhase('reveal'),
          timer: createAssassinTimer(ASSASSIN_CONFIG.DECISION_TIME),
          selectedTarget: undefined,
          result: undefined,
        };
        
        setAttempt(assassinAttempt);
        setIsLoading(false);
      } catch (error) {
        setError('Failed to process assassin data');
        setIsLoading(false);
      }
    }
  }, [assassinData]);
  
  // Handle fetch error
  useEffect(() => {
    if (fetchError) {
      setError(fetchError.message);
      setIsLoading(false);
    }
  }, [fetchError]);
  
  const handleComplete = async (result: any) => {
    if (result.targetId) {
      // Submit the assassination attempt
      await submitAttempt.mutateAsync({
        roomCode,
        playerId,
        targetId: result.targetId,
      });
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] to-[#252547] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
          <h2 className="text-xl font-semibold text-red-400 mb-2">
            Preparing Assassination Phase...
          </h2>
          <p className="text-gray-400">
            Loading strategic information and target data
          </p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] to-[#252547] flex items-center justify-center">
        <div className="bg-gradient-to-br from-[#1a1a2e] to-[#252547] p-8 rounded-2xl border border-red-600/50 shadow-2xl max-w-md w-full text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-600/20 rounded-full flex items-center justify-center border-2 border-red-600/50">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold text-red-400 mb-4">
            Error
          </h2>
          <p className="text-gray-300 mb-6">
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium rounded-xl transition-all duration-200 border border-red-500/50 shadow-lg shadow-red-500/20"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
  
  if (!attempt) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] to-[#252547] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-400">
            No assassin data available
          </h2>
        </div>
      </div>
    );
  }
  
  return (
    <div>
      {/* Integration Header */}
      <div className="bg-gradient-to-r from-red-900/20 to-purple-900/20 border-b border-red-600/30 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-red-400">
                🗡️ Assassin Phase - Live
              </h1>
              <p className="text-gray-400 mt-1">
                Real-time assassination attempt with backend integration
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-green-400">
                ✅ Backend Connected
              </p>
              <p className="text-xs text-gray-500">
                Room: {roomCode}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <AssassinScreen
        attempt={attempt}
        onComplete={handleComplete}
      />
      
      {/* Integration Footer */}
      <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 border-t border-gray-600/30 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <span className="text-gray-400">Live Features:</span>
              <span className="text-green-400">• Real-time data loading</span>
              <span className="text-blue-400">• Strategic analysis</span>
              <span className="text-purple-400">• Secure assassination submission</span>
            </div>
            <div className="text-gray-500">
              {submitAttempt.isPending && (
                <span className="text-amber-400">Submitting...</span>
              )}
              {submitAttempt.error && (
                <span className="text-red-400">Error: {submitAttempt.error.message}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
