/**
 * Assassination Confirmation Modal Component
 * 
 * Dramatic confirmation modal for the final assassination decision.
 */

'use client';

import React, { useState } from 'react';
import type { AssassinTarget } from '~/types/assassin-attempt';

interface AssassinationConfirmationProps {
  target: AssassinTarget;
  onConfirm: () => void;
  onCancel: () => void;
  isProcessing: boolean;
}

export function AssassinationConfirmation({ 
  target, 
  onConfirm, 
  onCancel, 
  isProcessing 
}: AssassinationConfirmationProps) {
  const [showConsequences, setShowConsequences] = useState(false);
  
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] to-[#252547] p-8 rounded-2xl border-2 border-red-600/50 shadow-2xl max-w-md w-full">
        {/* Dramatic Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-600/20 rounded-full flex items-center justify-center border-2 border-red-600/50">
            <span className="text-2xl">⚔️</span>
          </div>
          <h2 className="text-2xl font-bold text-red-400 mb-2">
            Final Decision
          </h2>
          <p className="text-gray-400">
            Are you certain of your choice?
          </p>
        </div>
        
        {/* Target Display */}
        <div className="bg-gray-900/50 p-6 rounded-xl border border-red-600/30 mb-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center text-xl border-2 border-red-600/50">
              {target.avatar}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                {target.name}
              </h3>
              <p className="text-sm text-gray-400">
                Selected Target
              </p>
            </div>
          </div>
          
          {/* Suspicion Level */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Suspicion Level</span>
              <span className="text-sm font-semibold text-red-400">
                {target.behavior.suspicionLevel}/5
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-red-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(target.behavior.suspicionLevel / 5) * 100}%` }}
              />
            </div>
          </div>
          
          {/* Top Hint */}
          {target.hints.length > 0 && target.hints[0] && (
            <div className="bg-red-900/20 p-3 rounded-lg border border-red-600/30">
              <p className="text-sm text-red-300">
                <strong>Key Insight:</strong> {target.hints[0].description}
              </p>
            </div>
          )}
        </div>
        
        {/* Consequences Warning */}
        <div className="mb-6">
          <button
            onClick={() => setShowConsequences(!showConsequences)}
            className="w-full text-left p-4 bg-amber-900/20 rounded-xl border border-amber-600/30 hover:bg-amber-900/30 transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <span className="text-amber-400 font-medium">
                ⚠️ Understand the Consequences
              </span>
              <span className="text-amber-400">
                {showConsequences ? '▲' : '▼'}
              </span>
            </div>
          </button>
          
          {showConsequences && (
            <div className="mt-3 p-4 bg-amber-900/10 rounded-lg border border-amber-600/20">
              <div className="space-y-3 text-sm">
                <div className="flex items-start space-x-2">
                  <span className="text-green-400">✓</span>
                  <p className="text-gray-300">
                    <strong>If {target.name} is Merlin:</strong> Evil wins the game immediately
                  </p>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-red-400">✗</span>
                  <p className="text-gray-300">
                    <strong>If {target.name} is not Merlin:</strong> Good wins the game
                  </p>
                </div>
                <div className="pt-2 border-t border-amber-600/20">
                  <p className="text-amber-400 font-medium">
                    This decision is final and cannot be undone.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="flex space-x-4">
          <button
            onClick={onCancel}
            disabled={isProcessing}
            className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all duration-200 border border-gray-600"
          >
            Choose Different Target
          </button>
          <button
            onClick={onConfirm}
            disabled={isProcessing}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all duration-200 border border-red-500/50 shadow-lg shadow-red-500/20"
          >
            {isProcessing ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Processing...</span>
              </div>
            ) : (
              'Confirm Assassination'
            )}
          </button>
        </div>
        
        {/* Atmospheric Effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1/2 h-1/2 bg-red-600/10 rounded-full blur-3xl" />
          <div className="absolute inset-0 rounded-2xl border border-red-600/30 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
