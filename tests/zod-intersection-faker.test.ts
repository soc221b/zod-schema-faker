import { describe, expect, test } from 'vitest'
import { z } from 'zod'
import { ZodIntersectionFaker } from '../src/zod-intersection-faker'
import { expectType, TypeEqual } from 'ts-expect'
import { install, installCustom, runFake, ZodTypeFaker } from '../src'
import { testMultipleTimes } from './util'

const Person = z.object({
  name: z.string(),
})
const Employee = z.object({
  role: z.string(),
})

describe('TODO', () => {
  test('intersection 1', () => {
    install()

    const left = z.record(z.literal('a'), z.date().min(new Date(0)))
    const right = z.record(z.literal('b'), z.date().max(new Date(0)))
    const schema = z.intersection(left, right)
    type T = z.infer<typeof schema>
    const data: T = {
      a: new Date(0),
    }
    expect(schema.safeParse(data).error).toMatchInlineSnapshot(`
      [ZodError: [
        {
          "received": "a",
          "code": "invalid_literal",
          "expected": "b",
          "path": [
            "a"
          ],
          "message": "Invalid literal value, expected \\"b\\""
        }
      ]]
    `)
  })

  test('intersection 2', () => {
    install()

    const left = z.object({ name: z.object({ first: z.string() }) })
    const right = z.record(z.enum(['a', 'b']), z.object({ sub: z.string() }))
    const schema = z.intersection(left, right)
    type T = z.infer<typeof schema>
    const data: T = {
      a: { sub: 'sub' },
      name: { first: 'first' },
    }
    expect(schema.safeParse(data).error).toMatchInlineSnapshot(`
      [ZodError: [
        {
          "received": "name",
          "code": "invalid_enum_value",
          "options": [
            "a",
            "b"
          ],
          "path": [
            "name"
          ],
          "message": "Invalid enum value. Expected 'a' | 'b', received 'name'"
        },
        {
          "code": "invalid_type",
          "expected": "string",
          "received": "undefined",
          "path": [
            "name",
            "sub"
          ],
          "message": "Required"
        }
      ]]
    `)
  })

  test('intersection 3', () => {
    install()

    const left = z.record(z.union([z.literal('one'), z.literal('two'), z.literal('three')]), z.string())
    const right = z.record(z.union([z.literal('ones'), z.literal('twos'), z.literal('threes')]), z.string().array())
    const schema = z.intersection(left, right)
    type T = z.infer<typeof schema>
    const data: T = {
      one: 'foo',
      ones: ['bar', 'baz'],
    }
    expect(schema.safeParse(data).error).toMatchInlineSnapshot(`
      [ZodError: [
        {
          "code": "invalid_union",
          "unionErrors": [
            {
              "issues": [
                {
                  "received": "ones",
                  "code": "invalid_literal",
                  "expected": "one",
                  "path": [
                    "ones"
                  ],
                  "message": "Invalid literal value, expected \\"one\\""
                }
              ],
              "name": "ZodError"
            },
            {
              "issues": [
                {
                  "received": "ones",
                  "code": "invalid_literal",
                  "expected": "two",
                  "path": [
                    "ones"
                  ],
                  "message": "Invalid literal value, expected \\"two\\""
                }
              ],
              "name": "ZodError"
            },
            {
              "issues": [
                {
                  "received": "ones",
                  "code": "invalid_literal",
                  "expected": "three",
                  "path": [
                    "ones"
                  ],
                  "message": "Invalid literal value, expected \\"three\\""
                }
              ],
              "name": "ZodError"
            }
          ],
          "path": [
            "ones"
          ],
          "message": "Invalid input"
        },
        {
          "code": "invalid_type",
          "expected": "string",
          "received": "array",
          "path": [
            "ones"
          ],
          "message": "Expected string, received array"
        },
        {
          "code": "invalid_union",
          "unionErrors": [
            {
              "issues": [
                {
                  "received": "one",
                  "code": "invalid_literal",
                  "expected": "ones",
                  "path": [
                    "one"
                  ],
                  "message": "Invalid literal value, expected \\"ones\\""
                }
              ],
              "name": "ZodError"
            },
            {
              "issues": [
                {
                  "received": "one",
                  "code": "invalid_literal",
                  "expected": "twos",
                  "path": [
                    "one"
                  ],
                  "message": "Invalid literal value, expected \\"twos\\""
                }
              ],
              "name": "ZodError"
            },
            {
              "issues": [
                {
                  "received": "one",
                  "code": "invalid_literal",
                  "expected": "threes",
                  "path": [
                    "one"
                  ],
                  "message": "Invalid literal value, expected \\"threes\\""
                }
              ],
              "name": "ZodError"
            }
          ],
          "path": [
            "one"
          ],
          "message": "Invalid input"
        },
        {
          "code": "invalid_type",
          "expected": "array",
          "received": "string",
          "path": [
            "one"
          ],
          "message": "Expected array, received string"
        }
      ]]
    `)
  })

  test('intersection 4', () => {
    const fooKeySchema = z.custom<`foo.${string}`>(val => {
      return typeof val === 'string' ? /^foo\..*$/.test(val) : false
    })
    class ZodFooKeyFaker extends ZodTypeFaker<typeof fooKeySchema> {
      fake(): `foo.${string}` {
        return `foo.${runFake(faker => faker.lorem.word())}`
      }
    }
    install()
    installCustom(fooKeySchema, ZodFooKeyFaker)

    const left = z.record(fooKeySchema, z.string())
    const right = z.object({ bar: z.string().optional() }).strip()
    const schema = z.intersection(left, right)
    type T = z.infer<typeof schema>
    const data: T = {
      bar: 'bar',
      'foo.bar': 'bar',
    }
    expect(schema.safeParse(data).error).toMatchInlineSnapshot(`
      [ZodError: [
        {
          "code": "custom",
          "fatal": true,
          "path": [
            "bar"
          ],
          "message": "Invalid input"
        }
      ]]
    `)
  })
})

describe('N/A', () => {
  test('nan + nan', () => {
    // This may work in the future, but for now, it doesn't.
    const innerSchema = z.nan()
    const schema = z.intersection(innerSchema, innerSchema)
    const data = NaN

    expect(innerSchema.safeParse(data).success).toEqual(true)
    expect(schema.safeParse(data).error).toMatchInlineSnapshot(`
      [ZodError: [
        {
          "code": "invalid_intersection_types",
          "path": [],
          "message": "Intersection results could not be merged"
        }
      ]]
    `)
  })

  test('map + map', () => {
    // This may work in the future, but for now, it doesn't.

    const innerSchema = z.map(z.string(), z.number())
    const schema = z.intersection(innerSchema, innerSchema)
    const data = new Map([['a', 1]])

    expect(innerSchema.safeParse(data).success).toEqual(true)
    expect(schema.safeParse(data).error).toMatchInlineSnapshot(`
      [ZodError: [
        {
          "code": "invalid_intersection_types",
          "path": [],
          "message": "Intersection results could not be merged"
        }
      ]]
    `)
  })

  test('set + set', () => {
    // This may work in the future, but for now, it doesn't.

    const innerSchema = z.set(z.number())
    const schema = z.intersection(innerSchema, innerSchema)
    const data = new Set([1])

    expect(innerSchema.safeParse(data).success).toEqual(true)
    expect(schema.safeParse(data).error).toMatchInlineSnapshot(`
      [ZodError: [
        {
          "code": "invalid_intersection_types",
          "path": [],
          "message": "Intersection results could not be merged"
        }
      ]]
    `)
  })

  test('function + function', () => {
    // This may work in the future, but for now, it doesn't.

    const innerSchema = z.function()
    const schema = z.intersection(innerSchema, innerSchema)
    const data = () => {}

    expect(innerSchema.safeParse(data).success).toEqual(true)
    expect(schema.safeParse(data).error).toMatchInlineSnapshot(`
      [ZodError: [
        {
          "code": "invalid_intersection_types",
          "path": [],
          "message": "Intersection results could not be merged"
        }
      ]]
    `)
  })

  test('promise + promise', () => {
    // This may work in the future, but for now, it doesn't.

    const innerSchema = z.promise(z.number())
    const schema = z.intersection(innerSchema, innerSchema)
    const data = Promise.resolve(1)

    expect(innerSchema.safeParse(data).success).toEqual(true)
    expect(schema.safeParse(data).error).toMatchInlineSnapshot(`
      [ZodError: [
        {
          "code": "invalid_intersection_types",
          "path": [],
          "message": "Intersection results could not be merged"
        }
      ]]
    `)
  })

  test('never + never', () => {
    // This may work in the future, but for now, it doesn't.

    const innerSchema = z.function(z.tuple([]), z.never())
    const schema = z.intersection(innerSchema, innerSchema)
    const data = () => {
      throw Error()
    }

    expect(innerSchema.safeParse(data).success).toEqual(true)
    expect(schema.safeParse(data).error).toMatchInlineSnapshot(`
      [ZodError: [
        {
          "code": "invalid_intersection_types",
          "path": [],
          "message": "Intersection results could not be merged"
        }
      ]]
    `)
  })

  test('preprocess', () => {
    // It doesn't make sense to have preprocess in one side and not in the other side,
    // or to have preprocess in both sides but with different preprocess functions.
    // Thus, we don't support to find the intersected schema in a schema with preprocess.

    const fromNumber = (value: unknown) => {
      if (typeof value === 'number') {
        return new Date(value)
      }
      return undefined
    }
    const fromISOString = (value: unknown) => {
      if (typeof value === 'string') {
        return new Date(value)
      }
      return undefined
    }
    const schema = z.date()
    const fromNumberSchema = z.preprocess(fromNumber, schema)
    const fromISOStringSchema = z.preprocess(fromISOString, schema)
    const noIntersection1 = z.intersection(schema, fromISOStringSchema)
    const noIntersection2 = z.intersection(fromNumberSchema, schema)
    const noIntersection3 = z.intersection(fromNumberSchema, fromISOStringSchema)
    const data = false

    expect(fromNumberSchema.safeParse(data).error).toMatchInlineSnapshot(`
      [ZodError: [
        {
          "code": "invalid_type",
          "expected": "date",
          "received": "undefined",
          "path": [],
          "message": "Required"
        }
      ]]
    `)
    expect(fromISOStringSchema.safeParse(data).error).toMatchInlineSnapshot(`
      [ZodError: [
        {
          "code": "invalid_type",
          "expected": "date",
          "received": "undefined",
          "path": [],
          "message": "Required"
        }
      ]]
    `)
    expect(noIntersection1.safeParse(data).error).toMatchInlineSnapshot(`
      [ZodError: [
        {
          "code": "invalid_type",
          "expected": "date",
          "received": "boolean",
          "path": [],
          "message": "Expected date, received boolean"
        },
        {
          "code": "invalid_type",
          "expected": "date",
          "received": "undefined",
          "path": [],
          "message": "Required"
        }
      ]]
    `)
    expect(noIntersection2.safeParse(data).error).toMatchInlineSnapshot(`
      [ZodError: [
        {
          "code": "invalid_type",
          "expected": "date",
          "received": "undefined",
          "path": [],
          "message": "Required"
        },
        {
          "code": "invalid_type",
          "expected": "date",
          "received": "boolean",
          "path": [],
          "message": "Expected date, received boolean"
        }
      ]]
    `)
    expect(noIntersection3.safeParse(data).error).toMatchInlineSnapshot(`
      [ZodError: [
        {
          "code": "invalid_type",
          "expected": "date",
          "received": "undefined",
          "path": [],
          "message": "Required"
        },
        {
          "code": "invalid_type",
          "expected": "date",
          "received": "undefined",
          "path": [],
          "message": "Required"
        }
      ]]
    `)
  })

  test('transform', () => {
    // It doesn't make sense to have transform in one side and not in the other side,
    // or to have transform in both sides but with different transform functions.
    // Thus, we don't support to find the intersected schema in a schema with transform.

    const schema = z.date()
    const toISOString = schema.transform(date => date.toISOString())
    const toTimestamp = schema.transform(date => date.getTime())
    const noIntersection1 = z.intersection(schema, toTimestamp)
    const noIntersection2 = z.intersection(toISOString, schema)
    const noIntersection3 = z.intersection(toISOString, toTimestamp)
    const data = new Date()

    expect(noIntersection1.safeParse(data).error).toMatchInlineSnapshot(`
      [ZodError: [
        {
          "code": "invalid_intersection_types",
          "path": [],
          "message": "Intersection results could not be merged"
        }
      ]]
    `)
    expect(noIntersection2.safeParse(data).error).toMatchInlineSnapshot(`
      [ZodError: [
        {
          "code": "invalid_intersection_types",
          "path": [],
          "message": "Intersection results could not be merged"
        }
      ]]
    `)
    expect(noIntersection3.safeParse(data).error).toMatchInlineSnapshot(`
      [ZodError: [
        {
          "code": "invalid_intersection_types",
          "path": [],
          "message": "Intersection results could not be merged"
        }
      ]]
    `)
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
  test('any + the other', () => {
    install()

    const left = z.any()
    const right = z.date()
    const schema = z.intersection(left, right)
    const faker = new ZodIntersectionFaker(schema)
    const result = faker.findIntersectedSchema(left, right)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.schema).toBeInstanceOf(z.ZodDate)
    }
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
    expect.assertions(3)
  })

  test('the other + any', () => {
    install()

    const left = z.date()
    const right = z.any()
    const schema = z.intersection(left, right)
    const faker = new ZodIntersectionFaker(schema)
    const result = faker.findIntersectedSchema(left, right)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.schema).toBeInstanceOf(z.ZodDate)
    }
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
    expect.assertions(3)
  })
})

