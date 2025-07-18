'use client';

import { type FC, useState, useEffect } from 'react';
import { type GuidanceStep } from '~/types/player-guidance';
import { GUIDANCE_FLOWS } from '~/data/guidance-content';

export interface GuidanceOverlayProps {
  flowId: string;
  currentStep: number;
  visible: boolean;
  onStepComplete: (stepId: string) => void;
  onClose: () => void;
  onInteraction?: (type: string, stepId?: string) => void;
  className?: string;
}

export const GuidanceOverlay: FC<GuidanceOverlayProps> = ({
  flowId,
  currentStep,
  visible,
  onStepComplete,
  onClose,
  onInteraction,
  className = '',
}) => {
  const [highlightedElement, setHighlightedElement] = useState<string | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);

  const steps = GUIDANCE_FLOWS[flowId] || [];
  const currentStepData = steps[currentStep];
  const totalSteps = steps.length;
  const isLastStep = currentStep >= totalSteps - 1;

  // Handle step completion
  const handleStepComplete = () => {
    if (currentStepData) {
      onStepComplete(currentStepData.id);
      onInteraction?.('step_completed', currentStepData.id);
    }
  };

  // Handle next step
  const handleNextStep = () => {
    if (isLastStep) {
      onClose();
      onInteraction?.('flow_completed');
    } else {
      handleStepComplete();
    }
  };

  // Handle skip step
  const handleSkipStep = () => {
    if (currentStepData?.optional) {
      onInteraction?.('step_skipped', currentStepData.id);
      handleNextStep();
    }
  };

  // Auto-highlight target element
  useEffect(() => {
    if (currentStepData?.target) {
      setHighlightedElement(currentStepData.target);
    } else {
      setHighlightedElement(null);
    }
  }, [currentStepData?.target]);

  if (!visible || !currentStepData) {
    return null;
  }

  return (
    <div className={`fixed inset-0 z-50 ${className}`}>
      {/* Backdrop with highlight cutout */}
      <div className="absolute inset-0 bg-black bg-opacity-75">
        {/* Highlight area for target element */}
        {highlightedElement && (
          <div
            className="absolute bg-transparent border-2 border-blue-400 rounded-lg shadow-lg"
            style={{
              // Mock positioning - in real implementation, this would be calculated
              // based on the actual DOM element position
              left: '50%',
              top: '50%',
              width: '200px',
              height: '100px',
              transform: 'translate(-50%, -50%)',
            }}
          />
        )}
      </div>

      {/* Guidance panel */}
      <div
        className={`absolute bg-white rounded-lg shadow-xl max-w-md transition-all duration-300 ${
          isMinimized ? 'w-64' : 'w-full'
        }`}
        style={{
          left: '20px',
          top: '20px',
          maxWidth: isMinimized ? '250px' : '400px',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                {isMinimized ? 'Guidance' : 'Game Guidance'}
              </h3>
              <p className="text-xs text-gray-600">
                Step {currentStep + 1} of {totalSteps}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIsMinimized(!isMinimized);
                onInteraction?.('overlay_minimized');
              }}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMinimized ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                )}
              </svg>
            </button>
            <button
              onClick={() => {
                onClose();
                onInteraction?.('overlay_closed');
              }}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        {!isMinimized && (
          <div className="p-4">
            {/* Progress bar */}
            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Progress</span>
                <span>{Math.round(((currentStep + 1) / totalSteps) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
                />
              </div>
            </div>

            {/* Step content */}
            <div className="mb-4">
              <h4 className="font-medium text-gray-900 mb-2">{currentStepData.title}</h4>
              <p className="text-sm text-gray-600 mb-3">{currentStepData.description}</p>
              
              {/* Action instruction */}
              <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 p-2 rounded">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="font-medium">Action required:</span>
                <span className="capitalize">{currentStepData.action}</span>
              </div>

              {/* Target element info */}
              {currentStepData.target && (
                <div className="mt-2 text-xs text-gray-500">
                  Target: {currentStepData.target}
                </div>
              )}
            </div>

            {/* Navigation buttons */}
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                {currentStepData.optional && (
                  <button
                    onClick={handleSkipStep}
                    className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    Skip
                  </button>
                )}
                
                <button
                  onClick={() => {
                    onClose();
                    onInteraction?.('flow_cancelled');
                  }}
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>

              <div className="flex gap-2">
                {currentStep > 0 && (
                  <button
                    onClick={() => {
                      // Handle previous step - this would need to be implemented
                      onInteraction?.('step_previous');
                    }}
                    className="px-3 py-1 text-sm text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                  >
                    Previous
                  </button>
                )}
                
                <button
                  onClick={handleNextStep}
                  className="px-3 py-1 text-sm text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
                >
                  {isLastStep ? 'Finish' : 'Next'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Minimized content */}
        {isMinimized && (
          <div className="p-3">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Step {currentStep + 1}/{totalSteps}
              </div>
              <button
                onClick={handleNextStep}
                className="px-2 py-1 text-xs text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
              >
                {isLastStep ? 'Finish' : 'Next'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
