'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { JoinRoomForm as RoomJoinForm } from '../room/[roomCode]/JoinRoomForm';
import { type Room, type Player } from '~/types/room';

interface JoinRoomFormProps {
  className?: string;
}

export function JoinRoomForm({ className = '' }: JoinRoomFormProps) {
  const router = useRouter();

  const handleJoinSuccess = (room: Room, player: Player) => {
    console.log('Successfully joined room:', room, 'as player:', player);
    // Navigate to room lobby
    router.push(`/room/${room.code}/lobby`);
  };

  const handleJoinError = (error: string) => {
    console.error('Failed to join room:', error);
    // Error is already displayed in the form component
  };

  return (
    <div className={className}>
      <RoomJoinForm 
        onJoinSuccess={handleJoinSuccess}
        onJoinError={handleJoinError}
      />
    </div>
  );
}
