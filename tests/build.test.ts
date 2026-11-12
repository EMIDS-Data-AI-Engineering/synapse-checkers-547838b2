import { resolve } from 'node:path'
import { gzipSync } from 'node:zlib'
import { describe, expect, it } from 'vitest'

const GZIP_BUDGET_BYTES = 150 * 1024
const BUILD_TIMEOUT_MS = 60_000

type OutputFile = { type: string; fileName: string; isEntry?: boolean; code?: string }

async function buildBundle(): Promise<OutputFile[]> {
  const { build } = await import('vite')
  const result = await build({
    root: process.cwd(),
    configFile: resolve(process.cwd(), 'vite.config.ts'),
    logLevel: 'silent',
    build: { write: false },
  })
  const outputs = Array.isArray(result) ? result : [result]
  return outputs.flatMap((output) => ('output' in output ? (output.output as OutputFile[]) : []))
}

function findEntryChunk(files: OutputFile[]): OutputFile | undefined {
  return files.find((file) => file.type === 'chunk' && file.isEntry)
}

describe('production build', () => {
  it('produces an index.html and a hashed JavaScript entry without errors', async () => {
    const files = await buildBundle()

    expect(files.some((file) => file.fileName === 'index.html')).toBe(true)
    expect(findEntryChunk(files)?.fileName).toMatch(/\.js$/)
  }, BUILD_TIMEOUT_MS)

  it('keeps the gzipped entry bundle within the load budget', async () => {
    const entry = findEntryChunk(await buildBundle())

    expect(entry?.code).toBeDefined()
    expect(gzipSync(entry!.code!).length).toBeLessThanOrEqual(GZIP_BUDGET_BYTES)
  }, BUILD_TIMEOUT_MS)
})
