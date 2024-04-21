import * as z from 'zod'
import { fake } from './fake'
import { ZodTypeFaker } from './zod-type-faker'

export class ZodPipelineFaker<T extends z.ZodPipeline<z.ZodTypeAny, z.ZodTypeAny>> extends ZodTypeFaker<T> {
  fake(): z.infer<T> {
    return fake(this.schema._def.out)
  }

  static create<T extends z.ZodPipeline<z.ZodTypeAny, z.ZodTypeAny>>(schema: T): ZodPipelineFaker<T> {
    return new ZodPipelineFaker(schema)
  }
}

export const zodPipelineFaker = ZodPipelineFaker.create
