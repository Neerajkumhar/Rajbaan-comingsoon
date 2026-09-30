# Rajbaan — Coming Soon

Single-page site for the Rajbaan spices and dry-fruits brand. Static build, no backend.

Made by [Visuark](https://visuark.com) with love.

## Commands

```bash
npm install
npm run dev      # local dev server
npm test         # vitest, single run
npm run lint     # eslint
npm run build    # static output into dist/
```

## Deploying

`npm run build` produces a fully static `dist/`. Upload it to Netlify, Vercel, GitHub
Pages, or any web host. No server, no environment variables, no configuration.

## Before you publish — three things to change

1. **The domain.** In `index.html`, replace all three occurrences of
   `https://example.invalid/rajbaan` with your real domain: the `rel="canonical"`
   link, `og:url`, and `og:image`.
2. **The logo.** Replace `logo rajbaan.png` at the repo root, then run
   `python3 scripts/prepare-logo.py` to derive `public/logo.png` and
   `public/favicon.png`. The script keys the master's background out to transparency,
   crops to the ink's bounding box, and scales to 1200 px wide — so the mark ships with
   no padding of its own and the hero card supplies the margin. If you drop in your own
   files instead, keep `logo.png` transparent and update the `width`/`height`
   attributes in `src/components/Hero.jsx` to match its real dimensions, or the page
   will reserve the wrong box and shift on load.
3. **The phone number.** `src/contact.js` holds it in exactly one place,
   `PHONE_DIGITS`. Change it there and the visible text, the WhatsApp link, and the
   `tel:` link all follow.

## Language

`src/content.js` holds every string in English and Hindi. Adding or renaming a key
requires updating both locales — `src/test/content.test.js` fails the build otherwise.

## Design

Full rationale, palette, and layout decisions:
`docs/superpowers/specs/2026-09-26-rajbaan-coming-soon-design.md`

## Licence

Proprietary — © 2026 Visuark, all rights reserved. No permission is granted to reuse
this code or its contents without written permission. See `LICENSE`.
