/**
 * Tutorial Step Component (Simplified)
 * 
 * Simplified version of the tutorial step component for basic functionality.
 */

import React, { useState, useEffect } from 'react';
import type { 
  TutorialStep as TutorialStepType, 
  Tutorial,
  TutorialFeedbackType
} from '~/types/tutorial-system';

interface TutorialStepProps {
  step: TutorialStepType;
  tutorial: Tutorial;
  isActive: boolean;
  onComplete: (results: Record<string, any>) => void;
  onSkip: () => void;
  onHint: (hintId: string) => void;
}

export const TutorialStep: React.FC<TutorialStepProps> = ({
  step,
  tutorial,
  isActive,
  onComplete,
  onSkip,
  onHint
}) => {
  const [isCompleted, setIsCompleted] = useState(false);
  const [feedback, setFeedback] = useState<{ type: TutorialFeedbackType; message: string } | null>(null);

  // Auto-complete explanation steps
  useEffect(() => {
    if (isActive && step.type === 'explanation') {
      setTimeout(() => {
        setIsCompleted(true);
        onComplete({ stepId: step.id, type: 'auto-complete' });
      }, 2000);
    }
  }, [isActive, step, onComplete]);

  const handleManualComplete = () => {
    if (step.type === 'interaction' || step.type === 'practice') {
      setIsCompleted(true);
      onComplete({ stepId: step.id, type: 'manual' });
    }
  };

  const handleSkip = () => {
    if (step.isSkippable) {
      setIsCompleted(true);
      onSkip();
    }
  };

  const renderStepContent = () => {
    switch (step.type) {
      case 'explanation':
        return (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">{step.title}</h3>
            <div className="text-blue-800 mb-4 whitespace-pre-wrap">{step.content}</div>
            {step.instructions && (
              <div className="text-sm text-blue-700 bg-blue-100 rounded-md p-3">
                <strong>Instructions:</strong> {step.instructions}
              </div>
            )}
          </div>
        );
      
      case 'demonstration':
        return (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-900 mb-3">{step.title}</h3>
            <div className="text-green-800 mb-4 whitespace-pre-wrap">{step.content}</div>
            <div className="bg-green-100 rounded-md p-4">
              <div className="text-sm text-green-700 mb-2">
                <strong>Watch:</strong> {step.instructions}
              </div>
              <div className="text-green-600 italic">
                Demonstration will begin automatically...
              </div>
            </div>
          </div>
        );
      
      case 'interaction':
        return (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-purple-900 mb-3">{step.title}</h3>
            <div className="text-purple-800 mb-4 whitespace-pre-wrap">{step.content}</div>
            <div className="bg-purple-100 rounded-md p-4 mb-4">
              <div className="text-sm text-purple-700 mb-2">
                <strong>Try it:</strong> {step.instructions}
              </div>
            </div>
            <button
              onClick={handleManualComplete}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              Complete Action
            </button>
          </div>
        );
      
      case 'practice':
        return (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-orange-900 mb-3">{step.title}</h3>
            <div className="text-orange-800 mb-4 whitespace-pre-wrap">{step.content}</div>
            <div className="bg-orange-100 rounded-md p-4 mb-4">
              <div className="text-sm text-orange-700 mb-2">
                <strong>Practice:</strong> {step.instructions}
              </div>
            </div>
            <button
              onClick={handleManualComplete}
              className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
            >
              Complete Practice
            </button>
          </div>
        );
      
      case 'quiz':
        return (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-red-900 mb-3">{step.title}</h3>
            <div className="text-red-800 mb-4 whitespace-pre-wrap">{step.content}</div>
            <div className="bg-red-100 rounded-md p-4 mb-4">
              <div className="text-sm text-red-700 mb-2">
                <strong>Question:</strong> {step.instructions}
              </div>
            </div>
            <button
              onClick={handleManualComplete}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Submit Answer
            </button>
          </div>
        );
      
      default:
        return (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">{step.title}</h3>
            <div className="text-gray-800 mb-4 whitespace-pre-wrap">{step.content}</div>
            <div className="text-sm text-gray-600">{step.instructions}</div>
          </div>
        );
    }
  };

  return (
    <div className={`tutorial-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
      {renderStepContent()}
      
      {/* Feedback */}
      {feedback && (
        <div className={`mt-4 p-3 rounded-md ${
          feedback.type === 'success' ? 'bg-green-100 text-green-700' :
          feedback.type === 'error' ? 'bg-red-100 text-red-700' :
          feedback.type === 'warning' ? 'bg-yellow-100 text-yellow-700' :
          'bg-blue-100 text-blue-700'
        }`}>
          {feedback.message}
        </div>
      )}
      
      {/* Step Controls */}
      <div className="flex items-center justify-between mt-6">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">
            Step {step.order} of {tutorial.steps.length}
          </span>
          {step.isSkippable && (
            <button
              onClick={handleSkip}
              className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Skip
            </button>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {step.hints && step.hints.length > 0 && (
            <button
              onClick={() => onHint(step.hints[0]?.id || 'hint-1')}
              className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 underline"
            >
              💡 Hint
            </button>
          )}
          
          <div className="text-sm text-gray-500">
            {step.duration ? `~${Math.round(step.duration / 60)}min` : ''}
          </div>
        </div>
      </div>
      
      {/* Progress indicator */}
      {isCompleted && (
        <div className="mt-4 flex items-center text-green-600">
          <span className="mr-2">✓</span>
          <span className="text-sm">Step completed</span>
        </div>
      )}
    </div>
  );
};
