import * as z from 'zod'
import { ZodSchemaFakerError } from './error'
import { randexp, runFake } from './faker'
import { ZodTypeFaker } from './zod-type-faker'

const averageWordLength = 5
const averageSentenceLength = averageWordLength * 15
const averageParagraphLength = averageWordLength * 200
// https://github.com/colinhacks/zod/blob/890556e/src/__tests__/string.test.ts#L232-L239
const emojisLength1 = ['☘', '➡️', '⚜']
const emojisLength2 = [
  '👋',
  '🍺',
  '💚',
  '💙',
  '💜',
  '💛',
  '❤️',
  '🐛',
  '🗝',
  '🐏',
  '🍡',
  '🎦',
  '🚢',
  '🏨',
  '💫',
  '🎌',
  '🗡',
  '😹',
  '🔒',
  '🎬',
  '🍹',
  '🗂',
  '🚨',
  '🕑',
  '〽️',
  '🚦',
  '🌊',
  '🍴',
  '💍',
  '🍌',
  '💰',
  '😳',
  '🌺',
  '🍃',
  '😀',
  '😁',
  '😂',
  '🤣',
  '😃',
  '😄',
  '😅',
  '😆',
  '😉',
  '😊',
  '😋',
  '😎',
  '😍',
  '😘',
  '🥰',
  '😗',
  '😈',
  '👿',
]

export class ZodStringFaker extends ZodTypeFaker<z.ZodString> {
  fake(): z.infer<z.ZodString> {
    const safeCount = 10
    let count = 0
    do {
      const result = this.doFake()
      if (this.schema.safeParse(result).success) {
        return result
      }
    } while (++count < safeCount)

    throw new ZodSchemaFakerError('Unable to generate valid values for Zod schema: ' + this.schema.toString())
  }

  private doFake(): z.infer<z.ZodString> {
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
          return randexp(/^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/)
        case 'cuid':
          return randexp(/^c[^\s-]{8,}$/i)
        case 'cuid2':
          return randexp(/^[0-9a-z]+$/)
        case 'date':
          return runFake(faker => faker.date.anytime())
            .toISOString()
            .slice(0, 10)
        case 'datetime':
          return runFake(faker => faker.date.anytime()).toISOString()
        case 'duration':
          return randexp(/^P[\d]{1,4}Y0?[0-9]M[0-2]?[0-8]DT[0-1]?[0-9]H[0-5]?[0-9]M[0-5]?[0-9]S$/)
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
        case 'ip':
          return check.version === 'v6'
            ? randexp(
                /^(([a-f0-9]{1,4}:){7}|::([a-f0-9]{1,4}:){0,6}|([a-f0-9]{1,4}:){1}:([a-f0-9]{1,4}:){0,5}|([a-f0-9]{1,4}:){2}:([a-f0-9]{1,4}:){0,4}|([a-f0-9]{1,4}:){3}:([a-f0-9]{1,4}:){0,3}|([a-f0-9]{1,4}:){4}:([a-f0-9]{1,4}:){0,2}|([a-f0-9]{1,4}:){5}:([a-f0-9]{1,4}:){0,1})([a-f0-9]{1,4}|(((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2}))\.){3}((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2})))$/,
              )
            : randexp(
                /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/,
              )
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
          return randexp(/^[a-z0-9_-]{21}$/i)
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
          return randexp(/^[0-9A-HJKMNP-TV-Z]{26}$/)
        case 'url':
          return runFake(faker => faker.internet.url())
        case 'uuid':
          return runFake(faker => faker.string.uuid())
        default: {
          const _: never = check
          throw Error('unimplemented')
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
        .map(() => runFake(faker => emojisLength2[faker.number.int({ min: 0, max: emojisLength2.length - 1 })]))
        .join('')
      if (result.length % 2) {
        result += runFake(faker => emojisLength1[faker.number.int({ min: 0, max: emojisLength1.length - 1 })])
      }
    }
    return result
  }

  static create(schema: z.ZodString): ZodStringFaker {
    return new ZodStringFaker(schema)
  }
}

export const zodStringFaker: typeof ZodStringFaker.create = ZodStringFaker.create
