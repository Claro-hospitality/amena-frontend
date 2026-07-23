import { useState, type ReactNode } from 'react'
import { TituloDetalleContext, type MigaDetalle } from './tituloDetalle'

/** Provee las migas dinámicas que el breadcrumb del shell agrega tras las rutas estáticas. */
export function TituloDetalleProvider({ children }: { children: ReactNode }) {
  const [migas, setMigas] = useState<MigaDetalle[]>([])
  return (
    <TituloDetalleContext.Provider value={{ migas, setMigas }}>
      {children}
    </TituloDetalleContext.Provider>
  )
}
