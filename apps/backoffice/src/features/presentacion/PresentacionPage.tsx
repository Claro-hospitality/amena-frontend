import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { buttonVariants } from '@amena/ui/components/ui/button'
import { LogotipoAmena } from '@amena/ui/components/logotipo-amena'

/**
 * Página PÚBLICA (sin sesión) que presenta qué es Amena, para compartir por enlace
 * (backoffice.amena.social/conoce-amena). Redacción para público general (no técnica). Layout
 * autocontenido con la identidad de marca: tokens del tema (crema/naranja/salvia/tinta),
 * tipografía Geist y el logotipo. Incluye acceso al login del backoffice. Solo lectura.
 */
export function PresentacionPage() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <BarraSuperior />
      <main className="mx-auto w-full max-w-5xl px-5 sm:px-8">
        <Hero />
        <QueEs />
        <ParaQue />
        <Publico />
        <ComoFunciona />
        <Administracion />
        <Confianza />
      </main>
      <Pie />
    </div>
  )
}

/* ---------------- Estructura ---------------- */

function BarraSuperior() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-5 sm:px-8">
        <LogotipoAmena className="h-5 w-auto text-primary" />
        <div className="flex items-center gap-2">
          <NavTabs />
          <Link to="/login" className={`${buttonVariants({ size: 'sm' })} ml-1`}>
            Iniciar sesión
          </Link>
        </div>
      </div>
    </header>
  )
}

const TABS = [
  { id: 'que-es', label: 'Qué es' },
  { id: 'para-que', label: 'Para qué sirve' },
  { id: 'publico', label: 'Para quién' },
  { id: 'como-funciona', label: 'Cómo funciona' },
  { id: 'administracion', label: 'Cómo se administra' },
]

