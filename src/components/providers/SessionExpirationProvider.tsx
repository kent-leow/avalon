'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getSession, clearSession } from '~/lib/session';

export function SessionExpirationProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isCheckingRef = useRef(false);

  useEffect(() => {
    const checkSessionExpiration = async () => {
      // Prevent multiple simultaneous checks
      if (isCheckingRef.current) return;
      isCheckingRef.current = true;

      try {
        const session = getSession();
        
        if (!session || !session.roomCode) {
          isCheckingRef.current = false;
          return;
        }

        // First check if session is expired locally
        if (new Date() > new Date(session.expiresAt)) {
          console.log('Session expired locally, clearing and redirecting');
          clearSession();
          router.push('/');
          return;
        }

        // Check with server if room still exists
        try {
          const response = await fetch(`/api/trpc/room.getRoomInfo?batch=1&input=${encodeURIComponent(JSON.stringify({ "0": { "json": { roomCode: session.roomCode } } }))}`);
          
          if (!response.ok) {
            console.log('Room check failed with status:', response.status);
            if (response.status === 404 || response.status === 400) {
              clearSession();
              router.push('/');
            }
            return;
          }

          const data = await response.json();
          
          if (data[0]?.error) {
            const error = data[0].error;
            const errorMessage = error.message || error.data?.message || 'Room check failed';
            
            if (errorMessage.includes('expired') || 
                errorMessage.includes('not found') || 
                errorMessage.includes('does not exist') ||
                error.data?.code === 'NOT_FOUND') {
              console.log('Room expired or not found, clearing session');
              clearSession();
              router.push('/');
            }
          }
        } catch (error) {
          console.log('Error checking room status:', error);
          // Only clear session if it's clearly a network error, not a parsing error
          if (error instanceof TypeError && error.message.includes('fetch')) {
            // Network error - don't clear session, just log
            console.log('Network error, keeping session');
          } else {
            // Other errors - clear session to be safe
            clearSession();
            router.push('/');
          }
        }
      } finally {
        isCheckingRef.current = false;
      }
    };

    // Check immediately on mount
    checkSessionExpiration();

    // Set up periodic check every 30 seconds
    const interval = setInterval(checkSessionExpiration, 30000);

    return () => {
      clearInterval(interval);
      isCheckingRef.current = false;
    };
  }, [router]);

  return <>{children}</>;
}
