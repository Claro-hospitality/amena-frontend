import { useActionState, useState } from 'react'
import { useNavigate, useOutletContext, useParams } from 'react-router-dom'
import { ImagePlus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@amena/ui/components/ui/button'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@amena/ui/components/ui/field'
import { Input } from '@amena/ui/components/ui/input'
import { NativeSelect, NativeSelectOption } from '@amena/ui/components/ui/native-select'
import { Skeleton } from '@amena/ui/components/ui/skeleton'
import { Switch } from '@amena/ui/components/ui/switch'
import { Textarea } from '@amena/ui/components/ui/textarea'
import type { ContextoAcceso } from '../../auth/validarAccesoPortal'
import { CATEGORIAS, slugify, type DatosEvento } from './api'
import { aParrafos, deParrafos, eventoSchema } from './eventoSchema'
import { puedeVerEventos } from './logica'
import { useEvento, useGuardarEvento } from './queries'
import { useSetTituloDetalle } from '../../layout/tituloDetalle'

/** Imagen por omisión mientras no exista carga real de archivos (ver "Imagen destacada"). */
const IMAGEN_POR_OMISION =
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1080'

const LUGAR_POR_OMISION = 'Amena · Mutuo Vive, Guadalajara'

type Errores = Partial<Record<keyof typeof eventoSchema.shape, string[]>>
interface EstadoForm {
  errors: Errores
}

export function EventoFormPage() {
  const { rol } = useOutletContext<ContextoAcceso>()
  const { slug } = useParams()
  const navigate = useNavigate()
  const esEdicion = Boolean(slug)
  const { data: evento, isLoading } = useEvento(slug)
  const guardar = useGuardarEvento()

  // Se deriva del evento mientras nadie toque el switch: sincronizarlo por efecto dispararía
  // un render de más justo cuando llegan los datos.
  const [publicarElegido, setPublicarElegido] = useState<boolean | null>(null)
  const publicar = publicarElegido ?? (evento ? evento.estado === 'Publicado' : true)
  const [listaEspera, setListaEspera] = useState(false)

  useSetTituloDetalle(esEdicion ? (evento?.titulo ?? 'Editar evento') : 'Nuevo evento')

  const [estado, accion, pending] = useActionState<EstadoForm, FormData>(
    async (_prev, fd) => {
      const parsed = eventoSchema.safeParse({
        titulo: fd.get('titulo'),
        descripcion_corta: fd.get('descripcion_corta'),
        descripcion_larga: fd.get('descripcion_larga'),
        categoria: fd.get('categoria'),
        fecha: fd.get('fecha'),
        hora_inicio: fd.get('hora_inicio'),
        hora_fin: fd.get('hora_fin'),
        precio: fd.get('precio'),
        cupo_total: fd.get('cupo_total'),
        lugar: fd.get('lugar'),
      })
      if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors as Errores }

      const comoBorrador = fd.get('modo') === 'borrador'
      const v = parsed.data
      const datos: DatosEvento = {
        slug: evento?.slug ?? slugify(v.titulo),
        categoria: v.categoria,
        titulo: v.titulo,
        descripcion_corta: v.descripcion_corta,
        descripcion_larga: aParrafos(v.descripcion_larga),
        incluye: evento?.incluye ?? null,
        fecha: v.fecha,
        hora_inicio: v.hora_inicio,
        hora_fin: v.hora_fin,
        lugar: v.lugar,
        precio: v.precio,
        cupo_total: v.cupo_total,
        // En alta el cupo arranca completo; en edición se respeta lo ya reservado.
        cupo_disponible: evento ? evento.cupo_disponible : v.cupo_total,
        estado: comoBorrador || !publicar ? 'Borrador' : 'Publicado',
        imagen_url: evento?.imagen_url ?? IMAGEN_POR_OMISION,
      }

      try {
        await guardar.mutateAsync({ datos, id: evento?.id })
        toast.success(esEdicion ? 'Evento actualizado' : 'Evento creado')
        navigate('/eventos/catalogo')
        return { errors: {} }
      } catch {
        toast.error('No se pudo guardar el evento. Intenta de nuevo.')
        return { errors: {} }
      }
    },
    { errors: {} }
  )

  if (!puedeVerEventos(rol)) {
    return <p className="text-muted-foreground">No tienes acceso a esta sección.</p>
  }

  if (esEdicion && isLoading) return <Skeleton className="h-96 w-full" />
  if (esEdicion && !evento) {
    return <p className="text-muted-foreground">No encontramos ese evento.</p>
  }

  return (
    <form action={accion} className="grid gap-6 pb-24 lg:grid-cols-[1fr_320px] lg:pb-0">
      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-semibold">Información del evento</h2>
        <FieldGroup className="mt-4">
          <Field>
            <FieldLabel htmlFor="titulo">Nombre del evento</FieldLabel>
            <Input
              id="titulo"
              name="titulo"
              defaultValue={evento?.titulo}
              aria-invalid={Boolean(estado.errors.titulo)}
              autoFocus
            />
            {estado.errors.titulo && <FieldError>{estado.errors.titulo[0]}</FieldError>}
          </Field>

          <Field>
            <FieldLabel htmlFor="descripcion_corta">
              Descripción corta (se muestra en la tarjeta)
            </FieldLabel>
            <Input
              id="descripcion_corta"
              name="descripcion_corta"
              defaultValue={evento?.descripcion_corta}
              aria-invalid={Boolean(estado.errors.descripcion_corta)}
            />
            {estado.errors.descripcion_corta && (
              <FieldError>{estado.errors.descripcion_corta[0]}</FieldError>
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor="descripcion_larga">Descripción completa</FieldLabel>
            <Textarea
              id="descripcion_larga"
              name="descripcion_larga"
              rows={4}
              defaultValue={deParrafos(evento?.descripcion_larga ?? null)}
              aria-describedby="ayuda-descripcion"
              aria-invalid={Boolean(estado.errors.descripcion_larga)}
            />
            <p id="ayuda-descripcion" className="text-xs text-muted-foreground">
              Separa los párrafos con una línea en blanco.
            </p>
            {estado.errors.descripcion_larga && (
              <FieldError>{estado.errors.descripcion_larga[0]}</FieldError>
            )}
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="categoria">Categoría</FieldLabel>
              <NativeSelect
                id="categoria"
                name="categoria"
                defaultValue={evento?.categoria ?? 'Cata'}
                className="w-full"
              >
                {CATEGORIAS.map((c) => (
                  <NativeSelectOption key={c} value={c}>
                    {c}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              {estado.errors.categoria && <FieldError>{estado.errors.categoria[0]}</FieldError>}
            </Field>

            <Field>
              <FieldLabel htmlFor="fecha">Fecha</FieldLabel>
              <Input
                id="fecha"
                name="fecha"
                type="date"
                defaultValue={evento?.fecha}
                aria-invalid={Boolean(estado.errors.fecha)}
              />
              {estado.errors.fecha && <FieldError>{estado.errors.fecha[0]}</FieldError>}
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="hora_inicio">Hora de inicio</FieldLabel>
              <Input
                id="hora_inicio"
                name="hora_inicio"
                type="time"
                defaultValue={evento?.hora_inicio?.slice(0, 5)}
                aria-invalid={Boolean(estado.errors.hora_inicio)}
              />
              {estado.errors.hora_inicio && <FieldError>{estado.errors.hora_inicio[0]}</FieldError>}
            </Field>

            <Field>
              <FieldLabel htmlFor="hora_fin">Hora de fin (opcional)</FieldLabel>
              <Input
                id="hora_fin"
                name="hora_fin"
                type="time"
                defaultValue={evento?.hora_fin?.slice(0, 5) ?? ''}
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="precio">Precio por persona (MXN)</FieldLabel>
              <Input
                id="precio"
                name="precio"
                type="number"
                min={0}
                step="0.01"
                defaultValue={evento?.precio}
                aria-invalid={Boolean(estado.errors.precio)}
              />
              {estado.errors.precio && <FieldError>{estado.errors.precio[0]}</FieldError>}
            </Field>

            <Field>
              <FieldLabel htmlFor="cupo_total">Cupo total</FieldLabel>
              <Input
                id="cupo_total"
                name="cupo_total"
                type="number"
                min={1}
                defaultValue={evento?.cupo_total ?? 24}
                aria-invalid={Boolean(estado.errors.cupo_total)}
              />
              {estado.errors.cupo_total && <FieldError>{estado.errors.cupo_total[0]}</FieldError>}
            </Field>
          </div>

          <Field>
            <FieldLabel htmlFor="lugar">Lugar</FieldLabel>
            <Input
              id="lugar"
              name="lugar"
              defaultValue={evento?.lugar ?? LUGAR_POR_OMISION}
              aria-invalid={Boolean(estado.errors.lugar)}
            />
            {estado.errors.lugar && <FieldError>{estado.errors.lugar[0]}</FieldError>}
          </Field>
        </FieldGroup>
      </section>

      <div className="flex flex-col gap-6">
        {/* Sin carga de archivos todavía: el evento usa una imagen por omisión. */}
        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-semibold">Imagen destacada</h2>
          <div
            aria-disabled
            title="Próximamente"
            className="mt-3 flex cursor-not-allowed flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-muted p-6 text-center opacity-60"
          >
            <ImagePlus className="size-6 text-muted-foreground" />
            <p className="text-sm font-medium">Subir imagen — próximamente</p>
            <p className="text-xs text-muted-foreground">
              JPG o PNG · máx. 5 MB · 1200×800 px recomendado
            </p>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-semibold">Publicación</h2>
          <div className="mt-3 flex flex-col gap-4">
            <label className="flex items-start justify-between gap-3">
              <span>
                <span className="block text-sm font-medium">Publicar en la vitrina</span>
                <span className="block text-xs text-muted-foreground">
                  Visible en amena.social para el público
                </span>
              </span>
              <Switch checked={publicar} onCheckedChange={setPublicarElegido} />
            </label>

            <label className="flex items-start justify-between gap-3 opacity-60" title="Próximamente">
              <span>
                <span className="block text-sm font-medium">Permitir lista de espera</span>
                <span className="block text-xs text-muted-foreground">
                  Cuando el cupo se agote — próximamente
                </span>
              </span>
              <Switch checked={listaEspera} onCheckedChange={setListaEspera} disabled />
            </label>
          </div>
        </section>

        <div className="hidden gap-2 lg:flex">
          <Button type="submit" name="modo" value="borrador" variant="outline" loading={pending}>
            Guardar como borrador
          </Button>
          <Button type="submit" loading={pending}>
            {publicar ? 'Guardar y publicar' : 'Guardar'}
          </Button>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 flex gap-2 border-t border-border bg-card px-4 py-3 lg:hidden">
        <Button
          type="submit"
          name="modo"
          value="borrador"
          variant="outline"
          className="flex-1"
          loading={pending}
        >
          Guardar como borrador
        </Button>
        <Button type="submit" className="flex-1" loading={pending}>
          {publicar ? 'Guardar y publicar' : 'Guardar'}
        </Button>
      </div>
    </form>
  )
}
