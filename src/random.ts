import { Faker, fakerEN, SimpleFaker } from '@faker-js/faker'
import RandExp from 'randexp'

let faker: Faker = fakerEN

/**
 * Use given faker instance instead of the default one.
 *
 * @default fakerEN
 *
 * @see https://fakerjs.dev/guide/localization.html for more information.
 */
export function installFaker(fakerInstance: Faker): void {
  faker = fakerInstance
}

// https://github.com/faker-js/faker/issues/448
// TODO: create standalone faker instead of use following workaround
export const runFake = <Runner extends (faker: Faker) => any>(
  runner: Awaited<ReturnType<Runner>> extends ReturnType<Runner> ? Runner : never,
): ReturnType<Runner> => {
  const result = runner(faker)
  if (result instanceof Promise) {
    throw new SyntaxError('InternalError: runFake cannot be used with async functions')
  }

  return result
}

const simpleFaker = new SimpleFaker()
/**
 * Create random strings that match a given regular expression.
 */
export const randexp = (pattern: string | RegExp, flags?: string): string => {
  const randexp = new RandExp(pattern, flags)
  randexp.randInt = (from, to) => simpleFaker.number.int({ min: from, max: to })
  return randexp.gen()
}

/**
 * Sets the seed or generates a new one.
 *
 * This method is intended to allow for consistent values in tests, so you might want to use hardcoded values as the seed.
 */
export const seed = (value?: number): void => {
  faker.seed(value)
  simpleFaker.seed(value)
}
