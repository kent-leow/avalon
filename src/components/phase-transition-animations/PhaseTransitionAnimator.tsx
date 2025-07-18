'use client';

import { useState, useEffect, useRef } from 'react';
import type { PhaseTransitionAnimatorProps } from '~/types/phase-transition-animations';
import { TransitionEffects } from './TransitionEffects';
import { AudioCueManager } from './AudioCueManager';
import { CelebrationAnimations } from './CelebrationAnimations';
import { MotionPreferences } from './MotionPreferences';
import { usePhaseTransitionAnimations } from '~/hooks/usePhaseTransitionAnimations';
import { getPhaseTransitionConfig } from '~/lib/animation-utils';

export function PhaseTransitionAnimator({
  currentPhase,
  previousPhase,
  isTransitioning,
  transitionType,
  duration = 500,
  children,
  onTransitionComplete,
}: PhaseTransitionAnimatorProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [celebrationVisible, setCelebrationVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { 
    animationState, 
    startAnimation, 
    stopAnimation, 
    setMotionPreferences 
  } = usePhaseTransitionAnimations();

  // Handle phase transition animations
  useEffect(() => {
    if (isTransitioning && previousPhase && currentPhase !== previousPhase) {
      setIsAnimating(true);
      
      const config = getPhaseTransitionConfig(
        previousPhase, 
        currentPhase, 
        animationState.motionPreferences.animationIntensity
      );
      
      startAnimation(config);
      
      // Set celebration for game over
      if (currentPhase === 'gameOver') {
        setCelebrationVisible(true);
      }
      
      // Auto-complete transition after duration
      const timer = setTimeout(() => {
        setIsAnimating(false);
        onTransitionComplete?.();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [isTransitioning, currentPhase, previousPhase, duration, startAnimation, animationState.motionPreferences.animationIntensity, onTransitionComplete]);

  // Handle animation cleanup
  useEffect(() => {
    return () => {
      stopAnimation();
    };
  }, [stopAnimation]);

  const handleTransitionComplete = () => {
    setIsAnimating(false);
    onTransitionComplete?.();
  };

  const handleCelebrationComplete = () => {
    setCelebrationVisible(false);
  };

  return (
    <MotionPreferences
      respectReducedMotion={true}
      fallbackMode="minimal"
    >
      <div 
        ref={containerRef}
        className={`
          relative w-full h-full overflow-hidden
          ${isAnimating ? 'transition-all duration-500 ease-out' : ''}
        `}
        data-testid="phase-transition-animator"
        data-current-phase={currentPhase}
        data-is-transitioning={isTransitioning}
        data-is-animating={isAnimating}
      >
        {/* Transition Effects Layer */}
        <TransitionEffects
          effectType="fade"
          phase={currentPhase}
          isActive={isAnimating}
          intensity={animationState.motionPreferences.animationIntensity}
          duration={duration}
          onEffectComplete={handleTransitionComplete}
        />
        
        {/* Phase-specific additional effects */}
        {currentPhase === 'roleReveal' && (
          <TransitionEffects
            effectType="glow"
            phase={currentPhase}
            isActive={isAnimating}
            intensity={animationState.motionPreferences.animationIntensity}
            duration={duration}
          />
        )}
        
        {currentPhase === 'missionSelect' && (
          <TransitionEffects
            effectType="slide"
            phase={currentPhase}
            isActive={isAnimating}
            intensity={animationState.motionPreferences.animationIntensity}
            duration={duration}
          />
        )}
        
        {(currentPhase === 'voting' || currentPhase === 'missionVote') && (
          <TransitionEffects
            effectType="pulse"
            phase={currentPhase}
            isActive={isAnimating}
            intensity={animationState.motionPreferences.animationIntensity}
            duration={duration}
          />
        )}
        
        {currentPhase === 'missionResult' && (
          <TransitionEffects
            effectType="particles"
            phase={currentPhase}
            isActive={isAnimating}
            intensity={animationState.motionPreferences.animationIntensity}
            duration={duration}
          />
        )}
        
        {/* Audio Cue Manager */}
        <AudioCueManager
          currentPhase={currentPhase}
          enabled={animationState.audioEnabled && animationState.motionPreferences.enableAudio}
          volume={0.5}
          onAudioPlay={(audioId: string) => {
            console.log('Audio cue played:', audioId);
          }}
        />
        
        {/* Celebration Animations */}
        {celebrationVisible && currentPhase === 'gameOver' && (
          <CelebrationAnimations
            celebrationType="victory"
            isVisible={celebrationVisible}
            winner="good" // This would come from game state
            onCelebrationComplete={handleCelebrationComplete}
          />
        )}
        
        {/* Main Content */}
        <div className={`
          relative z-10 w-full h-full
          ${isAnimating ? 'transition-opacity duration-500' : ''}
        `}>
          {children}
        </div>
        
        {/* Loading Overlay */}
        {isAnimating && (
          <div 
            className="absolute inset-0 z-20 flex items-center justify-center bg-black/20 backdrop-blur-sm"
            data-testid="transition-loading-overlay"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 border-2 border-#3b82f6 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-white font-medium">
                {transitionType === 'phase' ? 'Transitioning...' : 
                 transitionType === 'celebration' ? 'Celebrating...' : 
                 'Loading...'}
              </span>
            </div>
          </div>
        )}
      </div>
    </MotionPreferences>
  );
}
