/**
 * Host Management Integration
 * Real API integration for host management features
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Crown, Settings, AlertTriangle, Loader2 } from 'lucide-react';
import { api } from '~/trpc/react';
import HostManagementPanel from './HostManagementPanel';
import HostActionConfirmation from './HostActionConfirmation';
import HostTransferInterface from './HostTransferInterface';
import EmergencyProtocols from './EmergencyProtocols';
import { createHostAction } from '~/lib/host-management-utils';
import type { 
  HostManagement, 
  HostAction,
  HostActionType,
  PlayerManagement,
  RoomSettings,
  EmergencyType,
  EmergencyState
} from '~/types/host-management';

interface HostManagementIntegrationProps {
  roomId: string;
  hostId: string;
  className?: string;
}

export default function HostManagementIntegration({
  roomId,
  hostId,
  className = ''
}: HostManagementIntegrationProps) {
  const router = useRouter();
  const [showPanel, setShowPanel] = useState(false);
  const [confirmationAction, setConfirmationAction] = useState<HostAction | null>(null);
  const [emergencyState, setEmergencyState] = useState<EmergencyState | null>(null);
  const [isExecutingAction, setIsExecutingAction] = useState(false);

  // API queries
  const { 
    data: hostData, 
    isLoading: isLoadingHost, 
    error: hostError,
    refetch: refetchHostData 
  } = api.room.getHostManagement.useQuery(
    { roomId, hostId },
    { 
      refetchInterval: 2000, // Poll every 2 seconds
      enabled: !!roomId && !!hostId 
    }
  );

  const { 
    data: activityData, 
    isLoading: isLoadingActivity 
  } = api.room.getActivityLog.useQuery(
    { roomId, limit: 50 },
    { 
      refetchInterval: 5000, // Poll every 5 seconds
      enabled: !!roomId 
    }
  );

  // API mutations
  const executeActionMutation = api.room.executeHostAction.useMutation({
    onSuccess: (data) => {
      console.log('Host action executed successfully:', data);
      refetchHostData();
    },
    onError: (error) => {
      console.error('Failed to execute host action:', error);
    },
  });

  const initiateTransferMutation = api.room.initiateHostTransfer.useMutation({
    onSuccess: (data) => {
      console.log('Host transfer initiated:', data);
      refetchHostData();
    },
    onError: (error) => {
      console.error('Failed to initiate host transfer:', error);
    },
  });

  const triggerEmergencyMutation = api.room.triggerEmergencyProtocol.useMutation({
    onSuccess: (data) => {
      console.log('Emergency protocol triggered:', data);
      setEmergencyState(data.emergencyState);
      refetchHostData();
    },
    onError: (error) => {
      console.error('Failed to trigger emergency protocol:', error);
    },
  });

  const resolveEmergencyMutation = api.room.resolveEmergency.useMutation({
    onSuccess: (data) => {
      console.log('Emergency resolved:', data);
      setEmergencyState(null);
      refetchHostData();
    },
    onError: (error) => {
      console.error('Failed to resolve emergency:', error);
    },
  });

  // Handle host actions
  const handleHostAction = (actionType: HostActionType, targetId?: string, reason?: string) => {
    const action = createHostAction(actionType, hostId, targetId, { reason });
    
    if (action.requiresConfirmation) {
      setConfirmationAction(action);
    } else {
      executeAction(action);
    }
  };

  // Execute confirmed action
  const executeAction = async (action: HostAction) => {
    setIsExecutingAction(true);
    
    try {
      await executeActionMutation.mutateAsync({
        roomId,
        hostId,
        actionType: action.type,
        targetId: action.targetId,
        reason: action.details.reason,
        duration: action.details.duration,
      });
      
      setConfirmationAction(null);
      
      // Handle special actions
      if (action.type === 'end_game') {
        router.push(`/room/${roomId}/results`);
      } else if (action.type === 'reset_room') {
        router.push(`/room/${roomId}/lobby`);
      }
    } catch (error) {
      console.error('Failed to execute action:', error);
    } finally {
      setIsExecutingAction(false);
    }
  };

  // Handle host transfer
  const handleHostTransfer = async (toPlayerId: string, reason?: string) => {
    try {
      await initiateTransferMutation.mutateAsync({
        roomId,
        fromHostId: hostId,
        toPlayerId,
        reason,
      });
    } catch (error) {
      console.error('Failed to initiate host transfer:', error);
    }
  };

  // Handle emergency protocols
  const handleTriggerEmergency = async (type: EmergencyType, description?: string) => {
    try {
      await triggerEmergencyMutation.mutateAsync({
        roomId,
        hostId,
        type,
        description,
      });
    } catch (error) {
      console.error('Failed to trigger emergency:', error);
    }
  };

  const handleResolveEmergency = async (resolution: string) => {
    if (!emergencyState) return;
    
    try {
      await resolveEmergencyMutation.mutateAsync({
        roomId,
        hostId,
        emergencyId: 'temp_id', // Would be real ID in production
        resolution,
      });
    } catch (error) {
      console.error('Failed to resolve emergency:', error);
    }
  };

  const handleExecuteEmergencyAction = (action: HostActionType) => {
    handleHostAction(action);
  };

  // Loading state
  if (isLoadingHost) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center">
          <Loader2 size={32} className="animate-spin text-amber-500 mx-auto mb-4" />
          <p className="text-gray-400">Loading host management...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (hostError) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center">
          <AlertTriangle size={32} className="text-red-500 mx-auto mb-4" />
          <p className="text-red-400 mb-4">Failed to load host management</p>
          <button
            onClick={() => refetchHostData()}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // No host data
  if (!hostData) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center">
          <Crown size={32} className="text-amber-500 mx-auto mb-4" />
          <p className="text-gray-400">Host management not available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Host Panel Toggle */}
      <button
        onClick={() => setShowPanel(true)}
        className="fixed top-4 right-4 z-40 flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg shadow-lg transition-colors"
      >
        <Crown size={16} />
        Host Panel
      </button>

      {/* Host Management Panel */}
      {showPanel && (
        <HostManagementPanel
          hostManagement={hostData.hostManagement}
          onClose={() => setShowPanel(false)}
        />
      )}

      {/* Action Confirmation Dialog */}
      {confirmationAction && (
        <HostActionConfirmation
          action={confirmationAction}
          isOpen={true}
          onConfirm={() => executeAction(confirmationAction)}
          onCancel={() => setConfirmationAction(null)}
          isLoading={isExecutingAction}
        />
      )}

      {/* Emergency Protocols */}
      {emergencyState && (
        <div className="fixed bottom-4 right-4 z-50">
          <EmergencyProtocols
            emergencyState={emergencyState}
            onTriggerEmergency={handleTriggerEmergency}
            onResolveEmergency={handleResolveEmergency}
            onExecuteAction={handleExecuteEmergencyAction}
            className="w-96"
          />
        </div>
      )}

      {/* Status Indicators */}
      <div className="fixed top-4 left-4 z-40 space-y-2">
        {/* Host Status */}
        <div className="flex items-center gap-2 px-3 py-2 bg-[#0a0a0f]/95 backdrop-blur-sm border border-[#252547]/50 rounded-lg">
          <Crown size={14} className="text-amber-500" />
          <span className="text-sm text-white">Host: {hostData.hostManagement.hostName}</span>
        </div>

        {/* Player Count */}
        <div className="flex items-center gap-2 px-3 py-2 bg-[#0a0a0f]/95 backdrop-blur-sm border border-[#252547]/50 rounded-lg">
          <Settings size={14} className="text-blue-500" />
          <span className="text-sm text-white">
            {hostData.roomSettings.currentPlayers}/{hostData.roomSettings.maxPlayers} players
          </span>
        </div>

        {/* Emergency Status */}
        {emergencyState?.active && (
          <div className="flex items-center gap-2 px-3 py-2 bg-red-500/20 border border-red-500/50 rounded-lg">
            <AlertTriangle size={14} className="text-red-500 animate-pulse" />
            <span className="text-sm text-red-400">Emergency Active</span>
          </div>
        )}
      </div>
    </div>
  );
}

