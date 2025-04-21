import * as core from '@zod/core'
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

export const fake: RootFake = ((schema: core.$ZodType, context) => {
  switch (schema._zod.def.type) {
    case 'any':
      return fakeAny(schema as any, context, fake)
    case 'array':
      return fakeArray(schema as any, context, fake)
    case 'bigint':
      return fakeBigInt(schema as any, context, fake)
    case 'boolean':
      return fakeBoolean(schema as any, context, fake)
    case 'catch':
      return fakeCatch(schema as any, context, fake)
    case 'custom':
      return fakeCustom(schema as any, context, fake)
    case 'date':
      return fakeDate(schema as any, context, fake)
    case 'default':
      return fakeDefault(schema as any, context, fake)
    case 'enum':
      return fakeEnum(schema as any, context, fake)
    case 'file':
      // TODO
      break
    case 'int':
      // TODO
      break
    case 'interface':
      return fakeInterface(schema as any, context, fake)
    case 'intersection':
      // TODO
      break
    case 'lazy':
      return fakeLazy(schema as any, context, fake)
    case 'literal':
      return fakeLiteral(schema as any, context, fake)
    case 'map':
      return fakeMap(schema as any, context, fake)
    case 'nan':
      return fakeNaN(schema as any, context, fake)
    case 'never':
      return fakeNever(schema as any, context, fake)
    case 'nonoptional':
      return fakeNonOptional(schema as any, context, fake)
    case 'null':
      return fakeNull(schema as any, context, fake)
    case 'nullable':
      return fakeNullable(schema as any, context, fake)
    case 'number':
      return fakeNumber(schema as any, context, fake)
    case 'object':
      return fakeObject(schema as any, context, fake)
    case 'optional':
      return fakeOptional(schema as any, context, fake)
    case 'pipe':
      return fakePipe(schema as any, context, fake)
    case 'promise':
      return fakePromise(schema as any, context, fake)
    case 'readonly':
      return fakeReadonly(schema as any, context, fake)
    case 'record':
      return fakeRecord(schema as any, context, fake)
    case 'set':
      return fakeSet(schema as any, context, fake)
    case 'string':
      return fakeString(schema as any, context, fake)
    case 'success':
      // TODO
      break
    case 'symbol':
      return fakeSymbol(schema as any, context, fake)
    case 'template_literal':
      return fakeTemplateLiteral(schema as any, context, fake)
    case 'transform':
      // TODO
      break
    case 'tuple':
      return fakeTuple(schema as any, context, fake)
    case 'undefined':
      return fakeUndefined(schema as any, context, fake)
    case 'union':
      return fakeUnion(schema as any, context, fake)
    case 'unknown':
      return fakeUnknown(schema as any, context, fake)
    case 'void':
      return fakeVoid(schema as any, context, fake)
    default: {
      const _: never = schema._zod.def.type
      break
    }
  }

  throw Error(`Unsupported schema type: ${schema._zod.def.type}`)
}) as RootFake
