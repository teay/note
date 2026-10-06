# TODO

## Principles: keep it simple

The goal is the simplest app that does the job — no unnecessary features.
Before adding **any** feature, it must pass all three questions (fails one = not yet):

1. Does it fix a **real pain** we actually hit, or is it just "nice to have"?
2. If removed, does the app still work completely?
3. How much maintenance does it add? (little code but breaks often = expensive)

## Done

- [x] **Search matched only the truncated preview (50 chars) / title (40 chars)** —
      now searches the full note text via a cached `searchText`
      (`src/components/Sidebar.jsx`).
- [x] **Export all notes** — sidebar download button → single `.md` file
      (`notes-YYYY-MM-DD.md`), shared `htmlToPlainText` in `src/utils/text.js`.
- [x] **Undo delete** — delete now shows a 5s "Note deleted / Undo" snackbar;
      undo restores the doc with the same id (`setDoc`), pending edits for the
      deleted note are dropped first.
- [x] **Pin notes** — `pinned` field toggled from the navbar Pin button; pinned
      notes sort first everywhere; pin icon shown in the sidebar.
- [x] **Highlight search match** — `<mark>` on matches in title/preview, and the
      preview window shifts to show the match (not just the first 50 chars).

## Under consideration

### Hardened self-hosting (replacing public GH Pages + Firebase)

Full write-up: [`self-hosting.md`](self-hosting.md)

Public web = hard to secure (bots, exposed auth, cloud data). Idea only, not
decided:

- Run as a **compiled single binary** on a tiny Linux / **distroless** image
  (no shell, minimal attack surface), data in local SQLite — no cloud.
- Listen on **127.0.0.1 only**; reach it via **SSH tunnel**
  (`ssh -L`) — no public HTTP at all.
- Trade-offs: self-maintained (updates/backup/uptime), **bad UX on iPhone**
  (needs an SSH app first), no cross-device sync.
- Likely better balance: **WireGuard/Tailscale** instead of SSH tunnel —
  same zero-trust reachability, but Safari can open it directly on mobile.

- [ ] Decide if the security gain is worth losing GH Pages/Firebase simplicity

#### Plan (steps, not started)

- [ ] 1. เตรียม VPS เล็กสุด + SSH key-only login (ปิด password, optional fail2ban)
- [ ] 2. Backend ตัวเล็ก (Go หรือ Node+Express): serve build แอป React เดิม + CRUD โน้ต → SQLite
       (ขั้นหลัก — ย้ายข้อมูลออกจาก Firebase)
- [ ] 3. Dockerfile multi-stage → วาง binary + static files ลง distroless image
- [ ] 4. รันเฉพาะ localhost: `docker run -p 127.0.0.1:8080:8080 ...` (ไม่เปิดพอร์ตสาธารณะ)
- [ ] 5. ทดสอบผ่าน `ssh -L 8080:localhost:8080 u@server` → เปิด localhost:8080
- [ ] 6. Backup script: copy notes.db ออกเป็นระยะ
- [ ] 7. ตัดสินใจ UX มือถือ: อยู่กับ SSH tunnel หรือเปลี่ยนเป็น Tailscale

### Feature ideas (small, all pass the rules above)

Suggested order — pick one to do first:

- [x] **1. Export all notes** — download every note as `.md`/`.json`.
      Pain: data locked in one Firebase account; if lost, everything is gone.
      Zero maintenance (pure client-side).
- [x] **2. Undo delete** — currently `deleteDoc` fires immediately; a wrong tap
      = gone forever. Simple: soft-delete + "Undo" snackbar (or short trash).
- [x] **3. Pin notes** — keep frequently used notes (checklists) at the top.
      Tiny: one field + button + sort.
- [x] **4. Highlight search match in preview** — search now covers full text
      (`Done` above) but the list doesn't show *where* the match is.
- [ ] **5. Character/word count** — tiny info line in the editor.

Not now (fails rule 2 or 3): tags/folders, version history, note locking.

### Search memory ceiling

Full-text search runs client-side over all notes held in memory (no pagination),
plus a cached `searchText` copy — so RAM is the practical limit (~2x total note
text). Fine for hundreds of KB-level notes; revisit with pagination/lazy load
only if users hit lag on low-RAM phones (that change would also affect Firestore
read costs).

### Sanitize pasted HTML (`transformPastedHTML`)

Paste currently goes straight into the TipTap parser; sanitization only runs on
save to Firestore, so untrusted HTML from the web executes handlers (e.g.
`<img onerror>`) *at paste time*. It would also strip Google Docs HTML noise.

- [ ] Decide whether it is worth doing (risk vs. benefit)
- [ ] If yes, use a **separate config** for paste: add `allowedStyles`
      (`font-weight`, `font-style`, `text-decoration`) — reusing the storage
      allowlist as-is would **break bold/italic/strike pasted from Google Docs**
      (Docs conveys formatting via `style=` attributes, not `<b>` tags)
- [ ] Strip `img`/`srcset` in the paste config (schema has no image node; avoids
      loading remote images during paste)
- [ ] Consider reusing the same config for `handleCopyNoteHtml` output (already
      clean, idempotent)

### Housekeeping

- [ ] Decide on sanitize-html console warnings at load
      (`path.resolve`, `source-map-js`, ...) — cosmetic only; options were
      `parseStyleAttributes: false` (drops all styles → see paste config note
      above) or rewriting `text-sanitizer.mjs` with `DOMParser` (also shrinks
      the 1.17 MB bundle)

## Candidates to cut (fails the rules above)

- [ ] **Copy Markdown** — regex-based, breaks on nested/multi-line HTML; nobody asked for it
- [ ] **Copy HTML** — duplicate of Cmd+C inside the editor (ProseMirror already puts HTML on the clipboard)
- [ ] **`design.md`** — unrelated fintech dashboard spec left over from another project
