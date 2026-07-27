import { useState } from 'react'
import { Navigate, useOutletContext } from 'react-router-dom'
import { Building2, Pencil, ReceiptText } from 'lucide-react'
import { Badge } from '@amena/ui/components/ui/badge'
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
import { formatearLimiteDiario, formatearMoneda, resumenPoliticaConsumo } from '@amena/utils'
import type { ContextoAcceso } from '../../auth/validarAccesoPortal'
import type { DatosFiscales, Empresa } from './api'
import { DatosFiscalesFormDialog } from './DatosFiscalesFormDialog'
import { EditarNombreComercialDialog } from './EditarNombreComercialDialog'
import { useMiEmpresa } from './queries'

const MODO_CONSUMO: Record<Empresa['modo_consumo'], string> = {
  reserva: 'Por reserva (cuota por día)',
  libre: 'Consumo libre',
}
const CICLO: Record<Empresa['ciclo_facturacion'], string> = {
  semanal: 'Semanal',
  mensual: 'Mensual',
}

/** ¿La fila fiscal tiene todos los campos obligatorios (facturable)? */
function fiscalCompleto(f: DatosFiscales | null): boolean {
  if (!f) return false
  return [f.razon_social, f.rfc, f.codigo_postal_fiscal, f.regimen_fiscal, f.uso_cfdi, f.email_facturacion].every(
    (v) => v != null && v.trim() !== ''
  )
}

/**
 * Página "General" de la empresa (`/empresa`, solo admin): datos generales + edición de lo propio
 * (nombre comercial y datos fiscales) + tarjetas de acceso a las secciones hijas. Los términos del
 * plan son de solo lectura (acuerdo con Amena).
 */
export function EmpresaGeneralPage() {
  const contexto = useOutletContext<ContextoAcceso>()
  const { data, isLoading, isError, refetch } = useMiEmpresa()
  const [editarNombre, setEditarNombre] = useState(false)
  const [editarFiscal, setEditarFiscal] = useState(false)

  // Defensa en profundidad: solo el admin de empresa ve esta página.
  if (contexto.tipo !== 'admin_empresa') return <Navigate to="/inicio" replace />

  if (isLoading) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-40 w-full rounded-2xl" />
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="mx-auto w-full max-w-2xl">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Building2 className="size-6" />
            </EmptyMedia>
            <EmptyTitle>No se pudieron cargar los datos de tu empresa</EmptyTitle>
            <EmptyDescription>Ocurrió un error al consultar la información.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button variant="outline" onClick={() => refetch()}>
              Reintentar
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    )
  }

  const { empresa, datosFiscales } = data
  const completo = fiscalCompleto(datosFiscales)

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-5">
      {/* Encabezado: nombre comercial + estado + editar */}
      <section className="flex items-start justify-between gap-3 rounded-2xl border border-border bg-card p-4">
        <div className="flex min-w-0 flex-col gap-1">
          <span className="text-xs text-muted-foreground">Nombre comercial</span>
          <span className="truncate text-xl font-semibold tracking-tight">
            {empresa.nombre_comercial ?? 'Sin nombre comercial'}
          </span>
          <Badge
            variant={empresa.activo ? undefined : 'secondary'}
            className={empresa.activo ? 'mt-1 bg-success text-success-foreground' : 'mt-1'}
          >
            {empresa.activo ? 'Activa' : 'Inactiva'}
          </Badge>
        </div>
        <Button variant="outline" size="sm" onClick={() => setEditarNombre(true)}>
          <Pencil className="size-4" />
          Editar
        </Button>
      </section>

      {/* Datos fiscales (editables por el admin) */}
      <section className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ReceiptText className="size-4 text-muted-foreground" />
            <h2 className="text-base font-medium">Datos fiscales</h2>
          </div>
          {datosFiscales && (
            <Button variant="outline" size="sm" onClick={() => setEditarFiscal(true)}>
              <Pencil className="size-4" />
              Editar
            </Button>
          )}
        </div>

        {!datosFiscales ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <ReceiptText className="size-6" />
              </EmptyMedia>
              <EmptyTitle>Aún no has registrado tus datos fiscales</EmptyTitle>
              <EmptyDescription>Los necesitamos para poder emitir tus facturas (CFDI).</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button onClick={() => setEditarFiscal(true)}>Completar datos fiscales</Button>
            </EmptyContent>
          </Empty>
        ) : (
          <>
            {!completo && (
              <p className="rounded-lg bg-warning/10 px-3 py-2 text-sm text-warning-foreground">
                Tus datos fiscales están incompletos. Complétalos para poder facturar.
              </p>
            )}
            <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
              <Dato label="Razón social" valor={datosFiscales.razon_social} />
              <Dato label="RFC" valor={datosFiscales.rfc} mono />
              <Dato label="Código postal fiscal" valor={datosFiscales.codigo_postal_fiscal} mono />
              <Dato label="Régimen fiscal" valor={datosFiscales.regimen_fiscal} mono />
              <Dato label="Uso de CFDI" valor={datosFiscales.uso_cfdi} mono />
              <Dato label="Correo de facturación" valor={datosFiscales.email_facturacion} />
            </dl>
          </>
        )}
      </section>

      {/* Términos del plan (solo lectura) */}
      <section className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4">
        <h2 className="text-base font-medium">Términos del plan</h2>
        <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
          <Dato label="Precio por comida" valor={formatearMoneda(empresa.precio_comida)} mono />
          <Dato label="Ciclo de facturación" valor={CICLO[empresa.ciclo_facturacion]} />
          <Dato label="Modo de consumo" valor={MODO_CONSUMO[empresa.modo_consumo]} />
          {empresa.modo_consumo === 'libre' && (
            <>
              <Dato label="Días permitidos" valor={resumenPoliticaConsumo(empresa.dias_permitidos, empresa.limite_diario)} />
              <Dato label="Límite diario" valor={formatearLimiteDiario(empresa.limite_diario)} />
            </>
          )}
        </dl>
        <p className="text-xs text-muted-foreground">
          Estos términos los acordaste con Amena. Para cambiarlos, contáctanos.
        </p>
      </section>

      <EditarNombreComercialDialog
        empresaId={empresa.id}
        nombreActual={empresa.nombre_comercial}
        open={editarNombre}
        onOpenChange={setEditarNombre}
      />
      <DatosFiscalesFormDialog
        empresaId={empresa.id}
        fiscal={datosFiscales}
        open={editarFiscal}
        onOpenChange={setEditarFiscal}
      />
    </div>
  )
}

function Dato({ label, valor, mono }: { label: string; valor: string; mono?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className={mono ? 'font-mono text-sm' : 'text-sm'}>{valor}</dd>
    </div>
  )
}
