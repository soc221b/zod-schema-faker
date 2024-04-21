import * as z from 'zod'
import { ZodSchemaFakerError } from './error'
import { randexp, runFake } from './faker'
import { ZodTypeFaker } from './zod-type-faker'

const averageWordLength = 5
const averageSentenceLength = averageWordLength * 15
const averageParagraphLength = averageWordLength * 200

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

    for (const check of this.schema._def.checks) {
      switch (check.kind) {
        case 'cuid':
          return randexp(/^c[^\s-]{8,}$/i)
        case 'cuid2':
          return randexp(/^[0-9a-z]+$/)
        case 'datetime':
          return runFake(faker => faker.date.anytime()).toISOString()
        case 'email':
          return runFake(faker => faker.internet.email())
        // FIXME: unable to generate
        case 'emoji':
          return randexp(new RegExp(/^(\p{Extended_Pictographic}|\p{Emoji_Component})+$/, 'u'))
        case 'endsWith':
          endsWith = check.value
          break
        case 'ip':
          return check.version === 'v6'
            ? randexp(
                /^(([a-f0-9]{1,4}:){7}|::([a-f0-9]{1,4}:){0,6}|([a-f0-9]{1,4}:){1}:([a-f0-9]{1,4}:){0,5}|([a-f0-9]{1,4}:){2}:([a-f0-9]{1,4}:){0,4}|([a-f0-9]{1,4}:){3}:([a-f0-9]{1,4}:){0,3}|([a-f0-9]{1,4}:){4}:([a-f0-9]{1,4}:){0,2}|([a-f0-9]{1,4}:){5}:([a-f0-9]{1,4}:){0,1})([a-f0-9]{1,4}|(((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2}))\.){3}((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2})))$/,
              )
            : randexp(
                /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/,
              )
        case 'includes':
          includes = check.value
          break
        case 'length':
          exact = check.value
          break
        case 'startsWith':
          startsWith = check.value
          break
        case 'toLowerCase':
          toLowercase = true
          break
        case 'toUpperCase':
          toUppercase = true
          break
        case 'max':
          max = check.value
          break
        case 'min':
          min = check.value
          break
        case 'regex':
          return randexp(check.regex)
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
    return result
  }

  static create(schema: z.ZodString): ZodStringFaker {
    return new ZodStringFaker(schema)
  }
}

export const zodStringFaker = ZodStringFaker.create
