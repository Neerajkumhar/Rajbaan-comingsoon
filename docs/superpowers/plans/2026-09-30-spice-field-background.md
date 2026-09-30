# Spice Field Background Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** An ambient, slowly drifting field of hand-drawn masala and dry-fruit SVG pieces behind the page content.

**Architecture:** `SpiceMotif.jsx` stays a pure drawing library and gains a `solid` prop plus seven new motifs. A new `SpiceField.jsx` owns a hardcoded 20-entry seed and renders one fixed, aria-hidden, non-interactive layer. One `@keyframes drift` in `index.css` animates all 20 pieces off per-piece CSS custom properties. `main` and `Footer` are lifted to `relative z-10` so the `z-0` field cannot paint over them.

**Tech Stack:** React 19, Tailwind CSS v4, Vitest + React Testing Library (jsdom), Vite 8. No new dependencies.

**Spec:** `docs/superpowers/specs/2026-09-30-spice-field-background-design.md` — read it before starting; this plan argues from it.

## Global Constraints

- Exactly **20** pieces. Not "about 20". The count is asserted in a test.
- Per-piece `opacity` is **static**, in the range **0.10–0.18**, and must never be animated.
- Per-piece drift amplitude is **4–10 px** on each axis, rotation **1–3°**, duration **20–40 s**, `ease-in-out infinite alternate`.
- Tones are drawn **only** from existing `@theme` tokens: `marigold`, `turmeric`, `maroon`, `ink`. Add no new colour token.
- No new npm dependency. No raster or photographic asset. No canvas, no WebGL, no per-frame JavaScript.
- No `will-change`, no `filter`, no animated `opacity` anywhere in this feature.
- Every motif uses `viewBox="0 0 48 48"` and `strokeWidth: 1.5`.
- Base rotation uses the individual `rotate` CSS property, never `transform`.
- Tailwind classes must be written as **literal strings**. `text-${tone}` is forbidden — see Task 4 Step 4.
- Reduced motion must disable the drift via the existing `@media (prefers-reduced-motion: reduce)` block at `src/index.css:80`.

---

## File Structure

| File | Responsibility |
|---|---|
| `src/components/SpiceMotif.jsx` | Pure SVG drawing. Ten motifs + the `solid` prop. Knows nothing of the field. |
| `src/components/SpiceField.jsx` | Owns the 20-entry seed, placement, tone, opacity. Imports motifs; draws nothing. |
| `src/index.css` | The `drift` keyframe, `.animate-drift`, and its reduced-motion entry. |
| `src/App.jsx` | Mounts `<SpiceField />`; lifts `main` to `relative z-10`. |
| `src/components/Footer.jsx` | Lifts the footer to `relative z-10` so pieces cannot drift over the dark band. |
| `src/test/SpiceMotif.test.jsx` | The `solid` contract and motif inventory. |
| `src/test/SpiceField.test.jsx` | Layer semantics, seed integrity, literal colour classes. |
| `src/test/index-css.test.jsx` | Keyframe present, reduced-motion wired. |

The field can be deleted in one commit without touching a motif. A new motif can be added without touching the field except to name it in `MOTIFS`.

---

### Task 1: The `solid` variant

Existing motifs are `fill: 'none'` at `strokeWidth: 1.5`. Outlined shapes at 10% opacity read as faint wireframe, so the field needs each piece filled as well as stroked.

**Files:**
- Modify: `src/components/SpiceMotif.jsx:1-10` (the `base` object)
- Test: `src/test/SpiceMotif.test.jsx`

**Interfaces:**
- Consumes: nothing.
- Produces: `attrs({ solid, ...props })` — an internal helper returning the merged SVG attribute object. Motif components accept an optional `solid` boolean and never forward it to the DOM.

- [ ] **Step 1: Write the failing test**

Create `src/test/SpiceMotif.test.jsx`:

