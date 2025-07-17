// Simple test to verify database connection and session creation
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Test if we can create a simple room
    const testRoom = await prisma.room.create({
      data: {
        code: 'TEST123',
        hostId: '',
        gameState: { phase: 'lobby', round: 0, leaderIndex: 0, votes: [], missions: [] },
        settings: { characters: [], playerCount: 5, allowSpectators: false, autoStart: false },
        phase: 'lobby',
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });
    
    console.log('✅ Test room created:', testRoom.id);
    
    // Clean up
    await prisma.room.delete({ where: { id: testRoom.id } });
    console.log('✅ Test room cleaned up');
    
  } catch (error) {
    console.error('❌ Database error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
