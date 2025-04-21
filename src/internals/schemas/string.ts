import * as core from '@zod/core'
import { Context } from '../context'
import { rootFake as internalFake } from '../fake'
import { getFaker } from '../random'
import { Infer } from '../type'
import { unescape } from '../utils'
import { fakeStringFormat } from './checks/string-format'

export function fakeString<T extends core.$ZodString>(
  schema: T,
  context: Context,
  rootFake: typeof internalFake,
): Infer<T> {
  let data = getFaker().lorem.sentence()
  let min = undefined
  let max = undefined
  let startsWith = ''
  let includes = ''
  let endsWith = ''
  let uppercase = false
  let lowercase = false
  data = fakeStringFormat(schema as any, rootFake) ?? data
  for (const check of (schema._zod.def.checks ?? []) as core.$ZodChecks[]) {
    switch (check._zod.def.check) {
      case 'length_equals': {
        min = check._zod.def.length
        max = check._zod.def.length
        break
      }
      case 'max_length': {
        max = Math.min(max ?? check._zod.def.maximum, check._zod.def.maximum)
        break
      }
      case 'min_length': {
        min = Math.max(min ?? check._zod.def.minimum, check._zod.def.minimum)
        break
      }
      case 'string_format': {
        data = fakeStringFormat(check as any, rootFake) ?? data
        const checkStringFormat = check as core.$ZodCheckStringFormat
        switch (checkStringFormat._zod.def.format) {
          case 'ends_with': {
            endsWith = unescape(checkStringFormat._zod.def.pattern?.source ?? '')
              .replace(/^\.\*/, '')
              .replace(/\$$/, '')
            break
          }
          case 'includes': {
            includes = unescape(checkStringFormat._zod.def.pattern?.source ?? '')
            break
          }
          case 'lowercase': {
            lowercase = true
            break
          }
          case 'starts_with': {
            startsWith = unescape(checkStringFormat._zod.def.pattern?.source ?? '')
              .replace(/^\^/, '')
              .replace(/\.\*$/, '')
            break
          }
          case 'uppercase': {
            uppercase = true
            break
          }
          default: {
            const _:
              | 'base64'
              | 'base64url'
              | 'cidrv4'
              | 'cidrv6'
              | 'cuid'
              | 'cuid2'
              | 'date'
              | 'datetime'
              | 'duration'
              | 'e164'
              | 'email'
              | 'emoji'
              | 'guid'
              | 'ipv4'
              | 'ipv6'
              | 'json_string'
              | 'jwt'
              | 'ksuid'
              | 'nanoid'
              | 'regex'
              | 'time'
              | 'ulid'
              | 'url'
              | 'uuid'
              | 'xid'
              | never = checkStringFormat._zod.def.format
            break
          }
        }
        break
      }
      default: {
        const _:
          | 'bigint_format'
          | 'greater_than'
          | 'less_than'
          | 'max_size'
          | 'mime_type'
          | 'min_size'
          | 'multiple_of'
          | 'number_format'
          | 'overwrite'
          | 'property'
          | 'size_equals'
          | never = check._zod.def.check
        break
      }
    }
  }
  max = max === Infinity ? min : max

  if (min !== undefined && data.length < min) {
    data = data.padEnd(min, ' ')
  }
  if (max !== undefined && data.length > max) {
    data = data.slice(0, max)
  }
  if (uppercase) {
    data = data.toUpperCase()
  }
  if (lowercase) {
    data = data.toLowerCase()
  }
  if (startsWith && !data.startsWith(startsWith)) {
    data = startsWith + data
  }
  if (includes && !data.includes(includes)) {
    data = data + includes
  }
  if (endsWith && !data.endsWith(endsWith)) {
    data = data + endsWith
  }
  return data
}
