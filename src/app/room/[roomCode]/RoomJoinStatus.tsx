'use client';

import { type Room } from '~/types/room';

interface RoomJoinStatusProps {
  status: 'idle' | 'loading' | 'success' | 'error';
  error?: string;
  roomInfo?: Partial<Room>;
  className?: string;
}

export function RoomJoinStatus({ 
  status, 
  error, 
  roomInfo, 
  className = '' 
}: RoomJoinStatusProps) {
  if (status === 'idle') {
    return null;
  }

  if (status === 'loading') {
    return (
      <div className={`bg-[#252547]/80 backdrop-blur-xl border border-slate-600/30 rounded-xl p-6 ${className}`} data-testid="room-join-status">
        <div className="flex items-center justify-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          <span className="text-slate-200">Joining room...</span>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className={`bg-red-500/10 border border-red-500/30 rounded-xl p-6 ${className}`} data-testid="room-join-status">
        <div className="flex items-center space-x-3">
          <svg className="w-6 h-6 text-red-500 animate-shake" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          <div>
            <p className="text-red-400 font-medium">Failed to join room</p>
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'success' && roomInfo) {
    return (
      <div className={`bg-green-500/10 border border-green-500/30 rounded-xl p-6 ${className}`} data-testid="room-join-status">
        <div className="flex items-center space-x-3">
          <div className="inline-flex items-center justify-center w-8 h-8 bg-green-500/20 rounded-full">
            <svg className="w-5 h-5 text-green-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="text-green-400 font-medium">Successfully joined room!</p>
            <p className="text-green-300 text-sm">
              Room: {roomInfo.code} • {roomInfo.players?.length || 0} players
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
