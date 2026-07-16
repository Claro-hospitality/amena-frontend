/** Página placeholder genérica para secciones aún no implementadas. */
export function Placeholder({ titulo }: { titulo: string }) {
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold">{titulo}</h1>
      <p className="text-muted-foreground">Placeholder — sección en construcción.</p>
    </div>
  )
}
