declare module 'jest-axe' {
  export function axe(container: Element | string): Promise<unknown>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const toHaveNoViolations: Record<string, (received: any) => any>
}
