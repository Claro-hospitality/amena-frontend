/**
 * Ruta del menú que debe verse activa para la URL actual.
 *
 * No basta con `pathname === to`: un detalle como `/eventos/reservaciones/AMN-EV-2026-00418` o
 * `/empresas/3` tiene que dejar marcado a su padre. Pero el prefijo solo tampoco sirve, porque
 * entonces `/eventos` (el Resumen) casa con TODAS las pantallas del grupo y quedan dos ítems
 * sombreados a la vez.
 *
 * La regla es: de los ítems que casan, gana el más específico — el de ruta más larga. Así
 * `/eventos/catalogo/nuevo` marca Catálogo y no Resumen, y `/eventos` marca Resumen.
 */
export function rutaActiva(pathname: string, rutas: string[]): string | null {
  let mejor: string | null = null
  for (const to of rutas) {
    const casa = pathname === to || pathname.startsWith(`${to}/`)
    if (casa && (mejor === null || to.length > mejor.length)) mejor = to
  }
  return mejor
}
