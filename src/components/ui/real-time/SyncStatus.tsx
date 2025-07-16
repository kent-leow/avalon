/**
 * Real-time Sync Status Component
 * Shows synchronization status and conflict indicators
 */

'use client';

import { useState, useEffect } from 'react';
import type { SyncConflict, OptimisticUpdate } from '~/types/real-time-sync';
import { formatTimestamp } from '~/lib/real-time-sync-utils';

interface SyncStatusProps {
  syncStatus: 'synced' | 'syncing' | 'conflict' | 'error';
  optimisticUpdates: OptimisticUpdate[];
  conflicts: SyncConflict[];
  className?: string;
  showDetails?: boolean;
  onResolveConflict?: (conflictId: string) => void;
}

export default function SyncStatus({
  syncStatus,
  optimisticUpdates,
  conflicts,
  className = '',
  showDetails = false,
  onResolveConflict,
}: SyncStatusProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const pendingUpdates = optimisticUpdates.filter(u => u.status === 'pending');
  const unresolvedConflicts = conflicts.filter(c => !c.resolved);

  const getSyncIcon = () => {
    switch (syncStatus) {
      case 'synced':
        return (
          <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        );
      case 'syncing':
        return (
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin">
          </div>
        );
      case 'conflict':
        return (
          <div className="w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center animate-pulse">
            <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
          </div>
        );
      case 'error':
        return (
          <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        );
      default:
        return null;
    }
  };

  const getSyncText = () => {
    switch (syncStatus) {
      case 'synced':
        return 'Synced';
      case 'syncing':
        return 'Syncing...';
      case 'conflict':
        return 'Conflict';
      case 'error':
        return 'Error';
      default:
        return 'Unknown';
    }
  };

  const getSyncColor = () => {
    switch (syncStatus) {
      case 'synced':
        return 'text-green-500';
      case 'syncing':
        return 'text-blue-500';
      case 'conflict':
        return 'text-yellow-500';
      case 'error':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div
        className="flex items-center space-x-2 cursor-pointer"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {/* Sync Icon */}
        <div className="transition-all duration-200">
          {getSyncIcon()}
        </div>

        {/* Sync Text */}
        <span className={`text-sm font-medium ${getSyncColor()}`}>
          {getSyncText()}
        </span>

        {/* Pending Updates Badge */}
        {pendingUpdates.length > 0 && (
          <span className="px-2 py-1 bg-blue-600 text-xs rounded-full text-white">
            {pendingUpdates.length}
          </span>
        )}

        {/* Conflicts Badge */}
        {unresolvedConflicts.length > 0 && (
          <span className="px-2 py-1 bg-yellow-600 text-xs rounded-full text-white animate-pulse">
            {unresolvedConflicts.length} conflicts
          </span>
        )}
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50">
          <div className="bg-gray-800 text-white text-xs rounded-lg px-3 py-2 shadow-lg border border-gray-700">
            <div className="font-medium">Sync Status: {getSyncText()}</div>
            <div className="mt-1 space-y-1 text-gray-300">
              <div>Pending Updates: {pendingUpdates.length}</div>
              <div>Unresolved Conflicts: {unresolvedConflicts.length}</div>
              <div>Total Optimistic Updates: {optimisticUpdates.length}</div>
            </div>
          </div>
          <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800 absolute top-full left-1/2 transform -translate-x-1/2"></div>
        </div>
      )}

      {/* Details Panel */}
      {showDetails && (
        <div className="mt-2 p-3 bg-gray-800 rounded-lg border border-gray-700">
          <div className="space-y-4 text-sm">
            {/* Sync Status */}
            <div className="flex justify-between">
              <span className="text-gray-400">Sync Status:</span>
              <span className={getSyncColor()}>{getSyncText()}</span>
            </div>

            {/* Pending Updates */}
            {pendingUpdates.length > 0 && (
              <div>
                <h4 className="text-gray-400 font-medium mb-2">Pending Updates ({pendingUpdates.length})</h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {pendingUpdates.map((update) => (
                    <div key={update.id} className="p-2 bg-gray-900 rounded border border-gray-700">
                      <div className="flex justify-between text-xs">
                        <span className="text-blue-400">{update.type}</span>
                        <span className="text-gray-500">{formatTimestamp(update.timestamp)}</span>
                      </div>
                      <div className="text-xs text-gray-400 mt-1 truncate">
                        {JSON.stringify(update.localState).substring(0, 50)}...
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Unresolved Conflicts */}
            {unresolvedConflicts.length > 0 && (
              <div>
                <h4 className="text-gray-400 font-medium mb-2">Unresolved Conflicts ({unresolvedConflicts.length})</h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {unresolvedConflicts.map((conflict) => (
                    <div key={conflict.id} className="p-2 bg-gray-900 rounded border border-yellow-600">
                      <div className="flex justify-between text-xs">
                        <span className="text-yellow-400">{conflict.type}</span>
                        <span className="text-gray-500">{formatTimestamp(conflict.timestamp)}</span>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        Local: v{conflict.localVersion} → Server: v{conflict.serverVersion}
                      </div>
                      {onResolveConflict && (
                        <button
                          onClick={() => onResolveConflict(conflict.id)}
                          className="mt-2 px-2 py-1 bg-yellow-600 text-xs rounded text-white hover:bg-yellow-700 transition-colors"
                        >
                          Resolve
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Summary */}
            <div className="border-t border-gray-700 pt-2 text-xs text-gray-400">
              <div>Total Updates: {optimisticUpdates.length}</div>
              <div>Confirmed: {optimisticUpdates.filter(u => u.status === 'confirmed').length}</div>
              <div>Rejected: {optimisticUpdates.filter(u => u.status === 'rejected').length}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
