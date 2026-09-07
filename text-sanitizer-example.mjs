import {
  escapeHtml,
  maskRtspPassword,
  sanitizeText,
  sanitizeForStorage,
  extractRtspUrls,
} from './text-sanitizer.mjs';
import { encrypt, decrypt, isEncrypted } from './encrypt.mjs';

process.env.RTSP_ENCRYPTION_KEY = 'my-secret-test-key-12345678';

console.log('=== 1. HTML Escape ===');
console.log(escapeHtml('<script>alert("XSS")</script>'));

console.log('\n=== 2. Password Masking (Display) ===');
console.log(maskRtspPassword('rtsp://admin:MyS3cret@192.168.1.100:554/stream'));

console.log('\n=== 3. Encrypt / Decrypt ===');
const url = 'rtsp://admin:P@ssw0rd@10.0.0.1:554/live';
const encrypted = encrypt(url);
const decrypted = decrypt(encrypted);
console.log('Original:  ' + url);
console.log('Encrypted: ' + encrypted.substring(0, 60) + '...');
console.log('Decrypted: ' + decrypted);
console.log('Match:     ' + (url === decrypted));

console.log('\n=== 4. sanitizeForStorage (Encrypt RTSP) ===');
const input = 'ดูกล้องจาก <b>ลิงก์นี้</b> rtsp://admin:P@ssw0rd@10.0.0.1:554/live';
const stored = sanitizeForStorage(input);
console.log('Input:   ' + input);
console.log('Stored:  ' + stored);

console.log('\n=== 5. sanitizeText (Display) ===');
console.log('Output:  ' + sanitizeText(stored));

console.log('\n=== 6. Mixed Content ===');
const mixed = 'ข้อความธรรมดา + <img onerror=alert(1) src=x> + rtsp://hacker:evil@bad.com:554';
const storedMixed = sanitizeForStorage(mixed);
console.log('Stored:  ' + storedMixed);
console.log('Display: ' + sanitizeText(storedMixed));

console.log('\n=== 7. extractRtspUrls ===');
console.log(extractRtspUrls(stored));