describe('unknown', () => {
  test('unknown + the other', () => {
    install()

    const left = z.unknown()
    const right = z.date()
    const schema = z.intersection(left, right)
    const faker = new ZodIntersectionFaker(schema)
    const result = faker.findIntersectedSchema(left, right)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.schema).toBeInstanceOf(z.ZodDate)
    }
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
    expect.assertions(3)
  })

  test('the other + unknown', () => {
    install()

    const left = z.date()
    const right = z.unknown()
    const schema = z.intersection(left, right)
    const faker = new ZodIntersectionFaker(schema)
    const result = faker.findIntersectedSchema(left, right)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.schema).toBeInstanceOf(z.ZodDate)
    }
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
    expect.assertions(3)
  })
})

describe('undefined', () => {
  test('undefined + undefined', () => {
    install()

    const schema = z.intersection(z.undefined(), z.undefined())
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })

  test('undefined + optional', () => {
    install()

    const schema = z.intersection(z.undefined(), z.date().optional())
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })

  test('undefined + nullish', () => {
    install()

    const schema = z.intersection(z.undefined(), z.date().nullish())
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })

  test('undefined + the-other', () => {
    install()

    const schema = z.intersection(z.undefined(), z.date())
    const faker = new ZodIntersectionFaker(schema)
    expect(() => faker.fake()).toThrow()
  })

  test('optional + undefined', () => {
    install()

    const schema = z.intersection(z.date().optional(), z.undefined())
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })

  test('nullish + undefined', () => {
    install()

    const schema = z.intersection(z.date().nullish(), z.undefined())
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })

  test('the-other + undefined', () => {
    install()

    const schema = z.intersection(z.date(), z.undefined())
    const faker = new ZodIntersectionFaker(schema)
    expect(() => faker.fake()).toThrow()
  })
})

describe('optional', () => {
  test('optional + optional', () => {
    install()

    const schema = z.intersection(z.date().optional(), z.boolean().optional())
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })

  test('optional + optional (sometimes undefined)', () => {
    install()

    const schema = z.intersection(z.date().optional(), z.date().optional())
    const faker = new ZodIntersectionFaker(schema)
    let safeCount = 0
    while (++safeCount < 100) {
      const data = faker.fake()
      if (schema.safeParse(data).success && data === undefined) {
        return
      }
    }
    expect.unreachable()
  })

  test('optional + nullish', () => {
    install()

    const schema = z.intersection(z.date().optional(), z.boolean().nullish())
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })

  test('optional + the other', () => {
    install()

    const schema = z.intersection(z.date().optional(), z.date())
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })

  test('optional + the other (no common value)', () => {
    install()

    const schema = z.intersection(z.date().optional(), z.boolean())
    const faker = new ZodIntersectionFaker(schema)
    expect(() => faker.fake()).toThrow()
  })

  test('nullish + optional', () => {
    install()

    const schema = z.intersection(z.date().nullish(), z.boolean().optional())
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })

  test('the other + optional', () => {
    install()

    const schema = z.intersection(z.date(), z.date().optional())
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })

  test('the other + optional (no common value)', () => {
    install()

    const schema = z.intersection(z.boolean(), z.date().optional())
    const faker = new ZodIntersectionFaker(schema)
    expect(() => faker.fake()).toThrow()
  })
})

describe('null', () => {
  test('null + null', () => {
    install()

    const schema = z.intersection(z.null(), z.null())
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })

  test('null + nullable', () => {
    install()

    const schema = z.intersection(z.null(), z.date().nullable())
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })

  test('null + nullish', () => {
    install()

    const schema = z.intersection(z.null(), z.date().nullish())
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })

  test('nullable + null', () => {
    install()

    const schema = z.intersection(z.date().nullable(), z.null())
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })

  test('nullish + null', () => {
    install()

    const schema = z.intersection(z.date().nullish(), z.null())
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })
})

describe('nullable', () => {
  test('nullable + nullable', () => {
    install()

    const schema = z.intersection(z.date().nullable(), z.boolean().nullable())
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })

  test('nullable + nullable (sometimes null)', () => {
    install()

    const schema = z.intersection(z.date().nullable(), z.date().nullable())
    const faker = new ZodIntersectionFaker(schema)
    let safeCount = 0
    while (++safeCount < 100) {
      const data = faker.fake()
      if (schema.safeParse(data).success && data === null) {
        return
      }
    }
    expect.unreachable()
  })

  test('nullable + nullish', () => {
    install()

    const schema = z.intersection(z.date().nullable(), z.boolean().nullish())
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })

  test('nullable + the other', () => {
    install()

    const schema = z.intersection(z.date().nullable(), z.date())
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })

  test('nullable + the other (no common value)', () => {
    install()

    const schema = z.intersection(z.date().nullable(), z.boolean())
    const faker = new ZodIntersectionFaker(schema)
    expect(() => faker.fake()).toThrow()
  })

  test('nullish + nullable', () => {
    install()

    const schema = z.intersection(z.date().nullish(), z.boolean().nullable())
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })

  test('the other + nullable', () => {
    install()

    const schema = z.intersection(z.date(), z.date().nullable())
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })

  test('the other + nullable (no common value)', () => {
    install()

    const schema = z.intersection(z.boolean(), z.date().nullable())
    const faker = new ZodIntersectionFaker(schema)
    expect(() => faker.fake()).toThrow()
  })
})

describe('nullish', () => {
  test('nullish + nullish', () => {
    install()

    const schema = z.intersection(z.date().nullish(), z.boolean().nullish())
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })

  test('nullish + nullish (sometimes null)', () => {
    install()

    const schema = z.intersection(z.date().nullish(), z.date().nullish())
    const faker = new ZodIntersectionFaker(schema)
    let safeCount = 0
    while (++safeCount < 100) {
      const data = faker.fake()
      if (schema.safeParse(data).success && data === null) {
        return
      }
    }
    expect.unreachable()
  })

  test('nullish + nullish (sometimes undefined)', () => {
    install()

    const schema = z.intersection(z.date().nullish(), z.date().nullish())
    const faker = new ZodIntersectionFaker(schema)
    let safeCount = 0
    while (++safeCount < 100) {
      const data = faker.fake()
      if (schema.safeParse(data).success && data === undefined) {
        return
      }
    }
    expect.unreachable()
  })

  test('nullish + the other', () => {
    install()

    const schema = z.intersection(z.date().nullish(), z.date())
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })

  test('nullish + the other (no common value)', () => {
    install()

    const schema = z.intersection(z.date().nullish(), z.boolean())
    const faker = new ZodIntersectionFaker(schema)
    expect(() => faker.fake()).toThrow()
  })

  test('the other + nullish', () => {
    install()

    const schema = z.intersection(z.date(), z.date().nullish())
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })

  test('the other + nullish (no common value)', () => {
    install()

    const schema = z.intersection(z.boolean(), z.date().nullish())
    const faker = new ZodIntersectionFaker(schema)
    expect(() => faker.fake()).toThrow()
  })
})

