import { useLanguage } from '../LanguageContext.jsx'
import { useReveal } from '../hooks/useReveal.js'
import { Cashew, Chilli, StarAnise } from './SpiceMotif.jsx'

const MOTIFS = { starAnise: StarAnise, chilli: Chilli, cashew: Cashew }

export function Categories() {
  const { t } = useLanguage()
  const { ref, visible } = useReveal()

  return (
    <section className="px-4 py-16 sm:py-20">
      <div ref={ref} className={`reveal mx-auto max-w-5xl ${visible ? 'is-visible' : ''}`}>
        <h2 className="text-center font-display text-3xl leading-snug sm:text-4xl">
          {t('categories.title')}
        </h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {t('categories.items').map((item) => {
            const Motif = MOTIFS[item.motif]
            return (
              <article
                key={item.title}
                className="rounded-2xl border border-marigold/30 bg-parchment p-8 text-center transition duration-200 motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-lg hover:shadow-ink/10"
              >
                <Motif className="mx-auto h-12 w-12 text-maroon" />
                <h3 className="mt-5 font-display text-xl">{item.title}</h3>
                <p className="mt-1 text-sm text-ink/70">{item.subtitle}</p>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
