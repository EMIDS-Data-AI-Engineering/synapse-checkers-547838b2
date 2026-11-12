import { Board } from './Board'

export function AppShell() {
  return (
    <div className="min-h-dvh w-full flex flex-col">
      <header className="w-full border-b-2 border-accent px-4 py-4">
        <h1 className="mx-auto w-full max-w-5xl text-2xl font-bold sm:text-3xl">Checkers</h1>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        <Board />
      </main>
    </div>
  )
}
