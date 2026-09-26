import { describe, expect, it } from 'vitest'
import { content, LANGUAGES } from '../content.js'

function keysOf(object, prefix = '') {
  return Object.entries(object).flatMap(([key, value]) =>
    value && typeof value === 'object'
      ? keysOf(value, `${prefix}${key}.`)
      : [`${prefix}${key}`],
  )
}

describe('content dictionary', () => {
  it('has exactly two locales', () => {
    expect(Object.keys(content).sort()).toEqual([...LANGUAGES].sort())
  })

  it('has the same keys in every locale', () => {
    const [reference, ...rest] = LANGUAGES
    const expected = keysOf(content[reference]).sort()
    for (const language of rest) {
      expect(keysOf(content[language]).sort()).toEqual(expected)
    }
  })

  it('has no empty strings', () => {
    for (const language of LANGUAGES) {
      for (const key of keysOf(content[language])) {
        const value = key
          .split('.')
          .reduce((node, part) => node[part], content[language])
        expect(String(value).trim(), `${language}.${key}`).not.toBe('')
      }
    }
  })
})
