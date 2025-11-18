import * as core from 'zod/v4/core'
import { HashFormat } from 'zod/v4/core/util'
import { rootFake as internalFake } from '../../fake'
import { getFaker, randexp } from '../../random'

const practicalEmailRegex =
  /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/

export function fakeStringFormat<T extends core.$ZodStringFormat>(
  schema: T,
  rootFake: typeof internalFake,
): undefined | string {
  let data = undefined
  const format = schema._zod.def.format as core.$ZodStringFormats | 'hex' | 'hostname' | 'httpUrl' | HashFormat
  switch (format) {
    case 'base64': {
      data = randexp(core.regexes.base64)
      break
    }
    case 'base64url': {
      // the regex itself is insufficient to validate a base64url, see https://github.com/colinhacks/zod/blob/923af801fde9f033cfd7e0e753b421a554fe3be8/packages/zod/src/v4/core/schemas.ts#L903-L905
      // data = randexp(core.regexes.base64url)
      // TODO: generate random base64url
      data = 'Zm9vK2Jhci9iYXo'
      break
    }
    case 'cidrv4': {
      data = randexp(core.regexes.cidrv4)
      break
    }
    case 'cidrv6': {
      data = getFaker().internet.ipv6() + '/' + getFaker().number.int({ min: 0, max: 128 })
      break
    }
    case 'cuid': {
      data = randexp(core.regexes.cuid)
      break
    }
    case 'cuid2': {
      data = randexp(core.regexes.cuid2)
      break
    }
    case 'date': {
      data = randexp(core.regexes.date)
      break
    }
    case 'datetime': {
      const def = schema._zod.def as core.$ZodISODateTimeDef
      data = randexp(
        core.regexes.datetime({
          local: def.local,
          offset: def.offset,
          precision: def.precision,
        }),
      )
      break
    }
    case 'duration': {
      data = [
        'P',
        getFaker().datatype.boolean() ? getFaker().number.int({ min: 0, max: 10 * 2000 }) + 'Y' : '',
        getFaker().datatype.boolean() ? getFaker().number.int({ min: 0, max: 10 * 12 }) + 'M' : '',
        getFaker().datatype.boolean() ? getFaker().number.int({ min: 0, max: 10 * 31 }) + 'D' : '',
        'T',
        getFaker().datatype.boolean() ? getFaker().number.int({ min: 0, max: 10 * 24 }) + 'H' : '',
        getFaker().datatype.boolean() ? getFaker().number.int({ min: 0, max: 10 * 60 }) + 'M' : '',
        getFaker().datatype.boolean() ? getFaker().number.int({ min: 0, max: 10 * 60 }) + 'S' : '',
      ]
        .join('')
        // PnYT => PnY
        .replace(/T$/, '')
        // P => PnW
        .replace(/^P$/, 'P' + getFaker().number.int({ min: 0, max: 100 }) + 'W')
      break
    }
    case 'e164': {
      data = randexp(core.regexes.e164)
      break
    }
    case 'email': {
      const regex = schema._zod.def.pattern ? schema._zod.def.pattern : core.regexes.email
      data = randexp(regex)
      if (practicalEmailRegex.source === regex.source) {
        data = data.replace(/\.\./g, '.').replace(/^\./, 'a')
      }
      break
    }
    case 'emoji': {
      data = '☘'
      break
    }
    case 'hex': {
      data = randexp(core.regexes.hex)
      break
    }
    case 'hostname': {
      data = getFaker().internet.domainName()
      break
    }
    case 'httpUrl': {
      data = getFaker().internet.url()
      break
    }
    case 'guid': {
      data = randexp(core.regexes.guid)
      break
    }
    case 'ipv4': {
      data = randexp(core.regexes.ipv4)
      break
    }
    case 'ipv6': {
      data = getFaker().internet.ipv6()
      break
    }
    case 'jwt': {
      const def = schema._zod.def as core.$ZodJWTDef
      data = getFaker().internet.jwt({
        header: {
          alg: def.alg || getFaker().internet.jwtAlgorithm(),
          typ: 'JWT',
        },
      })
      break
    }
    case 'ksuid': {
      data = randexp(core.regexes.ksuid)
      break
    }
    case 'md5_base64': {
      data = randexp(core.regexes.md5_base64)
      break
    }
    case 'md5_base64url': {
      data = randexp(core.regexes.md5_base64url)
      break
    }
    case 'md5_hex': {
      data = randexp(core.regexes.md5_hex)
      break
    }
    case 'nanoid': {
      data = randexp(core.regexes.nanoid)
      break
    }
    case 'regex': {
      data = randexp(schema._zod.def.pattern!)
      break
    }
    case 'sha1_base64': {
      data = randexp(core.regexes.sha1_base64)
      break
    }
    case 'sha1_base64url': {
      data = randexp(core.regexes.sha1_base64url)
      break
    }
    case 'sha1_hex': {
      data = randexp(core.regexes.sha1_hex)
      break
    }
    case 'sha256_base64': {
      data = randexp(core.regexes.sha256_base64)
      break
    }
    case 'sha256_base64url': {
      data = randexp(core.regexes.sha256_base64url)
      break
    }
    case 'sha256_hex': {
      data = randexp(core.regexes.sha256_hex)
      break
    }
    case 'sha384_base64': {
      data = randexp(core.regexes.sha384_base64)
      break
    }
    case 'sha384_base64url': {
      data = randexp(core.regexes.sha384_base64url)
      break
    }
    case 'sha384_hex': {
      data = randexp(core.regexes.sha384_hex)
      break
    }
    case 'sha512_base64': {
      data = randexp(core.regexes.sha512_base64)
      break
    }
    case 'sha512_base64url': {
      data = randexp(core.regexes.sha512_base64url)
      break
    }
    case 'sha512_hex': {
      data = randexp(core.regexes.sha512_hex)
      break
    }
    case 'time': {
      const def = schema._zod.def as core.$ZodISOTimeDef
      data = randexp(
        core.regexes.time({
          precision: def.precision,
        }),
      )
      break
    }
    case 'ulid': {
      data = randexp(core.regexes.ulid)
      break
    }
    case 'url': {
      const protocol = (schema as core.$ZodURL)._zod.def.protocol
      const hostname = (schema as core.$ZodURL)._zod.def.hostname
      if (protocol && hostname) {
        data = randexp(protocol) + '://' + randexp(hostname)
      } else if (protocol) {
        data = randexp(protocol) + '://' + getFaker().internet.domainName()
      } else if (hostname) {
        data = 'https://' + randexp(hostname)
      } else {
        data = getFaker().internet.url()
      }
      break
    }
    case 'uuid': {
      const version = (schema as core.$ZodUUID)._zod.def.version
      switch (version) {
        case 'v1':
          data = randexp(core.regexes.uuid(1))
          break
        case 'v2':
          data = randexp(core.regexes.uuid(2))
          break
        case 'v3':
          data = randexp(core.regexes.uuid(3))
          break
        case 'v4':
          data = randexp(core.regexes.uuid(4))
          break
        case 'v5':
          data = randexp(core.regexes.uuid(5))
          break
        case 'v6':
          data = randexp(core.regexes.uuid(6))
          break
        case 'v7':
          data = randexp(core.regexes.uuid(7))
          break
        case 'v8':
          data = randexp(core.regexes.uuid(8))
          break
        default: {
          const _: undefined = version
          data = randexp(core.regexes.uuid())
        }
      }
      break
    }
    case 'xid': {
      data = randexp(core.regexes.xid)
      break
    }
    default: {
      const _: 'ends_with' | 'includes' | 'json_string' | 'lowercase' | 'starts_with' | 'uppercase' = format
      break
    }
  }
  return data
}
