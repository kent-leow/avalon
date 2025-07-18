'use client';

import { useEffect, useState, useCallback } from 'react';
import { useMobileExperience } from '~/context/MobileExperienceContext';
import { type ConnectivityStatus } from '~/types/mobile-experience';

interface MobileConnectivityManagerProps {
  connectivityStatus: ConnectivityStatus;
  dataOptimization: boolean;
  offlineMode: boolean;
  className?: string;
}

interface ConnectivityState {
  isOnline: boolean;
  connectionQuality: 'excellent' | 'good' | 'fair' | 'poor';
  dataUsage: number;
  offlineQueue: Array<{ action: string; data: any; timestamp: number }>;
  syncStatus: 'idle' | 'syncing' | 'error';
  retryCount: number;
}

export function MobileConnectivityManager({
  connectivityStatus,
  dataOptimization,
  offlineMode,
  className,
}: MobileConnectivityManagerProps) {
  const { updateConnectivityStatus } = useMobileExperience();
  const [connectivityState, setConnectivityState] = useState<ConnectivityState>({
    isOnline: connectivityStatus.isOnline,
    connectionQuality: 'good',
    dataUsage: 0,
    offlineQueue: [],
    syncStatus: 'idle',
    retryCount: 0,
  });

  // Determine connection quality based on bandwidth and latency
  const getConnectionQuality = useCallback((status: ConnectivityStatus): 'excellent' | 'good' | 'fair' | 'poor' => {
    if (!status.isOnline) return 'poor';
    
    const bandwidth = status.bandwidth || 0;
    const latency = status.latency || 0;
    
    if (bandwidth >= 10 && latency <= 50) return 'excellent';
    if (bandwidth >= 5 && latency <= 100) return 'good';
    if (bandwidth >= 1 && latency <= 300) return 'fair';
    return 'poor';
  }, []);

  // Apply connectivity optimizations
  const applyConnectivityOptimizations = useCallback(() => {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    const body = document.body;
    
    // Apply optimizations based on connection quality
    switch (connectivityState.connectionQuality) {
      case 'poor':
        root.style.setProperty('--mobile-image-quality', '0.5');
        root.style.setProperty('--mobile-video-quality', '240p');
        root.style.setProperty('--mobile-preload-strategy', 'none');
        root.style.setProperty('--mobile-lazy-load', 'aggressive');
        body.classList.add('mobile-connectivity-poor');
        break;
        
      case 'fair':
        root.style.setProperty('--mobile-image-quality', '0.7');
        root.style.setProperty('--mobile-video-quality', '360p');
        root.style.setProperty('--mobile-preload-strategy', 'metadata');
        root.style.setProperty('--mobile-lazy-load', 'enabled');
        body.classList.add('mobile-connectivity-fair');
        break;
        
      case 'good':
        root.style.setProperty('--mobile-image-quality', '0.85');
        root.style.setProperty('--mobile-video-quality', '480p');
        root.style.setProperty('--mobile-preload-strategy', 'metadata');
        root.style.setProperty('--mobile-lazy-load', 'enabled');
        body.classList.add('mobile-connectivity-good');
        break;
        
      case 'excellent':
        root.style.setProperty('--mobile-image-quality', '1');
        root.style.setProperty('--mobile-video-quality', '720p');
        root.style.setProperty('--mobile-preload-strategy', 'auto');
        root.style.setProperty('--mobile-lazy-load', 'disabled');
        body.classList.add('mobile-connectivity-excellent');
        break;
    }

    // Apply data optimization
    if (dataOptimization) {
      root.style.setProperty('--mobile-data-saver', 'enabled');
      root.style.setProperty('--mobile-compress-images', 'true');
      root.style.setProperty('--mobile-reduce-quality', 'true');
      body.classList.add('mobile-data-optimization');
    } else {
      root.style.setProperty('--mobile-data-saver', 'disabled');
      root.style.setProperty('--mobile-compress-images', 'false');
      root.style.setProperty('--mobile-reduce-quality', 'false');
      body.classList.remove('mobile-data-optimization');
    }

    // Apply offline mode
    if (offlineMode) {
      body.classList.add('mobile-offline-mode');
    } else {
      body.classList.remove('mobile-offline-mode');
    }
  }, [connectivityState.connectionQuality, dataOptimization, offlineMode]);

  // Handle online/offline events
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => {
      setConnectivityState(prev => ({
        ...prev,
        isOnline: true,
        syncStatus: 'syncing',
      }));
      
      // Update context
      updateConnectivityStatus({
        ...connectivityStatus,
        isOnline: true,
      });
    };

    const handleOffline = () => {
      setConnectivityState(prev => ({
        ...prev,
        isOnline: false,
        connectionQuality: 'poor',
        syncStatus: 'idle',
      }));
      
      // Update context
      updateConnectivityStatus({
        ...connectivityStatus,
        isOnline: false,
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [connectivityStatus, updateConnectivityStatus]);

  // Monitor connection quality
  useEffect(() => {
    const quality = getConnectionQuality(connectivityStatus);
    setConnectivityState(prev => ({
      ...prev,
      connectionQuality: quality,
    }));
  }, [connectivityStatus, getConnectionQuality]);

  // Apply optimizations when connectivity changes
  useEffect(() => {
    applyConnectivityOptimizations();
  }, [applyConnectivityOptimizations]);

  // Queue actions when offline
  const queueOfflineAction = useCallback((action: string, data: any) => {
    if (!connectivityState.isOnline) {
      setConnectivityState(prev => ({
        ...prev,
        offlineQueue: [...prev.offlineQueue, {
          action,
          data,
          timestamp: Date.now(),
        }],
      }));
    }
  }, [connectivityState.isOnline]);

  // Process offline queue when coming back online
  useEffect(() => {
    if (connectivityState.isOnline && connectivityState.offlineQueue.length > 0) {
      const processQueue = async () => {
        setConnectivityState(prev => ({ ...prev, syncStatus: 'syncing' }));
        
        try {
          // Process queued actions
          for (const queuedAction of connectivityState.offlineQueue) {
            // In a real implementation, this would make API calls
            console.log('Processing offline action:', queuedAction);
          }
          
          // Clear queue and update sync status
          setConnectivityState(prev => ({
            ...prev,
            offlineQueue: [],
            syncStatus: 'idle',
            retryCount: 0,
          }));
        } catch (error) {
          console.error('Error processing offline queue:', error);
          setConnectivityState(prev => ({
            ...prev,
            syncStatus: 'error',
            retryCount: prev.retryCount + 1,
          }));
        }
      };

      processQueue();
    }
  }, [connectivityState.isOnline, connectivityState.offlineQueue]);

  // Retry failed sync
  const retrySync = useCallback(() => {
    if (connectivityState.syncStatus === 'error' && connectivityState.retryCount < 3) {
      setConnectivityState(prev => ({
        ...prev,
        syncStatus: 'syncing',
      }));
    }
  }, [connectivityState.syncStatus, connectivityState.retryCount]);

  // Data usage estimation
  const estimateDataUsage = useCallback((bytes: number) => {
    setConnectivityState(prev => ({
      ...prev,
      dataUsage: prev.dataUsage + bytes,
    }));
  }, []);

  // Get data usage in human-readable format
  const getFormattedDataUsage = useCallback(() => {
    const usage = connectivityState.dataUsage;
    if (usage < 1024) return `${usage} B`;
    if (usage < 1024 * 1024) return `${(usage / 1024).toFixed(1)} KB`;
    if (usage < 1024 * 1024 * 1024) return `${(usage / (1024 * 1024)).toFixed(1)} MB`;
    return `${(usage / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  }, [connectivityState.dataUsage]);

  return (
    <div 
      className={`mobile-connectivity-manager ${className || ''}`}
      data-online={connectivityState.isOnline}
      data-quality={connectivityState.connectionQuality}
      data-data-optimization={dataOptimization}
      data-offline-mode={offlineMode}
    >
      {/* Connectivity Optimization Styles */}
      <style jsx global>{`
        /* Connectivity-based styles */
        .mobile-connectivity-poor img,
        .mobile-connectivity-poor video {
          filter: contrast(0.8) brightness(0.9);
        }
        
        .mobile-connectivity-poor .mobile-high-bandwidth {
          display: none;
        }
        
        .mobile-connectivity-fair .mobile-image-placeholder {
          background: #f0f0f0;
          min-height: 200px;
        }
        
        .mobile-connectivity-good .mobile-preload {
          loading: lazy;
        }
        
        .mobile-connectivity-excellent .mobile-preload {
          loading: eager;
        }
        
        /* Data optimization styles */
        .mobile-data-optimization img {
          loading: lazy;
          decoding: async;
        }
        
        .mobile-data-optimization .mobile-data-heavy {
          display: none;
        }
        
        .mobile-data-optimization .mobile-data-light {
          display: block;
        }
        
        /* Offline mode styles */
        .mobile-offline-mode {
          filter: grayscale(0.3);
        }
        
        .mobile-offline-mode .mobile-online-only {
          display: none;
        }
        
        .mobile-offline-mode .mobile-offline-fallback {
          display: block;
        }
        
        /* Sync status indicators */
        .mobile-sync-syncing::after {
          content: '🔄';
          animation: spin 1s linear infinite;
        }
        
        .mobile-sync-error::after {
          content: '⚠️';
          animation: blink 1s ease-in-out infinite;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0.3; }
        }
      `}</style>
      
      {/* Offline Queue Status */}
      {connectivityState.offlineQueue.length > 0 && (
        <div className="mobile-offline-queue-status fixed top-4 right-4 z-50 rounded-lg bg-yellow-500 p-2 text-sm text-white">
          {connectivityState.offlineQueue.length} actions queued
        </div>
      )}
      
      {/* Sync Status */}
      {connectivityState.syncStatus === 'syncing' && (
        <div className="mobile-sync-status fixed top-4 right-4 z-50 rounded-lg bg-blue-500 p-2 text-sm text-white">
          Syncing...
        </div>
      )}
      
      {/* Sync Error */}
      {connectivityState.syncStatus === 'error' && (
        <div className="mobile-sync-error fixed top-4 right-4 z-50 rounded-lg bg-red-500 p-2 text-sm text-white">
          <div>Sync failed</div>
          <button 
            onClick={retrySync}
            className="mt-1 rounded bg-red-600 px-2 py-1 text-xs hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      )}
      
      {/* Development Mode Connectivity Info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mobile-connectivity-info fixed bottom-84 left-4 z-50 rounded-lg bg-black/80 p-2 text-xs text-white">
          <div>Status: {connectivityState.isOnline ? 'Online' : 'Offline'}</div>
          <div>Quality: {connectivityState.connectionQuality}</div>
          <div>Type: {connectivityStatus.connectionType}</div>
          <div>Bandwidth: {connectivityStatus.bandwidth}Mbps</div>
          <div>Latency: {connectivityStatus.latency}ms</div>
          <div>Data Usage: {getFormattedDataUsage()}</div>
          <div>Queued: {connectivityState.offlineQueue.length}</div>
          <div>Data Opt: {dataOptimization ? 'On' : 'Off'}</div>
        </div>
      )}
    </div>
  );
}
