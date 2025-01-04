import { z } from 'zod'
import { ZodSchemaFakerError } from './error'
import { fake } from './fake'
import { ZodTypeFaker } from './zod-type-faker'

export class ZodIntersectionFaker<T extends z.ZodIntersection<any, any>> extends ZodTypeFaker<T> {
  fake(): z.infer<T> {
    const leftResult = fake(this.schema._def.left)
    const rightResult = fake(this.schema._def.right)
    const result = mergeValues(leftResult, rightResult)
    if (result.valid && this.schema.safeParse(result.data).success) {
      return result.data
    } else {
      throw new ZodSchemaFakerError('Unable to generate valid values for Zod schema: ' + this.schema.toString())
    }
  }

  static create<T extends z.ZodIntersection<any, any>>(schema: T): ZodIntersectionFaker<T> {
    return new ZodIntersectionFaker(schema)
  }
}

export const zodIntersectionFaker: typeof ZodIntersectionFaker.create = ZodIntersectionFaker.create

function mergeValues(a: any, b: any): { valid: true; data: any } | { valid: false } {
  const aType = z.getParsedType(a)
  const bType = z.getParsedType(b)

  if (a === b) {
    return { valid: true, data: a }
  } else if (aType === z.ZodParsedType.object && bType === z.ZodParsedType.object) {
    const bKeys = Object.keys(b)
    const sharedKeys = Object.keys(a).filter(key => bKeys.indexOf(key) !== -1)

    const newObj: any = { ...a, ...b }
    for (const key of sharedKeys) {
      const sharedValue = mergeValues(a[key], b[key])
      if (!sharedValue.valid) {
        return { valid: false }
      }
      newObj[key] = sharedValue.data
    }

    return { valid: true, data: newObj }
  } else if (aType === z.ZodParsedType.array && bType === z.ZodParsedType.array) {
    const newArray = []
    for (let index = 0; index < Math.min(a.length, b.length); index++) {
      const itemA = a[index]
      const itemB = b[index]
      const sharedValue = mergeValues(itemA, itemB)

      if (!sharedValue.valid) {
        return { valid: false }
      }

      newArray.push(sharedValue.data)
    }

    return { valid: true, data: newArray }
  } else if (aType === z.ZodParsedType.date && bType === z.ZodParsedType.date) {
    return { valid: true, data: a }
  } else {
    return { valid: false }
  }
}
