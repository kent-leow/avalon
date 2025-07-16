/**
 * Mobile Game Board Component
 * Touch-optimized game board for mobile devices
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
import { useTouchGestures } from './MobileTouchGestures';
import { triggerHapticFeedback, getMobileViewport } from '~/lib/mobile-utils';
import type { MobileGameBoard, DeviceOrientation } from '~/types/mobile-navigation';

interface MobileGameBoardProps extends Omit<MobileGameBoard, 'players'> {
  players: Array<{
    id: string;
    name: string;
    position: { x: number; y: number };
    selected: boolean;
    role?: string;
    isConnected: boolean;
  }>;
  className?: string;
}

export default function MobileGameBoard({
  orientation,
  players,
  onPlayerSelect,
  touchFeedback = true,
  zoomEnabled = true,
  minZoom = 0.8,
  maxZoom = 2.0,
  currentZoom = 1.0,
  onZoomChange,
  className = '',
}: MobileGameBoardProps) {
  const [viewport, setViewport] = useState(() => getMobileViewport());
  const [zoom, setZoom] = useState(currentZoom);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);

  // Handle touch gestures
  const { ref: gestureRef } = useTouchGestures({
    onPinchZoom: (scale) => {
      if (!zoomEnabled) return;
      
      const newZoom = Math.min(Math.max(zoom * scale, minZoom), maxZoom);
      setZoom(newZoom);
      onZoomChange?.(newZoom);
    },
    onDoubleTap: () => {
      if (!zoomEnabled) return;
      
      const newZoom = zoom === 1.0 ? 1.5 : 1.0;
      setZoom(newZoom);
      onZoomChange?.(newZoom);
      
      if (touchFeedback) {
        triggerHapticFeedback('light');
      }
    },
    hapticFeedback: touchFeedback,
  });

  // Update viewport on orientation change
  useEffect(() => {
    const updateViewport = () => setViewport(getMobileViewport());
    window.addEventListener('resize', updateViewport);
    window.addEventListener('orientationchange', updateViewport);
    return () => {
      window.removeEventListener('resize', updateViewport);
      window.removeEventListener('orientationchange', updateViewport);
    };
  }, []);

  // Connect gesture handler to board
  useEffect(() => {
    if (boardRef.current && gestureRef.current) {
      gestureRef.current = boardRef.current;
    }
  }, [gestureRef]);

  const handlePlayerSelect = (playerId: string) => {
    setSelectedPlayer(playerId);
    onPlayerSelect(playerId);
    
    if (touchFeedback) {
      triggerHapticFeedback('medium');
    }
  };

  const handleZoomIn = () => {
    if (!zoomEnabled) return;
    
    const newZoom = Math.min(zoom + 0.2, maxZoom);
    setZoom(newZoom);
    onZoomChange?.(newZoom);
    
    if (touchFeedback) {
      triggerHapticFeedback('light');
    }
  };

  const handleZoomOut = () => {
    if (!zoomEnabled) return;
    
    const newZoom = Math.max(zoom - 0.2, minZoom);
    setZoom(newZoom);
    onZoomChange?.(newZoom);
    
    if (touchFeedback) {
      triggerHapticFeedback('light');
    }
  };

  const resetZoom = () => {
    setZoom(1.0);
    setPanOffset({ x: 0, y: 0 });
    onZoomChange?.(1.0);
    
    if (touchFeedback) {
      triggerHapticFeedback('medium');
    }
  };

  // Calculate board dimensions based on orientation
  const boardWidth = orientation === 'landscape' ? viewport.width : viewport.width;
  const boardHeight = orientation === 'landscape' ? viewport.height - 120 : viewport.height - 200;

  // Player positioning in a circle
  const centerX = boardWidth / 2;
  const centerY = boardHeight / 2;
  const radius = Math.min(boardWidth, boardHeight) * 0.3;

  const positionedPlayers = players.map((player, index) => {
    const angle = (index / players.length) * 2 * Math.PI - Math.PI / 2;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    
    return {
      ...player,
      position: { x, y },
    };
  });

  return (
    <div className={`relative w-full h-full bg-[#0a0a0f] ${className}`}>
      {/* Game Board */}
      <div
        ref={boardRef}
        className="relative w-full h-full overflow-hidden"
        style={{
          width: `${boardWidth}px`,
          height: `${boardHeight}px`,
        }}
      >
        {/* Board background */}
        <div
          className="absolute inset-0 bg-gradient-radial from-[#1a1a2e] to-[#0a0a0f] rounded-2xl"
          style={{
            transform: `scale(${zoom}) translate(${panOffset.x}px, ${panOffset.y}px)`,
            transformOrigin: 'center',
          }}
        >
          {/* Round table */}
          <div
            className="absolute border-4 border-[#3d3d7a]/30 rounded-full"
            style={{
              left: `${centerX - radius - 20}px`,
              top: `${centerY - radius - 20}px`,
              width: `${(radius + 20) * 2}px`,
              height: `${(radius + 20) * 2}px`,
            }}
          />

          {/* Players */}
          {positionedPlayers.map((player) => (
            <button
              key={player.id}
              onClick={() => handlePlayerSelect(player.id)}
              className={`
                absolute flex flex-col items-center justify-center
                w-16 h-16 rounded-full border-2 transform -translate-x-1/2 -translate-y-1/2
                transition-all duration-200 ease-out
                ${player.selected || selectedPlayer === player.id
                  ? 'border-[#3d3d7a] bg-[#3d3d7a]/30 scale-110 shadow-lg shadow-[#3d3d7a]/50'
                  : 'border-gray-400 bg-[#1a1a2e]/80 hover:border-white hover:scale-105'
                }
                ${!player.isConnected ? 'opacity-50 grayscale' : ''}
              `}
              style={{
                left: `${player.position.x}px`,
                top: `${player.position.y}px`,
                minWidth: '56px',
                minHeight: '56px',
              }}
              aria-label={`Select ${player.name}`}
            >
              {/* Player avatar */}
              <div className={`
                w-10 h-10 rounded-full bg-gradient-to-br from-[#3d3d7a] to-[#252547]
                flex items-center justify-center text-white font-bold text-sm
                ${!player.isConnected ? 'from-gray-600 to-gray-700' : ''}
              `}>
                {player.name.charAt(0).toUpperCase()}
              </div>

              {/* Connection indicator */}
              <div className={`
                absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-[#0a0a0f]
                ${player.isConnected ? 'bg-green-500' : 'bg-red-500'}
              `} />
            </button>
          ))}

          {/* Player names */}
          {positionedPlayers.map((player) => (
            <div
              key={`${player.id}-label`}
              className="absolute text-center transform -translate-x-1/2"
              style={{
                left: `${player.position.x}px`,
                top: `${player.position.y + 40}px`,
                width: '80px',
              }}
            >
              <span className={`
                text-xs font-medium px-2 py-1 rounded-full
                ${player.selected || selectedPlayer === player.id
                  ? 'text-[#3d3d7a] bg-[#3d3d7a]/20'
                  : 'text-gray-300 bg-[#1a1a2e]/60'
                }
                ${!player.isConnected ? 'opacity-50' : ''}
              `}>
                {player.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Zoom Controls */}
      {zoomEnabled && (
        <div className="absolute bottom-4 right-4 flex flex-col gap-2">
          <button
            onClick={handleZoomIn}
            className="p-3 bg-[#1a1a2e]/90 text-white rounded-full shadow-lg hover:bg-[#252547] transition-colors"
            aria-label="Zoom in"
          >
            <ZoomIn size={20} />
          </button>
          
          <button
            onClick={handleZoomOut}
            className="p-3 bg-[#1a1a2e]/90 text-white rounded-full shadow-lg hover:bg-[#252547] transition-colors"
            aria-label="Zoom out"
          >
            <ZoomOut size={20} />
          </button>
          
          <button
            onClick={resetZoom}
            className="p-3 bg-[#1a1a2e]/90 text-white rounded-full shadow-lg hover:bg-[#252547] transition-colors"
            aria-label="Reset zoom"
          >
            <RotateCw size={20} />
          </button>
        </div>
      )}

      {/* Orientation indicator */}
      <div className="absolute top-4 left-4 px-3 py-1 bg-[#1a1a2e]/90 rounded-full">
        <span className="text-sm text-gray-400">
          {orientation === 'landscape' ? 'Landscape' : 'Portrait'}
        </span>
      </div>

      {/* Zoom indicator */}
      <div className="absolute top-4 right-4 px-3 py-1 bg-[#1a1a2e]/90 rounded-full">
        <span className="text-sm text-gray-400">
          {Math.round(zoom * 100)}%
        </span>
      </div>
    </div>
  );
}
