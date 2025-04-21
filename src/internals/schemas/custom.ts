import * as core from '@zod/core'
import { Context } from '../context'
import { Fake, Infer, RootFake, ZodType } from '../type'

const customs = new Map<ZodType, Fake<ZodType>>()
export function custom<T extends ZodType>(schema: T, fake: Fake<T>): void {
  customs.set(schema, fake as any)
}

export function fakeCustom<T extends core.$ZodCustom>(schema: T, context: Context, rootFake: RootFake): Infer<T> {
  return customs.get(schema)!(schema, context, rootFake)
}
