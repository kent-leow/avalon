'use client';

import { useState, useEffect, useRef } from 'react';
import type { CelebrationAnimationsProps } from '~/types/phase-transition-animations';
import { createParticleConfig } from '~/lib/animation-utils';

export function CelebrationAnimations({
  celebrationType,
  isVisible,
  winner,
  players = [],
  onCelebrationComplete,
}: CelebrationAnimationsProps) {
  const [animationPhase, setAnimationPhase] = useState<'intro' | 'celebration' | 'outro'>('intro');
  const [particleCount, setParticleCount] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);

  // Initialize celebration animation
  useEffect(() => {
    if (isVisible) {
      setAnimationPhase('intro');
      
      // Set particle count based on celebration type
      const count = celebrationType === 'victory' ? 100 : 
                   celebrationType === 'achievement' ? 50 : 30;
      setParticleCount(count);
      
      // Animation sequence
      const introTimer = setTimeout(() => {
        setAnimationPhase('celebration');
      }, 500);
      
      const celebrationTimer = setTimeout(() => {
        setAnimationPhase('outro');
      }, 2000);
      
      const outroTimer = setTimeout(() => {
        onCelebrationComplete?.();
      }, 2500);
      
      return () => {
        clearTimeout(introTimer);
        clearTimeout(celebrationTimer);
        clearTimeout(outroTimer);
      };
    }
  }, [isVisible, celebrationType, onCelebrationComplete]);

  // Get celebration colors based on winner and type
  const getCelebrationColors = () => {
    if (celebrationType === 'victory') {
      return winner === 'good' ? 
        ['#22c55e', '#16a34a', '#15803d'] : // Green for good
        ['#ef4444', '#dc2626', '#b91c1c']; // Red for evil
    } else if (celebrationType === 'achievement') {
      return ['#f59e0b', '#d97706', '#b45309']; // Gold for achievement
    } else if (celebrationType === 'milestone') {
      return ['#3b82f6', '#2563eb', '#1d4ed8']; // Blue for milestone
    }
    return ['#6b7280', '#4b5563', '#374151']; // Gray for defeat
  };

  // Get celebration message
  const getCelebrationMessage = () => {
    if (celebrationType === 'victory') {
      return winner === 'good' ? 'Good Triumphs!' : 'Evil Prevails!';
    } else if (celebrationType === 'achievement') {
      return 'Achievement Unlocked!';
    } else if (celebrationType === 'milestone') {
      return 'Milestone Reached!';
    }
    return 'Game Over';
  };

  // Render fireworks particles
  const renderFireworks = () => {
    const colors = getCelebrationColors();
    
    return Array.from({ length: particleCount }, (_, i) => {
      const angle = (i / particleCount) * Math.PI * 2;
      const radius = Math.random() * 200 + 50;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      return (
        <div
          key={i}
          className="absolute w-3 h-3 rounded-full"
          style={{
            backgroundColor: color,
            left: '50%',
            top: '50%',
            transform: `translate(-50%, -50%)`,
            animation: `firework-${i} 2s ease-out forwards`,
          }}
          data-testid={`firework-${i}`}
        />
      );
    });
  };

  // Render confetti particles
  const renderConfetti = () => {
    const colors = getCelebrationColors();
    
    return Array.from({ length: particleCount }, (_, i) => {
      const color = colors[Math.floor(Math.random() * colors.length)];
      const size = Math.random() * 8 + 4;
      const rotation = Math.random() * 360;
      const fallDelay = Math.random() * 1000;
      
      return (
        <div
          key={i}
          className="absolute"
          style={{
            left: `${Math.random() * 100}%`,
            top: `-${size}px`,
            width: `${size}px`,
            height: `${size}px`,
            backgroundColor: color,
            transform: `rotate(${rotation}deg)`,
            animation: `confetti-fall 3s linear ${fallDelay}ms forwards`,
          }}
          data-testid={`confetti-${i}`}
        />
      );
    });
  };

  // Render star burst effect
  const renderStarBurst = () => {
    const colors = getCelebrationColors();
    
    return Array.from({ length: 8 }, (_, i) => {
      const angle = (i / 8) * Math.PI * 2;
      const color = colors[i % colors.length];
      
      return (
        <div
          key={i}
          className="absolute w-1 h-20 origin-bottom"
          style={{
            backgroundColor: color,
            left: '50%',
            top: '50%',
            transform: `translate(-50%, -100%) rotate(${angle}rad)`,
            animation: `star-burst 1s ease-out forwards`,
            animationDelay: `${i * 0.1}s`,
          }}
          data-testid={`star-${i}`}
        />
      );
    });
  };

  // Render celebration text
  const renderCelebrationText = () => {
    const message = getCelebrationMessage();
    const colors = getCelebrationColors();
    
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className={`
            text-6xl font-bold text-center
            ${animationPhase === 'intro' ? 'scale-0 opacity-0' : ''}
            ${animationPhase === 'celebration' ? 'scale-100 opacity-100' : ''}
            ${animationPhase === 'outro' ? 'scale-110 opacity-0' : ''}
            transition-all duration-500 ease-out
          `}
          style={{
            color: colors[0],
            textShadow: `0 0 20px ${colors[0]}80, 0 0 40px ${colors[0]}40`,
          }}
          data-testid="celebration-text"
        >
          {message}
        </div>
      </div>
    );
  };

  // Render winner highlight
  const renderWinnerHighlight = () => {
    if (celebrationType !== 'victory' || !winner) return null;
    
    const colors = getCelebrationColors();
    
    return (
      <div className="absolute inset-0 pointer-events-none">
        <div
          className={`
            absolute inset-0 rounded-full
            ${animationPhase === 'celebration' ? 'animate-pulse' : ''}
          `}
          style={{
            background: `radial-gradient(circle, ${colors[0]}20 0%, transparent 70%)`,
            animation: animationPhase === 'celebration' ? 'winner-glow 2s ease-in-out infinite' : 'none',
          }}
          data-testid="winner-highlight"
        />
      </div>
    );
  };

  if (!isVisible) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 pointer-events-none overflow-hidden"
      data-testid="celebration-animations"
      data-celebration-type={celebrationType}
      data-winner={winner}
      data-animation-phase={animationPhase}
    >
      {/* Background overlay */}
      <div
        className={`
          absolute inset-0 bg-black/40
          ${animationPhase === 'intro' ? 'opacity-0' : ''}
          ${animationPhase === 'celebration' ? 'opacity-100' : ''}
          ${animationPhase === 'outro' ? 'opacity-0' : ''}
          transition-opacity duration-500
        `}
      />
      
      {/* Celebration effects */}
      <div className="absolute inset-0">
        {celebrationType === 'victory' && renderFireworks()}
        {celebrationType === 'achievement' && renderConfetti()}
        {celebrationType === 'milestone' && renderStarBurst()}
        {celebrationType === 'defeat' && renderConfetti()}
      </div>
      
      {/* Winner highlight */}
      {renderWinnerHighlight()}
      
      {/* Celebration text */}
      {renderCelebrationText()}
      
      {/* Additional effects for dramatic celebration */}
      {celebrationType === 'victory' && (
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle at 50% 50%, ${getCelebrationColors()[0]}10 0%, transparent 50%)`,
              animation: animationPhase === 'celebration' ? 'celebration-pulse 1s ease-in-out infinite' : 'none',
            }}
          />
        </div>
      )}
    </div>
  );
}
