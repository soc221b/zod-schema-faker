import { z } from 'zod'
import { ZodTypeFaker } from './zod-type-faker'
import { randexp, runFake } from './random'

const averageWordLength = 5
const averageSentenceLength = averageWordLength * 15
const averageParagraphLength = averageWordLength * 200

// https://github.com/colinhacks/zod/blob/main/src/types.ts
const cuidRegex = /^c[^\s-]{8,}$/i
const cuid2Regex = /^[0-9a-z]+$/
const emojisLength1 = ['☘', '➡️', '⚜']
const emojisLength2 = ['😳', '😀', '😁', '🤣', '😃', '😆', '😉', '😊', '😋', '😎', '😍', '😘', '🥰', '😗', '😈', '👿']
const base64Regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/
const base64UrlRegex = /^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/

export class ZodStringFaker extends ZodTypeFaker<z.ZodString> {
  fake(): z.infer<z.ZodString> {
    let min = 0
    let max = runFake(faker =>
      faker.datatype.boolean()
        ? averageWordLength
        : faker.datatype.boolean()
          ? averageSentenceLength
          : averageParagraphLength,
    )
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
                ? runFake(faker => faker.internet.ip() + '/' + faker.number.int({ min: 0, max: 32 }))
                : runFake(faker => faker.internet.ipv6() + '/' + faker.number.int({ min: 0, max: 128 }))
              break
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
          return runFake(faker => faker.date.anytime())
            .toISOString()
            .slice(0, 10)
        case 'datetime':
          return runFake(faker => faker.date.anytime()).toISOString()
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
            default: {
              const _: never = check.version
            }
          }
          return ip
        }
        case 'jwt':
          return runFake(faker => faker.internet.jwt())
        case 'length':
          exact = check.value
          break
        case 'max':
          max = check.value
          break
        case 'min':
          min = check.value
          break
        case 'nanoid':
          return runFake(faker => faker.string.nanoid())
        case 'regex':
          return randexp(check.regex)
        case 'startsWith':
          startsWith = check.value
          break
        case 'time':
          return runFake(faker => faker.date.anytime())
            .toISOString()
            .slice(11, -1)
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
        /* istanbul ignore next */
        default: {
          const _: never = check
        }
      }
    }
    min = exact ?? min
    max = exact ?? max
    max = Math.max(min, max)

    let result = ''
    while (Number.isFinite(min) && result.length < min) {
      result += runFake(faker => faker.lorem.word()) + ' '
    }
    while (Number.isFinite(max) && result.length < max) {
      result += runFake(faker => faker.lorem.word()) + ' '
    }
    result = result.slice(0, max)
    if (includes) {
      result = runFake(faker => faker.datatype.boolean())
        ? includes + result.slice(includes.length)
        : result.slice(-1 * includes.length) + includes
    }
    if (startsWith) {
      result = startsWith + result.slice(startsWith.length)
    }
    if (endsWith) {
      result = result.slice(-1 * endsWith.length) + endsWith
    }
    if (toLowercase) {
      result = result.toLowerCase()
    }
    if (toUppercase) {
      result = result.toUpperCase()
    }
    if (emoji) {
      result = Array(result.length - (result.length % 2))
        .fill(null)
        .map(() => runFake(faker => faker.helpers.arrayElement(emojisLength2)))
        .join('')
      if (result.length % 2) {
        result += runFake(faker => faker.helpers.arrayElement(emojisLength1))
      }
    }
    return result
  }
}
