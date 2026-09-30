# Spice field background — design

**Date:** 2026-09-30
**Status:** Shipped; recorded in the coming-soon spec, sections 6, 7.2 and 8
**Supersedes:** nothing. Adds a new section to the existing coming-soon spec.

## 1. Goal

The page currently reads as pure typography on a flat cream field. Give it a slow,
ambient bed of individual masala and dry-fruit pieces drifting behind the content, so
the page feels like the product it sells without competing with it.

The pieces are inline SVG, drawn by hand in the same language as the existing
`SpiceMotif` icons. Nothing is rasterised, no library is added, and no photographic
asset enters the repository.

## 2. Non-goals

- Not a replacement for the `Categories` icons. Those stay line art at full opacity.
- Not scroll-reactive. Piece position does not depend on scroll offset.
- Not a particle system, canvas layer, or physics simulation. No JavaScript runs per
  frame.
- Not interactive. Pieces never respond to pointer or hover.
- Not new palette entries. See §4.6.

## 3. What exists today

- `src/components/SpiceMotif.jsx` exports `StarAnise`, `Chilli`, `Cashew`. All share a
  `base` object: `viewBox="0 0 48 48"`, `fill: 'none'`, `stroke: 'currentColor'`,
  `strokeWidth: 1.5`, round caps and joins, `aria-hidden: 'true'`, `className: 'h-12 w-12'`.
  `className` in `base` is a default that callers override — `Categories.jsx` passes
  `mx-auto h-12 w-12 text-maroon`.
- `src/components/Categories.jsx` maps translation keys to motifs through a `MOTIFS`
  lookup keyed on `item.motif`.
- `src/index.css` defines `@keyframes marquee-scroll` and `@keyframes badge-pulse`
  with `.animate-marquee` / `.animate-badge-pulse` wrappers.
- The single `prefers-reduced-motion: reduce` block in `src/index.css` disables both
  existing animations and neutralises `.reveal`.
- `TopBar` is `sticky top-0 z-40`. `WhatsAppFab` is `fixed right-4 z-50`. `main` and
  `Footer` were static until §4.8 gave them `relative z-10`, which leaves the shipped ladder
  field `z-0` → `main`/`Footer` `z-10` → header `z-40` → FAB `z-50`.
- Palette tokens live in the `@theme` block in `src/index.css`: `ink`, `maroon`, `marigold`,
  `turmeric`, `cashew`, `parchment`, `whatsapp`, `whatsapp-deep`.

## 4. Decisions

### 4.1 Illustration, not photography

Pieces are inline SVG. This keeps §1's "no stock photography" non-goal in the base spec
intact, adds no
image bytes, stays crisp at any density, and requires no image-generation or stock API —
none is available in this environment. It also extends a drawing language the codebase
already established instead of introducing a second visual style.

### 4.2 New motifs

Seven added to `SpiceMotif.jsx`, matching the existing `0 0 48 48` viewBox and
`strokeWidth: 1.5`:

| Export     | Reads as                | Dry fruit? |
| ---------- | ----------------------- | ---------- |
| `Clove`    | nail-shaped bud         | no         |
| `Cardamom` | ribbed pod, seam line   | no         |
| `Pepper`   | sphere with crease      | no         |
| `Cinnamon` | two rolled quills      | no         |
| `BayLeaf`  | pointed oval, midrib    | no         |
| `Almond`   | teardrop, pointed tip   | yes        |
| `Raisin`   | irregular wrinkled blob | yes        |

Ten motifs total. Every one must be drawn so its silhouette is identifiable in
silhouette at 30–54 px — the band the seed actually draws in, which reaches wider than a
card-sized icon does. `Categories.jsx` does not change and continues to use only the
original three.

### 4.3 A `solid` variant

The existing motifs are `fill: 'none'`. Outlined shapes at 10% opacity read as faint
wireframe and largely disappear, so the field renders each piece with a fill as well as
its outline.

`SpiceMotif.jsx` gains a `solid` boolean prop. When true, a piece renders with
`fill: 'currentColor'` at `fill-opacity: 0.28` and **keeps** its `currentColor` stroke;
when absent or false, the current unfilled stroked behaviour is unchanged. The prop is
implemented once in the shared `base` object so adding a motif does not repeat the
branch. `fill-opacity` rather than a flat fill keeps the interior from reading as a hard
slab at full strength, and is not field-specific special-casing — it is correct for any
filled icon.

The stroke is deliberately kept rather than switched off. Every existing motif is drawn
with **open** paths — `Chilli`'s first path in `SpiceMotif.jsx` starts at `M26 10` and its
cubic ends at `(11, 33)`, never returning to the start — so `stroke: 'none'` would leave a
fill that auto-closes the path into whatever shape the straight line happens to cut.
Keeping the stroke makes the variant safe for open and closed paths alike, which is the
only reason it can be trusted for artwork whose appearance cannot be reviewed.

