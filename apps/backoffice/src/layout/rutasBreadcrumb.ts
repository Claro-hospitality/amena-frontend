/**
 * Mapa ruta→etiqueta para las migas de pan del backoffice.
 * Cubre todas las rutas (incluidas las anidadas y las que no están en el nav).
 * Al agregar una page nueva, agrega aquí su ruta.
 */
export const RUTAS_BREADCRUMB: Record<string, string> = {
  '/inicio': 'Inicio',
  '/escaner': 'Escáner',
  '/escaner/hoy': 'Comidas de hoy',
  '/empresas': 'Empresas',
  '/platillos': 'Platillos',
  '/menu': 'Menú',
  '/cierres': 'Cierres semanales',
  '/configuracion': 'Configuración',
  '/facturas': 'Facturas',
  '/mi-perfil': 'Mi perfil',
  '/componentes': 'Componentes',
  '/branding': 'Branding',
}
