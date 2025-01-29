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

  test('date + date', () => {
    install()

    const schema = z.intersection(z.date(), z.date())
    const faker = new ZodIntersectionFaker(schema)
    const result = faker['findIntersectedSchemaForDate'](z.date(), z.date())
    if (result.success && result.schema instanceof z.ZodDate) {
      expect(result.schema._def.checks.length).toBe(0)
    }
    expect.assertions(1)
  })

  test('date + date min', () => {
    install()

    const left = z.date()
    const right = z.date().min(new Date(123))
    const faker = new ZodIntersectionFaker(z.intersection(left, right))
    const result = faker['findIntersectedSchemaForDate'](left, right)
    if (result.success && result.schema instanceof z.ZodDate) {
      expect(result.schema._def.checks.length).toBe(1)
      expect(
        result.schema._def.checks.find(check => check.kind === 'min' && check.value === new Date(123).getTime()),
      ).toBeTruthy()
    }
    expect.assertions(2)
  })

  test('date min + date', () => {
    install()

    const left = z.date().min(new Date(123))
    const right = z.date()
    const faker = new ZodIntersectionFaker(z.intersection(left, right))
    const result = faker['findIntersectedSchemaForDate'](left, right)
    if (result.success && result.schema instanceof z.ZodDate) {
      expect(result.schema._def.checks.length).toBe(1)
      expect(
        result.schema._def.checks.find(check => check.kind === 'min' && check.value === new Date(123).getTime()),
      ).toBeTruthy()
    }
    expect.assertions(2)
  })

  test('date + date max', () => {
    install()

    const left = z.date()
    const right = z.date().max(new Date(123))
    const faker = new ZodIntersectionFaker(z.intersection(left, right))
    const result = faker['findIntersectedSchemaForDate'](left, right)
    if (result.success && result.schema instanceof z.ZodDate) {
      expect(result.schema._def.checks.length).toBe(1)
      expect(
        result.schema._def.checks.find(check => check.kind === 'max' && check.value === new Date(123).getTime()),
      ).toBeTruthy()
    }
    expect.assertions(2)
  })

  test('date max + date', () => {
    install()

    const left = z.date().max(new Date(123))
    const right = z.date()
    const faker = new ZodIntersectionFaker(z.intersection(left, right))
    const result = faker['findIntersectedSchemaForDate'](left, right)
    if (result.success && result.schema instanceof z.ZodDate) {
      expect(result.schema._def.checks.length).toBe(1)
      expect(
        result.schema._def.checks.find(check => check.kind === 'max' && check.value === new Date(123).getTime()),
      ).toBeTruthy()
    }
    expect.assertions(2)
  })

  test('date min + date min (larger)', () => {
    install()

    const left = z.date().min(new Date(123))
    const right = z.date().min(new Date(456))
    const faker = new ZodIntersectionFaker(z.intersection(left, right))
    const result = faker['findIntersectedSchemaForDate'](left, right)
    if (result.success && result.schema instanceof z.ZodDate) {
      expect(result.schema._def.checks.length).toBe(1)
      expect(
        result.schema._def.checks.find(check => check.kind === 'min' && check.value === new Date(456).getTime()),
      ).toBeTruthy()
    }
    expect.assertions(2)
  })

  test('date min (larger) + date min', () => {
    install()

    const left = z.date().min(new Date(456))
    const right = z.date().min(new Date(123))
    const faker = new ZodIntersectionFaker(z.intersection(left, right))
    const result = faker['findIntersectedSchemaForDate'](left, right)
    if (result.success && result.schema instanceof z.ZodDate) {
      expect(result.schema._def.checks.length).toBe(1)
      expect(
        result.schema._def.checks.find(check => check.kind === 'min' && check.value === new Date(456).getTime()),
      ).toBeTruthy()
    }
    expect.assertions(2)
  })

  test('date + date max (larger)', () => {
    install()

    const left = z.date()
    const right = z.date().max(new Date(123))
    const faker = new ZodIntersectionFaker(z.intersection(left, right))
    const result = faker['findIntersectedSchemaForDate'](left, right)
    if (result.success && result.schema instanceof z.ZodDate) {
      expect(result.schema._def.checks.length).toBe(1)
      expect(
        result.schema._def.checks.find(check => check.kind === 'max' && check.value === new Date(123).getTime()),
      ).toBeTruthy()
    }
    expect.assertions(2)
  })

  test('date max (larger) + date', () => {
    install()

    const left = z.date().max(new Date(123))
    const right = z.date()
    const faker = new ZodIntersectionFaker(z.intersection(left, right))
    const result = faker['findIntersectedSchemaForDate'](left, right)
    if (result.success && result.schema instanceof z.ZodDate) {
      expect(result.schema._def.checks.length).toBe(1)
      expect(
        result.schema._def.checks.find(check => check.kind === 'max' && check.value === new Date(123).getTime()),
      ).toBeTruthy()
    }
    expect.assertions(2)
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

  test('array + array min', () => {
    install()

    const left = z.array(z.date())
    const right = z.array(z.date()).min(3)
    const faker = new ZodIntersectionFaker(z.intersection(left, right))
    const result = faker['findIntersectedSchemaForArray'](left, right)
    if (result.success && result.schema instanceof z.ZodArray) {
      expect(result.schema._def.minLength?.value).toBe(3)
    }
    expect.assertions(1)
  })

  test('array min + array', () => {
    install()

    const left = z.array(z.date()).min(3)
    const right = z.array(z.date())
    const faker = new ZodIntersectionFaker(z.intersection(left, right))
    const result = faker['findIntersectedSchemaForArray'](left, right)
    if (result.success && result.schema instanceof z.ZodArray) {
      expect(result.schema._def.minLength?.value).toBe(3)
    }
    expect.assertions(1)
  })

  test('array + array max', () => {
    install()

    const left = z.array(z.date())
    const right = z.array(z.date()).max(3)
    const faker = new ZodIntersectionFaker(z.intersection(left, right))
    const result = faker['findIntersectedSchemaForArray'](left, right)
    if (result.success && result.schema instanceof z.ZodArray) {
      expect(result.schema._def.maxLength?.value).toBe(3)
    }
    expect.assertions(1)
  })

  test('array max + array', () => {
    install()

    const left = z.array(z.date()).max(3)
    const right = z.array(z.date())
    const faker = new ZodIntersectionFaker(z.intersection(left, right))
    const result = faker['findIntersectedSchemaForArray'](left, right)
    if (result.success && result.schema instanceof z.ZodArray) {
      expect(result.schema._def.maxLength?.value).toBe(3)
    }
    expect.assertions(1)
  })

  test('array + array length', () => {
    install()

    const left = z.array(z.date())
    const right = z.array(z.date()).length(3)
    const faker = new ZodIntersectionFaker(z.intersection(left, right))
    const result = faker['findIntersectedSchemaForArray'](left, right)
    if (result.success && result.schema instanceof z.ZodArray) {
      expect(result.schema._def.exactLength?.value).toBe(3)
    }
    expect.assertions(1)
  })

  test('array length + array', () => {
    install()

    const left = z.array(z.date()).length(3)
    const right = z.array(z.date())
    const faker = new ZodIntersectionFaker(z.intersection(left, right))
    const result = faker['findIntersectedSchemaForArray'](left, right)
    if (result.success && result.schema instanceof z.ZodArray) {
      expect(result.schema._def.exactLength?.value).toBe(3)
    }
    expect.assertions(1)
  })

  test('array min + array min (larger)', () => {
    install()

    const left = z.array(z.date()).min(3)
    const right = z.array(z.date()).min(5)
    const faker = new ZodIntersectionFaker(z.intersection(left, right))
    const result = faker['findIntersectedSchemaForArray'](left, right)
    if (result.success && result.schema instanceof z.ZodArray) {
      expect(result.schema._def.minLength?.value).toBe(5)
    }
    expect.assertions(1)
  })

  test('array min (larger) + array min', () => {
    install()

    const left = z.array(z.date()).min(5)
    const right = z.array(z.date()).min(3)
    const faker = new ZodIntersectionFaker(z.intersection(left, right))
    const result = faker['findIntersectedSchemaForArray'](left, right)
    if (result.success && result.schema instanceof z.ZodArray) {
      expect(result.schema._def.minLength?.value).toBe(5)
    }
    expect.assertions(1)
  })

  test('array + array max (larger)', () => {
    install()

    const left = z.array(z.date()).max(3)
    const right = z.array(z.date()).max(5)
    const faker = new ZodIntersectionFaker(z.intersection(left, right))
    const result = faker['findIntersectedSchemaForArray'](left, right)
    if (result.success && result.schema instanceof z.ZodArray) {
      expect(result.schema._def.maxLength?.value).toBe(3)
    }
    expect.assertions(1)
  })

  test('array max (larger) + array', () => {
    install()

    const left = z.array(z.date()).max(5)
    const right = z.array(z.date()).max(3)
    const faker = new ZodIntersectionFaker(z.intersection(left, right))
    const result = faker['findIntersectedSchemaForArray'](left, right)
    if (result.success && result.schema instanceof z.ZodArray) {
      expect(result.schema._def.maxLength?.value).toBe(3)
    }
    expect.assertions(1)
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

  test('tuple [date] + tuple [date]', () => {
    install()

    const left = z.tuple([z.date().min(new Date(123))])
    const right = z.tuple([z.date().max(new Date(456))])
    const schema = z.intersection(left, right)
    const faker = new ZodIntersectionFaker(schema)
    const result = faker['findIntersectedSchemaForTuple'](left, right)
    if (result.success && result.schema instanceof z.ZodTuple) {
      const items: any[] = result.schema._def.items
      expect(items.length).toBe(1)
      const firstItem = items[0]
      if (firstItem instanceof z.ZodDate) {
        expect(firstItem._def.checks.length).toBe(2)
        expect(
          firstItem._def.checks.find(check => check.kind === 'min' && check.value === new Date(123).getTime()),
        ).toBeTruthy()
        expect(
          firstItem._def.checks.find(check => check.kind === 'max' && check.value === new Date(456).getTime()),
        ).toBeTruthy()
      }
      expect(result.schema._def.rest).toBeNull()
    }
    expect.assertions(5)
  })

  test('tuple [date, number] + tuple [date, ...number]', () => {
    install()

    const left = z.tuple([z.date().min(new Date(123)), z.number().min(321)])
    const right = z.tuple([z.date().max(new Date(456))]).rest(z.number().max(654))
    const schema = z.intersection(left, right)
    const faker = new ZodIntersectionFaker(schema)
    const result = faker['findIntersectedSchemaForTuple'](left, right)
    if (result.success && result.schema instanceof z.ZodTuple) {
      const items: any[] = result.schema._def.items
      expect(items.length).toBe(2)
      const firstItem = items[0]
      if (firstItem instanceof z.ZodDate) {
        expect(firstItem._def.checks.length).toBe(2)
        expect(
          firstItem._def.checks.find(check => check.kind === 'min' && check.value === new Date(123).getTime()),
        ).toBeTruthy()
        expect(
          firstItem._def.checks.find(check => check.kind === 'max' && check.value === new Date(456).getTime()),
        ).toBeTruthy()
      }
      const secondItem = items[1]
      if (secondItem instanceof z.ZodNumber) {
        expect(secondItem._def.checks.length).toBe(2)
        expect(secondItem._def.checks.find(check => check.kind === 'min' && check.value === 321)).toBeTruthy()
        expect(secondItem._def.checks.find(check => check.kind === 'max' && check.value === 654)).toBeTruthy()
      }
      expect(result.schema._def.rest).toBeNull()
    }
    expect.assertions(8)
  })

  test('tuple [date, ...number] + tuple [date, number]', () => {
    install()

    const left = z.tuple([z.date().min(new Date(123))]).rest(z.number().min(321))
    const right = z.tuple([z.date().max(new Date(456)), z.number().max(654)])
    const schema = z.intersection(left, right)
    const faker = new ZodIntersectionFaker(schema)
    const result = faker['findIntersectedSchemaForTuple'](left, right)
    if (result.success && result.schema instanceof z.ZodTuple) {
      const items: any[] = result.schema._def.items
      expect(items.length).toBe(2)
      const firstItem = items[0]
      if (firstItem instanceof z.ZodDate) {
        expect(firstItem._def.checks.length).toBe(2)
        expect(
          firstItem._def.checks.find(check => check.kind === 'min' && check.value === new Date(123).getTime()),
        ).toBeTruthy()
        expect(
          firstItem._def.checks.find(check => check.kind === 'max' && check.value === new Date(456).getTime()),
        ).toBeTruthy()
      }
      const secondItem = items[1]
      if (secondItem instanceof z.ZodNumber) {
        expect(secondItem._def.checks.length).toBe(2)
        expect(secondItem._def.checks.find(check => check.kind === 'min' && check.value === 321)).toBeTruthy()
        expect(secondItem._def.checks.find(check => check.kind === 'max' && check.value === 654)).toBeTruthy()
      }
      expect(result.schema._def.rest).toBeNull()
    }
    expect.assertions(8)
  })

  test('tuple [date, ...number] + tuple [date, ...number]', () => {
    install()

    const left = z.tuple([z.date().min(new Date(123))]).rest(z.number().min(321))
    const right = z.tuple([z.date().max(new Date(456))]).rest(z.number().max(654))
    const schema = z.intersection(left, right)
    const faker = new ZodIntersectionFaker(schema)
    const result = faker['findIntersectedSchemaForTuple'](left, right)
    if (result.success && result.schema instanceof z.ZodTuple) {
      const items: any[] = result.schema._def.items
      expect(items.length).toBe(1)
      const firstItem = items[0]
      if (firstItem instanceof z.ZodDate) {
        expect(firstItem._def.checks.length).toBe(2)
        expect(
          firstItem._def.checks.find(check => check.kind === 'min' && check.value === new Date(123).getTime()),
        ).toBeTruthy()
        expect(
          firstItem._def.checks.find(check => check.kind === 'max' && check.value === new Date(456).getTime()),
        ).toBeTruthy()
      }
      expect(result.schema._def.rest).toBeInstanceOf(z.ZodNumber)
      const rest = result.schema._def.rest as z.ZodNumber
      expect(rest._def.checks.length).toBe(2)
      expect(rest._def.checks.find(check => check.kind === 'min' && check.value === 321)).toBeTruthy()
      expect(rest._def.checks.find(check => check.kind === 'max' && check.value === 654)).toBeTruthy()
    }
    expect.assertions(8)
  })
})

describe('union/or', () => {
  test('union + union', () => {
    install()

    const schema = z.intersection(
      z.union([z.number(), z.date().min(new Date(123))]),
      z.date().max(new Date(321)).or(z.string()),
    )
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data: data })
  })

  test('union [date min, number] + date max', () => {
    install()

    const left = z.union([z.date().min(new Date(123)), z.number()])
    const right = z.date().max(new Date(321))
    const schema = z.intersection(left, right)
    const faker = new ZodIntersectionFaker(schema)
    const result = faker['findIntersectedSchemaForUnion'](left, right)
    if (result.success && result.schema instanceof z.ZodDate) {
      expect(result.schema._def.checks.length).toBe(2)
      expect(
        result.schema._def.checks.find(check => check.kind === 'min' && check.value === new Date(123).getTime()),
      ).toBeTruthy()
      expect(
        result.schema._def.checks.find(check => check.kind === 'max' && check.value === new Date(321).getTime()),
      ).toBeTruthy()
    }
    expect.assertions(3)
  })

  test('union [date min 1, date min 2] + date max', () => {
    install()

    const left = z.union([z.date().min(new Date(123)), z.date().min(new Date(321))])
    const right = z.date().max(new Date(456))
    const schema = z.intersection(left, right)
    const faker = new ZodIntersectionFaker(schema)
    const result = faker['findIntersectedSchemaForUnion'](left, right)
    if (result.success && result.schema instanceof z.ZodUnion) {
      const items: any[] = result.schema._def.options
      expect(items.length).toBe(2)
      const firstItem = items[0]
      if (firstItem instanceof z.ZodDate) {
        expect(firstItem._def.checks.length).toBe(2)
        expect(
          firstItem._def.checks.find(check => check.kind === 'min' && check.value === new Date(123).getTime()),
        ).toBeTruthy()
        expect(
          firstItem._def.checks.find(check => check.kind === 'max' && check.value === new Date(456).getTime()),
        ).toBeTruthy()
      }
      const secondItem = items[1]
      if (secondItem instanceof z.ZodDate) {
        expect(secondItem._def.checks.length).toBe(2)
        expect(
          secondItem._def.checks.find(check => check.kind === 'min' && check.value === new Date(321).getTime()),
        ).toBeTruthy()
        expect(
          secondItem._def.checks.find(check => check.kind === 'max' && check.value === new Date(456).getTime()),
        ).toBeTruthy()
      }
    }
    expect.assertions(7)
  })

  test('union [date min 1, date min 2] + union [date max 1, date max 2]', () => {
    install()

    const left = z.union([z.date().min(new Date(123)), z.date().min(new Date(321))])
    const right = z.union([z.date().max(new Date(456)), z.date().max(new Date(654))])
    const schema = z.intersection(left, right)
    const faker = new ZodIntersectionFaker(schema)
    const result = faker['findIntersectedSchemaForUnion'](left, right)
    if (result.success && result.schema instanceof z.ZodUnion) {
      const firstUnionOptions: any[] = result.schema._def.options
      const secondUnion = firstUnionOptions[0]
      if (secondUnion instanceof z.ZodUnion) {
        const secondUnionOptions = secondUnion._def.options
        const thirdUnion = secondUnionOptions[0]
        if (thirdUnion instanceof z.ZodUnion) {
          const thirdUnionOptions = thirdUnion._def.options
          const firstIntersection = thirdUnionOptions[0]
          if (firstIntersection instanceof z.ZodDate) {
            expect(firstIntersection._def.checks.length).toBe(2)
            expect(
              firstIntersection._def.checks.find(
                check => check.kind === 'min' && check.value === new Date(123).getTime(),
              ),
            ).toBeTruthy()
            expect(
              firstIntersection._def.checks.find(
                check => check.kind === 'max' && check.value === new Date(456).getTime(),
              ),
            ).toBeTruthy()
          }
          const secondIntersection = thirdUnionOptions[1]
          if (secondIntersection instanceof z.ZodDate) {
            expect(secondIntersection._def.checks.length).toBe(2)
            expect(
              secondIntersection._def.checks.find(
                check => check.kind === 'min' && check.value === new Date(123).getTime(),
              ),
            ).toBeTruthy()
            expect(
              secondIntersection._def.checks.find(
                check => check.kind === 'max' && check.value === new Date(654).getTime(),
              ),
            ).toBeTruthy()
          }
        }
        const thirdIntersection = secondUnionOptions[1]
        if (thirdIntersection instanceof z.ZodDate) {
          expect(thirdIntersection._def.checks.length).toBe(2)
          expect(
            thirdIntersection._def.checks.find(
              check => check.kind === 'min' && check.value === new Date(321).getTime(),
            ),
          ).toBeTruthy()
          expect(
            thirdIntersection._def.checks.find(
              check => check.kind === 'max' && check.value === new Date(456).getTime(),
            ),
          ).toBeTruthy()
        }
      }
      const fourthIntersection = firstUnionOptions[1]
      if (fourthIntersection instanceof z.ZodDate) {
        expect(fourthIntersection._def.checks.length).toBe(2)
        expect(
          fourthIntersection._def.checks.find(check => check.kind === 'min' && check.value === new Date(321).getTime()),
        ).toBeTruthy()
        expect(
          fourthIntersection._def.checks.find(check => check.kind === 'max' && check.value === new Date(654).getTime()),
        ).toBeTruthy()
      }
    }
    expect.assertions(12)
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

  test('number + number min', () => {
    install()

    const left = z.number()
    const right = z.number().min(10)
    const faker = new ZodIntersectionFaker(z.intersection(left, right))
    const result = faker['findIntersectedSchemaForNumber'](left, right)
    if (result.success && result.schema instanceof z.ZodNumber) {
      expect(result.schema._def.checks.length).toBe(1)
      expect(result.schema._def.checks.find(check => check.kind === 'min' && check.value === 10)).toBeTruthy()
    }
    expect.assertions(2)
  })

  test('number min + number', () => {
    install()

    const left = z.number().min(10)
    const right = z.number()
    const faker = new ZodIntersectionFaker(z.intersection(left, right))
    const result = faker['findIntersectedSchemaForNumber'](left, right)
    if (result.success && result.schema instanceof z.ZodNumber) {
      expect(result.schema._def.checks.length).toBe(1)
      expect(result.schema._def.checks.find(check => check.kind === 'min' && check.value === 10)).toBeTruthy()
    }
    expect.assertions(2)
  })

  test('number + number max', () => {
    install()

    const left = z.number()
    const right = z.number().max(10)
    const faker = new ZodIntersectionFaker(z.intersection(left, right))
    const result = faker['findIntersectedSchemaForNumber'](left, right)
    if (result.success && result.schema instanceof z.ZodNumber) {
      expect(result.schema._def.checks.length).toBe(1)
      expect(result.schema._def.checks.find(check => check.kind === 'max' && check.value === 10)).toBeTruthy()
    }
    expect.assertions(2)
  })

  test('number max + number', () => {
    install()

    const left = z.number().max(10)
    const right = z.number()
    const faker = new ZodIntersectionFaker(z.intersection(left, right))
    const result = faker['findIntersectedSchemaForNumber'](left, right)
    if (result.success && result.schema instanceof z.ZodNumber) {
      expect(result.schema._def.checks.length).toBe(1)
      expect(result.schema._def.checks.find(check => check.kind === 'max' && check.value === 10)).toBeTruthy()
    }
    expect.assertions(2)
  })

  test('number + number int', () => {
    install()

    const left = z.number()
    const right = z.number().int()
    const faker = new ZodIntersectionFaker(z.intersection(left, right))
    const result = faker['findIntersectedSchemaForNumber'](left, right)
    if (result.success && result.schema instanceof z.ZodNumber) {
      expect(result.schema._def.checks.length).toBe(1)
      expect(result.schema._def.checks.find(check => check.kind === 'int')).toBeTruthy()
    }
    expect.assertions(2)
  })

  test('number int + number', () => {
    install()

    const left = z.number().int()
    const right = z.number()
    const faker = new ZodIntersectionFaker(z.intersection(left, right))
    const result = faker['findIntersectedSchemaForNumber'](left, right)
    if (result.success && result.schema instanceof z.ZodNumber) {
      expect(result.schema._def.checks.length).toBe(1)
      expect(result.schema._def.checks.find(check => check.kind === 'int')).toBeTruthy()
    }
    expect.assertions(2)
  })

  test('number + number finite', () => {
    install()

    const left = z.number()
    const right = z.number().finite()
    const faker = new ZodIntersectionFaker(z.intersection(left, right))
    const result = faker['findIntersectedSchemaForNumber'](left, right)
    if (result.success && result.schema instanceof z.ZodNumber) {
      expect(result.schema._def.checks.length).toBe(1)
      expect(result.schema._def.checks.find(check => check.kind === 'finite')).toBeTruthy()
    }
    expect.assertions(2)
  })

  test('number finite + number', () => {
    install()

    const left = z.number().finite()
    const right = z.number()
    const faker = new ZodIntersectionFaker(z.intersection(left, right))
    const result = faker['findIntersectedSchemaForNumber'](left, right)
    if (result.success && result.schema instanceof z.ZodNumber) {
      expect(result.schema._def.checks.length).toBe(1)
      expect(result.schema._def.checks.find(check => check.kind === 'finite')).toBeTruthy()
    }
    expect.assertions(2)
  })

  test('number + number multipleOf', () => {
    install()

    const left = z.number()
    const right = z.number().multipleOf(10)
    const faker = new ZodIntersectionFaker(z.intersection(left, right))
    const result = faker['findIntersectedSchemaForNumber'](left, right)
    if (result.success && result.schema instanceof z.ZodNumber) {
      expect(result.schema._def.checks.length).toBe(1)
      expect(result.schema._def.checks.find(check => check.kind === 'multipleOf' && check.value === 10)).toBeTruthy()
    }
    expect.assertions(2)
  })

  test('number multipleOf + number', () => {
    install()

    const left = z.number().multipleOf(10)
    const right = z.number()
    const faker = new ZodIntersectionFaker(z.intersection(left, right))
    const result = faker['findIntersectedSchemaForNumber'](left, right)
    if (result.success && result.schema instanceof z.ZodNumber) {
      expect(result.schema._def.checks.length).toBe(1)
      expect(result.schema._def.checks.find(check => check.kind === 'multipleOf' && check.value === 10)).toBeTruthy()
    }
    expect.assertions(2)
  })

  test('number min + number min (larger)', () => {
    install()

    const left = z.number().min(10)
    const right = z.number().min(20)
    const faker = new ZodIntersectionFaker(z.intersection(left, right))
    const result = faker['findIntersectedSchemaForNumber'](left, right)
    if (result.success && result.schema instanceof z.ZodNumber) {
      expect(result.schema._def.checks.length).toBe(1)
      expect(result.schema._def.checks.find(check => check.kind === 'min' && check.value === 20)).toBeTruthy()
    }
    expect.assertions(2)
  })

  test('number min (larger) + number min', () => {
    install()

    const left = z.number().min(20)
    const right = z.number().min(10)
    const faker = new ZodIntersectionFaker(z.intersection(left, right))
    const result = faker['findIntersectedSchemaForNumber'](left, right)
    if (result.success && result.schema instanceof z.ZodNumber) {
      expect(result.schema._def.checks.length).toBe(1)
      expect(result.schema._def.checks.find(check => check.kind === 'min' && check.value === 20)).toBeTruthy()
    }
    expect.assertions(2)
  })

  test('number max + number max (larger)', () => {
    install()

    const left = z.number().max(10)
    const right = z.number().max(20)
    const faker = new ZodIntersectionFaker(z.intersection(left, right))
    const result = faker['findIntersectedSchemaForNumber'](left, right)
    if (result.success && result.schema instanceof z.ZodNumber) {
      expect(result.schema._def.checks.length).toBe(1)
      expect(result.schema._def.checks.find(check => check.kind === 'max' && check.value === 10)).toBeTruthy()
    }
    expect.assertions(2)
  })

  test('number max (larger) + number max', () => {
    install()

    const left = z.number().max(20)
    const right = z.number().max(10)
    const faker = new ZodIntersectionFaker(z.intersection(left, right))
    const result = faker['findIntersectedSchemaForNumber'](left, right)
    if (result.success && result.schema instanceof z.ZodNumber) {
      expect(result.schema._def.checks.length).toBe(1)
      expect(result.schema._def.checks.find(check => check.kind === 'max' && check.value === 10)).toBeTruthy()
    }
    expect.assertions(2)
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

  testMultipleTimes('string + string max', () => {
    install()

    const schema = z.intersection(z.string(), z.string().max(100))
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })

  testMultipleTimes('string + string length', () => {
    install()

    const schema = z.intersection(z.string(), z.string().length(100))
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })

  testMultipleTimes('string + string endsWith', () => {
    install()

    const schema = z.intersection(z.string(), z.string().endsWith('foo'))
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })

  testMultipleTimes('string + string includes', () => {
    install()

    const schema = z.intersection(z.string(), z.string().includes('foo'))
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })

  testMultipleTimes('string + string startsWith', () => {
    install()

    const schema = z.intersection(z.string(), z.string().startsWith('foo'))
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })

  testMultipleTimes('string + string toLowerCase', () => {
    install()

    const schema = z.intersection(z.string(), z.string().toLowerCase())
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })

  testMultipleTimes('string + string toUpperCase', () => {
    install()

    const schema = z.intersection(z.string(), z.string().toUpperCase())
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })

  testMultipleTimes('string + string trim', () => {
    install()

    const schema = z.intersection(z.string(), z.string().trim())
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })

  testMultipleTimes('string + string emoji', () => {
    install()

    const schema = z.intersection(z.string(), z.string().emoji())
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })

  testMultipleTimes('string + string dedicated', () => {
    install()

    const schema = z.intersection(z.string(), z.string().email())
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })

  testMultipleTimes('string min + string ', () => {
    install()

    const schema = z.intersection(z.string().min(100), z.string())
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })

  testMultipleTimes('string max + string ', () => {
    install()

    const schema = z.intersection(z.string().max(100), z.string())
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })

  testMultipleTimes('string length + string ', () => {
    install()

    const schema = z.intersection(z.string().length(100), z.string())
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })

  testMultipleTimes('string endsWith + string ', () => {
    install()

    const schema = z.intersection(z.string().endsWith('foo'), z.string())
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })

  testMultipleTimes('string includes + string ', () => {
    install()

    const schema = z.intersection(z.string().includes('foo'), z.string())
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })

  testMultipleTimes('string startsWith + string ', () => {
    install()

    const schema = z.intersection(z.string().startsWith('foo'), z.string())
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })

  testMultipleTimes('string toLowerCase + string ', () => {
    install()

    const schema = z.intersection(z.string().toLowerCase(), z.string())
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })

  testMultipleTimes('string toUpperCase + string ', () => {
    install()

    const schema = z.intersection(z.string().toUpperCase(), z.string())
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })

  testMultipleTimes('string trim + string ', () => {
    install()

    const schema = z.intersection(z.string().trim(), z.string())
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })

  testMultipleTimes('string emoji + string ', () => {
    install()

    const schema = z.intersection(z.string().emoji(), z.string())
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })

  testMultipleTimes('string dedicated + string', () => {
    install()

    const schema = z.intersection(z.string().email(), z.string())
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })

  testMultipleTimes('string min + string min', () => {
    install()

    const schema = z.intersection(z.string().min(100), z.string().min(200))
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })

  testMultipleTimes('string max + string max', () => {
    install()

    const schema = z.intersection(z.string().max(100), z.string().max(200))
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })

  testMultipleTimes('string min + string length', () => {
    install()

    const schema = z.intersection(z.string().min(100), z.string().length(200))
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })

  testMultipleTimes('string length + string min', () => {
    install()

    const schema = z.intersection(z.string().length(200), z.string().min(100))
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })

  testMultipleTimes('string max + string length', () => {
    install()

    const schema = z.intersection(z.string().max(200), z.string().length(100))
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })

  testMultipleTimes('string length + string max', () => {
    install()

    const schema = z.intersection(z.string().length(100), z.string().max(200))
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

  test('bigint + bigint min', () => {
    install()

    const left = z.bigint()
    const right = z.bigint().min(10n)
    const faker = new ZodIntersectionFaker(z.intersection(left, right))
    const result = faker['findIntersectedSchemaForBigint'](left, right)
    if (result.success && result.schema instanceof z.ZodBigInt) {
      expect(result.schema._def.checks.length).toBe(1)
      expect(result.schema._def.checks.find(check => check.kind === 'min' && check.value === 10n)).toBeTruthy()
    }
    expect.assertions(2)
  })

  test('bigint min + bigint', () => {
    install()

    const left = z.bigint().min(10n)
    const right = z.bigint()
    const faker = new ZodIntersectionFaker(z.intersection(left, right))
    const result = faker['findIntersectedSchemaForBigint'](left, right)
    if (result.success && result.schema instanceof z.ZodBigInt) {
      expect(result.schema._def.checks.length).toBe(1)
      expect(result.schema._def.checks.find(check => check.kind === 'min' && check.value === 10n)).toBeTruthy()
    }
    expect.assertions(2)
  })

  test('bigint + bigint max', () => {
    install()

    const left = z.bigint()
    const right = z.bigint().max(10n)
    const faker = new ZodIntersectionFaker(z.intersection(left, right))
    const result = faker['findIntersectedSchemaForBigint'](left, right)
    if (result.success && result.schema instanceof z.ZodBigInt) {
      expect(result.schema._def.checks.length).toBe(1)
      expect(result.schema._def.checks.find(check => check.kind === 'max' && check.value === 10n)).toBeTruthy()
    }
    expect.assertions(2)
  })

  test('bigint max + bigint', () => {
    install()

    const left = z.bigint().max(10n)
    const right = z.bigint()
    const faker = new ZodIntersectionFaker(z.intersection(left, right))
    const result = faker['findIntersectedSchemaForBigint'](left, right)
    if (result.success && result.schema instanceof z.ZodBigInt) {
      expect(result.schema._def.checks.length).toBe(1)
      expect(result.schema._def.checks.find(check => check.kind === 'max' && check.value === 10n)).toBeTruthy()
    }
    expect.assertions(2)
  })

  test('bigint + bigint multipleOf', () => {
    install()

    const left = z.bigint()
    const right = z.bigint().multipleOf(10n)
    const faker = new ZodIntersectionFaker(z.intersection(left, right))
    const result = faker['findIntersectedSchemaForBigint'](left, right)
    if (result.success && result.schema instanceof z.ZodBigInt) {
      expect(result.schema._def.checks.length).toBe(1)
      expect(result.schema._def.checks.find(check => check.kind === 'multipleOf' && check.value === 10n)).toBeTruthy()
    }
    expect.assertions(2)
  })

  test('bigint multipleOf + bigint', () => {
    install()

    const left = z.bigint().multipleOf(10n)
    const right = z.bigint()
    const faker = new ZodIntersectionFaker(z.intersection(left, right))
    const result = faker['findIntersectedSchemaForBigint'](left, right)
    if (result.success && result.schema instanceof z.ZodBigInt) {
      expect(result.schema._def.checks.length).toBe(1)
      expect(result.schema._def.checks.find(check => check.kind === 'multipleOf' && check.value === 10n)).toBeTruthy()
    }
    expect.assertions(2)
  })

  test('bigint min + bigint min (larger)', () => {
    install()

    const left = z.bigint().min(10n)
    const right = z.bigint().min(20n)
    const faker = new ZodIntersectionFaker(z.intersection(left, right))
    const result = faker['findIntersectedSchemaForBigint'](left, right)
    if (result.success && result.schema instanceof z.ZodBigInt) {
      expect(result.schema._def.checks.length).toBe(1)
      expect(result.schema._def.checks.find(check => check.kind === 'min' && check.value === 20n)).toBeTruthy()
    }
    expect.assertions(2)
  })

  test('bigint min (larger) + bigint min', () => {
    install()

    const left = z.bigint().min(20n)
    const right = z.bigint().min(10n)
    const faker = new ZodIntersectionFaker(z.intersection(left, right))
    const result = faker['findIntersectedSchemaForBigint'](left, right)
    if (result.success && result.schema instanceof z.ZodBigInt) {
      expect(result.schema._def.checks.length).toBe(1)
      expect(result.schema._def.checks.find(check => check.kind === 'min' && check.value === 20n)).toBeTruthy()
    }
    expect.assertions(2)
  })

  test('bigint max + bigint max (larger)', () => {
    install()

    const left = z.bigint().max(10n)
    const right = z.bigint().max(20n)
    const faker = new ZodIntersectionFaker(z.intersection(left, right))
    const result = faker['findIntersectedSchemaForBigint'](left, right)
    if (result.success && result.schema instanceof z.ZodBigInt) {
      expect(result.schema._def.checks.length).toBe(1)
      expect(result.schema._def.checks.find(check => check.kind === 'max' && check.value === 10n)).toBeTruthy()
    }
    expect.assertions(2)
  })

  test('bigint max (larger) + bigint max', () => {
    install()

    const left = z.bigint().max(20n)
    const right = z.bigint().max(10n)
    const faker = new ZodIntersectionFaker(z.intersection(left, right))
    const result = faker['findIntersectedSchemaForBigint'](left, right)
    if (result.success && result.schema instanceof z.ZodBigInt) {
      expect(result.schema._def.checks.length).toBe(1)
      expect(result.schema._def.checks.find(check => check.kind === 'max' && check.value === 10n)).toBeTruthy()
    }
    expect.assertions(2)
  })
})

describe('readonly', () => {
  testMultipleTimes('readonly array', () => {
    install()

    const schema = z.intersection(z.array(z.date()).readonly(), z.array(z.date()).readonly())
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })

  testMultipleTimes('readonly object', () => {
    install()

    const schema = z.intersection(
      z.object({ foo: z.date().min(new Date(0)) }).readonly(),
      z.object({ foo: z.date().max(new Date(0)) }).readonly(),
    )
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })

  testMultipleTimes('readonly tuple', () => {
    install()

    const schema = z.intersection(
      z.tuple([z.date(), z.number()]).readonly(),
      z.tuple([z.date(), z.number()]).readonly(),
    )
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })

  testMultipleTimes('readonly record', () => {
    install()

    const schema = z.intersection(z.record(z.date()).readonly(), z.record(z.date()).readonly())
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data: data })
  })
})

describe('lazy', () => {
  testMultipleTimes('lazy + non-lazy', () => {
    install()

    const schema = z.intersection(
      z.lazy(() => z.date()),
      z.date(),
    )
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })

  testMultipleTimes('non-lazy + lazy', () => {
    install()

    const schema = z.intersection(
      z.date(),
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
