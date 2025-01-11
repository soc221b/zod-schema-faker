import { Faker, faker as _faker } from '@faker-js/faker'
import RandExp from 'randexp'

let shouldSeed = false
let _seedValue: number | undefined

// https://github.com/faker-js/faker/issues/448
// TODO: create standalone faker instead of use following workaround
export const runFake = <Runner extends (faker: Faker) => any>(
  runner: Awaited<ReturnType<Runner>> extends ReturnType<Runner> ? Runner : never,
): ReturnType<Runner> => {
  if (shouldSeed) {
    _faker.seed(_seedValue)
  }

  const result = runner(_faker)
  if (result instanceof Promise) {
    throw new SyntaxError('InternalError: runFake cannot be used with async functions')
  }

  return result
}

export const randexp = (pattern: string | RegExp, flags?: string): string => {
  const randexp = new RandExp(pattern, flags)
  randexp.randInt = (from, to) => runFake(faker => faker.number.int({ min: from, max: to }))
  return randexp.gen()
}

/**
 * sets the seed to use.
 */
export const seed = (value?: number): void => {
  shouldSeed = true
  _seedValue = value
}

export const resetSeed = (): void => {
  shouldSeed = false
}