describe('object', () => {
  describe('unrelated', () => {
    test('object + object catchall', () => {
      install()

      const left = z.object({ foo: z.string().min(5) })
      const right = z.object({}).catchall(z.string().max(0))
      const schema = z.intersection(left, right)
      const faker = new ZodIntersectionFaker(schema)
      expect(() => faker.fake()).toThrow()
    })

    test('object catchall + object', () => {
      install()

      const left = z.object({}).catchall(z.string().max(0))
      const right = z.object({ foo: z.string().min(5) })
      const schema = z.intersection(left, right)
      const faker = new ZodIntersectionFaker(schema)
      expect(() => faker.fake()).toThrow()
    })
  })

  test('object + object', () => {
    install()

    const schema = z.intersection(Person, Employee)
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })

  describe('strict', () => {
    test('object strict + object strip', () => {
      install()

      const left = z.object({ foo: z.string(), date: z.date().min(new Date(0)) }).strict()
      const right = z.object({ bar: z.number().optional(), date: z.date().max(new Date(0)) }).strip()
      const schema = z.intersection(left, right)
      expect(schema.safeParse({ foo: 'foo', date: new Date(0) }).success).toBe(true)
      const faker = new ZodIntersectionFaker(schema)
      expectType<TypeEqual<ReturnType<typeof faker.fake>, z.infer<typeof schema>>>(true)
      const result = faker.findIntersectedSchema(left, right)
      if (result.success) {
        const schema = result.schema
        if (schema instanceof z.ZodObject) {
          const date = schema.shape.date
          if (date instanceof z.ZodDate) {
            expect(date._def.checks.length).toBe(2)
            expect(
              date._def.checks.find(check => check.kind === 'min' && check.value === new Date(0).getTime()),
            ).toBeTruthy()
            expect(
              date._def.checks.find(check => check.kind === 'max' && check.value === new Date(0).getTime()),
            ).toBeTruthy()
          }
          expect(schema.shape.foo).toBeInstanceOf(z.ZodString)
          expect(schema.shape.bar).toBeUndefined()
          expect(schema._def.unknownKeys).toBe('strict')
          expect(schema._def.catchall).toBeInstanceOf(z.ZodNever)
        }
      }
      const data = faker.fake()
      expect(schema.safeParse(data)).toEqual({ success: true, data })
      expect.assertions(9)
    })

    test('object strip + object strict', () => {
      install()

      const left = z.object({ foo: z.string().optional(), date: z.date().min(new Date(0)) }).strip()
      const right = z.object({ bar: z.number(), date: z.date().max(new Date(0)) }).strict()
      const schema = z.intersection(left, right)
      expect(schema.safeParse({ bar: 1, date: new Date(0) }).success).toBe(true)
      const faker = new ZodIntersectionFaker(schema)
      expectType<TypeEqual<ReturnType<typeof faker.fake>, z.infer<typeof schema>>>(true)
      const result = faker.findIntersectedSchema(left, right)
      if (result.success) {
        const schema = result.schema
        if (schema instanceof z.ZodObject) {
          const date = schema.shape.date
          if (date instanceof z.ZodDate) {
            expect(date._def.checks.length).toBe(2)
            expect(
              date._def.checks.find(check => check.kind === 'min' && check.value === new Date(0).getTime()),
            ).toBeTruthy()
            expect(
              date._def.checks.find(check => check.kind === 'max' && check.value === new Date(0).getTime()),
            ).toBeTruthy()
          }
          expect(schema.shape.foo).toBeUndefined()
          expect(schema.shape.bar).toBeInstanceOf(z.ZodNumber)
          expect(schema._def.unknownKeys).toBe('strict')
          expect(schema._def.catchall).toBeInstanceOf(z.ZodNever)
        }
      }
      const data = faker.fake()
      expect(schema.safeParse(data)).toEqual({ success: true, data })
      expect.assertions(9)
    })

    test('object strict + object passthrough', () => {
      install()

      const left = z.object({ foo: z.string(), date: z.date().min(new Date(0)) }).strict()
      const right = z.object({ bar: z.number().optional(), date: z.date().max(new Date(0)) }).passthrough()
      const schema = z.intersection(left, right)
      expect(schema.safeParse({ foo: 'foo', date: new Date(0) }).success).toBe(true)
      const faker = new ZodIntersectionFaker(schema)
      expectType<TypeEqual<ReturnType<typeof faker.fake>, z.infer<typeof schema>>>(true)
      const result = faker.findIntersectedSchema(left, right)
      if (result.success) {
        const schema = result.schema
        if (schema instanceof z.ZodObject) {
          const date = schema.shape.date
          if (date instanceof z.ZodDate) {
            expect(date._def.checks.length).toBe(2)
            expect(
              date._def.checks.find(check => check.kind === 'min' && check.value === new Date(0).getTime()),
            ).toBeTruthy()
            expect(
              date._def.checks.find(check => check.kind === 'max' && check.value === new Date(0).getTime()),
            ).toBeTruthy()
          }
          expect(schema.shape.foo).toBeInstanceOf(z.ZodString)
          expect(schema.shape.bar).toBeUndefined()
          expect(schema._def.unknownKeys).toBe('strict')
          expect(schema._def.catchall).toBeInstanceOf(z.ZodNever)
        }
      }
      const data = faker.fake()
      expect(schema.safeParse(data)).toEqual({ success: true, data })
      expect.assertions(9)
    })

    test('object passthrough + object strict', () => {
      install()

      const left = z.object({ foo: z.string().optional(), date: z.date().min(new Date(0)) }).passthrough()
      const right = z.object({ bar: z.number(), date: z.date().max(new Date(0)) }).strict()
      const schema = z.intersection(left, right)
      expect(schema.safeParse({ bar: 1, date: new Date(0) }).success).toBe(true)
      const faker = new ZodIntersectionFaker(schema)
      expectType<TypeEqual<ReturnType<typeof faker.fake>, z.infer<typeof schema>>>(true)
      const result = faker.findIntersectedSchema(left, right)
      if (result.success) {
        const schema = result.schema
        if (schema instanceof z.ZodObject) {
          const date = schema.shape.date
          if (date instanceof z.ZodDate) {
            expect(date._def.checks.length).toBe(2)
            expect(
              date._def.checks.find(check => check.kind === 'min' && check.value === new Date(0).getTime()),
            ).toBeTruthy()
            expect(
              date._def.checks.find(check => check.kind === 'max' && check.value === new Date(0).getTime()),
            ).toBeTruthy()
          }
          expect(schema.shape.foo).toBeUndefined()
          expect(schema.shape.bar).toBeInstanceOf(z.ZodNumber)
          expect(schema._def.unknownKeys).toBe('strict')
          expect(schema._def.catchall).toBeInstanceOf(z.ZodNever)
        }
      }
      const data = faker.fake()
      expect(schema.safeParse(data)).toEqual({ success: true, data })
      expect.assertions(9)
    })

    test('object strict + object catchall', () => {
      install()

      const left = z.object({ string: z.string().min(5), date: z.date().min(new Date(0)) }).strict()
      const right = z.object({ date: z.date().max(new Date(0)) }).catchall(z.string().max(10))
      const schema = z.intersection(left, right)
      expect(schema.safeParse({ string: 'foobar', date: new Date(0) }).success).toBe(true)
      const faker = new ZodIntersectionFaker(schema)
      expectType<TypeEqual<ReturnType<typeof faker.fake>, z.infer<typeof schema>>>(true)
      const result = faker.findIntersectedSchema(left, right)
      if (result.success) {
        const schema = result.schema
        if (schema instanceof z.ZodObject) {
          const date = schema.shape.date
          if (date instanceof z.ZodDate) {
            expect(date._def.checks.length).toBe(2)
            expect(
              date._def.checks.find(check => check.kind === 'min' && check.value === new Date(0).getTime()),
            ).toBeTruthy()
            expect(
              date._def.checks.find(check => check.kind === 'max' && check.value === new Date(0).getTime()),
            ).toBeTruthy()
          }
          const string = schema.shape.string
          if (string instanceof z.ZodString) {
            expect(string._def.checks.length).toBe(2)
            expect(string._def.checks.find(check => check.kind === 'min' && check.value === 5)).toBeTruthy()
            expect(string._def.checks.find(check => check.kind === 'max' && check.value === 10)).toBeTruthy()
          }
          expect(schema._def.unknownKeys).toBe('strict')
          expect(schema._def.catchall).toBeInstanceOf(z.ZodNever)
        }
      }
      const data = faker.fake()
      expect(schema.safeParse(data)).toEqual({ success: true, data })
      expect.assertions(10)
    })

    test('object catchall + object strict', () => {
      install()

      const left = z.object({ date: z.date().max(new Date(0)) }).catchall(z.string().max(10))
      const right = z.object({ string: z.string().min(5), date: z.date().min(new Date(0)) }).strict()
      const schema = z.intersection(left, right)
      expect(schema.safeParse({ string: 'foobar', date: new Date(0) }).success).toBe(true)
      const faker = new ZodIntersectionFaker(schema)
      expectType<TypeEqual<ReturnType<typeof faker.fake>, z.infer<typeof schema>>>(true)
      const result = faker.findIntersectedSchema(left, right)
      if (result.success) {
        const schema = result.schema
        if (schema instanceof z.ZodObject) {
          const date = schema.shape.date
          if (date instanceof z.ZodDate) {
            expect(date._def.checks.length).toBe(2)
            expect(
              date._def.checks.find(check => check.kind === 'min' && check.value === new Date(0).getTime()),
            ).toBeTruthy()
            expect(
              date._def.checks.find(check => check.kind === 'max' && check.value === new Date(0).getTime()),
            ).toBeTruthy()
          }
          const string = schema.shape.string
          if (string instanceof z.ZodString) {
            expect(string._def.checks.length).toBe(2)
            expect(string._def.checks.find(check => check.kind === 'min' && check.value === 5)).toBeTruthy()
            expect(string._def.checks.find(check => check.kind === 'max' && check.value === 10)).toBeTruthy()
          }
          expect(schema._def.unknownKeys).toBe('strict')
          expect(schema._def.catchall).toBeInstanceOf(z.ZodNever)
        }
      }
      const data = faker.fake()
      expect(schema.safeParse(data)).toEqual({ success: true, data })
      expect.assertions(10)
    })
  })

  describe('strip', () => {
    test('object strip + object passthrough', () => {
      install()

      const left = z.object({ foo: z.string(), date: z.date().max(new Date(0)) }).strip()
      const right = z.object({ bar: z.number(), date: z.date().min(new Date(0)) }).passthrough()
      const schema = z.intersection(left, right)
      expect(schema.safeParse({ foo: 'foo', bar: 1, date: new Date(0) }).success).toBe(true)
      const faker = new ZodIntersectionFaker(schema)
      expectType<TypeEqual<ReturnType<typeof faker.fake>, z.infer<typeof schema>>>(true)
      const result = faker.findIntersectedSchema(left, right)
      if (result.success) {
        const schema = result.schema
        if (schema instanceof z.ZodObject) {
          const date = schema.shape.date
          if (date instanceof z.ZodDate) {
            expect(date._def.checks.length).toBe(2)
            expect(
              date._def.checks.find(check => check.kind === 'min' && check.value === new Date(0).getTime()),
            ).toBeTruthy()
            expect(
              date._def.checks.find(check => check.kind === 'max' && check.value === new Date(0).getTime()),
            ).toBeTruthy()
          }
          expect(schema.shape.foo).toBeInstanceOf(z.ZodString)
          expect(schema.shape.bar).toBeInstanceOf(z.ZodNumber)
          expect(schema._def.unknownKeys).toBe('strip')
          expect(schema._def.catchall).toBeInstanceOf(z.ZodNever)
        }
      }
      const data = faker.fake()
      expect(schema.safeParse(data)).toEqual({ success: true, data })
      expect.assertions(9)
    })

    test('object passthrough + object strip', () => {
      install()

      const left = z.object({ foo: z.string(), date: z.date().max(new Date(0)) }).passthrough()
      const right = z.object({ bar: z.number(), date: z.date().min(new Date(0)) }).strip()
      const schema = z.intersection(left, right)
      expect(schema.safeParse({ foo: 'foo', bar: 1, date: new Date(0) }).success).toBe(true)
      const faker = new ZodIntersectionFaker(schema)
      expectType<TypeEqual<ReturnType<typeof faker.fake>, z.infer<typeof schema>>>(true)
      const result = faker.findIntersectedSchema(left, right)
      if (result.success) {
        const schema = result.schema
        if (schema instanceof z.ZodObject) {
          const date = schema.shape.date
          if (date instanceof z.ZodDate) {
            expect(date._def.checks.length).toBe(2)
            expect(
              date._def.checks.find(check => check.kind === 'min' && check.value === new Date(0).getTime()),
            ).toBeTruthy()
            expect(
              date._def.checks.find(check => check.kind === 'max' && check.value === new Date(0).getTime()),
            ).toBeTruthy()
          }
          expect(schema.shape.foo).toBeInstanceOf(z.ZodString)
          expect(schema.shape.bar).toBeInstanceOf(z.ZodNumber)
          expect(schema._def.unknownKeys).toBe('strip')
          expect(schema._def.catchall).toBeInstanceOf(z.ZodNever)
        }
      }
      const data = faker.fake()
      expect(schema.safeParse(data)).toEqual({ success: true, data })
      expect.assertions(9)
    })

    test('object strip + object catchall', () => {
      install()

      const left = z.object({ foo: z.string().min(5), date: z.date().min(new Date(0)) }).strip()
      const right = z.object({ date: z.date().max(new Date(0)) }).catchall(z.string().max(10))
      const schema = z.intersection(left, right)
      expect(schema.safeParse({ foo: 'foobar', date: new Date(0), bar: '' }).success).toBe(true)
      expect(schema.safeParse({ foo: 'foobar', date: new Date(0), bar: '' }).data).toEqual({
        foo: 'foobar',
        date: new Date(0),
        bar: '',
      })
      const faker = new ZodIntersectionFaker(schema)
      expectType<TypeEqual<ReturnType<typeof faker.fake>, z.infer<typeof schema>>>(true)
      const result = faker.findIntersectedSchema(left, right)
      if (result.success) {
        const schema = result.schema
        if (schema instanceof z.ZodObject) {
          const date = schema.shape.date
          if (date instanceof z.ZodDate) {
            expect(date._def.checks.length).toBe(2)
            expect(
              date._def.checks.find(check => check.kind === 'min' && check.value === new Date(0).getTime()),
            ).toBeTruthy()
            expect(
              date._def.checks.find(check => check.kind === 'max' && check.value === new Date(0).getTime()),
            ).toBeTruthy()
          }
          const foo = schema.shape.foo
          if (foo instanceof z.ZodString) {
            expect(foo._def.checks.length).toBe(2)
            expect(foo._def.checks.find(check => check.kind === 'min' && check.value === 5)).toBeTruthy()
            expect(foo._def.checks.find(check => check.kind === 'max' && check.value === 10)).toBeTruthy()
          }
          const catchall = schema._def.catchall
          if (catchall instanceof z.ZodString) {
            expect(catchall._def.checks.length).toBe(1)
            expect(catchall._def.checks.find(check => check.kind === 'max' && check.value === 10)).toBeTruthy()
          }
        }
      }
      const data = faker.fake()
      expect(schema.safeParse(data)).toEqual({ success: true, data })
      expect.assertions(11)
    })

    test('object catchall + object strip', () => {
      install()

      const left = z.object({ date: z.date().max(new Date(0)) }).catchall(z.string().max(10))
      const right = z.object({ foo: z.string().min(5), date: z.date().min(new Date(0)) }).strip()
      const schema = z.intersection(left, right)
      expect(schema.safeParse({ foo: 'foobar', date: new Date(0), bar: '' }).success).toBe(true)
      expect(schema.safeParse({ foo: 'foobar', date: new Date(0), bar: '' }).data).toEqual({
        foo: 'foobar',
        date: new Date(0),
        bar: '',
      })
      const faker = new ZodIntersectionFaker(schema)
      expectType<TypeEqual<ReturnType<typeof faker.fake>, z.infer<typeof schema>>>(true)
      const result = faker.findIntersectedSchema(left, right)
      if (result.success) {
        const schema = result.schema
        if (schema instanceof z.ZodObject) {
          const date = schema.shape.date
          if (date instanceof z.ZodDate) {
            expect(date._def.checks.length).toBe(2)
            expect(
              date._def.checks.find(check => check.kind === 'min' && check.value === new Date(0).getTime()),
            ).toBeTruthy()
            expect(
              date._def.checks.find(check => check.kind === 'max' && check.value === new Date(0).getTime()),
            ).toBeTruthy()
          }
          const foo = schema.shape.foo
          if (foo instanceof z.ZodString) {
            expect(foo._def.checks.length).toBe(2)
            expect(foo._def.checks.find(check => check.kind === 'min' && check.value === 5)).toBeTruthy()
            expect(foo._def.checks.find(check => check.kind === 'max' && check.value === 10)).toBeTruthy()
          }
          const catchall = schema._def.catchall
          if (catchall instanceof z.ZodString) {
            expect(catchall._def.checks.length).toBe(1)
            expect(catchall._def.checks.find(check => check.kind === 'max' && check.value === 10)).toBeTruthy()
          }
        }
      }
      const data = faker.fake()
      expect(schema.safeParse(data)).toEqual({ success: true, data })
      expect.assertions(11)
    })
  })

  describe('passthrough', () => {
    test('object passthrough + object passthrough', () => {
      install()

      const left = z.object({ foo: z.string(), date: z.date().max(new Date(0)) }).passthrough()
      const right = z.object({ bar: z.number(), date: z.date().min(new Date(0)) }).passthrough()
      const schema = z.intersection(left, right)
      expect(schema.safeParse({ foo: 'foo', bar: 1, date: new Date(0) }).success).toBe(true)
      const faker = new ZodIntersectionFaker(schema)
      expectType<TypeEqual<ReturnType<typeof faker.fake>, z.infer<typeof schema>>>(true)
      const result = faker.findIntersectedSchema(left, right)
      if (result.success) {
        const schema = result.schema
        if (schema instanceof z.ZodObject) {
          const date = schema.shape.date
          if (date instanceof z.ZodDate) {
            expect(date._def.checks.length).toBe(2)
            expect(
              date._def.checks.find(check => check.kind === 'min' && check.value === new Date(0).getTime()),
            ).toBeTruthy()
            expect(
              date._def.checks.find(check => check.kind === 'max' && check.value === new Date(0).getTime()),
            ).toBeTruthy()
          }
          expect(schema.shape.foo).toBeInstanceOf(z.ZodString)
          expect(schema.shape.bar).toBeInstanceOf(z.ZodNumber)
          expect(schema._def.unknownKeys).toBe('passthrough')
          expect(schema._def.catchall).toBeInstanceOf(z.ZodNever)
        }
      }
      const data = faker.fake()
      expect(schema.safeParse(data)).toEqual({ success: true, data })
      expect.assertions(9)
    })

    test('object passthrough + object catchall', () => {
      install()

      const left = z.object({ foo: z.string().min(5), date: z.date().min(new Date(0)) }).passthrough()
      const right = z.object({ bar: z.number(), date: z.date().max(new Date(0)) }).catchall(z.string().max(10))
      const schema = z.intersection(left, right)
      expect(schema.safeParse({ foo: 'foobar', date: new Date(0), bar: 1, baz: '' }).success).toBe(true)
      expect(schema.safeParse({ foo: 'foobar', date: new Date(0), bar: 1, baz: '' }).data).toEqual({
        foo: 'foobar',
        date: new Date(0),
        bar: 1,
        baz: '',
      })
      const faker = new ZodIntersectionFaker(schema)
      expectType<TypeEqual<ReturnType<typeof faker.fake>, z.infer<typeof schema>>>(true)
      const result = faker.findIntersectedSchema(left, right)
      if (result.success) {
        const schema = result.schema
        if (schema instanceof z.ZodObject) {
          const date = schema.shape.date
          if (date instanceof z.ZodDate) {
            expect(date._def.checks.length).toBe(2)
            expect(
              date._def.checks.find(check => check.kind === 'min' && check.value === new Date(0).getTime()),
            ).toBeTruthy()
            expect(
              date._def.checks.find(check => check.kind === 'max' && check.value === new Date(0).getTime()),
            ).toBeTruthy()
          }
          const foo = schema.shape.foo
          if (foo instanceof z.ZodString) {
            expect(foo._def.checks.length).toBe(2)
            expect(foo._def.checks.find(check => check.kind === 'min' && check.value === 5)).toBeTruthy()
            expect(foo._def.checks.find(check => check.kind === 'max' && check.value === 10)).toBeTruthy()
          }
          expect(schema.shape.bar).toBeInstanceOf(z.ZodNumber)
          const catchall = schema._def.catchall
          if (catchall instanceof z.ZodString) {
            expect(catchall._def.checks.length).toBe(1)
            expect(catchall._def.checks.find(check => check.kind === 'max' && check.value === 10)).toBeTruthy()
          }
        }
      }
      const data = faker.fake()
      expect(schema.safeParse(data)).toEqual({ success: true, data })
      expect.assertions(12)
    })

    test('object catchall + object passthrough', () => {
      install()

      const left = z.object({ bar: z.number(), date: z.date().max(new Date(0)) }).catchall(z.string().max(10))
      const right = z.object({ foo: z.string().min(5), date: z.date().min(new Date(0)) }).passthrough()
      const schema = z.intersection(left, right)
      expect(schema.safeParse({ foo: 'foobar', date: new Date(0), bar: 1, baz: '' }).success).toBe(true)
      expect(schema.safeParse({ foo: 'foobar', date: new Date(0), bar: 1, baz: '' }).data).toEqual({
        foo: 'foobar',
        date: new Date(0),
        bar: 1,
        baz: '',
      })
      const faker = new ZodIntersectionFaker(schema)
      expectType<TypeEqual<ReturnType<typeof faker.fake>, z.infer<typeof schema>>>(true)
      const result = faker.findIntersectedSchema(left, right)
      if (result.success) {
        const schema = result.schema
        if (schema instanceof z.ZodObject) {
          const date = schema.shape.date
          if (date instanceof z.ZodDate) {
            expect(date._def.checks.length).toBe(2)
            expect(
              date._def.checks.find(check => check.kind === 'min' && check.value === new Date(0).getTime()),
            ).toBeTruthy()
            expect(
              date._def.checks.find(check => check.kind === 'max' && check.value === new Date(0).getTime()),
            ).toBeTruthy()
          }
          const foo = schema.shape.foo
          if (foo instanceof z.ZodString) {
            expect(foo._def.checks.length).toBe(2)
            expect(foo._def.checks.find(check => check.kind === 'min' && check.value === 5)).toBeTruthy()
            expect(foo._def.checks.find(check => check.kind === 'max' && check.value === 10)).toBeTruthy()
          }
          expect(schema.shape.bar).toBeInstanceOf(z.ZodNumber)
          const catchall = schema._def.catchall
          if (catchall instanceof z.ZodString) {
            expect(catchall._def.checks.length).toBe(1)
            expect(catchall._def.checks.find(check => check.kind === 'max' && check.value === 10)).toBeTruthy()
          }
        }
      }
      const data = faker.fake()
      expect(schema.safeParse(data)).toEqual({ success: true, data })
      expect.assertions(12)
    })
  })
})

