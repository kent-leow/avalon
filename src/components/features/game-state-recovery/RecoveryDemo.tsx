/**
 * Recovery Demo Component
 * 
 * Interactive demonstration of recovery features and recovery flow testing.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Save, 
  Download, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Database,
  Users,
  Wifi,
  WifiOff,
  RefreshCw,
  Settings,
  Monitor,
  Activity
} from 'lucide-react';
import RecoveryStatusIndicator from './RecoveryStatusIndicator';
import RecoveryControlPanel from './RecoveryControlPanel';
import RecoveryNotificationSystem from './RecoveryNotificationSystem';
import type { 
  RecoveryState, 
  RecoveryConfiguration, 
  RecoveryMetrics, 
  GameStateSnapshot,
  RecoveryNotification,
  PlayerRecoveryState,
  RecoveryStatus
} from '~/types/game-state-recovery';

interface RecoveryDemoProps {
  onClose?: () => void;
}

export default function RecoveryDemo({ onClose }: RecoveryDemoProps) {
  const [demoState, setDemoState] = useState<'idle' | 'running' | 'paused'>('idle');
  const [currentScenario, setCurrentScenario] = useState<string>('basic-save');
  const [recoveryState, setRecoveryState] = useState<RecoveryState>({
    status: 'stable',
    phase: 'complete',
    progress: 100,
    currentSnapshot: null,
    availableSnapshots: [],
    playerStates: {},
    errorHistory: [],
    recoveryStartTime: null,
    lastSuccessfulSave: new Date().toISOString(),
    nextScheduledSave: new Date(Date.now() + 30000).toISOString()
  });
  const [config, setConfig] = useState<RecoveryConfiguration>({
    autoSaveInterval: 30000,
    maxSnapshots: 50,
    compressionEnabled: true,
    persistenceTypes: ['memory', 'local-storage'],
    reconnectionConfig: {
      maxAttempts: 5,
      baseDelay: 1000,
      maxDelay: 30000,
      backoffMultiplier: 2,
      jitterEnabled: true,
      gracePeriod: 5000
    },
    timeoutConfig: {
      playerTimeout: 300000,
      gamePhaseTimeout: {},
      reconnectionTimeout: 60000,
      abandonmentTimeout: 900000,
      massDisconnectionThreshold: 50,
      pauseOnMassDisconnection: true
    },
    validationConfig: {
      enableChecksums: true,
      enableStateValidation: true,
      enableActionValidation: true,
      strictMode: false,
      maxValidationRetries: 3,
      validationTimeout: 5000
    }
  });
  const [metrics, setMetrics] = useState<RecoveryMetrics>({
    totalSaves: 0,
    totalRestores: 0,
    totalReconnections: 0,
    averageSaveTime: 1200,
    averageRestoreTime: 2100,
    averageReconnectionTime: 1800,
    failureRate: 0.02,
    corruptionRate: 0.001,
    timeoutRate: 0.05,
    lastRecoveryTime: null
  });
  const [notifications, setNotifications] = useState<RecoveryNotification[]>([]);
  const [simulationSpeed, setSimulationSpeed] = useState(1);

  const scenarios = {
    'basic-save': {
      name: 'Basic Auto-Save',
      description: 'Demonstrates automatic saving functionality',
      duration: 10000,
      steps: [
        { time: 0, action: 'start', status: 'stable' as RecoveryStatus },
        { time: 3000, action: 'save', status: 'saving' as RecoveryStatus },
        { time: 5000, action: 'complete', status: 'stable' as RecoveryStatus }
      ]
    },
    'player-disconnect': {
      name: 'Player Disconnect',
      description: 'Simulates player disconnection and reconnection',
      duration: 15000,
      steps: [
        { time: 0, action: 'start', status: 'stable' as RecoveryStatus },
        { time: 2000, action: 'disconnect', status: 'stable' as RecoveryStatus },
        { time: 4000, action: 'reconnect', status: 'reconnecting' as RecoveryStatus },
        { time: 8000, action: 'complete', status: 'stable' as RecoveryStatus }
      ]
    },
    'save-failure': {
      name: 'Save Failure & Recovery',
      description: 'Demonstrates save failure handling and retry logic',
      duration: 12000,
      steps: [
        { time: 0, action: 'start', status: 'stable' as RecoveryStatus },
        { time: 2000, action: 'save', status: 'saving' as RecoveryStatus },
        { time: 4000, action: 'fail', status: 'failed' as RecoveryStatus },
        { time: 6000, action: 'retry', status: 'saving' as RecoveryStatus },
        { time: 8000, action: 'complete', status: 'stable' as RecoveryStatus }
      ]
    },
    'mass-disconnect': {
      name: 'Mass Disconnection',
      description: 'Simulates multiple players disconnecting simultaneously',
      duration: 20000,
      steps: [
        { time: 0, action: 'start', status: 'stable' as RecoveryStatus },
        { time: 3000, action: 'mass-disconnect', status: 'stable' as RecoveryStatus },
        { time: 5000, action: 'pause', status: 'stable' as RecoveryStatus },
        { time: 10000, action: 'reconnect', status: 'reconnecting' as RecoveryStatus },
        { time: 15000, action: 'complete', status: 'stable' as RecoveryStatus }
      ]
    },
    'state-corruption': {
      name: 'State Corruption',
      description: 'Demonstrates corruption detection and recovery',
      duration: 18000,
      steps: [
        { time: 0, action: 'start', status: 'stable' as RecoveryStatus },
        { time: 3000, action: 'corrupt', status: 'stable' as RecoveryStatus },
        { time: 5000, action: 'detect', status: 'recovering' as RecoveryStatus },
        { time: 10000, action: 'restore', status: 'recovering' as RecoveryStatus },
        { time: 15000, action: 'complete', status: 'stable' as RecoveryStatus }
      ]
    }
  };

  const createMockSnapshot = (id: string, createdBy: 'timer' | 'action' | 'manual'): GameStateSnapshot => {
    const playerCount = Math.floor(Math.random() * 8) + 2;
    return {
      id,
      roomCode: 'DEMO123',
      timestamp: new Date().toISOString(),
      version: 1,
      checksum: Math.random().toString(36).substring(2, 15),
      gameState: {
        phase: 'mission-proposal',
        currentMission: 1,
        playersReady: playerCount
      },
      playerStates: {},
      metadata: {
        createdBy,
        gamePhase: 'mission-proposal',
        playerCount,
        activeConnections: playerCount,
        criticalAction: false,
        validationHash: Math.random().toString(36).substring(2, 15)
      }
    };
  };

  const addNotification = useCallback((notification: Omit<RecoveryNotification, 'id' | 'timestamp'>) => {
    const newNotification: RecoveryNotification = {
      ...notification,
      id: `demo-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      timestamp: new Date().toISOString()
    };
    setNotifications(prev => [...prev, newNotification]);
  }, []);

  const runScenario = useCallback((scenarioKey: string) => {
    const scenario = scenarios[scenarioKey as keyof typeof scenarios];
    if (!scenario) return;

    setDemoState('running');
    setRecoveryState(prev => ({
      ...prev,
      status: 'stable',
      phase: 'complete',
      progress: 100,
      errorHistory: []
    }));

    let currentStep = 0;
    const runStep = () => {
      if (currentStep >= scenario.steps.length) {
        setDemoState('idle');
        addNotification({
          type: 'success',
          title: 'Scenario Complete',
          message: `Demo scenario "${scenario.name}" completed successfully`,
          dismissible: true,
          duration: 5000
        });
        return;
      }

      const step = scenario.steps[currentStep];
      if (!step) return;
      
      // Execute step action
      switch (step.action) {
        case 'start':
          addNotification({
            type: 'info',
            title: 'Scenario Started',
            message: `Running "${scenario.name}" scenario`,
            dismissible: true,
            duration: 3000
          });
          break;
          
        case 'save':
          setRecoveryState(prev => ({
            ...prev,
            status: 'saving',
            progress: 0
          }));
          addNotification({
            type: 'info',
            title: 'Auto-Save Started',
            message: 'Saving game state...',
            dismissible: false
          });
          
          // Simulate save progress
          let progress = 0;
          const saveInterval = setInterval(() => {
            progress += 20;
            setRecoveryState(prev => ({
              ...prev,
              progress: Math.min(progress, 100)
            }));
            
            if (progress >= 100) {
              clearInterval(saveInterval);
              setRecoveryState(prev => ({
                ...prev,
                status: 'stable',
                progress: 100,
                lastSuccessfulSave: new Date().toISOString(),
                availableSnapshots: [
                  ...prev.availableSnapshots,
                  createMockSnapshot(`demo-${Date.now()}`, 'timer')
                ]
              }));
              setMetrics(prev => ({
                ...prev,
                totalSaves: prev.totalSaves + 1
              }));
            }
          }, 200);
          break;
          
        case 'disconnect':
          const playerId = 'demo-player-1';
          setRecoveryState(prev => ({
            ...prev,
            playerStates: {
              ...prev.playerStates,
              [playerId]: {
                playerId,
                connectionState: 'disconnected',
                lastSeen: new Date().toISOString(),
                disconnectedAt: new Date().toISOString(),
                reconnectionAttempts: 0,
                recoveryToken: Math.random().toString(36).substring(2, 15),
                botReplaced: false,
                timeoutWarning: false,
                pendingActions: []
              }
            }
          }));
          addNotification({
            type: 'warning',
            title: 'Player Disconnected',
            message: `Player ${playerId} has lost connection`,
            playerId,
            dismissible: true
          });
          break;
          
        case 'reconnect':
          setRecoveryState(prev => ({
            ...prev,
            status: 'reconnecting',
            progress: 0
          }));
          addNotification({
            type: 'info',
            title: 'Reconnecting Player',
            message: 'Attempting to reconnect player...',
            dismissible: false
          });
          
          // Simulate reconnection progress
          let reconnectProgress = 0;
          const reconnectInterval = setInterval(() => {
            reconnectProgress += 15;
            setRecoveryState(prev => ({
              ...prev,
              progress: Math.min(reconnectProgress, 100)
            }));
            
            if (reconnectProgress >= 100) {
              clearInterval(reconnectInterval);
              setRecoveryState(prev => ({
                ...prev,
                status: 'stable',
                progress: 100,
                playerStates: {
                  ...prev.playerStates,
                  'demo-player-1': {
                    playerId: 'demo-player-1',
                    connectionState: 'connected',
                    lastSeen: new Date().toISOString(),
                    disconnectedAt: null,
                    reconnectionAttempts: 1,
                    recoveryToken: prev.playerStates['demo-player-1']?.recoveryToken || Math.random().toString(36).substring(2, 15),
                    botReplaced: false,
                    timeoutWarning: false,
                    pendingActions: []
                  }
                }
              }));
              setMetrics(prev => ({
                ...prev,
                totalReconnections: prev.totalReconnections + 1
              }));
            }
          }, 300);
          break;
          
        case 'fail':
          setRecoveryState(prev => ({
            ...prev,
            status: 'failed',
            errorHistory: [
              ...prev.errorHistory,
              {
                id: `error-${Date.now()}`,
                type: 'save',
                message: 'Failed to save game state to persistent storage',
                timestamp: new Date().toISOString(),
                severity: 'high',
                context: { attempt: 1 },
                recovered: false,
                retryCount: 0
              }
            ]
          }));
          addNotification({
            type: 'error',
            title: 'Save Failed',
            message: 'Failed to save game state. Click retry to attempt again.',
            dismissible: true,
            actions: [
              {
                id: 'retry',
                label: 'Retry',
                type: 'primary',
                action: () => {}
              }
            ]
          });
          break;
          
        case 'retry':
          setRecoveryState(prev => ({
            ...prev,
            status: 'saving',
            progress: 0
          }));
          addNotification({
            type: 'info',
            title: 'Retrying Save',
            message: 'Retrying save operation...',
            dismissible: false
          });
          break;
          
        case 'complete':
          setRecoveryState(prev => ({
            ...prev,
            status: 'stable',
            progress: 100
          }));
          break;
      }

      currentStep++;
      
      // Schedule next step
      if (currentStep < scenario.steps.length) {
        const nextStep = scenario.steps[currentStep];
        if (nextStep) {
          const delay = (nextStep.time - step.time) / simulationSpeed;
          setTimeout(runStep, delay);
        }
      } else {
        setDemoState('idle');
      }
    };

    // Start first step
    setTimeout(runStep, 0);
  }, [simulationSpeed, addNotification]);

  const handleStart = () => {
    runScenario(currentScenario);
  };

  const handlePause = () => {
    setDemoState('paused');
  };

  const handleReset = () => {
    setDemoState('idle');
    setRecoveryState(prev => ({
      ...prev,
      status: 'stable',
      phase: 'complete',
      progress: 100,
      errorHistory: [],
      availableSnapshots: []
    }));
    setNotifications([]);
  };

  const handleSave = async () => {
    addNotification({
      type: 'info',
      title: 'Manual Save',
      message: 'Initiating manual save...',
      dismissible: true,
      duration: 3000
    });
    
    const newSnapshot = createMockSnapshot(`manual-${Date.now()}`, 'manual');
    setRecoveryState(prev => ({
      ...prev,
      availableSnapshots: [...prev.availableSnapshots, newSnapshot],
      lastSuccessfulSave: new Date().toISOString()
    }));
    
    setMetrics(prev => ({
      ...prev,
      totalSaves: prev.totalSaves + 1
    }));
  };

  const handleRestore = async (snapshotId: string) => {
    addNotification({
      type: 'info',
      title: 'Restoring State',
      message: `Restoring from snapshot ${snapshotId.substring(0, 8)}...`,
      dismissible: true,
      duration: 3000
    });
    
    setMetrics(prev => ({
      ...prev,
      totalRestores: prev.totalRestores + 1
    }));
  };

  const handleDelete = async (snapshotId: string) => {
    setRecoveryState(prev => ({
      ...prev,
      availableSnapshots: prev.availableSnapshots.filter(s => s.id !== snapshotId)
    }));
  };

  const handleUpdateConfig = async (newConfig: Partial<RecoveryConfiguration>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  };

  const handleExport = async (snapshotId: string) => {
    addNotification({
      type: 'success',
      title: 'Snapshot Exported',
      message: `Snapshot ${snapshotId.substring(0, 8)} exported successfully`,
      dismissible: true,
      duration: 3000
    });
  };

  const handleImport = async (file: File) => {
    addNotification({
      type: 'success',
      title: 'Snapshot Imported',
      message: `Imported snapshot from ${file.name}`,
      dismissible: true,
      duration: 3000
    });
  };

  const handleDismissNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const handleNotificationAction = (notificationId: string, actionId: string) => {
    // Handle notification actions
    console.log('Notification action:', notificationId, actionId);
  };

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-700 p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Monitor className="h-6 w-6 text-blue-400" />
          <h2 className="text-2xl font-bold text-white">Recovery System Demo</h2>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handleStart}
            disabled={demoState === 'running'}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            <Play className="h-4 w-4" />
            <span>Start</span>
          </button>
          
          <button
            onClick={handlePause}
            disabled={demoState !== 'running'}
            className="flex items-center space-x-2 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            <Pause className="h-4 w-4" />
            <span>Pause</span>
          </button>
          
          <button
            onClick={handleReset}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors duration-200"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reset</span>
          </button>
          
          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors duration-200"
            >
              Close
            </button>
          )}
        </div>
      </div>

      {/* Scenario Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Demo Scenario
        </label>
        <select
          value={currentScenario}
          onChange={(e) => setCurrentScenario(e.target.value)}
          disabled={demoState === 'running'}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {Object.entries(scenarios).map(([key, scenario]) => (
            <option key={key} value={key}>
              {scenario.name} - {scenario.description}
            </option>
          ))}
        </select>
      </div>

      {/* Simulation Speed */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Simulation Speed: {simulationSpeed}x
        </label>
        <input
          type="range"
          min="0.5"
          max="3"
          step="0.5"
          value={simulationSpeed}
          onChange={(e) => setSimulationSpeed(parseFloat(e.target.value))}
          className="w-full"
        />
      </div>

      {/* Demo Components */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Indicator */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Status Indicator</h3>
          <RecoveryStatusIndicator
            recoveryState={recoveryState}
            onRetry={() => runScenario(currentScenario)}
            onDismissError={(errorId) => {
              setRecoveryState(prev => ({
                ...prev,
                errorHistory: prev.errorHistory.filter(e => e.id !== errorId)
              }));
            }}
          />
        </div>

        {/* Control Panel */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Control Panel</h3>
          <RecoveryControlPanel
            snapshots={recoveryState.availableSnapshots}
            config={config}
            metrics={metrics}
            onSave={handleSave}
            onRestore={handleRestore}
            onDelete={handleDelete}
            onUpdateConfig={handleUpdateConfig}
            onExport={handleExport}
            onImport={handleImport}
            disabled={demoState === 'running'}
          />
        </div>
      </div>

      {/* Notification System */}
      <RecoveryNotificationSystem
        notifications={notifications}
        onDismiss={handleDismissNotification}
        onAction={handleNotificationAction}
      />
    </div>
  );
}
