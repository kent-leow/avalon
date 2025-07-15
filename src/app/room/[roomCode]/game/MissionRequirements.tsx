"use client";

import { type Mission } from "~/types/mission";

interface MissionRequirementsProps {
  mission: Mission;
  selectedCount: number;
  requiredCount: number;
  className?: string;
}

export default function MissionRequirements({
  mission,
  selectedCount,
  requiredCount,
  className = "",
}: MissionRequirementsProps) {
  const isComplete = selectedCount === requiredCount;
  const progressPercentage = (selectedCount / requiredCount) * 100;

  return (
    <div className={`bg-[#1a1a2e]/90 backdrop-blur-xl rounded-xl p-6 border border-slate-600/30 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">{mission.round}</span>
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Mission {mission.round}</h3>
            <p className="text-slate-300 text-sm">Strategic Quest</p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-2xl font-bold text-white tabular-nums">
            {selectedCount} / {requiredCount}
          </div>
          <div className="text-sm text-slate-400">Players Selected</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-300">Team Assembly Progress</span>
          <span className="text-sm font-bold text-white tabular-nums">{Math.round(progressPercentage)}%</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ease-out ${
              isComplete
                ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                : 'bg-gradient-to-r from-purple-500 to-pink-500'
            }`}
            style={{ width: `${progressPercentage}%` }}
          >
            <div className="h-full w-full bg-white/20 animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Mission Details */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#252547]/60 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-medium text-slate-300">Required Players</span>
            </div>
            <div className="text-2xl font-bold text-white">{requiredCount}</div>
          </div>
          
          <div className="bg-[#252547]/60 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-sm font-medium text-slate-300">Fails Required</span>
            </div>
            <div className="text-2xl font-bold text-white">{mission.failsRequired}</div>
          </div>
        </div>

        {/* Mission Description */}
        <div className="bg-[#252547]/40 rounded-lg p-4">
          <p className="text-slate-300 leading-relaxed">{mission.description}</p>
        </div>

        {/* Special Rules */}
        {mission.specialRules && mission.specialRules.length > 0 && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
              <span className="text-sm font-medium text-amber-400">Special Rules</span>
            </div>
            <ul className="space-y-1">
              {mission.specialRules.map((rule, index) => (
                <li key={index} className="text-sm text-amber-300 flex items-center gap-2">
                  <div className="w-1 h-1 bg-amber-400 rounded-full"></div>
                  {rule}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Status Indicator */}
        <div className="flex items-center justify-center pt-2">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
            isComplete
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              isComplete ? 'bg-green-500' : 'bg-purple-500 animate-pulse'
            }`}></div>
            <span className="text-sm font-medium">
              {isComplete ? 'Team Complete' : 'Selecting Team'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
