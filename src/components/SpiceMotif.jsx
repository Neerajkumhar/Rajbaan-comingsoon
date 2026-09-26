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

export function StarAnise(props) {
  return (
    <svg {...base} {...props}>
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

export function Chilli(props) {
  return (
    <svg {...base} {...props}>
      <path d="M26 10c6 4 8 12 4 19-4 7-13 9-19 4" />
      <path d="M26 10c0-3 2-5 5-5" />
      <path d="M13 31c4 2 9 1 12-2" />
    </svg>
  )
}

export function Cashew(props) {
  return (
    <svg {...base} {...props}>
      <path d="M14 34c-4-8 0-19 9-22 8-3 16 2 15 10-1 7-9 8-13 4-3-3 0-8 5-8" />
      <path d="M14 34c3 3 8 4 12 2" />
    </svg>
  )
}
