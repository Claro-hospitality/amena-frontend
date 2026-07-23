import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@amena/ui/components/ui/button'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@amena/ui/components/ui/combobox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@amena/ui/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@amena/ui/components/ui/select'
import { aISO, deISO, diasHabiles, esFechaPasada, etiquetaDia } from '@amena/utils'
import type { Colaborador } from '../colaboradores/api'
import { useColaboradores, useMiEmpresaId } from '../colaboradores/queries'
import { mapearErrorDeclaracion } from './errores'
import { useDeclararCuotas } from './queries'

export function AgregarExtraDialog({
  lunesISO,
  onClose,
}: {
  lunesISO: string
  onClose: () => void
}) {
  const { data: colaboradores } = useColaboradores()
  const { data: empresaId } = useMiEmpresaId()
  const declarar = useDeclararCuotas(lunesISO)

  const activos = (colaboradores ?? []).filter((c) => c.activo)
  const dias = diasHabiles(deISO(lunesISO)).filter((d) => !esFechaPasada(d))

  const [colaborador, setColaborador] = useState<Colaborador | null>(null)
  const [fecha, setFecha] = useState(dias[0] ? aISO(dias[0]) : '')

  const guardar = () => {
    if (!empresaId || !colaborador || !fecha) return
    declarar.mutate(
      {
        empresaId,
        declaracion: [{ comensal_id: colaborador.id, fechas: [fecha] }],
        origen: 'extra',
      },
      {
        onSuccess: (r) => {
          toast.success(
            r.creadas > 0 || r.reactivadas > 0
              ? 'Comida extra agregada.'
              : 'Ese colaborador ya tenía comida ese día.'
          )
          onClose()
        },
        onError: (e) => toast.error(mapearErrorDeclaracion(e)),
      }
    )
  }

  return (
    <Dialog
      open
      onOpenChange={(abierto) => {
        if (!abierto) onClose()
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agregar comida extra</DialogTitle>
          <DialogDescription>Una comida puntual para un colaborador esta semana.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Colaborador</label>
            <Combobox
              items={activos}
              itemToStringLabel={(c: Colaborador) => c.nombre}
              value={colaborador}
              onValueChange={(c: Colaborador | null) => setColaborador(c)}
            >
              <ComboboxInput placeholder="Buscar colaborador…" />
              <ComboboxContent>
                <ComboboxEmpty>Sin colaboradores</ComboboxEmpty>
                <ComboboxList>
                  {(c: Colaborador) => (
                    <ComboboxItem key={c.id} value={c}>
                      {c.nombre}
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Día</label>
            <Select value={fecha} onValueChange={(v) => setFecha(v ?? '')}>
              <SelectTrigger className="w-full capitalize">
                <SelectValue>{(v) => (v ? etiquetaDia(deISO(v)) : 'Elige un día')}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {dias.map((d) => (
                  <SelectItem key={aISO(d)} value={aISO(d)} className="capitalize">
                    {etiquetaDia(d)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={guardar} disabled={!colaborador || !fecha} loading={declarar.isPending}>
            Agregar extra
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
