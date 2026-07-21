import { useRef, useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import { List } from 'lucide-react'
import { Button } from '@amena/ui/components/ui/button'
import { horaCorta } from '@amena/utils'
import type { ContextoAcceso } from '../../auth/validarAccesoPortal'
import { useAuth } from '../../auth/useAuth'
import { CamaraQR } from './CamaraQR'
import { ContadorHoy } from './ContadorHoy'
import { ResultadoOverlay, type Resultado } from './ResultadoOverlay'
import { debeIgnorarLectura, esUuidValido, mapearMotivoRechazo } from './logica'
import { useRegistrarConsumo } from './queries'
import { useConsumosRealtime } from './realtime'

export function EscanerPage() {
  const { rol } = useOutletContext<ContextoAcceso>()
  const { session } = useAuth()
  const registrar = useRegistrarConsumo()
  const [resultado, setResultado] = useState<Resultado | null>(null)
  const ultimaLectura = useRef<{ id: string; ts: number } | null>(null)
  const procesando = useRef(false)

  useConsumosRealtime()

  if (rol !== 'mesero' && rol !== 'super_admin') {
    return <p className="text-muted-foreground">No tienes acceso a esta sección.</p>
  }

  const registradoPor = session?.user?.id ?? ''

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
        onSuccess: (resultado) => {
          setResultado({
            tipo: 'exito',
            nombre: resultado.comensalNombre || 'Comensal',
            empresa: resultado.empresaNombre,
            hora: horaCorta(new Date(resultado.consumo.created_at)),
          })
          procesando.current = false
        },
        onError: (error) => {
          const motivo = mapearMotivoRechazo(error)
          setResultado({ tipo: 'rechazo', motivo, nombre: null })
          procesando.current = false
        },
      }
    )
  }

  const cerrar = () => {
    setResultado(null)
    ultimaLectura.current = null
  }

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
      <header className="flex items-center justify-between gap-3">
        <ContadorHoy />
        <Button variant="outline" size="sm" nativeButton={false} render={<Link to="/escaner/hoy" />}>
          <List className="size-4" />
          Lista del día
        </Button>
      </header>

      <div className="relative min-h-0 flex-1">
        <CamaraQR activo={!resultado} onDetectar={onDetectar} />
        {resultado && <ResultadoOverlay resultado={resultado} onCerrar={cerrar} />}
      </div>
    </div>
  )
}
