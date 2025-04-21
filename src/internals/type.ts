import * as core from '@zod/core'
import { Context } from './context'

export type Fake<T extends core.$ZodType> = (schema: T, fake: RootFake, context: Context) => core.infer<T>

export type RootFake = <T extends core.$ZodType>(schema: T, context: Context) => core.infer<T>
