import { describe, expect, test } from 'vitest'
import { z } from 'zod'
import { ZodIntersectionFaker } from '../src/zod-intersection-faker'
import { expectType, TypeEqual } from 'ts-expect'
import { install } from '../src'
import { testMultipleTimes } from './util'

const Person = z.object({
  name: z.string(),
})
const Employee = z.object({
  role: z.string(),
})

describe('N/A', () => {
  test('nan + nan', () => {
    const schema = z.intersection(z.nan(), z.nan())

    expect(schema.safeParse(NaN).success).toEqual(false)
  })

  test('map + map', () => {
    const schema = z.intersection(z.map(z.string(), z.number()), z.map(z.string(), z.number()))

    expect(schema.safeParse(new Map([['foo', 1]])).success).toEqual(false)
  })

  test('set + set', () => {
    const schema = z.intersection(z.set(z.number()), z.set(z.number()))

    expect(schema.safeParse(new Set([1])).success).toEqual(false)
  })

  test('function + function', () => {
    const schema = z.intersection(z.function(), z.function())

    expect(schema.safeParse(() => {}).success).toEqual(false)
  })

  test('promise + promise', () => {
    const schema = z.intersection(z.promise(z.number()), z.promise(z.number()))

    expect(schema.safeParse(Promise.resolve(1)).success).toEqual(false)
  })

  test('never + never', () => {
    const schema = z.intersection(z.never(), z.never())

    expect(schema.safeParse(undefined).success).toEqual(false)
  })
})

test('ZodIntersectionFaker should assert parameters', () => {
  const invalidSchema = void 0 as any
  expect(() => new ZodIntersectionFaker(invalidSchema)).toThrow()
})

test('ZodIntersectionFaker should accepts a ZodIntersection schema', () => {
  const schema = z.intersection(Person, Employee)
  expect(() => new ZodIntersectionFaker(schema)).not.toThrow()
})

test('ZodIntersectionFaker should return a ZodIntersectionFaker instance', () => {
  const schema = z.intersection(Person, Employee)
  const faker = new ZodIntersectionFaker(schema)
  expect(faker instanceof ZodIntersectionFaker).toBe(true)
})

test('ZodIntersectionFaker.fake should be a function', () => {
  const schema = z.intersection(Person, Employee)
  const faker = new ZodIntersectionFaker(schema)
  expect(typeof faker.fake).toBe('function')
})

test('ZodIntersectionFaker.fake should return the given type', () => {
  const schema = z.intersection(Person, Employee)
  const faker = new ZodIntersectionFaker(schema)
  expectType<TypeEqual<ReturnType<typeof faker.fake>, { name: string } & { role: string }>>(true)
})

describe('any', () => {
  testMultipleTimes('any + any', () => {
    install()

    const schema = z.intersection(z.any(), z.any())
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })

  testMultipleTimes('any + the other', () => {
    install()

    const schema = z.intersection(z.any(), z.date())
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })

  testMultipleTimes('the other + any', () => {
    install()

    const schema = z.intersection(z.date(), z.any())
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })
})

describe('unknown', () => {
  testMultipleTimes('unknown + unknown', () => {
    install()

    const schema = z.intersection(z.unknown(), z.unknown())
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })

  testMultipleTimes('unknown + the other', () => {
    install()

    const schema = z.intersection(z.unknown(), z.date())
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })

  testMultipleTimes('the other + unknown', () => {
    install()

    const schema = z.intersection(z.date(), z.unknown())
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })
})

describe('undefined', () => {
  testMultipleTimes('undefined + undefined', () => {
    install()

    const schema = z.intersection(z.undefined(), z.undefined())
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })

  testMultipleTimes('undefined + optional', () => {
    install()

    const schema = z.intersection(z.undefined(), z.date().optional())
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })

  testMultipleTimes('undefined + nullish', () => {
    install()

    const schema = z.intersection(z.undefined(), z.date().nullish())
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })

  testMultipleTimes('undefined + the-other', () => {
    install()

    const schema = z.intersection(z.undefined(), z.date())
    const faker = new ZodIntersectionFaker(schema)
    expect(() => faker.fake()).toThrow()
  })

  testMultipleTimes('optional + undefined', () => {
    install()

    const schema = z.intersection(z.date().optional(), z.undefined())
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })

  testMultipleTimes('nullish + undefined', () => {
    install()

    const schema = z.intersection(z.date().nullish(), z.undefined())
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })

  testMultipleTimes('the-other + undefined', () => {
    install()

    const schema = z.intersection(z.date(), z.undefined())
    const faker = new ZodIntersectionFaker(schema)
    expect(() => faker.fake()).toThrow()
  })
})

