import { z } from 'zod'
import { ZodTypeFaker } from './zod-type-faker'
import { randexp, runFake } from './random'
import { ZodDateFaker } from './zod-date-faker'

const averageWordLength = 5
const averageSentenceLength = averageWordLength * 15
const averageParagraphLength = averageWordLength * 200

// https://github.com/colinhacks/zod/blob/main/src/types.ts
const cuidRegex = /^c[^\s-]{8,}$/i
const cuid2Regex = /^[0-9a-z]+$/
const emojisLength1 = ['☘', '⚜']
const emojisLength2 = ['😳', '😀', '😁', '🤣', '😃', '😆', '😉', '😊', '😋', '😎', '😍', '😘', '🥰', '😗', '😈', '👿']
const base64Regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/
const base64UrlRegex = /^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/

const isoDateSchema = z.date().min(new Date('0000-01-01T00:00:00.000Z')).max(new Date('9999-12-31T23:59:59.999Z'))

export class ZodStringFaker extends ZodTypeFaker<z.ZodString> {
  fake(): z.infer<z.ZodString> {
    let min: number | undefined = undefined
    let max: number | undefined = undefined
    let exact: number | undefined = undefined
    let endsWith: string | undefined = undefined
    let includes: string | undefined = undefined
    let startsWith: string | undefined = undefined
    let toLowercase = false
    let toUppercase = false
    let trim = false
    let emoji = false

    for (const check of this.schema._def.checks) {
      switch (check.kind) {
        case 'base64':
          return randexp(base64Regex)
        case 'base64url':
          return randexp(base64UrlRegex)
        case 'cidr': {
          let cidr: string = ''
          switch (check.version) {
            case 'v4':
              cidr = runFake(faker => faker.internet.ipv4() + '/' + faker.number.int({ min: 0, max: 32 }))
              break
            case 'v6':
              cidr = runFake(faker => faker.internet.ipv6() + '/' + faker.number.int({ min: 0, max: 128 }))
              break
            case undefined:
              cidr = runFake(faker => faker.datatype.boolean())
                ? runFake(faker => faker.internet.ipv4() + '/' + faker.number.int({ min: 0, max: 32 }))
                : runFake(faker => faker.internet.ipv6() + '/' + faker.number.int({ min: 0, max: 128 }))
              break
            /* v8 ignore next 3 */
            default: {
              const _: never = check.version
            }
          }
          return cidr
        }
        case 'cuid':
          return randexp(cuidRegex)
        case 'cuid2':
          return randexp(cuid2Regex)
        case 'date':
          return new ZodDateFaker(isoDateSchema).fake().toISOString().slice(0, 10)
        case 'datetime':
          return new ZodDateFaker(isoDateSchema).fake().toISOString()
        case 'duration':
          return (
            [
              'P',
              runFake(faker => (faker.datatype.boolean() ? faker.number.int({ min: 0, max: 10 * 2000 }) + 'Y' : '')),
              runFake(faker => (faker.datatype.boolean() ? faker.number.int({ min: 0, max: 10 * 12 }) + 'M' : '')),
              runFake(faker => (faker.datatype.boolean() ? faker.number.int({ min: 0, max: 10 * 31 }) + 'D' : '')),
              'T',
              runFake(faker => (faker.datatype.boolean() ? faker.number.int({ min: 0, max: 10 * 24 }) + 'H' : '')),
              runFake(faker => (faker.datatype.boolean() ? faker.number.int({ min: 0, max: 10 * 60 }) + 'M' : '')),
              runFake(faker => (faker.datatype.boolean() ? faker.number.int({ min: 0, max: 10 * 60 }) + 'S' : '')),
            ]
              .join('')
              // PnYT => PnY
              .replace(/T$/, '')
              // P => PnW
              .replace(/^P$/, 'P' + runFake(faker => faker.number.int({ min: 0, max: 100 })) + 'W')
          )
        case 'email':
          return runFake(faker => faker.internet.email())
        case 'emoji': {
          emoji = true
          break
        }
        case 'endsWith':
          endsWith = check.value
          break
        case 'includes':
          includes = check.value
          break
        case 'ip': {
          let ip: string = ''
          switch (check.version) {
            case 'v4':
              ip = runFake(faker => faker.internet.ipv4())
              break
            case 'v6':
              ip = runFake(faker => faker.internet.ipv6())
              break
            case undefined:
              ip = runFake(faker => faker.internet.ip())
              break
            /* v8 ignore next 3 */
            default: {
              const _: never = check.version
            }
          }
          return ip
        }
        case 'jwt':
          return runFake(faker => faker.internet.jwt())
        case 'length': {
          const _exact = check.value
          if (exact !== undefined && exact !== _exact) {
            throw new RangeError()
          }
          exact = _exact
          break
        }
        case 'max': {
          const _max = check.value
          max = max === undefined ? _max : Math.min(max, _max)
          break
        }
        case 'min': {
          const _min = check.value
          min = min === undefined ? _min : Math.max(min, _min)
          break
        }
        case 'nanoid':
          return runFake(faker => faker.string.nanoid())
        case 'regex':
          return randexp(check.regex)
        case 'startsWith':
          startsWith = check.value
          break
        case 'time':
          return new ZodDateFaker(isoDateSchema).fake().toISOString().slice(11, -5)
        case 'toLowerCase':
          toLowercase = true
          break
        case 'toUpperCase':
          toUppercase = true
          break
        case 'trim':
          trim = true
          break
        case 'ulid':
          return runFake(faker => faker.string.ulid())
        case 'url':
          return runFake(faker => faker.internet.url())
        case 'uuid':
          return runFake(faker => faker.string.uuid())
        /* v8 ignore next 3 */
        default: {
          const _: never = check
        }
      }
    }
    if (exact !== undefined) {
      if (min !== undefined) {
        if (exact < min) {
          throw new RangeError()
        } else {
          min = exact
        }
      }
      if (max !== undefined) {
        if (max < exact) {
          throw new RangeError()
        } else {
          max = exact
        }
      }
    }
    if (min !== undefined) {
      if (max !== undefined && min > max) {
        throw new RangeError()
      }
    } else {
      min = 0
    }
    if (max === undefined) {
      max =
        exact ??
        min +
          runFake(faker =>
            faker.datatype.boolean()
              ? averageWordLength
              : faker.datatype.boolean()
                ? averageSentenceLength
                : averageParagraphLength,
          )
    }

    let result = ''
    while (Number.isFinite(min) && result.length < min) {
      result += runFake(faker => faker.lorem.word()) + ' '
    }
    while (Number.isFinite(max) && result.length < max) {
      result += runFake(faker => faker.lorem.word()) + ' '
    }
    result = result.slice(0, max)
    if (trim) {
      result = result.replace(/\s$/, 'a')
    }
    if (toLowercase) {
      result = result.toLowerCase()
    } else {
      result = result.replace(/./g, c => (runFake(faker => faker.datatype.boolean()) ? c.toUpperCase() : c))
    }
    if (toUppercase) {
      result = result.toUpperCase()
    }
    if (includes) {
      const start = runFake(faker => faker.number.int({ min: 0, max: Math.max(0, result.length - includes.length) }))
      result = result.slice(0, start) + includes + result.slice(start)
    }
    if (startsWith) {
      result = startsWith + result.slice(startsWith.length)
    }
    if (endsWith) {
      result = result.slice(-1 * endsWith.length) + endsWith
    }
    if (emoji) {
      const odd = result.length % 2
      result = Array((result.length - odd) / 2)
        .fill(null)
        .map(() => runFake(faker => faker.helpers.arrayElement(emojisLength2)))
        .join('')
      if (odd) {
        result += runFake(faker => faker.helpers.arrayElement(emojisLength1))
      }
    }
    return result
  }
}
