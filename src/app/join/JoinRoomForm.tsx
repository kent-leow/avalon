'use client';

import { useState } from 'react';
import { JoinRoomForm as RoomJoinForm } from '../room/[roomCode]/JoinRoomForm';
import { type Room, type Player } from '~/types/room';

interface JoinRoomFormProps {
  className?: string;
}

export function JoinRoomForm({ className = '' }: JoinRoomFormProps) {
  const handleJoinSuccess = (room: Room, player: Player) => {
    console.log('Successfully joined room:', room, 'as player:', player);
    // TODO: Navigate to room lobby or handle success
  };

  const handleJoinError = (error: string) => {
    console.error('Failed to join room:', error);
    // TODO: Handle error (show notification, redirect, etc.)
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