### 4.4 `SpiceField.jsx`

A new component rendering one fixed, full-viewport layer:

- `aria-hidden="true"` — decorative only, must never reach assistive tech.
- `pointer-events-none` — must not intercept clicks on the WhatsApp FAB or buttons.
- `fixed inset-0 z-0 overflow-hidden` — one layer for the whole page, not per section.
- Exactly 34 pieces drawn from a **hardcoded** seed array, of which 18 render below
  768 px. Each entry carries thirteen fields: `motif`, `x`, `y`, `size`, `rotate`,
  `opacity`, `duration`, `delay`, `tone`, `minWidth`, and the three drift amplitudes
  `driftX`, `driftY` and `driftR`, which reach the keyframe as the `--drift-*` custom
  properties in §4.5.

`x` and `y` are percentages of the viewport, so the field reflows with width instead of
drifting toward one edge on wide screens. `size` is px. `rotate` is a static base
rotation in degrees, distinct from the animated rotation in §4.5. `opacity` is the static
alpha of §4.6, never animated. `tone` is a `@theme` token name.

`minWidth` is the viewport width in px below which a piece is not rendered, and a piece is
only rendered when the viewport is at least that wide: 16 entries carry `768` and 18 carry
`0`. The count is responsive because `size` is in px, so percentage placement reflows
while the pieces do not — a field of fixed-size pieces packs several times tighter on a
390 px phone than on a 1440 px desktop, and no arrangement of `x` and `y` fixes that. The
16 wide-only entries are the ones furthest from the text-bearing bands, which is why the
gap between sections survives the reduction and the field does not thin out under the hero
or the enquiry form.

The breakpoint is read from `matchMedia` through `useSyncExternalStore` rather than from a
CSS media query, because the pieces are React elements and a `display: none` rule would
leave all 34 of them in the tree — painted by nothing, announced by nothing, and still
counted by anything that measures the field. Removing them keeps the rendered node count
honest. There is no server render in this app, so the store's server snapshot is a
constant; it exists because `useSyncExternalStore` requires one, not because anything
consults it.

The seed is hardcoded rather than randomised at runtime, deliberately. Random placement
would differ between renders, which makes the field impossible to assert in a test and
impossible to review — a defect would be unreproducible. A fixed array is deterministic,
reviewable, and tunable by hand.

`overflow-hidden` on the layer is required: pieces translated near a viewport edge would
otherwise widen the document and produce a scrollbar.

### 4.5 Motion

One new `@keyframes drift` in `src/index.css`:

- Translates 4–10 px on each axis and rotates 1–3°, `ease-in-out`, `infinite alternate`,
  20–40 s per piece, staggered by a negative `delay` so pieces are not in lockstep.
- One keyframe serves all 34 pieces. Per-piece amplitude comes from the CSS custom
  properties `--drift-x`, `--drift-y`, and `--drift-r`, read inside the keyframe; per-piece
  duration and delay are set with inline `animationDuration` and `animationDelay`, which
  override the shorthand on `.animate-drift`. No 34 near-duplicate keyframes.
- A piece's **base** rotation is set with the individual `rotate` property, not
  `transform`. CSS applies `translate`/`rotate`/`scale` before `transform`, so the base
  rotation composes with the keyframe's `transform` rather than being overwritten by it.
  Setting base rotation through `transform` instead would be silently replaced by the
  animation on every frame.
- `alternate` returns each piece to its origin, so the field never drifts out of frame
  over a long visit.
- Opacity is **static per piece** and never animated. An animated `opacity` on 34
  elements forces repaint on every frame and drops frames on low-end mobile; transform
  animation stays on the compositor.
- No `will-change: transform`. Promoting 34 permanent layers costs more memory than the
  compositor saves on animations this slow.

### 4.6 Opacity and colour

Per-piece opacity is static, between 0.10 and 0.18. The floor is set by legibility: the
enquiry form and contact buttons sit on top of this layer, and pieces drifting under
reading material must never approach the 4.5:1 AA threshold for the text they sit behind.
The ceiling is set by the opposite risk — below roughly 0.10 the piece is not worth
rendering at all.

Tones are drawn from existing `@theme` tokens only — `marigold`, `turmeric`, `maroon`,
`ink`. Adding `clove-brown` and `almond-cream` tokens was considered and deferred: §3 of
the base spec commits the palette to tokens derived from the product category, and two
more browns earn their place only if the field reads as too cold. This is a visual
decision the agent cannot make — see constraint §8.

