import './theme.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AdminLoginPage } from './AdminLoginPage'
import { AdminDashboardPage } from './AdminDashboardPage'
import { AdminEventosPage } from './AdminEventosPage'
import { AdminEventoFormPage } from './AdminEventoFormPage'
import { AdminReservacionesPage } from './AdminReservacionesPage'
import { AdminReservacionDetallePage } from './AdminReservacionDetallePage'
import { AdminEscanearPage } from './AdminEscanearPage'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/admin/eventos" element={<AdminEventosPage />} />
        <Route path="/admin/eventos/nuevo" element={<AdminEventoFormPage />} />
        <Route path="/admin/eventos/:slug/editar" element={<AdminEventoFormPage />} />
        <Route path="/admin/reservaciones" element={<AdminReservacionesPage />} />
        <Route path="/admin/reservaciones/:folio" element={<AdminReservacionDetallePage />} />
        <Route path="/admin/escanear" element={<AdminEscanearPage />} />
        {/* La raíz de este sitio es el admin: cualquier otra ruta cae al dashboard. */}
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