```jsx
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Cashew, Chilli, StarAnise } from '../components/SpiceMotif.jsx'

function svgOf(element) {
  const { container } = render(element)
  return container.querySelector('svg')
}

describe('the solid motif variant', () => {
  it('leaves a motif unfilled by default', () => {
    expect(svgOf(<StarAnise />)).toHaveAttribute('fill', 'none')
  })

  it('fills a solid motif without dropping its stroke', () => {
    // The stroke must survive. Chilli's path is open, so a fill-only render would let
    // the fill auto-close across a straight line and cut the shape in half.
    const svg = svgOf(<Chilli solid />)
    expect(svg).toHaveAttribute('fill', 'currentColor')
    expect(svg).toHaveAttribute('fill-opacity', '0.28')
    expect(svg).toHaveAttribute('stroke', 'currentColor')
  })

  it('never forwards solid to the DOM', () => {
    // The guard is the props check: it reads the exact object handed to <svg>, so it
    // fails whenever `solid` survives the parameter list, whatever React does with the
    // attribute afterwards.
    expect(Cashew({ solid: true }).props).not.toHaveProperty('solid')

    // The rendered attribute alone cannot guard: React 19 drops an unknown boolean
    // attribute instead of writing it, so the <svg> has no `solid` either way. It still
    // catches a change that forwards solid as a string rather than a boolean.
    //
    // Forwarding as a boolean also makes React log "Received `true` for a non-boolean
    // attribute `solid`", but React dedupes that message per file, so this only bites on
    // whichever render triggers it first. Treat it as a signal, not the guard.
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    try {
      expect(svgOf(<Cashew solid />)).not.toHaveAttribute('solid')
      expect(consoleError).not.toHaveBeenCalled()
    } finally {
      consoleError.mockRestore()
    }
  })

  it('still lets a caller win on fill', () => {
    expect(svgOf(<Cashew solid fill="red" />)).toHaveAttribute('fill', 'red')
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/test/SpiceMotif.test.jsx`
Expected: FAIL — `fill` is `"none"` where `"currentColor"` is expected, and `fill-opacity` is absent.

- [ ] **Step 3: Implement `attrs` and route all three motifs through it**

In `src/components/SpiceMotif.jsx`, replace the `const base = {` object with the object plus a helper directly beneath it:

```jsx
const base = {
  viewBox: '0 0 48 48',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': 'true',
  className: 'h-12 w-12',
}

// `solid` fills a piece as well as stroking it, so the same drawing reads as a tinted
// shape at low opacity instead of vanishing wireframe. fill-opacity rather than a flat
// fill keeps the interior from reading as a hard slab. The stroke is kept on purpose:
// every motif is drawn with open paths, so dropping it would leave a fill that
// auto-closes across whatever straight line joins the endpoints.
const solidFill = { fill: 'currentColor', fillOpacity: 0.28 }

function attrs({ solid = false, ...props }) {
  return { ...base, ...(solid ? solidFill : null), ...props }
}
```

Then change each of the three existing components' opening tag. `StarAnise`:

```jsx
export function StarAnise({ solid, ...props }) {
  return (
    <svg {...attrs({ solid, ...props })}>
```

`Chilli`:

```jsx
export function Chilli({ solid, ...props }) {
  return (
    <svg {...attrs({ solid, ...props })}>
```

`Cashew`:

```jsx
export function Cashew({ solid, ...props }) {
  return (
    <svg {...attrs({ solid, ...props })}>
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/test/SpiceMotif.test.jsx`
Expected: PASS, 4 tests.

- [ ] **Step 5: Run the full suite to confirm no regression**

Run: `npm test`
Expected: PASS — `Categories.jsx` still renders `StarAnise`, `Chilli`, and `Cashew` without `solid`, so the card icons keep their line-art look.

- [ ] **Step 6: Commit**

```bash
git add src/components/SpiceMotif.jsx src/test/SpiceMotif.test.jsx
git commit -m "feat(motifs): add a solid variant that fills without dropping the stroke"
```

---

### Task 2: The seven new motifs

Each silhouette must be identifiable at 28–44 px. Prefer `circle`, `ellipse`, and `rect`
over long bezier blobs: an elaborate path authored blind is far likelier to render as an
unrecognisable shape than a primitive that reads correctly by construction.

**Files:**
- Modify: `src/components/SpiceMotif.jsx` (append after `Cashew`)
- Test: `src/test/SpiceMotif.test.jsx`

**Interfaces:**
- Consumes: `attrs` from Task 1.
- Produces: `Clove`, `Cardamom`, `Pepper`, `Cinnamon`, `BayLeaf`, `Almond`, `Raisin` — each `({ solid, ...props })`.

- [ ] **Step 1: Write the failing test**

Replace the existing single import line at the top of `src/test/SpiceMotif.test.jsx` with
one combined statement — do not add a second import from the same module:

```jsx
import {
  Almond,
  BayLeaf,
  Cardamom,
  Cashew,
  Chilli,
  Cinnamon,
  Clove,
  Pepper,
  Raisin,
  StarAnise,
} from '../components/SpiceMotif.jsx'
```

Then append:

