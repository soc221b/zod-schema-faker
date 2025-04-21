import { Context } from './context'

export type ZodType<O = unknown> = { _zod: { output: O } } // TODO: use core.$ZodType

export type Infer<T extends ZodType> = T['_zod']['output']

export type Fake<T extends ZodType> = (schema: T, fake: RootFake, context: Context) => Infer<T>

export type RootFake = <T extends ZodType>(schema: T, context: Context) => Infer<T>
