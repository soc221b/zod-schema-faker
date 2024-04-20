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

    for (const check of this.schema._def.checks) {
      switch (check.kind) {
        case 'cuid':
          return randexp(/^c[^\s-]{8,}$/i)
        case 'email':
          return runFake(faker => faker.internet.email())
        case 'max':
          max = check.value
          break
        case 'min':
          min = check.value
          break
        case 'regex':
          return randexp(check.regex)
        case 'url':
          return runFake(faker => faker.internet.url())
        case 'uuid':
          return runFake(faker => faker.string.uuid())
      }
    }

    let result = ''
    while (Number.isFinite(min) && result.length < min) {
      result += runFake(faker => faker.lorem.word()) + ' '
    }
    while (Number.isFinite(max) && result.length < max) {
      result += runFake(faker => faker.lorem.word()) + ' '
    }
    result = result.slice(0, max)
    return result
  }

  static create(schema: z.ZodString): ZodStringFaker {
    return new ZodStringFaker(schema)
  }
}

export const zodStringFaker = ZodStringFaker.create