// Demo Integration Component
export function HostManagementIntegrationDemo() {
  const [selectedRoom, setSelectedRoom] = useState<string>('');
  const [selectedHost, setSelectedHost] = useState<string>('');

  // Mock room data for demo
  const mockRooms = [
    { id: 'room_001', code: 'DEMO123', name: 'Demo Room 1' },
    { id: 'room_002', code: 'TEST456', name: 'Demo Room 2' },
  ];

  const mockHosts = [
    { id: 'host_001', name: 'Alex (Host)' },
    { id: 'host_002', name: 'Sarah (Host)' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4 flex items-center gap-3">
            <Crown size={32} className="text-amber-500" />
            Host Management Integration Demo
          </h1>
          <p className="text-gray-300">
            Real-time host management with backend integration
          </p>
        </div>

        {/* Demo Controls */}
        <div className="bg-[#1a1a2e] rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Demo Setup</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Select Room
              </label>
              <select
                value={selectedRoom}
                onChange={(e) => setSelectedRoom(e.target.value)}
                className="w-full px-3 py-2 bg-[#0a0a0f] border border-[#252547] rounded-lg text-white"
              >
                <option value="">Select a room...</option>
                {mockRooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.code} - {room.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Select Host
              </label>
              <select
                value={selectedHost}
                onChange={(e) => setSelectedHost(e.target.value)}
                className="w-full px-3 py-2 bg-[#0a0a0f] border border-[#252547] rounded-lg text-white"
              >
                <option value="">Select a host...</option>
                {mockHosts.map((host) => (
                  <option key={host.id} value={host.id}>
                    {host.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Integration Component */}
        {selectedRoom && selectedHost && (
          <HostManagementIntegration
            roomId={selectedRoom}
            hostId={selectedHost}
            className="relative"
          />
        )}

        {/* Instructions */}
        <div className="bg-[#1a1a2e] rounded-lg p-6 mt-8">
          <h3 className="text-lg font-semibold mb-4">Integration Features</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>• Real-time host management data fetching</li>
            <li>• Live player management and monitoring</li>
            <li>• Host action execution with confirmation</li>
            <li>• Emergency protocol handling</li>
            <li>• Activity log integration</li>
            <li>• Error handling and retry mechanisms</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
