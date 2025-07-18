'use client';

import { type FC, useState, useEffect } from 'react';
import { type StrategyHint as StrategyHintType } from '~/types/player-guidance';

export interface StrategyHintProps {
  hint: StrategyHintType;
  visible: boolean;
  onDismiss: () => void;
  onInteraction?: (type: string) => void;
  className?: string;
}

export const StrategyHint: FC<StrategyHintProps> = ({
  hint,
  visible,
  onDismiss,
  onInteraction,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Auto-dismiss for low priority hints
  useEffect(() => {
    if (!visible || hint.priority === 'high') return;

    const dismissTime = hint.priority === 'medium' ? 15000 : 8000;
    const timer = setTimeout(() => {
      onDismiss();
      onInteraction?.('hint_auto_dismissed');
    }, dismissTime);

    return () => clearTimeout(timer);
  }, [visible, hint.priority, onDismiss, onInteraction]);

  if (!visible) {
    return null;
  }

  const priorityColors = {
    low: 'bg-blue-50 border-blue-200 text-blue-800',
    medium: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    high: 'bg-red-50 border-red-200 text-red-800',
  };

  const priorityIcons = {
    low: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    medium: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    ),
    high: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  };

  return (
    <div 
      className={`fixed bottom-4 left-4 z-40 max-w-sm transform transition-all duration-300 ${
        isHovered ? 'scale-105' : ''
      } ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`border rounded-lg shadow-lg ${priorityColors[hint.priority]}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-current border-opacity-20">
          <div className="flex items-center gap-2">
            {priorityIcons[hint.priority]}
            <span className="text-sm font-semibold">{hint.title}</span>
          </div>
          <button
            onClick={() => {
              onDismiss();
              onInteraction?.('hint_dismissed');
            }}
            className="text-current opacity-60 hover:opacity-100 transition-opacity"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-3">
          <div className="text-sm text-current opacity-80 mb-3">{hint.content}</div>

          {/* Type indicator */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-current opacity-60 uppercase font-medium">
              {hint.type}
            </span>
            <span className="text-xs text-current opacity-60">
              Priority: {hint.priority}
            </span>
          </div>

          {/* Expand/Collapse for more details */}
          <button
            onClick={() => {
              setIsExpanded(!isExpanded);
              onInteraction?.('hint_expanded');
            }}
            className="mt-2 text-xs text-current opacity-60 hover:opacity-100 transition-opacity flex items-center gap-1"
          >
            <span>{isExpanded ? 'Show Less' : 'Show More'}</span>
            <svg
              className={`w-3 h-3 transform transition-transform ${
                isExpanded ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Expanded content */}
          {isExpanded && (
            <div className="mt-2 text-xs text-current opacity-60 bg-current bg-opacity-10 p-2 rounded">
              <div className="mb-1">
                <strong>Conditions:</strong>
              </div>
              {hint.conditions.map((condition, index) => (
                <div key={index} className="ml-2">
                  • {condition.type} {condition.operator} {String(condition.value)}
                </div>
              ))}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex justify-end gap-2 mt-3">
            <button
              onClick={() => {
                onDismiss();
                onInteraction?.('hint_dismissed');
              }}
              className="text-xs text-current opacity-60 hover:opacity-100 transition-opacity"
            >
              Dismiss
            </button>
            
            {hint.type === 'action' && (
              <button
                onClick={() => {
                  onInteraction?.('hint_action_clicked');
                  onDismiss();
                }}
                className="text-xs bg-current text-white px-3 py-1 rounded hover:bg-opacity-80 transition-colors"
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
