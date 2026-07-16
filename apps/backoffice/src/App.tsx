import { Navigate, Route, Routes } from 'react-router-dom'
import { InicioPorRol } from './auth/InicioPorRol'
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

      {/* Todo lo demás es privado: RutaProtegida exige sesión + acceso, y "/" redirige por rol. */}
      <Route element={<RutaProtegida />}>
        <Route index element={<InicioPorRol />} />
        <Route path="inicio" element={<InicioPage />} />
        <Route path="escaner" element={<Placeholder titulo="Escáner" />} />
        <Route path="empresas" element={<Placeholder titulo="Empresas" />} />
        <Route path="menu" element={<Placeholder titulo="Menú" />} />
        <Route path="colaboradores" element={<Placeholder titulo="Colaboradores" />} />
        <Route path="cierres" element={<Placeholder titulo="Cierres" />} />
        <Route path="facturas" element={<Placeholder titulo="Facturas" />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
