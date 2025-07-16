/**
 * Recovery Control Panel
 * 
 * Control panel for managing recovery operations, including manual saves,
 * snapshot management, and recovery configuration.
 */

'use client';

import { useState, useCallback } from 'react';
import { 
  Save, 
  Download, 
  Upload, 
  Trash2, 
  Settings, 
  RefreshCw,
  Clock,
  Database,
  Shield,
  AlertTriangle,
  CheckCircle,
  Copy,
  Eye,
  EyeOff
} from 'lucide-react';
import type { 
  GameStateSnapshot, 
  RecoveryConfiguration, 
  RecoveryMetrics 
} from '~/types/game-state-recovery';

interface RecoveryControlPanelProps {
  snapshots: GameStateSnapshot[];
  config: RecoveryConfiguration;
  metrics: RecoveryMetrics;
  onSave: () => Promise<void>;
  onRestore: (snapshotId: string) => Promise<void>;
  onDelete: (snapshotId: string) => Promise<void>;
  onUpdateConfig: (config: Partial<RecoveryConfiguration>) => Promise<void>;
  onExport: (snapshotId: string) => Promise<void>;
  onImport: (file: File) => Promise<void>;
  disabled?: boolean;
}

export default function RecoveryControlPanel({
  snapshots,
  config,
  metrics,
  onSave,
  onRestore,
  onDelete,
  onUpdateConfig,
  onExport,
  onImport,
  disabled = false
}: RecoveryControlPanelProps) {
  const [activeTab, setActiveTab] = useState<'snapshots' | 'config' | 'metrics'>('snapshots');
  const [selectedSnapshot, setSelectedSnapshot] = useState<string | null>(null);
  const [showConfig, setShowConfig] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [configDraft, setConfigDraft] = useState<RecoveryConfiguration>(config);

  const handleSave = useCallback(async () => {
    if (disabled || isSaving) return;
    
    setIsSaving(true);
    try {
      await onSave();
    } finally {
      setIsSaving(false);
    }
  }, [disabled, isSaving, onSave]);

  const handleRestore = useCallback(async (snapshotId: string) => {
    if (disabled || isRestoring) return;
    
    setIsRestoring(true);
    try {
      await onRestore(snapshotId);
      setSelectedSnapshot(null);
    } finally {
      setIsRestoring(false);
    }
  }, [disabled, isRestoring, onRestore]);

  const handleDelete = useCallback(async (snapshotId: string) => {
    if (disabled) return;
    
    await onDelete(snapshotId);
    if (selectedSnapshot === snapshotId) {
      setSelectedSnapshot(null);
    }
  }, [disabled, onDelete, selectedSnapshot]);

  const handleConfigSave = useCallback(async () => {
    if (disabled) return;
    
    await onUpdateConfig(configDraft);
    setShowConfig(false);
  }, [disabled, configDraft, onUpdateConfig]);

  const formatFileSize = (bytes: number): string => {
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(1)} MB`;
  };

  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  const getSnapshotStatus = (snapshot: GameStateSnapshot) => {
    const now = Date.now();
    const age = now - new Date(snapshot.timestamp).getTime();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    
    if (age > maxAge) return { status: 'expired', color: 'red' };
    if (age > maxAge * 0.8) return { status: 'aging', color: 'yellow' };
    return { status: 'fresh', color: 'green' };
  };

  const getSnapshotSize = (snapshot: GameStateSnapshot): number => {
    // Estimate size based on JSON string length
    const jsonString = JSON.stringify(snapshot);
    return new Blob([jsonString]).size;
  };

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <Shield className="h-5 w-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Recovery Control</h3>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handleSave}
            disabled={disabled || isSaving}
            className="flex items-center space-x-2 px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {isSaving ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span>Save Now</span>
          </button>
          
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="p-1.5 text-gray-400 hover:text-white transition-colors duration-200"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Configuration Panel */}
      {showConfig && (
        <div className="p-4 bg-gray-900 border-b border-gray-700">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Auto-save Interval (seconds)
              </label>
              <input
                type="number"
                value={configDraft.autoSaveInterval / 1000}
                onChange={(e) => setConfigDraft({
                  ...configDraft,
                  autoSaveInterval: parseInt(e.target.value) * 1000
                })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="10"
                max="300"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Max Snapshots
              </label>
              <input
                type="number"
                value={configDraft.maxSnapshots}
                onChange={(e) => setConfigDraft({
                  ...configDraft,
                  maxSnapshots: parseInt(e.target.value)
                })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="5"
                max="100"
              />
            </div>
            
            <div className="col-span-2 flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={configDraft.compressionEnabled}
                  onChange={(e) => setConfigDraft({
                    ...configDraft,
                    compressionEnabled: e.target.checked
                  })}
                  className="rounded border-gray-600 bg-gray-800 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-300">Enable compression</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={configDraft.validationConfig.enableChecksums}
                  onChange={(e) => setConfigDraft({
                    ...configDraft,
                    validationConfig: {
                      ...configDraft.validationConfig,
                      enableChecksums: e.target.checked
                    }
                  })}
                  className="rounded border-gray-600 bg-gray-800 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-300">Enable validation</span>
              </label>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 mt-4">
            <button
              onClick={() => setShowConfig(false)}
              className="px-3 py-1.5 text-gray-400 hover:text-white transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleConfigSave}
              className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-200"
            >
              Save Config
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-700">
        {[
          { id: 'snapshots', label: 'Snapshots', icon: Database },
          { id: 'config', label: 'Configuration', icon: Settings },
          { id: 'metrics', label: 'Metrics', icon: AlertTriangle }
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as typeof activeTab)}
            className={`
              flex items-center space-x-2 px-4 py-3 border-b-2 transition-colors duration-200
              ${activeTab === id 
                ? 'border-blue-500 text-blue-400' 
                : 'border-transparent text-gray-400 hover:text-white'
              }
            `}
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-4">
        {activeTab === 'snapshots' && (
          <div className="space-y-4">
            {snapshots.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No snapshots available</p>
              </div>
            ) : (
              <div className="space-y-2">
                {snapshots.map((snapshot) => {
                  const status = getSnapshotStatus(snapshot);
                  const isSelected = selectedSnapshot === snapshot.id;
                  
                  return (
                    <div
                      key={snapshot.id}
                      className={`
                        p-3 rounded-lg border cursor-pointer transition-all duration-200
                        ${isSelected 
                          ? 'border-blue-500 bg-blue-500/10' 
                          : 'border-gray-600 hover:border-gray-500'
                        }
                      `}
                      onClick={() => setSelectedSnapshot(isSelected ? null : snapshot.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`
                            w-3 h-3 rounded-full
                            ${status.color === 'green' ? 'bg-green-500' :
                              status.color === 'yellow' ? 'bg-yellow-500' :
                              'bg-red-500'}
                          `} />
                          
                          <div>
                            <div className="font-medium text-white">
                              {snapshot.metadata.createdBy === 'timer' ? 'Auto Save' : 'Manual Save'}
                            </div>
                            <div className="text-sm text-gray-400">
                              {new Date(snapshot.timestamp).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 text-sm text-gray-400">
                          <span>{formatFileSize(getSnapshotSize(snapshot))}</span>
                          <span>•</span>
                          <span>{snapshot.metadata.playerCount} players</span>
                        </div>
                      </div>
                      
                      {isSelected && (
                        <div className="mt-3 pt-3 border-t border-gray-600">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2 text-sm text-gray-400">
                              <CheckCircle className="h-4 w-4" />
                              <span>Checksum: {snapshot.checksum.substring(0, 8)}</span>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onExport(snapshot.id);
                                }}
                                className="p-1 text-gray-400 hover:text-white transition-colors duration-200"
                                title="Export snapshot"
                              >
                                <Download className="h-4 w-4" />
                              </button>
                              
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRestore(snapshot.id);
                                }}
                                disabled={isRestoring}
                                className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                              >
                                {isRestoring ? 'Restoring...' : 'Restore'}
                              </button>
                              
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(snapshot.id);
                                }}
                                className="p-1 text-red-400 hover:text-red-300 transition-colors duration-200"
                                title="Delete snapshot"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'config' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-900 rounded-lg">
                <div className="text-sm text-gray-400">Auto-save Interval</div>
                <div className="text-xl font-semibold text-white">
                  {formatDuration(config.autoSaveInterval)}
                </div>
              </div>
              
              <div className="p-3 bg-gray-900 rounded-lg">
                <div className="text-sm text-gray-400">Max Snapshots</div>
                <div className="text-xl font-semibold text-white">
                  {config.maxSnapshots}
                </div>
              </div>
              
              <div className="p-3 bg-gray-900 rounded-lg">
                <div className="text-sm text-gray-400">Compression</div>
                <div className="text-xl font-semibold text-white">
                  {config.compressionEnabled ? 'Enabled' : 'Disabled'}
                </div>
              </div>
              
              <div className="p-3 bg-gray-900 rounded-lg">
                <div className="text-sm text-gray-400">Validation</div>
                <div className="text-xl font-semibold text-white">
                  {config.validationConfig.enableChecksums ? 'Enabled' : 'Disabled'}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'metrics' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-900 rounded-lg">
                <div className="text-sm text-gray-400">Total Saves</div>
                <div className="text-xl font-semibold text-white">
                  {metrics.totalSaves}
                </div>
              </div>
              
              <div className="p-3 bg-gray-900 rounded-lg">
                <div className="text-sm text-gray-400">Failed Operations</div>
                <div className="text-xl font-semibold text-red-400">
                  {Math.round(metrics.failureRate * 100)}%
                </div>
              </div>
              
              <div className="p-3 bg-gray-900 rounded-lg">
                <div className="text-sm text-gray-400">Avg Save Time</div>
                <div className="text-xl font-semibold text-white">
                  {formatDuration(metrics.averageSaveTime)}
                </div>
              </div>
              
              <div className="p-3 bg-gray-900 rounded-lg">
                <div className="text-sm text-gray-400">Success Rate</div>
                <div className="text-xl font-semibold text-green-400">
                  {Math.round((1 - metrics.failureRate) * 100)}%
                </div>
              </div>
              
              <div className="p-3 bg-gray-900 rounded-lg">
                <div className="text-sm text-gray-400">Total Restores</div>
                <div className="text-xl font-semibold text-white">
                  {metrics.totalRestores}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
