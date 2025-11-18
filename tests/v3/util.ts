import { test } from 'vitest'

const count = 50

interface TestMultipleTimes {
  (name: string, fn: () => void): void
  only(name: string, fn: () => void): void
  skip(name: string, fn: () => void): void
}

export const testMultipleTimes: TestMultipleTimes = (name, fn) => {
  test(name, () => {
    for (let i = 0; i < count; i++) {
      fn()
    }
  })
}

testMultipleTimes.only = (name, fn) => {
  test.only(name, () => {
    for (let i = 0; i < count; i++) {
      fn()
    }
  })
}

testMultipleTimes.skip = (name, fn) => {
  test.skip(name, () => {
    for (let i = 0; i < count; i++) {
      fn()
    }
  })
}
