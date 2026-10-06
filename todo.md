# TODO

## Under consideration

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
