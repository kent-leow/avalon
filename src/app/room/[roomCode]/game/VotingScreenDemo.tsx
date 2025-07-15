"use client";

import { useState, useEffect } from "react";
import VotingScreen from "./VotingScreen";
import { type VotingGameState, type VoteChoice } from "~/types/voting";
import { mockVotingData, calculateVotingProgress, calculateRejectionTracker } from "~/lib/voting-utils";

export default function VotingScreenDemo() {
  const [currentPlayerId, setCurrentPlayerId] = useState('player-4');
  const [currentPlayerVote, setCurrentPlayerVote] = useState<VoteChoice | undefined>();
  const [votes, setVotes] = useState<Array<{playerId: string, choice: VoteChoice}>>([]);
  const [rejectionCount, setRejectionCount] = useState(2);
  const [timeRemaining, setTimeRemaining] = useState(45);
  const [showResults, setShowResults] = useState(false);

  // Timer countdown
  useEffect(() => {
    if (timeRemaining > 0 && !showResults) {
      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0 && votes.length < mockVotingData.players.length) {
      // Auto-complete voting for demo
      setShowResults(true);
    }
  }, [timeRemaining, votes.length, showResults]);

  // Mock voting game state
  const progress = calculateVotingProgress(
    votes.map(v => ({
      id: `vote-${v.playerId}`,
      playerId: v.playerId,
      playerName: mockVotingData.players.find(p => p.id === v.playerId)?.name || '',
      choice: v.choice,
      submittedAt: new Date(),
      roundId: 'round-1',
      missionId: 'mission-1',
    })),
    mockVotingData.players
  );

  const rejectionTracker = calculateRejectionTracker(rejectionCount);

  const gameState: VotingGameState = {
    session: {
      ...mockVotingData.session,
      votes: votes.map(v => ({
        id: `vote-${v.playerId}`,
        playerId: v.playerId,
        playerName: mockVotingData.players.find(p => p.id === v.playerId)?.name || '',
        choice: v.choice,
        submittedAt: new Date(),
        roundId: 'round-1',
        missionId: 'mission-1',
      })),
      result: showResults ? {
        approved: votes.filter(v => v.choice === 'approve').length > votes.filter(v => v.choice === 'reject').length,
        approveCount: votes.filter(v => v.choice === 'approve').length,
        rejectCount: votes.filter(v => v.choice === 'reject').length,
        totalVotes: votes.length,
        requiredVotes: mockVotingData.players.length,
        decidedAt: new Date(),
        nextPhase: votes.filter(v => v.choice === 'approve').length > votes.filter(v => v.choice === 'reject').length ? 'mission' : 'teamSelection',
      } : undefined,
    },
    progress,
    rejectionTracker,
    currentPlayerVote,
    canChangeVote: timeRemaining > 10,
    timeRemaining,
    isRevealing: showResults,
  };

  const handleVoteSubmit = async (choice: VoteChoice) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setCurrentPlayerVote(choice);
    setVotes(prev => {
      const existing = prev.find(v => v.playerId === currentPlayerId);
      if (existing) {
        return prev.map(v => v.playerId === currentPlayerId ? { ...v, choice } : v);
      }
      return [...prev, { playerId: currentPlayerId, choice }];
    });

    // Auto-add some other votes for demo
    if (votes.length < 3) {
      setTimeout(() => {
        const availablePlayers = mockVotingData.players.filter(p => 
          p.id !== currentPlayerId && !votes.some(v => v.playerId === p.id)
        );
        if (availablePlayers.length > 0) {
          const randomPlayer = availablePlayers[Math.floor(Math.random() * availablePlayers.length)];
          if (randomPlayer) {
            const randomChoice = Math.random() > 0.5 ? 'approve' : 'reject';
            setVotes(prev => [...prev, { playerId: randomPlayer.id, choice: randomChoice }]);
          }
        }
      }, 2000);
    }
  };

  const handleContinue = () => {
    setShowResults(false);
    setVotes([]);
    setCurrentPlayerVote(undefined);
    setTimeRemaining(45);
    
    // Simulate next round or mission
    if (gameState.session.result?.approved) {
      alert('Mission approved! Moving to mission phase...');
    } else {
      const newRejectionCount = rejectionCount + 1;
      setRejectionCount(newRejectionCount);
      if (newRejectionCount >= 5) {
        alert('Evil team wins! Too many rejections.');
      } else {
        alert('Mission rejected! Leadership rotates to next player.');
      }
    }
  };

  const handlePlayerChange = (playerId: string) => {
    setCurrentPlayerId(playerId);
    setCurrentPlayerVote(votes.find(v => v.playerId === playerId)?.choice);
  };

  return (
    <div className="relative">
      {/* Demo controls */}
      <div className="fixed top-4 left-4 z-50">
        <div className="bg-[#1a1a2e]/90 backdrop-blur-xl rounded-lg p-4 border border-slate-600/30">
          <h3 className="text-white font-semibold mb-3">Demo Controls</h3>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-slate-300 mb-1">Current Player</label>
              <select
                value={currentPlayerId}
                onChange={(e) => handlePlayerChange(e.target.value)}
                className="w-full bg-[#252547] border border-slate-600/30 rounded px-3 py-2 text-white text-sm"
              >
                {mockVotingData.players.map(player => (
                  <option key={player.id} value={player.id}>
                    {player.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm text-slate-300 mb-1">Rejections</label>
              <input
                type="number"
                min="0"
                max="4"
                value={rejectionCount}
                onChange={(e) => setRejectionCount(parseInt(e.target.value))}
                className="w-full bg-[#252547] border border-slate-600/30 rounded px-3 py-2 text-white text-sm"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-1">Time Remaining</label>
              <input
                type="number"
                min="0"
                max="60"
                value={timeRemaining}
                onChange={(e) => setTimeRemaining(parseInt(e.target.value))}
                className="w-full bg-[#252547] border border-slate-600/30 rounded px-3 py-2 text-white text-sm"
              />
            </div>

            <button
              onClick={() => setShowResults(true)}
              className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
            >
              Show Results
            </button>
          </div>
        </div>
      </div>

      {/* Voting screen */}
      <VotingScreen
        roomId="demo-room"
        playerId={currentPlayerId}
        gameState={gameState}
        proposedTeam={mockVotingData.proposedTeam.map(p => ({ ...p, isOnline: true }))}
        missionRound={1}
        requiredPlayers={3}
        leaderName="Arthur"
        onVoteSubmit={handleVoteSubmit}
        onContinue={handleContinue}
      />

      {/* Demo info */}
      <div className="fixed bottom-4 right-4 z-40">
        <div className="bg-[#1a1a2e]/90 backdrop-blur-xl rounded-lg p-4 border border-slate-600/30 max-w-sm">
          <h3 className="text-white font-semibold mb-2">Demo Features</h3>
          <ul className="space-y-1 text-sm text-slate-300">
            <li>• Interactive voting interface</li>
            <li>• Real-time progress tracking</li>
            <li>• Countdown timer with urgency</li>
            <li>• Dramatic results reveal</li>
            <li>• Rejection tracking system</li>
            <li>• Vote change capability</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
