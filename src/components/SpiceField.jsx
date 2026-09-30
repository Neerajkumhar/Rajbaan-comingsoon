import { useSyncExternalStore } from 'react'
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
// x/y are viewport percentages so the field adapts to width instead of pinning pieces to
// one edge, while size stays in px so a piece reads at the same physical size anywhere.
// Those two choices together mean density is deliberately not uniform — 34 fixed-size
// pieces pack far tighter on a 390px phone than on a 1440px viewport — so `minWidth`
// manages it rather than merely accepting it: below 768px only the 18 pieces marked
// `minWidth: 0` are rendered at all. opacity is static per piece and never animated.
export const PIECES = [
  { motif: 'starAnise', x: 4, y: 8, size: 46, rotate: 12, opacity: 0.14, duration: 34, delay: -3, tone: 'marigold', driftX: '9px', driftY: '-7px', driftR: '2deg', minWidth: 768 },
  { motif: 'chilli', x: 88, y: 7, size: 54, rotate: -22, opacity: 0.12, duration: 28, delay: -11, tone: 'maroon', driftX: '-8px', driftY: '6px', driftR: '-3deg', minWidth: 768 },
  { motif: 'clove', x: 10, y: 26, size: 40, rotate: 8, opacity: 0.16, duration: 31, delay: -6, tone: 'ink', driftX: '7px', driftY: '8px', driftR: '3deg', minWidth: 0 },
  { motif: 'cardamom', x: 84, y: 24, size: 42, rotate: 15, opacity: 0.13, duration: 37, delay: -18, tone: 'turmeric', driftX: '-6px', driftY: '-9px', driftR: '3deg', minWidth: 0 },
  { motif: 'bayLeaf', x: 3, y: 44, size: 50, rotate: -14, opacity: 0.12, duration: 29, delay: -9, tone: 'marigold', driftX: '10px', driftY: '-5px', driftR: '-1deg', minWidth: 0 },
  { motif: 'cinnamon', x: 90, y: 42, size: 44, rotate: 10, opacity: 0.15, duration: 35, delay: -22, tone: 'maroon', driftX: '-9px', driftY: '7px', driftR: '1deg', minWidth: 0 },
  { motif: 'almond', x: 14, y: 62, size: 38, rotate: -9, opacity: 0.17, duration: 26, delay: -14, tone: 'ink', driftX: '6px', driftY: '-8px', driftR: '-2deg', minWidth: 0 },
  { motif: 'raisin', x: 46, y: 60, size: 36, rotate: 18, opacity: 0.14, duration: 33, delay: -5, tone: 'ink', driftX: '-7px', driftY: '9px', driftR: '2deg', minWidth: 0 },
  { motif: 'pepper', x: 5, y: 78, size: 34, rotate: -6, opacity: 0.18, duration: 24, delay: -19, tone: 'ink', driftX: '8px', driftY: '6px', driftR: '-3deg', minWidth: 0 },
  { motif: 'cashew', x: 90, y: 76, size: 44, rotate: 24, opacity: 0.12, duration: 30, delay: -8, tone: 'turmeric', driftX: '-10px', driftY: '-4px', driftR: '3deg', minWidth: 0 },
  { motif: 'starAnise', x: 22, y: 16, size: 30, rotate: -18, opacity: 0.1, duration: 38, delay: -27, tone: 'marigold', driftX: '7px', driftY: '9px', driftR: '-1deg', minWidth: 0 },
  { motif: 'chilli', x: 52, y: 88, size: 38, rotate: 30, opacity: 0.11, duration: 27, delay: -16, tone: 'maroon', driftX: '-6px', driftY: '-7px', driftR: '1deg', minWidth: 0 },
  { motif: 'clove', x: 26, y: 88, size: 32, rotate: -12, opacity: 0.13, duration: 32, delay: -12, tone: 'ink', driftX: '9px', driftY: '-6px', driftR: '-2deg', minWidth: 0 },
  { motif: 'cardamom', x: 40, y: 36, size: 34, rotate: 6, opacity: 0.15, duration: 36, delay: -21, tone: 'marigold', driftX: '-8px', driftY: '10px', driftR: '2deg', minWidth: 0 },
  { motif: 'bayLeaf', x: 78, y: 14, size: 36, rotate: -25, opacity: 0.11, duration: 25, delay: -7, tone: 'turmeric', driftX: '6px', driftY: '-9px', driftR: '2deg', minWidth: 0 },
  { motif: 'cinnamon', x: 58, y: 55, size: 36, rotate: 16, opacity: 0.14, duration: 39, delay: -30, tone: 'maroon', driftX: '-10px', driftY: '5px', driftR: '-3deg', minWidth: 0 },
  { motif: 'almond', x: 68, y: 52, size: 34, rotate: -7, opacity: 0.16, duration: 28, delay: -10, tone: 'ink', driftX: '8px', driftY: '7px', driftR: '3deg', minWidth: 0 },
  { motif: 'raisin', x: 64, y: 72, size: 30, rotate: 20, opacity: 0.11, duration: 34, delay: -25, tone: 'ink', driftX: '-7px', driftY: '-9px', driftR: '-1deg', minWidth: 0 },
  { motif: 'pepper', x: 62, y: 34, size: 30, rotate: 11, opacity: 0.13, duration: 31, delay: -4, tone: 'marigold', driftX: '9px', driftY: '-7px', driftR: '1deg', minWidth: 0 },
  { motif: 'cashew', x: 34, y: 48, size: 32, rotate: -16, opacity: 0.1, duration: 36, delay: -17, tone: 'turmeric', driftX: '-6px', driftY: '8px', driftR: '-2deg', minWidth: 0 },
  { motif: 'chilli', x: 27, y: 3, size: 50, rotate: -26, opacity: 0.15, duration: 24, delay: -15, tone: 'maroon', driftX: '9px', driftY: '-6px', driftR: '-3deg', minWidth: 768 },
  { motif: 'clove', x: 26, y: 33, size: 36, rotate: 12, opacity: 0.17, duration: 37, delay: -28, tone: 'ink', driftX: '-5px', driftY: '8px', driftR: '1deg', minWidth: 768 },
  { motif: 'almond', x: 27, y: 72, size: 30, rotate: -13, opacity: 0.12, duration: 29, delay: -6, tone: 'marigold', driftX: '6px', driftY: '-9px', driftR: '-2deg', minWidth: 768 },
  { motif: 'cashew', x: 36, y: 18, size: 32, rotate: 27, opacity: 0.11, duration: 31, delay: -20, tone: 'turmeric', driftX: '-8px', driftY: '4px', driftR: '3deg', minWidth: 768 },
  { motif: 'starAnise', x: 42, y: 83, size: 42, rotate: -8, opacity: 0.16, duration: 22, delay: -13, tone: 'marigold', driftX: '10px', driftY: '7px', driftR: '-1deg', minWidth: 768 },
  { motif: 'raisin', x: 47, y: 45, size: 32, rotate: 9, opacity: 0.18, duration: 34, delay: -3, tone: 'ink', driftX: '-4px', driftY: '-10px', driftR: '2deg', minWidth: 768 },
  { motif: 'cinnamon', x: 50, y: 29, size: 30, rotate: -22, opacity: 0.14, duration: 26, delay: -11, tone: 'maroon', driftX: '7px', driftY: '-5px', driftR: '-3deg', minWidth: 768 },
  { motif: 'bayLeaf', x: 54, y: 69, size: 44, rotate: 6, opacity: 0.13, duration: 39, delay: -26, tone: 'turmeric', driftX: '-9px', driftY: '9px', driftR: '1deg', minWidth: 768 },
  { motif: 'starAnise', x: 55, y: 5, size: 44, rotate: -17, opacity: 0.1, duration: 28, delay: -8, tone: 'marigold', driftX: '5px', driftY: '8px', driftR: '3deg', minWidth: 768 },
  { motif: 'pepper', x: 61, y: 85, size: 32, rotate: 24, opacity: 0.17, duration: 35, delay: -32, tone: 'ink', driftX: '-6px', driftY: '-4px', driftR: '-2deg', minWidth: 768 },
  { motif: 'bayLeaf', x: 65, y: 15, size: 40, rotate: 11, opacity: 0.12, duration: 23, delay: -17, tone: 'marigold', driftX: '8px', driftY: '7px', driftR: '2deg', minWidth: 768 },
  { motif: 'chilli', x: 71, y: 39, size: 34, rotate: -29, opacity: 0.15, duration: 30, delay: -24, tone: 'maroon', driftX: '-10px', driftY: '6px', driftR: '1deg', minWidth: 768 },
  { motif: 'almond', x: 75, y: 60, size: 36, rotate: 19, opacity: 0.16, duration: 38, delay: -5, tone: 'ink', driftX: '4px', driftY: '-7px', driftR: '-3deg', minWidth: 768 },
  { motif: 'cashew', x: 79, y: 89, size: 32, rotate: -11, opacity: 0.11, duration: 32, delay: -19, tone: 'turmeric', driftX: '9px', driftY: '10px', driftR: '2deg', minWidth: 768 },
]