describe('date', () => {
  test('date + date', () => {
    install()

    const schema = z.intersection(z.date(), z.date())
    const faker = new ZodIntersectionFaker(schema)
    const result = faker.findIntersectedSchema(z.date(), z.date())
    if (result.success && result.schema instanceof z.ZodDate) {
      expect(result.schema._def.checks.length).toBe(0)
    }
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
    expect.assertions(2)
  })

  test('date + date min', () => {
    install()

    const left = z.date()
    const right = z.date().min(new Date(123))
    const schema = z.intersection(left, right)
    const faker = new ZodIntersectionFaker(schema)
    const result = faker.findIntersectedSchema(left, right)
    if (result.success && result.schema instanceof z.ZodDate) {
      expect(result.schema._def.checks.length).toBe(1)
      expect(
        result.schema._def.checks.find(check => check.kind === 'min' && check.value === new Date(123).getTime()),
      ).toBeTruthy()
    }
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
    expect.assertions(3)
  })

  test('date min + date', () => {
    install()

    const left = z.date().min(new Date(123))
    const right = z.date()
    const schema = z.intersection(left, right)
    const faker = new ZodIntersectionFaker(schema)
    const result = faker.findIntersectedSchema(left, right)
    if (result.success && result.schema instanceof z.ZodDate) {
      expect(result.schema._def.checks.length).toBe(1)
      expect(
        result.schema._def.checks.find(check => check.kind === 'min' && check.value === new Date(123).getTime()),
      ).toBeTruthy()
    }
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
    expect.assertions(3)
  })

  test('date + date max', () => {
    install()

    const left = z.date()
    const right = z.date().max(new Date(123))
    const schema = z.intersection(left, right)
    const faker = new ZodIntersectionFaker(schema)
    const result = faker.findIntersectedSchema(left, right)
    if (result.success && result.schema instanceof z.ZodDate) {
      expect(result.schema._def.checks.length).toBe(1)
      expect(
        result.schema._def.checks.find(check => check.kind === 'max' && check.value === new Date(123).getTime()),
      ).toBeTruthy()
    }
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
    expect.assertions(3)
  })

  test('date max + date', () => {
    install()

    const left = z.date().max(new Date(123))
    const right = z.date()
    const schema = z.intersection(left, right)
    const faker = new ZodIntersectionFaker(schema)
    const result = faker.findIntersectedSchema(left, right)
    if (result.success && result.schema instanceof z.ZodDate) {
      expect(result.schema._def.checks.length).toBe(1)
      expect(
        result.schema._def.checks.find(check => check.kind === 'max' && check.value === new Date(123).getTime()),
      ).toBeTruthy()
    }
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
    expect.assertions(3)
  })

  test('date min + date min', () => {
    install()

    const left = z.date().min(new Date(123))
    const right = z.date().min(new Date(456))
    const schema = z.intersection(left, right)
    const faker = new ZodIntersectionFaker(schema)
    const result = faker.findIntersectedSchema(left, right)
    if (result.success && result.schema instanceof z.ZodDate) {
      expect(result.schema._def.checks.length).toBe(2)
      expect(
        result.schema._def.checks.find(check => check.kind === 'min' && check.value === new Date(123).getTime()),
      ).toBeTruthy()
      expect(
        result.schema._def.checks.find(check => check.kind === 'min' && check.value === new Date(456).getTime()),
      ).toBeTruthy()
    }
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
    expect.assertions(4)
  })

  test('date max + date max', () => {
    install()

    const left = z.date().max(new Date(123))
    const right = z.date().max(new Date(456))
    const schema = z.intersection(left, right)
    const faker = new ZodIntersectionFaker(schema)
    const result = faker.findIntersectedSchema(left, right)
    if (result.success && result.schema instanceof z.ZodDate) {
      expect(result.schema._def.checks.length).toBe(2)
      expect(
        result.schema._def.checks.find(check => check.kind === 'max' && check.value === new Date(123).getTime()),
      ).toBeTruthy()
      expect(
        result.schema._def.checks.find(check => check.kind === 'max' && check.value === new Date(456).getTime()),
      ).toBeTruthy()
    }
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
    expect.assertions(4)
  })
})

describe('array', () => {
  test('unrelated', () => {
    install()

    const schema = z.intersection(z.array(z.string()), z.array(z.number()))
    const faker = new ZodIntersectionFaker(schema)
    const result = faker.findIntersectedSchema(z.array(z.string()), z.array(z.number()))
    expect(result.success).toBe(false)
    expect.assertions(1)
  })

  test('array (inner type)', () => {
    install()

    const left = z.array(z.date().min(new Date(0)))
    const right = z.array(z.date().max(new Date(0)))
    const schema = z.intersection(left, right)
    const faker = new ZodIntersectionFaker(schema)
    const result = faker.findIntersectedSchema(left, right)
    if (result.success) {
      const schema = result.schema
      if (schema instanceof z.ZodArray) {
        const type = schema._def.type
        if (type instanceof z.ZodDate) {
          expect(type._def.checks.length).toBe(2)
          expect(
            type._def.checks.find(check => check.kind === 'min' && check.value === new Date(0).getTime()),
          ).toBeTruthy()
          expect(
            type._def.checks.find(check => check.kind === 'max' && check.value === new Date(0).getTime()),
          ).toBeTruthy()
        }
      }
    }
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
    expect.assertions(4)
  })

  test('array + array min', () => {
    install()

    const left = z.array(z.date())
    const right = z.array(z.date()).min(3)
    const schema = z.intersection(left, right)
    const faker = new ZodIntersectionFaker(schema)
    const result = faker.findIntersectedSchema(left, right)
    if (result.success && result.schema instanceof z.ZodArray) {
      expect(result.schema._def.minLength?.value).toBe(3)
    }
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
    expect.assertions(2)
  })

  test('array min + array', () => {
    install()

    const left = z.array(z.date()).min(3)
    const right = z.array(z.date())
    const schema = z.intersection(left, right)
    const faker = new ZodIntersectionFaker(schema)
    const result = faker.findIntersectedSchema(left, right)
    if (result.success && result.schema instanceof z.ZodArray) {
      expect(result.schema._def.minLength?.value).toBe(3)
    }
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
    expect.assertions(2)
  })

  test('array + array max', () => {
    install()

    const left = z.array(z.date())
    const right = z.array(z.date()).max(3)
    const schema = z.intersection(left, right)
    const faker = new ZodIntersectionFaker(schema)
    const result = faker.findIntersectedSchema(left, right)
    if (result.success && result.schema instanceof z.ZodArray) {
      expect(result.schema._def.maxLength?.value).toBe(3)
    }
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
    expect.assertions(2)
  })

  test('array max + array', () => {
    install()

    const left = z.array(z.date()).max(3)
    const right = z.array(z.date())
    const schema = z.intersection(left, right)
    const faker = new ZodIntersectionFaker(schema)
    const result = faker.findIntersectedSchema(left, right)
    if (result.success && result.schema instanceof z.ZodArray) {
      expect(result.schema._def.maxLength?.value).toBe(3)
    }
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
    expect.assertions(2)
  })

  test('array + array length', () => {
    install()

    const left = z.array(z.date())
    const right = z.array(z.date()).length(3)
    const schema = z.intersection(left, right)
    const faker = new ZodIntersectionFaker(schema)
    const result = faker.findIntersectedSchema(left, right)
    if (result.success && result.schema instanceof z.ZodArray) {
      expect(result.schema._def.exactLength?.value).toBe(3)
    }
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
    expect.assertions(2)
  })

  test('array length + array', () => {
    install()

    const left = z.array(z.date()).length(3)
    const right = z.array(z.date())
    const schema = z.intersection(left, right)
    const faker = new ZodIntersectionFaker(schema)
    const result = faker.findIntersectedSchema(left, right)
    if (result.success && result.schema instanceof z.ZodArray) {
      expect(result.schema._def.exactLength?.value).toBe(3)
    }
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
    expect.assertions(2)
  })

  test('array min + array min (larger)', () => {
    install()

    const left = z.array(z.date()).min(3)
    const right = z.array(z.date()).min(5)
    const schema = z.intersection(left, right)
    const faker = new ZodIntersectionFaker(schema)
    const result = faker.findIntersectedSchema(left, right)
    if (result.success && result.schema instanceof z.ZodArray) {
      expect(result.schema._def.minLength?.value).toBe(5)
    }
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
    expect.assertions(2)
  })

  test('array min (larger) + array min', () => {
    install()

    const left = z.array(z.date()).min(5)
    const right = z.array(z.date()).min(3)
    const schema = z.intersection(left, right)
    const faker = new ZodIntersectionFaker(schema)
    const result = faker.findIntersectedSchema(left, right)
    if (result.success && result.schema instanceof z.ZodArray) {
      expect(result.schema._def.minLength?.value).toBe(5)
    }
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
    expect.assertions(2)
  })

  test('array + array max (larger)', () => {
    install()

    const left = z.array(z.date()).max(3)
    const right = z.array(z.date()).max(5)
    const schema = z.intersection(left, right)
    const faker = new ZodIntersectionFaker(schema)
    const result = faker.findIntersectedSchema(left, right)
    if (result.success && result.schema instanceof z.ZodArray) {
      expect(result.schema._def.maxLength?.value).toBe(3)
    }
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
    expect.assertions(2)
  })

  test('array max (larger) + array', () => {
    install()

    const left = z.array(z.date()).max(5)
    const right = z.array(z.date()).max(3)
    const schema = z.intersection(left, right)
    const faker = new ZodIntersectionFaker(schema)
    const result = faker.findIntersectedSchema(left, right)
    if (result.success && result.schema instanceof z.ZodArray) {
      expect(result.schema._def.maxLength?.value).toBe(3)
    }
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
    expect.assertions(2)
  })
})

