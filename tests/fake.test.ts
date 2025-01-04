import { describe, expect, test } from 'vitest'
import { z } from 'zod'
import { fake, install } from '../src'
import { uninstall } from '../src/zod-type-kind-to-zod-type-faker'

describe('fake', () => {
  test('fake is a function', () => {
    expect(typeof fake).toBe('function')
  })

  test('fake should assert parameters', () => {
    expect(() => fake(undefined as any)).toThrow()
  })

  test('fake should accepts a ZodType schema', () => {
    install()
    expect(() => fake(z.number())).not.toThrow()
    uninstall()
  })

  test('fake should throw an error if not installed', () => {
    expect(() => fake(z.number())).toThrow()
  })
})
