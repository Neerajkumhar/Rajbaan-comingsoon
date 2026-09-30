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

- **Asset:** the only brand asset available is `logo rajbaan.png` (1774×887, 549 KB,
  fully opaque, white line art on a black ground).
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

The logo carries no colour (solid black ink), so the palette is derived from the
product category.

| Token           | Hex       | Use                                              |
| --------------- | --------- | ------------------------------------------------ |
| `ink`       | `#1A1512` | Body text, dark sections                         |
| `maroon`    | `#7B1E1E` | Enquiry band, marquee band                       |
| `marigold`  | `#E8A33D` | Primary accent, badge fill, rules, icon strokes  |
| `turmeric`  | `#F4B942` | Focus ring, lighter gold tone on the field       |
| `cashew`    | `#F7F1E6` | Page background                                  |
| `parchment` | `#EFE3CE` | Card fills on the cream background               |

Six tokens. No green in the palette — WhatsApp green appears only inside the WhatsApp
buttons and the FAB, as a brand colour of the third-party service, never as a page
accent. That contrast is intentional: it makes the two WhatsApp CTAs the only green
elements on the page, so the eye finds them first.

Contrast: all body text pairs `ink` on `cashew` (≥ 12:1) or `cashew` on `maroon`
(≥ 7:1). Text on any ground — a gold badge included — must clear **4.5:1**, the AA
minimum for normal-size type; `ink` on `marigold` reaches 8.4:1, so a gold ground can
carry a label. Gold is never used for body text *on cream* — `marigold` on `cashew` fails
contrast at 1.9:1, so on `cashew` gold is restricted to large display type, rules, and
icons.

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
marigold wash behind the logo.

- **Logo:** `public/logo.png` sits directly on the `cashew` page — no panel, border, or
  shadow. The file is keyed to a transparent background (7.4), so a light card behind it
  would only ever frame an empty rectangle. Because the mark is solid black ink on a
  light ground it stays legible directly: 18.7:1 against `cashew`, and still 16:1 at the
  heaviest point of the marigold wash. Maximum rendered width 480 px, aspect ratio
  preserved, `object-contain` so the full mark is always visible. The mark must still
  never be recoloured, so it does not belong on any dark section.
- **Wordmark:** a bilingual lockup, always both scripts regardless of active language —
  `राजबान` in Devanagari display type, with `RAJBAAN` in letterspaced uppercase Latin
  beneath it. A brand lockup is not UI copy, so it does not change with the toggle.
- **Tagline:** `Asli masale. Asli Swaad.` / `असली मसाला। असली स्वाद ।`
- **Coming Soon badge:** pill in `marigold`, slow expanding-ring pulse. Static text — no
  date, no timer.
- **Primary CTA:** "WhatsApp us" → WhatsApp deep link with a prefilled message
  (exact text in 7.3).
- **Secondary CTA:** "Call 9216487878" → `tel:` link, with the digits pulled from
  `contact.js` rather than typed into the label.

Both CTAs must be usable at 360 px width without wrapping or clipping, and the
44×44 px minimum touch target applies to both.

- **Spice field:** one fixed `z-0` layer behind the whole page, carrying 34 hand-drawn
  masala and dry-fruit pieces on a single transform-only drift keyframe — all 34 above
  768 px, 18 below it, because fixed-size pieces cannot reflow with width and a field
  dense enough to read on a desktop is a thicket on a phone. It is
  `aria-hidden` and `pointer-events-none`. Its contract spans a four-step ladder: the layer
  at `z-0`, `main` and the footer at `relative z-10`, the sticky header at `z-40`, and the
  WhatsApp FAB at `z-50`. The field/content pair is the part that holds the page together
  — both halves are load-bearing, because a `z-10` without `relative` orders nothing, and
  a field raised above `z-10` paints over the content while still letting it be clicked, a
  fault that reads as missing text rather than as a stacking bug. The header's own `z-40`
  is load-bearing for the same reason: `main` sits at `z-10`, so a sticky header with no
  z-index would paint *below* the content scrolling under it. Fully specified in
  `2026-09-30-spice-field-background-design.md`.

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
labelled button in the hero and the enquiry band. The footer carries **at least** the FAB
height plus 16 px of bottom padding — 112 px as shipped, against a 56 px FAB — so the FAB
can never sit on top of footer text on a short viewport.

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

Five effects only, all hand-written — no animation library.

1. **Reveal on scroll** — sections fade from 0 opacity and 16 px below, easing to rest
   over 500 ms once, via `IntersectionObserver`, staggered 60 ms per index. The
   observer disconnects after firing.
2. **Badge pulse** — a marigold ring expands out of the badge and fades away, over 2.4 s,
   `ease-in-out`, infinite. A ring rather than an opacity fade: fading the badge to 0.55
   dropped its label to 3.14:1 against `marigold`, under the 4.5:1 minimum in section 3,
   for part of every cycle.
