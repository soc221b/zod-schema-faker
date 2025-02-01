import { beforeEach, expect, test } from 'vitest'
import { z } from 'zod'
import { fake, installCustom, ZodTypeFaker, runFake, install } from '../src'

interface UserLike {
  name: string
}

class User implements UserLike {
  constructor(public name: string) {}
}

// 1/5. define custom schema
const UserSchema = z.instanceof(User).and(z.object({ name: z.string() }).strict())

// 2/5. define custom faker
class UserFaker extends ZodTypeFaker<typeof UserSchema> {
  fake(): User {
    return new User(`${runFake(faker => faker.person.firstName())}`)
  }
}

beforeEach(() => {
  // 3/5. install basic faker
  install()
  // 4/5. install custom faker
  installCustom(UserSchema, UserFaker)
})

test('instanceof', () => {
  // 5/5. use it
  const data = fake(UserSchema)
  expect(UserSchema.safeParse(data).success).toBe(true)

  const userLike: UserLike = { name: 'foo' }
  const user: User = new User('bar')
  expect(UserSchema.safeParse(user).data).toEqual(user)
  expect(UserSchema.safeParse(userLike).error).toMatchInlineSnapshot(`
  [ZodError: [
    {
      "code": "custom",
      "message": "Input not instance of User",
      "fatal": true,
      "path": []
    }
  ]]
`)
})
