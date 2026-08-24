import { useActionState } from 'react'
import { toast } from 'sonner'
import { Button } from '@amena/ui/components/ui/button'
import { Card, CardContent } from '@amena/ui/components/ui/card'
import { Field, FieldError, FieldLabel } from '@amena/ui/components/ui/field'
import { Input } from '@amena/ui/components/ui/input'
import { MoneyInput } from '@amena/ui/components/money-input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@amena/ui/components/ui/select'
import type { Empresa } from './api'
import { empresaSchema } from './empresaSchema'
import { useActualizarEmpresa } from './queries'

type Errores = Partial<Record<keyof typeof empresaSchema.shape, string[]>>

/**
 * Sección "Datos comerciales" del detalle de empresa, editable en la propia página
 * (nombre comercial, precio por comida y ciclo de facturación). Guarda por su cuenta con
 * `useActualizarEmpresa`. Sustituye al tab comercial del antiguo diálogo de edición.
 */
export function DatosComercialesSection({ empresa }: { empresa: Empresa }) {
  const actualizar = useActualizarEmpresa()

  const [estado, accion, pending] = useActionState<{ errors: Errores }, FormData>(
    async (_prev, fd) => {
      const parsed = empresaSchema.safeParse(Object.fromEntries(fd))
      if (!parsed.success) {
        return { errors: parsed.error.flatten().fieldErrors }
      }
      try {
        await actualizar.mutateAsync({ id: empresa.id, datos: parsed.data })
        toast.success('Datos comerciales actualizados')
        return { errors: {} }
      } catch {
        toast.error('No se pudieron guardar los datos comerciales. Intenta de nuevo.')
        return { errors: {} }
      }
    },
    { errors: {} }
  )

  return (
    <Card className="shadow-none">
      <CardContent className="flex flex-col gap-5 p-5">
        <h2 className="text-sm font-semibold tracking-tight">Datos comerciales</h2>

        <form action={accion}>
          <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
            <Field className="sm:col-span-2">
              <FieldLabel htmlFor="nombre_comercial">Nombre comercial (opcional)</FieldLabel>
              <Input
                id="nombre_comercial"
                name="nombre_comercial"
                defaultValue={empresa.nombre_comercial ?? ''}
                aria-invalid={Boolean(estado.errors.nombre_comercial)}
              />
              {estado.errors.nombre_comercial && (
                <FieldError>{estado.errors.nombre_comercial[0]}</FieldError>
              )}
            </Field>

            <Field>
              <FieldLabel htmlFor="precio_comida">Precio por comida</FieldLabel>
              <MoneyInput
                id="precio_comida"
                name="precio_comida"
                defaultValue={empresa.precio_comida}
                aria-invalid={Boolean(estado.errors.precio_comida)}
              />
              {estado.errors.precio_comida && (
                <FieldError>{estado.errors.precio_comida[0]}</FieldError>
              )}
            </Field>

            <Field>
              <FieldLabel htmlFor="ciclo_facturacion">Ciclo de facturación</FieldLabel>
              <Select name="ciclo_facturacion" defaultValue={empresa.ciclo_facturacion ?? 'mensual'}>
                <SelectTrigger id="ciclo_facturacion" className="w-full">
                  <SelectValue>
                    {(valor) => (valor === 'semanal' ? 'Semanal' : 'Mensual')}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent alignItemWithTrigger={false}>
                  <SelectItem value="mensual">Mensual</SelectItem>
                  <SelectItem value="semanal">Semanal</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>

          <div className="mt-6 flex justify-end">
            <Button type="submit" loading={pending}>
              Guardar datos comerciales
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