### 4.7 Reduced motion

The field's animation is added to the existing `prefers-reduced-motion: reduce` block —
the single such block in `src/index.css`, which already neutralises `.animate-marquee`,
`.animate-badge-pulse` and `.reveal`. Pieces still render, at their static positions. The
effect is removed; the page does not lose content.

### 4.8 Stacking

The layer is `z-0`. `TopBar` (z-40) and `WhatsAppFab` (z-50) already sit above it.
`main` and `Footer` are static and would paint *below* a positioned `z-0` element, so
both get `relative z-10`. Without this the field would cover the page content while
still letting it be clicked — a bug that reads as invisible content until something is
tapped.

`body` keeps its `--color-cashew` background. The layer must not go behind it with a
negative z-index, or the cream background would hide it entirely.

## 5. Component boundaries

- `SpiceMotif.jsx` — pure drawing. Owns the ten path definitions and the `solid` prop.
  Knows nothing about the field.
- `SpiceField.jsx` — owns the seed array, placement, and per-piece tone and opacity.
  Imports motif components; does not draw.

The field can be deleted in one commit without touching a single motif, and a new motif
can be added without touching the field except to name it in the seed. Neither file
imports the other in the wrong direction.

## 6. Testing

The base spec does not unit-test presentational markup. The branch added two test files —
`SpiceField.test.jsx` and `index-css.test.jsx` — and extended the two that already covered
the code it touched, `SpiceMotif.test.jsx` and `App.test.jsx`. Base spec §8 item 6 is the
canonical list; what follows is why each of the field's properties is a regression that is
invisible until it breaks:

1. The layer is `aria-hidden` — a decorative field read aloud is a real accessibility
   failure, and nothing else would catch it.
2. The rendered piece count matches the seed length, so a motif that fails to resolve
   cannot silently reduce the field.
3. The layer's own `z-0`, `fixed`, `inset-0`, `overflow-hidden` and `pointer-events-none`
   are asserted, alongside the `relative z-10` on `main` and the footer. A field raised
   above the content satisfies every other assertion in the suite, and `z-0` orders nothing
   unless the layer is actually `fixed` and covers the viewport.
4. Every seeded value is read back off the rendered element — `left`, `top`, `rotate`,
   `animationDuration`, `animationDelay`, the three `--drift-*` properties and the tone
   class — rather than off the `PIECES` literal. The literal is the seed's own description
   of itself, so an assertion against it cannot see a style the component stopped applying.
   This matters most for the drift amplitudes: the keyframe's `var(--drift-x, 8px)`
   fallbacks are in range by design, so a piece that never receives its amplitude drifts in
   lockstep with the rest of the field rather than failing anything.
5. The four tone class names are pinned as literals. Tailwind emits them from the `@theme`
   tokens at build time, so `src/index.css` cannot be scanned for them; the emitted name is
   as far as the suite can reach, and the build is what turns it into a rule.
6. The rendered count at each width, and that the narrow field is the `minWidth: 0` set
   rather than the first N entries of the seed. A count assertion alone cannot tell the
   two apart: truncating the seed renders the right number of motifs at the wrong places,
   and every assertion that reads the seed literal still passes.

`x`, `y`, and `tone` are module constants, not content, so they need no translation and
are deliberately excluded from the `en`/`hi` parity test in the base spec.

Visual quality is not asserted. Per constraint §8 the agent cannot see the result, so
the person reviewing this spec is the only check on whether the pieces read as masala.

## 7. Performance budget

- 34 inline SVG elements above 768 px, 18 below it, each a handful of paths. No images,
  no fonts, no JS.
- Transform-only animation on the compositor; no layout or paint per frame.
- No `will-change`, no `filter`, no animated `opacity`.
- Total added transfer size: 8 367 B uncompressed against a 257 941 B pre-field baseline,
  in JS and CSS. This is over the 8 KB target set when the field carried 20 pieces; the
  target was not re-derived, because the pieces are the feature and dropping them to
  re-meet a size figure would remove what the field is for.
- Pieces are `aria-hidden` and non-interactive, so they add no accessibility tree weight.

## 8. Constraints carried forward

From the base spec §2:

- **No image review.** The implementing agent cannot see images. Whether the ten motifs
  are recognisable, whether the drift is too fast, and whether 0.18 opacity is too strong
  are all unknown to the agent. Every visual claim in this document is a hypothesis for
  a human to confirm on a rendered page.
- **Asset.** The ten motifs are hand-authored here; no external asset enters the repo.

## 9. Out of scope

Raster or photographic assets, canvas or WebGL, scroll-linked parallax, pointer
interaction, per-section clusters, and any new `@theme` colour token.