import type { ReactNode } from 'react'
import { LogotipoAmena } from '@amena/ui/components/logotipo-amena'

/**
 * Página PÚBLICA (sin sesión) con el reporte del sistema Amena, para compartir por enlace
 * (backoffice.amena.social/reporte). Layout autocontenido (sin el shell del backoffice) con la
 * identidad de marca: tokens del tema (crema/naranja/salvia/tinta), tipografía Geist y el
 * logotipo. Solo lectura, sin datos de servidor.
 */
export function ReporteSistemaPage() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <BarraSuperior />
      <main className="mx-auto w-full max-w-5xl px-5 sm:px-8">
        <Hero />
        <QueEs />
        <Actores />
        <Conceptos />
        <Productos />
        <Flujos />
        <Arquitectura />
        <Integraciones />
        <Estado />
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
        <div className="flex items-center gap-2.5">
          <LogotipoAmena className="h-5 w-auto text-primary" />
          <span className="hidden text-xs font-medium uppercase tracking-widest text-muted-foreground sm:inline">
            Reporte del sistema
          </span>
        </div>
        <nav className="hidden gap-1 md:flex" aria-label="Secciones del reporte">
          {[
            ['#que-es', 'Qué es'],
            ['#actores', 'Roles'],
            ['#productos', 'Productos'],
            ['#flujos', 'Flujos'],
            ['#arquitectura', 'Arquitectura'],
            ['#estado', 'Estado'],
          ].map(([href, label]) => (
            <a
              key={href}
              href={href}
              className="rounded-lg px-2.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              {label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  )
}

function Hero() {
  return (
    <section className="py-14 sm:py-20">
      <Eyebrow>Plataforma de alimentación corporativa</Eyebrow>
      <h1 className="mt-4 text-5xl font-bold tracking-tight text-balance sm:text-7xl">
        Amena<span className="text-primary">.</span>
      </h1>
      <p className="mt-3 text-lg font-semibold tracking-tight text-salvia-600 sm:text-2xl">
        Reservar, comer y facturar — el comedor corporativo, ordenado de punta a punta.
      </p>
      <p className="mt-6 max-w-2xl text-pretty text-base text-foreground sm:text-lg">
        Amena es el sistema del restaurante que opera dentro del edificio <strong>Mutuo Vive</strong>{' '}
        (Guadalajara). Conecta a las empresas del edificio con el comedor: cada semana{' '}
        <strong>reservan</strong> las comidas de su gente, el mesero las <strong>registra</strong> con
        un escaneo de QR, y al cierre el sistema genera un <strong>corte</strong> que se convierte en{' '}
        <strong>factura fiscal (CFDI)</strong>. Dos aplicaciones web sobre una base de datos segura.
      </p>
      <div className="mt-7 flex flex-wrap gap-2">
        <Chip tono="primary">En producción</Chip>
        <Chip>Comedor · Mutuo Vive, GDL</Chip>
        <Chip>Multi-empresa</Chip>
        <Chip>CFDI 4.0 · Facturama</Chip>
        <Chip>Supabase + React</Chip>
      </div>
    </section>
  )
}

function QueEs() {
  return (
    <Seccion id="que-es" num="01" titulo="Qué es y para qué sirve">
      <div className="grid gap-4 sm:grid-cols-2">
        <Tarjeta k="El problema">
          Las empresas de Mutuo Vive quieren dar de comer a su gente en Amena, pero no había forma de
          coordinar <strong>cuántos comen</strong>, <strong>controlar el acceso</strong> en la fila y{' '}
          <strong>facturar bien</strong>. Todo era manual y sin trazabilidad.
        </Tarjeta>
        <Tarjeta k="La solución">
          Una plataforma que integra reserva de comidas, validación por QR en el punto de servicio,
          cortes de consumo semanales y timbrado fiscal ante el SAT — con frontera estricta por empresa.
        </Tarjeta>
        <Tarjeta k="Alcance V1">
          Solo empresas <strong>con convenio</strong>. Los clientes de paso quedan fuera por ahora. Un
          edificio (Mutuo Vive). Web primero; app móvil y auto-registro son fases futuras.
        </Tarjeta>
        <Tarjeta k="Cómo cobra Amena">
          Un <strong>precio por comida</strong> pactado con cada empresa (configurable y{' '}
          <strong>congelado</strong> en cada corte). Ciclo de facturación <strong>semanal o mensual</strong>.
        </Tarjeta>
      </div>
    </Seccion>
  )
}

function Actores() {
  const backoffice = [
    ['super_admin', 'Control total: empresas, menú, usuarios, configuración, cortes y facturación.'],
    ['finanzas', 'Consulta consumos, cortes y facturas; emite facturas. Sin edición operativa.'],
    ['mesero', 'Opera el escáner: valida el QR y registra el consumo.'],
    ['capitan_meseros', 'Opera el escáner y consulta platillos y menú (lectura).'],
    ['consulta', 'Solo lectura de lo operativo. Garantizado a nivel de base: cero escritura.'],
  ]
  const portal = [
    ['admin de empresa', 'Da de alta a su equipo, reserva cuotas, edita sus datos fiscales y ve sus cortes y facturas.'],
    ['colaborador', 'Es quien come. Ve su credencial QR, el menú y su historial de comidas.'],
  ]
  return (
    <Seccion id="actores" num="02" titulo="Actores y roles">
      <p className="mb-6 max-w-2xl text-muted-foreground">
        Quién usa Amena y qué puede hacer cada quien. Los permisos no son solo de pantalla: viven en la
        base de datos (RLS), y una empresa jamás ve los datos de otra.
      </p>
      <h3 className="mb-3 text-base font-semibold">Personal de Amena — Backoffice</h3>
      <TablaRoles filas={backoffice} />
      <h3 className="mb-3 mt-8 text-base font-semibold">Empresas cliente — Portal</h3>
      <TablaRoles filas={portal} />
    </Seccion>
  )
}

function Conceptos() {
  const defs: [string, ReactNode][] = [
    ['Comensal vs. Colaborador', <><strong>Colaborador</strong> es un rol del portal (una persona con acceso). <strong>Comensal</strong> es la entidad que realmente come (cuotas, consumos y QR). Al dar de alta a un colaborador se crea su comensal y su QR.</>],
    ['Empresa', <>Compañía con convenio. Define su precio por comida, ciclo de facturación, modo de consumo, días permitidos y límite diario.</>],
    ['Cuota', <>Una comida asignada a un comensal para una fecha. Es el <strong>derecho a comer</strong> ese día en modo reserva. Origen <em>reserva</em> (declarada) o <em>extra</em>.</>],
    ['Consumo', <>El registro real e <strong>inmutable</strong> de una comida (al escanear el QR o a mano). Base de la facturación; se conserva aunque cambie el rol o la empresa.</>],
    ['Credencial QR', <>Código del comensal con un token aleatorio (no adivinable), nunca el id interno. Se puede revocar sin perder el historial.</>],
    ['Modo reserva vs. libre', <><strong>Reserva</strong>: solo con cuota, máx. una comida/día. <strong>Libre</strong>: sin cuota previa, dentro de los días permitidos y hasta un límite diario.</>],
    ['Corte semanal', <>Resumen contable inmutable por empresa y semana: reservadas, extras, consumidas y monto (precio congelado). Es lo que se factura.</>],
    ['Datos fiscales', <>RFC, razón social, régimen, uso de CFDI, CP y correo de facturación de cada empresa. Obligatorios para emitir factura.</>],
  ]
  return (
    <Seccion id="conceptos" num="03" titulo="Conceptos del dominio">
      <div className="grid gap-3 sm:grid-cols-2">
        {defs.map(([t, d]) => (
          <div key={t} className="rounded-2xl border border-border bg-card p-5">
            <p className="font-semibold tracking-tight">{t}</p>
            <p className="mt-1.5 text-sm text-muted-foreground">{d}</p>
          </div>
        ))}
      </div>
    </Seccion>
  )
}

function Productos() {
  return (
    <Seccion id="productos" num="04" titulo="Los dos productos">
      <p className="mb-6 max-w-2xl text-muted-foreground">
        Amena son dos aplicaciones web sobre la misma base de datos: una para el personal de Amena, otra
        para las empresas.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5">
          <Mono>backoffice.amena.social</Mono>
          <h3 className="mt-1 text-lg font-semibold">Backoffice</h3>
          <p className="mb-3 text-sm text-muted-foreground">Consola del equipo interno.</p>
          <Lista items={[
            'Escáner — valida el QR y registra el consumo; registro manual y contador del turno en vivo.',
            'Empresas — alta, edición, datos fiscales y política de consumo.',
            'Platillos y Menú semanal (lun–vie).',
            'Consumos — historial con filtros y gráficas.',
            'Cortes — desglose, facturar y descargar PDF+XML.',
            'Usuarios y Configuración (día de corte, facturación).',
          ]} />
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <Mono>portal-empresarial.amena.social</Mono>
          <h3 className="mt-1 text-lg font-semibold">Portal empresarial</h3>
          <p className="mb-3 text-sm text-muted-foreground">Para admins y colaboradores.</p>
          <Lista items={[
            'Inicio — cuota de hoy y acceso al QR.',
            'Menú de la semana.',
            'Mi QR — credencial e historial personal.',
            'Empresa: General (datos + edición fiscal), Colaboradores, Cuotas, Cortes, Facturas.',
            'Mi cuenta — cambio de contraseña.',
          ]} />
        </div>
      </div>

      <h3 className="mb-3 mt-8 text-base font-semibold">Matriz de acceso — Backoffice</h3>
      <MatrizAcceso />
    </Seccion>
  )
}

function Flujos() {
  const pasos: { n: string; alt?: boolean; t: string; d: ReactNode; who: string }[] = [
    { n: '1', t: 'Reserva semanal', who: 'Admin de empresa · reservar_cuotas', d: <>Cada viernes el admin declara desde el portal cuántas comidas quiere la semana siguiente. Se validan personas y fechas, y se crean las <strong>cuotas</strong>. Durante la semana puede agregar <strong>extras</strong>.</> },
    { n: '2', t: 'Validación en el comedor (QR)', who: 'Mesero · registrar_consumo', d: <>El mesero escanea el QR desde una tablet. En una operación segura valida que la persona pueda comer hoy y registra el <strong>consumo</strong>; si no puede, muestra el motivo. Un lock evita dobles cobros.</> },
    { n: '3', t: 'Corte semanal', who: 'Automático (cron) · corte-semanal', d: <>Al cierre (por defecto domingo) se genera el <strong>corte</strong> de cada empresa: reservadas, extras y consumidas, con el <strong>precio congelado</strong>. Idempotente y también manual.</> },
    { n: '4', alt: true, t: 'Facturación (CFDI 4.0)', who: 'Finanzas / super_admin · facturar-corte', d: <>Desde el corte se emite la factura: se arma el CFDI, se <strong>timbra ante el SAT vía Facturama</strong>, y se guardan PDF y XML. La empresa los ve y descarga desde su portal.</> },
  ]
  return (
    <Seccion id="flujos" num="05" titulo="El flujo de negocio, paso a paso">
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
              <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-primary">{p.who}</p>
            </div>
          </div>
        ))}
      </div>
    </Seccion>
  )
}

