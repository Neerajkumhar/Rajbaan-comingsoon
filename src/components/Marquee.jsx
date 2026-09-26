import { useLanguage } from '../LanguageContext.jsx'

export function Marquee() {
  const { t } = useLanguage()
  const items = t('marquee')
  const track = [...items, ...items]

  return (
    <div
      aria-hidden="true"
      className="overflow-hidden border-y-2 border-marigold/40 bg-maroon py-3"
    >
      <div className="animate-marquee flex w-max items-center whitespace-nowrap">
        {track.map((item, index) => (
          <span
            key={index}
            className="flex items-center pr-8 font-display text-lg text-marigold"
          >
            {item}
            <span className="pl-8 text-marigold/60">•</span>
          </span>
        ))}
      </div>
    </div>
  )
}
