import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Download, Receipt, RotateCcw, TriangleAlert } from 'lucide-react'
import { Badge } from '@amena/ui/components/ui/badge'
import { Button } from '@amena/ui/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@amena/ui/components/ui/dialog'
import { Skeleton } from '@amena/ui/components/ui/skeleton'
import { deISO, formatearMoneda, rangoSemanaLegible } from '@amena/utils'
import { toast } from 'sonner'
import type { CorteConEmpresa } from '../cortes/api'
import { datosFiscalesCompletos, type DatosFiscales } from '../empresas/api'
import { useDatosFiscalesEmpresa } from '../empresas/queries'
import { AMBIENTE_FACTURAMA, descargarArchivoFactura, type Factura } from './api'
import { BadgeEstadoFactura } from './BadgeEstadoFactura'
import { useFacturaDeCorte, useFacturarCorte } from './queries'

const IVA_RATE = 0.16

/** Badge del ambiente de timbrado activo (read-only). Prod se destaca en warning. */
function BadgeAmbiente() {
  return AMBIENTE_FACTURAMA === 'prod' ? (
    <Badge className="bg-warning text-warning-foreground">PRODUCCIÓN</Badge>
  ) : (
    <Badge variant="secondary">Sandbox</Badge>
  )
}

/** Sección de facturación dentro del detalle de un corte: estado de la factura o acción de emitir. */
export function SeccionFacturaCorte({ corte }: { corte: CorteConEmpresa }) {
  const { data: factura, isLoading } = useFacturaDeCorte(corte.id)
  const { data: df } = useDatosFiscalesEmpresa(corte.empresa_id)
  const [confirmar, setConfirmar] = useState(false)
  const facturar = useFacturarCorte(corte.id)

  const subtotal = corte.consumidas * corte.precio_unitario
  const iva = subtotal * IVA_RATE
  const total = subtotal + iva

  function emitir() {
    facturar.mutate(undefined, {
      onSuccess: () => {
        toast.success('Factura emitida')
        setConfirmar(false)
      },
      onError: (e) => {
        toast.error(e instanceof Error ? e.message : 'No se pudo facturar')
        setConfirmar(false)
      },
    })
  }

  const yaEmitida = factura?.estado === 'emitida' || factura?.estado === 'pagada'
  const completos = datosFiscalesCompletos(df)
  const motivo = yaEmitida
    ? null
    : corte.estado !== 'cerrado'
      ? 'El corte no está cerrado.'
      : corte.consumidas <= 0
        ? 'El corte no tiene consumos.'
        : !completos
          ? 'La empresa no tiene datos fiscales completos.'
          : null

  return (
    <section className="mt-2 flex flex-col gap-3 border-t border-border pt-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold">Factura</h3>
        {isLoading ? <Skeleton className="h-5 w-20" /> : factura ? <BadgeEstadoFactura estado={factura.estado} /> : null}
      </div>

      {isLoading ? (
        <Skeleton className="h-9 w-40" />
      ) : yaEmitida && factura ? (
        <FacturaEmitida factura={factura} />
      ) : factura?.estado === 'error' ? (
        <FacturaError
          factura={factura}
          onReintentar={() => setConfirmar(true)}
          reintentando={facturar.isPending}
        />
      ) : (
        <div className="flex flex-col items-start gap-2">
          <Button onClick={() => setConfirmar(true)} disabled={!!motivo} loading={facturar.isPending}>
            <Receipt className="size-4" />
            Facturar
          </Button>
          {motivo && (
            <p className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
              {motivo}
              {!completos && corte.estado === 'cerrado' && corte.consumidas > 0 && (
                <Link to={`/empresas/${corte.empresa_id}`} className="font-medium text-primary underline">
                  Configurar datos fiscales
                </Link>
              )}
            </p>
          )}
        </div>
      )}

      <DialogConfirmar
        abierto={confirmar}
        onCerrar={() => !facturar.isPending && setConfirmar(false)}
        corte={corte}
        df={df ?? null}
        subtotal={subtotal}
        iva={iva}
        total={total}
        esReintento={factura?.estado === 'error'}
        cargando={facturar.isPending}
        onConfirmar={emitir}
      />
    </section>
  )
}

