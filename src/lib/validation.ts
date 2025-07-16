import { z } from 'zod';

// Profanity filter (simplified - in production use a proper library)
const PROFANITY_WORDS = [
  'damn', 'hell', 'stupid', 'idiot', 'fuck', 'shit', 'bitch', 'ass',
  // Add more as needed
];

function containsProfanity(text: string): boolean {
  const normalizedText = text.toLowerCase();
  return PROFANITY_WORDS.some(word => {
    // Use word boundaries to avoid false positives
    const wordBoundaryRegex = new RegExp(`\\b${word}\\b`, 'i');
    return wordBoundaryRegex.test(normalizedText);
  });
}

function isValidLength(text: string, min: number, max: number): boolean {
  return text.length >= min && text.length <= max;
}

function containsOnlyAllowedCharacters(text: string, pattern: RegExp): boolean {
  return pattern.test(text);
}

// Enhanced room code validation
export const secureRoomCodeSchema = z
  .string()
  .min(4, 'Room code must be at least 4 characters')
  .max(8, 'Room code must be at most 8 characters')
  .regex(/^[A-Z0-9]+$/, 'Room code must contain only uppercase letters and numbers')
  .refine(
    (code) => !containsProfanity(code), 
    'Room code contains inappropriate content'
  )
  .refine(
    (code) => !/^(TEST|ADMIN|DEBUG|NULL|UNDEFINED)$/.test(code),
    'Room code cannot use reserved words'
  );

// Enhanced player name validation
export const securePlayerNameSchema = z
  .string()
  .min(2, 'Player name must be at least 2 characters')
  .max(20, 'Player name must be at most 20 characters')
  .regex(/^[a-zA-Z0-9\s\-_]+$/, 'Player name contains invalid characters')
  .refine(
    (name) => !containsProfanity(name), 
    'Player name contains inappropriate content'
  )
  .refine(
    (name) => !/^\s+$/.test(name),
    'Player name cannot be only whitespace'
  )
  .refine(
    (name) => !/(admin|moderator|bot|system|null|undefined)/i.test(name),
    'Player name cannot use reserved words'
  )
  .transform((name) => name.trim()); // Trim whitespace

// Game settings validation
export const gameSettingsSchema = z.object({
  playerCount: z.number()
    .min(5, 'Game requires at least 5 players')
    .max(10, 'Game supports at most 10 players'),
  
  timeLimit: z.number()
    .min(30, 'Time limit must be at least 30 seconds')
    .max(600, 'Time limit must be at most 10 minutes')
    .optional(),
  
  enableSpecialRoles: z.boolean().default(false),
  
  enableChat: z.boolean().default(true),
  
  spectatorMode: z.boolean().default(false),
  
  difficulty: z.enum(['easy', 'normal', 'hard']).default('normal'),
});

// Mission voting validation
export const missionVoteSchema = z.object({
  vote: z.enum(['success', 'failure'], {
    required_error: 'Vote must be either success or failure'
  }),
  
  playerId: z.string()
    .min(1, 'Player ID is required')
    .max(100, 'Player ID too long'),
  
  missionId: z.string()
    .min(1, 'Mission ID is required')
    .max(100, 'Mission ID too long'),
  
  timestamp: z.number()
    .min(0, 'Invalid timestamp')
    .max(Date.now() + 60000, 'Timestamp cannot be in the future'),
});

// Team selection validation
export const teamSelectionSchema = z.object({
  selectedPlayers: z.array(z.string())
    .min(1, 'At least one player must be selected')
    .max(5, 'Too many players selected')
    .refine(
      (players) => new Set(players).size === players.length,
      'Duplicate players in selection'
    ),
  
  missionNumber: z.number()
    .min(1, 'Mission number must be at least 1')
    .max(5, 'Mission number must be at most 5'),
  
  playerId: z.string()
    .min(1, 'Player ID is required'),
});

// Team approval voting validation
export const teamApprovalVoteSchema = z.object({
  vote: z.enum(['approve', 'reject'], {
    required_error: 'Vote must be either approve or reject'
  }),
  
  playerId: z.string()
    .min(1, 'Player ID is required'),
  
  proposalId: z.string()
    .min(1, 'Proposal ID is required'),
  
  timestamp: z.number()
    .min(0, 'Invalid timestamp')
    .max(Date.now() + 60000, 'Timestamp cannot be in the future'),
});

// Chat message validation
export const chatMessageSchema = z.object({
  message: z.string()
    .min(1, 'Message cannot be empty')
    .max(500, 'Message too long')
    .refine(
      (msg) => !containsProfanity(msg),
      'Message contains inappropriate content'
    )
    .refine(
      (msg) => !/^[\s\n\r\t]*$/.test(msg),
      'Message cannot be only whitespace'
    )
    .transform((msg) => msg.trim()),
  
  playerId: z.string()
    .min(1, 'Player ID is required'),
  
  roomCode: z.string()
    .min(4, 'Room code is required'),
  
  timestamp: z.number()
    .min(0, 'Invalid timestamp')
    .max(Date.now() + 60000, 'Timestamp cannot be in the future'),
});

// Assassin attempt validation
export const assassinAttemptSchema = z.object({
  targetPlayerId: z.string()
    .min(1, 'Target player ID is required'),
  
  assassinPlayerId: z.string()
    .min(1, 'Assassin player ID is required'),
  
  roomCode: z.string()
    .min(4, 'Room code is required'),
  
  timestamp: z.number()
    .min(0, 'Invalid timestamp')
    .max(Date.now() + 60000, 'Timestamp cannot be in the future'),
});

// Generic ID validation
export const playerIdSchema = z.string()
  .min(1, 'Player ID is required')
  .max(100, 'Player ID too long')
  .regex(/^[a-zA-Z0-9\-_]+$/, 'Player ID contains invalid characters');

export const roomIdSchema = z.string()
  .min(1, 'Room ID is required')
  .max(100, 'Room ID too long')
  .regex(/^[a-zA-Z0-9\-_]+$/, 'Room ID contains invalid characters');

// Request validation helpers
export function validateAndSanitize<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.errors.map(err => err.message).join(', ');
      throw new Error(`Validation failed: ${messages}`);
    }
    throw error;
  }
}

// Validation middleware helper
export function createValidationMiddleware<T>(schema: z.ZodSchema<T>) {
  return (data: unknown): T => {
    return validateAndSanitize(schema, data);
  };
}

// Export legacy schemas for backward compatibility
export const roomCodeSchema = secureRoomCodeSchema;
export const playerNameSchema = securePlayerNameSchema;

// Common validation patterns
export const VALIDATION_PATTERNS = {
  ROOM_CODE: /^[A-Z0-9]{4,8}$/,
  PLAYER_NAME: /^[a-zA-Z0-9\s\-_]{2,20}$/,
  PLAYER_ID: /^[a-zA-Z0-9\-_]{1,100}$/,
  ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
  SAFE_STRING: /^[a-zA-Z0-9\s\-_.,!?]+$/,
} as const;

// Validation error types
export class ValidationError extends Error {
  constructor(
    public field: string,
    public code: string,
    message: string
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Security validation helpers
export function validateCSRFToken(token: string, expectedToken: string): boolean {
  return token === expectedToken && token.length > 0;
}

export function validateTimestamp(timestamp: number, toleranceMs: number = 60000): boolean {
  const now = Date.now();
  return timestamp >= (now - toleranceMs) && timestamp <= (now + toleranceMs);
}

export function validateSessionToken(token: string): boolean {
  return token.length > 0 && /^[a-zA-Z0-9\-_.]+$/.test(token);
}
