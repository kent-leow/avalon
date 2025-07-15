"use client";

import { useState } from "react";
import { type VoteChoice } from "~/types/voting";

interface VotingInterfaceProps {
  currentVote?: VoteChoice;
  canChangeVote: boolean;
  onVote: (choice: VoteChoice) => void;
  isSubmitting: boolean;
  timeRemaining: number;
}

export default function VotingInterface({
  currentVote,
  canChangeVote,
  onVote,
  isSubmitting,
  timeRemaining,
}: VotingInterfaceProps) {
  const [selectedChoice, setSelectedChoice] = useState<VoteChoice | null>(currentVote || null);

  const handleVoteClick = (choice: VoteChoice) => {
    if (isSubmitting) return;
    
    if (currentVote && !canChangeVote) {
      return; // Cannot change vote
    }

    setSelectedChoice(choice);
    onVote(choice);
  };

  const getButtonState = (choice: VoteChoice) => {
    const isSelected = selectedChoice === choice;
    const isCurrentVote = currentVote === choice;
    const isDisabled = isSubmitting || (currentVote && !canChangeVote && !isCurrentVote);

    return {
      isSelected,
      isCurrentVote,
      isDisabled,
    };
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isUrgent = timeRemaining <= 10;

  return (
    <div className="flex flex-col items-center space-y-8">
      {/* Countdown timer */}
      <div className="text-center">
        <div className={`text-6xl font-bold mb-2 transition-colors duration-300 ${
          isUrgent ? 'text-red-400 animate-pulse' : 'text-white'
        }`}>
          {formatTime(timeRemaining)}
        </div>
        <p className={`text-sm transition-colors duration-300 ${
          isUrgent ? 'text-red-300' : 'text-slate-300'
        }`}>
          {isUrgent ? 'Time running out!' : 'Time remaining to vote'}
        </p>
      </div>

      {/* Voting buttons */}
      <div className="flex gap-8">
        {/* Approve button */}
        <button
          onClick={() => handleVoteClick('approve')}
          disabled={getButtonState('approve').isDisabled}
          className={`
            relative group w-48 h-32 rounded-2xl font-bold text-xl
            transition-all duration-300 transform hover:scale-105 active:scale-95
            ${getButtonState('approve').isCurrentVote
              ? 'bg-green-600 text-white shadow-lg shadow-green-500/50 border-2 border-green-400'
              : getButtonState('approve').isSelected
              ? 'bg-green-600 text-white shadow-lg shadow-green-500/50'
              : 'bg-green-600/80 text-white hover:bg-green-600 hover:shadow-lg hover:shadow-green-500/30'
            }
            ${getButtonState('approve').isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          {/* Button glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-green-600/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Button content */}
          <div className="relative flex flex-col items-center justify-center h-full gap-2">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span>APPROVE</span>
          </div>

          {/* Selection indicator */}
          {getButtonState('approve').isCurrentVote && (
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full border-2 border-white flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          )}
        </button>

        {/* Reject button */}
        <button
          onClick={() => handleVoteClick('reject')}
          disabled={getButtonState('reject').isDisabled}
          className={`
            relative group w-48 h-32 rounded-2xl font-bold text-xl
            transition-all duration-300 transform hover:scale-105 active:scale-95
            ${getButtonState('reject').isCurrentVote
              ? 'bg-red-600 text-white shadow-lg shadow-red-500/50 border-2 border-red-400'
              : getButtonState('reject').isSelected
              ? 'bg-red-600 text-white shadow-lg shadow-red-500/50'
              : 'bg-red-600/80 text-white hover:bg-red-600 hover:shadow-lg hover:shadow-red-500/30'
            }
            ${getButtonState('reject').isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          {/* Button glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-red-400/20 to-red-600/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Button content */}
          <div className="relative flex flex-col items-center justify-center h-full gap-2">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <span>REJECT</span>
          </div>

          {/* Selection indicator */}
          {getButtonState('reject').isCurrentVote && (
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-400 rounded-full border-2 border-white flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          )}
        </button>
      </div>

      {/* Vote status */}
      {currentVote && (
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-green-400 font-medium">
              Your vote: {currentVote.toUpperCase()}
            </span>
          </div>
          {canChangeVote && (
            <p className="text-slate-400 text-sm">
              You can change your vote until the deadline
            </p>
          )}
        </div>
      )}

      {/* Loading state */}
      {isSubmitting && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center rounded-2xl">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white text-lg font-medium">Submitting vote...</p>
          </div>
        </div>
      )}
    </div>
  );
}