describe('optional', () => {
  testMultipleTimes('optional + optional', () => {
    install()

    const schema = z.intersection(z.date().optional(), z.boolean().optional())
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })

  testMultipleTimes('optional + nullish', () => {
    install()

    const schema = z.intersection(z.date().optional(), z.boolean().nullish())
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })

  testMultipleTimes('optional + the other', () => {
    install()

    const schema = z.intersection(z.date().optional(), z.date())
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })

  testMultipleTimes('optional + the other (no common value)', () => {
    install()

    const schema = z.intersection(z.date().optional(), z.boolean())
    const faker = new ZodIntersectionFaker(schema)
    expect(() => faker.fake()).toThrow()
  })

  testMultipleTimes('nullish + optional', () => {
    install()

    const schema = z.intersection(z.date().nullish(), z.boolean().optional())
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })

  testMultipleTimes('the other + optional', () => {
    install()

    const schema = z.intersection(z.date(), z.date().optional())
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })

  testMultipleTimes('the other + optional (no common value)', () => {
    install()

    const schema = z.intersection(z.boolean(), z.date().optional())
    const faker = new ZodIntersectionFaker(schema)
    expect(() => faker.fake()).toThrow()
  })
})

describe('null', () => {
  testMultipleTimes('null + null', () => {
    install()

    const schema = z.intersection(z.null(), z.null())
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })

  testMultipleTimes('null + nullable', () => {
    install()

    const schema = z.intersection(z.null(), z.date().nullable())
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })

  testMultipleTimes('null + nullish', () => {
    install()

    const schema = z.intersection(z.null(), z.date().nullish())
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })

  testMultipleTimes('nullable + null', () => {
    install()

    const schema = z.intersection(z.date().nullable(), z.null())
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })

  testMultipleTimes('nullish + null', () => {
    install()

    const schema = z.intersection(z.date().nullish(), z.null())
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })
})

describe('nullable', () => {
  testMultipleTimes('nullable + nullable', () => {
    install()

    const schema = z.intersection(z.date().nullable(), z.boolean().nullable())
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })

  testMultipleTimes('nullable + nullish', () => {
    install()

    const schema = z.intersection(z.date().nullable(), z.boolean().nullish())
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })

  testMultipleTimes('nullable + the other', () => {
    install()

    const schema = z.intersection(z.date().nullable(), z.date())
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })

  testMultipleTimes('nullable + the other (no common value)', () => {
    install()

    const schema = z.intersection(z.date().nullable(), z.boolean())
    const faker = new ZodIntersectionFaker(schema)
    expect(() => faker.fake()).toThrow()
  })

  testMultipleTimes('nullish + nullable', () => {
    install()

    const schema = z.intersection(z.date().nullish(), z.boolean().nullable())
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })

  testMultipleTimes('the other + nullable', () => {
    install()

    const schema = z.intersection(z.date(), z.date().nullable())
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })

  testMultipleTimes('the other + nullable (no common value)', () => {
    install()

    const schema = z.intersection(z.boolean(), z.date().nullable())
    const faker = new ZodIntersectionFaker(schema)
    expect(() => faker.fake()).toThrow()
  })
})

describe('nullish', () => {
  testMultipleTimes('nullish + nullish', () => {
    install()

    const schema = z.intersection(z.date().nullish(), z.boolean().nullish())
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })

  testMultipleTimes('nullish + the other', () => {
    install()

    const schema = z.intersection(z.date().nullish(), z.date())
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })

  testMultipleTimes('nullish + the other (no common value)', () => {
    install()

    const schema = z.intersection(z.date().nullish(), z.boolean())
    const faker = new ZodIntersectionFaker(schema)
    expect(() => faker.fake()).toThrow()
  })

  testMultipleTimes('the other + nullish', () => {
    install()

    const schema = z.intersection(z.date(), z.date().nullish())
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })

  testMultipleTimes('the other + nullish (no common value)', () => {
    install()

    const schema = z.intersection(z.boolean(), z.date().nullish())
    const faker = new ZodIntersectionFaker(schema)
    expect(() => faker.fake()).toThrow()
  })
})

describe('object', () => {
  testMultipleTimes('object + object', () => {
    install()

    const schema = z.intersection(Person, Employee)
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })

  testMultipleTimes('object + object (inner type)', () => {
    install()

    const schema = z.intersection(
      z.object({
        foo: z.string(),
        date: z.date().min(new Date(0)),
      }),
      z.object({
        bar: z.string(),
        date: z.date().max(new Date(0)),
      }),
    )
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })

  testMultipleTimes('object + object strict', () => {
    install()

    const schema = z.intersection(
      z.object({
        foo: z.string().optional(),
      }),
      z.object({}).strict(),
    )
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })

  testMultipleTimes('object strict + object', () => {
    install()

    const schema = z.intersection(
      z.object({}).strict(),
      z.object({
        foo: z.string().optional(),
      }),
    )
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })

  testMultipleTimes('object + object catchall', () => {
    install()

    const schema = z.intersection(
      z.object({
        foo: z.date().max(new Date(0)),
      }),
      z.object({}).catchall(z.date().min(new Date(0))),
    )
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })

  testMultipleTimes('object catchall + object', () => {
    install()

    const schema = z.intersection(
      z.object({}).catchall(z.date().min(new Date(0))),
      z.object({
        foo: z.date().max(new Date(0)),
      }),
    )
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })
})

