/**
 * Text Sanitizer & RTSP URL Handler
 * - Sanitizes HTML using allowlist (preserves safe tags)
 * - Handles RTSP URLs safely (plain text display)
 * - Masks passwords in RTSP credential URLs
 */

import sanitize from 'sanitize-html';

// ==================== HTML Allowlist Config ====================

const SAFE_TAGS = [
  'p', 'br', 'hr',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'strong', 'em', 'u', 's', 'del', 'ins', 'mark',
  'code', 'pre', 'blockquote',
  'ul', 'ol', 'li',
  'a', 'img', 'span', 'div',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
  'sub', 'sup',
  'details', 'summary',
];

const SAFE_ATTRS = {
  a: ['href', 'title', 'target', 'rel'],
  img: ['src', 'alt', 'title', 'width', 'height'],
  span: ['class'],
  td: ['colspan', 'rowspan'],
  th: ['colspan', 'rowspan'],
  code: ['class'],
};

const SAFE_URL_SCHEMES = ['http', 'https', 'mailto'];

const sanitizeHtmlConfig = {
  allowedTags: SAFE_TAGS,
  allowedAttributes: SAFE_ATTRS,
  allowedSchemes: SAFE_URL_SCHEMES,
  allowedSchemesByTag: {},
  disallowedTagsMode: 'discard',
};

function sanitizeHtmlContent(input) {
  if (typeof input !== 'string') return '';
  return sanitize(input, sanitizeHtmlConfig);
}

// ==================== Core Sanitization ====================

function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
    '`': '&#96;',
  };
  return str.replace(/[&<>"'\/`]/g, (char) => map[char]);
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

  let result = sanitizeHtmlContent(withPlaceholders);

  for (const { original, placeholder } of rtspUrls) {
    const encodedUrl = processRtspUrl(original);
    const tag = `<code class="rtsp-url" data-original="${escapeHtml(original)}">${encodedUrl}</code>`;
    result = result.replace(placeholder, tag);
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

  let result = sanitizeHtmlContent(withPlaceholders);

  for (const { original, placeholder } of rtspUrls) {
    const masked = maskRtspPassword(original);
    result = result.replace(placeholder, masked);
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
  sanitizeHtmlContent,
  extractRtspUrls,
};
