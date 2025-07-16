/**
 * Host Management Demo
 * Interactive demonstration of all host management features
 */

'use client';

import { useState } from 'react';
import { Crown, Settings, Users, Activity, BarChart3, Shield, AlertTriangle } from 'lucide-react';
import HostManagementPanel from './HostManagementPanel';
import HostActionConfirmation from './HostActionConfirmation';
import HostTransferInterface, { HostTransferHistory } from './HostTransferInterface';
import EmergencyProtocols from './EmergencyProtocols';
import { createHostManagement, createHostAction } from '~/lib/host-management-utils';
import type { 
  HostManagement, 
  HostAction,
  HostTransfer,
  EmergencyState,
  EmergencyType,
  HostActionType 
} from '~/types/host-management';

export default function HostManagementDemo() {
  const [activeDemo, setActiveDemo] = useState<string>('panel');
  const [showPanel, setShowPanel] = useState(true);
  const [confirmationAction, setConfirmationAction] = useState<HostAction | null>(null);
  const [emergencyState, setEmergencyState] = useState<EmergencyState | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Mock host management data
  const mockHostManagement: HostManagement = createHostManagement(
    'DEMO123',
    'host_001',
    'Alex (Host)',
    'https://avatar.example.com/alex.jpg'
  );

  // Mock host transfer data
  const mockTransfer: HostTransfer = {
    fromHostId: 'host_001',
    toPlayerId: 'player_002',
    initiated: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
    status: 'pending',
    reason: 'Need to step away for a moment',
    expiresAt: new Date(Date.now() + 3 * 60 * 1000), // 3 minutes from now
    requiresMutualAgreement: true
  };

  const mockTransferHistory: HostTransfer[] = [
    {
      fromHostId: 'host_001',
      toPlayerId: 'player_001',
      initiated: new Date(Date.now() - 30 * 60 * 1000),
      status: 'accepted',
      expiresAt: new Date(Date.now() - 25 * 60 * 1000),
      requiresMutualAgreement: true
    },
    {
      fromHostId: 'host_001',
      toPlayerId: 'player_003',
      initiated: new Date(Date.now() - 60 * 60 * 1000),
      status: 'rejected',
      reason: 'Not ready to be host',
      expiresAt: new Date(Date.now() - 55 * 60 * 1000),
      requiresMutualAgreement: true
    }
  ];

  const handleHostAction = (actionType: HostActionType, targetId?: string) => {
    const action = createHostAction(actionType, mockHostManagement.hostId, targetId);
    
    if (action.requiresConfirmation) {
      setConfirmationAction(action);
    } else {
      executeAction(action);
    }
  };

  const executeAction = async (action: HostAction) => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('Executing host action:', action);
    
    setIsLoading(false);
    setConfirmationAction(null);
  };

  const handleTriggerEmergency = (type: EmergencyType) => {
    setEmergencyState({
      active: true,
      type,
      triggered: new Date(),
      description: `${type.replace('_', ' ')} emergency triggered`,
      autoActions: ['pause_game'],
      manualActions: ['reset_room', 'end_game'],
      resolved: false
    });
  };

  const handleResolveEmergency = (resolution: string) => {
    if (emergencyState) {
      setEmergencyState({
        ...emergencyState,
        active: false,
        resolved: true,
        resolution
      });
    }
  };

  const handleExecuteEmergencyAction = (action: HostActionType) => {
    console.log('Executing emergency action:', action);
    // In a real app, this would execute the action
  };

  const demos = [
    {
      id: 'panel',
      name: 'Host Panel',
      icon: <Crown size={16} />,
      description: 'Main host management interface'
    },
    {
      id: 'confirmation',
      name: 'Confirmations',
      icon: <Settings size={16} />,
      description: 'Action confirmation dialogs'
    },
    {
      id: 'transfer',
      name: 'Host Transfer',
      icon: <Users size={16} />,
      description: 'Transfer host privileges'
    },
    {
      id: 'emergency',
      name: 'Emergency',
      icon: <AlertTriangle size={16} />,
      description: 'Emergency protocols'
    }
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Demo Navigation */}
      <div className="border-b border-[#252547]/50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-4">
            <Crown size={24} className="text-amber-500" />
            <h1 className="text-2xl font-bold">Host Management Demo</h1>
          </div>
          
          <div className="flex gap-2">
            {demos.map((demo) => (
              <button
                key={demo.id}
                onClick={() => setActiveDemo(demo.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  activeDemo === demo.id
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-[#1a1a2e] text-gray-400 hover:text-white'
                }`}
              >
                {demo.icon}
                <span className="text-sm">{demo.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Demo Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {activeDemo === 'panel' && (
          <div className="space-y-6">
            <div className="bg-[#1a1a2e] rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Host Management Panel</h2>
              <p className="text-gray-300 mb-4">
                The main host interface provides quick access to all host functions including
                player management, room settings, activity monitoring, and analytics.
              </p>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Features:</h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>• Floating interface accessible from any screen</li>
                  <li>• Quick actions for common host tasks</li>
                  <li>• Real-time player management and monitoring</li>
                  <li>• Room settings and configuration</li>
                  <li>• Activity log and transparency</li>
                  <li>• Game analytics and insights</li>
                </ul>
              </div>

              <div className="mt-6">
                <button
                  onClick={() => setShowPanel(true)}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
                >
                  Show Host Panel
                </button>
              </div>
            </div>

            {/* Host Panel */}
            {showPanel && (
              <HostManagementPanel
                hostManagement={mockHostManagement}
                onClose={() => setShowPanel(false)}
              />
            )}
          </div>
        )}

        {activeDemo === 'confirmation' && (
          <div className="space-y-6">
            <div className="bg-[#1a1a2e] rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Action Confirmations</h2>
              <p className="text-gray-300 mb-4">
                Critical host actions require confirmation to prevent accidental use.
                Different actions have different confirmation requirements.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => handleHostAction('kick_player', 'player_001')}
                  className="p-4 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  <div className="text-lg mb-2">🚪</div>
                  <div className="font-medium">Kick Player</div>
                  <div className="text-sm opacity-75">Requires confirmation</div>
                </button>
                
                <button
                  onClick={() => handleHostAction('reset_room')}
                  className="p-4 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
                >
                  <div className="text-lg mb-2">🔄</div>
                  <div className="font-medium">Reset Room</div>
                  <div className="text-sm opacity-75">Requires typing confirmation</div>
                </button>
                
                <button
                  onClick={() => handleHostAction('mute_player', 'player_002')}
                  className="p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <div className="text-lg mb-2">🔇</div>
                  <div className="font-medium">Mute Player</div>
                  <div className="text-sm opacity-75">Temporary action</div>
                </button>
                
                <button
                  onClick={() => handleHostAction('end_game')}
                  className="p-4 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  <div className="text-lg mb-2">🛑</div>
                  <div className="font-medium">End Game</div>
                  <div className="text-sm opacity-75">Requires typing confirmation</div>
                </button>
              </div>
            </div>

            {/* Confirmation Dialog */}
            {confirmationAction && (
              <HostActionConfirmation
                action={confirmationAction}
                isOpen={true}
                onConfirm={() => executeAction(confirmationAction)}
                onCancel={() => setConfirmationAction(null)}
                isLoading={isLoading}
              />
            )}
          </div>
        )}

        {activeDemo === 'transfer' && (
          <div className="space-y-6">
            <div className="bg-[#1a1a2e] rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Host Transfer</h2>
              <p className="text-gray-300 mb-4">
                Secure host transfer system allows hosts to transfer privileges to other players.
                Transfers require mutual agreement and have expiration times.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Active Transfer</h3>
                <HostTransferInterface
                  transfer={mockTransfer}
                  currentHostName="Alex (Host)"
                  targetPlayerName="Sarah"
                  onAccept={() => console.log('Transfer accepted')}
                  onReject={() => console.log('Transfer rejected')}
                  onCancel={() => console.log('Transfer cancelled')}
                  isCurrentHost={true}
                  isTargetPlayer={false}
                />
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4">Transfer History</h3>
                <HostTransferHistory transfers={mockTransferHistory} />
              </div>
            </div>
          </div>
        )}

        {activeDemo === 'emergency' && (
          <div className="space-y-6">
            <div className="bg-[#1a1a2e] rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Emergency Protocols</h2>
              <p className="text-gray-300 mb-4">
                Emergency protocols help hosts handle critical situations that require
                immediate action to maintain game integrity and player experience.
              </p>
            </div>

            <EmergencyProtocols
              emergencyState={emergencyState}
              onTriggerEmergency={handleTriggerEmergency}
              onResolveEmergency={handleResolveEmergency}
              onExecuteAction={handleExecuteEmergencyAction}
            />
          </div>
        )}
      </div>
    </div>
  );
}
