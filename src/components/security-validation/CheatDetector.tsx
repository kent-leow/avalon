'use client';

import React, { useState, useEffect, useCallback } from 'react';
import type { 
  CheatAttempt, 
  PlayerAction, 
  CheatDetectionRule 
} from '~/types/security-validation';
import { 
  createMockCheatAttempt, 
  analyzeCheatPattern 
} from '~/lib/security-validation-utils';

/**
 * Cheat Detector Component
 * Detects and prevents cheating attempts
 */

interface CheatDetectorProps {
  playerActions: PlayerAction[];
  gameState: any;
  onCheatDetected?: (cheat: CheatAttempt) => void;
  detectionRules?: CheatDetectionRule[];
  className?: string;
}

export const CheatDetector: React.FC<CheatDetectorProps> = ({
  playerActions,
  gameState,
  onCheatDetected,
  detectionRules = [],
  className = ''
}) => {
  const [detectionActive, setDetectionActive] = useState(true);
  const [detectedCheats, setDetectedCheats] = useState<CheatAttempt[]>([]);
  const [analysisResults, setAnalysisResults] = useState<{
    pattern: string;
    confidence: number;
    recommendation: string;
  }>({ pattern: 'No pattern detected', confidence: 0, recommendation: 'Continue monitoring' });

  // Analyze player actions for cheat patterns
  const analyzeActions = useCallback(() => {
    if (!detectionActive || playerActions.length === 0) return;

    const cheats: CheatAttempt[] = [];
    const currentTime = Date.now();

    // Check for rapid fire actions (bot detection)
    const recentActions = playerActions.filter(action => 
      currentTime - action.timestamp < 10000 // 10 seconds
    );

    if (recentActions.length > 5) {
      const cheat = createMockCheatAttempt({
        playerId: recentActions[0]?.playerId || 'unknown',
        type: 'bot_detection',
        evidence: {
          type: 'timing',
          data: { 
            actionCount: recentActions.length, 
            timeWindow: 10000,
            averageInterval: 10000 / recentActions.length
          },
          confidence: 0.8,
          timestamp: currentTime
        },
        severity: 'high',
        prevented: true,
        actionTaken: {
          type: 'warn',
          reason: 'Rapid action detection - possible bot behavior',
          automatic: true
        }
      });
      cheats.push(cheat);
    }

    // Check for identical actions (replay attack)
    const actionGroups = new Map<string, PlayerAction[]>();
    recentActions.forEach(action => {
      const key = `${action.type}_${JSON.stringify(action.data)}`;
      if (!actionGroups.has(key)) {
        actionGroups.set(key, []);
      }
      actionGroups.get(key)!.push(action);
    });

    actionGroups.forEach((actions, key) => {
      if (actions.length > 2) {
        const cheat = createMockCheatAttempt({
          playerId: actions[0]?.playerId || 'unknown',
          type: 'action_replay',
          evidence: {
            type: 'action',
            data: { 
              duplicateCount: actions.length,
              actionType: actions[0]?.type,
              pattern: key
            },
            confidence: 0.9,
            timestamp: currentTime
          },
          severity: 'high',
          prevented: true,
          actionTaken: {
            type: 'block',
            reason: 'Duplicate action replay detected',
            automatic: true
          }
        });
        cheats.push(cheat);
      }
    });

    // Check for timing violations
    const sortedActions = [...recentActions].sort((a, b) => a.timestamp - b.timestamp);
    for (let i = 1; i < sortedActions.length; i++) {
      const currentAction = sortedActions[i];
      const previousAction = sortedActions[i-1];
      
      if (currentAction && previousAction) {
        const timeDiff = currentAction.timestamp - previousAction.timestamp;
        if (timeDiff < 50) { // Less than 50ms between actions
          const cheat = createMockCheatAttempt({
            playerId: currentAction.playerId || 'unknown',
            type: 'timing_abuse',
            evidence: {
              type: 'timing',
              data: { 
                timeDifference: timeDiff,
                consecutiveActions: 2,
                suspiciousThreshold: 50
              },
              confidence: 0.75,
              timestamp: currentTime
            },
            severity: 'medium',
            prevented: true,
            actionTaken: {
              type: 'warn',
              reason: 'Suspicious timing pattern detected',
              automatic: true
            }
          });
          cheats.push(cheat);
          break;
        }
      }
    }

    // Update state and trigger callbacks
    if (cheats.length > 0) {
      setDetectedCheats(prev => [...prev, ...cheats]);
      cheats.forEach(cheat => onCheatDetected?.(cheat));
    }

    // Analyze patterns
    const allCheats = [...detectedCheats, ...cheats];
    const analysis = analyzeCheatPattern(allCheats);
    setAnalysisResults(analysis);

  }, [playerActions, detectionActive, detectedCheats, onCheatDetected]);

  // Run analysis when actions change
  useEffect(() => {
    analyzeActions();
  }, [analyzeActions]);

  // Periodic analysis
  useEffect(() => {
    if (detectionActive) {
      const interval = setInterval(analyzeActions, 5000); // Check every 5 seconds
      return () => clearInterval(interval);
    }
  }, [detectionActive, analyzeActions]);

  // Get threat level color
  const getThreatLevelColor = (confidence: number): string => {
    if (confidence >= 0.8) return '#dc2626'; // Critical - Dark Red
    if (confidence >= 0.6) return '#ef4444'; // High - Red
    if (confidence >= 0.4) return '#f59e0b'; // Medium - Yellow
    if (confidence >= 0.2) return '#3b82f6'; // Low - Blue
    return '#22c55e'; // Safe - Green
  };

  const getThreatLevel = (confidence: number): string => {
    if (confidence >= 0.8) return 'Critical';
    if (confidence >= 0.6) return 'High';
    if (confidence >= 0.4) return 'Medium';
    if (confidence >= 0.2) return 'Low';
    return 'Safe';
  };

  return (
    <div 
      className={`cheat-detector ${className}`}
      data-testid="cheat-detector"
    >
      {/* Detection Status */}
      <div 
        className="detection-status flex items-center space-x-2 text-sm"
        style={{ color: '#ffffff' }}
      >
        <div 
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: detectionActive ? '#22c55e' : '#ef4444' }}
        />
        <span>Cheat Detection: {detectionActive ? 'Active' : 'Inactive'}</span>
      </div>

      {/* Threat Level */}
      <div 
        className="threat-level flex items-center space-x-2 text-sm mt-2"
        style={{ color: '#ffffff' }}
      >
        <div 
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: getThreatLevelColor(analysisResults.confidence) }}
        />
        <span>Threat Level: {getThreatLevel(analysisResults.confidence)}</span>
        <span className="text-xs opacity-75">({(analysisResults.confidence * 100).toFixed(1)}%)</span>
      </div>

      {/* Pattern Analysis */}
      {analysisResults.pattern !== 'No pattern detected' && (
        <div 
          className="pattern-analysis mt-2 p-2 rounded"
          style={{
            backgroundColor: '#1a1a2e',
            border: '1px solid #f59e0b',
            color: '#ffffff'
          }}
          data-testid="pattern-analysis"
        >
          <div className="text-xs font-medium">Pattern: {analysisResults.pattern}</div>
          <div className="text-xs opacity-75 mt-1">
            Recommendation: {analysisResults.recommendation}
          </div>
        </div>
      )}

      {/* Recent Detections */}
      {detectedCheats.length > 0 && (
        <div className="recent-detections mt-2">
          <div className="text-xs font-medium mb-1" style={{ color: '#ffffff' }}>
            Recent Detections ({detectedCheats.length})
          </div>
          {detectedCheats.slice(-3).map((cheat, index) => (
            <div
              key={cheat.id}
              className="cheat-detection p-2 rounded mt-1"
              style={{
                backgroundColor: '#1a1a2e',
                border: '1px solid #ef4444',
                color: '#ffffff'
              }}
              data-testid={`cheat-detection-${index}`}
            >
              <div className="text-xs font-medium">
                {cheat.type.replace('_', ' ').toUpperCase()}
              </div>
              <div className="text-xs opacity-75">
                Confidence: {(cheat.evidence.confidence * 100).toFixed(1)}%
              </div>
              <div className="text-xs opacity-50 mt-1">
                {cheat.prevented ? 'Blocked' : 'Flagged'} • {cheat.severity}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Statistics */}
      <div className="detection-stats mt-2 text-xs" style={{ color: '#ffffff' }}>
        <div className="flex items-center justify-between">
          <span>Actions Analyzed:</span>
          <span>{playerActions.length}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Cheats Detected:</span>
          <span>{detectedCheats.length}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Detection Rate:</span>
          <span>
            {playerActions.length > 0 
              ? ((detectedCheats.length / playerActions.length) * 100).toFixed(1) + '%'
              : '0%'
            }
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="detection-controls mt-2 flex space-x-2">
        <button
          onClick={() => setDetectionActive(!detectionActive)}
          className="px-2 py-1 text-xs rounded"
          style={{
            backgroundColor: detectionActive ? '#ef4444' : '#22c55e',
            color: '#ffffff',
            border: 'none'
          }}
          data-testid="detection-toggle"
        >
          {detectionActive ? 'Disable' : 'Enable'}
        </button>
        <button
          onClick={() => setDetectedCheats([])}
          className="px-2 py-1 text-xs rounded"
          style={{
            backgroundColor: '#6b7280',
            color: '#ffffff',
            border: 'none'
          }}
          data-testid="clear-detections"
        >
          Clear
        </button>
      </div>
    </div>
  );
};

export default CheatDetector;
