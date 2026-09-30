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
