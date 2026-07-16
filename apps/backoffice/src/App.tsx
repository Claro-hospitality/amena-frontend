import { Button } from '@amena/ui/components/ui/button'
import { Input } from '@amena/ui/components/ui/input'

function App() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 bg-background text-foreground">
      <h1 className="text-2xl font-semibold">Amena — Backoffice</h1>
      <div className="flex w-full max-w-xs flex-col gap-3">
        <Input placeholder="Escribe algo…" />
        <Button>Botón primario</Button>
      </div>
    </main>
  )
}

export default App
