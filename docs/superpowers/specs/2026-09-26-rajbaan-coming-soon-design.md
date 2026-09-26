# Rajbaan — "Coming Soon" Page Design

- **Date:** 2026-09-26
- **Status:** Approved in chat, pending written review
- **Brand:** Rajbaan (राजबान) — spices & dry fruits
- **Contact:** 9216487878 (WhatsApp + call)

## 1. Purpose

Rajbaan is not selling yet. This project is a single-page React site whose only job is to
tell visitors the store is imminent and convert that interest into a WhatsApp or phone
enquiry. There is no catalogue, no cart, no checkout, no accounts, and no launch date.

### Success criteria

A visitor who lands on the page can, without scrolling past the fold on a phone, learn
what the brand sells and start a WhatsApp conversation. Secondary success: the page
looks finished enough that the brand owner is not embarrassed to share the link.

### Explicit non-goals

- No product listing, pricing, cart, or payment.
- No launch date or countdown timer. A stale date on a live page is worse than no date.
- No email signup, analytics, cookie banner, or backend of any kind.
- No client-side router. One page, no navigation.
- No stock photography. The page is built from typography, colour, and inline SVG.

## 2. Constraints

- **Asset:** the only brand asset available is `logo rajbaan.png` (1774×887, black on
  white, fully opaque, 549 KB).
- **No image review:** the implementing agent cannot see images. The logo's internal
  composition, whether it contains a baked-in tagline, and its optical balance are
  unknown. Visual decisions about the logo must be confirmed by a human looking at a
  rendered page.
- **Hosting:** the page must build to plain static files so it can be dropped on Netlify,
  Vercel, GitHub Pages, or any cPanel host with no platform-specific config.

## 3. Design direction

**Concept: "King of Kings."** The name implies grandeur, so the page is premium-warm
rather than loud or discount-driven. Visual vocabulary: dark ink and maroon base,
marigold gold accents, cream paper tones, hand-drawn gold line-art, and a Devanagari
ticker band as the primary "Indian" signal. Mobile-first throughout.

### Palette

The logo carries no colour (pure black on white), so the palette is derived from the
product category.

| Token           | Hex       | Use                                  |
| --------------- | --------- | ------------------------------------ |
| `ink`       | `#1A1512` | Body text, dark sections              |
| `maroon`    | `#7B1E1E` | Enquiry band, marquee band            |
| `marigold`  | `#E8A33D` | Primary accent, rules, icon strokes   |
| `turmeric`  | `#F4B942` | Badge, hover states, highlight text   |
| `cashew`    | `#F7F1E6` | Page background                       |
| `parchment` | `#EFE3CE` | Card fills on the cream background    |

Six tokens. No green in the palette — WhatsApp green appears only inside the WhatsApp
buttons and the FAB, as a brand colour of the third-party service, never as a page
accent. That contrast is intentional: it makes the two WhatsApp CTAs the only green
elements on the page, so the eye finds them first.

Contrast: all body text pairs `ink` on `cashew` (≥ 12:1) or `cashew` on `maroon`
(≥ 7:1). Gold is never used for body text on cream — `marigold` on `cashew` fails
contrast and is restricted to large display type, rules, and icons.

### Typography

Two families, each covering **both** Latin and Devanagari so no word ever falls back
mid-string when the language toggles:

- **Display** — Noto Serif Devanagari, weights 400 and 600. Brand name, headings,
  tagline, marquee.
- **Body** — Noto Sans Devanagari, weights 400, 500, 600.

Loaded from the Google Fonts CDN with `preconnect` hints. Self-hosting via Fontsource is
an acceptable swap that changes nothing else.

## 4. Page structure

Ordered top to bottom. Each is an independent React component.

### 4.1 TopBar
Slim strip in `ink`. Left: a brand signature that changes with the language —
`शुद्ध मसाले • शुद्ध साबुत` in `hi`, `Pure Spices • Whole & Hand-picked` in `en`.
Right: a language toggle showing `EN | हिं` with the active option highlighted. Sticky
at the top on scroll so the toggle is always reachable.

