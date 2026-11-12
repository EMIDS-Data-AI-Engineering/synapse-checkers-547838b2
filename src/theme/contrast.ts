const CHANNEL_LINEARIZATION_THRESHOLD = 0.03928
const RED_WEIGHT = 0.2126
const GREEN_WEIGHT = 0.7152
const BLUE_WEIGHT = 0.0722
const LUMINANCE_OFFSET = 0.05

function linearize(channel: number): number {
  const scaled = channel / 255
  return scaled <= CHANNEL_LINEARIZATION_THRESHOLD ? scaled / 12.92 : ((scaled + 0.055) / 1.055) ** 2.4
}

function parseHex(hex: string): [number, number, number] {
  const digits = hex.replace('#', '')
  const [red, green, blue] = [0, 2, 4].map((start) => parseInt(digits.slice(start, start + 2), 16))
  return [red, green, blue]
}

export function relativeLuminance(hex: string): number {
  const [red, green, blue] = parseHex(hex).map(linearize)
  return RED_WEIGHT * red + GREEN_WEIGHT * green + BLUE_WEIGHT * blue
}

export function contrastRatio(foreground: string, background: string): number {
  const [lighter, darker] = [relativeLuminance(foreground), relativeLuminance(background)].sort((a, b) => b - a)
  return (lighter + LUMINANCE_OFFSET) / (darker + LUMINANCE_OFFSET)
}
