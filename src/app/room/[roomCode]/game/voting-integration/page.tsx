import VotingScreenIntegration from "../VotingScreenIntegration";

export default function VotingIntegrationPage() {
  // Mock data for demonstration
  const roomCode = "DEMO1234";
  const playerId = "player-1";

  return (
    <VotingScreenIntegration
      roomCode={roomCode}
      playerId={playerId}
    />
  );
}
