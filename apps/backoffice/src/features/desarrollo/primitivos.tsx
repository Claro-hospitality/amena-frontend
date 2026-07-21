import type { ReactNode } from 'react'

/** Contenedor de una sección del catálogo: título + tarjeta (bg-card, borde, sin sombra). */
export function Seccion({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold tracking-tight text-muted-foreground uppercase">
        {titulo}
      </h2>
      <div className="rounded-lg border border-border bg-card p-5">{children}</div>
    </section>
  )
}

/** Fila de ejemplos con envoltura y separación. */
export function Fila({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-center gap-3">{children}</div>
}
