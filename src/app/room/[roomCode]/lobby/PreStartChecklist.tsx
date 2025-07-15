"use client";

import { type StartRequirement } from "~/types/game-state";

interface PreStartChecklistProps {
  playerCount: number;
  minPlayers: number;
  settingsValid: boolean;
  allPlayersReady: boolean;
  requirements: StartRequirement[];
  className?: string;
}

export default function PreStartChecklist({
  playerCount,
  minPlayers,
  settingsValid,
  allPlayersReady,
  requirements,
  className = "",
}: PreStartChecklistProps) {
  return (
    <div 
      className={`bg-[#252547] backdrop-blur-sm rounded-xl p-6 border border-[#2d2d5f]/30 ${className}`}
      data-testid="pre-start-checklist"
    >
      <div className="mb-4">
        <h3 className="text-xl font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent mb-2">
          Game Start Requirements
        </h3>
        <div className="h-2 bg-[#0f0f23] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#3b82f6] to-[#1d4ed8] transition-all duration-300 ease-out"
            style={{
              width: `${(requirements.filter(r => r.status === 'satisfied').length / requirements.length) * 100}%`,
            }}
          />
        </div>
      </div>

      <div className="space-y-3">
        {requirements.map((requirement) => (
          <div
            key={requirement.id}
            className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 ${
              requirement.status === 'satisfied'
                ? 'bg-[#22c55e]/10 border-[#22c55e]/30 text-[#22c55e]'
                : requirement.status === 'failed'
                ? 'bg-[#ef4444]/10 border-[#ef4444]/30 text-[#ef4444]'
                : 'bg-[#f59e0b]/10 border-[#f59e0b]/30 text-[#f59e0b]'
            }`}
          >
            <div className="flex-shrink-0">
              {requirement.status === 'satisfied' ? (
                <svg className="w-5 h-5 animate-bounce" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : requirement.status === 'failed' ? (
                <svg className="w-5 h-5 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg className="w-5 h-5 animate-spin" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4.44v2.83c7.03 0 12.73 5.7 12.73 12.73h2.83c0-8.59-6.97-15.56-15.56-15.56z" />
                </svg>
              )}
            </div>
            <div className="flex-1">
              <div className="font-medium">{requirement.name}</div>
              <div className="text-sm opacity-75">{requirement.description}</div>
            </div>
            {requirement.required && (
              <div className="text-xs font-medium px-2 py-1 bg-current/10 rounded">
                Required
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-[#0f0f23] rounded-lg">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-300">Progress:</span>
          <span className="font-medium text-white">
            {requirements.filter(r => r.status === 'satisfied').length} of {requirements.length} complete
          </span>
        </div>
      </div>
    </div>
  );
}
