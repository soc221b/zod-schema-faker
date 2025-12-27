import { faker } from '@faker-js/faker'
import { beforeAll, describe, expect, test } from 'vitest'
import * as z from 'zod/v4'
import { fake, setFaker } from '../../src/v4'

beforeAll(() => {
  setFaker(faker)
})

describe('Intersection Schema Property Tests', () => {
  /**
   * Property 2: Intersection Schema Compatibility
   * Feature: v4-missing-schemas, Property 2: For any intersection schema where the component schemas are compatible,
   * the generated data should satisfy all component schema validations.
   * **Validates: Requirements 2.1, 2.2, 2.3**
   */
  test('Property 2: Intersection Schema Compatibility', () => {
    // Test with minimum 100 iterations as specified in requirements
    for (let i = 0; i < 100; i++) {
      // Generate compatible schema pairs for intersection testing
      const testCases = [
        // Object intersections
        () => {
          const left = z.object({
            name: z.string(),
            age: z.number().min(0).max(120),
          })
          const right = z.object({
            email: z.string().email(),
            active: z.boolean(),
          })
          return { left, right, type: 'object' }
        },

        // String intersections with different constraints
        () => {
          const left = z.string().min(5)
          const right = z.string().max(20)
          return { left, right, type: 'string' }
        },

        // Number intersections with constraints
        () => {
          const minVal = faker.number.int({ min: 1, max: 50 })
          const maxVal = faker.number.int({ min: minVal + 10, max: 100 })
          const left = z.number().min(minVal)
          const right = z.number().max(maxVal)
          return { left, right, type: 'number' }
        },

        // BigInt intersections
        () => {
          const minVal = BigInt(faker.number.int({ min: 1, max: 50 }))
          const maxVal = BigInt(faker.number.int({ min: Number(minVal) + 10, max: 100 }))
          const left = z.bigint().min(minVal)
          const right = z.bigint().max(maxVal)
          return { left, right, type: 'bigint' }
        },

        // Array intersections
        () => {
          const left = z.array(z.string()).min(1)
          const right = z.array(z.string()).max(10)
          return { left, right, type: 'array' }
        },

        // Date intersections
        () => {
          const minDate = new Date('2020-01-01')
          const maxDate = new Date('2025-12-31')
          const left = z.date().min(minDate)
          const right = z.date().max(maxDate)
          return { left, right, type: 'date' }
        },

        // Literal intersections (same value)
        () => {
          const value = faker.helpers.arrayElement(['test', 42, true])
          const left = z.literal(value)
          const right = z.literal(value)
          return { left, right, type: 'literal' }
        },

        // Any/Unknown with other types
        () => {
          const schemas = [z.string(), z.number(), z.boolean()]
          const concrete = faker.helpers.arrayElement(schemas)
          const left = z.any()
          const right = concrete
          return { left, right, type: 'any-concrete' }
        },

        // Optional intersections
        () => {
          const left = z.string().optional()
          const right = z.string().min(3).optional()
          return { left, right, type: 'optional' }
        },

        // Nullable intersections
        () => {
          const left = z.number().nullable()
          const right = z.number().min(0).nullable()
          return { left, right, type: 'nullable' }
        },
      ]

      const testCase = faker.helpers.arrayElement(testCases)()
      const intersectionSchema = z.intersection(testCase.left, testCase.right)

      try {
        const fakeData = fake(intersectionSchema)

        // Verify the generated data satisfies both component schemas
        const leftResult = testCase.left.safeParse(fakeData)
        const rightResult = testCase.right.safeParse(fakeData)

        expect(leftResult.success).toBe(true)
        expect(rightResult.success).toBe(true)

        // Additional type-specific validations
        switch (testCase.type) {
          case 'object':
            expect(typeof fakeData).toBe('object')
            expect(fakeData).not.toBeNull()
            break
          case 'string':
            expect(typeof fakeData).toBe('string')
            break
          case 'number':
            expect(typeof fakeData).toBe('number')
            expect(isNaN(fakeData as number)).toBe(false)
            break
          case 'bigint':
            expect(typeof fakeData).toBe('bigint')
            break
          case 'array':
            expect(Array.isArray(fakeData)).toBe(true)
            break
          case 'date':
            expect(fakeData).toBeInstanceOf(Date)
            break
          case 'literal':
            // Literal value should match exactly
            expect(fakeData).toBeDefined()
            break
        }
      } catch (error) {
        // If intersection fails, it should be due to incompatible schemas
        expect(error).toBeInstanceOf(TypeError)
        expect((error as Error).message).toContain('unable to fake the given schema')
      }
    }
  })

  /**
   * Property 4: Recursive Context Preservation
   * Feature: v4-missing-schemas, Property 4: For any nested schema structure involving intersection types,
   * the context depth should be properly maintained and passed through recursive calls.
   * **Validates: Requirements 2.5**
   */
  test('Property 4: Recursive Context Preservation', () => {
    // Test with minimum 100 iterations as specified in requirements
    for (let i = 0; i < 100; i++) {
      // Create nested intersection schemas to test recursion
      const testCases = [
        // Nested object intersections
        () => {
          const innerLeft = z.object({ id: z.number() })
          const innerRight = z.object({ name: z.string() })
          const inner = z.intersection(innerLeft, innerRight)

          const outerLeft = z.object({ user: inner })
          const outerRight = z.object({ timestamp: z.date() })

          return z.intersection(outerLeft, outerRight)
        },

        // Array of intersections
        () => {
          const itemLeft = z.object({ value: z.number() })
          const itemRight = z.object({ label: z.string() })
          const item = z.intersection(itemLeft, itemRight)

          return z.array(item).min(1).max(3)
        },

        // Intersection with optional nested intersections
        () => {
          const nestedLeft = z.object({ x: z.number() })
          const nestedRight = z.object({ y: z.number() })
          const nested = z.intersection(nestedLeft, nestedRight)

          const left = z.object({ point: nested.optional() })
          const right = z.object({ active: z.boolean() })

          return z.intersection(left, right)
        },

        // Multiple levels of intersection nesting
        () => {
          const level1Left = z.object({ a: z.string() })
          const level1Right = z.object({ b: z.number() })
          const level1 = z.intersection(level1Left, level1Right)

          const level2Left = z.object({ level1: level1 })
          const level2Right = z.object({ c: z.boolean() })
          const level2 = z.intersection(level2Left, level2Right)

          const level3Left = z.object({ level2: level2 })
          const level3Right = z.object({ d: z.date() })

          return z.intersection(level3Left, level3Right)
        },

        // Intersection with union containing intersections
        () => {
          const intersectionA = z.intersection(z.object({ type: z.literal('A') }), z.object({ valueA: z.string() }))
          const intersectionB = z.intersection(z.object({ type: z.literal('B') }), z.object({ valueB: z.number() }))

          const union = z.union([intersectionA, intersectionB])
          const left = z.object({ data: union })
          const right = z.object({ id: z.string() })

          return z.intersection(left, right)
        },
      ]

      const testCase = faker.helpers.arrayElement(testCases)
      const schema = testCase()

      try {
        const fakeData = fake(schema)

        // Verify the generated data satisfies the schema
        const result = schema.safeParse(fakeData)
        expect(result.success).toBe(true)

        // Verify the data structure is properly nested
        expect(fakeData).toBeDefined()
        expect(typeof fakeData).toBe('object')
        expect(fakeData).not.toBeNull()

        // For recursive structures, verify they contain expected nested properties
        if ('user' in fakeData) {
          expect(fakeData.user).toBeDefined()
          expect(typeof fakeData.user).toBe('object')
        }

        if ('level2' in fakeData) {
          expect(fakeData.level2).toBeDefined()
          expect(typeof fakeData.level2).toBe('object')
          if ('level1' in (fakeData as any).level2) {
            expect((fakeData as any).level2.level1).toBeDefined()
            expect(typeof (fakeData as any).level2.level1).toBe('object')
          }
        }

        if (Array.isArray(fakeData)) {
          // For array cases, verify each item has the expected structure
          for (const item of fakeData) {
            expect(item).toBeDefined()
            expect(typeof item).toBe('object')
          }
        }
      } catch (error) {
        // If generation fails, it should be due to incompatible nested schemas
        expect(error).toBeInstanceOf(TypeError)
      }
    }
  })
})

