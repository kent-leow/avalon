'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { JoinRoomForm } from './JoinRoomForm';
import { getSession } from '~/lib/session';

export default function JoinPage() {
  const router = useRouter();

  useEffect(() => {
    const session = getSession();
    if (session?.roomId) {
      // User already has an active session, redirect to lobby
      router.push(`/room/${session.roomId}/lobby`);
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#252547] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <JoinRoomForm />
      </div>
    </div>
  );
}
