/**
 * Host Action Confirmation Dialog
 * Confirmation dialog for critical host actions
 */

'use client';

import { useState } from 'react';
import { AlertTriangle, Crown, X } from 'lucide-react';
import type { HostAction } from '~/types/host-management';

interface HostActionConfirmationProps {
  action: HostAction;
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function HostActionConfirmation({
  action,
  isOpen,
  onConfirm,
  onCancel,
  isLoading = false
}: HostActionConfirmationProps) {
  const [confirmationText, setConfirmationText] = useState('');

  if (!isOpen) return null;

  const getActionIcon = () => {
    switch (action.type) {
      case 'kick_player':
        return '🚪';
      case 'mute_player':
        return '🔇';
      case 'warn_player':
        return '⚠️';
      case 'make_host':
        return '👑';
      case 'pause_game':
        return '⏸️';
      case 'reset_room':
        return '🔄';
      case 'end_game':
        return '🛑';
      default:
        return '⚙️';
    }
  };

  const getActionColor = () => {
    switch (action.type) {
      case 'kick_player':
      case 'end_game':
        return 'text-red-500';
      case 'reset_room':
        return 'text-orange-500';
      case 'warn_player':
        return 'text-yellow-500';
      case 'make_host':
        return 'text-purple-500';
      case 'mute_player':
        return 'text-blue-500';
      default:
        return 'text-gray-500';
    }
  };

  const getActionTitle = () => {
    const titles: Record<string, string> = {
      kick_player: 'Kick Player',
      mute_player: 'Mute Player',
      warn_player: 'Warn Player',
      make_host: 'Transfer Host',
      pause_game: 'Pause Game',
      resume_game: 'Resume Game',
      reset_room: 'Reset Room',
      end_game: 'End Game',
      share_room: 'Share Room',
      adjust_timer: 'Adjust Timer',
      enable_spectator: 'Enable Spectator',
      disable_spectator: 'Disable Spectator'
    };
    return titles[action.type] || 'Confirm Action';
  };

  const requiresTextConfirmation = action.type === 'reset_room' || action.type === 'end_game';
  const expectedText = action.type === 'reset_room' ? 'RESET' : 'END';

  const isConfirmDisabled = requiresTextConfirmation && confirmationText !== expectedText;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#0a0a0f] border border-[#252547] rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`text-2xl ${getActionColor()}`}>
              {getActionIcon()}
            </div>
            <h3 className="text-lg font-semibold text-white">{getActionTitle()}</h3>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Warning for destructive actions */}
        {(action.type === 'kick_player' || action.type === 'reset_room' || action.type === 'end_game') && (
          <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg mb-4">
            <AlertTriangle size={16} className="text-red-500" />
            <span className="text-sm text-red-400">
              This action cannot be undone!
            </span>
          </div>
        )}

        {/* Confirmation Message */}
        <div className="mb-6">
          <p className="text-gray-300 mb-2">
            {action.details.confirmationText || 'Are you sure you want to proceed?'}
          </p>
          
          {action.details.warningMessage && (
            <p className="text-sm text-yellow-400 mt-2">
              {action.details.warningMessage}
            </p>
          )}

          {action.details.reason && (
            <p className="text-sm text-gray-400 mt-2">
              Reason: {action.details.reason}
            </p>
          )}
        </div>

        {/* Text Confirmation for Destructive Actions */}
        {requiresTextConfirmation && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Type <code className="text-red-400 font-mono">{expectedText}</code> to confirm:
            </label>
            <input
              type="text"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              className="w-full px-3 py-2 bg-[#1a1a2e] border border-[#252547] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder={`Type ${expectedText} to confirm`}
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:opacity-50 text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading || isConfirmDisabled}
            className={`px-4 py-2 rounded-lg transition-colors disabled:opacity-50 ${
              action.type === 'kick_player' || action.type === 'end_game'
                ? 'bg-red-600 hover:bg-red-700'
                : action.type === 'reset_room'
                ? 'bg-orange-600 hover:bg-orange-700'
                : 'bg-blue-600 hover:bg-blue-700'
            } text-white`}
          >
            {isLoading ? 'Processing...' : 'Confirm'}
          </button>
        </div>

        {/* Host Authority Indicator */}
        <div className="mt-4 pt-4 border-t border-[#252547]/50">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Crown size={12} className="text-amber-500" />
            <span>Host Authority: {action.hostId}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
