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

  // Default values for file generation
  let minSize = 0
  let maxSize = 1024 // Default 1KB
  let exactSize: number | undefined = undefined
  let allowedMimeTypes: string[] = []

  // Process schema checks for constraints
  for (const check of (schema._zod.def.checks ?? []) as core.$ZodChecks[]) {
    switch (check._zod.def.check) {
      case 'min_size': {
        const minimum = check._zod.def.minimum
        if (minimum < 0) {
          throw new Error(`Invalid file size constraint: minimum size cannot be negative (${minimum})`)
        }
        minSize = Math.max(minSize, minimum)
        break
      }
      case 'max_size': {
        const maximum = check._zod.def.maximum
        if (maximum < 0) {
          throw new Error(`Invalid file size constraint: maximum size cannot be negative (${maximum})`)
        }
        maxSize = Math.min(maxSize, maximum)
        break
      }
      case 'size_equals': {
        const size = check._zod.def.size
        if (size < 0) {
          throw new Error(`Invalid file size constraint: exact size cannot be negative (${size})`)
        }
        exactSize = size
        break
      }
      case 'mime_type': {
        // Extract MIME type constraints from Zod v4 check
        const mimeCheck = check as any
        if (mimeCheck._zod?.def?.mime && Array.isArray(mimeCheck._zod.def.mime)) {
          allowedMimeTypes = [...mimeCheck._zod.def.mime]
        }
        break
      }
      default: {
        // Ignore other check types for now
        break
      }
    }
  }

  // Check for conflicting constraints (min > max)
  if (exactSize === undefined && minSize > maxSize) {
    throw new Error(
      `Conflicting file size constraints: minimum size (${minSize}) cannot be greater than maximum size (${maxSize})`,
    )
  }

  // Determine final file size
  const fileSize = exactSize !== undefined ? exactSize : faker.number.int({ min: minSize, max: maxSize })

  // Determine MIME type to use
  let mimeType: string
  if (allowedMimeTypes.length > 0) {
    // Randomly select from allowed MIME types
    mimeType = faker.helpers.arrayElement(allowedMimeTypes)
  } else {
    // Use default MIME type
    mimeType = 'text/plain'
  }

  // Generate appropriate filename with extension based on MIME type
  const extension = getExtensionForMimeType(mimeType)
  const filename = `${faker.system.fileName({ extensionCount: 0 })}.${extension}`

  // Generate file content of the specified size
  const content = generateFileContent(mimeType, fileSize)

  // Create File object
  const file = new File([content], filename, {
    type: mimeType,
    lastModified: faker.date.recent().getTime(),
  })

  return file as Infer<T>
}

/**
 * Comprehensive MIME type to file extension mapping system
 */
interface MimeTypeMapping {
  extension: string
  category: 'text' | 'image' | 'application' | 'audio' | 'video' | 'font' | 'multipart'
}

/**
 * Comprehensive MIME type mapping with categories
 */
const MIME_TYPE_MAPPINGS: Record<string, MimeTypeMapping> = {
  // Text types
  'text/plain': { extension: 'txt', category: 'text' },
  'text/html': { extension: 'html', category: 'text' },
  'text/css': { extension: 'css', category: 'text' },
  'text/javascript': { extension: 'js', category: 'text' },
  'text/csv': { extension: 'csv', category: 'text' },
  'text/markdown': { extension: 'md', category: 'text' },
  'text/xml': { extension: 'xml', category: 'text' },
  'text/yaml': { extension: 'yaml', category: 'text' },

  // Application types
  'application/json': { extension: 'json', category: 'application' },
  'application/xml': { extension: 'xml', category: 'application' },
  'application/javascript': { extension: 'js', category: 'application' },
  'application/pdf': { extension: 'pdf', category: 'application' },
  'application/zip': { extension: 'zip', category: 'application' },
  'application/octet-stream': { extension: 'bin', category: 'application' },
  'application/graphql': { extension: 'graphql', category: 'application' },
  'application/x-www-form-urlencoded': { extension: 'form', category: 'application' },
  'application/vnd.ms-excel': { extension: 'xls', category: 'application' },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { extension: 'xlsx', category: 'application' },
  'application/msword': { extension: 'doc', category: 'application' },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
    extension: 'docx',
    category: 'application',
  },
  'application/vnd.ms-powerpoint': { extension: 'ppt', category: 'application' },
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': {
    extension: 'pptx',
    category: 'application',
  },

  // Image types
  'image/jpeg': { extension: 'jpg', category: 'image' },
  'image/png': { extension: 'png', category: 'image' },
  'image/gif': { extension: 'gif', category: 'image' },
  'image/svg+xml': { extension: 'svg', category: 'image' },
  'image/webp': { extension: 'webp', category: 'image' },

  // Audio types
  'audio/mpeg': { extension: 'mp3', category: 'audio' },
  'audio/wav': { extension: 'wav', category: 'audio' },
  'audio/ogg': { extension: 'ogg', category: 'audio' },

  // Video types
  'video/mp4': { extension: 'mp4', category: 'video' },
  'video/webm': { extension: 'webm', category: 'video' },
  'video/ogg': { extension: 'ogv', category: 'video' },

  // Font types
  'font/woff': { extension: 'woff', category: 'font' },
  'font/woff2': { extension: 'woff2', category: 'font' },
  'font/ttf': { extension: 'ttf', category: 'font' },
  'font/otf': { extension: 'otf', category: 'font' },

  // Multipart types
  'multipart/form-data': { extension: 'form', category: 'multipart' },
}

