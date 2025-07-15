"use client";

import { useState } from "react";
import RoleRevealScreen from "./RoleRevealScreen";
import { mockRoleKnowledge } from "~/lib/role-knowledge";
import { type Role } from "~/types/roles";

// Mock roles for demonstration
const mockRoles: Role[] = [
  {
    id: 'merlin',
    name: 'Merlin',
    team: 'good',
    description: 'You know the servants of Mordred, but they must not discover you.',
    abilities: ['See evil players (except Mordred)'],
    seesEvil: true,
    seenByMerlin: false,
    isAssassin: false
  },
  {
    id: 'percival',
    name: 'Percival',
    team: 'good',
    description: 'You see Merlin and Morgana, but cannot tell them apart.',
    abilities: ['See Merlin and Morgana'],
    seesEvil: false,
    seenByMerlin: false,
    isAssassin: false
  },
  {
    id: 'assassin',
    name: 'Assassin',
    team: 'evil',
    description: 'You know your evil allies and must kill Merlin if good wins.',
    abilities: ['Kill Merlin', 'See evil players'],
    seesEvil: true,
    seenByMerlin: true,
    isAssassin: true
  },
  {
    id: 'servant',
    name: 'Loyal Servant of Arthur',
    team: 'good',
    description: 'You serve Arthur faithfully with no special knowledge.',
    abilities: [],
    seesEvil: false,
    seenByMerlin: false,
    isAssassin: false
  }
];

export default function RoleRevealDemo() {
  const [selectedRole, setSelectedRole] = useState<Role>(mockRoles[0]!);
  const [showScreen, setShowScreen] = useState(false);

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    setShowScreen(true);
  };

  const handleContinue = () => {
    setShowScreen(false);
  };

  if (showScreen) {
    return (
      <RoleRevealScreen
        playerId="demo-player"
        roomId="demo-room"
        playerName="Demo Player"
        playerRole={selectedRole}
        knownPlayers={mockRoleKnowledge.knownPlayers}
        timeRemaining={30}
        onContinue={handleContinue}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] to-[#252547] p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent mb-2">
            Role Reveal Demo
          </h1>
          <p className="text-slate-300">
            Experience the mystical role revelation interface
          </p>
        </div>

        <div className="bg-[#1a1a2e]/50 backdrop-blur-sm rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Implementation Status</h2>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-slate-300">PlayerRoleCard with mystical design</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-slate-300">KnownPlayersGrid with knowledge visualization</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-slate-300">RoleRevealTimer with countdown</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-slate-300">ContinueButton with magical effects</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-slate-300">Cinematic animations and transitions</span>
            </div>
          </div>
        </div>

        <div className="bg-[#252547]/80 backdrop-blur-sm rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Select a Role to Experience</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockRoles.map((role) => (
              <button
                key={role.id}
                onClick={() => handleRoleSelect(role)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
                  role.team === 'good' 
                    ? 'border-green-500/30 bg-green-500/10 hover:border-green-500/50' 
                    : 'border-red-500/30 bg-red-500/10 hover:border-red-500/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${role.team === 'good' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <div className="text-left">
                    <div className="font-semibold text-white">{role.name}</div>
                    <div className="text-sm text-slate-300">{role.team === 'good' ? 'Servant of Arthur' : 'Servant of Mordred'}</div>
                  </div>
                </div>
                <p className="text-sm text-slate-400 mt-2 text-left">
                  {role.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 bg-[#1a1a2e]/50 backdrop-blur-sm rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Features</h2>
          <div className="space-y-3 text-sm text-slate-300">
            <p>• <strong>Mystical Design:</strong> Immersive fantasy theming with magical particles</p>
            <p>• <strong>Role-Specific Knowledge:</strong> Display what each role knows about others</p>
            <p>• <strong>Team Indicators:</strong> Clear visual distinction between good and evil</p>
            <p>• <strong>Interactive Timer:</strong> Countdown with progress ring and color changes</p>
            <p>• <strong>Cinematic Reveal:</strong> Smooth animations and transitions</p>
            <p>• <strong>Responsive Design:</strong> Works perfectly on all screen sizes</p>
          </div>
        </div>
      </div>
    </div>
  );
}
