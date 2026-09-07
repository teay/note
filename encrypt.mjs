/**
 * AES-256-GCM Encryption Module
 * ใช้เข้ารหัส RTSP URLs ก่อนเก็บลง Firestore
 */

import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;

function getKeyFromEnv() {
  const keyEnv = process.env.RTSP_ENCRYPTION_KEY;
  if (!keyEnv) {
    console.error('❌ RTSP_ENCRYPTION_KEY not set in environment');
    process.exit(1);
  }
  return scryptSync(keyEnv, 'notes-firebase-salt', KEY_LENGTH);
}

function encrypt(plaintext) {
  const key = getKeyFromEnv();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();

  const payload = {
    iv: iv.toString('hex'),
    tag: authTag.toString('hex'),
    data: encrypted,
  };

  return 'ENC:' + Buffer.from(JSON.stringify(payload)).toString('base64');
}

function decrypt(ciphertext) {
  if (!ciphertext.startsWith('ENC:')) {
    return ciphertext;
  }

  const key = getKeyFromEnv();
  const payloadStr = Buffer.from(ciphertext.slice(4), 'base64').toString('utf8');
  const payload = JSON.parse(payloadStr);

  const iv = Buffer.from(payload.iv, 'hex');
  const authTag = Buffer.from(payload.tag, 'hex');
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(payload.data, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

function isEncrypted(text) {
  return typeof text === 'string' && text.startsWith('ENC:');
}

export { encrypt, decrypt, isEncrypted };
