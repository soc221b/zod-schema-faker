import * as core from '@zod/core'
import { Context } from '../context'
import { Fake, RootFake } from '../type'

const customs = new Map<core.$ZodType, Fake<core.$ZodType>>()
export function custom<T extends core.$ZodType>(schema: T, fake: Fake<T>): void {
  customs.set(schema, fake as any)
}

export function fakeCustom<T extends core.$ZodCustom>(schema: T, fake: RootFake, context: Context): core.infer<T> {
  return customs.get(schema)!(schema, fake, context)
}
