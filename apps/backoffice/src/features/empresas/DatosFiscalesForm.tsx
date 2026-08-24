import { useActionState, useState } from 'react'
import { FileText } from 'lucide-react'
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
import { Field, FieldError, FieldLabel } from '@amena/ui/components/ui/field'
import { Input } from '@amena/ui/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@amena/ui/components/ui/select'
import { Skeleton } from '@amena/ui/components/ui/skeleton'
import {
  etiquetaRegimenFiscal,
  etiquetaUsoCfdi,
  REGIMENES_FISCALES,
  USOS_CFDI,
} from '@amena/utils'
import type { DatosFiscales } from './api'
import { datosFiscalesSchema } from './empresaSchema'
import { useDatosFiscalesEmpresa, useGuardarDatosFiscales } from './queries'

type Errores = Partial<Record<keyof typeof datosFiscalesSchema.shape, string[]>>

/**
 * Formulario de datos fiscales de una empresa (upsert independiente). Muestra su propio
 * submit y validación con `datosFiscalesSchema`. Si la empresa aún no tiene fila fiscal,
 * un estado vacío con CTA revela el formulario. Reusable por el tab del form y por el detalle.
 */
export function DatosFiscalesForm({
  empresaId,
  onGuardado,
}: {
  empresaId: number
  /** Se invoca tras un guardado exitoso (p. ej. para cerrar un diálogo). */
  onGuardado?: () => void
}) {
  const { data: fiscal, isLoading, isError, refetch } = useDatosFiscalesEmpresa(empresaId)
  // Al pulsar el CTA de "configurar", revela el formulario aunque no exista fila.
  const [mostrarForm, setMostrarForm] = useState(false)

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FileText className="size-6" />
          </EmptyMedia>
          <EmptyTitle>No se pudieron cargar los datos fiscales</EmptyTitle>
          <EmptyDescription>Ocurrió un error al consultar los datos.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button variant="outline" onClick={() => refetch()}>
            Reintentar
          </Button>
        </EmptyContent>
      </Empty>
    )
  }

  if (!fiscal && !mostrarForm) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FileText className="size-6" />
          </EmptyMedia>
          <EmptyTitle>Sin datos fiscales</EmptyTitle>
          <EmptyDescription>
            Configura los datos fiscales para poder facturar a esta empresa.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button onClick={() => setMostrarForm(true)}>Configurar datos fiscales para facturar</Button>
        </EmptyContent>
      </Empty>
    )
  }

  return <FiscalFields empresaId={empresaId} fiscal={fiscal ?? null} onGuardado={onGuardado} />
}

function FiscalFields({
  empresaId,
  fiscal,
  onGuardado,
}: {
  empresaId: number
  fiscal: DatosFiscales | null
  onGuardado?: () => void
}) {
  const guardar = useGuardarDatosFiscales()

  const [estado, accion, pending] = useActionState<{ errors: Errores }, FormData>(
    async (_prev, fd) => {
      const parsed = datosFiscalesSchema.safeParse(Object.fromEntries(fd))
      if (!parsed.success) {
        return { errors: parsed.error.flatten().fieldErrors }
      }
      try {
        await guardar.mutateAsync({ empresaId, datos: parsed.data })
        toast.success('Datos fiscales guardados')
        onGuardado?.()
        return { errors: {} }
      } catch {
        toast.error('No se pudieron guardar los datos fiscales. Intenta de nuevo.')
        return { errors: {} }
      }
    },
    { errors: {} }
  )

  return (
    <form action={accion}>
      <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
        <Field className="sm:col-span-2">
          <FieldLabel htmlFor="razon_social">Razón social</FieldLabel>
          <Input
            id="razon_social"
            name="razon_social"
            defaultValue={fiscal?.razon_social ?? ''}
            aria-invalid={Boolean(estado.errors.razon_social)}
            placeholder="Nombre legal para facturación"
          />
          {estado.errors.razon_social && <FieldError>{estado.errors.razon_social[0]}</FieldError>}
        </Field>

        <Field>
          <FieldLabel htmlFor="rfc">RFC</FieldLabel>
          <Input
            id="rfc"
            name="rfc"
            defaultValue={fiscal?.rfc ?? ''}
            aria-invalid={Boolean(estado.errors.rfc)}
            placeholder="XAXX010101000"
          />
          {estado.errors.rfc && <FieldError>{estado.errors.rfc[0]}</FieldError>}
        </Field>

        <Field>
          <FieldLabel htmlFor="codigo_postal_fiscal">Código postal fiscal</FieldLabel>
          <Input
            id="codigo_postal_fiscal"
            name="codigo_postal_fiscal"
            inputMode="numeric"
            defaultValue={fiscal?.codigo_postal_fiscal ?? ''}
            aria-invalid={Boolean(estado.errors.codigo_postal_fiscal)}
            placeholder="06600"
          />
          {estado.errors.codigo_postal_fiscal && (
            <FieldError>{estado.errors.codigo_postal_fiscal[0]}</FieldError>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor="regimen_fiscal">Régimen fiscal</FieldLabel>
          <Select name="regimen_fiscal" defaultValue={fiscal?.regimen_fiscal ?? null}>
            <SelectTrigger
              id="regimen_fiscal"
              className="w-full"
              aria-invalid={Boolean(estado.errors.regimen_fiscal)}
            >
              <SelectValue>
                {(valor) =>
                  valor ? etiquetaRegimenFiscal(valor as string) : 'Selecciona un régimen fiscal'
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent
              alignItemWithTrigger={false}
              className="max-h-72 [&_[data-slot=select-item]>div]:whitespace-normal"
            >
              {REGIMENES_FISCALES.map((r) => (
                <SelectItem key={r.codigo} value={r.codigo}>
                  {r.codigo} — {r.descripcion}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {estado.errors.regimen_fiscal && (
            <FieldError>{estado.errors.regimen_fiscal[0]}</FieldError>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor="uso_cfdi">Uso de CFDI</FieldLabel>
          <Select name="uso_cfdi" defaultValue={fiscal?.uso_cfdi ?? 'G03'}>
            <SelectTrigger
              id="uso_cfdi"
              className="w-full"
              aria-invalid={Boolean(estado.errors.uso_cfdi)}
            >
              <SelectValue>
                {(valor) => (valor ? etiquetaUsoCfdi(valor as string) : 'Selecciona un uso de CFDI')}
              </SelectValue>
            </SelectTrigger>
            <SelectContent
              alignItemWithTrigger={false}
              className="max-h-72 [&_[data-slot=select-item]>div]:whitespace-normal"
            >
              {USOS_CFDI.map((u) => (
                <SelectItem key={u.codigo} value={u.codigo}>
                  {u.codigo} — {u.descripcion}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {estado.errors.uso_cfdi && <FieldError>{estado.errors.uso_cfdi[0]}</FieldError>}
        </Field>

        <Field className="sm:col-span-2">
          <FieldLabel htmlFor="email_facturacion">Correo de facturación</FieldLabel>
          <Input
            id="email_facturacion"
            name="email_facturacion"
            type="email"
            autoComplete="off"
            defaultValue={fiscal?.email_facturacion ?? ''}
            aria-invalid={Boolean(estado.errors.email_facturacion)}
            placeholder="facturacion@empresa.com"
          />
          {estado.errors.email_facturacion && (
            <FieldError>{estado.errors.email_facturacion[0]}</FieldError>
          )}
        </Field>
      </div>

      <div className="mt-6 flex justify-end">
        <Button type="submit" loading={pending}>
          Guardar datos fiscales
        </Button>
      </div>
    </form>
  )
}
