const count = 50

export const testMultipleTimes = (name: string, fn: () => void) => {
  test(name, () => {
    for (let i = 0; i < count; i++) {
      fn()
    }
  })
}

testMultipleTimes.only = (name: string, fn: () => void) => {
  test.only(name, () => {
    for (let i = 0; i < count; i++) {
      fn()
    }
  })
}

testMultipleTimes.skip = (name: string, fn: () => void) => {
  test.skip(name, () => {
    for (let i = 0; i < count; i++) {
      fn()
    }
  })
}
