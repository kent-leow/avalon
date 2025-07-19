/**
 * Test the role reveal API directly
 */

import { createTRPCClient, httpBatchLink } from '@trpc/client';

const trpc = createTRPCClient({
  links: [
    httpBatchLink({
      url: 'http://localhost:3000/api/trpc',
    }),
  ],
});

async function testRoleRevealAPI() {
  try {
    console.log('Testing role reveal API...');
    
    // Test data from our database
    const roomId = 'cmd9ansb2000buo3kb58eurms';
    const playerId = 'cmd9ansbc000duo3ktdaq1n20';
    
    console.log('Room ID:', roomId);
    console.log('Player ID:', playerId);
    
    // Test getRoleKnowledge
    const roleKnowledge = await trpc.room.getRoleKnowledge.query({
      roomId,
      playerId,
    });
    
    console.log('Role knowledge response:');
    console.log('- Player role:', roleKnowledge.playerRole);
    console.log('- Known players:', roleKnowledge.knownPlayers);
    
    // Test confirmRoleRevealed
    const confirmResult = await trpc.room.confirmRoleRevealed.mutate({
      roomId,
      playerId,
    });
    
    console.log('Confirm role revealed response:');
    console.log('- Success:', confirmResult.success);
    console.log('- All players ready:', confirmResult.allPlayersReady);
    
    console.log('\n✅ API test successful!');
    
  } catch (error) {
    console.error('❌ API test failed:', error);
  }
}

testRoleRevealAPI();
