import { describe, expect, it } from 'vitest'
import { foo } from '../src'

describe('simple test', async () => {
  it('test equal', () => {
    expect(foo).toEqual('foo')
  })
})
