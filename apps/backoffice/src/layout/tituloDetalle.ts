import { createContext, useContext, useEffect } from 'react'

export interface TituloDetalle {
  /** Etiqueta dinámica del último segmento de la ruta (p. ej. nombre de la empresa). */
  titulo: string | null
  setTitulo: (t: string | null) => void
}

export const TituloDetalleContext = createContext<TituloDetalle>({
  titulo: null,
  setTitulo: () => {},
})

export function useTituloDetalle() {
  return useContext(TituloDetalleContext)
}

/**
 * Fija el título dinámico de la ruta actual (breadcrumb) mientras el componente
 * está montado; lo limpia al desmontar. Ej.: el detalle de empresa fija su nombre.
 */
export function useSetTituloDetalle(valor: string | null) {
  const { setTitulo } = useTituloDetalle()
  useEffect(() => {
    setTitulo(valor)
    return () => setTitulo(null)
  }, [setTitulo, valor])
}
