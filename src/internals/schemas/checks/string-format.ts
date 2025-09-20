import * as core from 'zod/v4/core'
import { rootFake as internalFake } from '../../fake'
import { getFaker, randexp } from '../../random'

export function fakeStringFormat<T extends core.$ZodStringFormat>(
  schema: T,
  rootFake: typeof internalFake,
): undefined | string {
  let data = undefined
  const format = schema._zod.def.format as core.$ZodStringFormats
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
      data = randexp(core.regexes.datetime({}))
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
      data = getFaker().internet.email()
      break
    }
    case 'emoji': {
      data = '☘'
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
      data = getFaker().internet.jwt()
      break
    }
    case 'ksuid': {
      data = randexp(core.regexes.ksuid)
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
    case 'time': {
      data = randexp(core.regexes.time({}))
      break
    }
    case 'ulid': {
      data = randexp(core.regexes.ulid)
      break
    }
    case 'url': {
      data = getFaker().internet.url()
      break
    }
    case 'uuid': {
      data = randexp(core.regexes.uuid())
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
