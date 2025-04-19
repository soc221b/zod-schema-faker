import * as core from '@zod/core'
import { fakeBoolean } from './schemas/boolean'
import { fakeArray } from './schemas/array'
import { fakeBigInt } from './schemas/big-int'
import { fakeDate } from './schemas/date'
import { fakeMap } from './schemas/map'
import { fakeNaN } from './schemas/nan'
import { fakeNull } from './schemas/null'
import { fakeNumber } from './schemas/number'
import { fakeObject } from './schemas/object'
import { fakePromise } from './schemas/promise'
import { fakeRecord } from './schemas/record'
import { fakeSet } from './schemas/set'
import { fakeString } from './schemas/string'
import { fakeSymbol } from './schemas/symbol'
import { fakeUndefined } from './schemas/undefined'
import { fakeAny } from './schemas/any'
import { fakeEnum } from './schemas/enum'
import { fakeInterface } from './schemas/interface'
import { fakeLiteral } from './schemas/literal'
import { fakeNever } from './schemas/never'
import { fakeNonOptional } from './schemas/non-optional'
import { fakeNullable } from './schemas/nullable'
import { fakeOptional } from './schemas/optional'
import { fakeTemplateLiteral } from './schemas/template-literal'
import { fakeTuple } from './schemas/tuple'
import { fakeUnion } from './schemas/union'
import { fakeVoid } from './schemas/void'
import { fakeUnknown } from './schemas/unknown'
import { fakeReadonly } from './schemas/readonly'
import { fakeLazy } from './schemas/lazy'
import { fakePipe } from './schemas/pipe'
import { fakeDefault } from './schemas/default'
import { fakeCatch } from './schemas/catch'
import { fakeFile } from './schemas/file'

export function fake<T extends core.$ZodType<any, any>>(schema: T): core.infer<T> {
  switch (schema._zod.def.type) {
    case 'any':
      return fakeAny(schema as any, fake)
    case 'array':
      return fakeArray(schema as any, fake)
    case 'bigint':
      return fakeBigInt(schema as any, fake)
    case 'boolean':
      return fakeBoolean(schema as any, fake)
    case 'catch':
      return fakeCatch(schema as any, fake)
    case 'custom':
      // TODO
      break
    case 'date':
      return fakeDate(schema as any, fake)
    case 'default':
      return fakeDefault(schema as any, fake)
    case 'enum':
      return fakeEnum(schema as any, fake)
    case 'file':
      return fakeFile(schema as any, fake)
    case 'int':
      // TODO
      break
    case 'interface':
      return fakeInterface(schema as any, fake)
    case 'intersection':
      // TODO
      break
    case 'lazy':
      return fakeLazy(schema as any, fake)
    case 'literal':
      return fakeLiteral(schema as any, fake)
    case 'map':
      return fakeMap(schema as any, fake)
    case 'nan':
      return fakeNaN(schema as any, fake)
    case 'never':
      return fakeNever(schema as any, fake)
    case 'nonoptional':
      return fakeNonOptional(schema as any, fake)
    case 'null':
      return fakeNull(schema as any, fake)
    case 'nullable':
      return fakeNullable(schema as any, fake)
    case 'number':
      return fakeNumber(schema as any, fake)
    case 'object':
      return fakeObject(schema as any, fake)
    case 'optional':
      return fakeOptional(schema as any, fake)
    case 'pipe':
      return fakePipe(schema as any, fake)
    case 'promise':
      return fakePromise(schema as any, fake)
    case 'readonly':
      return fakeReadonly(schema as any, fake)
    case 'record':
      return fakeRecord(schema as any, fake)
    case 'set':
      return fakeSet(schema as any, fake)
    case 'string':
      return fakeString(schema as any, fake)
    case 'success':
      // TODO
      break
    case 'symbol':
      return fakeSymbol(schema as any, fake)
    case 'template_literal':
      return fakeTemplateLiteral(schema as any, fake)
    case 'transform':
      // TODO
      break
    case 'tuple':
      return fakeTuple(schema as any, fake)
    case 'undefined':
      return fakeUndefined(schema as any, fake)
    case 'union':
      return fakeUnion(schema as any, fake)
    case 'unknown':
      return fakeUnknown(schema as any, fake)
    case 'void':
      return fakeVoid(schema as any, fake)
    default: {
      const _: never = schema._zod.def.type
      break
    }
  }

  throw Error(`Unsupported schema type: ${schema._zod.def.type}`)
}
