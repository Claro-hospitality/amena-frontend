import { lazy, Suspense, type ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { Skeleton } from '@amena/ui/components/ui/skeleton'
import { InicioPorTipo } from './auth/InicioPorTipo'
import { RutaProtegida } from './auth/RutaProtegida'
import { RutaErrorBoundary } from './components/RutaErrorBoundary'
import { LoginPage } from './features/auth/LoginPage'
import { SinAccesoPage } from './features/auth/SinAccesoPage'
import { EmpresaLayout } from './features/empresa/EmpresaLayout'
import { InicioPage } from './features/inicio/InicioPage'

const ColaboradoresPage = lazy(() =>
  import('./features/colaboradores/ColaboradoresPage').then((m) => ({
    default: m.ColaboradoresPage,
  }))
)
const CuotasSemanaPage = lazy(() =>
  import('./features/cuotas/CuotasSemanaPage').then((m) => ({ default: m.CuotasSemanaPage }))
)
const ReservarCuotasPage = lazy(() =>
  import('./features/cuotas/ReservarCuotasPage').then((m) => ({ default: m.ReservarCuotasPage }))
)
const MiCredencialPage = lazy(() =>
  import('./features/colaborador/MiCredencialPage').then((m) => ({ default: m.MiCredencialPage }))
)
const MenuPage = lazy(() =>
  import('./features/colaborador/MenuSemanal').then((m) => ({ default: m.MenuSemanal }))
)
const CortesPage = lazy(() =>
  import('./features/cortes/CortesPage').then((m) => ({ default: m.CortesPage }))
)
const EmpresaGeneralPage = lazy(() =>
  import('./features/empresa/EmpresaGeneralPage').then((m) => ({ default: m.EmpresaGeneralPage }))
)
const FacturasEmpresaPage = lazy(() =>
  import('./features/facturas/FacturasEmpresaPage').then((m) => ({
    default: m.FacturasEmpresaPage,
  }))
)
const MiCuentaPage = lazy(() =>
  import('./features/cuenta/MiCuentaPage').then((m) => ({ default: m.MiCuentaPage }))
)

function CargandoRuta() {
  return (
    <div className="p-4 md:p-6">
      <Skeleton className="h-64 w-full" />
    </div>
  )
}

/** Envuelve una ruta perezosa con su ErrorBoundary + Suspense. */
function Ruta({ children }: { children: ReactNode }) {
  return (
    <RutaErrorBoundary>
      <Suspense fallback={<CargandoRuta />}>{children}</Suspense>
    </RutaErrorBoundary>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/sin-acceso" element={<SinAccesoPage />} />

      {/* Todo lo demás es privado: RutaProtegida exige sesión + acceso, y "/" redirige por tipo. */}
      <Route element={<RutaProtegida />}>
        <Route index element={<InicioPorTipo />} />

        {/* Comunes a colaborador y admin (todo usuario es primero comensal). */}
        <Route path="inicio" element={<InicioPage />} />
        <Route path="menu" element={<Ruta><MenuPage /></Ruta>} />
        <Route path="mi-qr" element={<Ruta><MiCredencialPage /></Ruta>} />
        <Route path="mi-cuenta" element={<Ruta><MiCuentaPage /></Ruta>} />

        {/* Gestión de empresa (solo admin): agrupador con subnav interna. */}
        <Route path="empresa" element={<EmpresaLayout />}>
          <Route index element={<Ruta><EmpresaGeneralPage /></Ruta>} />
          <Route path="colaboradores" element={<Ruta><ColaboradoresPage /></Ruta>} />
          <Route path="cuotas" element={<Ruta><CuotasSemanaPage /></Ruta>} />
          <Route path="cuotas/reservar" element={<Ruta><ReservarCuotasPage /></Ruta>} />
          <Route path="cortes" element={<Ruta><CortesPage /></Ruta>} />
          <Route path="facturas" element={<Ruta><FacturasEmpresaPage /></Ruta>} />
          {/* La sección se llamó "cierres": redirige el link viejo dentro de Empresa. */}
          <Route path="cierres" element={<Navigate to="/empresa/cortes" replace />} />
        </Route>

        {/* Redirecciones de rutas viejas (bookmarks, correos, enlaces guardados). */}
        <Route path="historial" element={<Navigate to="/mi-qr" replace />} />
        <Route path="colaboradores" element={<Navigate to="/empresa/colaboradores" replace />} />
        <Route path="cuotas" element={<Navigate to="/empresa/cuotas" replace />} />
        <Route path="cuotas/reservar" element={<Navigate to="/empresa/cuotas/reservar" replace />} />
        <Route path="cierres" element={<Navigate to="/empresa/cortes" replace />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
