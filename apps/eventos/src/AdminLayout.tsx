import { useEffect, useState, type ReactNode } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import type { Session } from '@supabase/supabase-js'
import {
  ArrowLeft,
  Bell,
  CalendarDays,
  ExternalLink,
  FileText,
  Hash,
  LayoutDashboard,
  LogOut,
  Menu,
  QrCode,
  ScanLine,
  Ticket,
  Users,
  X,
} from 'lucide-react'
import { cn } from './lib/utils'
import { getAdminSession, logoutAdmin, onAdminAuthChange } from './lib/admin-auth'

// El admin vive en su propio sitio, así que el enlace al sitio público es absoluto.
const SITIO_PUBLICO_URL = import.meta.env.VITE_SITIO_PUBLICO_URL ?? 'https://amena.social'

export function RequireAdminAuth({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<'cargando' | 'autenticado' | 'no-autenticado'>('cargando')

  useEffect(() => {
    getAdminSession().then((session) => setEstado(session ? 'autenticado' : 'no-autenticado'))
    return onAdminAuthChange((session) => setEstado(session ? 'autenticado' : 'no-autenticado'))
  }, [])

  if (estado === 'cargando') {
    return <div className="flex min-h-dvh items-center justify-center bg-background text-sm text-muted-foreground">Cargando…</div>
  }
  if (estado === 'no-autenticado') {
    return <Navigate to="/admin/login" replace />
  }
  return <>{children}</>
}

const NAV_OPERACION = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/eventos', label: 'Eventos', icon: Ticket },
  { to: '/admin/reservaciones', label: 'Reservaciones', icon: Users },
  { to: '/admin/escanear', label: 'Escanear boleto', icon: QrCode },
]

const NAV_FACTURACION = [
  { label: 'Facturas emitidas', icon: FileText },
  { label: 'Códigos de consumo', icon: Hash },
]

const TABS_M = [
  { to: '/admin', label: 'Inicio', icon: LayoutDashboard },
  { to: '/admin/eventos', label: 'Eventos', icon: CalendarDays },
  { to: '/admin/reservaciones', label: 'Reservas', icon: Ticket },
  { to: '/admin/escanear', label: 'Escanear', icon: ScanLine },
]

function esActivo(pathname: string, to: string) {
  return to === '/admin' ? pathname === '/admin' : pathname.startsWith(to)
}

