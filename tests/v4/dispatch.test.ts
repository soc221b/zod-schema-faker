import { faker } from '@faker-js/faker'
import { beforeAll, describe, expect, test } from 'vitest'
import * as z from 'zod/v4'
import { fake, setFaker } from '../../src/v4'

beforeAll(() => {
  setFaker(faker)
})

describe('Schema Type Dispatch Property Tests', () => {
  /**
   * Property 3: Schema Type Dispatch Correctness
   * Feature: v4-missing-schemas, Property 3: For any of the new schema types (file, intersection),
   * the main dispatcher should correctly route to the appropriate faker function.
   * **Validates: Requirements 3.1, 3.2**
   */
  test('Property 3: Schema Type Dispatch Correctness', () => {
    // Test with minimum 100 iterations as specified in requirements
    for (let i = 0; i < 100; i++) {
      // Test file schema dispatch
      const fileSchema = z.file()
      const fileResult = fake(fileSchema)

      // Verify that the result is a File instance (indicating correct dispatch to fakeFile)
      expect(fileResult).toBeInstanceOf(File)

      // Test intersection schema dispatch
      const stringSchema = z.string()
      const numberSchema = z.number()
      const intersectionSchema = z.intersection(stringSchema, numberSchema)

      // The intersection should either succeed or throw a TypeError
      // (indicating correct dispatch to fakeIntersection)
      try {
        const intersectionResult = fake(intersectionSchema)
        // If it succeeds, the result should be defined
        expect(intersectionResult).toBeDefined()
      } catch (error) {
        // If it fails, it should be a TypeError from the intersection faker
        expect(error).toBeInstanceOf(TypeError)
        expect((error as Error).message).toContain('ZodIntersectionFaker')
      }

      // Test file schema with constraints
      const constrainedFileSchema = z.file().check(z.minSize(100)).check(z.maxSize(1000))
      const constrainedFileResult = fake(constrainedFileSchema)

      // Verify correct dispatch and constraint handling
      expect(constrainedFileResult).toBeInstanceOf(File)
      expect(constrainedFileResult.size).toBeGreaterThanOrEqual(100)
      expect(constrainedFileResult.size).toBeLessThanOrEqual(1000)

      // Test compatible intersection schema
      const objectSchema1 = z.object({ name: z.string() })
      const objectSchema2 = z.object({ age: z.number() })
      const compatibleIntersection = z.intersection(objectSchema1, objectSchema2)

      const compatibleResult = fake(compatibleIntersection)

      // Verify correct dispatch and result structure
      expect(compatibleResult).toBeDefined()
      expect(typeof compatibleResult).toBe('object')
      expect(compatibleResult).toHaveProperty('name')
      expect(compatibleResult).toHaveProperty('age')
      expect(typeof (compatibleResult as any).name).toBe('string')
      expect(typeof (compatibleResult as any).age).toBe('number')
    }
  })
})
