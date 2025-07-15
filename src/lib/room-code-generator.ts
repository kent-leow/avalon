import { customAlphabet } from 'nanoid';

// Character set for room codes - excludes confusing characters
const ROOM_CODE_ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
const ROOM_CODE_LENGTH = 8;

// Create a custom nanoid generator
const generateRoomCode = customAlphabet(ROOM_CODE_ALPHABET, ROOM_CODE_LENGTH);

/**
 * Generate a unique room code
 * @returns A unique 8-character room code
 */
export function createRoomCode(): string {
  return generateRoomCode();
}

/**
 * Validate a room code format
 * @param code The room code to validate
 * @returns Whether the code is valid
 */
export function validateRoomCode(code: string): boolean {
  if (!code || code.length !== ROOM_CODE_LENGTH) {
    return false;
  }
  
  // Check if all characters are in the allowed alphabet
  return code.split('').every(char => ROOM_CODE_ALPHABET.includes(char));
}

/**
 * Format a room code for display
 * @param code The room code to format
 * @returns Formatted room code with spacing
 */
export function formatRoomCode(code: string): string {
  if (!validateRoomCode(code)) {
    return code;
  }
  
  // Format as XXXX-XXXX for better readability
  return `${code.slice(0, 4)}-${code.slice(4)}`;
}

/**
 * Generate a join URL for a room
 * @param roomCode The room code
 * @param baseUrl The base URL of the application
 * @returns Complete join URL
 */
export function generateJoinUrl(roomCode: string, baseUrl: string = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'): string {
  return `${baseUrl}/room/${roomCode}`;
}
