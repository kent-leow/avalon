'use client';

import { CreateRoomForm } from './CreateRoomForm';
import { type Room } from '~/types/room';

export default function CreateRoomPage() {
  const handleRoomCreated = (room: Room) => {
    console.log('Room created:', room);
    // TODO: Navigate to room lobby or handle success
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#252547] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <CreateRoomForm onRoomCreated={handleRoomCreated} />
      </div>
    </div>
  );
}
