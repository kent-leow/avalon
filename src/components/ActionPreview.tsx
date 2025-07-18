'use client';

import { type FC, useState } from 'react';
import { type ActionPreview as ActionPreviewType } from '~/types/player-guidance';

export interface ActionPreviewProps {
  preview: ActionPreviewType;
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onInteraction?: (type: string) => void;
  className?: string;
}

export const ActionPreview: FC<ActionPreviewProps> = ({
  preview,
  visible,
  onClose,
  onConfirm,
  onInteraction,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!visible) {
    return null;
  }

  const hasRisks = preview.risks.length > 0;
  const hasRequirements = preview.requirements.length > 0;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${className}`}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={() => {
          onClose();
          onInteraction?.('preview_dismissed');
        }}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Action Preview</h3>
          <button
            onClick={() => {
              onClose();
              onInteraction?.('preview_dismissed');
            }}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Action details */}
          <div className="mb-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">{preview.action.label}</h4>
                <p className="text-sm text-gray-600">{preview.action.description}</p>
              </div>
            </div>
            
            <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
              {preview.description}
            </div>
          </div>

          {/* Requirements */}
          {hasRequirements && (
            <div className="mb-4">
              <h5 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Requirements
              </h5>
              <ul className="text-sm text-gray-600 space-y-1">
                {preview.requirements.map((req, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    {req}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Consequences */}
          {preview.consequences.length > 0 && (
            <div className="mb-4">
              <h5 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Expected Outcomes
              </h5>
              <ul className="text-sm text-gray-600 space-y-1">
                {preview.consequences.map((consequence, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">•</span>
                    {consequence}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Risks */}
          {hasRisks && (
            <div className="mb-4">
              <h5 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                Potential Risks
              </h5>
              <ul className="text-sm text-gray-600 space-y-1">
                {preview.risks.map((risk, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-red-600 mt-0.5">•</span>
                    {risk}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Additional details toggle */}
          <button
            onClick={() => {
              setIsExpanded(!isExpanded);
              onInteraction?.('preview_expanded');
            }}
            className="w-full text-left text-sm text-gray-500 hover:text-gray-700 transition-colors mb-4"
          >
            <div className="flex items-center justify-between">
              <span>{isExpanded ? 'Show Less Details' : 'Show More Details'}</span>
              <svg
                className={`w-4 h-4 transform transition-transform ${
                  isExpanded ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>

          {/* Expanded details */}
          {isExpanded && (
            <div className="mb-4 p-3 bg-gray-50 rounded text-sm text-gray-600">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="font-medium">Action Type:</span>
                  <div className="mt-1 text-gray-500">{preview.action.type}</div>
                </div>
                <div>
                  <span className="font-medium">Available:</span>
                  <div className="mt-1 text-gray-500">
                    {preview.action.available ? 'Yes' : 'No'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-4 border-t border-gray-200">
          <button
            onClick={() => {
              onClose();
              onInteraction?.('preview_cancelled');
            }}
            className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onInteraction?.('preview_confirmed');
            }}
            className="px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
            disabled={!preview.action.available}
          >
            Confirm Action
          </button>
        </div>
      </div>
    </div>
  );
};
