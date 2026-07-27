import { useActionState } from 'react'
import { Button } from '@amena/ui/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@amena/ui/components/ui/dialog'
import { Field, FieldError, FieldGroup, FieldLabel } from '@amena/ui/components/ui/field'
import { Input } from '@amena/ui/components/ui/input'
import { datosFiscalesSchema } from '@amena/utils'
import { toast } from 'sonner'
import type { DatosFiscales } from './api'
import { useGuardarDatosFiscales } from './queries'

type Errores = Partial<Record<keyof typeof datosFiscalesSchema.shape, string[]>>

/**
 * Diálogo para que el admin registre o edite los datos fiscales de su empresa (upsert).
 * Valida con el `datosFiscalesSchema` compartido y persiste vía la mutation del portal.
 */
export function DatosFiscalesFormDialog({
  empresaId,
  fiscal,
  open,
  onOpenChange,
}: {
  empresaId: number
  fiscal: DatosFiscales | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const guardar = useGuardarDatosFiscales(empresaId)

  const [estado, accion, pending] = useActionState<{ errors: Errores }, FormData>(
    async (_prev, fd) => {
      const parsed = datosFiscalesSchema.safeParse(Object.fromEntries(fd))
      if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors }
      try {
        await guardar.mutateAsync(parsed.data)
        toast.success('Datos fiscales guardados')
        onOpenChange(false)
        return { errors: {} }
      } catch {
        toast.error('No se pudieron guardar los datos fiscales. Intenta de nuevo.')
        return { errors: {} }
      }
    },
    { errors: {} }
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{fiscal ? 'Editar datos fiscales' : 'Registrar datos fiscales'}</DialogTitle>
          <DialogDescription>
            Son los datos con los que se emite tu factura (CFDI). Deben coincidir con tu constancia
            de situación fiscal.
          </DialogDescription>
        </DialogHeader>

        <form action={accion}>
          <FieldGroup>
            <Field>
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

            {/* TODO: catálogos SAT como Select cuando se cableen (regimen_fiscal / uso_cfdi). */}
            <Field>
              <FieldLabel htmlFor="regimen_fiscal">Régimen fiscal</FieldLabel>
              <Input
                id="regimen_fiscal"
                name="regimen_fiscal"
                defaultValue={fiscal?.regimen_fiscal ?? ''}
                aria-invalid={Boolean(estado.errors.regimen_fiscal)}
                placeholder="601"
              />
              {estado.errors.regimen_fiscal && (
                <FieldError>{estado.errors.regimen_fiscal[0]}</FieldError>
              )}
            </Field>

            <Field>
              <FieldLabel htmlFor="uso_cfdi">Uso de CFDI</FieldLabel>
              <Input
                id="uso_cfdi"
                name="uso_cfdi"
                defaultValue={fiscal?.uso_cfdi ?? 'G03'}
                aria-invalid={Boolean(estado.errors.uso_cfdi)}
                placeholder="G03"
              />
              {estado.errors.uso_cfdi && <FieldError>{estado.errors.uso_cfdi[0]}</FieldError>}
            </Field>

            <Field>
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
          </FieldGroup>

          <div className="mt-6 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={pending}>
              Guardar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
