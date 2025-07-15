import { JoinRoomForm } from './JoinRoomForm';
import { type Room, type Player } from '~/types/room';

interface PageProps {
  params: Promise<{
    roomCode: string;
  }>;
}

export default async function RoomPage({ params }: PageProps) {
  const { roomCode } = await params;

  const handleJoinSuccess = (room: Room, player: Player) => {
    console.log('Successfully joined room:', room, 'as player:', player);
    // TODO: Navigate to room lobby or handle success
  };

  const handleJoinError = (error: string) => {
    console.error('Failed to join room:', error);
    // TODO: Handle error (show notification, redirect, etc.)
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#252547] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <JoinRoomForm
          roomCode={roomCode}
          onJoinSuccess={handleJoinSuccess}
          onJoinError={handleJoinError}
        />
      </div>
    </div>
  );
}