```jsx
import * as SpiceMotif from '../components/SpiceMotif.jsx'

const NEW_MOTIFS = { Almond, BayLeaf, Cardamom, Cinnamon, Clove, Pepper, Raisin }

describe('the masala and dry-fruit motifs', () => {
  it('exports all seven', () => {
    // Counting the keys of a local literal cannot fail: it holds whether or not the
    // module exports anything. Assert against the module's real export surface.
    expect(Object.keys(NEW_MOTIFS)).toHaveLength(7)
    for (const name of Object.keys(NEW_MOTIFS)) {
      expect(SpiceMotif[name], name).toBeTypeOf('function')
    }
  })

  it.each(Object.entries(NEW_MOTIFS))('draws %s on the shared viewBox', (name, Motif) => {
    const svg = svgOf(<Motif />)
    expect(svg).toHaveAttribute('viewBox', '0 0 48 48')
    expect(svg).toHaveAttribute('stroke-width', '1.5')
  })

  it.each(Object.entries(NEW_MOTIFS))('hides %s from assistive technology', (name, Motif) => {
    expect(svgOf(<Motif />)).toHaveAttribute('aria-hidden', 'true')
  })

  it.each(Object.entries(NEW_MOTIFS))('gives %s some ink to draw', (name, Motif) => {
    expect(svgOf(<Motif />).children.length).toBeGreaterThan(0)
  })

  it('supports the solid variant on every new motif', () => {
    for (const Motif of Object.values(NEW_MOTIFS)) {
      expect(svgOf(<Motif />)).toHaveAttribute('fill', 'none')
      expect(svgOf(<Motif solid />)).toHaveAttribute('fill', 'currentColor')
    }
  })

  it('never forwards solid to the DOM from any new motif', () => {
    // Task 1 established that checking the rendered attribute cannot guard this: React 19
    // drops an unknown boolean rather than writing it. Read the attribute object instead.
    for (const [name, Motif] of Object.entries(NEW_MOTIFS)) {
      expect(Motif({ solid: true }).props, name).not.toHaveProperty('solid')
    }
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/test/SpiceMotif.test.jsx`
Expected: FAIL — `Almond` and the rest are not exported, so the import throws.

- [ ] **Step 3: Add the seven motifs**

Append to `src/components/SpiceMotif.jsx`:

```jsx
export function Clove({ solid, ...props }) {
  return (
    <svg {...attrs({ solid, ...props })}>
      <ellipse cx="24" cy="17" rx="8" ry="7" />
      <path d="M20 13c-2-3-5-3-6-1" />
      <path d="M24 11c0-3 1-4 3-5" />
      <path d="M28 13c2-3 5-3 6-1" />
      <path d="M22 24h4l-1.5 15h-1z" />
    </svg>
  )
}

export function Cardamom({ solid, ...props }) {
  return (
    <svg {...attrs({ solid, ...props })}>
      <ellipse cx="24" cy="25" rx="9" ry="14" />
      <path d="M24 12v27" />
      <path d="M24 12c-1-3 0-5 2-6" />
    </svg>
  )
}

export function Pepper({ solid, ...props }) {
  return (
    <svg {...attrs({ solid, ...props })}>
      <circle cx="24" cy="26" r="11" />
      <path d="M17 20c4 3 7 7 8 12" />
    </svg>
  )
}

export function Cinnamon({ solid, ...props }) {
  return (
    <svg {...attrs({ solid, ...props })}>
      <rect x="13" y="14" width="9" height="22" rx="4.5" transform="rotate(-12 17.5 25)" />
      <rect x="26" y="12" width="9" height="22" rx="4.5" transform="rotate(12 30.5 23)" />
    </svg>
  )
}

export function BayLeaf({ solid, ...props }) {
  return (
    <svg {...attrs({ solid, ...props })}>
      <path d="M24 6c8 8 12 14 12 20 0 8-5 14-12 16-7-2-12-8-12-16 0-6 4-12 12-20z" />
      <path d="M24 10v30" />
    </svg>
  )
}

export function Almond({ solid, ...props }) {
  return (
    <svg {...attrs({ solid, ...props })}>
      <path d="M24 7c6 7 9 13 9 19 0 7-4 12-9 15-5-3-9-8-9-15 0-6 3-12 9-19z" />
      <path d="M24 12v24" />
    </svg>
  )
}

export function Raisin({ solid, ...props }) {
  return (
    <svg {...attrs({ solid, ...props })}>
      <ellipse cx="24" cy="26" rx="12" ry="11" />
      <path d="M15 23c4 2 7 2 10 0" />
      <path d="M17 30c4 2 8 2 12 0" />
    </svg>
  )
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/test/SpiceMotif.test.jsx`
Expected: PASS — 28 tests: 4 from Step 1 plus `exports all seven`, three `it.each` blocks
of 7, `supports the solid variant`, and `never forwards solid to the DOM`. (`exports all
seven` must fail here: the module exports none of the seven yet.)

- [ ] **Step 5: Lint**

Run: `npm run lint`
Expected: clean. If `react/no-unknown-property` or similar objects to a prop, fix the prop name — do not add an eslint-disable.

- [ ] **Step 6: Commit**

```bash
git add src/components/SpiceMotif.jsx src/test/SpiceMotif.test.jsx
git commit -m "feat(motifs): draw clove, cardamom, pepper, cinnamon, bay leaf, almond, raisin"
```

