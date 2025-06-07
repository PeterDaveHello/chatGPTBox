import { describe, it, expect } from 'vitest'
import { parseIntWithClamp } from '../src/utils/parse-int-with-clamp.mjs'
import { parseFloatWithClamp } from '../src/utils/parse-float-with-clamp.mjs'

describe('parseIntWithClamp', () => {
  it('returns number within range', () => {
    expect(parseIntWithClamp('10', 0, 1, 20)).toBe(10)
  })

  it('clamps to max value', () => {
    expect(parseIntWithClamp('30', 0, 1, 20)).toBe(20)
  })

  it('clamps to min value', () => {
    expect(parseIntWithClamp('0', 0, 1, 10)).toBe(1)
  })

  it('returns default when NaN', () => {
    expect(parseIntWithClamp('abc', 5, 1, 10)).toBe(5)
  })
})

describe('parseFloatWithClamp', () => {
  it('returns number within range', () => {
    expect(parseFloatWithClamp('3.14', 0, 0, 10)).toBeCloseTo(3.14)
  })

  it('clamps to max value', () => {
    expect(parseFloatWithClamp('99', 0, 0, 10)).toBe(10)
  })

  it('clamps to min value', () => {
    expect(parseFloatWithClamp('-1', 0, 0, 10)).toBe(0)
  })

  it('returns default when NaN', () => {
    expect(parseFloatWithClamp('bad', 1.5, 0, 10)).toBe(1.5)
  })
})