3. **Marquee scroll** — pure CSS keyframes, duplicated content, linear, 30 s per loop.
4. **Card hover lift** — 2 px translate and shadow deepening, gated behind
   `@media (hover: hover) and (pointer: fine)` so it never sticks on touch devices.
5. **Field drift** — the field's 34 pieces each translate within a 4–10 px band per axis
   and rotate 1–3° over 20–40 s, `ease-in-out`, `infinite alternate`, staggered by a
   negative delay so they are not in lockstep. The band is the constraint, not the spread:
   as shipped the seed runs 4–10 px on each axis, and 22–39 s. Slow enough to read as
   ambient rather than as motion on the page.

One keyframe serves all 34 pieces. Per-piece amplitude arrives through the `--drift-x`,
`--drift-y` and `--drift-r` custom properties read inside the keyframe, and per-piece
duration and delay are set inline, overriding the shorthand — thirty-four near-duplicate
keyframes would be a worse trade than thirty-four inline values. A piece's *base* rotation
rides the individual `rotate` property rather than `transform`, because CSS applies
`rotate` before `transform` and the two therefore compose; carried on `transform` instead,
the keyframe would overwrite it on every frame. `alternate` returns every piece to its
origin, so nothing drifts out of frame over a long visit.

`transform` is the only thing that animates. Per-piece opacity is static, between 0.10 and
0.18, and is never animated: an animated opacity across 34 elements repaints every frame
and drops frames on low-end mobile, where transform stays on the compositor. There is no
`will-change` either — promoting 34 permanent layers costs more memory than the compositor
saves on animation this slow. Nothing in the field runs per frame except the compositor:
no canvas, no WebGL, no animation library, no per-frame JavaScript.