describe('date', () => {
  testMultipleTimes('date + date', () => {
    install()

    const schema = z.intersection(z.date(), z.date())
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })

  testMultipleTimes('date min + date max', () => {
    install()

    const schema = z.intersection(z.date().min(new Date(0)), z.date().max(new Date(0)))
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })
})

describe('array', () => {
  testMultipleTimes('array + array', () => {
    install()

    const schema = z.intersection(z.array(z.date()), z.array(z.date()))
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })

  testMultipleTimes('array + array (inner type)', () => {
    install()

    const schema = z.intersection(z.array(z.date().min(new Date(0))), z.array(z.date().max(new Date(0))))
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })

  testMultipleTimes('array min + array max', () => {
    install()

    const schema = z.intersection(z.array(z.date()).min(3), z.array(z.date()).max(3))
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })

  testMultipleTimes('array + array length', () => {
    install()

    const schema = z.intersection(z.array(z.date()), z.array(z.date()).length(3))
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })

  testMultipleTimes('array length + array', () => {
    install()

    const schema = z.intersection(z.array(z.date()).length(3), z.array(z.date()))
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })
})

describe('record', () => {
  testMultipleTimes('record + record', () => {
    install()

    const schema = z.intersection(z.record(z.date()), z.record(z.date()))
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data: data })
  })
})

describe('tuple', () => {
  testMultipleTimes('tuple + tuple', () => {
    install()

    const schema = z.intersection(z.tuple([z.date(), z.number()]), z.tuple([z.date(), z.number()]))
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data: data })
  })

  testMultipleTimes('tuple + tuple optional', () => {
    install()

    const schema = z.intersection(z.tuple([z.date(), z.number()]), z.tuple([z.date(), z.number()]).optional())
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data: data })
  })

  testMultipleTimes('tuple optional + tuple', () => {
    install()

    const schema = z.intersection(z.tuple([z.date(), z.number()]).optional(), z.tuple([z.date(), z.number()]))
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data: data })
  })

  testMultipleTimes('tuple + tuple rest any', () => {
    install()

    const schema = z.intersection(z.tuple([z.date(), z.number(), z.string()]), z.tuple([z.date()]).rest(z.any()))
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data: data })
  })

  testMultipleTimes('tuple rest any + tuple', () => {
    install()

    const schema = z.intersection(z.tuple([z.date()]).rest(z.any()), z.tuple([z.date(), z.number(), z.string()]))
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data: data })
  })

  testMultipleTimes('tuple rest + tuple (intersection)', () => {
    install()

    const schema = z.intersection(z.tuple([z.date()]).rest(z.number().min(0)), z.tuple([z.date(), z.number().max(0)]))
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data: data })
  })

  testMultipleTimes('tuple + tuple rest (intersection)', () => {
    install()

    const schema = z.intersection(z.tuple([z.date(), z.number().max(0)]), z.tuple([z.date()]).rest(z.number().min(0)))
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data: data })
  })
})

describe('union', () => {
  testMultipleTimes('union + union', () => {
    install()

    const schema = z.intersection(
      z.union([z.number(), z.date().min(new Date(0))]),
      z.union([z.date().max(new Date(0)), z.string()]),
    )
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data: data })
  })
})

