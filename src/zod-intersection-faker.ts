import * as z from 'zod'
import { fake } from './fake'
import { ZodTypeFaker } from './zod-type-faker'

/* TODO: this is a bit of a hack, but it works for now */
const safeCount = 1e3
export class ZodIntersectionFaker<T extends z.ZodIntersection<any, any>> extends ZodTypeFaker<T> {
  fake(): z.infer<T> {
    let count = 0
    do {
      const leftResult = fake(this.schema._def.left)
      const rightResult = fake(this.schema._def.right)
      const result = mergeValues(leftResult, rightResult)
      if (result.valid && this.schema.safeParse(result.data).success) {
        return result.data
      }
    } while (++count < safeCount)

    throw new Error('can not fake a valid data')
  }

  static create<T extends z.ZodIntersection<any, any>>(schema: T): ZodIntersectionFaker<T> {
    return new ZodIntersectionFaker(schema)
  }
}

export const zodIntersectionFaker = ZodIntersectionFaker.create

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
    if (a.length !== b.length) {
      return { valid: false }
    }

    const newArray = []
    for (let index = 0; index < a.length; index++) {
      const itemA = a[index]
      const itemB = b[index]
      const sharedValue = mergeValues(itemA, itemB)

      if (!sharedValue.valid) {
        return { valid: false }
      }

      newArray.push(sharedValue.data)
    }

    return { valid: true, data: newArray }
  } else if (aType === z.ZodParsedType.date && bType === z.ZodParsedType.date && +a === +b) {
    return { valid: true, data: a }
  } else {
    return { valid: false }
  }
}
