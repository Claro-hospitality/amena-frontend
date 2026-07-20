/** Una miga de pan (breadcrumb) ya resuelta y lista para renderizar. */
export interface Miga {
  /** Texto visible. */
  label: string
  /** Ruta a la que enlaza. */
  to: string
  /** true si es la página actual (última miga, no enlazable). */
  esActual: boolean
}

/**
 * Construye las migas de pan desde un `pathname` y un mapa ruta→etiqueta.
 *
 * Acumula segmentos (`/a/b` → `/a`, luego `/a/b`) y toma la etiqueta de cada
 * ruta del mapa. Los segmentos sin etiqueta (p. ej. ids dinámicos aún no
 * mapeados) se omiten para no romper la barra. Antepone una raíz ("Inicio")
 * salvo que ya sea la primera miga. La última miga queda marcada como actual.
 *
 * Es pura y sin dependencias de React/router: la comparten ambas apps y cada
 * una aporta su propio mapa de rutas.
 */
export function construirMigas(
  pathname: string,
  mapa: Record<string, string>,
  raiz: { to: string; label: string } = { to: '/inicio', label: 'Inicio' }
): Miga[] {
  const migas: Miga[] = []
  let acumulado = ''
  for (const segmento of pathname.split('/').filter(Boolean)) {
    acumulado += `/${segmento}`
    const label = mapa[acumulado]
    if (label) migas.push({ label, to: acumulado, esActual: false })
  }

  if (migas.length === 0 || migas[0].to !== raiz.to) {
    migas.unshift({ ...raiz, esActual: false })
  }

  migas[migas.length - 1].esActual = true
  return migas
}
