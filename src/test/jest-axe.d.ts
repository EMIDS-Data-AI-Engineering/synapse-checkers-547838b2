declare module 'jest-axe' {
  export function axe(element: Element | string): Promise<unknown>
  export const toHaveNoViolations: Record<string, (...received: any[]) => any>
}