describe('record', () => {
  test('key type other than string is not yet supported', () => {
    install()

    const left = z.record(z.literal('foo'), z.string().min(5))
    const right = z.record(z.literal('bar'), z.string().max(0))
    const schema = z.intersection(left, right)
    const faker = new ZodIntersectionFaker(schema)
    expect(() => faker.fake()).toThrow()
  })

  describe('key type string', () => {
    test('unrelated', () => {
      install()

      const left = z.record(z.string())
      const right = z.record(z.number())
      const schema = z.intersection(left, right)
      const faker = new ZodIntersectionFaker(schema)
      expect(() => faker.fake()).toThrow()
    })

    test('related', () => {
      install()

      const left = z.record(z.date().min(new Date(0)))
      const right = z.record(z.date().max(new Date(0)))
      const schema = z.intersection(left, right)
      const faker = new ZodIntersectionFaker(schema)
      const result = faker.findIntersectedSchema(left, right)
      if (result.success) {
        const schema = result.schema
        if (schema instanceof z.ZodRecord) {
          const valueType = schema._def.valueType
          if (valueType instanceof z.ZodDate) {
            expect(valueType._def.checks.length).toBe(2)
            expect(
              valueType._def.checks.find(check => check.kind === 'min' && check.value === new Date(0).getTime()),
            ).toBeTruthy()
            expect(
              valueType._def.checks.find(check => check.kind === 'max' && check.value === new Date(0).getTime()),
            ).toBeTruthy()
          }
        }
      }
      const data = faker.fake()
      expect(schema.safeParse(data)).toEqual({ success: true, data: data })
      expect.assertions(4)
    })
  })
})

describe('record and object', () => {
  test('unrelated', () => {
    install()

    const left = z.object({ foo: z.string() })
    const right = z.record(z.date())
    const schema = z.intersection(left, right)
    const faker = new ZodIntersectionFaker(schema)
    expect(() => faker.fake()).toThrow()
  })

  test('record + object strict', () => {
    install()

    const left = z.record(z.string().max(9))
    const right = z.object({ foo: z.string().min(3), bar: z.string().min(6) }).strict()
    const schema = z.intersection(left, right)
    const faker = new ZodIntersectionFaker(schema)
    const result = faker.findIntersectedSchema(left, right)
    if (result.success) {
      const schema = result.schema
      if (schema instanceof z.ZodObject) {
        const shape = schema.shape
        const foo = shape['foo']
        if (foo instanceof z.ZodString) {
          expect(foo._def.checks.length).toBe(2)
          expect(foo._def.checks.find(check => check.kind === 'min' && check.value === 3)).toBeTruthy()
          expect(foo._def.checks.find(check => check.kind === 'max' && check.value === 9)).toBeTruthy()
        }
        const bar = shape['bar']
        if (bar instanceof z.ZodString) {
          expect(bar._def.checks.length).toBe(2)
          expect(bar._def.checks.find(check => check.kind === 'min' && check.value === 6)).toBeTruthy()
          expect(bar._def.checks.find(check => check.kind === 'max' && check.value === 9)).toBeTruthy()
        }
        expect(schema._def.unknownKeys).toBe('strict')
        expect(schema._def.catchall).toBeInstanceOf(z.ZodNever)
      }
    }
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data: data })
    expect.assertions(9)
  })

  test('record + object strip', () => {
    install()

    const left = z.record(z.string().max(9))
    const right = z.object({ foo: z.string().min(3), bar: z.string().min(6) }).strip()
    const schema = z.intersection(left, right)
    const faker = new ZodIntersectionFaker(schema)
    const result = faker.findIntersectedSchema(left, right)
    if (result.success) {
      const schema = result.schema
      if (schema instanceof z.ZodObject) {
        const shape = schema.shape
        const foo = shape['foo']
        if (foo instanceof z.ZodString) {
          expect(foo._def.checks.length).toBe(2)
          expect(foo._def.checks.find(check => check.kind === 'min' && check.value === 3)).toBeTruthy()
          expect(foo._def.checks.find(check => check.kind === 'max' && check.value === 9)).toBeTruthy()
        }
        const bar = shape['bar']
        if (bar instanceof z.ZodString) {
          expect(bar._def.checks.length).toBe(2)
          expect(bar._def.checks.find(check => check.kind === 'min' && check.value === 6)).toBeTruthy()
          expect(bar._def.checks.find(check => check.kind === 'max' && check.value === 9)).toBeTruthy()
        }
        expect(schema._def.unknownKeys).toBe('strip')
        expect(schema._def.catchall).toBeInstanceOf(z.ZodNever)
      }
    }
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data: data })
    expect.assertions(9)
  })

  test('record + object passthrough', () => {
    install()

    const left = z.record(z.string().max(9))
    const right = z.object({ foo: z.string().min(3), bar: z.string().min(6) }).passthrough()
    const schema = z.intersection(left, right)
    const faker = new ZodIntersectionFaker(schema)
    const result = faker.findIntersectedSchema(left, right)
    if (result.success) {
      const schema = result.schema
      if (schema instanceof z.ZodObject) {
        const shape = schema.shape
        const foo = shape['foo']
        if (foo instanceof z.ZodString) {
          expect(foo._def.checks.length).toBe(2)
          expect(foo._def.checks.find(check => check.kind === 'min' && check.value === 3)).toBeTruthy()
          expect(foo._def.checks.find(check => check.kind === 'max' && check.value === 9)).toBeTruthy()
        }
        const bar = shape['bar']
        if (bar instanceof z.ZodString) {
          expect(bar._def.checks.length).toBe(2)
          expect(bar._def.checks.find(check => check.kind === 'min' && check.value === 6)).toBeTruthy()
          expect(bar._def.checks.find(check => check.kind === 'max' && check.value === 9)).toBeTruthy()
        }
        const catchall = schema._def.catchall
        if (catchall instanceof z.ZodString) {
          expect(catchall._def.checks.length).toBe(1)
          expect(catchall._def.checks.find(check => check.kind === 'max' && check.value === 9)).toBeTruthy()
        }
      }
    }
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data: data })
    expect.assertions(9)
  })

  test('record + object catchall', () => {
    install()

    const left = z.record(z.string().max(9))
    const right = z.object({ foo: z.string().min(3), bar: z.string().min(6) }).catchall(z.string().min(9))
    const schema = z.intersection(left, right)
    const faker = new ZodIntersectionFaker(schema)
    const result = faker.findIntersectedSchema(left, right)
    if (result.success) {
      const schema = result.schema
      if (schema instanceof z.ZodObject) {
        const shape = schema.shape
        const foo = shape['foo']
        if (foo instanceof z.ZodString) {
          expect(foo._def.checks.length).toBe(2)
          expect(foo._def.checks.find(check => check.kind === 'min' && check.value === 3)).toBeTruthy()
          expect(foo._def.checks.find(check => check.kind === 'max' && check.value === 9)).toBeTruthy()
        }
        const bar = shape['bar']
        if (bar instanceof z.ZodString) {
          expect(bar._def.checks.length).toBe(2)
          expect(bar._def.checks.find(check => check.kind === 'min' && check.value === 6)).toBeTruthy()
          expect(bar._def.checks.find(check => check.kind === 'max' && check.value === 9)).toBeTruthy()
        }
        const catchall = schema._def.catchall
        if (catchall instanceof z.ZodString) {
          expect(catchall._def.checks.length).toBe(2)
          expect(catchall._def.checks.find(check => check.kind === 'min' && check.value === 9)).toBeTruthy()
          expect(catchall._def.checks.find(check => check.kind === 'max' && check.value === 9)).toBeTruthy()
        }
      }
    }
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data: data })
    expect.assertions(10)
  })
})

describe('tuple', () => {
  test('tuple [date] + tuple [date]', () => {
    install()

    const left = z.tuple([z.date().min(new Date(123))])
    const right = z.tuple([z.date().max(new Date(456))])
    const schema = z.intersection(left, right)
    const faker = new ZodIntersectionFaker(schema)
    const result = faker.findIntersectedSchema(left, right)
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
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
    expect.assertions(6)
  })

  test('tuple [date, number] + tuple [date, ...number]', () => {
    install()

    const left = z.tuple([z.date().min(new Date(123)), z.number().min(321)])
    const right = z.tuple([z.date().max(new Date(456))]).rest(z.number().max(654))
    const schema = z.intersection(left, right)
    const faker = new ZodIntersectionFaker(schema)
    const result = faker.findIntersectedSchema(left, right)
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
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
    expect.assertions(9)
  })

  test('tuple [date, ...number] + tuple [date, number]', () => {
    install()

    const left = z.tuple([z.date().min(new Date(123))]).rest(z.number().min(321))
    const right = z.tuple([z.date().max(new Date(456)), z.number().max(654)])
    const schema = z.intersection(left, right)
    const faker = new ZodIntersectionFaker(schema)
    const result = faker.findIntersectedSchema(left, right)
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
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
    expect.assertions(9)
  })

  test('tuple [date, ...number] + tuple [date, ...number]', () => {
    install()

    const left = z.tuple([z.date().min(new Date(123))]).rest(z.number().min(321))
    const right = z.tuple([z.date().max(new Date(456))]).rest(z.number().max(654))
    const schema = z.intersection(left, right)
    const faker = new ZodIntersectionFaker(schema)
    const result = faker.findIntersectedSchema(left, right)
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
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
    expect.assertions(9)
  })
})

describe('array and tuple', () => {
  test('unrelated', () => {
    install()

    const left = z.array(z.string())
    const right = z.tuple([z.literal(1), z.literal(2), z.literal(3)])
    const schema = z.intersection(left, right)
    const faker = new ZodIntersectionFaker(schema)
    expect(() => faker.fake()).toThrow()
  })

  test('tuple [date, date] + array [date]', () => {
    install()

    const left = z.tuple([z.date().min(new Date(123)), z.date().min(new Date(456))]).rest(z.date().min(new Date(789)))
    const right = z.array(z.date().max(new Date(789)))
    const schema = z.intersection(left, right)
    const faker = new ZodIntersectionFaker(schema)
    const result = faker.findIntersectedSchema(left, right)
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
          firstItem._def.checks.find(check => check.kind === 'max' && check.value === new Date(789).getTime()),
        ).toBeTruthy()
      }
      const secondItem = items[1]
      if (secondItem instanceof z.ZodDate) {
        expect(secondItem._def.checks.length).toBe(2)
        expect(
          secondItem._def.checks.find(check => check.kind === 'min' && check.value === new Date(456).getTime()),
        ).toBeTruthy()
        expect(
          secondItem._def.checks.find(check => check.kind === 'max' && check.value === new Date(789).getTime()),
        ).toBeTruthy()
      }
      const rest = result.schema._def.rest
      if (rest instanceof z.ZodDate) {
        expect(rest._def.checks.length).toBe(2)
        expect(
          rest._def.checks.find(check => check.kind === 'min' && check.value === new Date(789).getTime()),
        ).toBeTruthy()
        expect(
          rest._def.checks.find(check => check.kind === 'max' && check.value === new Date(789).getTime()),
        ).toBeTruthy()
      }
    }
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
    expect.assertions(11)
  })

  test('array [date] + tuple [date, date]', () => {
    install()

    const left = z.array(z.date().max(new Date(789)))
    const right = z.tuple([z.date().min(new Date(123)), z.date().min(new Date(456))]).rest(z.date().min(new Date(789)))
    const schema = z.intersection(left, right)
    const faker = new ZodIntersectionFaker(schema)
    const result = faker.findIntersectedSchema(left, right)
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
          firstItem._def.checks.find(check => check.kind === 'max' && check.value === new Date(789).getTime()),
        ).toBeTruthy()
      }
      const secondItem = items[1]
      if (secondItem instanceof z.ZodDate) {
        expect(secondItem._def.checks.length).toBe(2)
        expect(
          secondItem._def.checks.find(check => check.kind === 'min' && check.value === new Date(456).getTime()),
        ).toBeTruthy()
        expect(
          secondItem._def.checks.find(check => check.kind === 'max' && check.value === new Date(789).getTime()),
        ).toBeTruthy()
      }
      const rest = result.schema._def.rest
      if (rest instanceof z.ZodDate) {
        expect(rest._def.checks.length).toBe(2)
        expect(
          rest._def.checks.find(check => check.kind === 'min' && check.value === new Date(789).getTime()),
        ).toBeTruthy()
        expect(
          rest._def.checks.find(check => check.kind === 'max' && check.value === new Date(789).getTime()),
        ).toBeTruthy()
      }
    }
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
    expect.assertions(11)
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

  test('union [date min 1, date min 2] + union [date max 1, date max 2]', () => {
    install()

    const left = z.union([z.date().min(new Date(123)), z.date().min(new Date(321))])
    const right = z.union([z.date().max(new Date(456)), z.date().max(new Date(654))])
    const schema = z.intersection(left, right)
    const faker = new ZodIntersectionFaker(schema)
    const result = faker.findIntersectedSchema(left, right)
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
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
    expect.assertions(13)
  })
})

