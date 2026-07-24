import { useState } from 'react'
import { Search, UtensilsCrossed } from 'lucide-react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@amena/ui/components/ui/alert-dialog'
import { Button } from '@amena/ui/components/ui/button'
import { Input } from '@amena/ui/components/ui/input'
import { Skeleton } from '@amena/ui/components/ui/skeleton'
import type { BusquedaComensal } from './api'
import { estadoComensalTexto, mapearMotivoRechazo, puedeRegistrar } from './logica'
import { useBuscarComensales, useRegistrarManual } from './queries'

/**
 * Plan B del QR olvidado: buscar al comensal por nombre, ver su estado de hoy y registrarlo
 * manualmente con confirmación. El consumo queda marcado como "Manual" en la lista y el historial.
 */
export function RegistroManual({ registradoPor }: { registradoPor: string }) {
  const [q, setQ] = useState('')
  const [elegido, setElegido] = useState<BusquedaComensal | null>(null)
  const { data, isFetching } = useBuscarComensales(q)
  const registrar = useRegistrarManual()

  const term = q.trim()
  const resultados = data ?? []

  const confirmar = () => {
    if (!elegido) return
    registrar.mutate(
      { comensalId: elegido.comensal_id, registradoPor },
      {
        onSuccess: (r) => toast.success(`Comida registrada para ${r.comensalNombre}`),
        onError: (e) => toast.error(mapearMotivoRechazo(e)),
      }
    )
    setElegido(null)
    setQ('')
  }

  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-sm font-semibold tracking-tight">Registrar comida sin QR</h2>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Busca al comensal por nombre para registrar su comida…"
          aria-label="Buscar comensal para registrar su comida sin QR"
          className="pl-9"
        />
      </div>

      {term.length >= 2 && (
        <div className="rounded-lg border border-border">
          {isFetching ? (
            <div className="flex flex-col gap-2 p-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : resultados.length === 0 ? (
            <p className="p-4 text-center text-sm text-muted-foreground">
              Nadie coincide con “{term}”.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {resultados.map((c) => (
                <li key={c.comensal_id} className="flex items-center gap-3 p-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{c.nombre}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {c.empresa_nombre} · {estadoComensalTexto(c)}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant={puedeRegistrar(c) ? 'default' : 'outline'}
                    onClick={() => setElegido(c)}
                  >
                    <UtensilsCrossed className="size-4" />
                    Registrar comida
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <AlertDialog
        open={!!elegido}
        onOpenChange={(abierto) => {
          if (!abierto) setElegido(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Registrar la comida de {elegido?.nombre}?</AlertDialogTitle>
            <AlertDialogDescription>
              {elegido && `${estadoComensalTexto(elegido)}. `}
              Se registrará manualmente (sin QR) a tu nombre y quedará marcado como “Manual”.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmar}>Registrar manualmente</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  )
}
