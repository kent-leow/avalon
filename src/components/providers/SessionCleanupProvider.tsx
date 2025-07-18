'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { clearSession, getSession } from '~/lib/session';

/**
 * Provider that handles session management based on current route
 * - Validates room existence before redirecting users to their lobby/game
 * - Clears session when room doesn't exist or when users are not in lobby/game routes
 */
export function SessionCleanupProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    if (isChecking) return; // Prevent multiple simultaneous checks

    // Define patterns for routes where sessions should be preserved
    const preserveSessionRoutes = [
      /^\/room\/[^\/]+\/lobby/,  // /room/[code]/lobby
      /^\/room\/[^\/]+\/game/,   // /room/[code]/game
    ];
    
    // Check if current path matches any preserve pattern
    const shouldPreserveSession = preserveSessionRoutes.some(pattern => 
      pattern.test(pathname)
    );
    
    // If not in a route where sessions should be preserved
    if (!shouldPreserveSession) {
      const currentSession = getSession();
      if (currentSession) {
        // If user has a valid session with room info, validate room existence
        if (currentSession.roomCode && currentSession.roomId) {
          setIsChecking(true);
          
          // Validate room existence before redirecting
          const validateAndRedirect = async () => {
            try {
              console.log('Validating room existence before redirect:', currentSession.roomCode);
              
              // Use direct tRPC endpoint to check room existence
              const response = await fetch(`/api/trpc/room.getRoomInfo?batch=1&input=${encodeURIComponent(JSON.stringify({ 0: { roomCode: currentSession.roomCode } }))}`, {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                }
              });
              
              if (response.ok) {
                const roomData = await response.json();
                
                if (roomData?.[0]?.result?.data) {
                  console.log('Room exists, redirecting user to their lobby:', currentSession.roomCode);
                  router.push(`/room/${currentSession.roomCode}/lobby`);
                } else {
                  console.log('Room query succeeded but no room data found, clearing session:', currentSession.roomCode);
                  clearSession();
                }
              } else {
                console.log('Room validation failed with status:', response.status, 'clearing session:', currentSession.roomCode);
                clearSession();
              }
            } catch (error) {
              console.log('Room validation failed with error, clearing session:', error);
              clearSession();
            } finally {
              setIsChecking(false);
            }
          };
          
          validateAndRedirect();
          return;
        }
        
        // If session exists but has no room info, clear it
        console.log('Clearing session - user not in lobby/game route and no room info:', pathname);
        clearSession();
      }
    }
  }, [pathname, router, isChecking]);

  return <>{children}</>;
}