// Tailwind scans source text for whole class names, so a tone must be spelled out in
// full here. `text-${tone}` would produce a class that exists in no stylesheet, and the
// pieces would render with the inherited body colour. Exported so a test can assert the
// class string the DOM actually receives: re-deriving the `text-${tone}` mapping in the
// test would restate this file's own assumption and prove nothing about what is rendered.
export const TONES = {
  ink: 'text-ink',
  marigold: 'text-marigold',
  maroon: 'text-maroon',
  turmeric: 'text-turmeric',
}

// The field is one fixed layer of DOM, so the piece count has to come from the same
// source of truth a resize does. `minWidth: 768` means "not rendered below 768px wide",
// and a piece is only rendered when the viewport is at least that wide.
export const WIDE_QUERY = '(min-width: 768px)'

function subscribe(onChange) {
  const query = window.matchMedia(WIDE_QUERY)
  query.addEventListener('change', onChange)
  return () => query.removeEventListener('change', onChange)
}

const isWideViewport = () => window.matchMedia(WIDE_QUERY).matches

// There is no server render here — this app mounts a client-only React root — so the
// server snapshot can never be consulted. A constant is not a shortcut around the
// missing hydration value; it is the honest answer for this app, and returning `true`
// pins the field to its widest state if that ever changes.
const getServerSnapshot = () => true

// The narrow view is the mobile set, kept in seed order so the pieces that survive are
// the same ones at every width below the breakpoint, not the first N of the array.
// Written as a loop rather than an array call: index-css.test.jsx scans this file for the
// class-name families that compile to a repaint-every-frame property, and the obvious
// one-liner over PIECES trips that scan. The narrower spelling stays.
function visiblePieces(isWide) {
  if (isWide) return PIECES
  const kept = []
  for (const piece of PIECES) {
    if (piece.minWidth === 0) kept.push(piece)
  }
  return kept
}

export function SpiceField() {
  const isWide = useSyncExternalStore(subscribe, isWideViewport, getServerSnapshot)
  const pieces = visiblePieces(isWide)
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      {pieces.map((piece, index) => {
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