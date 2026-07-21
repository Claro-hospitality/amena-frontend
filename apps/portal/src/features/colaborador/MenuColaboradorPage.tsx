import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { CalendarDays, TriangleAlert } from 'lucide-react'
import { Button } from '@amena/ui/components/ui/button'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@amena/ui/components/ui/empty'
import { Skeleton } from '@amena/ui/components/ui/skeleton'
import { aISO, deISO, diasHabiles, etiquetaDia, lunesDeSemana } from '@amena/utils'
import type { ContextoAcceso } from '../../auth/validarAccesoPortal'
import { NavegadorSemana } from '../cuotas/NavegadorSemana'
import { TarjetaPlatillo } from './TarjetaPlatillo'
import { useMenuSemana } from './queries'

function moverLunes(lunesISO: string, delta: number): string {
  const l = deISO(lunesISO)
  l.setDate(l.getDate() + delta * 7)
  return aISO(l)
}

export function MenuColaboradorPage() {
  const { tipo } = useOutletContext<ContextoAcceso>()
  const [lunesISO, setLunesISO] = useState(() => aISO(lunesDeSemana(new Date())))
  const { data: menu, isLoading, isError, refetch } = useMenuSemana(lunesISO)

  if (tipo !== 'colaborador') {
    return <p className="text-muted-foreground">No tienes acceso a esta sección.</p>
  }

  const dias = diasHabiles(deISO(lunesISO))
  const platillosDe = (iso: string) => (menu ?? []).filter((m) => m.fecha === iso)
  const vacia = (menu ?? []).length === 0

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-4">
      <header className="flex flex-col gap-3">
        <NavegadorSemana
          lunesISO={lunesISO}
          onAnterior={() => setLunesISO((p) => moverLunes(p, -1))}
          onSiguiente={() => setLunesISO((p) => moverLunes(p, 1))}
        />
      </header>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      ) : isError ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <TriangleAlert className="size-6" />
            </EmptyMedia>
            <EmptyTitle>No se pudo cargar el menú</EmptyTitle>
            <EmptyDescription>Ocurrió un error al consultar la semana.</EmptyDescription>
          </EmptyHeader>
          <Button variant="outline" onClick={() => refetch()}>
            Reintentar
          </Button>
        </Empty>
      ) : vacia ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <CalendarDays className="size-6" />
            </EmptyMedia>
            <EmptyTitle>Sin menú esta semana</EmptyTitle>
            <EmptyDescription>Todavía no se ha publicado el menú de estos días.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="flex flex-col gap-5">
          {dias.map((d) => {
            const platillos = platillosDe(aISO(d))
            return (
              <section key={aISO(d)} className="flex flex-col gap-2">
                <h2 className="text-sm font-semibold capitalize text-muted-foreground">
                  {etiquetaDia(d)}
                </h2>
                {platillos.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Sin platillos</p>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {platillos.map((m, i) => (
                      <TarjetaPlatillo key={`${m.fecha}-${i}`} platillo={m.platillo} />
                    ))}
                  </div>
                )}
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}
