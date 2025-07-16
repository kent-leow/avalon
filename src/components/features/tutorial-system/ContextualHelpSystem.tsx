/**
 * Contextual Help System Component
 * 
 * Provides context-aware help overlays, tooltips, and guidance
 * based on the current game state and user actions.
 */

import React, { useState, useEffect, useCallback } from 'react';
import type { 
  ContextualHelp, 
  HelpTrigger, 
  HelpContent, 
  HelpContext,
  TutorialPhase,
  GameState
} from '~/types/tutorial-system';
import { 
  getContextualHelp, 
  shouldShowHelp, 
  formatHelpContent,
  getHelpContextFromGameState
} from '~/lib/tutorial-system-utils';

interface ContextualHelpSystemProps {
  gameState?: GameState;
  currentPhase?: TutorialPhase;
  isEnabled: boolean;
  onHelpInteraction: (helpId: string, action: 'viewed' | 'dismissed' | 'completed') => void;
  onRequestTutorial: (tutorialId: string) => void;
}

export const ContextualHelpSystem: React.FC<ContextualHelpSystemProps> = ({
  gameState,
  currentPhase,
  isEnabled,
  onHelpInteraction,
  onRequestTutorial
}) => {
  const [activeHelp, setActiveHelp] = useState<ContextualHelp | null>(null);
  const [helpHistory, setHelpHistory] = useState<string[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [trigger, setTrigger] = useState<HelpTrigger | null>(null);

  // Get current help context
  const helpContext = getHelpContextFromGameState(gameState, currentPhase);

  // Check for contextual help based on current state
  useEffect(() => {
    if (!isEnabled || !helpContext) return;

    const potentialHelp = getContextualHelp(helpContext);
    if (potentialHelp && shouldShowHelp(potentialHelp, helpHistory)) {
      setActiveHelp(potentialHelp);
      setIsVisible(true);
      onHelpInteraction(potentialHelp.id, 'viewed');
    }
  }, [helpContext, isEnabled, helpHistory, onHelpInteraction]);

  // Handle help dismissal
  const handleDismiss = useCallback(() => {
    if (activeHelp) {
      setHelpHistory(prev => [...prev, activeHelp.id]);
      onHelpInteraction(activeHelp.id, 'dismissed');
      setActiveHelp(null);
      setIsVisible(false);
    }
  }, [activeHelp, onHelpInteraction]);

  // Handle help completion
  const handleComplete = useCallback(() => {
    if (activeHelp) {
      setHelpHistory(prev => [...prev, activeHelp.id]);
      onHelpInteraction(activeHelp.id, 'completed');
      setActiveHelp(null);
      setIsVisible(false);
    }
  }, [activeHelp, onHelpInteraction]);

  // Handle tutorial request
  const handleRequestTutorial = useCallback((tutorialId: string) => {
    onRequestTutorial(tutorialId);
    handleDismiss();
  }, [onRequestTutorial, handleDismiss]);

  // Update position for tooltip-style help
  useEffect(() => {
    if (activeHelp?.display.type === 'tooltip' && trigger?.element) {
      const rect = trigger.element.getBoundingClientRect();
      setPosition({
        x: rect.left + rect.width / 2,
        y: rect.top - 10
      });
    }
  }, [activeHelp, trigger]);

  // Keyboard handling for help navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isVisible || !activeHelp) return;

      switch (event.key) {
        case 'Escape':
          handleDismiss();
          break;
        case 'Enter':
          if (activeHelp.actions.length > 0) {
            handleComplete();
          }
          break;
        case '?':
          if (activeHelp.relatedTutorials.length > 0 && activeHelp.relatedTutorials[0]) {
            handleRequestTutorial(activeHelp.relatedTutorials[0]);
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, activeHelp, handleDismiss, handleComplete, handleRequestTutorial]);

  if (!isEnabled || !isVisible || !activeHelp) {
    return null;
  }

  const renderHelpContent = () => {
    const content = formatHelpContent(activeHelp.content);
    
    return (
      <div className="help-content space-y-4">
        {/* Title */}
        <div className="flex items-center space-x-2">
          <span className="text-xl">{activeHelp.icon}</span>
          <h3 className="text-lg font-semibold text-gray-900">{activeHelp.title}</h3>
        </div>

        {/* Main Content */}
        <div className="space-y-3">
          {content.text && (
            <p className="text-gray-700">{content.text}</p>
          )}

          {content.steps && content.steps.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Steps:</h4>
              <ol className="list-decimal list-inside space-y-1 text-gray-600">
                {content.steps.map((step, index) => (
                  <li key={index} className="text-sm">{step}</li>
                ))}
              </ol>
            </div>
          )}

          {content.tips && content.tips.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Tips:</h4>
              <ul className="space-y-1 text-gray-600">
                {content.tips.map((tip, index) => (
                  <li key={index} className="text-sm flex items-start space-x-2">
                    <span className="text-blue-500 mt-1 text-xs">💡</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {content.warnings && content.warnings.length > 0 && (
            <div>
              <h4 className="font-medium text-red-800 mb-2">Important:</h4>
              <ul className="space-y-1 text-red-600">
                {content.warnings.map((warning, index) => (
                  <li key={index} className="text-sm flex items-start space-x-2">
                    <span className="text-red-500 mt-1 text-xs">⚠️</span>
                    <span>{warning}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Related Tutorials */}
        {activeHelp.relatedTutorials.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-800 mb-2">Learn More:</h4>
            <div className="space-y-2">
              {activeHelp.relatedTutorials.map(tutorialId => (
                <button
                  key={tutorialId}
                  onClick={() => handleRequestTutorial(tutorialId)}
                  className="text-sm text-blue-600 hover:text-blue-800 underline block"
                >
                  Start {tutorialId.replace('-', ' ')} tutorial
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            {activeHelp.actions.map(action => (
              <button
                key={action.id}
                onClick={() => {
                  action.handler();
                  handleComplete();
                }}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  action.style === 'primary'
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : action.style === 'danger'
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {action.label}
              </button>
            ))}
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDismiss}
              className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700"
            >
              Dismiss
            </button>
            <div className="text-xs text-gray-400">
              Press ESC to close
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render based on display type
  if (activeHelp.display.type === 'tooltip') {
    return (
      <div
        className="contextual-help-tooltip absolute z-50 max-w-sm"
        style={{
          left: position.x,
          top: position.y,
          transform: 'translate(-50%, -100%)'
        }}
      >
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
          {renderHelpContent()}
          {/* Tooltip arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2">
            <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white" />
          </div>
        </div>
      </div>
    );
  }

  if (activeHelp.display.type === 'modal') {
    return (
      <div className="contextual-help-modal fixed inset-0 z-50 flex items-center justify-center">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={handleDismiss} />
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
          <div className="p-6">
            {renderHelpContent()}
          </div>
        </div>
      </div>
    );
  }

  if (activeHelp.display.type === 'sidebar') {
    return (
      <div className="contextual-help-sidebar fixed right-0 top-0 h-full w-80 bg-white shadow-lg border-l border-gray-200 z-40 overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Help</h2>
            <button
              onClick={handleDismiss}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          {renderHelpContent()}
        </div>
      </div>
    );
  }

  // Default to banner display
  return (
    <div className="contextual-help-banner fixed top-0 left-0 right-0 z-40 bg-blue-50 border-b border-blue-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            <span className="text-xl">{activeHelp.icon}</span>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-blue-900">{activeHelp.title}</h3>
            <p className="text-sm text-blue-700 mt-1">{activeHelp.content.text}</p>
          </div>
          <div className="flex-shrink-0 flex items-center space-x-2">
            {activeHelp.relatedTutorials.length > 0 && activeHelp.relatedTutorials[0] && (
              <button
                onClick={() => handleRequestTutorial(activeHelp.relatedTutorials[0]!)}
                className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors"
              >
                Learn More
              </button>
            )}
            <button
              onClick={handleDismiss}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Hook for triggering contextual help
export const useContextualHelp = () => {
  const [trigger, setTrigger] = useState<HelpTrigger | null>(null);

  const triggerHelp = useCallback((element: HTMLElement, context: HelpContext) => {
    setTrigger({ element, context });
  }, []);

  const clearTrigger = useCallback(() => {
    setTrigger(null);
  }, []);

  return { trigger, triggerHelp, clearTrigger };
};
