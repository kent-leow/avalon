'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';
import { JoinRoomForm } from './JoinRoomForm';
import { getSession } from '~/lib/session';

function JoinContent() {
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

export default function JoinPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#252547] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    }>
      <JoinContent />
    </Suspense>
  );
}
