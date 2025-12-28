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
  let mimeType = 'text/plain'

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
        // Handle MIME type constraint when available
        // Note: The exact property name for MIME type may vary in Zod v4
        // For now, we'll skip this until we know the correct API
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
 * Get appropriate file extension for a given MIME type
 */
function getExtensionForMimeType(mimeType: string): string {
  const mimeExtensionMap: Record<string, string> = {
    'text/plain': 'txt',
    'text/html': 'html',
    'text/css': 'css',
    'text/javascript': 'js',
    'text/csv': 'csv',
    'application/json': 'json',
    'application/xml': 'xml',
    'application/javascript': 'js',
    'application/pdf': 'pdf',
    'application/zip': 'zip',
    'application/vnd.ms-excel': 'xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
    'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
    'application/vnd.ms-powerpoint': 'ppt',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
    'application/octet-stream': 'bin',
    'application/graphql': 'graphql',
    'application/x-www-form-urlencoded': 'form',
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/svg+xml': 'svg',
    'image/webp': 'webp',
    'audio/mpeg': 'mp3',
    'audio/ogg': 'ogg',
    'audio/wav': 'wav',
    'audio/webm': 'webm',
    'video/mp4': 'mp4',
    'video/webm': 'webm',
    'video/ogg': 'ogv',
    'font/woff': 'woff',
    'font/woff2': 'woff2',
    'font/ttf': 'ttf',
    'font/otf': 'otf',
    'multipart/form-data': 'form',
  }

  return mimeExtensionMap[mimeType] || 'txt'
}

/**
 * Generate file content based on MIME type and target size
 */
function generateFileContent(mimeType: string, targetSize: number): ArrayBuffer {
  const faker = getFaker()

  if (targetSize === 0) {
    return new ArrayBuffer(0)
  }

  let content: string

  // Generate content based on MIME type
  if (mimeType.startsWith('text/')) {
    switch (mimeType) {
      case 'text/html':
        content = `<!DOCTYPE html><html><head><title>${faker.lorem.words()}</title></head><body><h1>${faker.lorem.sentence()}</h1><p>${faker.lorem.paragraphs()}</p></body></html>`
        break
      case 'text/css':
        content = `body { font-family: Arial, sans-serif; } h1 { color: #333; } p { margin: 10px; }`
        break
      case 'text/javascript':
        content = `function ${faker.hacker.noun()}() { console.log("${faker.lorem.sentence()}"); return "${faker.lorem.word()}"; }`
        break
      case 'text/csv':
        content = `name,email,age\n${faker.person.fullName()},${faker.internet.email()},${faker.number.int({ min: 18, max: 80 })}\n${faker.person.fullName()},${faker.internet.email()},${faker.number.int({ min: 18, max: 80 })}`
        break
      default:
        content = faker.lorem.paragraphs()
    }
  } else if (mimeType.startsWith('application/')) {
    switch (mimeType) {
      case 'application/json':
        content = JSON.stringify({
          id: faker.string.uuid(),
          name: faker.person.fullName(),
          email: faker.internet.email(),
          data: faker.lorem.paragraphs(),
        })
        break
      case 'application/xml':
        content = `<?xml version="1.0" encoding="UTF-8"?><root><item id="${faker.string.uuid()}"><name>${faker.person.fullName()}</name><content>${faker.lorem.sentence()}</content></item></root>`
        break
      default:
        content = faker.lorem.paragraphs()
    }
  } else {
    // For binary types (image, audio, video, etc.), generate random text content
    content = faker.lorem.paragraphs()
  }

  // Adjust content to match target size exactly
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
  } else if (content.length > targetSize) {
    // Truncate to target size exactly
    content = content.slice(0, targetSize)
  }

  // Ensure we have exactly the target size
  if (content.length !== targetSize) {
    // Fallback: pad with spaces or truncate as needed
    if (content.length < targetSize) {
      content = content.padEnd(targetSize, ' ')
    } else {
      content = content.slice(0, targetSize)
    }
  }

  // Convert to ArrayBuffer
  const encoder = new TextEncoder()
  return encoder.encode(content).buffer
}