describe('non-union and union', () => {
  test('unrelated', () => {
    install()

    const left = z.string()
    const right = z.union([z.number(), z.date()])
    const schema = z.intersection(left, right)
    const faker = new ZodIntersectionFaker(schema)
    expect(() => faker.fake()).toThrow()
  })

  test('union [date min, number] + date max', () => {
    install()

    const left = z.union([z.date().min(new Date(123)), z.number()])
    const right = z.date().max(new Date(321))
    const schema = z.intersection(left, right)
    const faker = new ZodIntersectionFaker(schema)
    const result = faker.findIntersectedSchema(left, right)
    if (result.success && result.schema instanceof z.ZodDate) {
      expect(result.schema._def.checks.length).toBe(2)
      expect(
        result.schema._def.checks.find(check => check.kind === 'min' && check.value === new Date(123).getTime()),
      ).toBeTruthy()
      expect(
        result.schema._def.checks.find(check => check.kind === 'max' && check.value === new Date(321).getTime()),
      ).toBeTruthy()
    }
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
    expect.assertions(4)
  })

  test('date max + union [date min 1, date min 2]', () => {
    install()

    const left = z.date().max(new Date(456))
    const right = z.union([z.date().min(new Date(123)), z.date().min(new Date(321))])
    const schema = z.intersection(left, right)
    const faker = new ZodIntersectionFaker(schema)
    const result = faker.findIntersectedSchema(left, right)
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
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
    expect.assertions(8)
  })
})

describe('discriminatedUnion', () => {
  test('discriminated union + discriminated union (different discriminator)', () => {
    install()

    const schema = z.intersection(
      z.discriminatedUnion('foo', [z.object({ foo: z.literal('a'), a: z.date() })]),
      z.discriminatedUnion('bar', [z.object({ bar: z.literal('a'), a: z.date() })]),
    )
    const faker = new ZodIntersectionFaker(schema)
    expect(() => faker.fake()).toThrow()
  })

  test('discriminated union + discriminated union (different discriminator value)', () => {
    install()

    const schema = z.intersection(
      z.discriminatedUnion('type', [z.object({ type: z.literal('a'), a: z.date() })]),
      z.discriminatedUnion('type', [z.object({ type: z.literal('b'), b: z.date() })]),
    )
    const faker = new ZodIntersectionFaker(schema)
    expect(() => faker.fake()).toThrow()
  })

  test('discriminated union + discriminated union', () => {
    install()

    const left = z.discriminatedUnion('type', [z.object({ type: z.literal('a'), a: z.date().min(new Date(123)) })])
    const right = z.discriminatedUnion('type', [z.object({ type: z.literal('a'), a: z.date().max(new Date(987)) })])
    const schema = z.intersection(left, right)
    const faker = new ZodIntersectionFaker(schema)
    const result = faker.findIntersectedSchema(left, right)
    if (result.success && result.schema instanceof z.ZodDiscriminatedUnion) {
      const options = result.schema._def.options
      expect(options.length).toBe(1)
      const option = options[0]
      if (option instanceof z.ZodObject) {
        const a = option.shape.a
        if (a instanceof z.ZodDate) {
          expect(a._def.checks.length).toBe(2)
          expect(
            a._def.checks.find(check => check.kind === 'min' && check.value === new Date(123).getTime()),
          ).toBeTruthy()
          expect(
            a._def.checks.find(check => check.kind === 'max' && check.value === new Date(987).getTime()),
          ).toBeTruthy()
        }
      }
    }
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
    expect.assertions(5)
  })
})

describe('object and discriminated union', () => {
  test('unrelated', () => {
    install()

    const left = z.object({ a: z.date() })
    const right = z.discriminatedUnion('type', [z.object({ type: z.literal('a'), a: z.date() })])
    const schema = z.intersection(left, right)
    const faker = new ZodIntersectionFaker(schema)
    expect(() => faker.fake()).toThrow()
  })

  test('object + discriminated union', () => {
    install()

    const left = z.object({ type: z.string(), a: z.date().min(new Date(123)) })
    const right = z.discriminatedUnion('type', [
      z.object({ type: z.literal('a'), a: z.date().max(new Date(456)) }),
      z.object({ type: z.literal('b'), a: z.date().max(new Date(789)) }),
    ])
    const schema = z.intersection(left, right)
    const faker = new ZodIntersectionFaker(schema)
    const result = faker.findIntersectedSchema(left, right)
    if (result.success && result.schema instanceof z.ZodDiscriminatedUnion) {
      const options = result.schema._def.options
      expect(options.length).toBe(2)
      const firstOption = options[0]
      if (firstOption instanceof z.ZodObject) {
        const a = firstOption.shape.a
        if (a instanceof z.ZodDate) {
          expect(a._def.checks.length).toBe(2)
          expect(
            a._def.checks.find(check => check.kind === 'min' && check.value === new Date(123).getTime()),
          ).toBeTruthy()
          expect(
            a._def.checks.find(check => check.kind === 'max' && check.value === new Date(456).getTime()),
          ).toBeTruthy()
        }
      }
      const secondOption = options[1]
      if (secondOption instanceof z.ZodObject) {
        const a = secondOption.shape.a
        if (a instanceof z.ZodDate) {
          expect(a._def.checks.length).toBe(2)
          expect(
            a._def.checks.find(check => check.kind === 'min' && check.value === new Date(123).getTime()),
          ).toBeTruthy()
          expect(
            a._def.checks.find(check => check.kind === 'max' && check.value === new Date(789).getTime()),
          ).toBeTruthy()
        }
      }
    }
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
    expect.assertions(8)
  })

  test('discriminated union + object', () => {
    install()

    const left = z.discriminatedUnion('type', [
      z.object({ type: z.literal('a'), a: z.date().min(new Date(123)) }),
      z.object({ type: z.literal('b'), a: z.date().min(new Date(456)) }),
    ])
    const right = z.object({ type: z.string(), a: z.date().max(new Date(789)) })
    const schema = z.intersection(left, right)
    const faker = new ZodIntersectionFaker(schema)
    const result = faker.findIntersectedSchema(left, right)
    if (result.success && result.schema instanceof z.ZodDiscriminatedUnion) {
      const options = result.schema._def.options
      expect(options.length).toBe(2)
      const firstOption = options[0]
      if (firstOption instanceof z.ZodObject) {
        const a = firstOption.shape.a
        if (a instanceof z.ZodDate) {
          expect(a._def.checks.length).toBe(2)
          expect(
            a._def.checks.find(check => check.kind === 'min' && check.value === new Date(123).getTime()),
          ).toBeTruthy()
          expect(
            a._def.checks.find(check => check.kind === 'max' && check.value === new Date(789).getTime()),
          ).toBeTruthy()
        }
      }
      const secondOption = options[1]
      if (secondOption instanceof z.ZodObject) {
        const a = secondOption.shape.a
        if (a instanceof z.ZodDate) {
          expect(a._def.checks.length).toBe(2)
          expect(
            a._def.checks.find(check => check.kind === 'min' && check.value === new Date(456).getTime()),
          ).toBeTruthy()
          expect(
            a._def.checks.find(check => check.kind === 'max' && check.value === new Date(789).getTime()),
          ).toBeTruthy()
        }
      }
    }
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
    expect.assertions(8)
  })
})

describe('record and discriminated union', () => {
  test('unrelated', () => {
    install()

    const left = z.record(z.date())
    const right = z.discriminatedUnion('type', [z.object({ type: z.literal('a'), a: z.date() })])
    const schema = z.intersection(left, right)
    const faker = new ZodIntersectionFaker(schema)
    expect(() => faker.fake()).toThrow()
  })

  test('record + discriminated union', () => {
    install()

    const left = z.record(z.string().max(9))
    const right = z.discriminatedUnion('type', [
      z.object({ type: z.literal('a'), a: z.string().min(3) }),
      z.object({ type: z.literal('b'), b: z.string().min(6) }),
    ])
    const schema = z.intersection(left, right)
    const faker = new ZodIntersectionFaker(schema)
    const result = faker.findIntersectedSchema(left, right)
    if (result.success && result.schema instanceof z.ZodDiscriminatedUnion) {
      const options = result.schema._def.options
      expect(options.length).toBe(2)
      const firstOption = options[0]
      if (firstOption instanceof z.ZodObject) {
        const a = firstOption.shape.a
        if (a instanceof z.ZodString) {
          expect(
            a._def.checks.every(
              check => (check.kind === 'min' && check.value === 3) || (check.kind === 'max' && check.value === 9),
            ),
          ).toBeTruthy()
        }
      }
      const secondOption = options[1]
      if (secondOption instanceof z.ZodObject) {
        const b = secondOption.shape.b
        if (b instanceof z.ZodString) {
          expect(
            b._def.checks.every(
              check => (check.kind === 'min' && check.value === 6) || (check.kind === 'max' && check.value === 9),
            ),
          ).toBeTruthy()
        }
      }
    }
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
    expect.assertions(4)
  })

  test('discriminated union + record', () => {
    install()

    const left = z.discriminatedUnion('type', [
      z.object({ type: z.literal('a'), a: z.string().min(3) }),
      z.object({ type: z.literal('b'), b: z.string().min(6) }),
    ])
    const right = z.record(z.string().max(9))
    const schema = z.intersection(left, right)
    const faker = new ZodIntersectionFaker(schema)
    const result = faker.findIntersectedSchema(left, right)
    if (result.success && result.schema instanceof z.ZodDiscriminatedUnion) {
      const options = result.schema._def.options
      expect(options.length).toBe(2)
      const firstOption = options[0]
      if (firstOption instanceof z.ZodObject) {
        const a = firstOption.shape.a
        if (a instanceof z.ZodString) {
          expect(
            a._def.checks.every(
              check => (check.kind === 'min' && check.value === 3) || (check.kind === 'max' && check.value === 9),
            ),
          ).toBeTruthy()
        }
      }
      const secondOption = options[1]
      if (secondOption instanceof z.ZodObject) {
        const b = secondOption.shape.b
        if (b instanceof z.ZodString) {
          expect(
            b._def.checks.find(
              check => (check.kind === 'min' && check.value === 6) || (check.kind === 'max' && check.value === 9),
            ),
          ).toBeTruthy()
        }
      }
    }
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
    expect.assertions(4)
  })
})

