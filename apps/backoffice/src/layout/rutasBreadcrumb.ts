/**
 * Mapa ruta→etiqueta para las migas de pan del backoffice.
 * Cubre todas las rutas (incluidas las anidadas y las que no están en el nav).
 * Al agregar una page nueva, agrega aquí su ruta.
 */
export const RUTAS_BREADCRUMB: Record<string, string> = {
  '/inicio': 'Inicio',
  '/escaner': 'Escáner',
  '/empresas': 'Empresas',
  '/platillos': 'Platillos',
  '/menu': 'Menú',
  '/consumos': 'Consumos',
  '/cortes': 'Cortes semanales',
  '/wifi': 'WiFi',
  '/configuracion': 'Configuración',
  '/mi-perfil': 'Mi perfil',
  // Eventos de amena.social (el escáner de boletos no lleva migas: va fuera del shell).
  '/eventos': 'Eventos',
  '/eventos/catalogo': 'Catálogo',
  '/eventos/catalogo/nuevo': 'Nuevo evento',
  '/eventos/reservaciones': 'Reservaciones',
  '/componentes': 'Componentes',
  '/branding': 'Branding',
}
