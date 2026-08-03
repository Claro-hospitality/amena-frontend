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
import { useCrearInvitado, useReservarCuotas } from './queries'

type Tipo = 'colaborador' | 'invitado'

// Encabezados del calendario en es-MX (mismo patrón que SelectorPeriodo del backoffice).
const FORMATTERS = {
  formatCaption: (d: Date) => d.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' }),
  formatWeekdayName: (d: Date) => d.toLocaleDateString('es-MX', { weekday: 'narrow' }),
}

/** Escapa texto para insertarlo con seguridad en el HTML del documento de impresión. */
function escaparHtml(texto: string): string {
  return texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

// Wordmark de Amena (mismo SVG que LogotipoAmena) para el documento aislado del PDF.
const LOGO_AMENA_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 250 66.86" fill="currentColor" role="img" aria-label="Amena" style="height:46px;width:auto"><path d="M187.7,9.21h-7.95c-.23,0-.42.19-.42.42v28.11c0,.55-.35,1.01-.88,1.16-.53.15-1.07-.07-1.35-.54l-18.14-28.94c-.08-.13-.21-.21-.36-.21h-8.3c-.23,0-.42.19-.42.42v47.03c0,.23.19.42.42.42h7.95c.23,0,.42-.19.42-.42v-27.82c0-.55.35-1.01.88-1.16.11-.03.22-.04.33-.04.41,0,.8.21,1.02.58l18.14,29.22c.08.13.21.21.36.21h8.3c.23,0,.42-.19.42-.42V9.64c0-.23-.19-.42-.42-.42Z"/><path d="M82.6,36.52l-10.69-27.04c-.06-.16-.22-.27-.39-.27h-7.11c-1.53,0-1.53,1.45-1.53,1.69v45.77c0,.23.19.42.42.42h7.95c.23,0,.42-.19.42-.42v-19.34c0-.52.32-1,.81-1.15.65-.2,1.27.09,1.5.7l5.3,10.55c.71,1.8,1.91,2.46,3.11,2.62h2.62c1.21-.2,2.47-1.07,3.18-2.87l5.47-10.9c.19-.48.61-.76,1.1-.76.1,0,.19.01.29.03.55.12.92.64.92,1.2v19.93c0,.23.19.42.42.42h7.95c.23,0,.42-.19.42-.42V10.15c0-.52-.42-.94-.94-.94h-8.22l-10.79,27.31c-.18.46-.62.76-1.12.76s-.93-.3-1.12-.76Z"/><path d="M143.07,9.21h-31.9v7.38l.05.39v12.48h-.05v7.38l.05.39v12.48h-.05v7.38h31.9c.23,0,.42-.19.42-.42v-6.54c0-.23-.19-.42-.42-.42h-21.86c-.66,0-1.2-.54-1.2-1.2v-10.47c0-.66.54-1.2,1.2-1.2h19.95c.23,0,.42-.19.42-.42v-6.54c0-.23-.19-.42-.42-.42h-19.95c-.66,0-1.2-.54-1.2-1.2v-10.47c0-.66.54-1.2,1.2-1.2h21.86c.23,0,.42-.19.42-.42v-6.54c0-.23-.19-.42-.42-.42Z"/><path d="M44.14,11.53c-.05-.18-.43-1.87-1.59-1.87h-11.61c-2.04,0-1.98,1.69-2.04,1.87l-13.61,45.46c-.04.13-.01.27.07.37.08.11.2.17.34.17h7.88c.19,0,.35-.12.4-.3l2.05-6.83c.15-.51.62-.86,1.15-.86h18.7c.53,0,1,.35,1.15.86l2.05,6.83c.05.18.22.3.4.3h7.88c.13,0,.26-.06.34-.17s.1-.24.07-.37l-13.61-45.46ZM43.9,41.12c-.23.31-.58.48-.96.48h-12.84c-.38,0-.73-.18-.96-.48-.23-.31-.3-.69-.19-1.06l6.42-22.52c.16-.52.61-.86,1.15-.86s.99.34,1.15.86l6.42,22.52c.11.37.04.75-.19,1.06Z"/><path d="M221.1,11.53c-.05-.18-.43-1.87-1.59-1.87h-11.61c-2.04,0-1.98,1.69-2.04,1.87l-13.61,45.46c-.04.13-.01.27.07.37.08.11.2.17.34.17h7.88c.19,0,.35-.12.4-.3l2.05-6.83c.15-.51.62-.86,1.15-.86h18.7c.53,0,1,.35,1.15.86l2.05,6.83c.05.18.22.3.4.3h7.88c.13,0,.26-.06.34-.17s.1-.24.07-.37l-13.61-45.46ZM220.86,41.12c-.23.31-.58.48-.96.48h-12.84c-.38,0-.73-.18-.96-.48-.23-.31-.3-.69-.19-1.06l6.42-22.52c.16-.52.61-.86,1.15-.86s.99.34,1.15.86l6.42,22.52c.11.37.04.75-.19,1.06Z"/></svg>`

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

  /** Abre una ventana aislada con el pase (logo + QR + nombre + día) y lanza "Guardar como PDF". */
  function descargarPDF() {
    if (!invitadoCreado) return
    const canvas = canvasRef.current?.querySelector('canvas')
    if (!canvas) return
    const imagenQR = canvas.toDataURL('image/png')
    const ventana = window.open('', '_blank')
    if (!ventana) return

    const nombrePase = escaparHtml(`${invitadoCreado.nombre}${invitadoCreado.apellido ? ` ${invitadoCreado.apellido}` : ''}`)
    const empresa = empresaNombre ? escaparHtml(empresaNombre) : ''
    const dia = escaparHtml(etiquetaDia(deISO(invitadoCreado.fecha)))

    ventana.document.write(`<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <title>Pase de invitado - ${nombrePase}</title>
    <style>
      @page { size: A4 portrait; margin: 0; }
      * { box-sizing: border-box; }
      html, body { height: 100%; margin: 0; }
      body { background: #fcfaf5; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .hoja { display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 20mm; font-family: system-ui, -apple-system, "Segoe UI", sans-serif; }
      .tarjeta { display: flex; flex-direction: column; align-items: center; gap: 24px; width: 100%; max-width: 560px; padding: 44px 40px; background: #fff; border: 1px solid #e9e1cd; border-radius: 28px; text-align: center; }
      .logo { color: #f68d2e; line-height: 0; }
      .titulo { font-size: 14px; letter-spacing: .12em; text-transform: uppercase; color: #92a271; font-weight: 700; margin: 0; }
      .qr { width: min(62vw, 58vh); max-width: 440px; height: auto; padding: 16px; background: #fff; border: 1px solid #f0ead9; border-radius: 20px; }
      .nombre { font-size: 30px; font-weight: 700; color: #2b2925; margin: 0; }
      .empresa { font-size: 18px; color: #6b675e; margin: 6px 0 0; }
      .dia { font-size: 18px; font-weight: 600; color: #2b2925; margin: 6px 0 0; text-transform: capitalize; }
      .pie { font-size: 13px; color: #a99873; margin: 0; max-width: 380px; }
    </style>
  </head>
  <body onload="window.focus(); window.print();">
    <div class="hoja">
      <div class="tarjeta">
        <span class="logo">${LOGO_AMENA_SVG}</span>
        <p class="titulo">Pase de invitado</p>
        <img class="qr" src="${imagenQR}" alt="Código QR de ${nombrePase}" />
        <div>
          <p class="nombre">${nombrePase}</p>
          ${empresa ? `<p class="empresa">${empresa}</p>` : ''}
          <p class="dia">${dia}</p>
        </div>
        <p class="pie">Válido solo el día indicado y por una sola vez. Preséntalo en el restaurante.</p>
      </div>
    </div>
  </body>
</html>`)
    ventana.document.close()
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