/**
 * Get appropriate file extension for a given MIME type
 */
function getExtensionForMimeType(mimeType: string): string {
  const mapping = MIME_TYPE_MAPPINGS[mimeType]
  if (mapping) {
    return mapping.extension
  }

  // Fallback: try to extract extension from MIME type pattern
  const parts = mimeType.split('/')
  if (parts.length === 2) {
    const subtype = parts[1]
    if (subtype.length <= 5 && /^[a-z0-9]+$/.test(subtype)) {
      return subtype
    }
  }

  return 'txt'
}

/**
 * Get MIME type category for content generation strategy
 */
function getMimeTypeCategory(mimeType: string): MimeTypeMapping['category'] {
  const mapping = MIME_TYPE_MAPPINGS[mimeType]
  if (mapping) {
    return mapping.category
  }

  // Fallback based on main type
  const mainType = mimeType.split('/')[0]
  switch (mainType) {
    case 'text':
      return 'text'
    case 'image':
      return 'image'
    case 'audio':
      return 'audio'
    case 'video':
      return 'video'
    case 'font':
      return 'font'
    case 'multipart':
      return 'multipart'
    default:
      return 'application'
  }
}

/**
 * Generate file content based on MIME type and target size
 */
function generateFileContent(mimeType: string, targetSize: number): ArrayBuffer {
  if (targetSize === 0) {
    return new ArrayBuffer(0)
  }

  const faker = getFaker()
  let content: string

  // Generate content based on MIME type category
  const category = getMimeTypeCategory(mimeType)

  switch (category) {
    case 'text':
      content = generateTextContent(mimeType, faker)
      break
    case 'application':
      content = generateApplicationContent(mimeType, faker)
      break
    default:
      content = generateBinaryPlaceholder(mimeType, faker)
      break
  }

  // Adjust content to match target size exactly
  content = adjustContentSize(content, targetSize)

  // Convert to ArrayBuffer
  const encoder = new TextEncoder()
  const encoded = encoder.encode(content)

  // Ensure exact size by padding or truncating at byte level
  if (encoded.length !== targetSize) {
    const buffer = new ArrayBuffer(targetSize)
    const view = new Uint8Array(buffer)

    if (encoded.length < targetSize) {
      view.set(encoded)
      // Remaining bytes are already zero-initialized
    } else {
      view.set(encoded.slice(0, targetSize))
    }

    return buffer
  }

  return encoded.buffer
}

/**
 * Generate text content for text/* MIME types
 */
function generateTextContent(mimeType: string, faker: any): string {
  switch (mimeType) {
    case 'text/html':
      return `<html><head><title>${faker.lorem.words(2)}</title></head><body><h1>${faker.lorem.words(3)}</h1><p>${faker.lorem.sentence()}</p></body></html>`
    case 'text/css':
      return `body { font-family: Arial; color: #333; } h1 { margin: 10px; }`
    case 'text/javascript':
      return `function ${faker.hacker.noun().replace(/\s+/g, '')}() { return "${faker.lorem.word()}"; }`
    case 'text/csv':
      return `name,email\n${faker.person.fullName()},${faker.internet.email()}`
    case 'text/markdown':
      return `# ${faker.lorem.words(2)}\n\n${faker.lorem.sentence()}`
    case 'text/xml':
      return `<?xml version="1.0"?><root><item>${faker.lorem.word()}</item></root>`
    case 'text/yaml':
      return `name: ${faker.lorem.word()}\nversion: 1.0.0`
    default:
      return faker.lorem.paragraphs(2)
  }
}

/**
 * Generate application content for application/* MIME types
 */
function generateApplicationContent(mimeType: string, faker: any): string {
  switch (mimeType) {
    case 'application/json':
      return JSON.stringify({
        id: faker.string.uuid(),
        name: faker.person.fullName(),
        email: faker.internet.email(),
      })
    case 'application/xml':
      return `<?xml version="1.0"?><data><user id="${faker.string.uuid()}">${faker.person.fullName()}</user></data>`
    case 'application/javascript':
      return `const data = { message: "${faker.lorem.sentence()}" }; export default data;`
    default:
      return `Binary file content for ${mimeType}\nGenerated: ${new Date().toISOString()}\nData: ${faker.string.alphanumeric(50)}`
  }
}

/**
 * Generate binary placeholder content
 */
function generateBinaryPlaceholder(mimeType: string, faker: any): string {
  return `${mimeType.toUpperCase()} file placeholder\nGenerated: ${new Date().toISOString()}\nID: ${faker.string.uuid()}\nData: ${faker.string.alphanumeric(100)}`
}

/**
 * Adjust content size to match target exactly
 */
function adjustContentSize(content: string, targetSize: number): string {
  if (content.length === targetSize) {
    return content
  }

  if (content.length < targetSize) {
    // Pad with repeated content to reach target size exactly
    const baseContent = content
    while (content.length < targetSize) {
      const remaining = targetSize - content.length
      if (remaining >= baseContent.length) {
        content += baseContent
      } else {
        content += baseContent.slice(0, remaining)
      }
    }
  } else {
    // Truncate to target size exactly
    content = content.slice(0, targetSize)
  }

  return content
}
