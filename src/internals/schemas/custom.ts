import * as core from 'zod/v4/core'
import { Context } from '../context'
import { Fake, Infer, RootFake } from '../type'

const customs = new Map<core.$ZodType, Fake<core.$ZodType>>()
export function custom<T extends core.$ZodType>(schema: T, fake: Fake<T>): void {
  customs.set(schema, fake as any)
}

export function fakeCustom<T extends core.$ZodCustom>(schema: T, context: Context, rootFake: RootFake): Infer<T> {
  return customs.get(schema)!(schema, context, rootFake)
}
