import { PHONE_DIGITS, TEL_HREF, WHATSAPP_HREF } from '../contact.js'
import { useLanguage } from '../LanguageContext.jsx'

const SIZES = {
  md: 'min-h-12 px-5 text-sm',
  lg: 'min-h-14 px-7 text-base',
}

export function ContactButtons({ size = 'md', className = '' }) {
  const { t } = useLanguage()
  const sizing = SIZES[size]

  return (
    <div className={`flex flex-col gap-3 sm:flex-row sm:items-center ${className}`}>
      <a
        href={WHATSAPP_HREF}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t('buttons.whatsappAria')}
        className={`inline-flex items-center justify-center gap-2 rounded-full bg-whatsapp-deep font-semibold text-white shadow-sm transition hover:brightness-95 ${sizing}`}
      >
        <WhatsAppGlyph />
        {t('buttons.whatsapp')}
      </a>
      <a
        href={TEL_HREF}
        className={`inline-flex items-center justify-center gap-2 rounded-full border-2 border-ink font-semibold text-ink transition hover:bg-ink hover:text-cashew ${sizing}`}
      >
        <PhoneGlyph />
        {t('buttons.call')} {PHONE_DIGITS}
      </a>
    </div>
  )
}

function WhatsAppGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-5 w-5">
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.3 14.1c-.2.6-1.2 1.2-1.7 1.2-.5.1-1 .1-1.7-.1a12 12 0 0 1-5.6-4.9c-.4-.7-.9-1.6-.9-2.4 0-.8.5-1.2.7-1.4.2-.2.4-.2.6-.2h.4c.2 0 .4 0 .6.5l.8 1.9c.1.2 0 .4-.1.5l-.4.5c-.1.2-.3.3-.1.6.4.7 1.3 1.6 2.1 2 .3.2.5.1.6-.1l.6-.7c.2-.2.3-.2.6-.1l1.8.9c.3.1.5.2.5.4.1.2.1.7-.1 1.3Z" />
    </svg>
  )
}

function PhoneGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
      className="h-5 w-5"
    >
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z" />
    </svg>
  )
}
