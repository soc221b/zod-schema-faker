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
import { ZodCatchFaker } from './zod-catch-faker'

/**
 * register fakers, must be called before using `fake()`
 */
export function install(): void {
  const exhaustiveZodFirstPartyTypeKindToZodTypeFaker: Record<
    z.ZodFirstPartyTypeKind,
    typeof ZodTypeFaker<z.ZodTypeAny>
  > = {
    [z.ZodFirstPartyTypeKind.ZodAny]: ZodAnyFaker,
    [z.ZodFirstPartyTypeKind.ZodArray]: ZodArrayFaker,
    [z.ZodFirstPartyTypeKind.ZodBigInt]: ZodBigIntFaker,
    [z.ZodFirstPartyTypeKind.ZodBoolean]: ZodBooleanFaker,
    [z.ZodFirstPartyTypeKind.ZodBranded]: ZodBrandedFaker,
    [z.ZodFirstPartyTypeKind.ZodCatch]: ZodCatchFaker,
    [z.ZodFirstPartyTypeKind.ZodDate]: ZodDateFaker,
    [z.ZodFirstPartyTypeKind.ZodDefault]: ZodDefaultFaker,
    [z.ZodFirstPartyTypeKind.ZodDiscriminatedUnion]: ZodDiscriminatedUnionFaker,
    [z.ZodFirstPartyTypeKind.ZodEffects]: ZodEffectsFaker,
    [z.ZodFirstPartyTypeKind.ZodEnum]: ZodEnumFaker,
    [z.ZodFirstPartyTypeKind.ZodFunction]: ZodFunctionFaker,
    [z.ZodFirstPartyTypeKind.ZodIntersection]: ZodIntersectionFaker,
    [z.ZodFirstPartyTypeKind.ZodLazy]: ZodLazyFaker,
    [z.ZodFirstPartyTypeKind.ZodLiteral]: ZodLiteralFaker,
    [z.ZodFirstPartyTypeKind.ZodMap]: ZodMapFaker,
    [z.ZodFirstPartyTypeKind.ZodNaN]: ZodNaNFaker,
    [z.ZodFirstPartyTypeKind.ZodNativeEnum]: ZodNativeEnumFaker,
    [z.ZodFirstPartyTypeKind.ZodNever]: ZodNeverFaker,
    [z.ZodFirstPartyTypeKind.ZodNull]: ZodNullFaker,
    [z.ZodFirstPartyTypeKind.ZodNullable]: ZodNullableFaker,
    [z.ZodFirstPartyTypeKind.ZodNumber]: ZodNumberFaker,
    [z.ZodFirstPartyTypeKind.ZodObject]: ZodObjectFaker,
    [z.ZodFirstPartyTypeKind.ZodOptional]: ZodOptionalFaker,
    [z.ZodFirstPartyTypeKind.ZodPipeline]: ZodPipelineFaker,
    [z.ZodFirstPartyTypeKind.ZodPromise]: ZodPromiseFaker,
    [z.ZodFirstPartyTypeKind.ZodReadonly]: ZodReadonlyFaker,
    [z.ZodFirstPartyTypeKind.ZodRecord]: ZodRecordFaker,
    [z.ZodFirstPartyTypeKind.ZodSet]: ZodSetFaker,
    [z.ZodFirstPartyTypeKind.ZodString]: ZodStringFaker,
    [z.ZodFirstPartyTypeKind.ZodSymbol]: ZodSymbolFaker,
    [z.ZodFirstPartyTypeKind.ZodTuple]: ZodTupleFaker,
    [z.ZodFirstPartyTypeKind.ZodUndefined]: ZodUndefinedFaker,
    [z.ZodFirstPartyTypeKind.ZodUnion]: ZodUnionFaker,
    [z.ZodFirstPartyTypeKind.ZodUnknown]: ZodUnknownFaker,
    [z.ZodFirstPartyTypeKind.ZodVoid]: ZodVoidFaker,
  }
  for (const zoDFirstPartyType of Object.keys(
    exhaustiveZodFirstPartyTypeKindToZodTypeFaker,
  ) as z.ZodFirstPartyTypeKind[]) {
    zodFirstPartyTypeKindToZodTypeFaker.set(
      zoDFirstPartyType,
      exhaustiveZodFirstPartyTypeKindToZodTypeFaker[zoDFirstPartyType],
    )
  }
}

/**
 * register custom fakers for custom schemas, must be called before using `fake()`
 */
export function installCustom<T extends z.ZodTypeAny>(schema: T, faker: { new (schema: T): ZodTypeFaker<T> }): void {
  zodTypeToZodTypeFaker.set(schema, faker)
}

/**
 * @internal This is a private API, do not use. It is a utility function for testing.
 */
export const uninstall = (): void => {
  zodFirstPartyTypeKindToZodTypeFaker.clear()
  zodTypeToZodTypeFaker.clear()
}
