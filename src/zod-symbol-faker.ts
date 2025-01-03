import * as z from 'zod'
import { ZodTypeFaker } from './zod-type-faker'

export class ZodSymbolFaker<T extends z.ZodSymbol> extends ZodTypeFaker<T> {
  fake(): z.infer<T> {
    return Symbol()
  }

  static create<T extends z.ZodSymbol>(schema: T): ZodSymbolFaker<T> {
    return new ZodSymbolFaker(schema)
  }
}

export const zodSymbolFaker: typeof ZodSymbolFaker.create = ZodSymbolFaker.create
