import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { Skeleton } from '@amena/ui/components/ui/skeleton'
import { InicioPorRol } from './auth/InicioPorRol'
import { RutaProtegida } from './auth/RutaProtegida'
import { RutaErrorBoundary } from './components/RutaErrorBoundary'
import { LoginPage } from './features/auth/LoginPage'
import { SinAccesoPage } from './features/auth/SinAccesoPage'
import { InicioPage } from './features/inicio/InicioPage'

const EmpresasPage = lazy(() =>
  import('./features/empresas/EmpresasPage').then((m) => ({ default: m.EmpresasPage }))
)
const ConfigurarEmpresaPage = lazy(() =>
  import('./features/empresas/ConfigurarEmpresaPage').then((m) => ({
    default: m.ConfigurarEmpresaPage,
  }))
)
const EmpresaDetallePage = lazy(() =>
  import('./features/empresas/EmpresaDetallePage').then((m) => ({
    default: m.EmpresaDetallePage,
  }))
)
const PlatillosPage = lazy(() =>
  import('./features/platillos/PlatillosPage').then((m) => ({ default: m.PlatillosPage }))
)
const MenuSemanalPage = lazy(() =>
  import('./features/menu/MenuSemanalPage').then((m) => ({ default: m.MenuSemanalPage }))
)
const ConsumosPage = lazy(() =>
  import('./features/consumos/ConsumosPage').then((m) => ({ default: m.ConsumosPage }))
)
const EscanerPage = lazy(() =>
  import('./features/escaner/EscanerPage').then((m) => ({ default: m.EscanerPage }))
)
const CortesPage = lazy(() =>
  import('./features/cortes/CortesPage').then((m) => ({ default: m.CortesPage }))
)
const FacturasPage = lazy(() =>
  import('./features/facturas/FacturasPage').then((m) => ({ default: m.FacturasPage }))
)
const ConfiguracionPage = lazy(() =>
  import('./features/configuracion/ConfiguracionPage').then((m) => ({
    default: m.ConfiguracionPage,
  }))
)
const ComponentesPage = lazy(() =>
  import('./features/desarrollo/ComponentesPage').then((m) => ({ default: m.ComponentesPage }))
)
const BrandingPage = lazy(() =>
  import('./features/desarrollo/BrandingPage').then((m) => ({ default: m.BrandingPage }))
)
const UsuariosPage = lazy(() =>
  import('./features/usuarios/UsuariosPage').then((m) => ({ default: m.UsuariosPage }))
)
const MiPerfilPage = lazy(() =>
  import('./features/cuenta/MiPerfilPage').then((m) => ({ default: m.MiPerfilPage }))
)
const DefinirContrasenaPage = lazy(() =>
  import('./features/acceso/DefinirContrasenaPage').then((m) => ({
    default: m.DefinirContrasenaPage,
  }))
)

function CargandoRuta() {
  return (
    <div className="p-6">
      <Skeleton className="h-64 w-full" />
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/sin-acceso" element={<SinAccesoPage />} />
      <Route
        path="/definir-contrasena"
        element={
          <Suspense fallback={<CargandoRuta />}>
            <DefinirContrasenaPage />
          </Suspense>
        }
      />

      {/* Todo lo demás es privado: RutaProtegida exige sesión + acceso, y "/" redirige por rol. */}
      <Route element={<RutaProtegida />}>
        <Route index element={<InicioPorRol />} />
        <Route path="inicio" element={<InicioPage />} />
        <Route
          path="escaner"
          element={
            <RutaErrorBoundary>
              <Suspense fallback={<CargandoRuta />}>
                <EscanerPage />
              </Suspense>
            </RutaErrorBoundary>
          }
        />
        <Route
          path="empresas"
          element={
            <RutaErrorBoundary>
              <Suspense fallback={<CargandoRuta />}>
                <EmpresasPage />
              </Suspense>
            </RutaErrorBoundary>
          }
        />
        <Route
          path="empresas/:empresaId"
          element={
            <RutaErrorBoundary>
              <Suspense fallback={<CargandoRuta />}>
                <EmpresaDetallePage />
              </Suspense>
            </RutaErrorBoundary>
          }
        />
        <Route
          path="empresas/:empresaId/configurar"
          element={
            <RutaErrorBoundary>
              <Suspense fallback={<CargandoRuta />}>
                <ConfigurarEmpresaPage />
              </Suspense>
            </RutaErrorBoundary>
          }
        />
        <Route
          path="platillos"
          element={
            <RutaErrorBoundary>
              <Suspense fallback={<CargandoRuta />}>
                <PlatillosPage />
              </Suspense>
            </RutaErrorBoundary>
          }
        />
        <Route
          path="menu"
          element={
            <RutaErrorBoundary>
              <Suspense fallback={<CargandoRuta />}>
                <MenuSemanalPage />
              </Suspense>
            </RutaErrorBoundary>
          }
        />
        <Route
          path="consumos"
          element={
            <RutaErrorBoundary>
              <Suspense fallback={<CargandoRuta />}>
                <ConsumosPage />
              </Suspense>
            </RutaErrorBoundary>
          }
        />
        <Route
          path="cortes"
          element={
            <RutaErrorBoundary>
              <Suspense fallback={<CargandoRuta />}>
                <CortesPage />
              </Suspense>
            </RutaErrorBoundary>
          }
        />
        {/* Compatibilidad: la sección se llamó "Cierres"; redirige links viejos a /cortes. */}
        <Route path="cierres" element={<Navigate to="/cortes" replace />} />
        <Route
          path="facturas"
          element={
            <RutaErrorBoundary>
              <Suspense fallback={<CargandoRuta />}>
                <FacturasPage />
              </Suspense>
            </RutaErrorBoundary>
          }
        />
        <Route
          path="configuracion"
          element={
            <RutaErrorBoundary>
              <Suspense fallback={<CargandoRuta />}>
                <ConfiguracionPage />
              </Suspense>
            </RutaErrorBoundary>
          }
        />
        <Route
          path="usuarios"
          element={
            <RutaErrorBoundary>
              <Suspense fallback={<CargandoRuta />}>
                <UsuariosPage />
              </Suspense>
            </RutaErrorBoundary>
          }
        />
        <Route
          path="mi-perfil"
          element={
            <RutaErrorBoundary>
              <Suspense fallback={<CargandoRuta />}>
                <MiPerfilPage />
              </Suspense>
            </RutaErrorBoundary>
          }
        />

        {/* Sección de desarrollo: solo en dev (import.meta.env.DEV), nunca en prod. */}
        {import.meta.env.DEV && (
          <>
            <Route
              path="componentes"
              element={
                <RutaErrorBoundary>
                  <Suspense fallback={<CargandoRuta />}>
                    <ComponentesPage />
                  </Suspense>
                </RutaErrorBoundary>
              }
            />
            <Route
              path="branding"
              element={
                <RutaErrorBoundary>
                  <Suspense fallback={<CargandoRuta />}>
                    <BrandingPage />
                  </Suspense>
                </RutaErrorBoundary>
              }
            />
          </>
        )}
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
