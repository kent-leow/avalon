'use client';

import { type FC, useEffect, useState } from 'react';
import { type TooltipContent } from '~/types/player-guidance';

export interface GameplayTooltipProps {
  content: TooltipContent;
  visible: boolean;
  onClose: () => void;
  onInteraction?: (type: string) => void;
  className?: string;
}

export const GameplayTooltip: FC<GameplayTooltipProps> = ({
  content,
  visible,
  onClose,
  onInteraction,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  // Auto-dismiss after timeout
  useEffect(() => {
    if (!visible) return;

    const timer = setTimeout(() => {
      onClose();
      onInteraction?.('tooltip_auto_dismissed');
    }, 10000); // 10 seconds

    return () => clearTimeout(timer);
  }, [visible, onClose, onInteraction]);

  // Calculate position
  useEffect(() => {
    if (!visible) return;

    // Mock positioning - in real implementation, this would be based on
    // the target element's position
    setPosition({ x: 20, y: 20 });
  }, [visible]);

  if (!visible) {
    return null;
  }

  return (
    <div
      className={`fixed z-50 pointer-events-auto ${className}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg max-w-sm">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900">{content.title}</h3>
          <button
            onClick={() => {
              onClose();
              onInteraction?.('tooltip_dismissed');
            }}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-3">
          <div className="text-sm text-gray-600 mb-3">{content.description}</div>

          {/* Additional details (expandable) */}
          {content.actionRequired && (
            <div className="mt-3">
              <button
                onClick={() => {
                  setIsExpanded(!isExpanded);
                  onInteraction?.('tooltip_expanded');
                }}
                className="flex items-center text-xs text-blue-600 hover:text-blue-800 transition-colors"
              >
                <span>{isExpanded ? 'Show Less' : 'Show More'}</span>
                <svg
                  className={`w-3 h-3 ml-1 transform transition-transform ${
                    isExpanded ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {isExpanded && (
                <div className="mt-2 text-xs text-gray-500 bg-gray-50 p-2 rounded">
                  {content.actionRequired}
                </div>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex justify-end gap-2 mt-3">
            <button
              onClick={() => {
                onClose();
                onInteraction?.('tooltip_dismissed');
              }}
              className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
            >
              Got it
            </button>
            
            {content.actionRequired && (
              <button
                onClick={() => {
                  onInteraction?.('tooltip_action_clicked');
                  onClose();
                }}
                className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
              >
                Take Action
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
