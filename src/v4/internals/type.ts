import * as core from 'zod/v4/core'
import { Context } from './context'

export type Infer<T extends core.$ZodType> = T['_zod']['input']

export type Fake<T extends core.$ZodType> = (schema: T, context: Context, fake: RootFake) => core.input<T>

export type RootFake = <T extends core.$ZodType>(schema: T, context: Context) => core.input<T>