/** ¿El usuario pidió menos movimiento? (respeta prefers-reduced-motion). */
function usePrefiereMenosMovimiento() {
  const [reduce, setReduce] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const on = () => setReduce(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return reduce
}

/**
 * Tabs de sección con una "pastilla" que se DESLIZA suavemente al tab activo (transiciones CSS,
 * sin dependencias). El activo se sincroniza con el scroll (IntersectionObserver) y al presionar
 * un tab hace scroll suave a su sección. Solo en pantallas medianas+.
 */
function NavTabs() {
  const [activo, setActivo] = useState(TABS[0].id)
  const refs = useRef<Record<string, HTMLAnchorElement | null>>({})
  const pastillaRef = useRef<HTMLSpanElement>(null)
  const reduce = usePrefiereMenosMovimiento()

  // Mide y coloca la pastilla bajo el tab activo (imperativo, sin setState → sin re-render).
  // La transición CSS de `left`/`width` produce el deslizamiento suave.
  useLayoutEffect(() => {
    const medir = () => {
      const el = refs.current[activo]
      const pill = pastillaRef.current
      if (el && pill) {
        pill.style.left = `${el.offsetLeft}px`
        pill.style.width = `${el.offsetWidth}px`
        pill.style.opacity = '1'
      }
    }
    medir()
    window.addEventListener('resize', medir)
    return () => window.removeEventListener('resize', medir)
  }, [activo])

  // Scroll-spy: marca activo el tab de la sección visible.
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        if (visible[0]) setActivo(visible[0].target.id)
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: [0, 0.25, 0.5, 1] }
    )
    for (const t of TABS) {
      const s = document.getElementById(t.id)
      if (s) obs.observe(s)
    }
    return () => obs.disconnect()
  }, [])

  function ir(e: React.MouseEvent, id: string) {
    e.preventDefault()
    setActivo(id) // la pastilla se desliza de inmediato al presionar
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
  }

  return (
    <nav className="relative hidden md:flex" aria-label="Secciones">
      <span
        ref={pastillaRef}
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 w-0 rounded-lg bg-secondary opacity-0 transition-[left,width] duration-300 ease-out motion-reduce:transition-none"
      />
      {TABS.map((t) => (
        <a
          key={t.id}
          ref={(el) => {
            refs.current[t.id] = el
          }}
          href={`#${t.id}`}
          onClick={(e) => ir(e, t.id)}
          aria-current={activo === t.id ? 'true' : undefined}
          className={`relative z-10 rounded-lg px-2.5 py-1.5 text-sm font-medium transition-[color,transform] duration-150 active:scale-95 ${
            activo === t.id ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {t.label}
        </a>
      ))}
    </nav>
  )
}

function Hero() {
  return (
    <section className="py-14 sm:py-20">
      <Eyebrow>Social Kitchen</Eyebrow>
      <h1 className="mt-5">
        <LogotipoAmena className="h-12 w-auto text-primary sm:h-16" />
      </h1>
      <p className="mt-4 text-lg font-semibold tracking-tight text-salvia-600 sm:text-2xl">
        Comer en el trabajo, simple y bien organizado.
      </p>
      <p className="mt-6 max-w-2xl text-pretty text-base text-foreground sm:text-lg">
        Amena es el servicio de comedor <strong>Social Kitchen</strong> y la plataforma que lo
        organiza. Las empresas le dan de comer a su equipo en el restaurante, y Amena se encarga de
        todo lo demás: <strong>reservar</strong> las comidas de la semana, <strong>registrar</strong>{' '}
        quién come con un simple código QR y llevar la <strong>cuenta clara</strong> para facturar. Sin
        vales, sin listas en papel y sin filas lentas.
      </p>
      <div className="mt-7 flex flex-wrap gap-2">
        <Chip tono="primary">En funcionamiento</Chip>
        <Chip>Social Kitchen</Chip>
        <Chip>Para empresas y su equipo</Chip>
        <Chip>Todo desde el celular</Chip>
      </div>
    </section>
  )
}

function QueEs() {
  return (
    <Seccion id="que-es" num="01" titulo="¿Qué es Amena?">
      <p className="mb-6 max-w-2xl text-muted-foreground">
        Amena es, al mismo tiempo, un <strong>restaurante</strong> y una{' '}
        <strong>plataforma digital</strong> que ordena cómo las empresas dan de comer a su gente. En
        lugar de vales, cobros a mano o apuntar nombres en una hoja, todo el proceso vive en un solo
        lugar.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <Tarjeta k="Un comedor para las empresas">
          El restaurante donde comen los equipos de las empresas. Cada empresa acuerda con Amena un
          precio por comida y un plan a su medida.
        </Tarjeta>
        <Tarjeta k="Una plataforma que lo ordena">
          Dos aplicaciones web sencillas conectan a las empresas con el comedor: se reservan las
          comidas, se registran los consumos y se generan las facturas, con todo a la vista y sin
          errores.
        </Tarjeta>
      </div>
    </Seccion>
  )
}

function ParaQue() {
  const items: [string, string][] = [
    [
      'Para las empresas',
      'Dan de comer a su equipo sin complicaciones: reservan las comidas de la semana, saben cuánto van a gastar y reciben su factura correcta, en orden.',
    ],
    [
      'Para las personas que comen',
      'Comen mostrando un código QR desde el celular. Sin dinero, sin vales y sin filas: llegan, escanean y listo.',
    ],
    [
      'Para el equipo de Amena',
      'Sabe de antemano cuántos van a comer, evita errores y cobros dobles en la fila, y factura de forma automática al cierre de la semana.',
    ],
  ]
  return (
    <Seccion id="para-que" num="02" titulo="¿Para qué sirve?">
      <p className="mb-6 max-w-2xl text-muted-foreground">
        Amena resuelve un problema cotidiano: coordinar de forma ordenada quién come, cuánto y cómo se
        cobra. Cada quien gana algo.
      </p>
      <div className="grid gap-4 sm:grid-cols-3">
        {items.map(([k, d]) => (
          <Tarjeta key={k} k={k}>
            {d}
          </Tarjeta>
        ))}
      </div>
    </Seccion>
  )
}

function Publico() {
  const items: [string, string][] = [
    [
      'Las empresas',
      'Compañías que contratan el servicio de comedor Social Kitchen para su gente.',
    ],
    [
      'Sus colaboradores',
      'Las personas de cada empresa que comen en Amena. Reciben su credencial digital y comen con ella.',
    ],
    [
      'El equipo de Amena',
      'El personal del restaurante que opera el comedor: atiende la fila, arma el menú y administra el servicio.',
    ],
  ]
  return (
    <Seccion id="publico" num="03" titulo="¿A quién está dirigido?">
      <div className="grid gap-4 sm:grid-cols-3">
        {items.map(([k, d]) => (
          <Tarjeta key={k} k={k}>
            {d}
          </Tarjeta>
        ))}
      </div>
    </Seccion>
  )
}

function ComoFunciona() {
  const pasos: { n: string; alt?: boolean; t: string; d: ReactNode }[] = [
    {
      n: '1',
      t: 'Se reservan las comidas',
      d: <>Cada semana, la empresa indica cuántas comidas quiere para su equipo y en qué días. Si hace falta, puede agregar comidas extra sobre la marcha.</>,
    },
    {
      n: '2',
      t: 'Se come con el código QR',
      d: <>La persona llega al comedor y muestra su código QR desde el celular. El mesero lo escanea y queda registrada su comida al instante.</>,
    },
    {
      n: '3',
      t: 'Se suma la semana',
      d: <>Al cierre de cada semana, Amena junta todo lo consumido por cada empresa en un resumen claro: cuántas comidas se reservaron y cuántas se consumieron.</>,
    },
    {
      n: '4',
      alt: true,
      t: 'Se genera la factura',
      d: <>Con ese resumen se emite la factura fiscal (CFDI) de la empresa, lista para descargar. Sin cálculos manuales ni papeleo.</>,
    },
  ]
  return (
    <Seccion id="como-funciona" num="04" titulo="¿Cómo funciona?">
      <div className="rounded-2xl border border-border bg-card px-5">
        {pasos.map((p, i) => (
          <div
            key={p.n}
            className={`grid grid-cols-[44px_1fr] gap-4 py-5 ${i > 0 ? 'border-t border-dashed border-border' : ''}`}
          >
            <span
              className={`flex size-10 items-center justify-center rounded-xl font-mono text-base font-bold text-primary-foreground ${p.alt ? 'bg-salvia-500' : 'bg-primary'}`}
            >
              {p.n}
            </span>
            <div>
              <h3 className="text-base font-semibold">{p.t}</h3>
              <p className="mt-1 text-sm text-foreground">{p.d}</p>
            </div>
          </div>
        ))}
      </div>
    </Seccion>
  )
}

function Administracion() {
  return (
    <Seccion id="administracion" num="05" titulo="¿Cómo se administra?">
      <p className="mb-6 max-w-2xl text-muted-foreground">
        Amena se organiza en <strong>dos espacios</strong> según quién lo usa. Cada persona entra solo
        a lo que le corresponde, y cada empresa ve únicamente su propia información.
      </p>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Panel de Amena */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <span className="mb-1 block font-mono text-xs font-bold uppercase tracking-wider text-primary">
            Panel de Amena
          </span>
          <h3 className="text-lg font-semibold">El equipo del restaurante</h3>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Desde aquí Amena administra todo el servicio. Hay distintos perfiles según lo que hace cada
            persona:
          </p>
          <TablaRoles
            filas={[
              ['Dirección', 'Administra todo: empresas, menú, precios, cuentas y el equipo interno.'],
              ['Finanzas', 'Revisa los consumos y las cuentas, y emite las facturas de las empresas.'],
              ['Mesero', 'Atiende la fila: escanea el código QR y registra cada comida.'],
              ['Consulta', 'Ve la información para dar seguimiento, sin hacer cambios.'],
            ]}
          />
        </div>

        {/* Portal de las empresas */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <span className="mb-1 block font-mono text-xs font-bold uppercase tracking-wider text-primary">
            Portal de las empresas
          </span>
          <h3 className="text-lg font-semibold">Cada empresa y su gente</h3>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Cada empresa entra a su propio espacio, con dos tipos de usuario:
          </p>
          <TablaRoles
            filas={[
              [
                'Administrador de la empresa',
                'Gestiona a su equipo, reserva las comidas de la semana, revisa sus consumos y descarga sus facturas.',
              ],
              [
                'Colaborador',
                'La persona que come. Ve su código QR, el menú de la semana y su historial de comidas.',
              ],
            ]}
          />
          <p className="mt-4 rounded-xl bg-secondary/50 p-3 text-xs text-muted-foreground">
            Un administrador también puede ser colaborador: además de gestionar, come con su propia
            credencial.
          </p>
        </div>
      </div>
    </Seccion>
  )
}

function Confianza() {
  const items: [string, string][] = [
    ['Cada empresa, lo suyo', 'La información de una empresa nunca se mezcla con la de otra: cada quien ve solo sus datos.'],
    ['Desde el celular', 'Las personas usan Amena desde su teléfono, sin instalar nada: solo un enlace y su cuenta.'],
    ['Cuentas claras', 'Todo consumo queda registrado con fecha y hora, así las cuentas y las facturas siempre cuadran.'],
  ]
  return (
    <Seccion id="confianza" num="06" titulo="Simple, seguro y a la mano">
      <div className="grid gap-4 sm:grid-cols-3">
        {items.map(([k, d]) => (
          <Tarjeta key={k} k={k}>
            {d}
          </Tarjeta>
        ))}
      </div>
    </Seccion>
  )
}

function Pie() {
  return (
    <footer className="mt-16 border-t border-border">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-2 px-5 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div className="flex items-center gap-2">
          <LogotipoAmena className="h-4 w-auto text-muted-foreground" aria-hidden />
          <span>Social Kitchen · Planes de alimentación para empresas</span>
        </div>
        <span>Comer en el trabajo, simple y bien organizado.</span>
      </div>
    </footer>
  )
}

/* ---------------- Piezas reutilizables ---------------- */

function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="text-xs font-bold uppercase tracking-widest text-primary">{children}</p>
}

function Seccion({
  id,
  num,
  titulo,
  children,
}: {
  id: string
  num: string
  titulo: string
  children: ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-20 border-t border-border py-12 sm:py-16">
      <div className="mb-7">
        <span className="font-mono text-sm font-semibold text-primary">{num}</span>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
          {titulo}
        </h2>
      </div>
      {children}
    </section>
  )
}

function Tarjeta({ k, children }: { k: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <span className="mb-2 block font-mono text-xs font-bold uppercase tracking-wider text-primary">
        {k}
      </span>
      <p className="text-sm text-foreground">{children}</p>
    </div>
  )
}

function Chip({ children, tono }: { children: ReactNode; tono?: 'primary' }) {
  return (
    <span
      className={
        tono === 'primary'
          ? 'rounded-full bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground'
          : 'rounded-full border border-border bg-card px-3 py-1.5 text-sm font-semibold text-salvia-600'
      }
    >
      {children}
    </span>
  )
}

function TablaRoles({ filas }: { filas: string[][] }) {
  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-border">
      <dl className="divide-y divide-border">
        {filas.map(([rol, desc]) => (
          <div key={rol} className="grid gap-1 p-4 sm:grid-cols-[190px_1fr] sm:gap-4">
            <dt className="text-sm font-semibold text-foreground">{rol}</dt>
            <dd className="text-sm text-muted-foreground">{desc}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
