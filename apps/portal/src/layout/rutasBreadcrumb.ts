/**
 * Mapa ruta→etiqueta para las migas de pan del portal.
 * Cubre todas las rutas (incluidas las anidadas y las que no están en el nav).
 * Las rutas anidadas de Empresa dan la jerarquía "Empresa › Colaboradores".
 * Al agregar una page nueva, agrega aquí su ruta.
 */
export const RUTAS_BREADCRUMB: Record<string, string> = {
  '/inicio': 'Inicio',
  '/menu': 'Menú',
  '/mi-qr': 'Mi QR',
  '/mi-cuenta': 'Mi cuenta',
  '/empresa': 'Empresa',
  '/empresa/colaboradores': 'Colaboradores',
  '/empresa/cuotas': 'Cuotas',
  '/empresa/cuotas/reservar': 'Reservar cuotas',
  '/empresa/cortes': 'Cortes',
}
