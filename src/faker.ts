import { Faker, faker as _faker } from '@faker-js/faker'
import RandExp from 'randexp'

let _seedValue: number | number[] | undefined
let _shouldSeed: boolean = false

// https://github.com/faker-js/faker/issues/448
// TODO: create standalone faker instead of use following workaround
export const runFake = <Runner extends (faker: Faker) => any>(runner: Runner): ReturnType<Runner> => {
  let oldSeedValue
  if (_shouldSeed) {
    oldSeedValue = _faker.seedValue
    _faker.seed(_seedValue)
  }

  const result = runner(_faker)
  if (result instanceof Promise) {
    throw new SyntaxError('InternalError: runFake cannot be used with async functions')
  }

  if (_shouldSeed) {
    _faker.seed(oldSeedValue)
  }

  _shouldSeed = false

  return result
}

export const randexp = (pattern: string | RegExp, flags?: string) => {
  const randexp = new RandExp(pattern, flags)
  randexp.randInt = (from, to) => runFake(faker => faker.datatype.number({ min: from, max: to }))
  return randexp.gen()
}

/**
 * sets the seed to use.
 */
export const seed = (value?: number | number[]): void => {
  _seedValue = value
  _shouldSeed = true
}
