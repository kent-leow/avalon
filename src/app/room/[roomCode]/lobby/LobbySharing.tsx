'use client';

import { useState, useEffect } from 'react';
import { QRCodeGenerator } from '~/components/ui/QRCodeGenerator';

interface LobbySharingProps {
  roomCode: string;
  className?: string;
}

export default function LobbySharing({ roomCode, className = '' }: LobbySharingProps) {
  const [copied, setCopied] = useState(false);
  const [joinUrl, setJoinUrl] = useState('');
  
  // Set joinUrl on client side to avoid SSR issues
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setJoinUrl(`${window.location.origin}/room/${roomCode}`);
    }
  }, [roomCode]);
  
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(joinUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const copyRoomCode = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy room code:', err);
    }
  };

  return (
    <div className={`bg-[#252547]/80 backdrop-blur-xl border border-slate-600/30 rounded-2xl p-6 ${className}`}>
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent mb-2">
          Invite Friends
        </h3>
        <p className="text-slate-300">Share this room code or QR code with friends to invite them</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Room Code Section */}
        <div className="text-center">
          <div className="bg-[#1a1a2e] border border-slate-600/30 rounded-xl p-6 mb-4">
            <div className="text-sm text-slate-400 mb-2 uppercase tracking-wide">Room Code</div>
            <div className="text-4xl font-mono font-bold text-white mb-4">{roomCode}</div>
            <button
              onClick={copyRoomCode}
              className="bg-[#3d3d7a] hover:bg-[#4a4a96] text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2 mx-auto"
            >
              {copied ? (
                <>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
                    <path d="M3 5a2 2 0 012-2 3 3 0 003 3h6a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L14.586 13H19v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM15 11.586V13a1 1 0 11-2 0v-1.586l.293.293a1 1 0 001.414 0l.293-.293z" />
                  </svg>
                  Copy Code
                </>
              )}
            </button>
          </div>
          <p className="text-sm text-slate-400">
            Friends can enter this code at{' '}
            <span className="font-mono bg-[#1a1a2e] px-2 py-1 rounded">
              {joinUrl ? new URL(joinUrl).origin : 'your-domain.com'}
            </span>
          </p>
        </div>

        {/* QR Code Section */}
        <div className="text-center">
          <div className="bg-[#1a1a2e] border border-slate-600/30 rounded-xl p-6 mb-4 flex flex-col items-center">
            <div className="text-sm text-slate-400 mb-4 uppercase tracking-wide">QR Code</div>
            {joinUrl ? (
              <QRCodeGenerator 
                value={joinUrl} 
                size={160} 
                className="mb-4"
              />
            ) : (
              <div className="w-[160px] h-[160px] bg-[#1a1a2e] rounded-lg flex items-center justify-center mb-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            )}
            <button
              onClick={copyToClipboard}
              disabled={!joinUrl}
              className="bg-[#3d3d7a] hover:bg-[#4a4a96] text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2 disabled:opacity-50"
            >
              {copied ? (
                <>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
                    <path d="M3 5a2 2 0 012-2 3 3 0 003 3h6a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L14.586 13H19v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM15 11.586V13a1 1 0 11-2 0v-1.586l.293.293a1 1 0 001.414 0l.293-.293z" />
                  </svg>
                  Copy Link
                </>
              )}
            </button>
          </div>
          <p className="text-sm text-slate-400">
            Scan with phone camera or QR code reader
          </p>
        </div>
      </div>

      <div className="mt-6 text-center">
        <div className="bg-[#1a1a2e] border border-slate-600/30 rounded-xl p-4">
          <div className="text-sm text-slate-400 mb-2">Share Instructions</div>
          <div className="text-white space-y-1 text-sm">
            <p>• Share the room code: <span className="font-mono">{roomCode}</span></p>
            <p>• Or share the QR code for easy mobile joining</p>
            <p>• Friends can join at any time before the game starts</p>
          </div>
        </div>
      </div>
    </div>
  );
}
