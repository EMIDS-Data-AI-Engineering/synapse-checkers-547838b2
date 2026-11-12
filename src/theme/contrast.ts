const SIX_DIGIT_HEX = /^#[0-9a-f]{6}$/i
const LINEARISATION_THRESHOLD = 0.03928
const LUMINANCE_WEIGHTS = { red: 0.2126, green: 0.7152, blue: 0.0722 }
const LUMINANCE_OFFSET = 0.05

function channelAt(hex: string, start: number): number {
  return parseInt(hex.slice(start, start + 2), 16) / 255
}

function linearise(channel: number): number {
  return channel <= LINEARISATION_THRESHOLD ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
}

export function relativeLuminance(hex: string): number {
  if (!SIX_DIGIT_HEX.test(hex)) {
    throw new Error(`Expected a six digit hex colour such as #1a2b3c, received "${hex}"`)
  }
  const { red, green, blue } = LUMINANCE_WEIGHTS
  return (
    red * linearise(channelAt(hex, 1)) +
    green * linearise(channelAt(hex, 3)) +
    blue * linearise(channelAt(hex, 5))
  )
}

export function contrastRatio(first: string, second: string): number {
  const [lighter, darker] = [relativeLuminance(first), relativeLuminance(second)].sort((a, b) => b - a)
  return (lighter + LUMINANCE_OFFSET) / (darker + LUMINANCE_OFFSET)
}
