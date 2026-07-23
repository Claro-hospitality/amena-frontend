import { createContext, useContext, useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/** Una miga dinámica que el breadcrumb agrega tras las rutas estáticas. */
export interface MigaDetalle {
  label: string
  to: string
}

export interface TituloDetalle {
  /** Migas dinámicas (p. ej. nombre de empresa, o [Empresa, Configurar]). */
  migas: MigaDetalle[]
  setMigas: (m: MigaDetalle[]) => void
}

export const TituloDetalleContext = createContext<TituloDetalle>({
  migas: [],
  setMigas: () => {},
})

export function useTituloDetalle() {
  return useContext(TituloDetalleContext)
}

/**
 * Fija una sola miga final (p. ej. el nombre de la empresa en su detalle) mientras el
 * componente está montado; la limpia al desmontar.
 */
export function useSetTituloDetalle(valor: string | null) {
  const { setMigas } = useTituloDetalle()
  const { pathname } = useLocation()
  useEffect(() => {
    setMigas(valor ? [{ label: valor, to: pathname }] : [])
    return () => setMigas([])
  }, [setMigas, valor, pathname])
}

/**
 * Fija una traza de migas dinámicas (p. ej. [Empresa → detalle, Configurar → actual])
 * mientras el componente está montado; la limpia al desmontar.
 */
export function useSetMigasDetalle(migas: MigaDetalle[]) {
  const { setMigas } = useTituloDetalle()
  const clave = JSON.stringify(migas)
  useEffect(() => {
    setMigas(JSON.parse(clave) as MigaDetalle[])
    return () => setMigas([])
  }, [setMigas, clave])
}
