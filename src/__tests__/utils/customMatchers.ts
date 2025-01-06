import { expect } from 'vitest'

interface CustomMatchers<R = unknown> {
  toHaveBeenCalledOnceWith: (expected: unknown) => R
  toBeValidDate: () => R
  toBeWithinRange: (floor: number, ceiling: number) => R
}

declare module 'vitest' {
  interface Assertion<T = any> extends CustomMatchers<T> {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}

expect.extend({
  toHaveBeenCalledOnceWith(received: any, expected: unknown) {
    const pass = received.mock?.calls?.length === 1 &&
      JSON.stringify(received.mock?.calls[0]) === JSON.stringify([expected])

    return {
      pass,
      message: () =>
        pass
          ? `Expected function not to have been called once with ${expected}`
          : `Expected function to have been called once with ${expected}`,
    }
  },

  toBeValidDate(received: any) {
    const date = new Date(received)
    const pass = date instanceof Date && !isNaN(date.getTime())

    return {
      pass,
      message: () =>
        pass
          ? `Expected ${received} not to be a valid date`
          : `Expected ${received} to be a valid date`,
    }
  },

  toBeWithinRange(received: number, floor: number, ceiling: number) {
    const pass = received >= floor && received <= ceiling

    return {
      pass,
      message: () =>
        pass
          ? `Expected ${received} not to be within range ${floor} - ${ceiling}`
          : `Expected ${received} to be within range ${floor} - ${ceiling}`,
    }
  },
}) 