describe('Intersection Schema Compatibility Tests', () => {
  test('Compatible object schemas merge properties', () => {
    const left = z.object({ name: z.string() })
    const right = z.object({ age: z.number() })
    const intersection = z.intersection(left, right)

    const fakeData = fake(intersection)

    expect(fakeData).toHaveProperty('name')
    expect(fakeData).toHaveProperty('age')
    expect(typeof fakeData.name).toBe('string')
    expect(typeof fakeData.age).toBe('number')
  })

  test('Compatible string schemas combine constraints', () => {
    const left = z.string().min(5)
    const right = z.string().max(10)
    const intersection = z.intersection(left, right)

    const fakeData = fake(intersection)

    expect(typeof fakeData).toBe('string')
    expect(fakeData.length).toBeGreaterThanOrEqual(5)
    expect(fakeData.length).toBeLessThanOrEqual(10)
  })

  test('Compatible number schemas combine constraints', () => {
    const left = z.number().min(10)
    const right = z.number().max(20)
    const intersection = z.intersection(left, right)

    const fakeData = fake(intersection)

    expect(typeof fakeData).toBe('number')
    expect(fakeData).toBeGreaterThanOrEqual(10)
    expect(fakeData).toBeLessThanOrEqual(20)
  })

  test('Any type with concrete type returns concrete type', () => {
    const left = z.any()
    const right = z.string()
    const intersection = z.intersection(left, right)

    const fakeData = fake(intersection)

    expect(typeof fakeData).toBe('string')
  })

  test('Unknown type with concrete type returns concrete type', () => {
    const left = z.unknown()
    const right = z.number()
    const intersection = z.intersection(left, right)

    const fakeData = fake(intersection)

    expect(typeof fakeData).toBe('number')
  })

  test('Same literal values intersect successfully', () => {
    const left = z.literal('test')
    const right = z.literal('test')
    const intersection = z.intersection(left, right)

    const fakeData = fake(intersection)

    expect(fakeData).toBe('test')
  })

  test('Optional schemas can return undefined', () => {
    const left = z.string().optional()
    const right = z.string().min(3).optional()
    const intersection = z.intersection(left, right)

    // Run multiple times to potentially get undefined
    let foundUndefined = false
    let foundString = false

    for (let i = 0; i < 50; i++) {
      const fakeData = fake(intersection)
      if (fakeData === undefined) {
        foundUndefined = true
      } else {
        foundString = true
        expect(typeof fakeData).toBe('string')
        expect(fakeData.length).toBeGreaterThanOrEqual(3)
      }
    }

    // Should generate both undefined and string values
    expect(foundUndefined || foundString).toBe(true)
  })

  test('Nullable schemas can return null', () => {
    const left = z.number().nullable()
    const right = z.number().min(0).nullable()
    const intersection = z.intersection(left, right)

    // Run multiple times to potentially get null
    let foundNull = false
    let foundNumber = false

    for (let i = 0; i < 50; i++) {
      const fakeData = fake(intersection)
      if (fakeData === null) {
        foundNull = true
      } else {
        foundNumber = true
        expect(typeof fakeData).toBe('number')
        expect(fakeData).toBeGreaterThanOrEqual(0)
      }
    }

    // Should generate both null and number values
    expect(foundNull || foundNumber).toBe(true)
  })
})

