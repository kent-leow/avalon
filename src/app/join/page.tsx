'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { JoinRoomForm } from './JoinRoomForm';
import { getSession } from '~/lib/session';

export default function JoinPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const forceJoin = searchParams.get('force') === 'true';

  useEffect(() => {
    // Only redirect if not forcing a new join
    if (!forceJoin) {
      const session = getSession();
      if (session?.roomCode) {
        // User already has an active session, redirect to lobby
        router.push(`/room/${session.roomCode}/lobby`);
      }
    }
  }, [router, forceJoin]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#252547] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <JoinRoomForm />
      </div>
    </div>
  );
}
