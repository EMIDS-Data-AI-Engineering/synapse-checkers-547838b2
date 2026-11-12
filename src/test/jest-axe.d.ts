declare module 'jest-axe' {
  export function axe(element: Element | string): Promise<unknown>
  export const toHaveNoViolations: Record<string, unknown>
}

declare module 'vitest' {
  interface Assertion {
    toHaveNoViolations(): void
  }
  interface AsymmetricMatchersContaining {
    toHaveNoViolations(): void
  }
}

export {}
