import * as z from 'zod'
import { runFake } from './faker'
import { ZodTypeFaker } from './zod-type-faker'

const getValidEnumValues = (obj: any) => {
  const validKeys = Object.keys(obj).filter((k: any) => typeof obj[obj[k]] !== 'number')
  const filtered: any = {}
  for (const k of validKeys) {
    filtered[k] = obj[k]
  }
  return Object.keys(filtered).map(key => filtered[key])
}

export class ZodNativeEnumFaker<T extends z.ZodNativeEnum<any>> extends ZodTypeFaker<T> {
  fake(): z.infer<T> {
    const values = this.schema._def.values
    const validEnumValues = getValidEnumValues(values)
    const randomIndex = runFake(faker => faker.datatype.number({ min: 0, max: validEnumValues.length - 1 }))
    return validEnumValues[randomIndex]
  }

  static create<T extends z.ZodNativeEnum<any>>(schema: T): ZodNativeEnumFaker<T> {
    return new ZodNativeEnumFaker(schema)
  }
}

export const zodNativeEnumFaker = ZodNativeEnumFaker.create
