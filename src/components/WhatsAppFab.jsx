import { WHATSAPP_HREF } from '../contact.js'

export function WhatsAppFab() {
  return (
    <a
      href={WHATSAPP_HREF}
      target="_blank"
      rel="noopener noreferrer"
      aria-hidden="true"
      tabIndex={-1}
      className="fixed right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-whatsapp-deep text-white shadow-xl shadow-ink/25 transition hover:brightness-95"
      style={{ bottom: 'calc(1rem + env(safe-area-inset-bottom))' }}
    >
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-7 w-7">
        <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.3 14.1c-.2.6-1.2 1.2-1.7 1.2-.5.1-1 .1-1.7-.1a12 12 0 0 1-5.6-4.9c-.4-.7-.9-1.6-.9-2.4 0-.8.5-1.2.7-1.4.2-.2.4-.2.6-.2h.4c.2 0 .4 0 .6.5l.8 1.9c.1.2 0 .4-.1.5l-.4.5c-.1.2-.3.3-.1.6.4.7 1.3 1.6 2.1 2 .3.2.5.1.6-.1l.6-.7c.2-.2.3-.2.6-.1l1.8.9c.3.1.5.2.5.4.1.2.1.7-.1 1.3Z" />
      </svg>
    </a>
  )
}
