import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { Skeleton } from '@amena/ui/components/ui/skeleton'
import { InicioPorTipo } from './auth/InicioPorTipo'
import { RutaProtegida } from './auth/RutaProtegida'
import { RutaErrorBoundary } from './components/RutaErrorBoundary'
import { LoginPage } from './features/auth/LoginPage'
import { Placeholder } from './features/Placeholder'
import { SinAccesoPage } from './features/auth/SinAccesoPage'
import { InicioPage } from './features/inicio/InicioPage'

const ColaboradoresPage = lazy(() =>
  import('./features/colaboradores/ColaboradoresPage').then((m) => ({
    default: m.ColaboradoresPage,
  }))
)

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
        <Route path="inicio" element={<InicioPage />} />
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
        <Route path="mi-qr" element={<Placeholder titulo="Mi QR" />} />
        <Route path="mis-consumos" element={<Placeholder titulo="Mis consumos" />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
