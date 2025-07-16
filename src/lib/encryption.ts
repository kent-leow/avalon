import { createCipheriv, createDecipheriv, randomBytes, pbkdf2Sync } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16; // 128 bits
const SALT_LENGTH = 32; // 256 bits
const TAG_LENGTH = 16; // 128 bits

// Get encryption key from environment or derive from password
function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  if (key) {
    return Buffer.from(key, 'hex');
  }
  
  // Fallback: derive key from password (not recommended for production)
  const password = process.env.ENCRYPTION_PASSWORD || 'fallback-password';
  const salt = Buffer.from(process.env.ENCRYPTION_SALT || 'fallback-salt', 'utf8');
  
  return pbkdf2Sync(password, salt, 100000, KEY_LENGTH, 'sha256');
}

export interface EncryptedData {
  encrypted: string;
  iv: string;
  tag: string;
  version: number;
}

export function encrypt(text: string): string {
  const key = getEncryptionKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const tag = cipher.getAuthTag();
  
  const encryptedData: EncryptedData = {
    encrypted,
    iv: iv.toString('hex'),
    tag: tag.toString('hex'),
    version: 1
  };
  
  return Buffer.from(JSON.stringify(encryptedData)).toString('base64');
}

export function decrypt(encryptedText: string): string {
  const key = getEncryptionKey();
  
  let encryptedData: EncryptedData;
  try {
    encryptedData = JSON.parse(Buffer.from(encryptedText, 'base64').toString('utf8'));
  } catch (error) {
    throw new Error('Invalid encrypted data format');
  }
  
  const { encrypted, iv, tag, version } = encryptedData;
  
  if (version !== 1) {
    throw new Error('Unsupported encryption version');
  }
  
  const decipher = createDecipheriv(ALGORITHM, key, Buffer.from(iv, 'hex'));
  decipher.setAuthTag(Buffer.from(tag, 'hex'));
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

// Encrypt sensitive player data
export function encryptPlayerData(data: {
  playerId: string;
  playerName: string;
  roomCode: string;
  role?: string;
  deviceFingerprint?: string;
}): string {
  return encrypt(JSON.stringify(data));
}

export function decryptPlayerData(encryptedData: string): {
  playerId: string;
  playerName: string;
  roomCode: string;
  role?: string;
  deviceFingerprint?: string;
} {
  const decrypted = decrypt(encryptedData);
  return JSON.parse(decrypted);
}

// Encrypt game state data
export function encryptGameState(gameState: Record<string, any>): string {
  return encrypt(JSON.stringify(gameState));
}

export function decryptGameState(encryptedData: string): Record<string, any> {
  const decrypted = decrypt(encryptedData);
  return JSON.parse(decrypted);
}

// Encrypt session data
export function encryptSessionData(sessionData: Record<string, any>): string {
  return encrypt(JSON.stringify(sessionData));
}

export function decryptSessionData(encryptedData: string): Record<string, any> {
  const decrypted = decrypt(encryptedData);
  return JSON.parse(decrypted);
}

// Hash-based encryption for passwords (use bcrypt in production)
export function hashPassword(password: string): string {
  const salt = randomBytes(SALT_LENGTH);
  const hash = pbkdf2Sync(password, salt, 100000, KEY_LENGTH, 'sha256');
  
  return salt.toString('hex') + ':' + hash.toString('hex');
}

export function verifyPassword(password: string, hashedPassword: string): boolean {
  const [saltHex, hashHex] = hashedPassword.split(':');
  if (!saltHex || !hashHex) {
    return false;
  }
  
  const salt = Buffer.from(saltHex, 'hex');
  const hash = Buffer.from(hashHex, 'hex');
  
  const derivedHash = pbkdf2Sync(password, salt, 100000, KEY_LENGTH, 'sha256');
  
  return constantTimeCompare(hash, derivedHash);
}

// Constant-time buffer comparison
function constantTimeCompare(a: Buffer, b: Buffer): boolean {
  if (a.length !== b.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= (a[i] ?? 0) ^ (b[i] ?? 0);
  }
  
  return result === 0;
}

// Utility functions for specific data types
export function encryptString(text: string): string {
  return encrypt(text);
}

export function decryptString(encryptedText: string): string {
  return decrypt(encryptedText);
}

export function encryptJSON(obj: any): string {
  return encrypt(JSON.stringify(obj));
}

export function decryptJSON<T = any>(encryptedData: string): T {
  const decrypted = decrypt(encryptedData);
  return JSON.parse(decrypted);
}

// Error classes
export class EncryptionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EncryptionError';
  }
}

export class DecryptionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DecryptionError';
  }
}

// Key rotation support
export function rotateEncryptionKey(oldKey: string, newKey: string, encryptedData: string): string {
  // Set old key temporarily
  const originalKey = process.env.ENCRYPTION_KEY;
  process.env.ENCRYPTION_KEY = oldKey;
  
  try {
    // Decrypt with old key
    const decrypted = decrypt(encryptedData);
    
    // Set new key
    process.env.ENCRYPTION_KEY = newKey;
    
    // Encrypt with new key
    const reencrypted = encrypt(decrypted);
    
    return reencrypted;
  } finally {
    // Restore original key
    process.env.ENCRYPTION_KEY = originalKey;
  }
}

// Development helpers
export function isEncryptionEnabled(): boolean {
  return process.env.NODE_ENV === 'production' || 
         process.env.ENABLE_ENCRYPTION === 'true';
}

export function generateEncryptionKey(): string {
  return randomBytes(KEY_LENGTH).toString('hex');
}

export function generateEncryptionSalt(): string {
  return randomBytes(SALT_LENGTH).toString('hex');
}

// Constants
export const ENCRYPTION_CONSTANTS = {
  ALGORITHM,
  KEY_LENGTH,
  IV_LENGTH,
  SALT_LENGTH,
  TAG_LENGTH,
  VERSION: 1,
} as const;
