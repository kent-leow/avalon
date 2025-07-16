'use client';

import { useRouter } from 'next/navigation';
import { CreateRoomForm } from './CreateRoomForm';
import { type Room } from '~/types/room';

export default function CreateRoomPage() {
  const router = useRouter();

  const handleRoomCreated = (room: Room) => {
    console.log('Room created:', room);
    // Navigate to the room lobby
    router.push(`/room/${room.code}/lobby`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#252547] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <CreateRoomForm onRoomCreated={handleRoomCreated} />
      </div>
    </div>
  );
}
