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

## Under consideration

### Hardened self-hosting (replacing public GH Pages + Firebase)

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
