'use client';

import { useEffect, useRef, useState } from 'react';
import type { AudioCueManagerProps } from '~/types/phase-transition-animations';

export function AudioCueManager({
  currentPhase,
  actionType,
  volume = 0.5,
  enabled = true,
  onAudioPlay,
}: AudioCueManagerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Initialize AudioContext for better control
  useEffect(() => {
    if (enabled && typeof window !== 'undefined') {
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      setAudioContext(context);
      
      return () => {
        context.close();
      };
    }
  }, [enabled]);

  // Get audio file path based on phase or action
  const getAudioPath = () => {
    if (actionType) {
      switch (actionType) {
        case 'vote':
          return '/audio/vote-cast.mp3';
        case 'select':
          return '/audio/player-select.mp3';
        case 'confirm':
          return '/audio/confirm.mp3';
        case 'reject':
          return '/audio/reject.mp3';
        case 'join':
          return '/audio/player-join.mp3';
        case 'leave':
          return '/audio/player-leave.mp3';
        case 'start':
          return '/audio/game-start.mp3';
        case 'end':
          return '/audio/game-end.mp3';
        default:
          return '/audio/default-action.mp3';
      }
    }
    
    switch (currentPhase) {
      case 'lobby':
        return '/audio/lobby-ambient.mp3';
      case 'roleReveal':
        return '/audio/role-reveal.mp3';
      case 'missionSelect':
        return '/audio/mission-select.mp3';
      case 'voting':
      case 'missionVote':
        return '/audio/voting-phase.mp3';
      case 'missionResult':
        return '/audio/mission-result.mp3';
      case 'assassinAttempt':
        return '/audio/assassin-attempt.mp3';
      case 'gameOver':
        return '/audio/game-over.mp3';
      default:
        return '/audio/default-phase.mp3';
    }
  };

  // Play audio cue
  const playAudioCue = async (audioPath: string) => {
    if (!enabled || !audioContext) return;
    
    try {
      setIsPlaying(true);
      
      // Create audio element
      const audio = new Audio(audioPath);
      audio.volume = volume;
      audioRef.current = audio;
      
      // Play audio
      await audio.play();
      
      // Notify parent component
      onAudioPlay?.(audioPath);
      
      // Handle audio end
      audio.addEventListener('ended', () => {
        setIsPlaying(false);
        audioRef.current = null;
      });
      
      // Handle audio error (fallback to silent)
      audio.addEventListener('error', () => {
        console.warn('Audio file not found:', audioPath);
        setIsPlaying(false);
        audioRef.current = null;
      });
      
    } catch (error) {
      console.warn('Audio playback failed:', error);
      setIsPlaying(false);
      audioRef.current = null;
    }
  };

  // Stop current audio
  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setIsPlaying(false);
  };

  // Play phase transition audio
  useEffect(() => {
    if (enabled && currentPhase) {
      const audioPath = getAudioPath();
      playAudioCue(audioPath);
    }
    
    return () => {
      stopAudio();
    };
  }, [currentPhase, enabled]);

  // Play action audio
  useEffect(() => {
    if (enabled && actionType) {
      const audioPath = getAudioPath();
      playAudioCue(audioPath);
    }
  }, [actionType, enabled]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  // Create synthetic audio for testing (beep sounds)
  const createSyntheticAudio = (frequency: number, duration: number) => {
    if (!audioContext) return;
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume * 0.1, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
    
    onAudioPlay?.(`synthetic-${frequency}hz`);
  };

  // Fallback synthetic audio for missing files
  const playSyntheticCue = () => {
    if (!enabled || !audioContext) return;
    
    let frequency = 440; // Default A4
    
    if (actionType) {
      switch (actionType) {
        case 'vote':
        case 'select':
          frequency = 523; // C5
          break;
        case 'confirm':
          frequency = 659; // E5
          break;
        case 'reject':
          frequency = 311; // Eb4
          break;
        case 'join':
          frequency = 587; // D5
          break;
        case 'leave':
          frequency = 392; // G4
          break;
        case 'start':
          frequency = 698; // F5
          break;
        case 'end':
          frequency = 349; // F4
          break;
      }
    } else {
      switch (currentPhase) {
        case 'lobby':
          frequency = 440; // A4
          break;
        case 'roleReveal':
          frequency = 523; // C5
          break;
        case 'missionSelect':
          frequency = 587; // D5
          break;
        case 'voting':
        case 'missionVote':
          frequency = 659; // E5
          break;
        case 'missionResult':
          frequency = 698; // F5
          break;
        case 'assassinAttempt':
          frequency = 311; // Eb4
          break;
        case 'gameOver':
          frequency = 784; // G5
          break;
      }
    }
    
    createSyntheticAudio(frequency, 0.2);
  };

  return (
    <div
      className="sr-only"
      data-testid="audio-cue-manager"
      data-current-phase={currentPhase}
      data-action-type={actionType}
      data-is-playing={isPlaying}
      data-enabled={enabled}
    >
      {/* Audio status for screen readers */}
      <span aria-live="polite" aria-atomic="true">
        {isPlaying && `Audio cue playing for ${currentPhase || actionType}`}
      </span>
      
      {/* Fallback synthetic audio button (for testing) */}
      {process.env.NODE_ENV === 'development' && (
        <button
          onClick={playSyntheticCue}
          className="fixed bottom-4 right-4 p-2 bg-gray-800 text-white rounded-full opacity-50 hover:opacity-100 transition-opacity"
          title="Play synthetic audio cue"
        >
          🔊
        </button>
      )}
    </div>
  );
}
