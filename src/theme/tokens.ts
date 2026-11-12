export const colors = {
  background: '#ffffff',
  surface: '#f3f4f6',
  text: '#111827',
  mutedText: '#4b5563',
  border: '#6b7280',
  focus: '#1d4ed8',
} as const

export const spacing = {
  small: '0.5rem',
  medium: '1rem',
  large: '2rem',
  contentMaxWidth: '60rem',
} as const

export type ColorPair = { name: string; foreground: string; background: string }

export const textColorPairs: ColorPair[] = [
  { name: 'text on background', foreground: colors.text, background: colors.background },
  { name: 'text on surface', foreground: colors.text, background: colors.surface },
  { name: 'muted text on background', foreground: colors.mutedText, background: colors.background },
  { name: 'muted text on surface', foreground: colors.mutedText, background: colors.surface },
]

export const boundaryColorPairs: ColorPair[] = [
  { name: 'border on background', foreground: colors.border, background: colors.background },
  { name: 'border on surface', foreground: colors.border, background: colors.surface },
  { name: 'focus on background', foreground: colors.focus, background: colors.background },
  { name: 'focus on surface', foreground: colors.focus, background: colors.surface },
]

function toKebabCase(name: string): string {
  return name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)
}

export function toCssCustomProperties(): Record<string, string> {
  const entries = [
    ...Object.entries(colors).map(([name, value]) => [`--color-${toKebabCase(name)}`, value]),
    ...Object.entries(spacing).map(([name, value]) => [`--space-${toKebabCase(name)}`, value]),
  ]
  return Object.fromEntries(entries)
}
