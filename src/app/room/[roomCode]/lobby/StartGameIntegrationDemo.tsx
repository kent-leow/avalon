"use client";

import { useState } from "react";
import StartGameSection from "./StartGameSection";

export default function StartGameIntegrationDemo() {
  const [mockRoomId] = useState("cm7q9rk2s000008l29pqxehjk"); // Mock room ID
  const [mockRoomCode] = useState("TEST123"); // Mock room code

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#252547] p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent mb-2">
            Start Game Integration Demo
          </h1>
          <p className="text-slate-300">
            Integrated Start Game feature with real tRPC API calls
          </p>
        </div>

        <div className="bg-[#1a1a2e]/50 backdrop-blur-sm rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Integration Status</h2>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-slate-300">Real tRPC API Integration</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-slate-300">Real-time Game State Updates</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-slate-300">Player Ready Status Management</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-slate-300">Game Start Validation</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-slate-300">Error Handling & Loading States</span>
            </div>
          </div>
        </div>

        <StartGameSection
          roomId={mockRoomId}
          roomCode={mockRoomCode}
        />

        <div className="mt-8 bg-[#1a1a2e]/50 backdrop-blur-sm rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Usage Instructions</h2>
          <div className="space-y-3 text-sm text-slate-300">
            <p>1. <strong>For Host:</strong> Check requirements and click "Start Game" when ready</p>
            <p>2. <strong>For Players:</strong> Click "Mark as Ready" to indicate you're ready to start</p>
            <p>3. <strong>Real-time Updates:</strong> All players see live updates of game state</p>
            <p>4. <strong>Validation:</strong> Game can only start when all requirements are met</p>
            <p>5. <strong>Error Handling:</strong> Clear error messages for failed operations</p>
          </div>
        </div>
      </div>
    </div>
  );
}
