/**
 * Assassin Screen Component
 * 
 * Main interface for the assassin phase where evil tries to identify Merlin.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { AssassinIdentityPanel } from './AssassinIdentityPanel';
import { PlayerTargetGrid } from './PlayerTargetGrid';
import { StrategyInfoPanel } from './StrategyInfoPanel';
import { AssassinationConfirmation } from './AssassinationConfirmation';
import { AssassinationResultReveal } from './AssassinationResultReveal';
import type { AssassinAttempt } from '~/types/assassin-attempt';
import { 
  updateAssassinTimer, 
  processAssassinAttempt, 
  canMakeSelection, 
  validateSelection, 
  getTargetById,
  advanceRevealSequence 
} from '~/lib/assassin-attempt-utils';

interface AssassinScreenProps {
  attempt: AssassinAttempt;
  onComplete: (result: any) => void;
}

export function AssassinScreen({ attempt: initialAttempt, onComplete }: AssassinScreenProps) {
  const [attempt, setAttempt] = useState<AssassinAttempt>(initialAttempt);
  const [selectedTarget, setSelectedTarget] = useState<string | undefined>();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Timer update effect
  useEffect(() => {
    const interval = setInterval(() => {
      setAttempt(prev => ({
        ...prev,
        timer: updateAssassinTimer(prev.timer, 1000),
      }));
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Auto-advance reveal sequence
  useEffect(() => {
    if (attempt.result?.revealSequence && !attempt.result.revealSequence.isComplete) {
      const currentStage = attempt.result.revealSequence.stages[attempt.result.revealSequence.currentStage];
      if (currentStage) {
        const timer = setTimeout(() => {
          setAttempt(prev => ({
            ...prev,
            result: prev.result ? {
              ...prev.result,
              revealSequence: advanceRevealSequence(prev.result.revealSequence),
            } : prev.result,
          }));
        }, currentStage.duration);
        
        return () => clearTimeout(timer);
      }
    }
  }, [attempt.result?.revealSequence]);
  
  const handleTargetSelect = (targetId: string) => {
    if (!canMakeSelection(attempt) || !validateSelection(attempt, targetId)) {
      return;
    }
    
    setSelectedTarget(targetId);
    setShowConfirmation(true);
  };
  
  const handleConfirmAssassination = async () => {
    if (!selectedTarget) return;
    
    setIsProcessing(true);
    
    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const result = processAssassinAttempt(attempt, selectedTarget);
      
      setAttempt(prev => ({
        ...prev,
        result,
        selectedTarget,
        assassin: {
          ...prev.assassin,
          hasDecided: true,
          decisionTime: new Date(),
        },
      }));
      
      setShowConfirmation(false);
      setShowResult(true);
    } catch (error) {
      console.error('Error processing assassination:', error);
      setIsProcessing(false);
    }
  };
  
  const handleCancelConfirmation = () => {
    setShowConfirmation(false);
    setSelectedTarget(undefined);
  };
  
  const handleResultComplete = () => {
    setShowResult(false);
    if (attempt.result) {
      onComplete(attempt.result);
    }
  };
  
  const selectedTargetData = selectedTarget ? getTargetById(attempt, selectedTarget) : null;
  
  // Show result reveal if result exists
  if (showResult && attempt.result) {
    const target = getTargetById(attempt, attempt.result.targetId);
    if (target) {
      return (
        <AssassinationResultReveal
          result={attempt.result}
          targetName={target.name}
          targetAvatar={target.avatar}
          onComplete={handleResultComplete}
        />
      );
    }
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] to-[#252547] p-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Assassin Identity */}
          <div className="lg:col-span-1">
            <AssassinIdentityPanel
              assassin={attempt.assassin}
              timer={attempt.timer}
            />
          </div>
          
          {/* Middle Column - Target Selection */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-[#1a1a2e] to-[#252547] p-6 rounded-xl border border-gray-600/30 shadow-xl">
              <PlayerTargetGrid
                targets={attempt.targets}
                selectedTarget={selectedTarget}
                onTargetSelect={handleTargetSelect}
                canSelect={canMakeSelection(attempt)}
              />
            </div>
          </div>
          
          {/* Right Column - Strategic Information */}
          <div className="lg:col-span-1">
            <StrategyInfoPanel
              strategicInfo={attempt.strategicInfo}
              gameContext={attempt.gameContext}
            />
          </div>
        </div>
        
        {/* Game Status */}
        <div className="mt-6 text-center">
          <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-600/30">
            <h2 className="text-lg font-semibold text-gray-300 mb-2">
              Game Status
            </h2>
            <p className="text-gray-400">
              Good has won {attempt.gameContext.goodWins} missions. 
              The assassin must identify Merlin to claim victory for evil.
            </p>
          </div>
        </div>
        
        {/* Phase Indicator */}
        <div className="mt-4 text-center">
          <div className="inline-flex items-center space-x-2 bg-red-900/20 px-4 py-2 rounded-full border border-red-600/30">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-red-400 font-medium">
              Assassin Phase Active
            </span>
          </div>
        </div>
      </div>
      
      {/* Confirmation Modal */}
      {showConfirmation && selectedTargetData && (
        <AssassinationConfirmation
          target={selectedTargetData}
          onConfirm={handleConfirmAssassination}
          onCancel={handleCancelConfirmation}
          isProcessing={isProcessing}
        />
      )}
      
      {/* Atmospheric Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-1/2 h-1/2 bg-red-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-1/2 h-1/2 bg-purple-600/5 rounded-full blur-3xl" />
      </div>
    </div>
  );
}