---

### Task 3: The drift keyframe

One keyframe serves all 20 pieces. Per-piece amplitude arrives through CSS custom
properties read inside the keyframe, so there is no 20-keyframe sprawl.

**Files:**
- Modify: `src/index.css:47-49` (after `.animate-badge-pulse`) and `src/index.css:85-88`
- Test: `src/test/index-css.test.jsx`

**Interfaces:**
- Consumes: nothing.
- Produces: `@keyframes drift`, the `.animate-drift` class, and custom properties `--drift-x`, `--drift-y`, `--drift-r` read by the keyframe.

- [ ] **Step 1: Write the failing test**

Create `src/test/index-css.test.jsx`. This follows the `readFileSync` pattern already used in `App.test.jsx:13-23`:

```jsx
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const CSS = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), '..', 'index.css'),
  'utf8',
)

describe('the drift keyframe', () => {
  it('exists', () => {
    expect(CSS).toContain('@keyframes drift')
  })

  it('reads per-piece amplitude from custom properties', () => {
    expect(CSS).toContain('--drift-x')
    expect(CSS).toContain('--drift-y')
    expect(CSS).toContain('--drift-r')
  })

  it('animates in the compositor-friendly properties only', () => {
    // Capture the keyframe's own braces. Any span-based slice is wrong here: the
    // stylesheet has `.reveal` rules that legitimately set `opacity` both in the base
    // rules and inside prefers-reduced-motion, so slicing from `@keyframes drift` to the
    // next @media — or to end-of-file — picks up an unrelated `opacity` and fails against
    // correct CSS. `from`/`to` nest one level, hence the inner brace alternative.
    const match = /@keyframes drift\s*\{(?:[^{}]|\{[^{}]*\})*\}/.exec(CSS)
    expect(match).not.toBeNull()
    const block = match[0]
    // opacity is static per piece by design; animating it on 20 elements repaints
    // every frame and drops frames on low-end mobile.
    expect(block).not.toContain('opacity')
    expect(block).not.toContain('filter')
  })

  it('runs infinitely and alternately, so a piece returns to its origin', () => {
    expect(CSS).toMatch(/\.animate-drift\s*\{[^}]*infinite alternate/)
  })

  it('is disabled under prefers-reduced-motion', () => {
    const media = CSS.slice(CSS.indexOf('@media (prefers-reduced-motion: reduce)'))
    expect(media).toContain('.animate-drift')
  })

  it('promotes nothing to its own layer', () => {
    expect(CSS).not.toContain('will-change')
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/test/index-css.test.jsx`
Expected: FAIL — `@keyframes drift` is absent.

- [ ] **Step 3: Add the keyframe and class**

In `src/index.css`, insert after the `.animate-badge-pulse` rule at line 49:

```css
/* One keyframe serves all 20 pieces. Amplitude arrives per piece through the custom
   properties read below; duration and delay are set inline and override this shorthand.
   A piece's base rotation uses the individual `rotate` property rather than `transform`,
   because CSS applies rotate before transform and so the two compose instead of the
   animation overwriting the base on every frame. */
@keyframes drift {
  from {
    transform: translate3d(0, 0, 0) rotate(0deg);
  }
  to {
    transform: translate3d(var(--drift-x, 8px), var(--drift-y, -6px), 0)
      rotate(var(--drift-r, 3deg));
  }
}

.animate-drift {
  animation: drift 30s ease-in-out infinite alternate;
}
```

- [ ] **Step 4: Wire it into the existing reduced-motion block**

In `src/index.css:85-88`, change:

```css
  .animate-marquee,
  .animate-badge-pulse {
    animation: none;
  }
```

to:

```css
  .animate-drift,
  .animate-marquee,
  .animate-badge-pulse {
    animation: none;
  }
```

Keep `.animate-drift` first so the list stays alphabetical.

- [ ] **Step 5: Run the test to verify it passes**

Run: `npx vitest run src/test/index-css.test.jsx`
Expected: PASS, 6 tests.

- [ ] **Step 6: Commit**

```bash
git add src/index.css src/test/index-css.test.jsx
git commit -m "feat(css): add the drift keyframe and honour reduced motion"
```

---

### Task 4: The `SpiceField` component

**Files:**
- Create: `src/components/SpiceField.jsx`
- Test: `src/test/SpiceField.test.jsx`

**Interfaces:**
- Consumes: the ten motif components and `attrs`' `solid` prop (Tasks 1–2); `.animate-drift` and the `--drift-*` properties (Task 3).
- Produces: `SpiceField` — no props. Renders one `div[aria-hidden="true"]` containing exactly 20 `svg.animate-drift` children.

- [ ] **Step 1: Write the failing test**

