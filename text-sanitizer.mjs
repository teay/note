/**
 * Text Sanitizer & RTSP URL Handler
 * - Sanitizes HTML using allowlist (preserves safe tags)
 * - Encrypts RTSP URLs before storage
 * - Decrypts and masks passwords for display
 */

import sanitize from 'sanitize-html';
import { encrypt, decrypt, isEncrypted } from './encrypt.mjs';

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
const RTSP_CREDENTIAL_REGEX = /^rtsp:\/\/([^:]+):([^@]+)@(.+)$/i;
const ENCRYPTED_REGEX = /ENC:[A-Za-z0-9+/=]+/g;

function hasPassword(url) {
  return RTSP_CREDENTIAL_REGEX.test(url);
}

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

// ==================== Main Processing ====================

function sanitizeText(input) {
  if (typeof input !== 'string') return '';

  const tokens = [];
  let tokenIndex = 0;

  const withPlaceholders = input.replace(ENCRYPTED_REGEX, (match) => {
    const placeholder = `__RTSP_${tokenIndex++}__`;
    tokens.push({ raw: match, placeholder });
    return placeholder;
  }).replace(RTSP_URL_REGEX, (match) => {
    const placeholder = `__RTSP_${tokenIndex++}__`;
    tokens.push({ raw: match, placeholder });
    return placeholder;
  });

  let result = sanitizeHtmlContent(withPlaceholders);

  for (const { raw, placeholder } of tokens) {
    let displayUrl;

    if (isEncrypted(raw)) {
      try {
        const decrypted = decrypt(raw);
        displayUrl = maskRtspPassword(decrypted);
      } catch {
        displayUrl = '[encrypted]';
      }
    } else if (hasPassword(raw)) {
      displayUrl = maskRtspPassword(raw);
    } else {
      displayUrl = raw;
    }

    const encodedUrl = escapeHtml(displayUrl);
    const originalAttr = escapeHtml(isEncrypted(raw) ? '' : raw);
    const tag = `<code class="rtsp-url"${originalAttr ? ` data-original="${originalAttr}"` : ''}>${encodedUrl}</code>`;
    result = result.replace(placeholder, tag);
  }

  return result;
}

function sanitizeForStorage(input) {
  if (typeof input !== 'string') return '';

  const tokens = [];
  let tokenIndex = 0;

  const withPlaceholders = input.replace(RTSP_URL_REGEX, (match) => {
    const placeholder = `__RTSP_${tokenIndex++}__`;
    tokens.push({ raw: match, placeholder });
    return placeholder;
  });

  let result = sanitizeHtmlContent(withPlaceholders);

  for (const { raw, placeholder } of tokens) {
    if (isEncrypted(raw)) {
      result = result.replace(placeholder, raw);
    } else if (hasPassword(raw)) {
      result = result.replace(placeholder, encrypt(raw));
    } else {
      result = result.replace(placeholder, raw);
    }
  }

  return result;
}

function extractRtspUrls(text) {
  if (typeof text !== 'string') return [];

  const urls = [];

  const encryptedRegex = /ENC:[A-Za-z0-9+/=]+/g;
  let match;

  while ((match = encryptedRegex.exec(text)) !== null) {
    const raw = match[0];
    let decrypted = raw;

    if (isEncrypted(raw)) {
      try {
        decrypted = decrypt(raw);
      } catch {
        decrypted = '[encrypted]';
      }
    }

    urls.push({
      original: raw,
      decrypted,
      masked: maskRtspPassword(decrypted),
    });
  }

  const plainRegex = /rtsp:\/\/[^\s<>"'`]+/gi;
  while ((match = plainRegex.exec(text)) !== null) {
    const raw = match[0];
    urls.push({
      original: raw,
      decrypted: raw,
      masked: maskRtspPassword(raw),
    });
  }

  return urls;
}

export {
  escapeHtml,
  maskRtspPassword,
  hasPassword,
  sanitizeText,
  sanitizeForStorage,
  sanitizeHtmlContent,
  extractRtspUrls,
};
