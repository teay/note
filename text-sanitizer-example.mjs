import {
  escapeHtml,
  maskRtspPassword,
  sanitizeText,
  sanitizeForStorage,
  extractRtspUrls,
} from './text-sanitizer.mjs';

console.log('=== 1. HTML Escape ===');
console.log(escapeHtml('<script>alert("XSS")</script>'));
// Output: &lt;script&gt;alert(&quot;XSS&quot;)&lt;&#x2F;script&gt;

console.log('\n=== 2. Password Masking ===');
console.log(maskRtspPassword('rtsp://admin:MyS3cret@192.168.1.100:554/stream'));
// Output: rtsp://admin:****@192.168.1.100:554/stream

console.log('\n=== 3. Full Sanitization (Display) ===');
const userInput = 'ดูกล้องจาก <b>ลิงก์นี้</b> rtsp://admin:P@ssw0rd@10.0.0.1:554/live';
console.log(sanitizeText(userInput));
// Output: ดูกล้องจาก &lt;b&gt;ลิงก์นี้&lt;&#x2F;b&gt; <code class="rtsp-url">rtsp://admin:****@10.0.0.1:554/live</code>

console.log('\n=== 4. Sanitization for Storage ===');
const dbInput = 'rtsp://root:secret123@cam.local:8554/main rtsp://user:pass@192.168.0.5';
console.log(sanitizeForStorage(dbInput));
// Output: rtsp://root:****@cam.local:8554/main rtsp://user:****@192.168.0.5

console.log('\n=== 5. Extract RTSP URLs ===');
const text = 'Link1: rtsp://admin:pass@10.0.0.1:554/stream1, Link2: rtsp://viewer:1234@cam.local';
console.log(extractRtspUrls(text));
// Output: [
//   { original: 'rtsp://admin:pass@10.0.0.1:554/stream1', masked: 'rtsp://admin:****@10.0.0.1:554/stream1' },
//   { original: 'rtsp://viewer:1234@cam.local', masked: 'rtsp://viewer:****@cam.local' }
// ]

console.log('\n=== 6. Mixed Content ===');
const mixed = 'ข้อความธรรมดา + <img onerror=alert(1) src=x> + rtsp://hacker:evil@bad.com:554';
console.log(sanitizeText(mixed));
// onerror is neutralized because the whole tag is escaped, RTSP password masked

console.log('\n=== 7. Password with @ symbol ===');
console.log(maskRtspPassword('rtsp://admin:P@ssw0rd@192.168.1.100:554/stream'));
// Output: rtsp://admin:****@192.168.1.100:554/stream

console.log('\n=== 8. Complex password with special chars ===');
console.log(maskRtspPassword('rtsp://user:p@ss!#$word@10.0.0.1:8554/live'));
// Output: rtsp://user:****@10.0.0.1:8554/live
