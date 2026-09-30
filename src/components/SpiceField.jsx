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
