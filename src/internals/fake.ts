import { fakeAny } from './schemas/any'
import { fakeArray } from './schemas/array'
import { fakeBigInt } from './schemas/big-int'
import { fakeBoolean } from './schemas/boolean'
import { fakeCatch } from './schemas/catch'
import { fakeCustom } from './schemas/custom'
import { fakeDate } from './schemas/date'
import { fakeDefault } from './schemas/default'
import { fakeEnum } from './schemas/enum'
import { fakeInterface } from './schemas/interface'
import { fakeLazy } from './schemas/lazy'
import { fakeLiteral } from './schemas/literal'
import { fakeMap } from './schemas/map'
import { fakeNaN } from './schemas/nan'
import { fakeNever } from './schemas/never'
import { fakeNonOptional } from './schemas/non-optional'
import { fakeNull } from './schemas/null'
import { fakeNullable } from './schemas/nullable'
import { fakeNumber } from './schemas/number'
import { fakeObject } from './schemas/object'
import { fakeOptional } from './schemas/optional'
import { fakePipe } from './schemas/pipe'
import { fakePromise } from './schemas/promise'
import { fakeReadonly } from './schemas/readonly'
import { fakeRecord } from './schemas/record'
import { fakeSet } from './schemas/set'
import { fakeString } from './schemas/string'
import { fakeSymbol } from './schemas/symbol'
import { fakeTemplateLiteral } from './schemas/template-literal'
import { fakeTuple } from './schemas/tuple'
import { fakeUndefined } from './schemas/undefined'
import { fakeUnion } from './schemas/union'
import { fakeUnknown } from './schemas/unknown'
import { fakeVoid } from './schemas/void'
import { RootFake } from './type'

export const fake: RootFake = (schema, context) => {
  switch (schema._zod.def.type) {
    case 'any':
      return fakeAny(schema as any, fake, context)
    case 'array':
      return fakeArray(schema as any, fake, context)
    case 'bigint':
      return fakeBigInt(schema as any, fake, context)
    case 'boolean':
      return fakeBoolean(schema as any, fake, context)
    case 'catch':
      return fakeCatch(schema as any, fake, context)
    case 'custom':
      return fakeCustom(schema as any, fake, context)
    case 'date':
      return fakeDate(schema as any, fake, context)
    case 'default':
      return fakeDefault(schema as any, fake, context)
    case 'enum':
      return fakeEnum(schema as any, fake, context)
    case 'file':
      // TODO
      break
    case 'int':
      // TODO
      break
    case 'interface':
      return fakeInterface(schema as any, fake, context)
    case 'intersection':
      // TODO
      break
    case 'lazy':
      return fakeLazy(schema as any, fake, context)
    case 'literal':
      return fakeLiteral(schema as any, fake, context)
    case 'map':
      return fakeMap(schema as any, fake, context)
    case 'nan':
      return fakeNaN(schema as any, fake, context)
    case 'never':
      return fakeNever(schema as any, fake, context)
    case 'nonoptional':
      return fakeNonOptional(schema as any, fake, context)
    case 'null':
      return fakeNull(schema as any, fake, context)
    case 'nullable':
      return fakeNullable(schema as any, fake, context)
    case 'number':
      return fakeNumber(schema as any, fake, context)
    case 'object':
      return fakeObject(schema as any, fake, context)
    case 'optional':
      return fakeOptional(schema as any, fake, context)
    case 'pipe':
      return fakePipe(schema as any, fake, context)
    case 'promise':
      return fakePromise(schema as any, fake, context)
    case 'readonly':
      return fakeReadonly(schema as any, fake, context)
    case 'record':
      return fakeRecord(schema as any, fake, context)
    case 'set':
      return fakeSet(schema as any, fake, context)
    case 'string':
      return fakeString(schema as any, fake, context)
    case 'success':
      // TODO
      break
    case 'symbol':
      return fakeSymbol(schema as any, fake, context)
    case 'template_literal':
      return fakeTemplateLiteral(schema as any, fake, context)
    case 'transform':
      // TODO
      break
    case 'tuple':
      return fakeTuple(schema as any, fake, context)
    case 'undefined':
      return fakeUndefined(schema as any, fake, context)
    case 'union':
      return fakeUnion(schema as any, fake, context)
    case 'unknown':
      return fakeUnknown(schema as any, fake, context)
    case 'void':
      return fakeVoid(schema as any, fake, context)
    default: {
      const _: never = schema._zod.def.type
      break
    }
  }

  throw Error(`Unsupported schema type: ${schema._zod.def.type}`)
}
