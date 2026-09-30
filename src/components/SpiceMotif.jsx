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

export function StarAnise({ solid, ...props }) {
  return (
    <svg {...attrs({ solid, ...props })}>
      <circle cx="24" cy="24" r="4" />
      {Array.from({ length: 8 }, (_, i) => {
        const angle = (i * Math.PI) / 4
        const x = 24 + Math.cos(angle) * 13
        const y = 24 + Math.sin(angle) * 13
        return <circle key={i} cx={x} cy={y} r="5" />
      })}
    </svg>
  )
}

export function Chilli({ solid, ...props }) {
  return (
    <svg {...attrs({ solid, ...props })}>
      <path d="M26 10c6 4 8 12 4 19-4 7-13 9-19 4" />
      <path d="M26 10c0-3 2-5 5-5" />
      <path d="M13 31c4 2 9 1 12-2" />
    </svg>
  )
}

export function Cashew({ solid, ...props }) {
  return (
    <svg {...attrs({ solid, ...props })}>
      <path d="M14 34c-4-8 0-19 9-22 8-3 16 2 15 10-1 7-9 8-13 4-3-3 0-8 5-8" />
      <path d="M14 34c3 3 8 4 12 2" />
    </svg>
  )
}
