import { useState, type ReactNode } from 'react'
import { TituloDetalleContext } from './tituloDetalle'

/** Provee el título dinámico que el breadcrumb del shell muestra como paso final. */
export function TituloDetalleProvider({ children }: { children: ReactNode }) {
  const [titulo, setTitulo] = useState<string | null>(null)
  return (
    <TituloDetalleContext.Provider value={{ titulo, setTitulo }}>
      {children}
    </TituloDetalleContext.Provider>
  )
}
