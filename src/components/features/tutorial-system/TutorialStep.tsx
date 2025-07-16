/**
 * Interactive Tutorial Step Component
 * 
 * Handles individual tutorial steps with interactive elements,
 * validation, hints, and feedback.
 */

import React, { useState, useEffect, useRef } from 'react';
import type { 
  TutorialStep as TutorialStepType, 
  Tutorial,
  TutorialAction, 
  TutorialHint, 
  TutorialFeedback, 
  TutorialAnimation,
  TutorialFeedbackType
} from '~/types/tutorial-system';
import { tutorialSystem } from '~/lib/tutorial-system-utils';
import { FEEDBACK_TYPES } from '~/types/tutorial-system';

interface TutorialStepProps {
  step: TutorialStepType;
  tutorial: Tutorial;
  isActive: boolean;
  onComplete: (results: Record<string, any>) => void;
  onSkip: () => void;
  onHint: (hintId: string) => void;
}

export const TutorialStepComponent: React.FC<TutorialStepProps> = ({
  step,
  tutorial,
  isActive,
  onComplete,
  onSkip,
  onHint
}) => {
  const [activeHints, setActiveHints] = useState<TutorialHint[]>([]);
  const [feedback, setFeedback] = useState<TutorialFeedback[]>([]);
  const [completedActions, setCompletedActions] = useState<string[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const stepRef = useRef<HTMLDivElement>(null);

  // Initialize step
  useEffect(() => {
    if (step.type === 'explanation' || step.type === 'demonstration') {
      // Auto-complete explanation and demonstration steps
      const timer = setTimeout(() => {
        onComplete({});
      }, step.duration * 1000);
      return () => clearTimeout(timer);
    }
  }, [step, onComplete]);

  // Show hints based on triggers
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    step.hints.forEach(hint => {
      if (hint.trigger.type === 'time' && typeof hint.trigger.value === 'number') {
        const timer = setTimeout(() => {
          showHint(hint);
        }, hint.trigger.value);
        timers.push(timer);
      }
    });

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [step.hints]);

  // Validate step completion
  useEffect(() => {
    const requiredActions = step.actions.filter(action => action.isRequired);
    const allRequiredCompleted = requiredActions.every(action => 
      completedActions.includes(action.id)
    );

    if (allRequiredCompleted && step.requiredForCompletion) {
      validateStep();
    }
  }, [completedActions, step.actions, step.requiredForCompletion]);

  const showHint = (hint: TutorialHint) => {
    setActiveHints(prev => {
      const existing = prev.find(h => h.id === hint.id);
      if (existing) return prev;
      return [...prev, hint];
    });

    if (hint.autoHideMs) {
      setTimeout(() => {
        hideHint(hint.id);
      }, hint.autoHideMs);
    }
  };

  const hideHint = (hintId: string) => {
    setActiveHints(prev => prev.filter(h => h.id !== hintId));
  };

  const showFeedback = (feedbackItem: TutorialFeedback) => {
    setFeedback(prev => [...prev, feedbackItem]);

    if (feedbackItem.duration) {
      setTimeout(() => {
        setFeedback(prev => prev.filter(f => f.id !== feedbackItem.id));
      }, feedbackItem.duration);
    }
  };

  const validateStep = async () => {
    if (isValidating) return;

    setIsValidating(true);
    setErrors([]);

    try {
      // Simple validation - assume valid if required actions are completed
      const requiredActions = step.actions.filter(action => action.isRequired);
      const allRequiredCompleted = requiredActions.every(action => 
        completedActions.includes(action.id)
      );
      
      if (allRequiredCompleted || step.type === 'explanation' || step.type === 'demonstration') {
        showFeedback({
          id: 'step-complete',
          type: 'success',
          message: 'Step completed successfully!',
          duration: 2000,
          metadata: {}
        });
        
        setTimeout(() => onComplete({}), 1000);
      } else {
        const errors = ['Please complete all required actions'];
        setErrors(errors);
        showFeedback({
          id: 'step-error',
          type: 'error',
          message: errors.join(', '),
          duration: 4000,
          metadata: {}
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Validation failed';
      setErrors([errorMessage]);
      showFeedback({
        id: 'step-error',
        type: 'error',
        message: errorMessage,
        duration: 4000,
        metadata: {}
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleActionClick = async (action: TutorialAction) => {
    if (completedActions.includes(action.id)) return;

    try {
      // Simple action validation
      setCompletedActions(prev => [...prev, action.id]);
      
      // Show action feedback
      showFeedback(action.feedback);
      
      // Apply animation if specified
      if (action.animation && action.target) {
        const element = document.querySelector(action.target);
        if (element instanceof HTMLElement) {
          // Simple animation - just add a class
          element.classList.add('animate-pulse');
          setTimeout(() => element.classList.remove('animate-pulse'), 1000);
        }
      }
    } catch (error) {
      showFeedback({
        id: 'action-error',
        type: 'error',
        message: error instanceof Error ? error.message : 'Action failed',
        duration: 3000,
        metadata: {}
      });
    }
  };

  const renderStepContent = () => {
    switch (step.type) {
      case 'explanation':
        return (
          <div className="tutorial-explanation">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              {step.title}
            </h3>
            <div className="prose prose-sm max-w-none text-gray-700">
              <p>{step.content}</p>
            </div>
            {step.instructions && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">{step.instructions}</p>
              </div>
            )}
          </div>
        );

      case 'demonstration':
        return (
          <div className="tutorial-demonstration">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              {step.title}
            </h3>
            <div className="prose prose-sm max-w-none text-gray-700 mb-4">
              <p>{step.content}</p>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <span className="text-yellow-500 text-xl">👀</span>
                <div>
                  <h4 className="font-medium text-yellow-800">Watch and Learn</h4>
                  <p className="text-sm text-yellow-700 mt-1">{step.instructions}</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'interaction':
        return (
          <div className="tutorial-interaction">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              {step.title}
            </h3>
            <div className="prose prose-sm max-w-none text-gray-700 mb-4">
              <p>{step.content}</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="flex items-start space-x-3">
                <span className="text-green-500 text-xl">👆</span>
                <div>
                  <h4 className="font-medium text-green-800">Your Turn</h4>
                  <p className="text-sm text-green-700 mt-1">{step.instructions}</p>
                </div>
              </div>
            </div>
            {renderActions()}
          </div>
        );

      case 'practice':
        return (
          <div className="tutorial-practice">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              {step.title}
            </h3>
            <div className="prose prose-sm max-w-none text-gray-700 mb-4">
              <p>{step.content}</p>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
              <div className="flex items-start space-x-3">
                <span className="text-purple-500 text-xl">💪</span>
                <div>
                  <h4 className="font-medium text-purple-800">Practice Time</h4>
                  <p className="text-sm text-purple-700 mt-1">{step.instructions}</p>
                </div>
              </div>
            </div>
            {renderActions()}
          </div>
        );

      case 'quiz':
        return (
          <div className="tutorial-quiz">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              {step.title}
            </h3>
            <div className="prose prose-sm max-w-none text-gray-700 mb-4">
              <p>{step.content}</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-start space-x-3">
                <span className="text-blue-500 text-xl">❓</span>
                <div>
                  <h4 className="font-medium text-blue-800">Knowledge Check</h4>
                  <p className="text-sm text-blue-700 mt-1">{step.instructions}</p>
                </div>
              </div>
            </div>
            {renderActions()}
          </div>
        );

      case 'reflection':
        return (
          <div className="tutorial-reflection">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              {step.title}
            </h3>
            <div className="prose prose-sm max-w-none text-gray-700 mb-4">
              <p>{step.content}</p>
            </div>
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-4">
              <div className="flex items-start space-x-3">
                <span className="text-indigo-500 text-xl">🤔</span>
                <div>
                  <h4 className="font-medium text-indigo-800">Take a Moment</h4>
                  <p className="text-sm text-indigo-700 mt-1">{step.instructions}</p>
                </div>
              </div>
            </div>
            {renderActions()}
          </div>
        );

      default:
        return (
          <div className="tutorial-default">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              {step.title}
            </h3>
            <div className="prose prose-sm max-w-none text-gray-700">
              <p>{step.content}</p>
            </div>
          </div>
        );
    }
  };

  const renderActions = () => {
    if (step.actions.length === 0) return null;

    return (
      <div className="tutorial-actions space-y-3">
        {step.actions.map(action => (
          <div key={action.id} className="action-item">
            <button
              onClick={() => handleActionClick(action)}
              disabled={completedActions.includes(action.id)}
              className={`w-full text-left p-3 rounded-lg border transition-all duration-200 ${
                completedActions.includes(action.id)
                  ? 'bg-green-50 border-green-200 text-green-800'
                  : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{action.description}</div>
                  {action.value && (
                    <div className="text-sm text-gray-500 mt-1">
                      Expected: {action.value}
                    </div>
                  )}
                </div>
                <div className="ml-3">
                  {completedActions.includes(action.id) ? (
                    <span className="text-green-500 text-xl">✓</span>
                  ) : action.isRequired ? (
                    <span className="text-red-500 text-sm">Required</span>
                  ) : (
                    <span className="text-gray-400 text-sm">Optional</span>
                  )}
                </div>
              </div>
            </button>
          </div>
        ))}
      </div>
    );
  };

  const renderHints = () => {
    if (activeHints.length === 0) return null;

    return (
      <div className="tutorial-hints mt-4 space-y-2">
        {activeHints.map(hint => (
          <div
            key={hint.id}
            className={`hint-item p-3 rounded-lg border ${
              hint.type === 'tooltip' ? 'bg-yellow-50 border-yellow-200' :
              hint.type === 'popup' ? 'bg-blue-50 border-blue-200' :
              'bg-gray-50 border-gray-200'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-2">
                <span className="text-yellow-500 text-lg">💡</span>
                <div>
                  <p className="text-sm font-medium text-gray-800">Hint</p>
                  <p className="text-sm text-gray-600 mt-1">{hint.content}</p>
                </div>
              </div>
              {hint.dismissible && (
                <button
                  onClick={() => hideHint(hint.id)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderFeedback = () => {
    if (feedback.length === 0) return null;

    return (
      <div className="tutorial-feedback mt-4 space-y-2">
        {feedback.map(item => {
          const config = FEEDBACK_TYPES[item.type];
          return (
            <div
              key={item.id}
              className={`feedback-item p-3 rounded-lg border ${
                item.type === 'success' ? 'bg-green-50 border-green-200' :
                item.type === 'error' ? 'bg-red-50 border-red-200' :
                item.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                item.type === 'info' ? 'bg-blue-50 border-blue-200' :
                'bg-purple-50 border-purple-200'
              }`}
              style={{ animationDuration: item.showAnimation ? '0.3s' : '0s' }}
            >
              <div className="flex items-start space-x-2">
                <span 
                  className="text-lg"
                  style={{ color: config.color }}
                >
                  {config.icon}
                </span>
                <div>
                  {item.title && (
                    <p className="text-sm font-medium text-gray-800">{item.title}</p>
                  )}
                  <p className="text-sm text-gray-600">{item.message}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderErrors = () => {
    if (errors.length === 0) return null;

    return (
      <div className="tutorial-errors mt-4">
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <span className="text-red-500 text-lg">⚠️</span>
            <div>
              <p className="text-sm font-medium text-red-800">Validation Errors</p>
              <ul className="text-sm text-red-700 mt-1 space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div ref={stepRef} className="tutorial-step bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {renderStepContent()}
      {renderHints()}
      {renderFeedback()}
      {renderErrors()}
      
      {isValidating && (
        <div className="mt-4 flex items-center space-x-2 text-sm text-gray-600">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span>Validating...</span>
        </div>
      )}
    </div>
  );
};

// Main export
export const TutorialStep = TutorialStepComponent;
