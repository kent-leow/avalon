import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function addMockPlayers() {
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
    
    const mockPlayers = [
      { name: 'Alice', sessionId: 'session-alice' },
      { name: 'Bob', sessionId: 'session-bob' },
      { name: 'Charlie', sessionId: 'session-charlie' },
      { name: 'Diana', sessionId: 'session-diana' }
    ];
    
    for (const player of mockPlayers) {
      await prisma.player.create({
        data: {
          name: player.name,
          sessionId: player.sessionId,
          roomId: room.id,
          isReady: true
        }
      });
      console.log('Added player:', player.name);
    }
    
    console.log('Mock players added successfully');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addMockPlayers();
