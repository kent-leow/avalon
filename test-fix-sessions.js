import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixSessionIds() {
  try {
    const room = await prisma.room.findFirst({
      where: { code: 'PPBNLE8G' },
      include: { players: true }
    });
    
    if (!room) {
      console.log('Room not found');
      return;
    }
    
    console.log('Current players:', room.players.length);
    
    // Update the TestPlayer to have the correct sessionId
    const testPlayer = room.players.find(p => p.name === 'TestPlayer');
    if (testPlayer) {
      await prisma.player.update({
        where: { id: testPlayer.id },
        data: {
          sessionId: 'de541a10-5b6e-4aa3-a88f-47d10c0d6749'
        }
      });
      console.log('Updated TestPlayer sessionId');
    }
    
    // Update other players with their existing sessionIds
    const otherPlayers = room.players.filter(p => p.name !== 'TestPlayer');
    for (const player of otherPlayers) {
      let sessionId = player.sessionId;
      if (!sessionId) {
        sessionId = `session-${player.name.toLowerCase()}`;
        await prisma.player.update({
          where: { id: player.id },
          data: {
            sessionId: sessionId
          }
        });
        console.log(`Updated ${player.name} sessionId to ${sessionId}`);
      }
    }
    
    console.log('Session IDs updated successfully');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixSessionIds();
