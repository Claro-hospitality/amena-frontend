import { useRef, useState } from 'react'
import { Button } from '@amena/ui/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@amena/ui/components/ui/dialog'
import { useWakeLock } from '@amena/ui/hooks/use-wake-lock'
import { horaCorta } from '@amena/utils'
import { CamaraQR } from './CamaraQR'
import { ResultadoOverlay, type Resultado } from './ResultadoOverlay'
import { debeIgnorarLectura, esUuidValido, mapearMotivoRechazo } from './logica'
import { useRegistrarConsumo } from './queries'

/**
 * Dialog con el escáner. La cámara (`CamaraQR`) solo se monta mientras el dialog está
 * abierto: al entrar a la sección no se enciende (no sobrecarga la tablet); arranca cuando
 * el mesero pulsa "Escanear" y se libera al cerrar. Permite escanear varias veces seguidas.
 */
export function EscanerDialog({
  open,
  onOpenChange,
  registradoPor,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  registradoPor: string
}) {
  const registrar = useRegistrarConsumo()
  // Pantalla encendida mientras la cámara está abierta (hora pico, tablet apoyada).
  useWakeLock(open)
  const [resultado, setResultado] = useState<Resultado | null>(null)
  const ultimaLectura = useRef<{ id: string; ts: number } | null>(null)
  const procesando = useRef(false)

  const reset = () => {
    setResultado(null)
    ultimaLectura.current = null
    procesando.current = false
  }

  const onDetectar = (texto: string) => {
    const id = texto.trim()
    const ahora = Date.now()
    if (procesando.current || resultado) return
    if (debeIgnorarLectura(id, ultimaLectura.current, ahora)) return
    ultimaLectura.current = { id, ts: ahora }

    if (!esUuidValido(id)) {
      setResultado({ tipo: 'rechazo', motivo: 'QR no válido', nombre: null })
      return
    }

    procesando.current = true
    registrar.mutate(
      { qrToken: id, registradoPor },
      {
        onSuccess: (r) => {
          setResultado({
            tipo: 'exito',
            nombre: r.comensalNombre || 'Comensal',
            empresa: r.empresaNombre,
            hora: horaCorta(new Date(r.consumo.created_at)),
            consumosHoy: r.consumosHoy,
            modo: r.modo,
          })
          procesando.current = false
        },
        onError: (error) => {
          setResultado({ tipo: 'rechazo', motivo: mapearMotivoRechazo(error), nombre: null })
          procesando.current = false
        },
      }
    )
  }

  const cerrarResultado = () => {
    setResultado(null)
    ultimaLectura.current = null
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(abierto) => {
        if (!abierto) reset()
        onOpenChange(abierto)
      }}
    >
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Escanear QR</DialogTitle>
        </DialogHeader>
        <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-black">
          {open && <CamaraQR activo={!resultado} onDetectar={onDetectar} />}
          {resultado && <ResultadoOverlay resultado={resultado} onCerrar={cerrarResultado} />}
        </div>
        <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full">
          Cerrar cámara
        </Button>
      </DialogContent>
    </Dialog>
  )
}