function Arquitectura() {
  const cards: [string, ReactNode][] = [
    ['Frontend', <>Monorepo <strong>pnpm + Turborepo</strong> con dos apps <strong>React 19 + Vite + Tailwind 4</strong> y paquetes compartidos. Datos con TanStack Query; deploy en Firebase Hosting.</>],
    ['Backend', <>Todo en <strong>Supabase</strong>: PostgreSQL con migraciones, funciones, Edge Functions (Deno), Auth, Realtime y Storage. Tests con pgTAP y Deno.</>],
    ['Seguridad', <><strong>RLS en todas las tablas</strong>: frontera multi-empresa en la base. Las Edge Functions autorizan por rol, no solo por sesión.</>],
    ['Tiempo real', <>La tabla de consumos publica cambios por <strong>Realtime</strong>: el panel del mesero se actualiza solo, respetando RLS.</>],
    ['Automatización', <><strong>pg_cron</strong> dispara el corte a diario; folios de factura serializados para no duplicar.</>],
    ['Almacenamiento', <>Buckets de <strong>Storage</strong>: fotos de platillos (público) y facturas PDF/XML (privado, cada empresa solo las suyas).</>],
  ]
  return (
    <Seccion id="arquitectura" num="06" titulo="Arquitectura técnica">
      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map(([k, d]) => (
          <Tarjeta key={k} k={k}>{d}</Tarjeta>
        ))}
      </div>
      <div className="mt-4 rounded-2xl border border-l-[3px] border-border border-l-primary bg-secondary/40 p-5 text-sm">
        <strong>Decisiones clave:</strong> datos históricos <em>inmutables</em> (consumos y cortes) para
        que la facturación nunca se corrompa; borrado siempre <em>lógico</em>; identidad separada de la
        entidad de negocio (comensal), de modo que revocar un acceso no rompe el historial.
      </div>
    </Seccion>
  )
}

