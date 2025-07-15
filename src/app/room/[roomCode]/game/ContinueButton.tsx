"use client";

import { useState } from "react";

interface ContinueButtonProps {
  onContinue: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  hasConfirmed?: boolean;
  className?: string;
}

export default function ContinueButton({
  onContinue,
  disabled = false,
  isLoading = false,
  hasConfirmed = false,
  className = "",
}: ContinueButtonProps) {
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = () => {
    if (disabled || isLoading || hasConfirmed) return;
    
    setIsClicked(true);
    onContinue();
    
    // Reset animation state after delay
    setTimeout(() => setIsClicked(false), 300);
  };

  const getButtonText = () => {
    if (hasConfirmed) return "Waiting for others...";
    if (isLoading) return "Processing...";
    return "Continue";
  };

  const isButtonDisabled = disabled || isLoading || hasConfirmed;

  return (
    <div className={`flex justify-center ${className}`}>
      <button
        onClick={handleClick}
        disabled={isButtonDisabled}
        className={`
          relative px-8 py-4 text-lg font-semibold rounded-xl
          transition-all duration-300 ease-out
          ${
            isButtonDisabled
              ? 'bg-gray-500 opacity-50 cursor-not-allowed text-gray-300'
              : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-2xl hover:scale-105 active:scale-95'
          }
          ${isClicked ? 'animate-pulse' : ''}
        `}
        data-testid="continue-button"
      >
        {/* Button glow effect */}
        {!isButtonDisabled && (
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 hover:opacity-20 transition-opacity duration-300"></div>
        )}

        {/* Magical particle effects */}
        {!isButtonDisabled && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1 left-4 w-1 h-1 bg-purple-200 rounded-full animate-pulse opacity-70"></div>
            <div className="absolute top-3 right-6 w-1 h-1 bg-pink-200 rounded-full animate-bounce opacity-60"></div>
            <div className="absolute bottom-2 left-8 w-1 h-1 bg-blue-200 rounded-full animate-pulse opacity-80"></div>
          </div>
        )}

        <span className="relative z-10 tracking-wide flex items-center gap-2">
          {isLoading && (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          )}
          {getButtonText()}
        </span>

        {/* Hover shimmer effect */}
        {!isButtonDisabled && (
          <div className="absolute inset-0 rounded-xl overflow-hidden">
            <div className="absolute -top-2 -left-2 w-6 h-6 bg-white/20 rounded-full transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
          </div>
        )}
      </button>
    </div>
  );
}