describe('number', () => {
  test('number + number', () => {
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
    const schema = z.intersection(left, right)
    const faker = new ZodIntersectionFaker(schema)
    const result = faker.findIntersectedSchema(left, right)
    if (result.success && result.schema instanceof z.ZodNumber) {
      expect(result.schema._def.checks.length).toBe(1)
      expect(result.schema._def.checks.find(check => check.kind === 'min' && check.value === 10)).toBeTruthy()
    }
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
    expect.assertions(3)
  })

  test('number min + number', () => {
    install()

    const left = z.number().min(10)
    const right = z.number()
    const schema = z.intersection(left, right)
    const faker = new ZodIntersectionFaker(schema)
    const result = faker.findIntersectedSchema(left, right)
    if (result.success && result.schema instanceof z.ZodNumber) {
      expect(result.schema._def.checks.length).toBe(1)
      expect(result.schema._def.checks.find(check => check.kind === 'min' && check.value === 10)).toBeTruthy()
    }
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
    expect.assertions(3)
  })

  test('number + number max', () => {
    install()

    const left = z.number()
    const right = z.number().max(10)
    const schema = z.intersection(left, right)
    const faker = new ZodIntersectionFaker(schema)
    const result = faker.findIntersectedSchema(left, right)
    if (result.success && result.schema instanceof z.ZodNumber) {
      expect(result.schema._def.checks.length).toBe(1)
      expect(result.schema._def.checks.find(check => check.kind === 'max' && check.value === 10)).toBeTruthy()
    }
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
    expect.assertions(3)
  })

  test('number max + number', () => {
    install()

    const left = z.number().max(10)
    const right = z.number()
    const schema = z.intersection(left, right)
    const faker = new ZodIntersectionFaker(schema)
    const result = faker.findIntersectedSchema(left, right)
    if (result.success && result.schema instanceof z.ZodNumber) {
      expect(result.schema._def.checks.length).toBe(1)
      expect(result.schema._def.checks.find(check => check.kind === 'max' && check.value === 10)).toBeTruthy()
    }
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
    expect.assertions(3)
  })

  test('number + number int', () => {
    install()

    const left = z.number()
    const right = z.number().int()
    const schema = z.intersection(left, right)
    const faker = new ZodIntersectionFaker(schema)
    const result = faker.findIntersectedSchema(left, right)
    if (result.success && result.schema instanceof z.ZodNumber) {
      expect(result.schema._def.checks.length).toBe(1)
      expect(result.schema._def.checks.find(check => check.kind === 'int')).toBeTruthy()
    }
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
    expect.assertions(3)
  })

  test('number int + number', () => {
    install()

    const left = z.number().int()
    const right = z.number()
    const schema = z.intersection(left, right)
    const faker = new ZodIntersectionFaker(schema)
    const result = faker.findIntersectedSchema(left, right)
    if (result.success && result.schema instanceof z.ZodNumber) {
      expect(result.schema._def.checks.length).toBe(1)
      expect(result.schema._def.checks.find(check => check.kind === 'int')).toBeTruthy()
    }
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
    expect.assertions(3)
  })

  test('number + number finite', () => {
    install()

    const left = z.number()
    const right = z.number().finite()
    const schema = z.intersection(left, right)
    const faker = new ZodIntersectionFaker(schema)
    const result = faker.findIntersectedSchema(left, right)
    if (result.success && result.schema instanceof z.ZodNumber) {
      expect(result.schema._def.checks.length).toBe(1)
      expect(result.schema._def.checks.find(check => check.kind === 'finite')).toBeTruthy()
    }
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
    expect.assertions(3)
  })

  test('number finite + number', () => {
    install()

    const left = z.number().finite()
    const right = z.number()
    const schema = z.intersection(left, right)
    const faker = new ZodIntersectionFaker(schema)
    const result = faker.findIntersectedSchema(left, right)
    if (result.success && result.schema instanceof z.ZodNumber) {
      expect(result.schema._def.checks.length).toBe(1)
      expect(result.schema._def.checks.find(check => check.kind === 'finite')).toBeTruthy()
    }
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
    expect.assertions(3)
  })

  test('number + number multipleOf', () => {
    install()

    const left = z.number()
    const right = z.number().multipleOf(10)
    const schema = z.intersection(left, right)
    const faker = new ZodIntersectionFaker(schema)
    const result = faker.findIntersectedSchema(left, right)
    if (result.success && result.schema instanceof z.ZodNumber) {
      expect(result.schema._def.checks.length).toBe(1)
      expect(result.schema._def.checks.find(check => check.kind === 'multipleOf' && check.value === 10)).toBeTruthy()
    }
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
    expect.assertions(3)
  })

  test('number multipleOf + number', () => {
    install()

    const left = z.number().multipleOf(10)
    const right = z.number()
    const schema = z.intersection(left, right)
    const faker = new ZodIntersectionFaker(schema)
    const result = faker.findIntersectedSchema(left, right)
    if (result.success && result.schema instanceof z.ZodNumber) {
      expect(result.schema._def.checks.length).toBe(1)
      expect(result.schema._def.checks.find(check => check.kind === 'multipleOf' && check.value === 10)).toBeTruthy()
    }
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
    expect.assertions(3)
  })

  test('number multipleOf + number multipleOf', () => {
    install()

    const left = z.number().multipleOf(11)
    const right = z.number().multipleOf(7)
    const schema = z.intersection(left, right)
    const faker = new ZodIntersectionFaker(schema)
    const result = faker.findIntersectedSchema(left, right)
    if (result.success && result.schema instanceof z.ZodNumber) {
      expect(
        result.schema._def.checks.every(
          check => check.kind === 'multipleOf' && (check.value === 11 || check.value === 7),
        ),
      ).toBeTruthy()
    }
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
    expect.assertions(2)
  })

  test('number min + number min (larger)', () => {
    install()

    const left = z.number().min(10)
    const right = z.number().min(20)
    const schema = z.intersection(left, right)
    const faker = new ZodIntersectionFaker(schema)
    const result = faker.findIntersectedSchema(left, right)
    if (result.success && result.schema instanceof z.ZodNumber) {
      expect(result.schema._def.checks.length).toBe(2)
      expect(result.schema._def.checks.find(check => check.kind === 'min' && check.value === 10)).toBeTruthy()
      expect(result.schema._def.checks.find(check => check.kind === 'min' && check.value === 20)).toBeTruthy()
    }
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
    expect.assertions(4)
  })

  test('number min (larger) + number min', () => {
    install()

    const left = z.number().min(20)
    const right = z.number().min(10)
    const schema = z.intersection(left, right)
    const faker = new ZodIntersectionFaker(schema)
    const result = faker.findIntersectedSchema(left, right)
    if (result.success && result.schema instanceof z.ZodNumber) {
      expect(result.schema._def.checks.length).toBe(2)
      expect(result.schema._def.checks.find(check => check.kind === 'min' && check.value === 20)).toBeTruthy()
      expect(result.schema._def.checks.find(check => check.kind === 'min' && check.value === 10)).toBeTruthy()
    }
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
    expect.assertions(4)
  })

  test('number max + number max (larger)', () => {
    install()

    const left = z.number().max(10)
    const right = z.number().max(20)
    const schema = z.intersection(left, right)
    const faker = new ZodIntersectionFaker(schema)
    const result = faker.findIntersectedSchema(left, right)
    if (result.success && result.schema instanceof z.ZodNumber) {
      expect(result.schema._def.checks.length).toBe(2)
      expect(result.schema._def.checks.find(check => check.kind === 'max' && check.value === 10)).toBeTruthy()
      expect(result.schema._def.checks.find(check => check.kind === 'max' && check.value === 20)).toBeTruthy()
    }
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
    expect.assertions(4)
  })

  test('number max (larger) + number max', () => {
    install()

    const left = z.number().max(20)
    const right = z.number().max(10)
    const schema = z.intersection(left, right)
    const faker = new ZodIntersectionFaker(schema)
    const result = faker.findIntersectedSchema(left, right)
    if (result.success && result.schema instanceof z.ZodNumber) {
      expect(result.schema._def.checks.length).toBe(2)
      expect(result.schema._def.checks.find(check => check.kind === 'max' && check.value === 10)).toBeTruthy()
      expect(result.schema._def.checks.find(check => check.kind === 'max' && check.value === 20)).toBeTruthy()
    }
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
    expect.assertions(4)
  })
})

describe('string', () => {
  test('unrelated', () => {
    install()

    const schema = z.intersection(z.string().ip(), z.string().email())
    const faker = new ZodIntersectionFaker(schema)
    expect(() => faker.fake()).toThrow()
  })

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
  test('void + void', () => {
    install()

    const schema = z.intersection(z.void(), z.void())
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })
})

describe('symbol', () => {
  test('symbol + symbol', () => {
    install()

    const schema = z.intersection(z.symbol(), z.symbol())
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })
})

