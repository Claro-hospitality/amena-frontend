import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes, useOutletContext } from 'react-router-dom'
import { Skeleton } from '@amena/ui/components/ui/skeleton'
import { InicioPorTipo } from './auth/InicioPorTipo'
import { RutaProtegida } from './auth/RutaProtegida'
import type { ContextoAcceso } from './auth/validarAccesoPortal'
import { RutaErrorBoundary } from './components/RutaErrorBoundary'
import { LoginPage } from './features/auth/LoginPage'
import { SinAccesoPage } from './features/auth/SinAccesoPage'
import { InicioPage } from './features/inicio/InicioPage'

const ColaboradoresPage = lazy(() =>
  import('./features/colaboradores/ColaboradoresPage').then((m) => ({
    default: m.ColaboradoresPage,
  }))
)
const CuotasSemanaPage = lazy(() =>
  import('./features/cuotas/CuotasSemanaPage').then((m) => ({ default: m.CuotasSemanaPage }))
)
const DeclararCuotasPage = lazy(() =>
  import('./features/cuotas/DeclararCuotasPage').then((m) => ({ default: m.DeclararCuotasPage }))
)
const InicioColaboradorPage = lazy(() =>
  import('./features/colaborador/InicioColaboradorPage').then((m) => ({
    default: m.InicioColaboradorPage,
  }))
)
const MenuColaboradorPage = lazy(() =>
  import('./features/colaborador/MenuColaboradorPage').then((m) => ({
    default: m.MenuColaboradorPage,
  }))
)
const HistorialPage = lazy(() =>
  import('./features/colaborador/HistorialPage').then((m) => ({ default: m.HistorialPage }))
)
const CierresPage = lazy(() =>
  import('./features/cierres/CierresPage').then((m) => ({ default: m.CierresPage }))
)

/** /inicio despacha por tipo: el colaborador ve su espacio; el admin, su panel. */
function InicioRouter() {
  const { tipo } = useOutletContext<ContextoAcceso>()
  if (tipo === 'colaborador') {
    return (
      <RutaErrorBoundary>
        <Suspense fallback={<CargandoRuta />}>
          <InicioColaboradorPage />
        </Suspense>
      </RutaErrorBoundary>
    )
  }
  return <InicioPage />
}

function CargandoRuta() {
  return (
    <div className="p-4 md:p-6">
      <Skeleton className="h-64 w-full" />
    </div>
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
        <Route path="inicio" element={<InicioRouter />} />
        <Route
          path="colaboradores"
          element={
            <RutaErrorBoundary>
              <Suspense fallback={<CargandoRuta />}>
                <ColaboradoresPage />
              </Suspense>
            </RutaErrorBoundary>
          }
        />
        <Route
          path="cuotas"
          element={
            <RutaErrorBoundary>
              <Suspense fallback={<CargandoRuta />}>
                <CuotasSemanaPage />
              </Suspense>
            </RutaErrorBoundary>
          }
        />
        <Route
          path="cuotas/declarar"
          element={
            <RutaErrorBoundary>
              <Suspense fallback={<CargandoRuta />}>
                <DeclararCuotasPage />
              </Suspense>
            </RutaErrorBoundary>
          }
        />
        <Route
          path="cierres"
          element={
            <RutaErrorBoundary>
              <Suspense fallback={<CargandoRuta />}>
                <CierresPage />
              </Suspense>
            </RutaErrorBoundary>
          }
        />
        <Route
          path="menu"
          element={
            <RutaErrorBoundary>
              <Suspense fallback={<CargandoRuta />}>
                <MenuColaboradorPage />
              </Suspense>
            </RutaErrorBoundary>
          }
        />
        <Route
          path="historial"
          element={
            <RutaErrorBoundary>
              <Suspense fallback={<CargandoRuta />}>
                <HistorialPage />
              </Suspense>
            </RutaErrorBoundary>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
