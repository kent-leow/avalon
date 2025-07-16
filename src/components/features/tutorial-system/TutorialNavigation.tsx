/**
 * Tutorial Navigation Component
 * 
 * Navigation controls for tutorial system including progress indicators,
 * step navigation, and tutorial management.
 */

import React from 'react';
import type { 
  TutorialState, 
  TutorialNavigation as TutorialNavigationInterface, 
  TutorialLevel,
  TutorialPhase
} from '~/types/tutorial-system';
import { 
  getTutorialPhaseIcon, 
  formatTutorialDuration, 
  getTutorialDifficultyColor,
  createTutorialBreadcrumb
} from '~/lib/tutorial-system-utils';

interface TutorialNavigationProps {
  tutorialState: TutorialState;
  navigation: TutorialNavigationInterface;
  onBack: () => void;
  onNext: () => void;
  onSkip: () => void;
  onRestart: () => void;
  onExit: () => void;
  canSkip?: boolean;
}

export const TutorialNavigationComponent: React.FC<TutorialNavigationProps> = ({
  tutorialState,
  navigation,
  onBack,
  onNext,
  onSkip,
  onRestart,
  onExit,
  canSkip = false
}) => {
  if (!tutorialState.currentTutorial) {
    return null;
  }

  const breadcrumb = createTutorialBreadcrumb(tutorialState.currentTutorial, tutorialState.stepProgress);
  const progressPercentage = Math.round((tutorialState.stepProgress / tutorialState.totalSteps) * 100);
  const difficultyColor = getTutorialDifficultyColor(tutorialState.currentTutorial.level);
  const phaseIcon = getTutorialPhaseIcon(tutorialState.currentTutorial.phase);

  return (
    <div className="tutorial-navigation bg-white border-b border-gray-200 px-6 py-4">
      <div className="max-w-6xl mx-auto">
        {/* Tutorial Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <span className="text-2xl" role="img" aria-label={tutorialState.currentTutorial.phase}>
              {phaseIcon}
            </span>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {tutorialState.currentTutorial.title}
              </h1>
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <span 
                  className="px-2 py-1 rounded-full text-xs font-medium text-white"
                  style={{ backgroundColor: difficultyColor }}
                >
                  {tutorialState.currentTutorial.level.charAt(0).toUpperCase() + tutorialState.currentTutorial.level.slice(1)}
                </span>
                <span>{formatTutorialDuration(tutorialState.currentTutorial.estimatedDuration)}</span>
                <span>•</span>
                <span>{tutorialState.currentTutorial.steps.length} steps</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={onRestart}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
            >
              🔄 Restart
            </button>
            <button
              onClick={onExit}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
            >
              ✕ Exit
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-600">
              Step {tutorialState.stepProgress} of {tutorialState.totalSteps}
            </div>
            <div className="text-sm font-medium text-gray-900">
              {progressPercentage}% Complete
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            disabled={tutorialState.stepProgress <= 1}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              tutorialState.stepProgress <= 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            ← Previous
          </button>

          <div className="flex items-center space-x-2">
            {canSkip && (
              <button
                onClick={onSkip}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
              >
                Skip Step
              </button>
            )}
            <button
              onClick={onNext}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Tutorial Progress Component
 * 
 * Displays tutorial progress with visual indicators and completion status.
 */

interface TutorialProgressProps {
  currentStep: number;
  totalSteps: number;
  completedSteps: string[];
  currentStepId?: string;
  showLabels?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export const TutorialProgressComponent: React.FC<TutorialProgressProps> = ({
  currentStep,
  totalSteps,
  completedSteps,
  currentStepId,
  showLabels = true,
  size = 'medium'
}) => {
  const progressPercentage = Math.round((currentStep / totalSteps) * 100);
  
  const sizeClasses = {
    small: 'h-1',
    medium: 'h-2',
    large: 'h-3'
  };

  const textSizeClasses = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base'
  };

  return (
    <div className="tutorial-progress">
      {showLabels && (
        <div className={`flex items-center justify-between mb-2 ${textSizeClasses[size]}`}>
          <span className="font-medium text-gray-700">
            Step {currentStep} of {totalSteps}
          </span>
          <span className="font-medium text-gray-700">
            {progressPercentage}%
          </span>
        </div>
      )}
      
      <div className={`w-full bg-gray-200 rounded-full ${sizeClasses[size]}`}>
        <div 
          className={`bg-blue-600 ${sizeClasses[size]} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${progressPercentage}%` }}
          role="progressbar"
          aria-valuenow={progressPercentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Tutorial progress: ${progressPercentage}% complete`}
        />
      </div>
      
      {size === 'large' && (
        <div className="mt-3 flex justify-between text-xs text-gray-500">
          <span>Started</span>
          <span>In Progress</span>
          <span>Complete</span>
        </div>
      )}
    </div>
  );
};

/**
 * Tutorial Step Indicator Component
 * 
 * Visual step-by-step progress indicator with interactive elements.
 */

interface TutorialStepIndicatorProps {
  steps: Array<{
    id: string;
    title: string;
    completed: boolean;
    current: boolean;
    skipped?: boolean;
  }>;
  onStepClick?: (stepId: string) => void;
  allowJumpToStep?: boolean;
  orientation?: 'horizontal' | 'vertical';
}

export const TutorialStepIndicator: React.FC<TutorialStepIndicatorProps> = ({
  steps,
  onStepClick,
  allowJumpToStep = false,
  orientation = 'horizontal'
}) => {
  const isHorizontal = orientation === 'horizontal';
  
  return (
    <div className={`tutorial-step-indicator ${isHorizontal ? 'flex items-center' : 'flex flex-col'}`}>
      {steps.map((step, index) => (
        <div
          key={step.id}
          className={`flex items-center ${isHorizontal ? 'flex-row' : 'flex-col'}`}
        >
          <div
            className={`step-indicator relative flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-200 ${
              step.completed
                ? 'bg-green-500 border-green-500 text-white'
                : step.current
                ? 'bg-blue-500 border-blue-500 text-white'
                : step.skipped
                ? 'bg-yellow-500 border-yellow-500 text-white'
                : 'bg-white border-gray-300 text-gray-500'
            } ${
              allowJumpToStep && onStepClick ? 'cursor-pointer hover:scale-110' : ''
            }`}
            onClick={() => allowJumpToStep && onStepClick && onStepClick(step.id)}
            role={allowJumpToStep ? 'button' : undefined}
            tabIndex={allowJumpToStep ? 0 : undefined}
            aria-label={`Step ${index + 1}: ${step.title}`}
          >
            {step.completed ? (
              <span className="text-sm">✓</span>
            ) : step.skipped ? (
              <span className="text-sm">⏭</span>
            ) : (
              <span className="text-sm font-medium">{index + 1}</span>
            )}
          </div>
          
          {!isHorizontal && (
            <div className="mt-2 text-center">
              <div className={`text-xs font-medium ${step.current ? 'text-blue-600' : 'text-gray-600'}`}>
                {step.title}
              </div>
            </div>
          )}
          
          {isHorizontal && index < steps.length - 1 && (
            <div className="flex-1 mx-2 h-0.5 bg-gray-300">
              <div 
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: step.completed ? '100%' : '0%' }}
              />
            </div>
          )}
          
          {!isHorizontal && index < steps.length - 1 && (
            <div className="my-2 w-0.5 h-8 bg-gray-300 mx-auto">
              <div 
                className="w-full bg-blue-500 transition-all duration-300"
                style={{ height: step.completed ? '100%' : '0%' }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

/**
 * Tutorial Header Component
 * 
 * Display tutorial metadata and overview information.
 */

interface TutorialHeaderProps {
  title: string;
  description: string;
  level: TutorialLevel;
  phase: TutorialPhase;
  estimatedDuration: number;
  difficulty: number;
  prerequisites?: string[];
  tags?: string[];
}

export const TutorialHeader: React.FC<TutorialHeaderProps> = ({
  title,
  description,
  level,
  phase,
  estimatedDuration,
  difficulty,
  prerequisites = [],
  tags = []
}) => {
  const difficultyColor = getTutorialDifficultyColor(level);
  const phaseIcon = getTutorialPhaseIcon(phase);
  
  return (
    <div className="tutorial-header bg-white border-b border-gray-200 p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            <span className="text-4xl" role="img" aria-label={phase}>
              {phaseIcon}
            </span>
          </div>
          
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {title}
            </h1>
            <p className="text-gray-600 mb-4 max-w-2xl">
              {description}
            </p>
            
            <div className="flex items-center space-x-4 text-sm">
              <span 
                className="px-2 py-1 rounded-full text-xs font-medium text-white"
                style={{ backgroundColor: difficultyColor }}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </span>
              
              <span className="text-gray-500">
                {formatTutorialDuration(estimatedDuration)}
              </span>
              
              <span className="text-gray-500">
                Difficulty: {difficulty}/10
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {(prerequisites.length > 0 || tags.length > 0) && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          {prerequisites.length > 0 && (
            <div className="mb-2">
              <span className="text-sm font-medium text-gray-700 mr-2">Prerequisites:</span>
              <div className="inline-flex flex-wrap gap-1">
                {prerequisites.map((prereq, index) => (
                  <span key={index} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                    {prereq}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {tags.length > 0 && (
            <div>
              <span className="text-sm font-medium text-gray-700 mr-2">Tags:</span>
              <div className="inline-flex flex-wrap gap-1">
                {tags.map((tag, index) => (
                  <span key={index} className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Main exports
export const TutorialNavigation = TutorialNavigationComponent;
export const TutorialProgressBar = TutorialProgressComponent;
