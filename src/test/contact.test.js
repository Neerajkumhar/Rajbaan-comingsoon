import { describe, expect, it } from 'vitest'
import { PHONE_DIGITS, TEL_HREF, WHATSAPP_HREF, WHATSAPP_MESSAGE } from '../contact.js'

describe('contact links', () => {
  it('holds the number once, as 10 national digits', () => {
    expect(PHONE_DIGITS).toBe('9216487878')
  })

  it('builds a wa.me link in international form', () => {
    expect(WHATSAPP_HREF.startsWith('https://wa.me/919216487878?text=')).toBe(true)
  })

  it('url-encodes the prefilled message into the wa.me link', () => {
    expect(WHATSAPP_HREF).toContain(encodeURIComponent(WHATSAPP_MESSAGE))
    expect(WHATSAPP_HREF).not.toContain(' ')
  })

  it('builds a tel link in international form', () => {
    expect(TEL_HREF).toBe('tel:+919216487878')
  })
})