Create `src/test/SpiceField.test.jsx`:

```jsx
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SpiceField } from '../components/SpiceField.jsx'
import { PIECES, MOTIFS } from '../components/SpiceField.jsx'

function renderField() {
  const { container } = render(<SpiceField />)
  return { layer: container.firstChild, pieces: container.querySelectorAll('svg.animate-drift') }
}

describe('SpiceField', () => {
  it('renders exactly the 20 seeded pieces', () => {
    const { pieces } = renderField()
    expect(PIECES).toHaveLength(20)
    expect(pieces).toHaveLength(PIECES.length)
  })

  it('hides the whole layer from assistive technology', () => {
    // A decorative field read aloud is a real accessibility failure, and no other
    // test in the suite would catch it.
    const { layer } = renderField()
    expect(layer).toHaveAttribute('aria-hidden', 'true')
  })

  it('never intercepts a click', () => {
    const { layer } = renderField()
    expect(layer).toHaveAttribute('class')
    expect(layer.className).toContain('pointer-events-none')
  })

  it('clips its own pieces so nothing widens the document', () => {
    const { layer } = renderField()
    expect(layer.className).toContain('overflow-hidden')
  })

  it('resolves every seeded motif to a real component', () => {
    // A typo'd motif key would make Motif undefined and React would throw. Assert the
    // lookup directly so the failure names the key instead of just "Element type is
    // invalid".
    for (const piece of PIECES) {
      expect(MOTIFS[piece.motif], `unknown motif "${piece.motif}"`).toBeTypeOf('function')
    }
  })

  it('uses only palette tones that exist in the stylesheet', () => {
    const tones = [...new Set(PIECES.map((piece) => piece.tone))]
    expect([...tones].sort()).toEqual(['ink', 'marigold', 'maroon', 'turmeric'])
  })

  it('sizes each piece inline and never through a Tailwind class', () => {
    // base carries className 'h-12 w-12'; passing className replaces it wholesale
    // rather than merging, so the inline width and height are the only sizing.
    const { pieces } = renderField()
    for (const svg of pieces) {
      expect(svg).toHaveAttribute('width')
      expect(svg).toHaveAttribute('height')
    }
  })

  it('keeps every opacity static and inside the legible band', () => {
    for (const piece of PIECES) {
      expect(piece.opacity).toBeGreaterThanOrEqual(0.1)
      expect(piece.opacity).toBeLessThanOrEqual(0.18)
    }
    const { pieces } = renderField()
    for (const svg of pieces) {
      expect(svg.style.animationName).toBe('')
      expect(svg.style.opacity).not.toBe('')
    }
  })

  it('varies the drift instead of moving every piece in lockstep', () => {
    const durations = new Set(PIECES.map((piece) => piece.duration))
    const delays = new Set(PIECES.map((piece) => piece.delay))
    expect(durations.size).toBeGreaterThan(8)
    expect(delays.size).toBeGreaterThan(8)
  })

  it('keeps every piece inside the viewport', () => {
    for (const piece of PIECES) {
      expect(piece.x).toBeGreaterThanOrEqual(0)
      expect(piece.x).toBeLessThanOrEqual(100)
      expect(piece.y).toBeGreaterThanOrEqual(0)
      expect(piece.y).toBeLessThanOrEqual(100)
    }
  })

  it('keeps drift amplitude, duration and rotation in the specified range', () => {
    for (const piece of PIECES) {
      expect(Math.abs(parseFloat(piece.driftX))).toBeGreaterThanOrEqual(4)
      expect(Math.abs(parseFloat(piece.driftX))).toBeLessThanOrEqual(10)
      expect(Math.abs(parseFloat(piece.driftY))).toBeGreaterThanOrEqual(4)
      expect(Math.abs(parseFloat(piece.driftY))).toBeLessThanOrEqual(10)
      expect(Math.abs(parseFloat(piece.driftR))).toBeGreaterThanOrEqual(1)
      expect(Math.abs(parseFloat(piece.driftR))).toBeLessThanOrEqual(3)
      expect(piece.duration).toBeGreaterThanOrEqual(20)
      expect(piece.duration).toBeLessThanOrEqual(40)
    }
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/test/SpiceField.test.jsx`
Expected: FAIL — the module does not exist.

- [ ] **Step 3: Write the component**

Create `src/components/SpiceField.jsx`:

