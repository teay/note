# Apple Notes Clone (PWA + Firebase)

An independent, cloud-synced, web-based Apple Notes clone built as a Progressive Web App (PWA) for iPhone and Desktop. Powered by React, Vite, Tailwind CSS, Tiptap, and Firebase Firestore.

---

## Features

- **Real-time Cloud Sync:** Auto-saves notes to Google Cloud Firestore (1s debounce, forced save at least every 5s while typing).
- **Notepad-style Editing:** Tab / Shift+Tab indent and outdent anywhere (lists included), plain-text paste, and whitespace preserved as typed.
- **Save Status Indicator:** `Edited` → `Saving…` → `Saved` shown at the right of the toolbar, so you always know the app has your changes.
- **Independent from iCloud:** Works seamlessly on iOS, Android, macOS, Windows, and Linux via Google Authentication.
- **Rich Text Editing:** Built with Tiptap editor supporting Bold, Italic, Headings (H1/H2), Bullet Lists, and Blockquotes.
- **PWA Ready:** Supports "Add to Home Screen" on iOS Safari with native standalone app layout.
- **Minimalist UI:** Styled with Tailwind CSS inspired by Apple's minimalist design aesthetics.
- **Dark Mode:** Auto-detects system preference (Windows, iOS, Android, Linux) with manual toggle override.
- **XSS Protection:** HTML sanitization using `sanitize-html` with allowlist approach.
- **Copy Modes:** Copy notes as Plain Text, HTML (with formatting), or Markdown.
- **Full-text Search:** Sidebar search matches the entire note text (case-insensitive substring), with the match highlighted in the list.
- **Export Backup:** Download all notes as a single `.md` file from the sidebar.
- **Undo Delete:** Deleted a note by mistake? An Undo snackbar restores it with the same id (5 seconds); any not-yet-saved edit is discarded so the note cannot resurrect.
- **Pin Notes:** Pin important notes — they group under a "Pinned" header with a high-contrast pin badge.

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
  "pinned": "boolean (optional — pinned notes sort first)",
  "createdAt": "Timestamp",
  "updatedAt": "Timestamp"
}
```

---

## Development

```bash
npm install       # install dependencies
npm run dev       # dev server → http://localhost:5173/note/
npm run build     # production build → dist/
npm run preview   # serve the production build locally
```

---

## Deployment (GitHub Pages)

`vite.config.js` sets `base: '/note/'` for the project page at **https://teay.github.io/note/**. Pushing to `main` does **not** publish by itself — build and push the `gh-pages` branch with:

```bash
npm run deploy    # runs `npm run build`, then publishes dist/ to gh-pages
```

Pages builds the branch automatically (~30s). Note that `main` and the live site can differ until you run this.

---

## Project Structure

```
note/
├── src/                      # React app source
│   ├── components/           # Navbar, Sidebar, Editor
│   ├── editor/               # notepadEditing.js (Tab/Shift+Tab keys, plain-text paste)
│   ├── utils/                # text.js (html → plain text helpers)
│   └── firebase.js           # Firebase config
├── text-sanitizer.mjs        # HTML sanitization library
├── vite.config.js
├── .gitignore
└── package.json
```
