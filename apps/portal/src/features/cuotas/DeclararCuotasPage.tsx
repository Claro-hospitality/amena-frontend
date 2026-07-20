import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { CalendarCheck, TriangleAlert, Users } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@amena/ui/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@amena/ui/components/ui/empty'
import { Skeleton } from '@amena/ui/components/ui/skeleton'
import { aISO, deISO, diasHabiles, esFechaPasada, lunesDeSemana } from '@amena/utils'
import type { ContextoAcceso } from '../../auth/validarAccesoPortal'
import { useColaboradores, useMiEmpresaId } from '../colaboradores/queries'
import { FilaColaboradorDeclaracion } from './FilaColaboradorDeclaracion'
import { NavegadorSemana } from './NavegadorSemana'
import { ResumenDeclaracionDialog } from './ResumenDeclaracionDialog'
import { construirPayload, contarComidas, type SeleccionDeclaracion } from './logica'
import { mapearErrorDeclaracion } from './errores'
import { useCuotasSemana, useDeclararCuotas } from './queries'

function proximoLunesISO(): string {
  const lunes = lunesDeSemana(new Date())
  lunes.setDate(lunes.getDate() + 7)
  return aISO(lunes)
}
function moverLunes(lunesISO: string, deltaSemanas: number): string {
  const lunes = deISO(lunesISO)
  lunes.setDate(lunes.getDate() + deltaSemanas * 7)
  return aISO(lunes)
}

export function DeclararCuotasPage() {
  const { tipo } = useOutletContext<ContextoAcceso>()
  const [lunesISO, setLunesISO] = useState(proximoLunesISO)
  const [seleccion, setSeleccion] = useState<SeleccionDeclaracion>({})
  const [confirmando, setConfirmando] = useState(false)

  const { data: colaboradores, isLoading, isError, refetch } = useColaboradores()
  const { data: empresaId } = useMiEmpresaId()
  const { data: cuotas } = useCuotasSemana(lunesISO)
  const declarar = useDeclararCuotas(lunesISO)

  if (tipo !== 'admin_empresa') {
    return <p className="text-muted-foreground">No tienes acceso a esta sección.</p>
  }

  const dias = diasHabiles(deISO(lunesISO))
  const activos = (colaboradores ?? []).filter((c) => c.activo)

  const yaPorColaborador: Record<string, Set<string>> = {}
  for (const cuota of cuotas ?? []) {
    ;(yaPorColaborador[cuota.colaborador.id] ??= new Set()).add(cuota.fecha)
  }

  const payload = construirPayload(seleccion)
  const { comidas, colaboradores: numColaboradores } = contarComidas(payload)

  const cambiarSemana = (delta: number) => {
    setLunesISO((prev) => moverLunes(prev, delta))
    setSeleccion({})
  }

  const seleccionablesDe = (colabId: string) =>
    dias.filter((d) => !esFechaPasada(d) && !yaPorColaborador[colabId]?.has(aISO(d))).map(aISO)

  const setColaborador = (colabId: string, fechas: string[]) =>
    setSeleccion((prev) => ({ ...prev, [colabId]: new Set(fechas) }))

  const todosTodaLaSemana = () => {
    const next: SeleccionDeclaracion = {}
    for (const c of activos) next[c.id] = new Set(seleccionablesDe(c.id))
    setSeleccion(next)
  }

  const confirmar = () => {
    if (!empresaId) return
    declarar.mutate(
      { empresaId, declaracion: payload },
      {
        onSuccess: (r) => {
          toast.success(
            `Declaración guardada: ${r.creadas} nuevas, ${r.reactivadas} reactivadas, ${r.ya_existentes} ya existían.`
          )
          setSeleccion({})
        },
        onError: (e) => toast.error(mapearErrorDeclaracion(e)),
      }
    )
    setConfirmando(false)
  }

  return (
    <div className="flex flex-col gap-4 pb-20 md:pb-24">
      <header className="flex flex-col gap-3">
        <NavegadorSemana
          lunesISO={lunesISO}
          onAnterior={() => cambiarSemana(-1)}
          onSiguiente={() => cambiarSemana(1)}
        />
      </header>

      {isLoading ? (
        <ListaSkeleton />
      ) : isError ? (
        <EstadoError onReintentar={() => refetch()} />
      ) : activos.length === 0 ? (
        <SinColaboradores />
      ) : (
        <>
          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={todosTodaLaSemana}>
              Todos, toda la semana
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {activos.map((c) => (
              <FilaColaboradorDeclaracion
                key={c.id}
                colaborador={c}
                dias={dias}
                yaDeclaradas={yaPorColaborador[c.id] ?? new Set()}
                seleccion={seleccion[c.id] ?? new Set()}
                onCambio={(fechas) => setColaborador(c.id, fechas)}
              />
            ))}
          </div>
        </>
      )}

      {/* Barra de resumen + acción */}
      <div className="fixed inset-x-0 bottom-0 z-10 border-t border-border bg-background/95 px-4 py-3 backdrop-blur md:px-6">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {comidas > 0
              ? `${comidas} ${comidas === 1 ? 'comida' : 'comidas'} · ${numColaboradores} ${numColaboradores === 1 ? 'colaborador' : 'colaboradores'}`
              : 'Sin nada nuevo por declarar'}
          </p>
          <Button onClick={() => setConfirmando(true)} disabled={comidas === 0 || !empresaId}>
            Declarar
          </Button>
        </div>
      </div>

      {confirmando && (
        <ResumenDeclaracionDialog
          comidas={comidas}
          colaboradores={numColaboradores}
          enviando={declarar.isPending}
          onConfirmar={confirmar}
          onClose={() => setConfirmando(false)}
        />
      )}
    </div>
  )
}

function ListaSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-32 w-full" />
      ))}
    </div>
  )
}

function EstadoError({ onReintentar }: { onReintentar: () => void }) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <TriangleAlert className="size-6" />
        </EmptyMedia>
        <EmptyTitle>No se pudo cargar</EmptyTitle>
        <EmptyDescription>Ocurrió un error al consultar los datos.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button variant="outline" onClick={onReintentar}>
          Reintentar
        </Button>
      </EmptyContent>
    </Empty>
  )
}

function SinColaboradores() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Users className="size-6" />
        </EmptyMedia>
        <EmptyTitle>Aún no hay colaboradores activos</EmptyTitle>
        <EmptyDescription>
          Agrega colaboradores para poder declarar sus comidas de la semana.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button variant="outline" nativeButton={false} render={<a href="/colaboradores" />}>
          <CalendarCheck className="size-4" />
          Ir a colaboradores
        </Button>
      </EmptyContent>
    </Empty>
  )
}
