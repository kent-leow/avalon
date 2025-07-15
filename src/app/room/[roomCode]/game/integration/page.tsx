import RoleRevealIntegration from "../RoleRevealIntegration";

export default function RoleRevealIntegrationDemoPage() {
  return (
    <RoleRevealIntegration
      roomId="demo-room-id"
      playerId="demo-player-id"
      playerName="Demo Player"
      onContinue={() => {
        console.log("Role reveal completed, transitioning to next phase");
        // In a real implementation, this would navigate to the next game phase
      }}
    />
  );
}
