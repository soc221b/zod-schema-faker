import { z } from 'zod'
import { zodFirstPartyTypeKindToZodTypeFaker, zodTypeToZodTypeFaker } from './fake'
import { ZodAnyFaker } from './zod-any-faker'
import { ZodArrayFaker } from './zod-array-faker'
import { ZodBigIntFaker } from './zod-bigint-faker'
import { ZodBooleanFaker } from './zod-boolean-faker'
import { ZodBrandedFaker } from './zod-branded-faker'
import { ZodDateFaker } from './zod-date-faker'
import { ZodDefaultFaker } from './zod-default-faker'
import { ZodDiscriminatedUnionFaker } from './zod-discriminated-union-faker'
import { ZodEffectsFaker } from './zod-effects-faker'
import { ZodEnumFaker } from './zod-enum-faker'
import { ZodFunctionFaker } from './zod-function-faker'
import { ZodIntersectionFaker } from './zod-intersection-faker'
import { ZodLazyFaker } from './zod-lazy-faker'
import { ZodLiteralFaker } from './zod-literal-faker'
import { ZodMapFaker } from './zod-map-faker'
import { ZodNaNFaker } from './zod-nan-faker'
import { ZodNativeEnumFaker } from './zod-native-enum-faker'
import { ZodNeverFaker } from './zod-never-faker'
import { ZodNullFaker } from './zod-null-faker'
import { ZodNullableFaker } from './zod-nullable-faker'
import { ZodNumberFaker } from './zod-number-faker'
import { ZodObjectFaker } from './zod-object-faker'
import { ZodOptionalFaker } from './zod-optional-faker'
import { ZodPipelineFaker } from './zod-pipe-faker'
import { ZodPromiseFaker } from './zod-promise-faker'
import { ZodReadonlyFaker } from './zod-readonly-faker'
import { ZodRecordFaker } from './zod-record-faker'
import { ZodSetFaker } from './zod-set-faker'
import { ZodStringFaker } from './zod-string-faker'
import { ZodSymbolFaker } from './zod-symbol-faker'
import { ZodTupleFaker } from './zod-tuple-faker'
import { ZodTypeFaker } from './zod-type-faker'
import { ZodUndefinedFaker } from './zod-undefined-faker'
import { ZodUnionFaker } from './zod-union-faker'
import { ZodUnknownFaker } from './zod-unknown-faker'
import { ZodVoidFaker } from './zod-void-faker'

/**
 * register fakers, must be called before using `fake()`
 */
