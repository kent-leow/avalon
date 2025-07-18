'use client';

import { type FC, useEffect, useRef, useState } from 'react';
import { type GameAction } from '~/types/player-guidance';

export interface ActionIndicatorProps {
  action: GameAction;
  visible: boolean;
  onHover?: () => void;
  onLeave?: () => void;
  onClick?: () => void;
  className?: string;
}

export const ActionIndicator: FC<ActionIndicatorProps> = ({
  action,
  visible,
  onHover,
  onLeave,
  onClick,
  className = '',
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const indicatorRef = useRef<HTMLDivElement>(null);

  // Calculate position based on action type
  useEffect(() => {
    if (!visible) return;

    // Mock positioning logic - in real implementation, this would be based on
    // the actual UI elements the action relates to
    const mockPositions = {
      vote: { x: 50, y: 200 },
      'select-team': { x: 150, y: 300 },
      'approve-mission': { x: 250, y: 400 },
      'reject-mission': { x: 350, y: 400 },
      'pass-mission': { x: 200, y: 500 },
      'fail-mission': { x: 300, y: 500 },
      'assassinate': { x: 400, y: 600 },
    };

    const basePosition = mockPositions[action.type as keyof typeof mockPositions] || { x: 100, y: 100 };
    setPosition(basePosition);
  }, [action.type, visible]);

  if (!visible || !action.available) {
    return null;
  }

  return (
    <div
      ref={indicatorRef}
      className={`absolute z-20 pointer-events-auto ${className}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, -50%)',
      }}
      onMouseEnter={() => {
        setIsHovered(true);
        onHover?.();
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        onLeave?.();
      }}
      onClick={onClick}
    >
      {/* Pulsing indicator */}
      <div className="relative">
        <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-75" />
        <div className="relative bg-blue-600 rounded-full w-8 h-8 flex items-center justify-center shadow-lg cursor-pointer hover:bg-blue-700 transition-colors">
          <svg
            className="w-4 h-4 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        </div>
      </div>

      {/* Hover tooltip */}
      {isHovered && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg whitespace-nowrap z-30">
          <div className="font-medium">{action.label}</div>
          <div className="text-xs text-gray-300 mt-1">{action.description}</div>
          
          {/* Requirements */}
          {action.requirements.length > 0 && (
            <div className="text-xs text-yellow-300 mt-1">
              Requirements: {action.requirements.join(', ')}
            </div>
          )}
          
          {/* Tooltip arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
        </div>
      )}
    </div>
  );
};
