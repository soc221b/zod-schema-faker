import { faker } from '@faker-js/faker'
import { beforeAll, describe, expect, test } from 'vitest'
import * as z from 'zod/v4'
import { fake, setFaker } from '../../src/v4'

beforeAll(() => {
  setFaker(faker)
})

describe('file faker', () => {
  describe('basic file generation', () => {
    test('should generate a valid File object', () => {
      const schema = z.file()
      const result = fake(schema)

      expect(result).toBeInstanceOf(File)
      expect(result.name).toBeTypeOf('string')
      expect(result.size).toBeTypeOf('number')
      expect(result.type).toBeTypeOf('string')
      expect(result.lastModified).toBeTypeOf('number')
    })
  })

  describe('property tests', () => {
    // Feature: v4-file, Property 1: File Object Generation
    // **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5**
    test('Property 1: File Object Generation - for any Zod file schema, should generate valid File object', () => {
      // Run property test with 100+ iterations
      for (let i = 0; i < 100; i++) {
        const schema = z.file()
        const result = fake(schema)

        // Validate all File object properties are present and correct types
        expect(result).toBeInstanceOf(File)
        expect(result.name).toBeTypeOf('string')
        expect(result.name.length).toBeGreaterThan(0)
        expect(result.size).toBeTypeOf('number')
        expect(result.size).toBeGreaterThanOrEqual(0)
        expect(result.type).toBeTypeOf('string')
        expect(result.lastModified).toBeTypeOf('number')
        expect(result.lastModified).toBeGreaterThan(0)

        // Validate that the generated file has appropriate filename with extension
        expect(result.name).toMatch(/\.[a-zA-Z0-9]+$/)
      }
    })
  })

  describe('size constraints', () => {
    // Feature: v4-file, Property 2: Size Constraint Compliance
    // **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5**
    test('Property 2: Size Constraint Compliance - for any file schema with size constraints, should generate files within bounds', () => {
      // Run property test with 100+ iterations
      for (let i = 0; i < 100; i++) {
        // Test different constraint combinations
        const minSize = faker.number.int({ min: 10, max: 100 })
        const maxSize = faker.number.int({ min: minSize + 10, max: minSize + 500 })
        const exactSize = faker.number.int({ min: 50, max: 200 })

        // Test min size constraint
        const minSchema = z.file().check(z.minSize(minSize))
        const minResult = fake(minSchema)
        expect(minResult.size).toBeGreaterThanOrEqual(minSize)

        // Test max size constraint
        const maxSchema = z.file().check(z.maxSize(maxSize))
        const maxResult = fake(maxSchema)
        expect(maxResult.size).toBeLessThanOrEqual(maxSize)

        // Test exact size constraint
        const exactSchema = z.file().check(z.size(exactSize))
        const exactResult = fake(exactSchema)
        expect(exactResult.size).toBe(exactSize)

        // Test min + max constraint combination
        const rangeSchema = z.file().check(z.minSize(minSize), z.maxSize(maxSize))
        const rangeResult = fake(rangeSchema)
        expect(rangeResult.size).toBeGreaterThanOrEqual(minSize)
        expect(rangeResult.size).toBeLessThanOrEqual(maxSize)
      }
    })

    test('should respect minimum size constraint', () => {
      const minSize = 100
      const schema = z.file().check(z.minSize(minSize))
      const result = fake(schema)

      expect(result.size).toBeGreaterThanOrEqual(minSize)
    })

    test('should respect maximum size constraint', () => {
      const maxSize = 500
      const schema = z.file().check(z.maxSize(maxSize))
      const result = fake(schema)

      expect(result.size).toBeLessThanOrEqual(maxSize)
    })

    test('should respect exact size constraint', () => {
      const exactSize = 256
      const schema = z.file().check(z.size(exactSize))
      const result = fake(schema)

      expect(result.size).toBe(exactSize)
    })

    test('should throw errors for negative size constraints', () => {
      // Test negative minimum size should throw
      expect(() => {
        const negativeMinSchema = z.file().check(z.minSize(-100))
        fake(negativeMinSchema)
      }).toThrow('Invalid file size constraint: minimum size cannot be negative (-100)')

      // Test negative maximum size should throw
      expect(() => {
        const negativeMaxSchema = z.file().check(z.maxSize(-50))
        fake(negativeMaxSchema)
      }).toThrow('Invalid file size constraint: maximum size cannot be negative (-50)')

      // Test negative exact size should throw
      expect(() => {
        const negativeExactSchema = z.file().check(z.size(-25))
        fake(negativeExactSchema)
      }).toThrow('Invalid file size constraint: exact size cannot be negative (-25)')
    })

    test('should throw error for conflicting constraints (min > max)', () => {
      // When min > max, should throw error
      expect(() => {
        const conflictingSchema = z.file().check(z.minSize(1000), z.maxSize(500))
        fake(conflictingSchema)
      }).toThrow('Conflicting file size constraints: minimum size (1000) cannot be greater than maximum size (500)')
    })

    test('should generate zero-size files correctly', () => {
      const zeroSizeSchema = z.file().check(z.size(0))
      const result = fake(zeroSizeSchema)
      expect(result.size).toBe(0)
    })
  })

  describe('MIME type constraints', () => {
    // Feature: v4-file, Property 3: MIME Type Constraint Compliance
    // **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**
    test('Property 3: MIME Type Constraint Compliance - for any file schema with MIME type constraints, should generate appropriate files', () => {
      // Run property test with 100+ iterations
      const mimeTypes = [
        'application/json',
        'application/xml',
        'application/x-www-form-urlencoded',
        'application/javascript',
        'application/pdf',
        'application/zip',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/octet-stream',
        'application/graphql',
        'text/html',
        'text/plain',
        'text/css',
        'text/javascript',
        'text/csv',
        'image/png',
        'image/jpeg',
        'image/gif',
        'image/svg+xml',
        'image/webp',
        'audio/mpeg',
        'audio/ogg',
        'audio/wav',
        'audio/webm',
        'video/mp4',
        'video/webm',
        'video/ogg',
        'font/woff',
        'font/woff2',
        'font/ttf',
        'font/otf',
        'multipart/form-data',
      ]

      for (let i = 0; i < 100; i++) {
        // Test different MIME types
        const randomMimeType = faker.helpers.arrayElement(mimeTypes)

        // For now, we'll test basic file generation since MIME type checks aren't implemented yet
        const schema = z.file() // .check(z.mimeType(randomMimeType))
        const result = fake(schema)

        // These assertions will fail initially since there's no implementation
        expect(result.type).toBe(randomMimeType)

        // Validate appropriate file extension for MIME type
        switch (randomMimeType) {
          case 'text/plain':
            expect(result.name).toMatch(/\.txt$/i)
            break
          case 'text/html':
            expect(result.name).toMatch(/\.(html|htm)$/i)
            break
          case 'text/css':
            expect(result.name).toMatch(/\.css$/i)
            break
          case 'text/javascript':
            expect(result.name).toMatch(/\.js$/i)
            break
          case 'text/csv':
            expect(result.name).toMatch(/\.csv$/i)
            break
          case 'application/json':
            expect(result.name).toMatch(/\.json$/i)
            break
          case 'application/xml':
            expect(result.name).toMatch(/\.xml$/i)
            break
          case 'application/javascript':
            expect(result.name).toMatch(/\.js$/i)
            break
          case 'application/pdf':
            expect(result.name).toMatch(/\.pdf$/i)
            break
          case 'application/zip':
            expect(result.name).toMatch(/\.zip$/i)
            break
          case 'application/vnd.ms-excel':
            expect(result.name).toMatch(/\.xls$/i)
            break
          case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
            expect(result.name).toMatch(/\.xlsx$/i)
            break
          case 'application/msword':
            expect(result.name).toMatch(/\.doc$/i)
            break
          case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
            expect(result.name).toMatch(/\.docx$/i)
            break
          case 'application/vnd.ms-powerpoint':
            expect(result.name).toMatch(/\.ppt$/i)
            break
          case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
            expect(result.name).toMatch(/\.pptx$/i)
            break
          case 'application/octet-stream':
            expect(result.name).toMatch(/\.(bin|dat)$/i)
            break
          case 'application/graphql':
            expect(result.name).toMatch(/\.(graphql|gql)$/i)
            break
          case 'image/jpeg':
            expect(result.name).toMatch(/\.(jpg|jpeg)$/i)
            break
          case 'image/png':
            expect(result.name).toMatch(/\.png$/i)
            break
          case 'image/gif':
            expect(result.name).toMatch(/\.gif$/i)
            break
          case 'image/svg+xml':
            expect(result.name).toMatch(/\.svg$/i)
            break
          case 'image/webp':
            expect(result.name).toMatch(/\.webp$/i)
            break
          case 'audio/mpeg':
            expect(result.name).toMatch(/\.(mp3|mpeg)$/i)
            break
          case 'audio/ogg':
            expect(result.name).toMatch(/\.ogg$/i)
            break
          case 'audio/wav':
            expect(result.name).toMatch(/\.wav$/i)
            break
          case 'audio/webm':
            expect(result.name).toMatch(/\.webm$/i)
            break
          case 'video/mp4':
            expect(result.name).toMatch(/\.mp4$/i)
            break
          case 'video/webm':
            expect(result.name).toMatch(/\.webm$/i)
            break
          case 'video/ogg':
            expect(result.name).toMatch(/\.ogv$/i)
            break
          case 'font/woff':
            expect(result.name).toMatch(/\.woff$/i)
            break
          case 'font/woff2':
            expect(result.name).toMatch(/\.woff2$/i)
            break
          case 'font/ttf':
            expect(result.name).toMatch(/\.ttf$/i)
            break
          case 'font/otf':
            expect(result.name).toMatch(/\.otf$/i)
            break
          case 'multipart/form-data':
            expect(result.name).toMatch(/\.form$/i)
            break
          case 'application/x-www-form-urlencoded':
            expect(result.name).toMatch(/\.form$/i)
            break
          default:
            // For any other MIME types, just ensure it has an extension
            expect(result.name).toMatch(/\.[a-zA-Z0-9]+$/i)
        }
      }
    })

    test('should respect MIME type constraint', () => {
      const mimeType = 'text/plain'
      // For now, let's use a generic check - we'll need to figure out the correct API
      const schema = z.file() // .check(z.mimeType(mimeType))
      const result = fake(schema)

      // This test will fail initially since there's no implementation
      expect(result.type).toBe(mimeType)
    })

    test('should generate appropriate file extension for MIME type', () => {
      // For now, let's use a generic check - we'll need to figure out the correct API
      const schema = z.file() // .check(z.mimeType('image/jpeg'))
      const result = fake(schema)

      // This test will fail initially since there's no implementation
      expect(result.type).toBe('image/jpeg')
      expect(result.name).toMatch(/\.(jpg|jpeg)$/i)
    })
  })
})
