'use client';

import { useState, useEffect, useRef } from 'react';
import type { ActionFeedbackProps } from '~/types/phase-transition-animations';
import { getActionFeedbackConfig } from '~/lib/animation-utils';

export function ActionFeedback({
  actionType,
  success = true,
  position,
  duration = 200,
  onFeedbackComplete,
}: ActionFeedbackProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackColor, setFeedbackColor] = useState('#22c55e');
  const feedbackRef = useRef<HTMLDivElement>(null);

  // Initialize feedback animation
  useEffect(() => {
    if (actionType) {
      setIsVisible(true);
      
      // Set feedback text and color
      const text = getFeedbackText(actionType, success);
      const color = getFeedbackColor(actionType, success);
      
      setFeedbackText(text);
      setFeedbackColor(color);
      
      // Auto-complete feedback after duration
      const timer = setTimeout(() => {
        setIsVisible(false);
        onFeedbackComplete?.();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [actionType, success, duration, onFeedbackComplete]);

  // Get feedback text based on action and success
  const getFeedbackText = (action: string, isSuccess: boolean) => {
    const actionTexts = {
      vote: isSuccess ? 'Vote Cast!' : 'Vote Failed',
      select: isSuccess ? 'Selected!' : 'Selection Failed',
      confirm: isSuccess ? 'Confirmed!' : 'Confirmation Failed',
      reject: isSuccess ? 'Rejected!' : 'Rejection Failed',
      join: isSuccess ? 'Joined!' : 'Join Failed',
      leave: isSuccess ? 'Left!' : 'Leave Failed',
      start: isSuccess ? 'Started!' : 'Start Failed',
      end: isSuccess ? 'Ended!' : 'End Failed',
    };
    
    return actionTexts[action as keyof typeof actionTexts] || (isSuccess ? 'Success!' : 'Failed!');
  };

  // Get feedback color based on action and success
  const getFeedbackColor = (action: string, isSuccess: boolean) => {
    if (!isSuccess) return '#ef4444'; // Red for failures
    
    const actionColors = {
      vote: '#22c55e',      // Green
      select: '#3b82f6',    // Blue
      confirm: '#22c55e',   // Green
      reject: '#ef4444',    // Red
      join: '#10b981',      // Emerald
      leave: '#f59e0b',     // Amber
      start: '#8b5cf6',     // Purple
      end: '#6b7280',       // Gray
    };
    
    return actionColors[action as keyof typeof actionColors] || '#22c55e';
  };

  // Get feedback icon based on action and success
  const getFeedbackIcon = (action: string, isSuccess: boolean) => {
    if (!isSuccess) return '✕';
    
    const actionIcons = {
      vote: '✓',
      select: '👆',
      confirm: '✓',
      reject: '✕',
      join: '👥',
      leave: '👋',
      start: '▶️',
      end: '⏹️',
    };
    
    return actionIcons[action as keyof typeof actionIcons] || '✓';
  };

  // Get animation classes based on action type
  const getAnimationClasses = () => {
    if (!isVisible) return 'opacity-0 scale-0';
    
    let classes = 'opacity-100 transition-all duration-200 ease-out';
    
    if (success) {
      switch (actionType) {
        case 'vote':
        case 'select':
        case 'confirm':
          classes += ' scale-110 animate-bounce';
          break;
        case 'join':
          classes += ' scale-105 animate-pulse';
          break;
        case 'start':
          classes += ' scale-110 animate-ping';
          break;
        default:
          classes += ' scale-105';
      }
    } else {
      classes += ' animate-shake';
    }
    
    return classes;
  };

  // Get position styles
  const getPositionStyles = () => {
    if (!position) {
      return {
        position: 'fixed' as const,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 9999,
      };
    }
    
    return {
      position: 'absolute' as const,
      left: position.x,
      top: position.y,
      transform: 'translate(-50%, -50%)',
      zIndex: 9999,
    };
  };

  // Render ripple effect
  const renderRippleEffect = () => {
    if (!success) return null;
    
    return (
      <div
        className="absolute inset-0 rounded-full animate-ping"
        style={{
          backgroundColor: feedbackColor,
          opacity: 0.3,
        }}
      />
    );
  };

  // Render particle burst
  const renderParticleBurst = () => {
    if (!success || actionType === 'reject') return null;
    
    return Array.from({ length: 6 }, (_, i) => (
      <div
        key={i}
        className="absolute w-2 h-2 rounded-full"
        style={{
          backgroundColor: feedbackColor,
          left: '50%',
          top: '50%',
          transform: `translate(-50%, -50%) rotate(${i * 60}deg) translateY(-20px)`,
          animation: `particle-burst 0.3s ease-out ${i * 0.05}s forwards`,
        }}
      />
    ));
  };

  if (!isVisible) return null;

  return (
    <div
      ref={feedbackRef}
      className={`
        pointer-events-none select-none
        ${getAnimationClasses()}
      `}
      style={getPositionStyles()}
      data-testid="action-feedback"
      data-action-type={actionType}
      data-success={success}
      data-is-visible={isVisible}
    >
      {/* Ripple effect */}
      {renderRippleEffect()}
      
      {/* Particle burst */}
      {renderParticleBurst()}
      
      {/* Main feedback content */}
      <div
        className="relative flex items-center justify-center min-w-32 px-4 py-2 rounded-full shadow-lg backdrop-blur-sm"
        style={{
          backgroundColor: `${feedbackColor}20`,
          border: `2px solid ${feedbackColor}80`,
          boxShadow: `0 0 20px ${feedbackColor}40`,
        }}
      >
        {/* Icon */}
        <span
          className="text-2xl mr-2"
          style={{ color: feedbackColor }}
        >
          {getFeedbackIcon(actionType, success)}
        </span>
        
        {/* Text */}
        <span
          className="font-semibold text-sm"
          style={{ color: feedbackColor }}
        >
          {feedbackText}
        </span>
      </div>
      
      {/* Glow effect */}
      <div
        className="absolute inset-0 rounded-full blur-md opacity-50"
        style={{
          backgroundColor: feedbackColor,
          animation: success ? 'glow-pulse 0.3s ease-out' : 'none',
        }}
      />
    </div>
  );
}
