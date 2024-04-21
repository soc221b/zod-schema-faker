import * as z from 'zod'
import { zodTypeKindToZodTypeFaker } from './fake'
import { ZodAnyFaker } from './zod-any-faker'
import { ZodArrayFaker } from './zod-array-faker'
import { ZodBigIntFaker } from './zod-bigint-faker'
import { ZodBooleanFaker } from './zod-boolean-faker'
import { ZodDateFaker } from './zod-date-faker'
import { ZodDefaultFaker } from './zod-default-faker'
import { ZodDiscriminatedUnionFaker } from './zod-discriminated-union-faker'
import { ZodEffectsFaker } from './zod-effects-faker'
import { ZodEnumFaker } from './zod-enum-faker'
// import { ZodFunctionFaker } from './zod-function-faker'
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
import { ZodTupleFaker } from './zod-tuple-faker'
import { ZodUndefinedFaker } from './zod-undefined-faker'
import { ZodUnionFaker } from './zod-union-faker'
import { ZodUnknownFaker } from './zod-unknown-faker'
import { ZodVoidFaker } from './zod-void-faker'

/**
 * register fakers, must be called before using `fake()`
 */
export function install(): void {
  zodTypeKindToZodTypeFaker.set(z.ZodFirstPartyTypeKind.ZodAny, ZodAnyFaker)
  zodTypeKindToZodTypeFaker.set(z.ZodFirstPartyTypeKind.ZodArray, ZodArrayFaker)
  zodTypeKindToZodTypeFaker.set(z.ZodFirstPartyTypeKind.ZodBigInt, ZodBigIntFaker)
  zodTypeKindToZodTypeFaker.set(z.ZodFirstPartyTypeKind.ZodBoolean, ZodBooleanFaker)
  zodTypeKindToZodTypeFaker.set(z.ZodFirstPartyTypeKind.ZodDate, ZodDateFaker)
  zodTypeKindToZodTypeFaker.set(z.ZodFirstPartyTypeKind.ZodDefault, ZodDefaultFaker)
  zodTypeKindToZodTypeFaker.set(z.ZodFirstPartyTypeKind.ZodDiscriminatedUnion, ZodDiscriminatedUnionFaker)
  zodTypeKindToZodTypeFaker.set(z.ZodFirstPartyTypeKind.ZodEffects, ZodEffectsFaker)
  zodTypeKindToZodTypeFaker.set(z.ZodFirstPartyTypeKind.ZodEnum, ZodEnumFaker)
  // zodTypeKindToZodTypeFaker.set(z.ZodFirstPartyTypeKind.ZodFunction, ZodFunctionFaker)
  zodTypeKindToZodTypeFaker.set(z.ZodFirstPartyTypeKind.ZodIntersection, ZodIntersectionFaker)
  zodTypeKindToZodTypeFaker.set(z.ZodFirstPartyTypeKind.ZodLazy, ZodLazyFaker)
  zodTypeKindToZodTypeFaker.set(z.ZodFirstPartyTypeKind.ZodLiteral, ZodLiteralFaker)
  zodTypeKindToZodTypeFaker.set(z.ZodFirstPartyTypeKind.ZodMap, ZodMapFaker)
  zodTypeKindToZodTypeFaker.set(z.ZodFirstPartyTypeKind.ZodNaN, ZodNaNFaker)
  zodTypeKindToZodTypeFaker.set(z.ZodFirstPartyTypeKind.ZodNativeEnum, ZodNativeEnumFaker)
  zodTypeKindToZodTypeFaker.set(z.ZodFirstPartyTypeKind.ZodNever, ZodNeverFaker)
  zodTypeKindToZodTypeFaker.set(z.ZodFirstPartyTypeKind.ZodNull, ZodNullFaker)
  zodTypeKindToZodTypeFaker.set(z.ZodFirstPartyTypeKind.ZodNullable, ZodNullableFaker)
  zodTypeKindToZodTypeFaker.set(z.ZodFirstPartyTypeKind.ZodNumber, ZodNumberFaker)
  zodTypeKindToZodTypeFaker.set(z.ZodFirstPartyTypeKind.ZodObject, ZodObjectFaker)
  zodTypeKindToZodTypeFaker.set(z.ZodFirstPartyTypeKind.ZodOptional, ZodOptionalFaker)
  zodTypeKindToZodTypeFaker.set(z.ZodFirstPartyTypeKind.ZodPipeline, ZodPipelineFaker)
  zodTypeKindToZodTypeFaker.set(z.ZodFirstPartyTypeKind.ZodPromise, ZodPromiseFaker)
  zodTypeKindToZodTypeFaker.set(z.ZodFirstPartyTypeKind.ZodReadonly, ZodReadonlyFaker)
  zodTypeKindToZodTypeFaker.set(z.ZodFirstPartyTypeKind.ZodRecord, ZodRecordFaker)
  zodTypeKindToZodTypeFaker.set(z.ZodFirstPartyTypeKind.ZodSet, ZodSetFaker)
  zodTypeKindToZodTypeFaker.set(z.ZodFirstPartyTypeKind.ZodString, ZodStringFaker)
  zodTypeKindToZodTypeFaker.set(z.ZodFirstPartyTypeKind.ZodTuple, ZodTupleFaker)
  zodTypeKindToZodTypeFaker.set(z.ZodFirstPartyTypeKind.ZodUndefined, ZodUndefinedFaker)
  zodTypeKindToZodTypeFaker.set(z.ZodFirstPartyTypeKind.ZodUnion, ZodUnionFaker)
  zodTypeKindToZodTypeFaker.set(z.ZodFirstPartyTypeKind.ZodUnknown, ZodUnknownFaker)
  zodTypeKindToZodTypeFaker.set(z.ZodFirstPartyTypeKind.ZodVoid, ZodVoidFaker)
}

/**
 * @internal This is a private API, do not use. It is a utility function for testing.
 */
export const uninstall = (): void => {
  zodTypeKindToZodTypeFaker.clear()
}
