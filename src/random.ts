import { Faker, fakerEN, SimpleFaker } from '@faker-js/faker'
import RandExp from 'randexp'

let faker: Faker = fakerEN
let shouldSeed = false
let _seedValue: number | undefined

export function installFaker(fakerInstance: Faker): void {
  faker = fakerInstance
}

// https://github.com/faker-js/faker/issues/448
// TODO: create standalone faker instead of use following workaround
export const runFake = <Runner extends (faker: Faker) => any>(
  runner: Awaited<ReturnType<Runner>> extends ReturnType<Runner> ? Runner : never,
): ReturnType<Runner> => {
  if (shouldSeed) {
    faker.seed(_seedValue)
  }

  const result = runner(faker)
  if (result instanceof Promise) {
    throw new SyntaxError('InternalError: runFake cannot be used with async functions')
  }

  return result
}

const simpleFaker = new SimpleFaker()
export const randexp = (pattern: string | RegExp, flags?: string): string => {
  if (shouldSeed) {
    simpleFaker.seed(_seedValue)
  }

  const randexp = new RandExp(pattern, flags)
  randexp.randInt = (from, to) => simpleFaker.number.int({ min: from, max: to })
  return randexp.gen()
}

/**
 * sets the seed to use.
 */
export const seed = (value?: number): void => {
  shouldSeed = true
  _seedValue = value
}

/**
 * @internal
 */
export const resetSeed = (): void => {
  shouldSeed = false
}
