import React from 'react';
import { GameResultsIntegration } from '~/components/features/game-results/GameResultsIntegration';

export default function GameResultsIntegrationPage() {
  return (
    <div className="min-h-screen bg-slate-900">
      <GameResultsIntegration
        roomCode="DEMO"
        gameId="demo-game-123"
      />
    </div>
  );
}
