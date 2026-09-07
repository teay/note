/**
 * Text Sanitizer & RTSP URL Handler
 * - Sanitizes HTML/XSS from user input
 * - Handles RTSP URLs safely (plain text display)
 * - Masks passwords in RTSP credential URLs
 */

// ==================== Core Sanitization ====================

const HTML_ENTITY_MAP = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#96;',
};

function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/[&<>"'\/`]/g, (char) => HTML_ENTITY_MAP[char]);
}

// ==================== RTSP URL Handling ====================

const RTSP_URL_REGEX = /rtsp:\/\/[^\s<>"'`]+/gi;

function maskRtspPassword(url) {
  const prefix = 'rtsp://';
  if (!url.toLowerCase().startsWith(prefix)) return url;

  const rest = url.slice(prefix.length);
  const lastAtIndex = rest.lastIndexOf('@');

  if (lastAtIndex === -1) return url;

  const credentials = rest.slice(0, lastAtIndex);
  const afterAt = rest.slice(lastAtIndex + 1);

  const colonIndex = credentials.indexOf(':');
  if (colonIndex === -1) return url;

  const username = credentials.slice(0, colonIndex);
  const hostPortPath = afterAt;

  return `${prefix}${username}:****@${hostPortPath}`;
}

function processRtspUrl(rawUrl) {
  const masked = maskRtspPassword(rawUrl);
  return escapeHtml(masked);
}

// ==================== Main Processing ====================

function sanitizeText(input) {
  if (typeof input !== 'string') return '';

  const rtspUrls = [];
  let placeholderIndex = 0;

  const withPlaceholders = input.replace(RTSP_URL_REGEX, (match) => {
    const placeholder = `__RTSP_PLACEHOLDER_${placeholderIndex++}__`;
    rtspUrls.push({ original: match, placeholder });
    return placeholder;
  });

  let result = escapeHtml(withPlaceholders);

  for (const { original, placeholder } of rtspUrls) {
    const escapedPlaceholder = escapeHtml(placeholder);
    const encodedUrl = processRtspUrl(original);
    const tag = `<code class="rtsp-url" data-original="${escapeHtml(original)}">${encodedUrl}</code>`;
    result = result.replace(escapedPlaceholder, tag);
  }

  return result;
}

function sanitizeForStorage(input) {
  if (typeof input !== 'string') return '';

  const rtspUrls = [];
  let placeholderIndex = 0;

  const withPlaceholders = input.replace(RTSP_URL_REGEX, (match) => {
    const placeholder = `__RTSP_PLACEHOLDER_${placeholderIndex++}__`;
    rtspUrls.push({ original: match, placeholder });
    return placeholder;
  });

  let result = escapeHtml(withPlaceholders);

  for (const { original, placeholder } of rtspUrls) {
    const escapedPlaceholder = escapeHtml(placeholder);
    const masked = maskRtspPassword(original);
    result = result.replace(escapedPlaceholder, masked);
  }

  return result;
}

function extractRtspUrls(text) {
  if (typeof text !== 'string') return [];

  const urls = [];
  let match;

  const regex = /rtsp:\/\/[^\s<>"'`]+/gi;
  while ((match = regex.exec(text)) !== null) {
    urls.push({
      original: match[0],
      masked: maskRtspPassword(match[0]),
    });
  }

  return urls;
}

export {
  escapeHtml,
  maskRtspPassword,
  processRtspUrl,
  sanitizeText,
  sanitizeForStorage,
  extractRtspUrls,
};
