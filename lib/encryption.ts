import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16; // 128 bits
const TAG_LENGTH = 16; // 128 bits

function getEncryptionKey(): Buffer {
  const keyFromEnv = process.env.ENCRYPTION_KEY;
  
  if (keyFromEnv) {
    // Use provided key from environment
    return Buffer.from(keyFromEnv, 'hex');
  }
  
  // Generate a new key (for development only)
  // In production, this should be a persistent key stored securely
  console.warn('WARNING: No ENCRYPTION_KEY found in environment. Using generated key (not recommended for production)');
  return crypto.randomBytes(KEY_LENGTH);
}

const encryptionKey = getEncryptionKey();

export interface EncryptedData {
  encrypted: string;
  iv: string;
  tag: string;
}

/**
 * Encrypts a string using AES-256-GCM
 * @param text The plaintext to encrypt
 * @returns Encrypted data with IV and authentication tag
 */
export function encrypt(text: string): EncryptedData {
  try {
    // Generate a random IV for each encryption
    const iv = crypto.randomBytes(IV_LENGTH);
    // Create cipher
    const cipher = crypto.createCipheriv(ALGORITHM, encryptionKey, iv);
    // Encrypt the text
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    // Get the authentication tag
    const tag = cipher.getAuthTag();
    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex'),
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
    const { encrypted, iv, tag } = encryptedData;
    // Convert hex strings back to buffers
    const ivBuffer = Buffer.from(iv, 'hex');
    const tagBuffer = Buffer.from(tag, 'hex');
    // Create decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, encryptionKey, ivBuffer);
    decipher.setAuthTag(tagBuffer);
    // Decrypt the data
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
    const encryptedData: EncryptedData = JSON.parse(encryptedSecret);
    return decrypt(encryptedData);
  } catch (error) {
    console.error('Secret decryption error:', error);
    throw new Error('Failed to decrypt secret');
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
if (!validateEncryption()) {
  console.error('Encryption validation failed! Check your ENCRYPTION_KEY environment variable.');
} else {
  console.log('Encryption validation successful');
}
