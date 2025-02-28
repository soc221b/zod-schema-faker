import { Faker, fakerEN, SimpleFaker } from '@faker-js/faker'
import RandExp from 'randexp'

let _faker: Faker = fakerEN

/**
 * Use given faker instance instead of the default one.
 *
 * @see https://fakerjs.dev/guide/localization.html for more information.
 */
export function setFaker(faker: Faker): void {
  _faker = faker
}

/**
 * Get the current faker instance.
 *
 * @default fakerEN
 */
export function getFaker(): Faker {
  return _faker
}

const _simpleFaker = new SimpleFaker()
/**
 * Create random strings that match a given regular expression.
 */
export const randexp = (pattern: string | RegExp, flags?: string): string => {
  const randexp = new RandExp(pattern, flags)
  randexp.randInt = (from, to) => _simpleFaker.number.int({ min: from, max: to })
  return randexp.gen()
}

/**
 * Sets the seed or generates a new one.
 *
 * This method is intended to allow for consistent values in tests, so you might want to use hardcoded values as the seed.
 */
export const seed = (value?: number): void => {
  _faker.seed(value)
  _simpleFaker.seed(value)
}

/**
 * This exists for compatibility with the previous version. Will be removed in next major version.
 *
 * @deprecated Use {@link setFaker} instead.
 *
 * @todo Remove in next major version.
 */
export const installFaker: typeof setFaker = setFaker

/**
 * This exists for compatibility with the previous version. Will be removed in next major version.
 *
 * @deprecated Use {@link getFaker} instead.
 *
 * @todo Remove in next major version.
 */
export const runFake = <Runner extends (faker: Faker) => any>(
  runner: Awaited<ReturnType<Runner>> extends ReturnType<Runner> ? Runner : never,
): ReturnType<Runner> => {
  const result = runner(_faker)
  if (result instanceof Promise) {
    throw new SyntaxError('InternalError: runFake cannot be used with async functions')
  }

  return result
}
