import { PHONE_DIGITS } from '../contact.js'
import { useLanguage } from '../LanguageContext.jsx'
import { useReveal } from '../hooks/useReveal.js'
import { ContactButtons } from './ContactButtons.jsx'

export function Enquiry() {
  const { t } = useLanguage()
  const { ref, visible } = useReveal()

  return (
    <section className="bg-maroon px-4 py-16 text-cashew sm:py-20">
      <div
        ref={ref}
        className={`reveal mx-auto flex max-w-2xl flex-col items-center text-center ${visible ? 'is-visible' : ''}`}
      >
        <h2 className="font-display text-3xl leading-snug sm:text-4xl">
          {t('enquiry.headline')}
        </h2>
        <p className="mt-4 text-cashew/80">{t('enquiry.note')}</p>
        <p className="mt-8 font-display text-4xl leading-[1.45] tracking-wide text-marigold sm:text-5xl">
          {PHONE_DIGITS}
        </p>
        <ContactButtons size="lg" className="mt-8" />
      </div>
    </section>
  )
}