```jsx
import {
  Almond,
  BayLeaf,
  Cardamom,
  Cashew,
  Chilli,
  Cinnamon,
  Clove,
  Pepper,
  Raisin,
  StarAnise,
} from './SpiceMotif.jsx'

export const MOTIFS = {
  almond: Almond,
  bayLeaf: BayLeaf,
  cardamom: Cardamom,
  cashew: Cashew,
  chilli: Chilli,
  cinnamon: Cinnamon,
  clove: Clove,
  pepper: Pepper,
  raisin: Raisin,
  starAnise: StarAnise,
}

// Written out rather than generated at random, deliberately: a random field cannot be
// asserted in a test and cannot be reviewed, so a defect would not be reproducible.
// x/y are viewport percentages so the field reflows with width instead of crowding one
// edge on a wide screen. opacity is static per piece and never animated.
export const PIECES = [
  { motif: 'starAnise', x: 4, y: 8, size: 46, rotate: 12, opacity: 0.14, duration: 34, delay: -3, tone: 'marigold', driftX: '9px', driftY: '-7px', driftR: '2deg' },
  { motif: 'chilli', x: 88, y: 7, size: 54, rotate: -22, opacity: 0.12, duration: 28, delay: -11, tone: 'maroon', driftX: '-8px', driftY: '6px', driftR: '-3deg' },
  { motif: 'clove', x: 10, y: 26, size: 40, rotate: 8, opacity: 0.16, duration: 31, delay: -6, tone: 'ink', driftX: '7px', driftY: '8px', driftR: '3deg' },
  { motif: 'cardamom', x: 84, y: 24, size: 42, rotate: 15, opacity: 0.13, duration: 37, delay: -18, tone: 'turmeric', driftX: '-6px', driftY: '-9px', driftR: '3deg' },
  { motif: 'bayLeaf', x: 3, y: 44, size: 50, rotate: -14, opacity: 0.12, duration: 29, delay: -9, tone: 'marigold', driftX: '10px', driftY: '-5px', driftR: '-1deg' },
  { motif: 'cinnamon', x: 90, y: 42, size: 44, rotate: 10, opacity: 0.15, duration: 35, delay: -22, tone: 'maroon', driftX: '-9px', driftY: '7px', driftR: '1deg' },
  { motif: 'almond', x: 14, y: 62, size: 38, rotate: -9, opacity: 0.17, duration: 26, delay: -14, tone: 'ink', driftX: '6px', driftY: '-8px', driftR: '-2deg' },
  { motif: 'raisin', x: 82, y: 60, size: 36, rotate: 18, opacity: 0.14, duration: 33, delay: -5, tone: 'ink', driftX: '-7px', driftY: '9px', driftR: '2deg' },
  { motif: 'pepper', x: 5, y: 78, size: 34, rotate: -6, opacity: 0.18, duration: 24, delay: -19, tone: 'ink', driftX: '8px', driftY: '6px', driftR: '-3deg' },
  { motif: 'cashew', x: 90, y: 76, size: 44, rotate: 24, opacity: 0.12, duration: 30, delay: -8, tone: 'turmeric', driftX: '-10px', driftY: '-4px', driftR: '3deg' },
  { motif: 'starAnise', x: 22, y: 16, size: 30, rotate: -18, opacity: 0.1, duration: 38, delay: -27, tone: 'marigold', driftX: '7px', driftY: '9px', driftR: '-1deg' },
  { motif: 'chilli', x: 76, y: 88, size: 38, rotate: 30, opacity: 0.11, duration: 27, delay: -16, tone: 'maroon', driftX: '-6px', driftY: '-7px', driftR: '1deg' },
  { motif: 'clove', x: 26, y: 88, size: 32, rotate: -12, opacity: 0.13, duration: 32, delay: -12, tone: 'ink', driftX: '9px', driftY: '-6px', driftR: '-2deg' },
  { motif: 'cardamom', x: 16, y: 36, size: 34, rotate: 6, opacity: 0.15, duration: 36, delay: -21, tone: 'marigold', driftX: '-8px', driftY: '10px', driftR: '2deg' },
  { motif: 'bayLeaf', x: 78, y: 14, size: 36, rotate: -25, opacity: 0.11, duration: 25, delay: -7, tone: 'turmeric', driftX: '6px', driftY: '-9px', driftR: '2deg' },
  { motif: 'cinnamon', x: 8, y: 55, size: 36, rotate: 16, opacity: 0.14, duration: 39, delay: -30, tone: 'maroon', driftX: '-10px', driftY: '5px', driftR: '-3deg' },
  { motif: 'almond', x: 86, y: 52, size: 34, rotate: -7, opacity: 0.16, duration: 28, delay: -10, tone: 'ink', driftX: '8px', driftY: '7px', driftR: '3deg' },
  { motif: 'raisin', x: 30, y: 72, size: 30, rotate: 20, opacity: 0.11, duration: 34, delay: -25, tone: 'ink', driftX: '-7px', driftY: '-9px', driftR: '-1deg' },
  { motif: 'pepper', x: 72, y: 34, size: 30, rotate: 11, opacity: 0.13, duration: 31, delay: -4, tone: 'marigold', driftX: '9px', driftY: '-7px', driftR: '1deg' },
  { motif: 'cashew', x: 18, y: 48, size: 32, rotate: -16, opacity: 0.1, duration: 36, delay: -17, tone: 'turmeric', driftX: '-6px', driftY: '8px', driftR: '-2deg' },
]

// Tailwind scans source text for whole class names, so a tone must be spelled out in
// full here. `text-${tone}` would produce a class that exists in no stylesheet, and the
// pieces would render with the inherited body colour.
const TONES = {
  ink: 'text-ink',
  marigold: 'text-marigold',
  maroon: 'text-maroon',
  turmeric: 'text-turmeric',
}

export function SpiceField() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      {PIECES.map((piece, index) => {
        const Motif = MOTIFS[piece.motif]
        return (
          <Motif
            key={index}
            solid
            className={`animate-drift absolute ${TONES[piece.tone]}`}
            style={{
              left: `${piece.x}%`,
              top: `${piece.y}%`,
              width: piece.size,
              height: piece.size,
              opacity: piece.opacity,
              // Base rotation rides the individual `rotate` property, which CSS applies
              // before `transform`, so the keyframe composes with it instead of
              // replacing it every frame.
              rotate: `${piece.rotate}deg`,
              animationDuration: `${piece.duration}s`,
              animationDelay: `${piece.delay}s`,
              '--drift-x': piece.driftX,
              '--drift-y': piece.driftY,
              '--drift-r': piece.driftR,
            }}
          />
        )
      })}
    </div>
  )
}
```

