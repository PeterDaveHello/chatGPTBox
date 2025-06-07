import { describe, it, expect } from 'vitest'
import { endsWithQuestionMark } from '../src/utils/ends-with-question-mark.mjs'

describe('endsWithQuestionMark', () => {
  it('detects ASCII question mark', () => {
    expect(endsWithQuestionMark('hello?')).toBe(true)
  })

  it('detects Chinese question mark', () => {
    expect(endsWithQuestionMark('你好？')).toBe(true)
  })

  it('detects Arabic question mark', () => {
    expect(endsWithQuestionMark('مرحبا؟')).toBe(true)
  })

  it('returns false when no question mark', () => {
    expect(endsWithQuestionMark('hello')).toBe(false)
  })
})
