/**
 * Assassin Integration Demo Page
 * 
 * Demo page showing real backend integration for assassin phase.
 */

import { AssassinScreenIntegration } from '../AssassinScreenIntegration';

export default function AssassinIntegrationPage() {
  // Mock room code and player ID for demo
  const mockRoomCode = 'DEMO1234';
  const mockPlayerId = 'demo-assassin-player';
  
  const handleComplete = (result: any) => {
    console.log('Assassination result:', result);
    // In real implementation, this would navigate to game results
    alert(`Assassination ${result.wasCorrect ? 'successful' : 'failed'}! Game outcome: ${result.gameOutcome}`);
  };
  
  return (
    <div>
      <AssassinScreenIntegration
        roomCode={mockRoomCode}
        playerId={mockPlayerId}
        onComplete={handleComplete}
      />
    </div>
  );
}