- [ ] **Step 4: Verify the built CSS actually contains the tone classes**

Tailwind generates classes by scanning source text, so a runtime-built class name can be
missing from the output with no error anywhere. Confirm the real artifact:

Run: `npm run build && grep -o 'text-marigold\|text-turmeric\|text-maroon\|text-ink' dist/assets/*.css | sort -u`
Expected: all four class names present.

- [ ] **Step 5: Run the test to verify it passes**

Run: `npx vitest run src/test/SpiceField.test.jsx`
Expected: PASS — 11 tests.

- [ ] **Step 6: Lint**

Run: `npm run lint`
Expected: clean.

- [ ] **Step 7: Commit**

```bash
git add src/components/SpiceField.jsx src/test/SpiceField.test.jsx
git commit -m "feat(field): place 20 seeded masala pieces on a fixed drifting layer"
```

---

### Task 5: Mount the field and lift the content above it

A `fixed` element with `z-0` paints **above** static content in the same stacking
context, because positioned elements paint after in-flow content. `main` and `Footer` are
currently static, so without this change the field would cover the whole page while still
letting it be clicked — a bug that looks like blank content until something is tapped.

**Files:**
- Modify: `src/App.jsx` (import block, and the `<main>` and `<SpiceField />` lines)
- Modify: `src/components/Footer.jsx:7`
- Test: `src/test/SpiceField.test.jsx`

**Interfaces:**
- Consumes: `SpiceField` (Task 4).
- Produces: no new exports.

- [ ] **Step 1: Write the failing test**

Append to `src/test/SpiceField.test.jsx`. Add `import App from '../App.jsx'` to the top
import block first — do not add a second import line from the same module.

```jsx
describe('the field in the page', () => {
  it('mounts the field as a sibling above the content stack', () => {
    const { container } = render(<App />)
    const layer = container.querySelector('div[aria-hidden="true"].pointer-events-none')
    expect(layer).not.toBeNull()
    // LanguageProvider renders no DOM wrapper, so the container is the field's real
    // parent. The field must be a sibling of main, not a child of it: a child would
    // break the section-order assertion in App.test.jsx and would clip against main's
    // own stacking context.
    expect(layer.parentElement).toBe(container)
    expect(layer.parentElement).not.toBe(container.querySelector('main'))
  })

  it('lifts main above the field', () => {
    const { container } = render(<App />)
    const main = container.querySelector('main')
    expect(main.className).toContain('relative')
    expect(main.className).toContain('z-10')
  })

  it('lifts the footer above the field', () => {
    // The footer is an opaque dark band. Left static, pieces would drift across it.
    const { container } = render(<App />)
    const footer = container.querySelector('footer')
    expect(footer.className).toContain('relative')
    expect(footer.className).toContain('z-10')
  })

  it('leaves the sticky bar and the floating button above both', () => {
    const { container } = render(<App />)
    expect(container.querySelector('header').className).toContain('z-40')
    expect(container.querySelector('a[tabindex="-1"]').className).toContain('z-50')
  })

  it('does not add the field to the page section order', () => {
    const { container } = render(<App />)
    const order = [...container.querySelectorAll('header, main > *, footer')].map((node) =>
      node.tagName.toLowerCase(),
    )
    expect(order).toEqual([
      'header',
      'section',
      'div',
      'section',
      'section',
      'section',
      'footer',
    ])
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/test/SpiceField.test.jsx`
Expected: FAIL — no `.pointer-events-none` layer is mounted.