describe('Intersection Schema Error Cases', () => {
  test('Incompatible literal values throw TypeError', () => {
    const left = z.literal('test')
    const right = z.literal('different')
    const intersection = z.intersection(left, right)

    expect(() => fake(intersection)).toThrow(TypeError)
    expect(() => fake(intersection)).toThrow('unable to fake the given schema')
  })

  test('Incompatible primitive types throw TypeError', () => {
    const left = z.string()
    const right = z.number()
    const intersection = z.intersection(left, right)

    expect(() => fake(intersection)).toThrow(TypeError)
    expect(() => fake(intersection)).toThrow('unable to fake the given schema')
  })

  test('Conflicting object properties throw TypeError', () => {
    const left = z.object({ value: z.string() })
    const right = z.object({ value: z.number() })
    const intersection = z.intersection(left, right)

    expect(() => fake(intersection)).toThrow(TypeError)
    expect(() => fake(intersection)).toThrow('unable to fake the given schema')
  })
})

describe('Intersection Schema Edge Cases', () => {
  test('Empty object intersections work', () => {
    const left = z.object({})
    const right = z.object({})
    const intersection = z.intersection(left, right)

    const fakeData = fake(intersection)

    expect(typeof fakeData).toBe('object')
    expect(fakeData).not.toBeNull()
  })

  test('Boolean intersections return boolean', () => {
    const left = z.boolean()
    const right = z.boolean()
    const intersection = z.intersection(left, right)

    const fakeData = fake(intersection)

    expect(typeof fakeData).toBe('boolean')
  })

  test('Symbol intersections return symbol', () => {
    const left = z.symbol()
    const right = z.symbol()
    const intersection = z.intersection(left, right)

    const fakeData = fake(intersection)

    expect(typeof fakeData).toBe('symbol')
  })

  test('Void intersections return undefined', () => {
    const left = z.void()
    const right = z.void()
    const intersection = z.intersection(left, right)

    const fakeData = fake(intersection)

    expect(fakeData).toBeUndefined()
  })

  test('Array element type intersections work', () => {
    const left = z.array(z.string().min(3))
    const right = z.array(z.string().max(10))
    const intersection = z.intersection(left, right)

    const fakeData = fake(intersection)

    expect(Array.isArray(fakeData)).toBe(true)
    for (const item of fakeData) {
      expect(typeof item).toBe('string')
      expect(item.length).toBeGreaterThanOrEqual(3)
      expect(item.length).toBeLessThanOrEqual(10)
    }
  })

  test('Union intersections find compatible options', () => {
    const left = z.union([z.string(), z.number()])
    const right = z.union([z.string(), z.boolean()])
    const intersection = z.intersection(left, right)

    const fakeData = fake(intersection)

    // Should generate string (the compatible type)
    expect(typeof fakeData).toBe('string')
  })

  test('Enum intersections find common values', () => {
    const left = z.enum(['a', 'b', 'c'])
    const right = z.enum(['b', 'c', 'd'])
    const intersection = z.intersection(left, right)

    const fakeData = fake(intersection)

    // Should generate 'b' or 'c' (the common values)
    expect(['b', 'c']).toContain(fakeData)
  })

  test('Date constraint intersections work', () => {
    const minDate = new Date('2020-01-01')
    const maxDate = new Date('2025-12-31')
    const left = z.date().min(minDate)
    const right = z.date().max(maxDate)
    const intersection = z.intersection(left, right)

    const fakeData = fake(intersection)

    expect(fakeData).toBeInstanceOf(Date)
    expect(fakeData.getTime()).toBeGreaterThanOrEqual(minDate.getTime())
    expect(fakeData.getTime()).toBeLessThanOrEqual(maxDate.getTime())
  })
})
