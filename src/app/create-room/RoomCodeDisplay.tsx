'use client';

import { useState, useCallback } from 'react';
import { QRCodeGenerator } from '~/components/ui/QRCodeGenerator';
import { formatRoomCode } from '~/lib/room-code-generator';

interface RoomCodeDisplayProps {
  roomCode: string;
  joinUrl: string;
  className?: string;
}

export function RoomCodeDisplay({ roomCode, joinUrl, className = '' }: RoomCodeDisplayProps) {
  const [copiedItem, setCopiedItem] = useState<'code' | 'url' | null>(null);
  const [qrSize, setQrSize] = useState(256);

  const copyToClipboard = useCallback(async (text: string, type: 'code' | 'url') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItem(type);
      setTimeout(() => setCopiedItem(null), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  }, []);

  // Responsive QR code size
  const getQRSize = () => {
    if (typeof window === 'undefined') return 256;
    return window.innerWidth >= 768 ? 256 : 200;
  };

  return (
    <div className={`bg-[#252547]/80 backdrop-blur-xl border border-slate-600/30 rounded-2xl p-8 shadow-xl ${className}`} data-testid="room-code-display">
      <div className="text-center space-y-6">
        {/* Success Message */}
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-green-500/20 rounded-full mb-4">
            <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Room Created Successfully!</h2>
          <p className="text-slate-200 opacity-90">Share this room code with your friends to join the game</p>
        </div>

        {/* Room Code */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-200 opacity-75 uppercase tracking-wide">Room Code</label>
            <div className="mt-2 relative">
              <div className="bg-[#1a1a2e] rounded-xl p-4 border border-slate-600/30">
                <div className="text-3xl font-mono font-bold text-white tracking-wider">
                  {formatRoomCode(roomCode)}
                </div>
              </div>
              <button
                onClick={() => copyToClipboard(roomCode, 'code')}
                className="absolute right-2 top-2 bg-[#3d3d7a] hover:bg-[#4a4a96] text-white p-2 rounded-lg transition-all duration-300 hover:scale-105"
                data-testid="copy-room-code"
              >
                {copiedItem === 'code' ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Join URL */}
          <div>
            <label className="text-sm font-medium text-slate-200 opacity-75 uppercase tracking-wide">Join URL</label>
            <div className="mt-2 relative">
              <div className="bg-[#1a1a2e] rounded-xl p-4 border border-slate-600/30">
                <div className="text-sm font-mono text-slate-200 break-all">
                  {joinUrl}
                </div>
              </div>
              <button
                onClick={() => copyToClipboard(joinUrl, 'url')}
                className="absolute right-2 top-2 bg-[#3d3d7a] hover:bg-[#4a4a96] text-white p-2 rounded-lg transition-all duration-300 hover:scale-105"
                data-testid="copy-join-url"
              >
                {copiedItem === 'url' ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* QR Code */}
        <div className="flex justify-center">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-200 opacity-75 uppercase tracking-wide">QR Code</label>
            <div className="flex justify-center">
              <QRCodeGenerator 
                value={joinUrl} 
                size={getQRSize()}
                className="transition-all duration-300"
              />
            </div>
            <p className="text-xs text-slate-300 opacity-75 text-center">
              Scan with your phone to join
            </p>
          </div>
        </div>

        {/* Copy Success Message */}
        {copiedItem && (
          <div className="text-green-500 text-sm font-medium animate-pulse">
            {copiedItem === 'code' ? 'Room code copied!' : 'Join URL copied!'}
          </div>
        )}
      </div>
    </div>
  );
}