function Integraciones() {
  return (
    <Seccion id="integraciones" num="07" titulo="Integraciones y motor interno">
      <div className="grid gap-4 sm:grid-cols-2">
        <Tarjeta k="Facturama — CFDI 4.0">
          Timbrado fiscal ante el SAT. Arma el comprobante (IVA incluido), timbra, obtiene el UUID y
          descarga PDF/XML. Ambientes sandbox y producción.
        </Tarjeta>
        <Tarjeta k="Postmark — Correo">
          Correos transaccionales: invitaciones y credenciales de acceso. Cada envío queda auditado.
        </Tarjeta>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <Tarjeta k="Edge Functions">
          <Lista compact items={['facturar-corte', 'corte-semanal', 'enviar-correo', 'alta-usuario (backoffice / portal)', 'restablecer / resetear acceso']} />
        </Tarjeta>
        <Tarjeta k="Tablas núcleo">
          <Lista compact items={['empresas · datos_fiscales', 'comensales · credenciales_qr', 'cuotas · consumos', 'cortes_semanales · facturas']} />
        </Tarjeta>
        <Tarjeta k="Funciones clave">
          <Lista compact items={['registrar_consumo', 'reservar_cuotas / cuota_disponible', 'generar_corte_semanal', 'siguiente_folio_dia']} />
        </Tarjeta>
      </div>
    </Seccion>
  )
}

