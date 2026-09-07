# Apple Notes Clone (PWA + Firebase)

An independent, cloud-synced, web-based Apple Notes clone built as a Progressive Web App (PWA) for iPhone and Desktop. Powered by React, Vite, Tailwind CSS, Tiptap, and Firebase Firestore.

---

## Features

- **Real-time Cloud Sync:** Auto-saves notes instantly to Google Cloud Firestore.
- **Independent from iCloud:** Works seamlessly on iOS, Android, macOS, Windows, and Linux via Google Authentication.
- **Rich Text Editing:** Built with Tiptap editor supporting Bold, Italic, Headings (H1/H2), Bullet Lists, and Blockquotes.
- **PWA Ready:** Supports "Add to Home Screen" on iOS Safari with native standalone app layout.
- **Minimalist UI:** Styled with Tailwind CSS inspired by Apple's minimalist design aesthetics.
- **Dark Mode:** Auto-detects system preference (Windows, iOS, Android, Linux) with manual toggle override.
- **XSS Protection:** HTML sanitization using `sanitize-html` with allowlist approach.
- **Copy Modes:** Copy notes as Plain Text, HTML (with formatting), or Markdown.

---

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS
- **Rich Text Editor:** Tiptap (`@tiptap/react`, `@tiptap/starter-kit`)
- **Backend & Auth:** Firebase (Authentication with Google OAuth, Cloud Firestore Database)

---

## Security: Text Sanitization

### Problem

User input may contain:
- XSS attacks (`<script>`, `onerror=`, `javascript:` URLs)
- Dangerous HTML tags

### Solution: `text-sanitizer.mjs`

Uses `sanitize-html` with an **allowlist approach** - preserves safe HTML tags while stripping dangerous ones.

#### Allowed Tags
`p`, `h1-6`, `strong`, `em`, `u`, `s`, `code`, `pre`, `blockquote`, `ul`, `ol`, `li`, `a`, `img`, `span`, `div`, `table`, `tr`, `td`, `br`, `hr`

#### Blocked
- `<script>`, `<iframe>`, `<object>`, `<embed>`
- Event handlers (`onerror=`, `onclick=`, etc.)
- `javascript:` URLs

#### Usage

```javascript
import { sanitizeForStorage } from './text-sanitizer.mjs';

// Sanitize HTML before saving to Firestore
const safe = sanitizeForStorage('<p>Hello</p><script>alert("xss")</script>');
// → '<p>Hello</p>'
```

---

## Data Structure (Firestore)

Notes are stored in the `notes` collection with the following schema:

```json
{
  "userId": "string (Google UID)",
  "title": "string (Extracted from 1st line)",
  "content": "string (HTML from Tiptap editor)",
  "createdAt": "Timestamp",
  "updatedAt": "Timestamp"
}
```

---

## Project Structure

```
note/
├── src/                    # React app source
├── text-sanitizer.mjs      # HTML sanitization library
├── .gitignore
└── package.json
```
