import { Faker, SimpleFaker } from '@faker-js/faker'
import RandExp from 'randexp'

let _faker: Faker

/**
 * Set the faker instance to use.
 */
export function setFaker(faker: Faker): void {
  _faker = faker
}

/**
 * Get the faker instance.
 */
export function getFaker(): Faker {
  return _faker!
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
