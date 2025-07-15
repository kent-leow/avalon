import type { MissionContext } from '~/types/mission-execution';

interface MissionContextPanelProps {
  context: MissionContext;
  className?: string;
}

export default function MissionContextPanel({ context, className = '' }: MissionContextPanelProps) {
  const getStakesColor = (stakes: MissionContext['stakes']) => {
    switch (stakes) {
      case 'low': return 'text-blue-400';
      case 'medium': return 'text-yellow-400';
      case 'high': return 'text-orange-400';
      case 'critical': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStakesIcon = (stakes: MissionContext['stakes']) => {
    switch (stakes) {
      case 'low': return '🏃';
      case 'medium': return '⚡';
      case 'high': return '🔥';
      case 'critical': return '💥';
      default: return '⚔️';
    }
  };

  return (
    <div className={`bg-[#252547]/90 backdrop-blur-sm border border-[#3b4171]/30 rounded-lg p-6 ${className}`}>
      {/* Mission Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-[#3b82f6] to-[#1e40af] rounded-full flex items-center justify-center text-white font-bold text-lg">
            {context.missionNumber}
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">
              Mission {context.missionNumber}
            </h3>
            <p className="text-gray-400 text-sm">
              {context.missionNumber} of {context.totalMissions}
            </p>
          </div>
        </div>
        
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full bg-black/20 ${getStakesColor(context.stakes)}`}>
          <span className="text-lg">{getStakesIcon(context.stakes)}</span>
          <span className="font-semibold capitalize">{context.stakes}</span>
        </div>
      </div>

      {/* Mission Description */}
      <div className="mb-4">
        <p className="text-gray-300 leading-relaxed">
          {context.missionDescription}
        </p>
      </div>

      {/* Failure Requirements */}
      {context.requiresTwoFails && (
        <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
          <div className="flex items-center gap-2 text-amber-400">
            <span className="text-lg">⚠️</span>
            <span className="font-semibold">Special Rule:</span>
          </div>
          <p className="text-amber-300 text-sm mt-1">
            This mission requires {context.failVotesRequired} failure votes to fail.
          </p>
        </div>
      )}

      {/* Consequences */}
      <div className="p-3 bg-black/20 border border-gray-600/30 rounded-lg">
        <div className="flex items-center gap-2 text-gray-300 mb-2">
          <span className="text-lg">🎯</span>
          <span className="font-semibold">Mission Stakes:</span>
        </div>
        <p className="text-gray-400 text-sm">
          {context.consequenceDescription}
        </p>
      </div>
    </div>
  );
}
