/** Página placeholder genérica para secciones aún no implementadas. */
export function Placeholder({ titulo }: { titulo: string }) {
  return (
    <div>
      <p className="text-muted-foreground">Placeholder — «{titulo}» en construcción.</p>
    </div>
  )
}
