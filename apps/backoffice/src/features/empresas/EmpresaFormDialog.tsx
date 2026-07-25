import { useActionState } from 'react'
import { toast } from 'sonner'
import { Button } from '@amena/ui/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@amena/ui/components/ui/dialog'
import { Field, FieldError, FieldGroup, FieldLabel } from '@amena/ui/components/ui/field'
import { Input } from '@amena/ui/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@amena/ui/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@amena/ui/components/ui/tabs'
import type { Empresa } from './api'
import { DatosFiscalesForm } from './DatosFiscalesForm'
import { empresaSchema } from './empresaSchema'
import { MoneyInput } from '@amena/ui/components/money-input'
import { useActualizarEmpresa, useCrearEmpresa } from './queries'

type Errores = Partial<Record<keyof typeof empresaSchema.shape, string[]>>
interface EstadoForm {
  errors: Errores
}

/**
 * Dialog de crear/editar empresa, organizado en dos tabs:
 * - "Datos comerciales": nombre_comercial, precio_comida, ciclo_facturacion (submit propio).
 *   La política de consumo (modo/días/límite) NO vive aquí: se gestiona en el detalle
 *   (PoliticaConsumoSection); no se duplica en este form.
 * - "Datos fiscales": upsert independiente (DatosFiscalesForm). En creación queda
 *   deshabilitado hasta guardar primero los datos comerciales (la empresa aún no existe).
 *
 * El padre lo monta (y le pasa `key`) por apertura, así useActionState y los defaultValue
 * se reinician en cada uso.
 */
export function EmpresaFormDialog({
  empresa,
  onClose,
}: {
  empresa?: Empresa | null
  onClose: () => void
}) {
  const crear = useCrearEmpresa()
  const actualizar = useActualizarEmpresa()
  const esEdicion = Boolean(empresa)

  const [estado, accion, pending] = useActionState<EstadoForm, FormData>(
    async (_prev, fd) => {
      const parsed = empresaSchema.safeParse(Object.fromEntries(fd))
      if (!parsed.success) {
        return { errors: parsed.error.flatten().fieldErrors }
      }
      try {
        if (empresa) {
          await actualizar.mutateAsync({ id: empresa.id, datos: parsed.data })
          toast.success('Empresa actualizada')
        } else {
          await crear.mutateAsync(parsed.data)
          toast.success('Empresa creada')
        }
        onClose()
        return { errors: {} }
      } catch {
        toast.error('No se pudo guardar la empresa. Intenta de nuevo.')
        return { errors: {} }
      }
    },
    { errors: {} }
  )

  return (
    <Dialog
      open
      onOpenChange={(abierto) => {
        if (!abierto) onClose()
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{esEdicion ? 'Editar empresa' : 'Nueva empresa'}</DialogTitle>
          <DialogDescription>
            {esEdicion
              ? 'Actualiza los datos de la empresa convenio.'
              : 'Registra una nueva empresa convenio.'}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="comercial" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="comercial">Datos comerciales</TabsTrigger>
            <TabsTrigger value="fiscal" disabled={!esEdicion}>
              Datos fiscales
            </TabsTrigger>
          </TabsList>

          <TabsContent value="comercial">
            <form action={accion}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="nombre_comercial">Nombre comercial (opcional)</FieldLabel>
                  <Input
                    id="nombre_comercial"
                    name="nombre_comercial"
                    defaultValue={empresa?.nombre_comercial ?? ''}
                    aria-invalid={Boolean(estado.errors.nombre_comercial)}
                    autoFocus
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
                    defaultValue={empresa?.precio_comida}
                    aria-invalid={Boolean(estado.errors.precio_comida)}
                  />
                  {estado.errors.precio_comida && (
                    <FieldError>{estado.errors.precio_comida[0]}</FieldError>
                  )}
                </Field>

                <Field>
                  <FieldLabel htmlFor="ciclo_facturacion">Ciclo de facturación</FieldLabel>
                  <Select
                    name="ciclo_facturacion"
                    defaultValue={empresa?.ciclo_facturacion ?? 'mensual'}
                  >
                    <SelectTrigger id="ciclo_facturacion" className="w-full">
                      <SelectValue>
                        {(valor) => (valor === 'semanal' ? 'Semanal' : 'Mensual')}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mensual">Mensual</SelectItem>
                      <SelectItem value="semanal">Semanal</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </FieldGroup>

              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
                <Button type="submit" loading={pending}>
                  Guardar
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>

          <TabsContent value="fiscal">
            {empresa ? (
              <DatosFiscalesForm empresaId={empresa.id} onGuardado={onClose} />
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Guarda primero los datos comerciales; después podrás completar los datos fiscales.
              </p>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
