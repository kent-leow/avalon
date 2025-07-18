import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function startGame() {
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
    
    // Start the game by updating the room to roleReveal phase
    await prisma.room.update({
      where: { id: room.id },
      data: {
        phase: 'roleReveal',
        startedAt: new Date(),
        gameState: {
          phase: 'roleReveal',
          round: 1,
          leaderIndex: 0,
          votes: [],
          missions: [],
          startedAt: new Date().toISOString()
        }
      }
    });
    
    // Assign roles to players
    const roles = ['merlin', 'assassin', 'loyal', 'loyal', 'minion'];
    for (let i = 0; i < room.players.length; i++) {
      const player = room.players[i];
      const role = roles[i % roles.length];
      
      await prisma.player.update({
        where: { id: player.id },
        data: {
          role: role,
          roleData: {
            role: role,
            team: role === 'merlin' || role === 'loyal' ? 'good' : 'evil',
            canSeeEvil: role === 'merlin',
            knownPlayers: role === 'merlin' ? room.players.filter(p => p.id !== player.id).map(p => ({ id: p.id, name: p.name, role: roles[room.players.indexOf(p) % roles.length] })) : []
          }
        }
      });
      
      console.log(`Assigned role ${role} to player ${player.name}`);
    }
    
    console.log('Game started successfully');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

startGame();