function FacturaEmitida({ factura }: { factura: Factura }) {
  return (
    <div className="flex flex-col gap-2 text-sm">
      <div className="flex items-center justify-between gap-4">
        <span className="text-muted-foreground">Folio</span>
        <span className="font-mono">
          {factura.serie}
          {factura.serie ? '-' : ''}
          {factura.folio}
        </span>
      </div>
      <div className="flex items-center justify-between gap-4">
        <span className="text-muted-foreground">UUID</span>
        <span className="truncate font-mono text-xs" title={factura.uuid_sat ?? ''}>
          {factura.uuid_sat}
        </span>
      </div>
      <div className="mt-1 flex gap-2">
        {factura.pdf_url && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => descargarArchivoFactura(factura.pdf_url!, `factura-${factura.folio}.pdf`)}
          >
            <Download className="size-4" />
            PDF
          </Button>
        )}
        {factura.xml_url && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => descargarArchivoFactura(factura.xml_url!, `factura-${factura.folio}.xml`)}
          >
            <Download className="size-4" />
            XML
          </Button>
        )}
      </div>
    </div>
  )
}

function FacturaError({
  factura,
  onReintentar,
  reintentando,
}: {
  factura: Factura
  onReintentar: () => void
  reintentando: boolean
}) {
  return (
    <div className="flex flex-col items-start gap-2">
      <p className="flex items-start gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
        <TriangleAlert className="mt-0.5 size-4 shrink-0" />
        {factura.mensaje_error ?? 'El timbrado falló.'}
      </p>
      <Button variant="outline" onClick={onReintentar} loading={reintentando}>
        <RotateCcw className="size-4" />
        Reintentar
      </Button>
    </div>
  )
}

function DialogConfirmar({
  abierto,
  onCerrar,
  corte,
  df,
  subtotal,
  iva,
  total,
  esReintento,
  cargando,
  onConfirmar,
}: {
  abierto: boolean
  onCerrar: () => void
  corte: CorteConEmpresa
  df: DatosFiscales | null
  subtotal: number
  iva: number
  total: number
  esReintento: boolean
  cargando: boolean
  onConfirmar: () => void
}) {
  return (
    <Dialog open={abierto} onOpenChange={(o) => !o && onCerrar()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{esReintento ? 'Reintentar facturación' : 'Facturar corte'}</DialogTitle>
          <DialogDescription>
            Se timbrará el CFDI ante el SAT. Facturama asignará la serie y el folio.
          </DialogDescription>
        </DialogHeader>

        <dl className="text-sm">
          <div className="flex items-center justify-between gap-4 border-b border-border py-2">
            <dt className="text-muted-foreground">Empresa</dt>
            <dd className="text-right font-medium">{df?.razon_social || corte.empresa?.nombre}</dd>
          </div>
          <div className="flex items-center justify-between gap-4 border-b border-border py-2">
            <dt className="text-muted-foreground">RFC</dt>
            <dd className="font-mono">{df?.rfc}</dd>
          </div>
          <div className="flex items-center justify-between gap-4 border-b border-border py-2">
            <dt className="text-muted-foreground">Período</dt>
            <dd>{rangoSemanaLegible(deISO(corte.semana_inicio))}</dd>
          </div>
          <div className="flex items-center justify-between gap-4 border-b border-border py-2">
            <dt className="text-muted-foreground">
              Consumidas × {formatearMoneda(corte.precio_unitario)}
            </dt>
            <dd className="font-mono tabular-nums">{formatearMoneda(subtotal)}</dd>
          </div>
          <div className="flex items-center justify-between gap-4 border-b border-border py-2">
            <dt className="text-muted-foreground">IVA 16%</dt>
            <dd className="font-mono tabular-nums">{formatearMoneda(iva)}</dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-2">
            <dt className="font-semibold">Total</dt>
            <dd className="font-mono font-semibold tabular-nums text-primary">
              {formatearMoneda(total)}
            </dd>
          </div>
        </dl>

        <div className="flex items-center justify-between gap-2 rounded-md bg-muted px-3 py-2 text-sm">
          <span className="text-muted-foreground">Ambiente</span>
          <BadgeAmbiente />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCerrar} disabled={cargando}>
            Cancelar
          </Button>
          <Button onClick={onConfirmar} loading={cargando}>
            <Receipt className="size-4" />
            {esReintento ? 'Reintentar' : 'Facturar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