### 4.2 Hero
The primary section. Vertically centred, `cashew` background with a soft radial
marigold wash behind the logo card.

- **Logo card:** `public/logo.png` inside a white rounded panel with at least 32 px of
  internal padding, a one-pixel marigold hairline border, and a soft shadow. The logo is
  black-on-white and is never recoloured, so this light panel is mandatory — the mark
  must not sit directly on the cream page or on any dark section. Maximum rendered
  width 420 px, aspect ratio preserved, `object-contain` so the full mark is always
  visible.
- **Wordmark:** a bilingual lockup, always both scripts regardless of active language —
  `राजबान` in Devanagari display type, with `RAJBAAN` in letterspaced uppercase Latin
  beneath it. A brand lockup is not UI copy, so it does not change with the toggle.
- **Tagline:** `Asli masale. Asli Swaad.` / `असली मसाला। असली स्वाद ।`
- **Coming Soon badge:** pill in `marigold`, slow opacity pulse. Static text — no date,
  no timer.
- **Primary CTA:** "WhatsApp us" → WhatsApp deep link with a prefilled message
  (exact text in 7.3).
- **Secondary CTA:** "Call 9216487878" → `tel:` link, with the digits pulled from
  `contact.js` rather than typed into the label.

Both CTAs must be usable at 360 px width without wrapping or clipping, and the
44×44 px minimum touch target applies to both.

### 4.3 Marquee
Full-bleed `maroon` band, ~48 px tall, gold text scrolling right-to-left:
`हल्दी · मसाले · काजू · खजू · बादाम · अंजीर · इलायची · दालचीनी · सौंफ`
(haldi · masale · cashew · dates · almond · fig · cardamom · cinnamon · fennel).
The sequence is duplicated once for a seamless loop and the whole band is
`aria-hidden`, because the same items appear in the Categories section below.

### 4.4 Categories
Three cards in a responsive grid (stacked on mobile, three-up from `md`). Each card has
a `parchment` fill, a gold line-art SVG motif, a `title`, and a `subtitle`. The
subtitle is the *other* script from the title, so the pair always reads bilingually
whichever language is active: in `en` mode the subtitle is Devanagari, in `hi` mode it
is the English transliterated word.

1. `Whole Spices` / `साबुत मसाले` — star anise motif
2. `Ground Masala` / `पिसा हुआ मसाला` — chilli and masala dabba motif
3. `Premium Dry Fruits` / `प्रीमियम सूखा मेवा` — cashew motif

Motifs are hand-authored inline SVG using `currentColor` at low stroke weight, so they
inherit the card's colour and add no asset weight.

### 4.5 Trust
Four short trust points with small gold icons, each a dictionary entry: 100% pure, no
adulteration, hand-picked, packed fresh. Two-up on mobile, four-up from `sm`.

### 4.6 Enquiry
Full-width `maroon` band, the page's conversion centre. A Hinglish headline in Latin
when `en` is active and the Devanagari equivalent when `hi` is active, the number
rendered large from `contact.js`, and the shared `ContactButtons` pair. Repeating the
CTA here is deliberate: a visitor who scrolled past the hero without clicking gets a
second, lower-commitment chance.

### 4.7 Footer
`ink` background. `© 2026 Rajbaan`, `Made in India`, a one-line descriptor from the
dictionary, and the text wordmark. **No logo image** — per 7.4 the mark is never
recoloured, and the only variant that exists is black-on-white, which would be
invisible on `ink`.

### 4.8 WhatsAppFab
Fixed bottom-right circular button, WhatsApp green, 56 px, with an iOS safe-area inset.
Visible on all viewports. `aria-hidden`, because the same action is available as a
labelled button in the hero and the enquiry band. The footer carries bottom padding
equal to the FAB height plus 16 px so the FAB can never sit on top of footer text on a
short viewport.

## 5. Bilingual content

All copy lives in one dictionary module as two complete locales, `en` and `hi`. There is
no third language and no per-string runtime fallback. A key present in `en` but missing
from `hi` is caught by the parity test in section 8 and fails the test run, rather than
silently rendering English inside the Hindi page.

