/**
 * Text Sanitizer
 * - Sanitizes HTML using allowlist (preserves safe tags)
 * - Strips dangerous tags: <script>, <iframe>, event handlers
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

// ==================== Main Function ====================

function sanitizeForStorage(input) {
  if (typeof input !== 'string') return '';
  return sanitize(input, sanitizeHtmlConfig);
}

export { sanitizeForStorage };
