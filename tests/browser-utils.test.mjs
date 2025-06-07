import { describe, it, expect, beforeEach } from 'vitest'
import { isEdge } from '../src/utils/is-edge.mjs'
import { isSafari } from '../src/utils/is-safari.mjs'
import { isMobile } from '../src/utils/is-mobile.mjs'

function setNavigatorProperty(prop, value) {
  Object.defineProperty(globalThis.navigator, prop, {
    configurable: true,
    get() {
      return value
    },
  })
}

describe('browser utils', () => {
  beforeEach(() => {
    // reset navigator properties before each test
    setNavigatorProperty('userAgent', '')
    setNavigatorProperty('vendor', '')
    setNavigatorProperty('userAgentData', undefined)
  })

  it('detects Edge browser', () => {
    setNavigatorProperty('userAgent', 'Mozilla/5.0 Edg/90')
    expect(isEdge()).toBe(true)
  })

  it('detects Safari browser', () => {
    setNavigatorProperty('vendor', 'Apple Computer, Inc.')
    expect(isSafari()).toBe(true)
  })

  it('detects mobile user agent', () => {
    setNavigatorProperty(
      'userAgent',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15A372 Safari/604.1',
    )
    expect(isMobile()).toBe(true)
  })
})