The language choice is React state held in a small context, persisted to
`localStorage` under the versioned key `rajbaan.lang.v1`, defaulting to `en` on first
visit. A stored value that is not exactly `en` or `hi` is treated as absent and reset to
`en`, so a corrupted value cannot crash the page. Switching language must not reset
scroll position and must not re-run the reveal animations — reveal state lives in the
observer hook, not in the language context.

## 6. Motion

Four effects only, all hand-written — no animation library.

1. **Reveal on scroll** — sections fade from 0 opacity and 16 px below, easing to rest
   over 500 ms once, via `IntersectionObserver`, staggered 60 ms per index. The
   observer disconnects after firing.
2. **Badge pulse** — opacity cycles 1 → 0.55 → 1 over 2.4 s, `ease-in-out`, infinite.
3. **Marquee scroll** — pure CSS keyframes, duplicated content, linear, 30 s per loop.
4. **Card hover lift** — 2 px translate and shadow deepening, gated behind
   `@media (hover: hover) and (pointer: fine)` so it never sticks on touch devices.

Every one of these is disabled under `@media (prefers-reduced-motion: reduce)`, and
reveal-animated sections must be visible by default if JavaScript fails or the observer
never fires. Content is never hidden behind an animation that might not run.

## 7. Technical design

### 7.1 Stack
Vite, React, Tailwind CSS. No other runtime dependencies. Dev-only: Vitest and React
Testing Library.

### 7.2 Module layout
```
index.html                     meta, Open Graph tags, font links
README.md                      run/build/deploy steps, logo swap, placeholder URLs
scripts/prepare-logo.py        derives public/logo.png and public/favicon.png
public/favicon.png             derived from the logo
public/logo.png                derived, downscaled, unmodified artwork
src/main.jsx                   React root
src/App.jsx                    section composition, wraps the language provider
src/LanguageContext.jsx        language state, localStorage persistence, t() lookup
src/index.css                  Tailwind import + @theme design tokens
src/content.js                 every EN/HI string
src/contact.js                 phone number and derived wa.me / tel: links
src/components/TopBar.jsx
src/components/Hero.jsx
src/components/Marquee.jsx
src/components/Categories.jsx
src/components/Trust.jsx
src/components/Enquiry.jsx
src/components/Footer.jsx
src/components/WhatsAppFab.jsx
src/components/ContactButtons.jsx   the shared WhatsApp + call button pair
src/components/SpiceMotif.jsx  three named inline SVG exports
src/hooks/useReveal.js
```

Each component owns one section and takes no props. `ContactButtons` exists because the
WhatsApp/call pair appears in both the hero and the enquiry band and must not be
copy-pasted — the prefilled message and the `tel:` target are defined once in
`contact.js` and rendered once, in that component. Everything else reads from
`content.js` and `LanguageContext`. No component needs to know about any other
component, and the language context is the only state in the project.

### 7.3 Contact links
`contact.js` is the single source of truth. It holds `9216487878` once and derives:

- **WhatsApp:** `https://wa.me/919216487878?text=` plus
  `encodeURIComponent("Namaste Rajbaan, mujhe aapke masale aur dry fruits ke baare mein jaanna hai.")`
- **Tel:** `tel:+919216487878`

The prefilled message is deliberately Hinglish and deliberately identical in both
languages — it is what the customer reads in the WhatsApp thread, so it should sound
like a person regardless of which language they arrived from.

No phone number is hard-coded anywhere else, including in the UI copy — the visible
digits in the hero, the enquiry band, and the footer all read from the same constant,
so the displayed number and the dialled number can never disagree.

### 7.4 Logo asset processing
`logo rajbaan.png` is 549 KB at 1774×887, far more than a mobile page needs, and its ink
touches all four edges of the canvas — there is no built-in margin. Measured: 74% pure
black, 3% pure white, 23% antialiased edge, and an alpha bounding box equal to the full
canvas. Three consequences, all baked into the design:

