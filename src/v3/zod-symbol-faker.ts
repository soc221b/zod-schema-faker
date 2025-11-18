import { z } from 'zod/v3'
import { ZodTypeFaker } from './zod-type-faker'

export class ZodSymbolFaker<T extends z.ZodSymbol> extends ZodTypeFaker<T> {
  fake(): z.infer<T> {
    return Symbol()
  }
}
