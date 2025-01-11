import { z } from 'zod'
import { fake } from './fake'
import { ZodTypeFaker } from './zod-type-faker'

export class ZodEffectsFaker<T extends z.ZodEffects<any, any, any>> extends ZodTypeFaker<T> {
  fake(): z.infer<T> {
    let result: any
    switch (this.schema._def.effect.type) {
      case 'preprocess':
        result = fake(this.schema._def.schema)
        break

      case 'refinement':
        result = fake(this.schema._def.schema)
        break

      case 'transform':
        result = this.schema._def.effect.transform(fake(this.schema._def.schema), { addIssue: () => void 0, path: [] })
        break

      /* istanbul ignore next */
      default: {
        const _: never = this.schema._def.effect
      }
    }

    return result
  }
}
