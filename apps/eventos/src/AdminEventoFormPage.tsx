import { useEffect, useState, type ReactNode, type SyntheticEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowRight, ImagePlus } from 'lucide-react'
import { AdminLayout, RequireAdminAuth } from './AdminLayout'
import { getAdminEventoBySlug, slugify, upsertAdminEvento, type AdminEventoInput } from './data/admin-eventos-store'
import type { Categoria, Evento } from './data/eventos'

const CATEGORIAS: Categoria[] = ['Cata', 'Taller', 'Cena']

type FormState = {
  titulo: string
  descripcionCorta: string
  descripcionLarga: string
  categoria: Categoria
  fecha: string
  horaInicio: string
  horaFin: string
  precio: string
  cupoTotal: string
  lugar: string
  publicar: boolean
  listaEspera: boolean
}

function formVacio(): FormState {
  return {
    titulo: '',
    descripcionCorta: '',
    descripcionLarga: '',
    categoria: 'Cata',
    fecha: '',
    horaInicio: '',
    horaFin: '',
    precio: '',
    cupoTotal: '24',
    lugar: 'Amena · Mutuo Vive, Guadalajara',
    publicar: true,
    listaEspera: false,
  }
}

function formDesdeEvento(e: Evento): FormState {
  return {
    titulo: e.titulo,
    descripcionCorta: e.descripcionCorta,
    descripcionLarga: e.descripcionLarga?.join('\n\n') ?? '',
    categoria: e.categoria,
    fecha: `${e.anio}-${String(e.mes + 1).padStart(2, '0')}-${String(e.dia).padStart(2, '0')}`,
    horaInicio: e.horario.split(' — ')[0]?.replace(' h', '') ?? '',
    horaFin: e.horario.includes(' — ') ? e.horario.split(' — ')[1].replace(' h', '') : '',
    precio: String(e.precio),
    cupoTotal: String(e.cupoTotal),
    lugar: e.lugar,
    publicar: e.estado === 'Publicado',
    listaEspera: false,
  }
}

