import { Navigate, Route, Routes } from 'react-router-dom'
import { InicioPorTipo } from './auth/InicioPorTipo'
import { RutaProtegida } from './auth/RutaProtegida'
import { LoginPage } from './features/auth/LoginPage'
import { Placeholder } from './features/Placeholder'
import { SinAccesoPage } from './features/auth/SinAccesoPage'
import { InicioPage } from './features/inicio/InicioPage'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/sin-acceso" element={<SinAccesoPage />} />

      {/* Todo lo demás es privado: RutaProtegida exige sesión + acceso, y "/" redirige por tipo. */}
      <Route element={<RutaProtegida />}>
        <Route index element={<InicioPorTipo />} />
        <Route path="inicio" element={<InicioPage />} />
        <Route path="colaboradores" element={<Placeholder titulo="Colaboradores" />} />
        <Route path="mi-qr" element={<Placeholder titulo="Mi QR" />} />
        <Route path="mis-consumos" element={<Placeholder titulo="Mis consumos" />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