describe('nativeEnum', () => {
  test('nativeEnum + nativeEnum', () => {
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

  test('nativeEnum + nativeEnum (no common value)', () => {
    install()

    enum Foo {
      A,
      B,
    }
    enum Bar {
      C,
      D,
    }
    const schema = z.intersection(z.nativeEnum(Foo), z.nativeEnum(Bar))
    const faker = new ZodIntersectionFaker(schema)

    expect(() => faker.fake()).toThrow()
  })
})

describe('enum', () => {
  test('enum + enum', () => {
    install()

    const schema = z.intersection(z.enum(['foo', 'bar']), z.enum(['foo', 'baz']))
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })

  test('enum + enum (no common value)', () => {
    install()

    const schema = z.intersection(z.enum(['foo', 'bar']), z.enum(['baz', 'qux']))
    const faker = new ZodIntersectionFaker(schema)

    expect(() => faker.fake()).toThrow()
  })
})

describe('non-enum and enum', () => {
  test('unrelated', () => {
    install()

    const schema = z.intersection(z.number(), z.enum(['foo', 'bar']))
    const faker = new ZodIntersectionFaker(schema)
    expect(() => faker.fake()).toThrow()
  })

  test('enum + string', () => {
    install()

    const schema = z.intersection(z.enum(['foo', 'barbaz', 'qux']), z.string().max(3))
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })

  test('string + enum', () => {
    install()

    const schema = z.intersection(z.string().min(6), z.enum(['foo', 'barbaz', 'qux']))
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })
})

describe('literal', () => {
  test('literal + literal', () => {
    install()

    const schema = z.intersection(z.literal('foo'), z.literal('foo'))
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })

  test('literal + literal (no common value)', () => {
    install()

    const schema = z.intersection(z.literal('foo'), z.literal('bar'))
    const faker = new ZodIntersectionFaker(schema)

    expect(() => faker.fake()).toThrow()
  })
})

describe('non-literal and literal', () => {
  test('unrelated', () => {
    install()

    const schema = z.intersection(z.string(), z.literal(42))
    const faker = new ZodIntersectionFaker(schema)
    expect(() => faker.fake()).toThrow()
  })

  test('literal + string', () => {
    install()

    const schema = z.intersection(z.literal('foo'), z.string())
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })

  test('number + literal', () => {
    install()

    const schema = z.intersection(z.number(), z.literal(42))
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })
})

describe('boolean', () => {
  test('boolean + boolean', () => {
    install()

    const schema = z.intersection(z.boolean(), z.boolean())
    const faker = new ZodIntersectionFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
  })
})

describe('bigint', () => {
  test('bigint + bigint', () => {
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
    const schema = z.intersection(left, right)
    const faker = new ZodIntersectionFaker(schema)
    const result = faker.findIntersectedSchema(left, right)
    if (result.success && result.schema instanceof z.ZodBigInt) {
      expect(result.schema._def.checks.length).toBe(1)
      expect(result.schema._def.checks.find(check => check.kind === 'min' && check.value === 10n)).toBeTruthy()
    }
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
    expect.assertions(3)
  })

  test('bigint min + bigint', () => {
    install()

    const left = z.bigint().min(10n)
    const right = z.bigint()
    const schema = z.intersection(left, right)
    const faker = new ZodIntersectionFaker(schema)
    const result = faker.findIntersectedSchema(left, right)
    if (result.success && result.schema instanceof z.ZodBigInt) {
      expect(result.schema._def.checks.length).toBe(1)
      expect(result.schema._def.checks.find(check => check.kind === 'min' && check.value === 10n)).toBeTruthy()
    }
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
    expect.assertions(3)
  })

  test('bigint + bigint max', () => {
    install()

    const left = z.bigint()
    const right = z.bigint().max(10n)
    const schema = z.intersection(left, right)
    const faker = new ZodIntersectionFaker(schema)
    const result = faker.findIntersectedSchema(left, right)
    if (result.success && result.schema instanceof z.ZodBigInt) {
      expect(result.schema._def.checks.length).toBe(1)
      expect(result.schema._def.checks.find(check => check.kind === 'max' && check.value === 10n)).toBeTruthy()
    }
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
    expect.assertions(3)
  })

  test('bigint max + bigint', () => {
    install()

    const left = z.bigint().max(10n)
    const right = z.bigint()
    const schema = z.intersection(left, right)
    const faker = new ZodIntersectionFaker(schema)
    const result = faker.findIntersectedSchema(left, right)
    if (result.success && result.schema instanceof z.ZodBigInt) {
      expect(result.schema._def.checks.length).toBe(1)
      expect(result.schema._def.checks.find(check => check.kind === 'max' && check.value === 10n)).toBeTruthy()
    }
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
    expect.assertions(3)
  })

  test('bigint + bigint multipleOf', () => {
    install()

    const left = z.bigint()
    const right = z.bigint().multipleOf(10n)
    const schema = z.intersection(left, right)
    const faker = new ZodIntersectionFaker(schema)
    const result = faker.findIntersectedSchema(left, right)
    if (result.success && result.schema instanceof z.ZodBigInt) {
      expect(result.schema._def.checks.length).toBe(1)
      expect(result.schema._def.checks.find(check => check.kind === 'multipleOf' && check.value === 10n)).toBeTruthy()
    }
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
    expect.assertions(3)
  })

  test('bigint multipleOf + bigint', () => {
    install()

    const left = z.bigint().multipleOf(10n)
    const right = z.bigint()
    const schema = z.intersection(left, right)
    const faker = new ZodIntersectionFaker(schema)
    const result = faker.findIntersectedSchema(left, right)
    if (result.success && result.schema instanceof z.ZodBigInt) {
      expect(result.schema._def.checks.length).toBe(1)
      expect(result.schema._def.checks.find(check => check.kind === 'multipleOf' && check.value === 10n)).toBeTruthy()
    }
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
    expect.assertions(3)
  })

  test('bigint min + bigint min (larger)', () => {
    install()

    const left = z.bigint().min(10n)
    const right = z.bigint().min(20n)
    const schema = z.intersection(left, right)
    const faker = new ZodIntersectionFaker(schema)
    const result = faker.findIntersectedSchema(left, right)
    if (result.success && result.schema instanceof z.ZodBigInt) {
      expect(result.schema._def.checks.length).toBe(2)
      expect(result.schema._def.checks.find(check => check.kind === 'min' && check.value === 10n)).toBeTruthy()
      expect(result.schema._def.checks.find(check => check.kind === 'min' && check.value === 20n)).toBeTruthy()
    }
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
    expect.assertions(4)
  })

  test('bigint min (larger) + bigint min', () => {
    install()

    const left = z.bigint().min(20n)
    const right = z.bigint().min(10n)
    const schema = z.intersection(left, right)
    const faker = new ZodIntersectionFaker(schema)
    const result = faker.findIntersectedSchema(left, right)
    if (result.success && result.schema instanceof z.ZodBigInt) {
      expect(result.schema._def.checks.length).toBe(2)
      expect(result.schema._def.checks.find(check => check.kind === 'min' && check.value === 20n)).toBeTruthy()
      expect(result.schema._def.checks.find(check => check.kind === 'min' && check.value === 10n)).toBeTruthy()
    }
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
    expect.assertions(4)
  })

  test('bigint max + bigint max (larger)', () => {
    install()

    const left = z.bigint().max(10n)
    const right = z.bigint().max(20n)
    const schema = z.intersection(left, right)
    const faker = new ZodIntersectionFaker(schema)
    const result = faker.findIntersectedSchema(left, right)
    if (result.success && result.schema instanceof z.ZodBigInt) {
      expect(result.schema._def.checks.length).toBe(2)
      expect(result.schema._def.checks.find(check => check.kind === 'max' && check.value === 10n)).toBeTruthy()
      expect(result.schema._def.checks.find(check => check.kind === 'max' && check.value === 20n)).toBeTruthy()
    }
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
    expect.assertions(4)
  })

  test('bigint max (larger) + bigint max', () => {
    install()

    const left = z.bigint().max(20n)
    const right = z.bigint().max(10n)
    const schema = z.intersection(left, right)
    const faker = new ZodIntersectionFaker(schema)
    const result = faker.findIntersectedSchema(left, right)
    if (result.success && result.schema instanceof z.ZodBigInt) {
      expect(result.schema._def.checks.length).toBe(2)
      expect(result.schema._def.checks.find(check => check.kind === 'max' && check.value === 20n)).toBeTruthy()
      expect(result.schema._def.checks.find(check => check.kind === 'max' && check.value === 10n)).toBeTruthy()
    }
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
    expect.assertions(4)
  })
})

describe('readonly', () => {
  test('readonly', () => {
    install()

    const left = z
      .array(z.date().min(new Date(1)))
      .min(2)
      .readonly()
    const right = z
      .array(z.date().max(new Date(3)))
      .max(4)
      .readonly()
    const schema = z.intersection(left, right)
    const faker = new ZodIntersectionFaker(schema)
    const result = faker.findIntersectedSchema(left, right)
    if (result.success) {
      const schema = result.schema
      if (schema instanceof z.ZodArray) {
        expect(schema._def.minLength?.value).toBe(2)
        expect(schema._def.maxLength?.value).toBe(4)
        const type = schema._def.type
        if (type instanceof z.ZodDate) {
          expect(type._def.checks.length).toBe(2)
          expect(
            type._def.checks.find(check => check.kind === 'min' && check.value === new Date(1).getTime()),
          ).toBeTruthy()
          expect(
            type._def.checks.find(check => check.kind === 'max' && check.value === new Date(3).getTime()),
          ).toBeTruthy()
        }
      }
    }
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
    expect.assertions(6)
  })
})

describe('lazy', () => {
  test('lazy', () => {
    install()

    const left = z.lazy(() => z.date().min(new Date(0)))
    const right = z.lazy(() => z.date().max(new Date(0)))
    const schema = z.intersection(left, right)
    const faker = new ZodIntersectionFaker(schema)
    const result = faker.findIntersectedSchema(left, right)
    if (result.success && result.schema instanceof z.ZodDate) {
      expect(result.schema._def.checks.length).toBe(2)
      expect(
        result.schema._def.checks.find(check => check.kind === 'min' && check.value === new Date(0).getTime()),
      ).toBeTruthy()
      expect(
        result.schema._def.checks.find(check => check.kind === 'max' && check.value === new Date(0).getTime()),
      ).toBeTruthy()
    }
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
    expect.assertions(4)
  })
})

describe('intersection/and', () => {
  test('intersection/and', () => {
    install()

    const left = z.date().and(z.date().min(new Date(0)))
    const right = z.intersection(z.date().max(new Date(0)), z.date())
    const schema = z.intersection(left, right)
    const faker = new ZodIntersectionFaker(schema)
    const result = faker.findIntersectedSchema(left, right)
    if (result.success) {
      const schema = result.schema
      if (schema instanceof z.ZodDate) {
        expect(schema._def.checks.length).toBe(2)
        expect(
          schema._def.checks.find(check => check.kind === 'min' && check.value === new Date(0).getTime()),
        ).toBeTruthy()
        expect(
          schema._def.checks.find(check => check.kind === 'max' && check.value === new Date(0).getTime()),
        ).toBeTruthy()
      }
    }

    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
    expect.assertions(4)
  })
})

describe('pipe', () => {
  test('pipe ', () => {
    install()

    const left = z
      .string()
      .transform(value => value.length)
      .pipe(z.number().min(10))
    const right = z
      .string()
      .transform(value => value.length)
      .pipe(z.number().max(20))
    const schema = z.intersection(left, right)
    const faker = new ZodIntersectionFaker(schema)
    const result = faker.findIntersectedSchema(left, right)
    if (result.success) {
      const schema = result.schema
      if (schema instanceof z.ZodNumber) {
        expect(schema._def.checks.length).toBe(2)
        expect(schema._def.checks.find(check => check.kind === 'min' && check.value === 10)).toBeTruthy()
        expect(schema._def.checks.find(check => check.kind === 'max' && check.value === 20)).toBeTruthy()
      }
    }
    expect.assertions(3)
  })
})

describe('brand', () => {
  test('brand ', () => {
    install()

    const cat = z
      .object({
        name: z.string().min(1),
      })
      .brand('cat')
    const dog = z
      .object({
        name: z.string().max(5),
      })
      .brand('dog')
    const schema = z.intersection(cat, dog)
    const faker = new ZodIntersectionFaker(schema)
    const result = faker.findIntersectedSchema(cat, dog)
    if (result.success) {
      const schema = result.schema
      if (schema instanceof z.ZodObject) {
        const name = schema.shape.name
        if (name instanceof z.ZodString) {
          expect(name._def.checks.length).toBe(2)
          expect(name._def.checks.find(check => check.kind === 'min' && check.value === 1)).toBeTruthy()
          expect(name._def.checks.find(check => check.kind === 'max' && check.value === 5)).toBeTruthy()
        }
      }
    }
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })

    function acceptCat(_: z.infer<typeof cat>) {}
    function acceptDog(_: z.infer<typeof dog>) {}
    acceptCat(data)
    // @ts-expect-error
    acceptCat({ name: 'cat' })
    acceptDog(data)
    // @ts-expect-error
    acceptDog({ name: 'dog' })

    expect.assertions(4)
  })
})

describe('default', () => {
  test('date default + date', () => {
    install()

    const _default = new Date(456)
    const left = z.date().min(new Date(123)).default(_default)
    const right = z.date().max(new Date(789))
    const schema = z.intersection(left, right)
    const faker = new ZodIntersectionFaker(schema)
    const result = faker.findIntersectedSchema(left, right)
    if (result.success) {
      const schema = result.schema
      if (schema instanceof z.ZodUnion) {
        const options = schema._def.options
        const firstOption = options[0]
        if (firstOption instanceof z.ZodLazy) {
          const defaultValue = firstOption.schema
          if (defaultValue instanceof z.ZodLiteral) {
            expect(defaultValue._def.value).toBe(_default)
          }
        }
        const secondOption = options[1]
        if (secondOption instanceof z.ZodIntersection) {
          const left = secondOption._def.left
          if (left instanceof z.ZodDate) {
            expect(left._def.checks.length).toBe(1)
            expect(
              left._def.checks.find(check => check.kind === 'max' && check.value === new Date(789).getTime()),
            ).toBeTruthy()
          }
          const right = secondOption._def.right
          if (right instanceof z.ZodDate) {
            expect(right._def.checks.length).toBe(1)
            expect(
              right._def.checks.find(check => check.kind === 'min' && check.value === new Date(123).getTime()),
            ).toBeTruthy()
          }
        }
      }
    }
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
    expect.assertions(6)
  })

  test('date + date default', () => {
    install()

    const _default = new Date(456)
    const left = z.date().min(new Date(123))
    const right = z.date().max(new Date(789)).default(_default)
    const schema = z.intersection(left, right)
    const faker = new ZodIntersectionFaker(schema)
    const result = faker.findIntersectedSchema(left, right)
    if (result.success) {
      const schema = result.schema
      if (schema instanceof z.ZodUnion) {
        const options = schema._def.options
        const firstOption = options[0]
        if (firstOption instanceof z.ZodLazy) {
          const defaultValue = firstOption.schema
          if (defaultValue instanceof z.ZodLiteral) {
            expect(defaultValue._def.value).toBe(_default)
          }
        }
        const secondOption = options[1]
        if (secondOption instanceof z.ZodIntersection) {
          const left = secondOption._def.left
          if (left instanceof z.ZodDate) {
            expect(left._def.checks.length).toBe(1)
            expect(
              left._def.checks.find(check => check.kind === 'min' && check.value === new Date(123).getTime()),
            ).toBeTruthy()
          }
          const right = secondOption._def.right
          if (right instanceof z.ZodDate) {
            expect(right._def.checks.length).toBe(1)
            expect(
              right._def.checks.find(check => check.kind === 'max' && check.value === new Date(789).getTime()),
            ).toBeTruthy()
          }
        }
      }
    }
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
    expect.assertions(6)
  })
})

describe('catch', () => {
  test('date catch + date', () => {
    install()

    const _catch = new Date(456)
    const left = z.date().min(new Date(123)).catch(_catch)
    const right = z.date().max(new Date(789))
    const schema = z.intersection(left, right)
    const faker = new ZodIntersectionFaker(schema)
    const result = faker.findIntersectedSchema(left, right)
    if (result.success) {
      const schema = result.schema
      if (schema instanceof z.ZodUnion) {
        const options = schema._def.options
        const firstOption = options[0]
        if (firstOption instanceof z.ZodLazy) {
          const catchValue = firstOption.schema
          if (catchValue instanceof z.ZodLiteral) {
            expect(catchValue._def.value).toBe(_catch)
          }
        }
        const secondOption = options[1]
        if (secondOption instanceof z.ZodIntersection) {
          const left = secondOption._def.left
          if (left instanceof z.ZodDate) {
            expect(left._def.checks.length).toBe(1)
            expect(
              left._def.checks.find(check => check.kind === 'max' && check.value === new Date(789).getTime()),
            ).toBeTruthy()
          }
          const right = secondOption._def.right
          if (right instanceof z.ZodDate) {
            expect(right._def.checks.length).toBe(1)
            expect(
              right._def.checks.find(check => check.kind === 'min' && check.value === new Date(123).getTime()),
            ).toBeTruthy()
          }
        }
      }
    }
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
    expect.assertions(6)
  })

  test('date + date catch', () => {
    install()

    const _catch = new Date(456)
    const left = z.date().min(new Date(123))
    const right = z.date().max(new Date(789)).catch(_catch)
    const schema = z.intersection(left, right)
    const faker = new ZodIntersectionFaker(schema)
    const result = faker.findIntersectedSchema(left, right)
    if (result.success) {
      const schema = result.schema
      if (schema instanceof z.ZodUnion) {
        const options = schema._def.options
        const firstOption = options[0]
        if (firstOption instanceof z.ZodLazy) {
          const catchValue = firstOption.schema
          if (catchValue instanceof z.ZodLiteral) {
            expect(catchValue._def.value).toBe(_catch)
          }
        }
        const secondOption = options[1]
        if (secondOption instanceof z.ZodIntersection) {
          const left = secondOption._def.left
          if (left instanceof z.ZodDate) {
            expect(left._def.checks.length).toBe(1)
            expect(
              left._def.checks.find(check => check.kind === 'min' && check.value === new Date(123).getTime()),
            ).toBeTruthy()
          }
          const right = secondOption._def.right
          if (right instanceof z.ZodDate) {
            expect(right._def.checks.length).toBe(1)
            expect(
              right._def.checks.find(check => check.kind === 'max' && check.value === new Date(789).getTime()),
            ).toBeTruthy()
          }
        }
      }
    }
    const data = faker.fake()
    expect(schema.safeParse(data)).toEqual({ success: true, data })
    expect.assertions(6)
  })
})
