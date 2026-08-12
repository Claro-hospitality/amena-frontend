import { useRef, useState } from 'react'
import { CalendarDays, Download } from 'lucide-react'
import { QRCodeCanvas } from 'qrcode.react'
import { toast } from 'sonner'
import { cn } from '@amena/ui/lib/utils'
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
import { Calendar } from '@amena/ui/components/ui/calendar'
import { Input } from '@amena/ui/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@amena/ui/components/ui/popover'
import { aISO, deISO, diasHabiles, esFechaPasada, etiquetaDia } from '@amena/utils'
import type { Colaborador } from '../colaboradores/api'
import { useColaboradores, useMiEmpresaId } from '../colaboradores/queries'
import type { InvitadoCreado } from './api'
import { mapearErrorReserva } from './errores'
import { descargarPasePDF } from './pasePdf'
import { useCrearInvitado, useReservarCuotas } from './queries'

type Tipo = 'colaborador' | 'invitado'

// Encabezados del calendario en es-MX (mismo patrón que SelectorPeriodo del backoffice).
const FORMATTERS = {
  formatCaption: (d: Date) => d.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' }),
  formatWeekdayName: (d: Date) => d.toLocaleDateString('es-MX', { weekday: 'narrow' }),
}

export function AgregarExtraDialog({
  lunesISO,
  onClose,
}: {
  lunesISO: string
  onClose: () => void
}) {
  const { data: colaboradores } = useColaboradores()
  const { data: empresaId } = useMiEmpresaId()
  const reservar = useReservarCuotas(lunesISO)
  const crearInvitadoMut = useCrearInvitado(lunesISO)

  const activos = (colaboradores ?? []).filter((c) => c.activo)
  const empresaNombre = activos[0]?.empresa?.nombre ?? ''
  const dias = diasHabiles(deISO(lunesISO)).filter((d) => !esFechaPasada(d))
  // Solo estos días hábiles (no pasados) de la semana son elegibles en el calendario.
  const fechasPermitidas = new Set(dias.map(aISO))

  const [tipo, setTipo] = useState<Tipo>('colaborador')
  const [fecha, setFecha] = useState(dias[0] ? aISO(dias[0]) : '')
  const [calendarioAbierto, setCalendarioAbierto] = useState(false)

  // Colaborador
  const [colaborador, setColaborador] = useState<Colaborador | null>(null)

  // Invitado
  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [telefono, setTelefono] = useState('')
  const [correo, setCorreo] = useState('')
  const [invitadoCreado, setInvitadoCreado] = useState<InvitadoCreado | null>(null)
  const canvasRef = useRef<HTMLDivElement>(null)

  const guardarColaborador = () => {
    if (!empresaId || !colaborador || !fecha) return
    reservar.mutate(
      { empresaId, reserva: [{ comensal_id: colaborador.id, fechas: [fecha] }], origen: 'extra' },
      {
        onSuccess: (r) => {
          toast.success(
            r.creadas > 0 || r.reactivadas > 0
              ? 'Comida extra agregada.'
              : 'Ese colaborador ya tenía comida ese día.'
          )
          onClose()
        },
        onError: (e) => toast.error(mapearErrorReserva(e)),
      }
    )
  }

  const guardarInvitado = () => {
    if (!empresaId || !nombre.trim() || !apellido.trim() || !fecha) return
    crearInvitadoMut.mutate(
      { empresaId, nombre: nombre.trim(), apellido: apellido.trim(), telefono: telefono.trim(), correo: correo.trim(), fecha },
      {
        onSuccess: (invitado) => {
          setInvitadoCreado(invitado)
          toast.success('Invitado agregado. Descarga su QR.')
        },
        onError: (e) => toast.error(mapearErrorReserva(e)),
      }
    )
  }

  /** Genera el PDF del pase recién creado (logo + QR + nombre + día). */
  function descargarPDF() {
    if (!invitadoCreado) return
    const canvas = canvasRef.current?.querySelector('canvas')
    if (!canvas) return
    descargarPasePDF({
      nombre: invitadoCreado.nombre,
      apellido: invitadoCreado.apellido,
      fecha: invitadoCreado.fecha,
      empresaNombre,
      imagenQR: canvas.toDataURL('image/png'),
    })
  }

  const diaSelect = (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium">Día</label>
      <Popover open={calendarioAbierto} onOpenChange={setCalendarioAbierto}>
        <PopoverTrigger
          render={<Button variant="outline" className="w-full justify-start gap-2 font-normal capitalize" />}
        >
          <CalendarDays className="size-4 shrink-0 text-muted-foreground" />
          {fecha ? etiquetaDia(deISO(fecha)) : <span className="text-muted-foreground">Elige un día</span>}
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={fecha ? deISO(fecha) : undefined}
            onSelect={(d) => {
              if (!d) return
              setFecha(aISO(d))
              setCalendarioAbierto(false)
            }}
            defaultMonth={fecha ? deISO(fecha) : dias[0]}
            disabled={(d) => !fechasPermitidas.has(aISO(d))}
            showOutsideDays={false}
            formatters={FORMATTERS}
          />
        </PopoverContent>
      </Popover>
    </div>
  )

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
          <DialogDescription>
            Una comida puntual esta semana, para un colaborador o un invitado.
          </DialogDescription>
        </DialogHeader>

        {/* Pase creado: mostrar el QR y ofrecer el PDF. */}
        {invitadoCreado ? (
          <div className="flex flex-col items-center gap-4 py-2">
            <div className="rounded-2xl border border-border bg-card p-4">
              <QRCodeCanvas value={invitadoCreado.qr_token} size={220} />
            </div>
            <div className="text-center">
              <p className="font-medium">
                {invitadoCreado.nombre}
                {invitadoCreado.apellido ? ` ${invitadoCreado.apellido}` : ''}
              </p>
              <p className="text-sm capitalize text-muted-foreground">
                {etiquetaDia(deISO(invitadoCreado.fecha))}
              </p>
            </div>
            {/* Canvas oculto en alta resolución para el PDF. */}
            <div ref={canvasRef} className="hidden" aria-hidden>
              <QRCodeCanvas value={invitadoCreado.qr_token} size={512} />
            </div>
            <DialogFooter className="w-full">
              <Button variant="outline" onClick={onClose}>
                Listo
              </Button>
              <Button onClick={descargarPDF}>
                <Download className="size-4" />
                Descargar PDF
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {/* Selector de tipo */}
            <div className="flex gap-1 rounded-lg bg-secondary p-1">
              {(['colaborador', 'invitado'] as Tipo[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTipo(t)}
                  className={cn(
                    'flex-1 rounded-md px-3 py-1.5 text-sm font-medium capitalize transition-colors',
                    tipo === t
                      ? 'bg-salvia-500 text-primary-foreground'
                      : 'text-secondary-foreground/80 hover:text-secondary-foreground'
                  )}
                >
                  {t}
                </button>
              ))}
            </div>

            {tipo === 'colaborador' ? (
              <>
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
                {diaSelect}
              </>
            ) : (
              <>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium">Nombre</label>
                  <Input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre del invitado" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium">Apellido</label>
                  <Input value={apellido} onChange={(e) => setApellido(e.target.value)} placeholder="Apellido del invitado" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium">Teléfono</label>
                  <Input
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    placeholder="Teléfono (opcional)"
                    inputMode="tel"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium">Correo</label>
                  <Input
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    placeholder="Correo (opcional)"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                  />
                </div>
                {diaSelect}
              </>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              {tipo === 'colaborador' ? (
                <Button onClick={guardarColaborador} disabled={!colaborador || !fecha} loading={reservar.isPending}>
                  Agregar extra
                </Button>
              ) : (
                <Button onClick={guardarInvitado} disabled={!nombre.trim() || !apellido.trim() || !fecha} loading={crearInvitadoMut.isPending}>
                  Generar pase
                </Button>
              )}
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
