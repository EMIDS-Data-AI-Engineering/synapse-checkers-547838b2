// @vitest-environment node
import { mkdtempSync, readdirSync, readFileSync, rmSync, statSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { gzipSync } from 'node:zlib'
import { afterAll, describe, expect, it } from 'vitest'

const projectRoot = resolve(__dirname, '..')
const GZIPPED_JS_BUDGET_BYTES = 150 * 1024
const outDir = mkdtempSync(join(tmpdir(), 'spa-build-'))

let buildRun: Promise<void> | undefined

async function runBuildOnce() {
  const { build } = await import('vite')
  buildRun ??= build({ root: projectRoot, logLevel: 'silent', build: { outDir, emptyOutDir: true } }).then(
    () => undefined,
  )
  return buildRun
}

function listFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry)
    return statSync(path).isDirectory() ? listFiles(path) : [path]
  })
}

function builtFilesEndingWith(extension: string) {
  return listFiles(outDir).filter((file) => file.endsWith(extension))
}

afterAll(() => rmSync(outDir, { recursive: true, force: true }))

describe('production build', () => {
  it('produces a deployable static bundle with index.html and hashed assets', async () => {
    await runBuildOnce()

    const indexHtml = readFileSync(join(outDir, 'index.html'), 'utf8')
    expect(indexHtml).toMatch(/assets\/[\w-]+-[\w-]{8}\.js/)
    expect(builtFilesEndingWith('.js').length).toBeGreaterThan(0)
    expect(builtFilesEndingWith('.css').length).toBeGreaterThan(0)
  }, 120000)

  it('completes without errors', async () => {
    await expect(runBuildOnce()).resolves.toBeUndefined()
  }, 120000)

  it('keeps the gzipped JavaScript within the 150 KB load budget', async () => {
    await runBuildOnce()

    const gzippedBytes = builtFilesEndingWith('.js')
      .map((file) => gzipSync(readFileSync(file)).length)
      .reduce((total, size) => total + size, 0)
    expect(gzippedBytes).toBeGreaterThan(0)
    expect(gzippedBytes).toBeLessThanOrEqual(GZIPPED_JS_BUDGET_BYTES)
  }, 120000)
})

describe('index.html', () => {
  it('declares a responsive viewport without disabling zoom', () => {
    const indexHtml = readFileSync(join(projectRoot, 'index.html'), 'utf8')
    const viewport = indexHtml.match(/<meta[^>]*name=["']viewport["'][^>]*>/i)?.[0] ?? ''

    expect(viewport).toMatch(/width=device-width/)
    expect(viewport).toMatch(/initial-scale=1/)
    expect(viewport).not.toMatch(/user-scalable\s*=\s*(no|0)/i)
    expect(viewport).not.toMatch(/maximum-scale\s*=\s*1(\.0)?(\D|$)/i)
  })
})
