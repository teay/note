# 📝 Apple Notes Clone (PWA + Firebase)

An independent, cloud-synced, web-based Apple Notes clone built as a Progressive Web App (PWA) for iPhone and Desktop. Powered by React, Vite, Tailwind CSS, Tiptap, and Firebase Firestore.

---

## ✨ Features

- **⚡ Real-time Cloud Sync:** Auto-saves notes instantly to Google Cloud Firestore (Region: `asia-southeast3` - Bangkok).
- **🔒 Independent from iCloud:** Works seamlessly on iOS, Android, macOS, Windows, and Linux via Google Authentication.
- **✍️ Rich Text Editing:** Built with Tiptap editor supporting Bold, Italic, Headings (H1), and Bullet Lists.
- **📱 PWA Ready:** Supports "Add to Home Screen" on iOS Safari with native standalone app layout.
- **🎨 Minimalist UI:** Styled with Tailwind CSS inspired by Apple's minimalist design aesthetics.

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