- **Padding is the card's job, not the image's.** The mark cannot sit flush inside the
  hero card; the card carries at least 32 px of internal padding so the ink never
  crowds its border.
- **The mark is never inverted or recoloured.** Transparency-keying and tinting were
  considered and dropped: the source is near-solid black over 74% of its area, so what
  the mark actually depicts is unknown to the implementing agent (see constraint 2),
  and a wrong guess renders an unreadable block. The original black-on-white artwork is
  always shown unmodified.
- **The favicon is not a square crop.** A centred square crop of a 2:1 mark whose ink
  spans the full width would discard the left and right thirds. Instead a 512×512
  square is composed with the whole mark scaled to fit inside a margin, on a white
  ground.

Two derived assets, both produced by `scripts/prepare-logo.py` (Pillow, no numpy):

| Output               | Size    | Ground | Mark                            | Weight |
| -------------------- | ------- | ------ | ------------------------------- | ------- |
| `public/logo.png`    | 1200 px | white  | original artwork, unmodified    | 17 KB   |
| `public/favicon.png` | 512 px  | white  | full mark inside a 10% margin  | 5 KB    |

Both outputs are written as 256-colour palette PNGs with dithering off. The artwork is
black line art on white, so 256 entries are effectively unlimited for it: measured
against the full-colour resize, quantisation shifts the mean pixel by 0.53/255 and no
pixel by more than 24/255, which is below the threshold where banding becomes visible.
That is what takes the logo from 273 KB to 17 KB with no visible change. PNG rather than
WebP because `og:image` is consumed by WhatsApp and other preview generators that do not
all accept WebP.

`logo rajbaan.png` at the repo root is never modified and never shipped. The script must
print the output dimensions and file sizes so the reduction is verifiable.

### 7.5 Responsiveness
Mobile-first. Breakpoints at `sm` (640) and `md` (768), the only two the layout uses.
Check at 360, 390, 768, and 1440 px. No horizontal scrollbar at any width. Tap targets
≥ 44 px.

### 7.6 Accessibility
Semantic landmarks (`header`, `main`, `footer`), one `h1`, language toggle is real
buttons with `aria-pressed`, decorative SVGs and the marquee are `aria-hidden`, the
WhatsApp FAB is `aria-hidden`, focus is visible on every interactive element, and the
reduced-motion rules in section 6 apply.

### 7.7 SEO and sharing
Title `Rajbaan — Pure Spices & Dry Fruits | Coming Soon`, meta description, canonical
URL, Open Graph and Twitter card tags, and the derived favicon. The domain does not exist
yet, so two values are the only open item in this spec: the canonical `<link rel>` href
and `og:url`. Both ship as a single obvious placeholder in `index.html` —
`https://example.invalid/rajbaan` — which is a reserved non-resolving TLD, so a
forgotten value fails visibly rather than silently pointing at someone else's site. The
README tells the deployer to replace both. Nothing else in the spec is deferred.

`og:image` points at the derived `public/logo.png` on the same placeholder origin, and
is likewise replaced at deploy time.

## 8. Testing

Vitest and React Testing Library cover the only logic in the project:

1. Every key in the `en` dictionary has a counterpart in `hi` (parity, run first so a
   missing translation fails before the more specific tests).
2. The language toggle swaps visible text between the two dictionaries.
3. The language choice persists to `localStorage` and is restored on reload; a
   corrupted stored value falls back to `en`.
4. The WhatsApp CTA's `href` resolves to `wa.me/919216487878` with the encoded message.
5. The visible phone digits and the `tel:` link both derive from the one constant.

Presentational markup is not unit-tested. Visual correctness is checked by a human
looking at the rendered page at the four widths in 7.5 — automated assertions cannot
confirm the logo looks right, and per constraint 2 the agent cannot see it.

## 9. Out of scope for v1

Catalogue, cart, payments, accounts, email capture, analytics, cookie consent,
multi-page routing, CMS, i18n library, animation library, service worker / offline
support, and dark mode. The page will be replaced or substantially extended when the
store goes live, so nothing here should assume it needs to survive that transition.
