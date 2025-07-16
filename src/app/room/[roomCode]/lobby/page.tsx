import { RoomLobbyClient } from "./RoomLobbyClient";

interface PageProps {
  params: Promise<{
    roomCode: string;
  }>;
}

export default async function RoomLobbyPage({ params }: PageProps) {
  const { roomCode } = await params;

  return <RoomLobbyClient roomCode={roomCode} />;
}
