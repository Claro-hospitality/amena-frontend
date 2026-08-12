import type { TipoUsuarioPortal } from '../../auth/validarAccesoPortal'

/**
 * Un paso del recorrido guiado del portal.
 * - `ruta`: a dónde navegar antes de resaltar (para que se vea la sección real).
 * - `ancla`: selector CSS del elemento a resaltar. Si falta, el paso es un
 *   mensaje centrado (bienvenida / cierre), sin resaltar nada.
 */
export interface PasoRecorrido {
  ruta?: string
  ancla?: string
  titulo: string
  descripcion: string
}

/**
 * Construye los pasos del recorrido según el rol. El recorrido navega por cada
 * sección para que el usuario la vea, y en el caso del admin entra a la sección
 * Empresa y recorre cada una de sus sub-secciones (General, Colaboradores,
 * Cuotas, Cortes y Facturas).
 *
 * Función pura (sin acceso al DOM) para poder testearla.
 */
export function construirPasos(tipo: TipoUsuarioPortal): PasoRecorrido[] {
  const bienvenida: PasoRecorrido = {
    titulo: '¡Te damos la bienvenida! 👋',
    descripcion:
      'Este es un recorrido rápido para conocer el portal. Puedes salir cuando quieras y repetirlo desde el menú de tu cuenta.',
  }

  const inicio: PasoRecorrido = {
    ruta: '/inicio',
    ancla: '[data-tour="nav-inicio"]',
    titulo: 'Inicio',
    descripcion: 'Tu página principal: aquí ves tu estado del día y accesos rápidos.',
  }

  const menu: PasoRecorrido = {
    ruta: '/menu',
    ancla: '[data-tour="nav-menu"]',
    titulo: 'Menú',
    descripcion: 'Consulta el menú de la semana en el restaurante.',
  }

  const miQr: PasoRecorrido = {
    ruta: '/mi-qr',
    ancla: '[data-tour="nav-mi-qr"]',
    titulo: 'Mi QR',
    descripcion:
      'Muestra este código QR en el restaurante para registrar tu comida. Sin dinero ni vales.',
  }

  const cierre: PasoRecorrido = {
    titulo: '¡Listo! 🎉',
    descripcion:
      'Eso es todo. Cuando quieras repetir el recorrido, encuéntralo en el menú de tu cuenta.',
  }

  if (tipo === 'colaborador') {
    return [bienvenida, inicio, menu, miQr, cierre]
  }

  // admin_empresa: además de lo común, recorre la sección Empresa y sus sub-secciones.
  const empresa: PasoRecorrido = {
    ruta: '/empresa',
    ancla: '[data-tour="nav-empresa"]',
    titulo: 'Empresa',
    descripcion:
      'Desde aquí administras tu empresa. Tiene varias secciones que verás a continuación.',
  }

  const empGeneral: PasoRecorrido = {
    ruta: '/empresa',
    ancla: '[data-tour="emp-general"]',
    titulo: 'Empresa · General',
    descripcion: 'Los datos de tu empresa: nombre, información fiscal y los términos de tu plan.',
  }

  const empColaboradores: PasoRecorrido = {
    ruta: '/empresa/colaboradores',
    ancla: '[data-tour="emp-colaboradores"]',
    titulo: 'Empresa · Colaboradores',
    descripcion: 'Da de alta a tu equipo y administra quién tiene acceso y quién come.',
  }

  const empCuotas: PasoRecorrido = {
    ruta: '/empresa/consumos',
    ancla: '[data-tour="emp-cuotas"]',
    titulo: 'Empresa · Consumos',
    descripcion: 'Reserva cuántas comidas quieres para tu equipo cada semana.',
  }

  const empCortes: PasoRecorrido = {
    ruta: '/empresa/cortes',
    ancla: '[data-tour="emp-cortes"]',
    titulo: 'Empresa · Cortes',
    descripcion: 'Consulta el consumo ya cerrado (el corte) de cada semana.',
  }

  const empFacturas: PasoRecorrido = {
    ruta: '/empresa/facturas',
    ancla: '[data-tour="emp-facturas"]',
    titulo: 'Empresa · Facturas',
    descripcion: 'Descarga las facturas (CFDI) que emite Amena a tu empresa.',
  }

  return [
    bienvenida,
    inicio,
    menu,
    empresa,
    empGeneral,
    empColaboradores,
    empCuotas,
    empCortes,
    empFacturas,
    miQr,
    cierre,
  ]
}