describe('number', () => {
  testMultipleTimes('number + number', () => {
    install()

    const schema = z.intersection(z.number(), z.number())
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })

  testMultipleTimes('number (-Infinity)', () => {
    install()

    const schema = z.intersection(z.number().max(0), z.number().max(0))
    const faker = new ZodIntersectionFaker(schema)
    let safeCount = 0
    while (safeCount < 1000) {
      const data = faker.fake()
      if (data === -Infinity) {
        return
      }
      safeCount++
    }
    expect(false).toEqual(true)
  })

  testMultipleTimes('number (Infinity)', () => {
    install()

    const schema = z.intersection(z.number().min(0), z.number().min(0))
    const faker = new ZodIntersectionFaker(schema)
    let safeCount = 0
    while (safeCount < 1000) {
      const data = faker.fake()
      if (data === Infinity) {
        return
      }
      safeCount++
    }
    expect(false).toEqual(true)
  })

  testMultipleTimes('number min + number max', () => {
    install()

    const schema = z.intersection(z.number().min(0), z.number().max(0))
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })

  testMultipleTimes('number + number optional', () => {
    install()

    const schema = z.intersection(z.number(), z.number().optional())
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })

  testMultipleTimes('number optional + number', () => {
    install()

    const schema = z.intersection(z.number().optional(), z.number())
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })

  testMultipleTimes('number + number int', () => {
    install()

    const schema = z.intersection(z.number().min(0).max(10), z.number().min(0).max(10).int())
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })

  testMultipleTimes('number int + number', () => {
    install()

    const schema = z.intersection(z.number().min(0).max(10).int(), z.number().min(0).max(10))
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })

  testMultipleTimes('number + number finite', () => {
    install()

    const schema = z.intersection(z.number(), z.number().finite())
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })

  testMultipleTimes('number finite + number', () => {
    install()

    const schema = z.intersection(z.number().finite(), z.number())
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })

  testMultipleTimes('number + number multipleOf', () => {
    install()

    const schema = z.intersection(z.number(), z.number().multipleOf(2))
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })

  testMultipleTimes('number multipleOf + number', () => {
    install()

    const schema = z.intersection(z.number().multipleOf(2), z.number())
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })
})

describe('string', () => {
  testMultipleTimes('string + string', () => {
    install()

    const schema = z.intersection(z.string(), z.string())
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })

  testMultipleTimes('string + string min', () => {
    install()

    const schema = z.intersection(z.string(), z.string().min(100))
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })

  testMultipleTimes('string + string email', () => {
    install()

    const schema = z.intersection(z.string(), z.string().email())
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })
})

describe('void', () => {
  testMultipleTimes('void + void', () => {
    install()

    const schema = z.intersection(z.void(), z.void())
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })
})

describe('symbol', () => {
  testMultipleTimes('symbol + symbol', () => {
    install()

    const schema = z.intersection(z.symbol(), z.symbol())
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })
})

describe('nativeEnum', () => {
  testMultipleTimes('nativeEnum + nativeEnum', () => {
    install()

    enum Foo {
      A,
      B,
    }

    const schema = z.intersection(z.nativeEnum(Foo), z.nativeEnum(Foo))
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })
})

describe('enum', () => {
  testMultipleTimes('enum + enum', () => {
    install()

    const schema = z.intersection(z.enum(['foo', 'bar']), z.enum(['foo', 'baz']))
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })

  testMultipleTimes('enum + enum (no common value)', () => {
    install()

    const schema = z.intersection(z.enum(['foo', 'bar']), z.enum(['baz', 'qux']))
    const faker = new ZodIntersectionFaker(schema)

    expect(() => faker.fake()).toThrow()
  })
})

describe('literal', () => {
  testMultipleTimes('literal + literal', () => {
    install()

    const schema = z.intersection(z.literal('foo'), z.literal('foo'))
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })
})

describe('boolean', () => {
  testMultipleTimes('boolean + boolean', () => {
    install()

    const schema = z.intersection(z.boolean(), z.boolean())
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })
})

describe('bigint', () => {
  testMultipleTimes('bigint + bigint', () => {
    install()

    const schema = z.intersection(z.bigint(), z.bigint())
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })

  testMultipleTimes('bigint + bigint min', () => {
    install()

    const schema = z.intersection(z.bigint(), z.bigint().min(-100n))
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })

  testMultipleTimes('bigint min + bigint', () => {
    install()

    const schema = z.intersection(z.bigint().min(-100n), z.bigint())
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })

  testMultipleTimes('bigint + bigint max', () => {
    install()

    const schema = z.intersection(z.bigint(), z.bigint().max(-100n))
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })

  testMultipleTimes('bigint max + bigint', () => {
    install()

    const schema = z.intersection(z.bigint().max(-100n), z.bigint())
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })

  testMultipleTimes('bigint + bigint multipleOf', () => {
    install()

    const schema = z.intersection(z.bigint(), z.bigint().multipleOf(31n))
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })

  testMultipleTimes('bigint multipleOf + bigint', () => {
    install()

    const schema = z.intersection(z.bigint().multipleOf(31n), z.bigint())
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })
})

describe('readonly', () => {
  testMultipleTimes('readonly', () => {
    install()

    const schema = z.intersection(z.array(z.date()).readonly(), z.array(z.date()).readonly())
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })
})

describe('lazy', () => {
  testMultipleTimes('lazy', () => {
    install()

    const schema = z.intersection(
      z.lazy(() => z.date()),
      z.lazy(() => z.date()),
    )
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })
})

describe('intersection/and', () => {
  testMultipleTimes('intersection/and', () => {
    install()

    const schema = z.intersection(
      z.date().and(z.date().min(new Date(0))),
      z.intersection(z.date().max(new Date(0)), z.date()),
    )
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })
})
