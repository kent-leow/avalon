"use client";

import { useState } from "react";

interface SubmitTeamButtonProps {
  onSubmit: () => void;
  disabled: boolean;
  isSubmitting: boolean;
  className?: string;
}

export default function SubmitTeamButton({
  onSubmit,
  disabled,
  isSubmitting,
  className = "",
}: SubmitTeamButtonProps) {
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = () => {
    if (disabled || isSubmitting) return;
    
    setIsClicked(true);
    onSubmit();
    
    // Reset animation state after delay
    setTimeout(() => setIsClicked(false), 500);
  };

  const getButtonText = () => {
    if (isSubmitting) return "Submitting Team...";
    if (disabled) return "Complete Team Selection";
    return "Submit Team Proposal";
  };

  const getButtonStyles = () => {
    let baseStyles = "relative w-full px-8 py-4 text-lg font-bold rounded-xl transition-all duration-300 ease-out transform ";
    
    if (disabled) {
      baseStyles += "bg-gray-600 text-gray-300 cursor-not-allowed opacity-60 ";
    } else if (isSubmitting) {
      baseStyles += "bg-gradient-to-r from-purple-600 to-pink-600 text-white cursor-wait ";
    } else {
      baseStyles += "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-2xl hover:scale-105 active:scale-95 cursor-pointer ";
    }
    
    if (isClicked) {
      baseStyles += "animate-pulse ";
    }
    
    return baseStyles;
  };

  return (
    <div className={`${className}`}>
      <button
        onClick={handleClick}
        disabled={disabled || isSubmitting}
        className={getButtonStyles()}
        data-testid="submit-team-button"
      >
        {/* Button Background Effects */}
        {!disabled && !isSubmitting && (
          <div className="absolute inset-0 rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-300">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl"></div>
          </div>
        )}
        
        {/* Loading Spinner */}
        {isSubmitting && (
          <div className="absolute left-6 top-1/2 transform -translate-y-1/2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        
        {/* Button Text */}
        <span className={`relative z-10 tracking-wide uppercase ${isSubmitting ? 'ml-8' : ''}`}>
          {getButtonText()}
        </span>
        
        {/* Success Animation (for future use) */}
        {!disabled && !isSubmitting && (
          <div className="absolute right-6 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-5 h-5 text-white">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        )}
        
        {/* Magical Particle Effects */}
        {!disabled && !isSubmitting && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
            <div className="absolute top-2 left-8 w-1 h-1 bg-purple-200 rounded-full animate-pulse opacity-70"></div>
            <div className="absolute top-4 right-12 w-1 h-1 bg-pink-200 rounded-full animate-bounce opacity-60"></div>
            <div className="absolute bottom-3 left-16 w-1 h-1 bg-blue-200 rounded-full animate-pulse opacity-80"></div>
          </div>
        )}
        
        {/* Hover Shimmer Effect */}
        {!disabled && !isSubmitting && (
          <div className="absolute inset-0 rounded-xl overflow-hidden">
            <div className="absolute -top-2 -left-2 w-6 h-6 bg-white/20 rounded-full transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
          </div>
        )}
      </button>
      
      {/* Button Description */}
      <div className="mt-3 text-center">
        <p className="text-sm text-slate-400">
          {disabled 
            ? "Complete your team selection to proceed"
            : isSubmitting
            ? "Processing your team proposal..."
            : "Send your team proposal for voting"
          }
        </p>
      </div>
    </div>
  );
}
