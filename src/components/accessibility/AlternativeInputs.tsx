/**
 * Alternative Input Methods Component
 * 
 * Provides support for alternative input methods such as voice control,
 * switch control, eye tracking, and head tracking for users with motor impairments.
 */

'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useAccessibility } from '~/hooks/useAccessibility';
import type { InputMethod, AccessibilitySettings } from '~/types/accessibility';

interface AlternativeInputsProps {
  children: React.ReactNode;
  enabledInputs: InputMethod[];
  onInputMethodChange?: (method: InputMethod) => void;
  settings: AccessibilitySettings;
}

interface VoiceCommand {
  command: string;
  action: () => void;
  description: string;
}

interface SwitchControlState {
  enabled: boolean;
  currentFocusIndex: number;
  scanInterval: number;
  dwellTime: number;
}

interface EyeTrackingState {
  enabled: boolean;
  calibrated: boolean;
  gazePoint: { x: number; y: number } | null;
  dwellTime: number;
  dwellThreshold: number;
}

const AlternativeInputs: React.FC<AlternativeInputsProps> = ({
  children,
  enabledInputs,
  onInputMethodChange,
  settings,
}) => {
  const { announce } = useAccessibility();
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeInputMethod, setActiveInputMethod] = useState<InputMethod | null>(null);
  
  // Voice control state
  const [voiceCommands, setVoiceCommands] = useState<VoiceCommand[]>([]);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  
  // Switch control state
  const [switchControl, setSwitchControl] = useState<SwitchControlState>({
    enabled: false,
    currentFocusIndex: 0,
    scanInterval: 1000,
    dwellTime: 500,
  });
  
  // Eye tracking state
  const [eyeTracking, setEyeTracking] = useState<EyeTrackingState>({
    enabled: false,
    calibrated: false,
    gazePoint: null,
    dwellTime: 0,
    dwellThreshold: 1000,
  });

  // Initialize voice commands
  useEffect(() => {
    const defaultCommands: VoiceCommand[] = [
      {
        command: 'click',
        action: () => {
          const focusedElement = document.activeElement as HTMLElement;
          if (focusedElement) {
            focusedElement.click();
            announce('Voice command: Click executed');
          }
        },
        description: 'Click the focused element',
      },
      {
        command: 'next',
        action: () => {
          const focusableElements = document.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          const current = document.activeElement;
          const currentIndex = Array.from(focusableElements).indexOf(current as Element);
          const nextIndex = (currentIndex + 1) % focusableElements.length;
          (focusableElements[nextIndex] as HTMLElement).focus();
          announce('Voice command: Next element focused');
        },
        description: 'Focus next element',
      },
      {
        command: 'previous',
        action: () => {
          const focusableElements = document.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          const current = document.activeElement;
          const currentIndex = Array.from(focusableElements).indexOf(current as Element);
          const prevIndex = currentIndex === 0 ? focusableElements.length - 1 : currentIndex - 1;
          (focusableElements[prevIndex] as HTMLElement).focus();
          announce('Voice command: Previous element focused');
        },
        description: 'Focus previous element',
      },
      {
        command: 'back',
        action: () => {
          window.history.back();
          announce('Voice command: Navigate back');
        },
        description: 'Navigate back',
      },
      {
        command: 'scroll up',
        action: () => {
          window.scrollBy(0, -200);
          announce('Voice command: Scroll up');
        },
        description: 'Scroll up',
      },
      {
        command: 'scroll down',
        action: () => {
          window.scrollBy(0, 200);
          announce('Voice command: Scroll down');
        },
        description: 'Scroll down',
      },
    ];
    
    setVoiceCommands(defaultCommands);
  }, [announce]);

  // Initialize voice recognition
  useEffect(() => {
    if (!enabledInputs.includes('voice')) return;

    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
      
      recognitionRef.current.onresult = (event: any) => {
        const last = event.results.length - 1;
        const transcript = event.results[last][0].transcript.toLowerCase().trim();
        
        const matchedCommand = voiceCommands.find(cmd => 
          transcript.includes(cmd.command.toLowerCase())
        );
        
        if (matchedCommand) {
          matchedCommand.action();
        }
      };
      
      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        announce('Voice recognition error occurred');
      };
      
      recognitionRef.current.onend = () => {
        if (isListening) {
          recognitionRef.current.start();
        }
      };
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [enabledInputs, voiceCommands, isListening, announce]);

  // Initialize switch control
  useEffect(() => {
    if (!enabledInputs.includes('switch')) return;

    let scanInterval: NodeJS.Timeout;
    
    if (switchControl.enabled) {
      const focusableElements = document.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      scanInterval = setInterval(() => {
        if (focusableElements.length > 0) {
          const nextIndex = (switchControl.currentFocusIndex + 1) % focusableElements.length;
          (focusableElements[nextIndex] as HTMLElement).focus();
          setSwitchControl(prev => ({ ...prev, currentFocusIndex: nextIndex }));
        }
      }, switchControl.scanInterval);
    }
    
    return () => {
      if (scanInterval) clearInterval(scanInterval);
    };
  }, [enabledInputs, switchControl.enabled, switchControl.scanInterval, switchControl.currentFocusIndex]);

  // Initialize eye tracking (mock implementation)
  useEffect(() => {
    if (!enabledInputs.includes('eye-tracking')) return;

    let gazeInterval: NodeJS.Timeout;
    
    if (eyeTracking.enabled && eyeTracking.calibrated) {
      // Mock eye tracking - in reality, this would integrate with eye tracking hardware
      gazeInterval = setInterval(() => {
        // Simulate gaze point updates
        const mockGazePoint = {
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
        };
        
        setEyeTracking(prev => ({ ...prev, gazePoint: mockGazePoint }));
      }, 100);
    }
    
    return () => {
      if (gazeInterval) clearInterval(gazeInterval);
    };
  }, [enabledInputs, eyeTracking.enabled, eyeTracking.calibrated]);

  // Handle input method activation
  const activateInputMethod = (method: InputMethod) => {
    setActiveInputMethod(method);
    onInputMethodChange?.(method);
    
    switch (method) {
      case 'voice':
        if (recognitionRef.current) {
          setIsListening(true);
          recognitionRef.current.start();
          announce('Voice control activated');
        }
        break;
      case 'switch':
        setSwitchControl(prev => ({ ...prev, enabled: true }));
        announce('Switch control activated');
        break;
      case 'eye-tracking':
        setEyeTracking(prev => ({ ...prev, enabled: true }));
        announce('Eye tracking activated');
        break;
      case 'head-tracking':
        announce('Head tracking activated');
        break;
    }
  };

  // Handle input method deactivation
  const deactivateInputMethod = (method: InputMethod) => {
    if (activeInputMethod === method) {
      setActiveInputMethod(null);
    }
    
    switch (method) {
      case 'voice':
        if (recognitionRef.current) {
          setIsListening(false);
          recognitionRef.current.stop();
          announce('Voice control deactivated');
        }
        break;
      case 'switch':
        setSwitchControl(prev => ({ ...prev, enabled: false }));
        announce('Switch control deactivated');
        break;
      case 'eye-tracking':
        setEyeTracking(prev => ({ ...prev, enabled: false }));
        announce('Eye tracking deactivated');
        break;
      case 'head-tracking':
        announce('Head tracking deactivated');
        break;
    }
  };

  // Handle switch control key events
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!switchControl.enabled) return;
      
      // Space or Enter to activate current focus
      if (event.code === 'Space' || event.code === 'Enter') {
        event.preventDefault();
        const focusedElement = document.activeElement as HTMLElement;
        if (focusedElement) {
          focusedElement.click();
          announce('Switch control: Element activated');
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [switchControl.enabled, announce]);

  return (
    <div 
      ref={containerRef}
      className="alternative-inputs-container"
      data-testid="alternative-inputs"
    >
      {/* Alternative Input Controls */}
      <div className="sr-only">
        <h2>Alternative Input Methods</h2>
        <p>
          Alternative input methods are available for users with motor impairments.
          Available methods: {enabledInputs.join(', ')}.
        </p>
      </div>

      {/* Voice Control Status */}
      {enabledInputs.includes('voice') && (
        <div 
          className="voice-control-status sr-only"
          aria-live="polite"
          aria-atomic="true"
        >
          {isListening ? 'Voice control is listening' : 'Voice control is inactive'}
        </div>
      )}

      {/* Switch Control Status */}
      {enabledInputs.includes('switch') && switchControl.enabled && (
        <div 
          className="switch-control-status sr-only"
          aria-live="polite"
          aria-atomic="true"
        >
          Switch control is active. Use space or enter to activate elements.
        </div>
      )}

      {/* Eye Tracking Status */}
      {enabledInputs.includes('eye-tracking') && eyeTracking.enabled && (
        <div 
          className="eye-tracking-status sr-only"
          aria-live="polite"
          aria-atomic="true"
        >
          Eye tracking is {eyeTracking.calibrated ? 'calibrated and active' : 'active but not calibrated'}
        </div>
      )}

      {/* Alternative Input Method Controls */}
      <div className="alternative-inputs-controls hidden">
        <h3>Alternative Input Methods</h3>
        {enabledInputs.map((method) => (
          <div key={method} className="input-method-control">
            <button
              onClick={() => activeInputMethod === method ? deactivateInputMethod(method) : activateInputMethod(method)}
              className={`input-method-button ${activeInputMethod === method ? 'active' : ''}`}
              aria-pressed={activeInputMethod === method}
              data-testid={`input-method-${method}`}
            >
              {method.charAt(0).toUpperCase() + method.slice(1).replace('-', ' ')}
              {activeInputMethod === method ? ' (Active)' : ''}
            </button>
            {method === 'voice' && activeInputMethod === method && (
              <div className="voice-commands">
                <h4>Available Voice Commands:</h4>
                <ul>
                  {voiceCommands.map((command, index) => (
                    <li key={index}>
                      <strong>"{command.command}"</strong> - {command.description}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Enhanced focus indication for alternative inputs */}
      <style jsx>{`
        .alternative-inputs-container {
          position: relative;
        }
        
        .alternative-inputs-container :focus {
          outline: ${switchControl.enabled ? '3px solid #ffff00' : '2px solid #0066cc'};
          outline-offset: 2px;
        }
        
        .input-method-button {
          padding: 8px 16px;
          margin: 4px;
          border: 2px solid #0066cc;
          background: #ffffff;
          color: #000000;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .input-method-button.active {
          background: #0066cc;
          color: #ffffff;
        }
        
        .voice-commands {
          margin-top: 8px;
          padding: 8px;
          border: 1px solid #cccccc;
          border-radius: 4px;
          background: #f9f9f9;
        }
        
        .voice-commands h4 {
          margin: 0 0 8px 0;
          font-size: 14px;
          font-weight: bold;
        }
        
        .voice-commands ul {
          margin: 0;
          padding-left: 20px;
          font-size: 13px;
        }
        
        .voice-commands li {
          margin-bottom: 4px;
        }
        
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }
        
        .hidden {
          display: none;
        }
      `}</style>

      {children}
    </div>
  );
};

export default AlternativeInputs;