export function install(): void {
  zodFirstPartyTypeKindToZodTypeFaker.set(z.ZodFirstPartyTypeKind.ZodAny, ZodAnyFaker)
  zodFirstPartyTypeKindToZodTypeFaker.set(z.ZodFirstPartyTypeKind.ZodArray, ZodArrayFaker)
  zodFirstPartyTypeKindToZodTypeFaker.set(z.ZodFirstPartyTypeKind.ZodBigInt, ZodBigIntFaker)
  zodFirstPartyTypeKindToZodTypeFaker.set(z.ZodFirstPartyTypeKind.ZodBoolean, ZodBooleanFaker)
  zodFirstPartyTypeKindToZodTypeFaker.set(z.ZodFirstPartyTypeKind.ZodBranded, ZodBrandedFaker)
  zodFirstPartyTypeKindToZodTypeFaker.set(z.ZodFirstPartyTypeKind.ZodDate, ZodDateFaker)
  zodFirstPartyTypeKindToZodTypeFaker.set(z.ZodFirstPartyTypeKind.ZodDefault, ZodDefaultFaker)
  zodFirstPartyTypeKindToZodTypeFaker.set(z.ZodFirstPartyTypeKind.ZodDiscriminatedUnion, ZodDiscriminatedUnionFaker)
  zodFirstPartyTypeKindToZodTypeFaker.set(z.ZodFirstPartyTypeKind.ZodEffects, ZodEffectsFaker)
  zodFirstPartyTypeKindToZodTypeFaker.set(z.ZodFirstPartyTypeKind.ZodEnum, ZodEnumFaker)
  zodFirstPartyTypeKindToZodTypeFaker.set(z.ZodFirstPartyTypeKind.ZodFunction, ZodFunctionFaker)
  zodFirstPartyTypeKindToZodTypeFaker.set(z.ZodFirstPartyTypeKind.ZodIntersection, ZodIntersectionFaker)
  zodFirstPartyTypeKindToZodTypeFaker.set(z.ZodFirstPartyTypeKind.ZodLazy, ZodLazyFaker)
  zodFirstPartyTypeKindToZodTypeFaker.set(z.ZodFirstPartyTypeKind.ZodLiteral, ZodLiteralFaker)
  zodFirstPartyTypeKindToZodTypeFaker.set(z.ZodFirstPartyTypeKind.ZodMap, ZodMapFaker)
  zodFirstPartyTypeKindToZodTypeFaker.set(z.ZodFirstPartyTypeKind.ZodNaN, ZodNaNFaker)
  zodFirstPartyTypeKindToZodTypeFaker.set(z.ZodFirstPartyTypeKind.ZodNativeEnum, ZodNativeEnumFaker)
  zodFirstPartyTypeKindToZodTypeFaker.set(z.ZodFirstPartyTypeKind.ZodNever, ZodNeverFaker)
  zodFirstPartyTypeKindToZodTypeFaker.set(z.ZodFirstPartyTypeKind.ZodNull, ZodNullFaker)
  zodFirstPartyTypeKindToZodTypeFaker.set(z.ZodFirstPartyTypeKind.ZodNullable, ZodNullableFaker)
  zodFirstPartyTypeKindToZodTypeFaker.set(z.ZodFirstPartyTypeKind.ZodNumber, ZodNumberFaker)
  zodFirstPartyTypeKindToZodTypeFaker.set(z.ZodFirstPartyTypeKind.ZodObject, ZodObjectFaker)
  zodFirstPartyTypeKindToZodTypeFaker.set(z.ZodFirstPartyTypeKind.ZodOptional, ZodOptionalFaker)
  zodFirstPartyTypeKindToZodTypeFaker.set(z.ZodFirstPartyTypeKind.ZodPipeline, ZodPipelineFaker)
  zodFirstPartyTypeKindToZodTypeFaker.set(z.ZodFirstPartyTypeKind.ZodPromise, ZodPromiseFaker)
  zodFirstPartyTypeKindToZodTypeFaker.set(z.ZodFirstPartyTypeKind.ZodReadonly, ZodReadonlyFaker)
  zodFirstPartyTypeKindToZodTypeFaker.set(z.ZodFirstPartyTypeKind.ZodRecord, ZodRecordFaker)
  zodFirstPartyTypeKindToZodTypeFaker.set(z.ZodFirstPartyTypeKind.ZodSet, ZodSetFaker)
  zodFirstPartyTypeKindToZodTypeFaker.set(z.ZodFirstPartyTypeKind.ZodString, ZodStringFaker)
  zodFirstPartyTypeKindToZodTypeFaker.set(z.ZodFirstPartyTypeKind.ZodSymbol, ZodSymbolFaker)
  zodFirstPartyTypeKindToZodTypeFaker.set(z.ZodFirstPartyTypeKind.ZodTuple, ZodTupleFaker)
  zodFirstPartyTypeKindToZodTypeFaker.set(z.ZodFirstPartyTypeKind.ZodUndefined, ZodUndefinedFaker)
  zodFirstPartyTypeKindToZodTypeFaker.set(z.ZodFirstPartyTypeKind.ZodUnion, ZodUnionFaker)
  zodFirstPartyTypeKindToZodTypeFaker.set(z.ZodFirstPartyTypeKind.ZodUnknown, ZodUnknownFaker)
  zodFirstPartyTypeKindToZodTypeFaker.set(z.ZodFirstPartyTypeKind.ZodVoid, ZodVoidFaker)
}

/**
 * register custom fakers for custom schemas, must be called before using `fake()`
 */
export function installCustom<T extends z.ZodType<any, any, any>>(
  schema: T,
  faker: { new (schema: T): ZodTypeFaker<T> },
): void {
  zodTypeToZodTypeFaker.set(schema, faker)
}

/**
 * @internal This is a private API, do not use. It is a utility function for testing.
 */
export const uninstall = (): void => {
  zodFirstPartyTypeKindToZodTypeFaker.clear()
  zodTypeToZodTypeFaker.clear()
}
