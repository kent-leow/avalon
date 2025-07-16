/**
 * Host Transfer Interface
 * Secure interface for transferring host privileges
 */

'use client';

import { useState, useEffect } from 'react';
import { Crown, Clock, CheckCircle, XCircle, User, Shield } from 'lucide-react';
import type { HostTransfer, PlayerManagement } from '~/types/host-management';

interface HostTransferInterfaceProps {
  transfer: HostTransfer;
  currentHostName: string;
  targetPlayerName: string;
  onAccept: () => void;
  onReject: () => void;
  onCancel: () => void;
  isCurrentHost: boolean;
  isTargetPlayer: boolean;
  className?: string;
}

export default function HostTransferInterface({
  transfer,
  currentHostName,
  targetPlayerName,
  onAccept,
  onReject,
  onCancel,
  isCurrentHost,
  isTargetPlayer,
  className = ''
}: HostTransferInterfaceProps) {
  const [timeRemaining, setTimeRemaining] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const remaining = Math.max(0, transfer.expiresAt.getTime() - now.getTime());
      setTimeRemaining(remaining);
      
      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [transfer.expiresAt]);

  const formatTimeRemaining = (ms: number): string => {
    const minutes = Math.floor(ms / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getStatusColor = () => {
    switch (transfer.status) {
      case 'pending':
        return 'text-yellow-500';
      case 'accepted':
        return 'text-green-500';
      case 'rejected':
        return 'text-red-500';
      case 'expired':
        return 'text-gray-500';
      case 'cancelled':
        return 'text-gray-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusIcon = () => {
    switch (transfer.status) {
      case 'pending':
        return <Clock size={16} className="animate-spin" />;
      case 'accepted':
        return <CheckCircle size={16} />;
      case 'rejected':
        return <XCircle size={16} />;
      case 'expired':
        return <Clock size={16} />;
      case 'cancelled':
        return <XCircle size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  const isExpired = timeRemaining <= 0;
  const isPending = transfer.status === 'pending' && !isExpired;

  return (
    <div className={`bg-[#0a0a0f] border border-[#252547] rounded-lg p-6 shadow-2xl ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Crown size={24} className="text-amber-500" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Host Transfer</h3>
            <div className={`flex items-center gap-2 text-sm ${getStatusColor()}`}>
              {getStatusIcon()}
              <span className="capitalize">{transfer.status}</span>
            </div>
          </div>
        </div>
        
        {isPending && (
          <div className="text-right">
            <div className="text-sm text-gray-400">Expires in</div>
            <div className="text-lg font-mono text-yellow-500">
              {formatTimeRemaining(timeRemaining)}
            </div>
          </div>
        )}
      </div>

      {/* Transfer Details */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between p-4 bg-[#1a1a2e]/50 rounded-lg">
          <div className="flex items-center gap-3">
            <User size={20} className="text-blue-500" />
            <div>
              <div className="text-sm font-medium text-white">Current Host</div>
              <div className="text-xs text-gray-400">{currentHostName}</div>
            </div>
          </div>
          <div className="text-2xl">👑</div>
        </div>

        <div className="flex items-center justify-center">
          <div className="flex items-center gap-2 text-amber-500">
            <div className="h-0.5 w-8 bg-amber-500"></div>
            <Crown size={16} />
            <div className="h-0.5 w-8 bg-amber-500"></div>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-[#1a1a2e]/50 rounded-lg">
          <div className="flex items-center gap-3">
            <Shield size={20} className="text-purple-500" />
            <div>
              <div className="text-sm font-medium text-white">New Host</div>
              <div className="text-xs text-gray-400">{targetPlayerName}</div>
            </div>
          </div>
          <div className="text-2xl">🎯</div>
        </div>
      </div>

      {/* Transfer Reason */}
      {transfer.reason && (
        <div className="mb-6 p-4 bg-[#252547]/30 rounded-lg">
          <div className="text-sm font-medium text-white mb-2">Reason for Transfer</div>
          <div className="text-sm text-gray-300">{transfer.reason}</div>
        </div>
      )}

      {/* Host Responsibilities */}
      <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <div className="text-sm font-medium text-blue-400 mb-2">Host Responsibilities</div>
        <div className="text-xs text-blue-300 space-y-1">
          <div>• Manage players and maintain fair play</div>
          <div>• Control game flow and resolve disputes</div>
          <div>• Ensure positive gaming experience for all</div>
          <div>• Use host powers responsibly</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        {isPending && isTargetPlayer && (
          <>
            <button
              onClick={onAccept}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
            >
              <CheckCircle size={16} />
              Accept Host Role
            </button>
            <button
              onClick={onReject}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
            >
              <XCircle size={16} />
              Decline
            </button>
          </>
        )}

        {isPending && isCurrentHost && (
          <button
            onClick={onCancel}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium"
          >
            <XCircle size={16} />
            Cancel Transfer
          </button>
        )}

        {!isPending && (
          <div className="flex-1 text-center py-3 text-gray-400">
            {isExpired ? 'Transfer expired' : 'Transfer completed'}
          </div>
        )}
      </div>

      {/* Transfer Status */}
      <div className="mt-4 pt-4 border-t border-[#252547]/50">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>Transfer ID: {transfer.fromHostId.slice(-8)}</span>
          <span>
            {isPending ? 'Pending approval' : transfer.status === 'accepted' ? 'Completed' : 'Ended'}
          </span>
        </div>
      </div>
    </div>
  );
}

// Host Transfer History Component
interface HostTransferHistoryProps {
  transfers: HostTransfer[];
  className?: string;
}

export function HostTransferHistory({ transfers, className = '' }: HostTransferHistoryProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      <h4 className="text-sm font-medium text-white">Transfer History</h4>
      
      {transfers.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <Crown size={32} className="mx-auto mb-2 opacity-50" />
          <p className="text-sm">No host transfers yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {transfers.map((transfer) => (
            <div
              key={`${transfer.fromHostId}-${transfer.toPlayerId}-${transfer.initiated.getTime()}`}
              className="flex items-center justify-between p-3 bg-[#1a1a2e]/50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${
                  transfer.status === 'accepted' ? 'bg-green-500' :
                  transfer.status === 'rejected' ? 'bg-red-500' :
                  transfer.status === 'expired' ? 'bg-gray-500' :
                  'bg-yellow-500'
                }`}></div>
                <div>
                  <div className="text-sm text-white">
                    Host transfer {transfer.status}
                  </div>
                  <div className="text-xs text-gray-400">
                    {transfer.initiated.toLocaleDateString()}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-xs text-gray-400">
                  {transfer.fromHostId.slice(-8)} → {transfer.toPlayerId.slice(-8)}
                </div>
                {transfer.reason && (
                  <div className="text-xs text-gray-500 max-w-24 truncate">
                    {transfer.reason}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