function Estado() {
  return (
    <Seccion id="estado" num="08" titulo="Estado y hoja de ruta">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5">
          <span className="mb-3 inline-block rounded-full bg-success px-2.5 py-1 text-xs font-semibold text-success-foreground">
            En producción hoy
          </span>
          <Lista items={[
            'Backoffice y portal desplegados contra Supabase Cloud.',
            'Escáner con QR y registro manual; consumos en vivo.',
            'Reserva de cuotas, extras y menú semanal.',
            'Corte automático diario y generación manual.',
            'Facturación CFDI 4.0 con Facturama; PDF/XML.',
            'Gestión de usuarios por invitación (correos con Postmark).',
          ]} />
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <span className="mb-3 inline-block rounded-full bg-warning/15 px-2.5 py-1 text-xs font-semibold text-warning-foreground">
            Fuera de alcance V1 / futuro
          </span>
          <Lista items={[
            'App móvil para colaboradores y admins.',
            'Auto-registro de colaboradores por código.',
            'Otros edificios además de Mutuo Vive.',
            'Clientes de paso (walk-in) sin convenio.',
            'Factura mensual consolidada.',
            'Cancelación y complemento de pago.',
          ]} />
        </div>
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
          <span>Planes de alimentación corporativa · Mutuo Vive, Guadalajara</span>
        </div>
        <span>Reporte del sistema — resumen ejecutivo.</span>
      </div>
    </footer>
  )
}

