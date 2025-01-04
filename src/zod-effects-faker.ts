import { z } from 'zod'
import { fake } from './fake'
import { ZodTypeFaker } from './zod-type-faker'

export class ZodEffectsFaker<T extends z.ZodEffects<any, any, any>> extends ZodTypeFaker<T> {
  fake(): z.infer<T> {
    const result = fake(this.schema._def.schema)
    switch (this.schema._def.effect.type) {
      case 'preprocess':
        // ignored
        return result

      case 'refinement':
        // ignored
        return result

      case 'transform':
        return this.schema._def.effect.transform(result, { addIssue: () => void 0, path: [] })

      /* istanbul ignore next */
      default: {
        const _: never = this.schema._def.effect
        throw Error('unimplemented')
      }
    }
  }

  static create<T extends z.ZodEffects<any, any, any>>(schema: T): ZodEffectsFaker<T> {
    return new ZodEffectsFaker(schema)
  }
}

export const zodEffectsFaker: typeof ZodEffectsFaker.create = ZodEffectsFaker.create
