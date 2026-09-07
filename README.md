# 📝 Apple Notes Clone (PWA + Firebase)

An independent, cloud-synced, web-based Apple Notes clone built as a Progressive Web App (PWA) for iPhone and Desktop. Powered by React, Vite, Tailwind CSS, Tiptap, and Firebase Firestore.

---

## ✨ Features

- **⚡ Real-time Cloud Sync:** Auto-saves notes instantly to Google Cloud Firestore (Region: `asia-southeast3` - Bangkok).
- **🔒 Independent from iCloud:** Works seamlessly on iOS, Android, macOS, Windows, and Linux via Google Authentication.
- **✍️ Rich Text Editing:** Built with Tiptap editor supporting Bold, Italic, Headings (H1), and Bullet Lists.
- **📱 PWA Ready:** Supports "Add to Home Screen" on iOS Safari with native standalone app layout.
- **🎨 Minimalist UI:** Styled with Tailwind CSS inspired by Apple's minimalist design aesthetics.
- **🛡️ XSS Protection:** HTML sanitization using `sanitize-html` with allowlist approach.

---

## 🛠️ Tech Stack

- **Frontend:** React, Vite, Tailwind CSS
- **Rich Text Editor:** Tiptap (`@tiptap/react`, `@tiptap/starter-kit`)
- **Backend & Auth:** Firebase (Authentication with Google OAuth, Cloud Firestore Database)
- **Deployment & Hosting:** Firebase Hosting / Vercel

---

## 📂 Data Structure (Firestore)

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

## 🛡️ Security: Text Sanitization

### Problem

User input may contain:
- XSS attacks (`<script>`, `onerror=`, `javascript:` URLs)
- RTSP URLs with exposed passwords (`rtsp://user:password@host`)
- Dangerous HTML tags

### Solution: `text-sanitizer.mjs`

Uses `sanitize-html` with an **allowlist approach** - preserves safe HTML tags while stripping dangerous ones.

#### Allowed Tags
`p`, `h1-6`, `strong`, `em`, `code`, `pre`, `blockquote`, `ul`, `ol`, `li`, `a`, `img`, `span`, `div`, `table`, `tr`, `td`, `br`, `hr`

#### Blocked
- `<script>`, `<iframe>`, `<object>`, `<embed>`
- Event handlers (`onerror=`, `onclick=`, etc.)
- `javascript:` URLs

#### Functions

```javascript
import { sanitizeForStorage, sanitizeText, maskRtspPassword } from './text-sanitizer.mjs';

// For database storage - preserves safe HTML, strips dangerous content
sanitizeForStorage('<p>Hello</p><script>alert("xss")</script>');
// → '<p>Hello</p>'

// For display - sanitizes + wraps RTSP URLs in <code> tags
sanitizeText('rtsp://admin:pass@10.0.0.1:554/live');
// → '<code class="rtsp-url">rtsp://admin:****@10.0.0.1:554/live</code>'

// Mask password in RTSP URL
maskRtspPassword('rtsp://admin:MyS3cret@192.168.1.100:554/stream');
// → 'rtsp://admin:****@192.168.1.100:554/stream'
```

---

## 🔧 Migration Scripts

For cleaning up existing data in Firestore. Scripts are kept in repo but `firebase-admin` is not installed by default.

### Setup (when needed)

```bash
# 1. Install firebase-admin
npm install firebase-admin --save-dev

# 2. Generate Service Account Key
#    Firebase Console → Settings → Service Accounts → Generate new private key
#    Save as serviceAccountKey.json (already in .gitignore)

# 3. Run scripts
node dry-run-audit.mjs      # Audit only (read-only)
node migrate-data.mjs       # Actual migration
node backup-data.mjs        # Backup data to JSON
```

### Available Scripts

| Script | Description |
|---|---|
| `dry-run-audit.mjs` | Scan Firestore and preview what would change (read-only) |
| `migrate-data.mjs` | Sanitize all documents in `notes` collection |
| `backup-data.mjs` | Export all documents to JSON backup file |

### Dry-Run Example

```bash
$ node dry-run-audit.mjs

🔍 Firebase Firestore - Dry-Run Audit
   Mode: READ-ONLY

📂 Scanning collection: notes

📊 AUDIT SUMMARY
   Total documents scanned:        8
   Would be changed:               2
   Unchanged (already clean):       6

   🔴 XSS Script tags:             0
   🟠 XSS Event handlers:          1
   🟠 RTSP with password:           1
```

---

## 📁 Project Structure

```
note/
├── src/                    # React app source
├── text-sanitizer.mjs      # HTML sanitization library
├── text-sanitizer-example.mjs  # Usage examples
├── dry-run-audit.mjs       # Firestore audit script
├── migrate-data.mjs        # Firestore migration script
├── backup-data.mjs         # Firestore backup script
├── .gitignore              # Ignores serviceAccountKey.json, backups
└── package.json
```

---

## ⚠️ Important Notes

- **`serviceAccountKey.json`** is in `.gitignore` - never commit it
- **Backup files** (`backup-notes-*.json`) are in `.gitignore`
- **Firebase Admin SDK** is not installed by default - install when needed for migration scripts
- Always run `dry-run-audit.mjs` before `migrate-data.mjs`