/* ---------------- Piezas reutilizables ---------------- */

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs font-bold uppercase tracking-widest text-primary">{children}</p>
  )
}

function Seccion({ id, num, titulo, children }: { id: string; num: string; titulo: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-20 border-t border-border py-12 sm:py-16">
      <div className="mb-7">
        <span className="font-mono text-sm font-semibold text-primary">{num}</span>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight text-balance sm:text-3xl">{titulo}</h2>
      </div>
      {children}
    </section>
  )
}

function Tarjeta({ k, children }: { k: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <span className="mb-2 block font-mono text-xs font-bold uppercase tracking-wider text-primary">{k}</span>
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

function Mono({ children }: { children: ReactNode }) {
  return <span className="font-mono text-xs font-bold uppercase tracking-wider text-primary">{children}</span>
}

function Lista({ items, compact }: { items: string[]; compact?: boolean }) {
  return (
    <ul className={compact ? 'flex flex-col gap-1.5' : 'flex flex-col gap-2'}>
      {items.map((it) => (
        <li key={it} className="relative pl-5 text-sm text-foreground">
          <span className="absolute left-0 top-2 size-1.5 rounded-sm bg-salvia-500" aria-hidden />
          {it}
        </li>
      ))}
    </ul>
  )
}

function TablaRoles({ filas }: { filas: string[][] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <dl className="divide-y divide-border">
        {filas.map(([rol, desc]) => (
          <div key={rol} className="grid gap-1 p-4 sm:grid-cols-[180px_1fr] sm:gap-4">
            <dt className="font-mono text-sm font-semibold text-foreground">{rol}</dt>
            <dd className="text-sm text-muted-foreground">{desc}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

function MatrizAcceso() {
  const cols = ['super_admin', 'finanzas', 'mesero', 'capitán', 'consulta']
  const filas: [string, string[]][] = [
    ['Escáner', ['si', 'no', 'si', 'si', 'no']],
    ['Empresas', ['si', 'ro', 'no', 'no', 'ro']],
    ['Platillos / Menú', ['si', 'no', 'no', 'ro', 'ro']],
    ['Consumos', ['si', 'si', 'no', 'no', 'si']],
    ['Cortes', ['si', 'si', 'no', 'no', 'ro']],
    ['Facturación', ['si', 'si', 'no', 'no', 'no']],
    ['Usuarios', ['si', 'no', 'no', 'no', 'no']],
    ['Configuración', ['si', 'no', 'no', 'no', 'no']],
  ]
  const celda = (v: string) =>
    v === 'si' ? (
      <span className="font-semibold text-success-foreground">✓</span>
    ) : v === 'ro' ? (
      <span className="text-xs font-medium text-salvia-600">lectura</span>
    ) : (
      <span className="text-muted-foreground">—</span>
    )
  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-card">
      <table className="w-full min-w-[560px] border-collapse text-sm">
        <thead>
          <tr className="bg-secondary/50">
            <th className="p-3 text-left text-xs font-bold uppercase tracking-wide text-salvia-700">Sección</th>
            {cols.map((c) => (
              <th key={c} className="p-3 text-left text-xs font-bold uppercase tracking-wide text-salvia-700">{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filas.map(([sec, vals], i) => (
            <tr key={sec} className={i > 0 ? 'border-t border-border' : ''}>
              <td className="p-3 font-medium">{sec}</td>
              {vals.map((v, j) => (
                <td key={j} className="p-3">{celda(v)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