Every one of these is disabled under `@media (prefers-reduced-motion: reduce)`, and
reveal-animated sections must be visible by default if JavaScript fails or the observer
never fires. Content is never hidden behind an animation that might not run; the field's
pieces stay on the page at their seeded positions, motionless.

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
public/logo.png                derived, background keyed out and trimmed to the ink
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
src/components/SpiceField.jsx       the fixed background layer and its 34-piece seed
src/components/SpiceMotif.jsx       ten named inline SVG exports, each with a `solid` variant
src/hooks/useReveal.js
```

Each section component owns one section and takes no props. `ContactButtons` exists
because the WhatsApp/call pair appears in both the hero and the enquiry band and must not
be copy-pasted — the prefilled message and the `tel:` target are defined once in
`contact.js` and rendered once, in that component. Everything else reads from
`content.js` and `LanguageContext`. No section knows about any other section, and the
language context is the only state in the project. Four imports cross between components:
`Hero` and `Enquiry` → the shared `ContactButtons`, `Categories` → `SpiceMotif`, and
`SpiceField` → `SpiceMotif`. The field's is the newest, and it points the safe way: it
draws from `SpiceMotif` and nothing draws from it, so the field can be deleted in
one commit without touching a motif, and a new motif needs only naming in the seed.

`SpiceField` is also the one component that carries its own data instead of reading
`content.js`: a hardcoded 34-entry seed, one entry per piece, holding that piece's
thirteen fields — `motif`, `x`, `y`, `size`, `rotate`, `opacity`, `duration`, `delay`,
`tone`, `minWidth`, and the drift amplitudes `driftX`, `driftY` and `driftR`, which reach
the keyframe as the `--drift-*` custom properties in section 6. The seed
is written out rather than randomised at render time, deliberately — a random field
differs between renders, so it can neither be asserted in a test nor reviewed, and a
defect in it would not reproduce. `x` and `y` are viewport percentages, so the field
reflows with width instead of crowding one edge on a wide screen; `size` stays in px, so
a piece reads at the same physical size wherever it lands. The two together make density
non-uniform — fixed-size pieces pack far tighter on a 390 px phone than on a 1440 px
desktop — and because no choice of `x` and `y` can undo that, density is managed instead of
merely accepted: each entry carries the viewport width below which it is hidden, 16 are
desktop-only and 18 render at every width. The breakpoint comes from `matchMedia` rather
than a CSS media query because a `display: none` rule leaves all 34 elements in the tree,
and a field that is hidden is still measured. The field is decorative and the layer clips
whatever falls outside it either way. Placement is spread across the width rather than
clustered at the edges, because a field that thins out across the horizontal centre
leaves the part of the page the visitor is actually looking at the emptiest.

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
`logo rajbaan.png` is 549 KB at 1774×887, far more than a mobile page needs. Its art is
white on a black ground, and the black is padding as much as canvas: measured, the ink
occupies a 1620×615 box at an offset of (93, 109), so the real mark is 2.63:1 inside a
2:1 canvas. Three consequences, all baked into the design:

- **The background is keyed out, and the mark is trimmed to its own bounding box.** The
  source's luminance doubles as the alpha channel, so the black ground becomes fully
  transparent and the white art stays white in the alpha and renders as black ink. The
  canvas is then cropped to the ink's bounding box, because shipping the source's black
  padding would shrink the mark inside the card and force the `height` attribute to
  disagree with the file. The ink colour is never tinted or recoloured; only the
  background is removed.
- **Padding is the layout's job, not the image's.** Because the file is trimmed tight,
  nothing ships with built-in margin. The hero gets its breathing room from the
  `max-w-[480px]` cap plus the section's own padding, and the favicon from its 10%
  margin.
- **The favicon is not a square crop.** A centred square crop of a wide mark whose ink
  spans the full width would discard the left and right thirds. Instead a 512×512
  square is composed with the whole mark scaled to fit inside a margin. The favicon
  keeps an opaque white ground even though the logo is transparent: a transparent
  black-ink favicon is invisible against dark browser chrome, which is the default in
  several popular browsers.

Two derived assets, both produced by `scripts/prepare-logo.py` (Pillow, no numpy):

| Output               | Size    | Ground | Mark                        | Weight |
| -------------------- | ------- | ------ | --------------------------- | ------ |
| `public/logo.png`    | 1200 px | none   | trimmed ink, 2.63:1, RGBA  | 113 KB |
| `public/favicon.png` | 512 px  | white  | full mark inside a 10% margin | 5 KB |

The logo is written as a true-colour RGBA PNG because its alpha channel is the artwork:
palette quantisation is meaningless once the background is keyed, and every colour in the
file is black. Dropping to grayscale+alpha was measured and rejected — it saved only
20 KB (PNG already compresses the three constant ink channels to nothing) and it renders
pixel-identically on a white card, so the extra format risk buys nothing. The favicon is
opaque flat line art, so it does use a 256-colour palette with dithering off: that is
what takes it from 30 KB to 5 KB with no visible change. PNG rather than WebP because
`og:image` is consumed by WhatsApp and other preview generators that do not all accept
WebP.

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

Vitest and React Testing Library cover the only logic and invariants in the project:

1. Every key in the `en` dictionary has a counterpart in `hi` (parity, run first so a
   missing translation fails before the more specific tests).
2. The language toggle swaps visible text between the two dictionaries.
3. The language choice persists to `localStorage` and is restored on reload; a
   corrupted stored value falls back to `en`.
4. The WhatsApp CTA's `href` resolves to `wa.me/919216487878` with the encoded message.
5. The visible phone digits and the `tel:` link both derive from the one constant.
6. The field's invariants, each a regression that is invisible until it breaks: the
   `solid` variant fills without dropping the stroke, the seven added motifs draw on the
   shared viewBox, and the drift keyframe is read for the `--drift-*` custom properties it
   actually reads rather than matched against the whole stylesheet, so a comment naming
   them cannot stand in for a keyframe that baked in constants. The seed is pinned to its
   constraints — 34 pieces, opacity 0.10–0.18, drift 4–10 px per axis and 1–3°, 20–40 s,
   base rotation on `rotate` with no `transform`, durations and delays that genuinely
   vary — and the narrow field is asserted to be the `minWidth: 0` set rather than the
   first 18 entries, since a truncated seed renders the right number of motifs in the
   wrong places — and the layer's `aria-hidden`, `pointer-events-none`, `z-0`, `fixed`,
   `inset-0` and `overflow-hidden` are asserted alongside the `relative z-10` on `main`
   and the footer, because a field raised above the content satisfies every other test in
   the suite, and because `z-0` orders nothing unless the layer is actually `fixed` and
   covers the viewport. The field's place in the page-wide stack is asserted at the
   composition level for the same reason: the sticky header's `z-40` and the FAB's `z-50`
   are checked against the content's `z-10`, since a sticky header with no z-index paints
   below the content scrolling under it.

Presentational markup is not unit-tested, except where a class name or inline style is
itself the guarantee — which is the case for each field assertion in item 6. Visual
correctness is checked by a human looking at the rendered page at the four widths in 7.5:
automated assertions cannot confirm the logo looks right, or that the field's pieces read
as masala rather than as abstract shapes, and per the no-image-review constraint the agent
cannot see it.

## 9. Out of scope for v1

Catalogue, cart, payments, accounts, email capture, analytics, cookie consent,
multi-page routing, CMS, i18n library, animation library, service worker / offline
support, and dark mode. The page will be replaced or substantially extended when the
store goes live, so nothing here should assume it needs to survive that transition.