function perfilDeSesion(session: Session | null) {
  const email = session?.user.email ?? ''
  const metaNombre = (session?.user.user_metadata?.full_name || session?.user.user_metadata?.name) as
    | string
    | undefined
  const nombre = metaNombre || (email ? email.split('@')[0] : 'Admin')
  const iniciales =
    nombre
      .split(/[\s._-]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join('') || 'A'
  return { email, nombre, iniciales }
}

async function cerrarSesion() {
  await logoutAdmin()
  window.location.assign('/admin/login')
}

export function AdminLayout({
  title,
  subtitle,
  actions,
  backTo,
  children,
}: {
  title: string
  subtitle?: string
  actions?: ReactNode
  backTo?: string
  children: ReactNode
}) {
  const location = useLocation()
  const [drawerAbierto, setDrawerAbierto] = useState(false)
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    getAdminSession().then(setSession)
    return onAdminAuthChange(setSession)
  }, [])

  const perfil = perfilDeSesion(session)

  return (
    <div className="flex min-h-dvh bg-background text-foreground">
      <aside className="hidden w-64 shrink-0 flex-col justify-between border-r border-border bg-card px-4 py-6 lg:flex">
        <div className="flex flex-col gap-8">
          <div className="flex items-center gap-2 px-2">
            <span className="text-lg font-bold text-primary">amena</span>
            <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Admin
            </span>
          </div>

          <nav className="flex flex-col gap-1">
            <p className="px-2 pb-1 font-mono text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
              Operación
            </p>
            {NAV_OPERACION.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  esActivo(location.pathname, item.to)
                    ? 'bg-secondary text-foreground'
                    : 'text-muted-foreground hover:bg-secondary/60'
                )}
              >
                <item.icon className="size-4.5" />
                {item.label}
              </Link>
            ))}

            <p className="px-2 pb-1 pt-4 font-mono text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
              Facturación
            </p>
            {NAV_FACTURACION.map((item) => (
              <span
                key={item.label}
                title="Próximamente"
                className="flex cursor-not-allowed items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground/50"
              >
                <item.icon className="size-4.5" />
                {item.label}
              </span>
            ))}
          </nav>
        </div>

        <div className="flex flex-col gap-3 border-t border-border pt-4">
          <div className="flex items-center gap-2.5 px-2">
            <span className="flex size-8 items-center justify-center rounded-full bg-naranja-100 text-xs font-bold text-naranja-700">
              {perfil.iniciales}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium capitalize">{perfil.nombre}</p>
              <p className="truncate text-xs text-muted-foreground">{perfil.email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={cerrarSesion}
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary/60"
          >
            <LogOut className="size-4" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {drawerAbierto && (
        <AdminMenuLateralM pathname={location.pathname} perfil={perfil} onClose={() => setDrawerAbierto(false)} />
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="hidden items-center justify-between border-b border-border px-8 py-5 lg:flex">
          <div>
            <h1 className="text-xl font-bold">{title}</h1>
            {subtitle && <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>}
          </div>
          {actions}
        </header>

        <div className="lg:hidden">
          {backTo ? (
            <AdminTopbarM title={title} subtitle={subtitle} backTo={backTo} />
          ) : (
            <AdminTopbarM
              title={title}
              subtitle={subtitle}
              iniciales={perfil.iniciales}
              onMenu={() => setDrawerAbierto(true)}
            />
          )}
        </div>

        <main className={cn('flex-1 overflow-y-auto px-5 py-6 lg:px-8', !backTo && 'pb-24 lg:pb-6')}>
          {children}
        </main>

        {!backTo && (
          <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-border bg-card lg:hidden">
            {TABS_M.map((tab) => (
              <Link
                key={tab.to}
                to={tab.to}
                className={cn(
                  'flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-medium',
                  esActivo(location.pathname, tab.to) ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                <tab.icon className="size-5" />
                {tab.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </div>
  )
}

function AdminTopbarM({
  title,
  subtitle,
  iniciales,
  onMenu,
  backTo,
}: {
  title: string
  subtitle?: string
  iniciales?: string
  onMenu?: () => void
  backTo?: string
}) {
  return (
    <header className="flex items-center justify-between border-b border-border bg-background/80 px-4 py-3 backdrop-blur-xl">
      {backTo ? (
        <Link to={backTo} className="flex size-9 items-center justify-center rounded-full hover:bg-secondary/60">
          <ArrowLeft className="size-5" />
        </Link>
      ) : (
        <button
          type="button"
          onClick={onMenu}
          className="flex size-9 items-center justify-center rounded-full hover:bg-secondary/60"
        >
          <Menu className="size-5" />
        </button>
      )}
      <div className="min-w-0 flex-1 px-2 text-center">
        <p className="truncate text-sm font-semibold">{title}</p>
        {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      {!backTo ? (
        <div className="flex items-center gap-1">
          <span className="flex size-9 items-center justify-center rounded-full text-muted-foreground">
            <Bell className="size-4.5" />
          </span>
          <span className="flex size-8 items-center justify-center rounded-full bg-naranja-100 text-xs font-bold text-naranja-700">
            {iniciales ?? ''}
          </span>
        </div>
      ) : (
        <span className="size-9" />
      )}
    </header>
  )
}

function AdminMenuLateralM({
  pathname,
  perfil,
  onClose,
}: {
  pathname: string
  perfil: { email: string; nombre: string; iniciales: string }
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex lg:hidden">
      <div className="absolute inset-0 bg-tinta-900/50" onClick={onClose} />
      <div className="relative flex w-72 flex-col justify-between bg-card px-4 py-6">
        <div className="flex flex-col gap-8">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-primary">amena</span>
              <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Admin
              </span>
            </div>
            <button type="button" onClick={onClose} className="flex size-8 items-center justify-center rounded-full hover:bg-secondary/60">
              <X className="size-4.5" />
            </button>
          </div>

          <div className="flex items-center gap-2.5 px-2">
            <span className="flex size-9 items-center justify-center rounded-full bg-naranja-100 text-xs font-bold text-naranja-700">
              {perfil.iniciales}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium capitalize">{perfil.nombre}</p>
              <p className="truncate text-xs text-muted-foreground">{perfil.email}</p>
            </div>
          </div>

          <nav className="flex flex-col gap-1">
            <p className="px-2 pb-1 font-mono text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
              Operación
            </p>
            {NAV_OPERACION.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  esActivo(pathname, item.to) ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:bg-secondary/60'
                )}
              >
                <item.icon className="size-4.5" />
                {item.label}
              </Link>
            ))}

            <p className="px-2 pb-1 pt-4 font-mono text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
              Facturación
            </p>
            {NAV_FACTURACION.map((item) => (
              <span
                key={item.label}
                title="Próximamente"
                className="flex cursor-not-allowed items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground/50"
              >
                <item.icon className="size-4.5" />
                {item.label}
              </span>
            ))}
          </nav>
        </div>

        <div className="flex flex-col gap-1 border-t border-border pt-4">
          <a
            href={SITIO_PUBLICO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary/60"
          >
            <ExternalLink className="size-4" />
            Ver sitio
          </a>
          <button
            type="button"
            onClick={cerrarSesion}
            className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary/60"
          >
            <LogOut className="size-4" />
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  )
}
