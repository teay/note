# Security Audit - Apple Notes Clone

## Overview

This document summarizes the security analysis of the webapp (PWA + Firebase) to confirm it is production-ready.

---

## Security Layers

### 1. Authentication (Google OAuth)

- Users must login with Google Account to access the app
- Firebase Auth issues a unique UID for each user
- No username/password stored in the app

```
User → Google OAuth → UID → Access only own data
```

### 2. Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /notes/{noteId} {
      allow read: if request.auth != null
        && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null
        && request.resource.data.userId == request.auth.uid;
      allow update: if request.auth != null
        && resource.data.userId == request.auth.uid;
      allow delete: if request.auth != null
        && resource.data.userId == request.auth.uid;
    }
  }
}
```

**4 rules (read/create/update/delete)** - all require:
1. `request.auth != null` → Must be logged in
2. `resource.data.userId == request.auth.uid` → UID must match owner

### 3. XSS Protection (sanitize-html)

- All content is sanitized before saving to Firestore
- Strips `<script>`, `<iframe>`, event handlers (`onerror=`, `onclick=`)
- Blocks `javascript:` URLs
- Uses allowlist approach - only safe tags preserved

```javascript
import { sanitizeForStorage } from './text-sanitizer.mjs';
const safe = sanitizeForStorage(userInput);
```

### 4. Data Query Filtering

```javascript
where('userId', '==', user.uid)
```

- Query only returns notes belonging to the logged-in user
- Never fetches other users' data

---

## Attack Scenarios

| Scenario | Result | Reason |
|---|---|---|
| Hacker knows projectId | Cannot access | Must authenticate first |
| Hacker knows API key | Cannot access | API key is not credentials |
| Hacker knows another user's UID | Cannot access | Must login as that user |
| Hacker injects `<script>` | Stripped out | Sanitized before storage |
| Unauthenticated request | Denied | Firestore Rules block it |

---

## Conclusion

**The webapp is secure enough for production use.**

Key protections:
- Google OAuth authentication
- Firestore Security Rules (UID-based access control)
- XSS sanitization on all content
- Data query filtering by UID

Unauthorized users **cannot** access any notes data.
