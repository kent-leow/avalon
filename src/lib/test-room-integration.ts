/**
 * Test utilities for Room API integration
 */

import { api } from '~/trpc/react';
import { validateRoomCode } from '~/lib/room-code-generator';

export async function testRoomCreation() {
  console.log('Testing room creation...');
  
  try {
    // This would be used in a component with tRPC
    const result = {
      hostName: 'Test Host',
      settings: {
        characters: ['merlin', 'assassin', 'loyal', 'loyal', 'minion'],
        playerCount: 5,
        allowSpectators: false,
        autoStart: false
      }
    };
    
    console.log('Mock room creation payload:', result);
    return result;
  } catch (error) {
    console.error('Room creation test failed:', error);
    throw error;
  }
}

export async function testRoomJoining() {
  console.log('Testing room joining...');
  
  try {
    const joinData = {
      roomCode: 'TEST1234',
      playerName: 'Test Player',
      sessionId: 'test-session-id'
    };
    
    // Validate room code format
    const isValidCode = validateRoomCode(joinData.roomCode);
    console.log('Room code validation:', isValidCode);
    
    console.log('Mock room joining payload:', joinData);
    return joinData;
  } catch (error) {
    console.error('Room joining test failed:', error);
    throw error;
  }
}

export function testRoomCodeGeneration() {
  console.log('Testing room code generation...');
  
  const testCodes = [
    'ABCD1234',
    'XYZ89012',
    'TEST1234',
    'ROOM5678'
  ];
  
  testCodes.forEach(code => {
    const isValid = validateRoomCode(code);
    console.log(`Code ${code}: ${isValid ? 'Valid' : 'Invalid'}`);
  });
  
  // Test invalid codes
  const invalidCodes = [
    'ABC123',    // Too short
    'ABCD12345', // Too long
    'abc1234',   // Lowercase
    'ABCD123O',  // Contains 'O'
    'ABCD123I',  // Contains 'I'
  ];
  
  invalidCodes.forEach(code => {
    const isValid = validateRoomCode(code);
    console.log(`Invalid code ${code}: ${isValid ? 'Valid' : 'Invalid'}`);
  });
}

// Run tests
if (typeof window !== 'undefined') {
  // Client-side only tests
  console.log('🧪 Running Room API Integration Tests...');
  
  testRoomCodeGeneration();
  testRoomCreation();
  testRoomJoining();
  
  console.log('✅ Room API Integration Tests completed');
}