- [ ] **Step 3: Mount the field in `App.jsx`**

In `src/App.jsx`, add one import line. The existing block runs Categories, Enquiry,
Footer, Hero, Marquee, TopBar, Trust, WhatsAppFab, LanguageProvider — so `SpiceField`
belongs on a new line between `Marquee` and `TopBar`:

```jsx
import { Marquee } from './components/Marquee.jsx'
import { SpiceField } from './components/SpiceField.jsx'
import { TopBar } from './components/TopBar.jsx'
```

Add exactly that one line; leave the other imports in their current order.

Then change the returned JSX so the field is a sibling of `<main>`, not a child, and lift
`main`:

```jsx
  return (
    <LanguageProvider>
      <SpiceField />
      <TopBar />
      <main className="relative z-10">
        <Hero />
        <Marquee />
        <Categories />
        <Trust />
        <Enquiry />
      </main>
      <Footer />
      <WhatsAppFab />
    </LanguageProvider>
  )
```

- [ ] **Step 4: Lift the footer**

In `src/components/Footer.jsx:7`, change the className to include both classes:

```jsx
    <footer className="relative z-10 bg-ink px-4 pb-28 pt-14 text-cashew sm:pb-28">
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npx vitest run src/test/SpiceField.test.jsx`
Expected: PASS — 16 tests.

- [ ] **Step 6: Run the whole suite**

Run: `npm test`
Expected: PASS. `App.test.jsx:26-42` asserts the exact `header, main > *, footer` order;
the field is a sibling of `main`, so it is not matched by that selector and the assertion
is unchanged.

- [ ] **Step 7: Lint and build**

Run: `npm run lint && npm run build`
Expected: both clean.

- [ ] **Step 8: Confirm the transfer-size budget from spec §7**

The spec caps this feature's added markup and CSS at 8 KB uncompressed. Measure the whole
feature, not just this task: stashing would revert only `App.jsx` and `Footer.jsx`, leaving
the Tasks 1–3 motifs and keyframe inside the "baseline" and understating the cost. The
sibling checkout of `main` is the true pre-feature tree and already has `node_modules`.

Run:
```bash
(cd /home/tony/Desktop/Rajbaan && npm run build >/dev/null \
  && cat dist/assets/*.js dist/assets/*.css | wc -c)
npm run build >/dev/null && cat dist/assets/*.js dist/assets/*.css | wc -c
```
Expected: the second number exceeds the first by well under 8192 bytes. If it does not,
the seed or the path data has grown — trim before continuing rather than raising the cap.

- [ ] **Step 9: Commit**

```bash
git add src/App.jsx src/components/Footer.jsx src/test/SpiceField.test.jsx
git commit -m "feat: mount the spice field and lift content above it"
```

---

### Task 6: Document the field in the base spec

**Files:**
- Modify: `docs/superpowers/specs/2026-09-26-rajbaan-coming-soon-design.md`

- [ ] **Step 1: Add the component to the file map**

In the file-structure list, add a row after the `src/components/` grouping:

```markdown
src/components/SpiceField.jsx      decorative animated masala background layer
```

- [ ] **Step 2: Note the field in section 4.2**

Append to the end of the Hero bullet in §4.2:

```markdown
- **Spice field:** `SpiceField` renders 20 hand-drawn masala and dry-fruit pieces on one
  fixed `z-0` layer behind the page, drifting on a single transform-only keyframe. It is
  `aria-hidden` and `pointer-events-none`; `main` and the footer are lifted to
  `relative z-10` so it can never paint over content. Fully specified in
  `2026-09-30-spice-field-background-design.md`.
```

- [ ] **Step 3: Commit**

```bash
git add docs/superpowers/specs/2026-09-26-rajbaan-coming-soon-design.md
git commit -m "docs: record the spice field in the base spec"
```

---

## Manual Verification Required

The implementing agent cannot see images or the rendered page. Every claim below is
unverified by design and is a human's to confirm on a real page:

1. All ten motifs are recognisable at their rendered sizes, 28–54 px.
2. Opacity in the 0.10–0.18 band is subtle rather than absent — and the enquiry form and
   contact buttons still clear 4.5:1 against whatever drifts beneath them.
3. The drift reads as ambient, not distracting, over a 30-second watch.
4. Pieces never appear over the dark footer band.
5. Under `prefers-reduced-motion: reduce`, the pieces still render, statically.

```bash
npm run dev
```

Then open the page and watch the hero for 30 seconds, and re-enable the OS-level
"reduce motion" setting to check item 5.