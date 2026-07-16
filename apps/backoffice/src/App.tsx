import { Navigate, Route, Routes } from 'react-router-dom'
import { RutaProtegida } from './auth/RutaProtegida'
import { LoginPage } from './features/auth/LoginPage'
import { SinAccesoPage } from './features/auth/SinAccesoPage'
import { InicioPage } from './features/inicio/InicioPage'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/sin-acceso" element={<SinAccesoPage />} />

      {/* Todo lo demás es privado: RutaProtegida exige sesión + acceso al portal. */}
      <Route element={<RutaProtegida />}>
        <Route path="/inicio" element={<InicioPage />} />
        <Route path="/" element={<Navigate to="/inicio" replace />} />
      </Route>

      <Route path="*" element={<Navigate to="/inicio" replace />} />
    </Routes>
  )
}