export function AdminEventoFormPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [existente, setExistente] = useState<Evento | undefined>(undefined)
  const [form, setForm] = useState<FormState>(formVacio())
  const [cargando, setCargando] = useState(Boolean(slug))
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    if (!slug) return
    getAdminEventoBySlug(slug).then((e) => {
      setExistente(e)
      if (e) setForm(formDesdeEvento(e))
      setCargando(false)
    })
  }, [slug])

  async function guardar(e: SyntheticEvent, forzarBorrador = false) {
    e.preventDefault()
    setGuardando(true)

    const input: AdminEventoInput = {
      slug: existente?.slug ?? slugify(form.titulo),
      categoria: form.categoria,
      titulo: form.titulo,
      descripcionCorta: form.descripcionCorta,
      descripcionLarga: form.descripcionLarga
        ? form.descripcionLarga.split('\n\n').filter(Boolean)
        : existente?.descripcionLarga,
      incluye: existente?.incluye,
      fecha: form.fecha,
      horaInicio: form.horaInicio,
      horaFin: form.horaFin || undefined,
      lugar: form.lugar,
      precio: Number(form.precio),
      cupoTotal: Number(form.cupoTotal),
      cupoDisponible: existente ? existente.cupoDisponible : Number(form.cupoTotal),
      estado: forzarBorrador ? 'Borrador' : form.publicar ? 'Publicado' : 'Borrador',
      imagenUrl:
        existente?.imagenUrl ??
        'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1080',
    }

    try {
      await upsertAdminEvento(input, existente?.id)
      navigate('/admin/eventos')
    } finally {
      setGuardando(false)
    }
  }

  if (cargando) {
    return (
      <RequireAdminAuth>
        <AdminLayout title="Editar evento" subtitle="Eventos" backTo="/admin/eventos">
          <p className="text-sm text-muted-foreground">Cargando evento…</p>
        </AdminLayout>
      </RequireAdminAuth>
    )
  }

  return (
    <RequireAdminAuth>
      <AdminLayout
        title={existente ? 'Editar evento' : 'Nuevo evento'}
        subtitle={existente ? `Eventos / ${existente.titulo}` : 'Eventos / Crear evento'}
        backTo="/admin/eventos"
      >
        <form onSubmit={guardar} className="grid gap-6 pb-24 lg:grid-cols-[1fr_320px] lg:pb-0">
          <div className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-6">
            <h2 className="font-semibold">Información del evento</h2>

            <Campo label="Nombre del evento *">
              <input
                required
                value={form.titulo}
                onChange={(e) => setForm({ ...form, titulo: e.target.value })}
              />
            </Campo>
            <Campo label="Descripción corta * (se muestra en la tarjeta)">
              <input
                required
                value={form.descripcionCorta}
                onChange={(e) => setForm({ ...form, descripcionCorta: e.target.value })}
              />
            </Campo>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-muted-foreground">Descripción completa *</span>
              <textarea
                required
                rows={4}
                value={form.descripcionLarga}
                onChange={(e) => setForm({ ...form, descripcionLarga: e.target.value })}
                className="rounded-lg border border-border bg-card px-3.5 py-2.5 text-sm outline-none"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-muted-foreground">Categoría *</span>
                <select
                  value={form.categoria}
                  onChange={(e) => setForm({ ...form, categoria: e.target.value as Categoria })}
                  className="h-11 rounded-lg border border-border bg-card px-3.5 text-sm outline-none"
                >
                  {CATEGORIAS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>
              <Campo label="Fecha *">
                <input
                  required
                  type="date"
                  value={form.fecha}
                  onChange={(e) => setForm({ ...form, fecha: e.target.value })}
                />
              </Campo>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Campo label="Hora de inicio *">
                <input
                  required
                  type="time"
                  value={form.horaInicio}
                  onChange={(e) => setForm({ ...form, horaInicio: e.target.value })}
                />
              </Campo>
              <Campo label="Hora de fin">
                <input
                  type="time"
                  value={form.horaFin}
                  onChange={(e) => setForm({ ...form, horaFin: e.target.value })}
                />
              </Campo>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Campo label="Precio por persona (MXN) *">
                <input
                  required
                  type="number"
                  min={0}
                  value={form.precio}
                  onChange={(e) => setForm({ ...form, precio: e.target.value })}
                />
              </Campo>
              <Campo label="Cupo total *">
                <input
                  required
                  type="number"
                  min={1}
                  value={form.cupoTotal}
                  onChange={(e) => setForm({ ...form, cupoTotal: e.target.value })}
                />
              </Campo>
            </div>

            <Campo label="Lugar *">
              <input required value={form.lugar} onChange={(e) => setForm({ ...form, lugar: e.target.value })} />
            </Campo>
          </div>

          <div className="flex flex-col gap-6">
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="font-semibold">Imagen destacada</h2>
              <div className="mt-3 flex flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-muted p-6 text-center">
                <ImagePlus className="size-6 text-muted-foreground" />
                <p className="text-sm font-medium">Arrastra una imagen o haz clic para reemplazar</p>
                <p className="text-xs text-muted-foreground">JPG o PNG · máx. 5 MB · 1200×800 px recomendado</p>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="font-semibold">Publicación</h2>
              <div className="mt-3 flex flex-col gap-4">
                <Toggle
                  label="Publicar en la vitrina"
                  desc="Visible en /eventos para el público"
                  checked={form.publicar}
                  onChange={(v) => setForm({ ...form, publicar: v })}
                />
                <Toggle
                  label="Permitir lista de espera"
                  desc="Cuando el cupo se agote"
                  checked={form.listaEspera}
                  onChange={(v) => setForm({ ...form, listaEspera: v })}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={guardando}
              className="hidden items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-naranja-600 disabled:opacity-60 lg:inline-flex"
            >
              {guardando ? 'Guardando…' : 'Guardar y publicar'}
              <ArrowRight className="size-4" />
            </button>
          </div>

          <div className="fixed inset-x-0 bottom-0 z-30 flex gap-2 border-t border-border bg-card px-4 py-3 lg:hidden">
            <button
              type="button"
              disabled={guardando}
              onClick={(e) => guardar(e, true)}
              className="flex-1 rounded-full border border-border py-2.5 text-sm font-semibold hover:bg-secondary/60 disabled:opacity-60"
            >
              Guardar como borrador
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-naranja-600 disabled:opacity-60"
            >
              {guardando ? 'Guardando…' : 'Guardar y publicar'}
            </button>
          </div>
        </form>
      </AdminLayout>
    </RequireAdminAuth>
  )
}

function Campo({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <div className="[&>input]:h-11 [&>input]:w-full [&>input]:rounded-lg [&>input]:border [&>input]:border-border [&>input]:bg-card [&>input]:px-3.5 [&>input]:text-sm [&>input]:outline-none">
        {children}
      </div>
    </label>
  )
}

function Toggle({
  label,
  desc,
  checked,
  onChange,
}: {
  label: string
  desc: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? 'bg-primary' : 'bg-secondary'}`}
      >
        <span
          className={`absolute top-0.5 size-5 rounded-full bg-white transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`}
        />
      </button>
    </label>
  )
}
