'use client';

import { type ValidationError } from '~/types/characters';

interface ValidationErrorsProps {
  errors: ValidationError[];
  onResetToDefault: () => void;
  className?: string;
}

export function ValidationErrors({ errors, onResetToDefault, className = '' }: ValidationErrorsProps) {
  if (errors.length === 0) {
    return null;
  }

  const errorsByType = {
    error: errors.filter(e => e.severity === 'error'),
    warning: errors.filter(e => e.severity === 'warning')
  };

  const getIcon = (severity: 'error' | 'warning') => {
    if (severity === 'error') {
      return (
        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      );
    }
    
    return (
      <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
    </svg>
    );
  };

  return (
    <div className={`space-y-4 ${className}`} data-testid="validation-errors">
      {/* Errors */}
      {errorsByType.error.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
          <div className="flex items-center space-x-2 mb-4">
            <div className="inline-flex items-center justify-center w-8 h-8 bg-red-500/20 rounded-full">
              {getIcon('error')}
            </div>
            <h3 className="text-lg font-semibold text-red-400">Configuration Errors</h3>
          </div>
          
          <div className="space-y-3">
            {errorsByType.error.map((error, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-2 h-2 bg-red-500 rounded-full mt-2" />
                <div>
                  <p className="text-red-300 font-medium">{error.message}</p>
                  <p className="text-red-200 text-sm mt-1">
                    Type: {error.type.charAt(0).toUpperCase() + error.type.slice(1)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Warnings */}
      {errorsByType.warning.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-6">
          <div className="flex items-center space-x-2 mb-4">
            <div className="inline-flex items-center justify-center w-8 h-8 bg-amber-500/20 rounded-full">
              {getIcon('warning')}
            </div>
            <h3 className="text-lg font-semibold text-amber-400">Configuration Warnings</h3>
          </div>
          
          <div className="space-y-3">
            {errorsByType.warning.map((error, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-2 h-2 bg-amber-500 rounded-full mt-2" />
                <div>
                  <p className="text-amber-300 font-medium">{error.message}</p>
                  <p className="text-amber-200 text-sm mt-1">
                    Type: {error.type.charAt(0).toUpperCase() + error.type.slice(1)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reset Button */}
      {errors.length > 0 && (
        <div className="bg-[#252547]/80 backdrop-blur-xl border border-slate-600/30 rounded-xl p-6">
          <div className="text-center space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Need Help?</h3>
              <p className="text-slate-200 text-sm">
                Reset to recommended settings for your player count to fix these issues.
              </p>
            </div>
            
            <button
              onClick={onResetToDefault}
              className="bg-gradient-to-r from-[#3d3d7a] to-[#4a4a96] hover:from-[#4a4a96] hover:to-[#5a5ab2] text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl"
            >
              Reset to Default Settings
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
