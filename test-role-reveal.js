import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testRoleReveal() {
  try {
    const room = await prisma.room.findFirst({
      where: { code: 'PPBNLE8G' },
      include: { players: true }
    });
    
    if (!room) {
      console.log('Room not found');
      return;
    }
    
    console.log('Room Info:');
    console.log('- Room ID:', room.id);
    console.log('- Phase:', room.phase);
    console.log('- Players:', room.players.length);
    
    room.players.forEach(player => {
      console.log(`- Player: ${player.name} (ID: ${player.id}, Session: ${player.sessionId}, Role: ${player.role})`);
    });
    
    // Test role knowledge for TestPlayer
    const testPlayer = room.players.find(p => p.name === 'TestPlayer');
    if (testPlayer) {
      console.log('\nTestPlayer Details:');
      console.log('- Database ID:', testPlayer.id);
      console.log('- Session ID:', testPlayer.sessionId);
      console.log('- Role:', testPlayer.role);
      console.log('- Role Data:', JSON.stringify(testPlayer.roleData, null, 2));
    }
    
    console.log('\nTesting if API call would work:');
    console.log('Room ID:', room.id);
    console.log('Player ID:', testPlayer?.id);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testRoleReveal();
