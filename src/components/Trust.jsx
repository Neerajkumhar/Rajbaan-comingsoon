import { useLanguage } from '../LanguageContext.jsx'
import { useReveal } from '../hooks/useReveal.js'

export function Trust() {
  const { t } = useLanguage()
  const { ref, visible } = useReveal()

  return (
    <section className="bg-white px-4 py-16 sm:py-20">
      <div ref={ref} className={`reveal mx-auto max-w-5xl ${visible ? 'is-visible' : ''}`}>
        <h2 className="text-center font-display text-3xl leading-snug sm:text-4xl">
          {t('trust.title')}
        </h2>
        <ul className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {t('trust.items').map((item) => (
            <li key={item.title} className="text-center">
              <span
                aria-hidden="true"
                className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border-2 border-marigold text-lg font-bold text-maroon"
              >
                ✓
              </span>
              <h3 className="mt-4 font-semibold">{item.title}</h3>
              <p className="mt-1 text-sm text-ink/70">{item.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
