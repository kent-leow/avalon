import MissionTeamSelectorIntegration from "../MissionTeamSelectorIntegration";

export default function MissionTeamSelectorIntegrationPage() {
  // Mock data for demonstration
  const roomCode = "DEMO1234";
  const playerId = "player-1";

  return (
    <MissionTeamSelectorIntegration
      roomCode={roomCode}
      playerId={playerId}
    />
  );
}
