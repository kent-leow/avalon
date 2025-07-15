"use client";

import { type GameStartStatus } from "~/types/game-state";

interface GameStartStatusProps {
  status: GameStartStatus;
  className?: string;
}

export default function GameStartStatus({
  status,
  className = "",
}: GameStartStatusProps) {
  if (status.status === 'idle') {
    return null;
  }

  return (
    <div 
      className={`fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 ${className}`}
      data-testid="game-start-status"
    >
      <div className="bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#252547] rounded-2xl p-8 max-w-md w-full mx-4 border border-[#2d2d5f]/30">
        <div className="text-center">
          {/* Progress Circle */}
          <div className="relative w-24 h-24 mx-auto mb-6">
            <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-[#2d2d5f]"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                className={`transition-all duration-500 ease-out ${
                  status.status === 'error' ? 'text-[#ef4444]' : 'text-[#3b82f6]'
                }`}
                style={{
                  strokeDasharray: `${2 * Math.PI * 45}`,
                  strokeDashoffset: `${2 * Math.PI * 45 * (1 - status.progress / 100)}`,
                }}
              />
            </svg>
            
            <div className="absolute inset-0 flex items-center justify-center">
              {status.status === 'error' ? (
                <svg className="w-8 h-8 text-[#ef4444]" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : status.status === 'complete' ? (
                <svg className="w-8 h-8 text-[#22c55e]" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <div className="text-2xl font-mono font-bold text-white tabular-nums">
                  {Math.round(status.progress)}%
                </div>
              )}
            </div>
          </div>

          {/* Status Message */}
          <div className="mb-4">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent mb-2">
              {status.status === 'starting' && 'Starting Game...'}
              {status.status === 'assigning-roles' && 'Assigning Roles...'}
              {status.status === 'complete' && 'Game Started!'}
              {status.status === 'error' && 'Error Starting Game'}
            </h3>
            <p className="text-base text-slate-300 leading-relaxed">
              {status.message}
            </p>
          </div>

          {/* Error Message */}
          {status.error && (
            <div className="mt-4 p-3 bg-[#ef4444]/10 border border-[#ef4444]/30 rounded-lg">
              <p className="text-sm text-[#ef4444]">
                {status.error}
              </p>
            </div>
          )}

          {/* Loading Animation */}
          {status.status === 'starting' || status.status === 'assigning-roles' ? (
            <div className="mt-6 flex justify-center">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 bg-[#3b82f6] rounded-full animate-bounce"
                    style={{
                      animationDelay: `${i * 0.1}s`,
                    }}
                  />
                ))}
              </div>
            </div>
          ) : null}

          {/* Success Animation */}
          {status.status === 'complete' && (
            <div className="mt-6">
              <div className="text-[#22c55e] text-sm font-medium">
                Redirecting to game...
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
