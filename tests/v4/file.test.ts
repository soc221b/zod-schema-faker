import { faker } from '@faker-js/faker'
import { beforeAll, describe, expect, test } from 'vitest'
import * as z from 'zod/v4'
import { fake, setFaker } from '../../src/v4'

beforeAll(() => {
  setFaker(faker)
})

describe('File Schema Property Tests', () => {
  /**
   * Property 1: File Generation Validity
   * Feature: v4-missing-schemas, Property 1: For any valid file schema with constraints,
   * the generated File object should satisfy all specified constraints (size, MIME type)
   * and be a valid File instance.
   * **Validates: Requirements 1.1, 1.2, 1.3**
   */
  test('Property 1: File Generation Validity', () => {
    // Test with minimum 100 iterations as specified in requirements
    for (let i = 0; i < 100; i++) {
      // Generate random constraints for the file schema
      const minSize = faker.number.int({ min: 100, max: 1000 })
      const maxSize = faker.number.int({ min: minSize + 100, max: minSize + 10000 })
      const mimeTypes = faker.helpers.arrayElements(
        [
          'text/plain',
          'application/json',
          'image/jpeg',
          'image/png',
          'application/pdf',
          'text/html',
          'application/xml',
        ],
        { min: 1, max: 3 },
      )

      // Create file schema with random constraints
      const fileSchema = z.file().check(z.minSize(minSize)).check(z.maxSize(maxSize)).check(z.mime(mimeTypes))

      // Generate fake file
      const fakeFile = fake(fileSchema)

      // Verify it's a valid File instance
      expect(fakeFile).toBeInstanceOf(File)

      // Verify size constraints
      expect(fakeFile.size).toBeGreaterThanOrEqual(minSize)
      expect(fakeFile.size).toBeLessThanOrEqual(maxSize)

      // Verify MIME type constraint
      expect(mimeTypes).toContain(fakeFile.type)

      // Verify it has a name
      expect(fakeFile.name).toBeTruthy()
      expect(typeof fakeFile.name).toBe('string')
    }
  })

  test('File schema without constraints generates valid File', () => {
    const fileSchema = z.file()
    const fakeFile = fake(fileSchema)

    expect(fakeFile).toBeInstanceOf(File)
    expect(fakeFile.size).toBeGreaterThan(0)
    expect(fakeFile.type).toBeTruthy()
    expect(fakeFile.name).toBeTruthy()
  })

  test('File schema with only size constraints', () => {
    const minSize = 500
    const maxSize = 2000
    const fileSchema = z.file().check(z.minSize(minSize)).check(z.maxSize(maxSize))

    const fakeFile = fake(fileSchema)

    expect(fakeFile).toBeInstanceOf(File)
    expect(fakeFile.size).toBeGreaterThanOrEqual(minSize)
    expect(fakeFile.size).toBeLessThanOrEqual(maxSize)
  })

  test('File schema with only MIME type constraints', () => {
    const allowedMimeTypes = ['text/plain', 'application/json']
    const fileSchema = z.file().check(z.mime(allowedMimeTypes))

    const fakeFile = fake(fileSchema)

    expect(fakeFile).toBeInstanceOf(File)
    expect(allowedMimeTypes).toContain(fakeFile.type)
  })
})

describe('File Schema Error Cases', () => {
  test('Invalid size constraints (min > max) throws TypeError', () => {
    const fileSchema = z.file().check(z.minSize(2000)).check(z.maxSize(1000))

    expect(() => fake(fileSchema)).toThrow(TypeError)
    expect(() => fake(fileSchema)).toThrow('minimum size cannot be greater than maximum size')
  })
})

