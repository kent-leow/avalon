'use client';

import { useState, useEffect, useRef } from 'react';
import type { TransitionEffectsProps } from '~/types/phase-transition-animations';
import { getCSSAnimationName, getCSSTransitionProperty } from '~/lib/animation-utils';

export function TransitionEffects({
  effectType,
  phase,
  isActive,
  intensity = 'moderate',
  duration = 300,
  onEffectComplete,
}: TransitionEffectsProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [particleCount, setParticleCount] = useState(0);
  const effectRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (isActive) {
      setIsVisible(true);
      
      // Set particle count for particle effects
      if (effectType === 'particles') {
        const count = intensity === 'subtle' ? 20 : 
                     intensity === 'moderate' ? 50 : 100;
        setParticleCount(count);
      }
      
      // Auto-complete effect after duration
      const timer = setTimeout(() => {
        setIsVisible(false);
        onEffectComplete?.();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [isActive, effectType, intensity, duration, onEffectComplete]);

  const getEffectClasses = () => {
    const baseClasses = 'absolute inset-0 pointer-events-none';
    const animationName = getCSSAnimationName(effectType);
    const transitionProperty = getCSSTransitionProperty(effectType);
    
    let effectClasses = baseClasses;
    
    if (isVisible) {
      effectClasses += ` animate-${animationName}`;
      
      switch (effectType) {
        case 'fade':
          effectClasses += ' bg-black/10 transition-opacity';
          break;
        case 'slide':
          effectClasses += ' bg-gradient-to-r from-transparent via-white/5 to-transparent transform transition-transform';
          break;
        case 'scale':
          effectClasses += ' bg-radial-gradient from-white/5 to-transparent transform transition-transform';
          break;
        case 'glow':
          effectClasses += ' bg-gradient-radial from-#3b82f6/20 to-transparent';
          break;
        case 'pulse':
          effectClasses += ' bg-gradient-radial from-#22c55e/10 to-transparent';
          break;
        case 'shake':
          effectClasses += ' transform';
          break;
        case 'bounce':
          effectClasses += ' transform';
          break;
        default:
          effectClasses += ' bg-black/5';
      }
      
      // Intensity-based opacity
      if (intensity === 'subtle') {
        effectClasses += ' opacity-30';
      } else if (intensity === 'dramatic') {
        effectClasses += ' opacity-80';
      } else {
        effectClasses += ' opacity-50';
      }
    }
    
    return effectClasses;
  };

  const getParticleColor = () => {
    switch (phase) {
      case 'roleReveal':
        return '#3b82f6';
      case 'missionSelect':
        return '#f59e0b';
      case 'voting':
      case 'missionVote':
        return '#22c55e';
      case 'missionResult':
        return '#ef4444';
      case 'gameOver':
        return '#22c55e';
      default:
        return '#3b82f6';
    }
  };

  const renderParticles = () => {
    if (effectType !== 'particles' || !isVisible) return null;
    
    return Array.from({ length: particleCount }, (_, i) => (
      <div
        key={i}
        className="absolute w-2 h-2 rounded-full animate-float"
        style={{
          backgroundColor: getParticleColor(),
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 2}s`,
          animationDuration: `${2 + Math.random() * 2}s`,
          opacity: 0.7,
        }}
        data-testid={`particle-${i}`}
      />
    ));
  };

  const renderGlowEffect = () => {
    if (effectType !== 'glow' || !isVisible) return null;
    
    return (
      <div className="absolute inset-0 pointer-events-none">
        <div 
          className="absolute inset-0 rounded-full blur-xl"
          style={{
            background: `radial-gradient(circle, ${getParticleColor()}40 0%, transparent 70%)`,
            animation: `pulse ${duration}ms ease-in-out infinite`,
          }}
        />
      </div>
    );
  };

  const renderSlideEffect = () => {
    if (effectType !== 'slide' || !isVisible) return null;
    
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute inset-y-0 w-full bg-gradient-to-r from-transparent via-white/10 to-transparent"
          style={{
            animation: `slide-across ${duration}ms ease-out`,
          }}
        />
      </div>
    );
  };

  if (!isVisible && effectType !== 'particles') return null;

  return (
    <div
      ref={effectRef}
      className={getEffectClasses()}
      style={{
        animationDuration: `${duration}ms`,
        transitionDuration: `${duration}ms`,
      }}
      data-testid={`transition-effect-${effectType}`}
      data-phase={phase}
      data-intensity={intensity}
      data-is-active={isActive}
    >
      {renderParticles()}
      {renderGlowEffect()}
      {renderSlideEffect()}
    </div>
  );
}
