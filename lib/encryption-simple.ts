import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16; // 128 bits

// Generate or get encryption key from environment
function getEncryptionKey(): Buffer {
  const keyFromEnv = process.env.ENCRYPTION_KEY;
  if (keyFromEnv) {
    // Accept hex or base64, prefer hex
    if (keyFromEnv.length === 64) {
      return Buffer.from(keyFromEnv, 'hex');
    } else if (keyFromEnv.length === 44) {
      return Buffer.from(keyFromEnv, 'base64');
    } else {
      throw new Error('ENCRYPTION_KEY must be 32 bytes (64 hex chars or 44 base64 chars)');
    }
  }
  // Generate a new key (for development only)
  console.warn('WARNING: No ENCRYPTION_KEY found in environment. Using generated key (not recommended for production)');
  return crypto.randomBytes(KEY_LENGTH);
}

const encryptionKey = getEncryptionKey();

export interface EncryptedData {
  encrypted: string;
  iv: string;
}

/**
 * Encrypts a string using AES-256-CBC
 * @param text The plaintext to encrypt
 * @returns Encrypted data with IV
 */
export function encrypt(text: string): EncryptedData {
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, encryptionKey, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return {
      encrypted,
      iv: iv.toString('hex'),
    };
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypts data that was encrypted with the encrypt function
 * @param encryptedData The encrypted data object
 * @returns The decrypted plaintext
 */
export function decrypt(encryptedData: EncryptedData): string {
  try {
    const { encrypted, iv } = encryptedData;
    const ivBuffer = Buffer.from(iv, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, encryptionKey, ivBuffer);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data - data may be corrupted or tampered with');
  }
}

/**
 * Encrypts a secret for storage in the database
 * @param secretText The plaintext secret
 * @returns Encrypted secret as a JSON string
 */
export function encryptSecret(secretText: string): string {
  const encryptedData = encrypt(secretText);
  return JSON.stringify(encryptedData);
}

/**
 * Decrypts a secret from the database
 * @param encryptedSecret The encrypted secret JSON string from database
 * @returns The decrypted plaintext secret
 */
export function decryptSecret(encryptedSecret: string): string {
  try {
    // Try to parse as JSON (new format)
    const encryptedData: EncryptedData = JSON.parse(encryptedSecret);
    return decrypt(encryptedData);  } catch (error) {
    // If JSON parsing fails, assume it's a legacy plaintext secret
    console.warn('WARNING: Legacy plaintext secret detected. Consider running clear-secrets.sql to clean up incompatible data.');
    console.warn('Secret preview:', encryptedSecret.substring(0, 20) + '...');
    return encryptedSecret;
  }
}

/**
 * Generates a new encryption key (for key rotation)
 * @returns New encryption key as hex string
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(KEY_LENGTH).toString('hex');
}

/**
 * Validates that encryption/decryption is working correctly
 * @returns true if encryption is working, false otherwise
 */
export function validateEncryption(): boolean {
  try {
    const testText = 'This is a test secret for validation';
    const encrypted = encryptSecret(testText);
    const decrypted = decryptSecret(encrypted);
    return decrypted === testText;
  } catch (error) {
    console.error('Encryption validation failed:', error);
    return false;
  }
}

// Validate encryption on module load
if (process.env.NODE_ENV !== 'test') {
  if (!validateEncryption()) {
    console.error('Encryption validation failed! Check your ENCRYPTION_KEY environment variable.');
  } else {
    console.log('Encryption validation successful');
  }
}
