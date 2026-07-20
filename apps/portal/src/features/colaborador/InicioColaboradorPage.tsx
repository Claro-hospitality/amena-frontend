import { useState } from 'react'
import { Maximize2, TriangleAlert } from 'lucide-react'
import { Button } from '@amena/ui/components/ui/button'
import { Skeleton } from '@amena/ui/components/ui/skeleton'
import { aISO } from '@amena/utils'
import { CredencialImprimible } from '../colaboradores/CredencialImprimible'
import { EstadoHoy } from './EstadoHoy'
import { QrPantallaCompleta } from './QrPantallaCompleta'
import { TarjetaPlatillo } from './TarjetaPlatillo'
import { useEstadoHoy, useMenuDia, useMiColaborador } from './queries'

export function InicioColaboradorPage() {
  const { data: colaborador, isLoading, isError, refetch } = useMiColaborador()
  const { data: estado } = useEstadoHoy()
  const { data: menuHoy } = useMenuDia(aISO(new Date()))
  const [qrGrande, setQrGrande] = useState(false)

  if (isLoading) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-col gap-4">
        <Skeleton className="h-72 w-full" />
        <Skeleton className="h-14 w-full" />
      </div>
    )
  }
  if (isError || !colaborador) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-col items-center gap-3 text-center">
        <TriangleAlert className="size-8 text-muted-foreground" />
        <p className="text-muted-foreground">No se pudo cargar tu información.</p>
        <Button variant="outline" onClick={() => refetch()}>
          Reintentar
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-5">
      <section className="flex flex-col items-center gap-3">
        <CredencialImprimible colaborador={colaborador} />
        <Button size="lg" className="h-12 w-full" onClick={() => setQrGrande(true)}>
          <Maximize2 className="size-5" />
          Mostrar en grande
        </Button>
      </section>

      {estado && <EstadoHoy estado={estado} />}

      <section className="flex flex-col gap-3">
        <h2 className="text-base font-semibold">Menú de hoy</h2>
        {!menuHoy ? (
          <Skeleton className="h-40 w-full" />
        ) : menuHoy.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aún no hay menú publicado para hoy.</p>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {menuHoy.map((m, i) => (
              <TarjetaPlatillo key={`${m.fecha}-${i}`} platillo={m.platillo} />
            ))}
          </div>
        )}
      </section>

      {qrGrande && (
        <QrPantallaCompleta
          id={colaborador.id}
          nombre={colaborador.nombre}
          onCerrar={() => setQrGrande(false)}
        />
      )}
    </div>
  )
}
