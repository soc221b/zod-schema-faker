import * as core from 'zod/v4/core'
import { Context } from '../context'
import { rootFake as internalFake } from '../fake'
import { getFaker } from '../random'
import { Infer } from '../type'

export function fakeFile<T extends core.$ZodFile>(
  schema: T,
  context: Context,
  rootFake: typeof internalFake,
): Infer<T> {
  const faker = getFaker()

  // Default values
  let minSize: number | undefined = undefined
  let maxSize: number | undefined = undefined
  let allowedMimeTypes: string[] | undefined = undefined

  // Process schema checks for constraints
  for (const check of (schema._zod.def.checks ?? []) as core.$ZodChecks[]) {
    switch (check._zod.def.check) {
      case 'min_size': {
        minSize = check._zod.def.minimum
        break
      }
      case 'max_size': {
        maxSize = check._zod.def.maximum
        break
      }
      case 'mime_type': {
        allowedMimeTypes = check._zod.def.mime
        break
      }
      default: {
        const _:
          | 'bigint_format'
          | 'greater_than'
          | 'length_equals'
          | 'less_than'
          | 'max_length'
          | 'min_length'
          | 'multiple_of'
          | 'number_format'
          | 'overwrite'
          | 'property'
          | 'size_equals'
          | 'string_format'
          | never = check._zod.def.check
        break
      }
    }
  }

  // Validate constraints
  if (minSize !== undefined && maxSize !== undefined && minSize > maxSize) {
    throw new TypeError('Invalid file size constraints: minimum size cannot be greater than maximum size')
  }

  // Determine MIME type
  let mimeType: string
  if (allowedMimeTypes && allowedMimeTypes.length > 0) {
    // Use one of the allowed MIME types
    mimeType = faker.helpers.arrayElement(allowedMimeTypes)
  } else {
    // Default to a common MIME type
    mimeType = faker.helpers.arrayElement([
      'text/plain',
      'application/json',
      'image/jpeg',
      'image/png',
      'application/pdf',
    ])
  }

  // Generate appropriate file name based on MIME type
  let fileName: string
  let extension: string

  switch (mimeType) {
    case 'text/plain':
      extension = 'txt'
      break
    case 'text/html':
      extension = 'html'
      break
    case 'text/css':
      extension = 'css'
      break
    case 'text/javascript':
      extension = 'js'
      break
    case 'application/json':
      extension = 'json'
      break
    case 'application/xml':
      extension = 'xml'
      break
    case 'application/pdf':
      extension = 'pdf'
      break
    case 'image/jpeg':
      extension = 'jpg'
      break
    case 'image/png':
      extension = 'png'
      break
    case 'image/gif':
      extension = 'gif'
      break
    case 'image/svg+xml':
      extension = 'svg'
      break
    case 'audio/mpeg':
      extension = 'mp3'
      break
    case 'audio/wav':
      extension = 'wav'
      break
    case 'video/mp4':
      extension = 'mp4'
      break
    case 'video/webm':
      extension = 'webm'
      break
    case 'application/zip':
      extension = 'zip'
      break
    case 'application/octet-stream':
      extension = 'bin'
      break
    default:
      extension = 'bin'
  }

  fileName = `${faker.system.fileName({ extensionCount: 0 })}.${extension}`

  // Determine file size
  let fileSize: number
  if (minSize !== undefined || maxSize !== undefined) {
    const min = minSize ?? 0
    const max = maxSize ?? 1024 * 1024 // Default to 1MB if no max specified
    fileSize = faker.number.int({ min, max })
  } else {
    // Default size range: 1KB to 100KB
    fileSize = faker.number.int({ min: 1024, max: 100 * 1024 })
  }

  // Generate file content based on MIME type and size
  let content: BlobPart

  if (mimeType.startsWith('text/') || mimeType === 'application/json' || mimeType === 'application/xml') {
    // Text-based content
    const targetLength = Math.max(1, fileSize)
    let textContent = ''

    while (textContent.length < targetLength) {
      textContent += faker.lorem.paragraph() + '\n'
    }

    content = textContent.slice(0, targetLength)
  } else {
    // Binary content - generate random bytes
    const buffer = new ArrayBuffer(fileSize)
    const view = new Uint8Array(buffer)
    for (let i = 0; i < fileSize; i++) {
      view[i] = faker.number.int({ min: 0, max: 255 })
    }
    content = buffer
  }

  // Create and return File object
  try {
    return new File([content], fileName, { type: mimeType }) as Infer<T>
  } catch (error) {
    // Fallback for environments where File constructor is not available
    throw new TypeError('File constructor is not available in this environment')
  }
}