describe('File Schema Edge Cases', () => {
  test('File with exact size constraint', () => {
    const exactSize = 1024
    const fileSchema = z.file().check(z.minSize(exactSize)).check(z.maxSize(exactSize))

    const fakeFile = fake(fileSchema)

    expect(fakeFile).toBeInstanceOf(File)
    expect(fakeFile.size).toBe(exactSize)
  })

  test('File with zero minimum size', () => {
    const fileSchema = z.file().check(z.minSize(0)).check(z.maxSize(100))

    const fakeFile = fake(fileSchema)

    expect(fakeFile).toBeInstanceOf(File)
    expect(fakeFile.size).toBeGreaterThanOrEqual(0)
    expect(fakeFile.size).toBeLessThanOrEqual(100)
  })

  test('File with single MIME type constraint', () => {
    const mimeType = 'application/pdf'
    const fileSchema = z.file().check(z.mime([mimeType]))

    const fakeFile = fake(fileSchema)

    expect(fakeFile).toBeInstanceOf(File)
    expect(fakeFile.type).toBe(mimeType)
    expect(fakeFile.name).toMatch(/\.pdf$/)
  })

  test('File with text MIME type generates text content', () => {
    const fileSchema = z
      .file()
      .check(z.mime(['text/plain']))
      .check(z.minSize(100))
      .check(z.maxSize(200))

    const fakeFile = fake(fileSchema)

    expect(fakeFile).toBeInstanceOf(File)
    expect(fakeFile.type).toBe('text/plain')
    expect(fakeFile.name).toMatch(/\.txt$/)
    expect(fakeFile.size).toBeGreaterThanOrEqual(100)
    expect(fakeFile.size).toBeLessThanOrEqual(200)
  })

  test('File with JSON MIME type generates appropriate extension', () => {
    const fileSchema = z.file().check(z.mime(['application/json']))

    const fakeFile = fake(fileSchema)

    expect(fakeFile).toBeInstanceOf(File)
    expect(fakeFile.type).toBe('application/json')
    expect(fakeFile.name).toMatch(/\.json$/)
  })

  test('File with image MIME type generates binary content', () => {
    const fileSchema = z
      .file()
      .check(z.mime(['image/png']))
      .check(z.minSize(50))
      .check(z.maxSize(150))

    const fakeFile = fake(fileSchema)

    expect(fakeFile).toBeInstanceOf(File)
    expect(fakeFile.type).toBe('image/png')
    expect(fakeFile.name).toMatch(/\.png$/)
    expect(fakeFile.size).toBeGreaterThanOrEqual(50)
    expect(fakeFile.size).toBeLessThanOrEqual(150)
  })

  test('File with multiple MIME types selects one', () => {
    const allowedTypes = ['text/plain', 'application/json', 'image/jpeg']
    const fileSchema = z.file().check(z.mime(allowedTypes))

    const fakeFile = fake(fileSchema)

    expect(fakeFile).toBeInstanceOf(File)
    expect(allowedTypes).toContain(fakeFile.type)
  })

  test('File with large size constraint', () => {
    const minSize = 100000 // 100KB
    const maxSize = 200000 // 200KB
    const fileSchema = z.file().check(z.minSize(minSize)).check(z.maxSize(maxSize))

    const fakeFile = fake(fileSchema)

    expect(fakeFile).toBeInstanceOf(File)
    expect(fakeFile.size).toBeGreaterThanOrEqual(minSize)
    expect(fakeFile.size).toBeLessThanOrEqual(maxSize)
  })

  test('File name is always a non-empty string', () => {
    const fileSchema = z.file()

    for (let i = 0; i < 10; i++) {
      const fakeFile = fake(fileSchema)
      expect(fakeFile.name).toBeTruthy()
      expect(typeof fakeFile.name).toBe('string')
      expect(fakeFile.name.length).toBeGreaterThan(0)
    }
  })

  test('File type is always a non-empty string', () => {
    const fileSchema = z.file()

    for (let i = 0; i < 10; i++) {
      const fakeFile = fake(fileSchema)
      expect(fakeFile.type).toBeTruthy()
      expect(typeof fakeFile.type).toBe('string')
      expect(fakeFile.type.length).toBeGreaterThan(0)
    }
  })
})
